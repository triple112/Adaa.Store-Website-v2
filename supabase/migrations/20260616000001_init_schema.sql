-- ============================================================================
-- Adaa Store V2 — Accounts, Subscriptions & Licensing schema (initial)
-- Phase 0/1 foundation. Runs on Supabase Postgres.
-- ============================================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type public.user_role           as enum ('user', 'admin');
create type public.subscription_plan   as enum ('monthly', 'yearly');
create type public.subscription_status as enum ('pending', 'active', 'past_due', 'canceled', 'expired');
create type public.order_type          as enum ('package', 'service', 'subscription');
create type public.order_status        as enum ('pending', 'paid', 'failed', 'refunded');
create type public.coupon_type         as enum ('percent', 'fixed');
create type public.link_status         as enum ('pending', 'approved', 'expired', 'consumed');

-- ─── Shared helpers ─────────────────────────────────────────────────────────
-- Auto-touch updated_at on UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- NOTE: public.is_admin() is defined right after the profiles table below, because
-- a `language sql` function body is validated at creation time and references it.

-- ─── profiles (mirrors auth.users) ──────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  role         public.user_role not null default 'user',
  discord_id   text,
  banned       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Is the current request an admin? SECURITY DEFINER so it reads profiles without
-- triggering RLS (prevents recursive policy evaluation). Defined after the table
-- exists because `language sql` bodies are validated at creation time.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Prevent non-admins from escalating their own role / unbanning themselves.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    new.role   := old.role;
    new.banned := old.banned;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Create a profile row automatically when a new auth user signs up
-- (works for email/password, Google, and Discord).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, discord_id)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    case
      when new.raw_user_meta_data ->> 'provider_id' is not null
           and (new.raw_app_meta_data ->> 'provider') = 'discord'
      then new.raw_user_meta_data ->> 'provider_id'
      else null
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── app_settings (admin-editable config: pricing, license policy) ──────────
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ─── coupons ────────────────────────────────────────────────────────────────
create table public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,
  type        public.coupon_type not null,
  value       numeric(10,2) not null check (value > 0),
  max_uses    integer check (max_uses is null or max_uses > 0),
  used_count  integer not null default 0,
  min_amount  numeric(10,2) not null default 0,
  applies_to  text not null default 'all',   -- 'all' | 'packages' | 'subscription'
  active      boolean not null default true,
  starts_at   timestamptz,
  expires_at  timestamptz,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Case-insensitive uniqueness on the code.
create unique index coupons_code_unique on public.coupons (upper(code));

create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- ─── subscriptions (source of truth, driven by PayPal webhooks) ─────────────
create table public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  plan                 public.subscription_plan not null,
  status               public.subscription_status not null default 'pending',
  provider             text not null default 'paypal',
  paypal_subscription_id text unique,
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_status_idx  on public.subscriptions (status);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ─── license_devices (one bound device per subscription via HWID) ───────────
create table public.license_devices (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  hwid_hash       text not null,
  device_label    text,
  bound_at        timestamptz not null default now(),
  last_seen_at    timestamptz,
  last_ip         text
);

-- Enforce exactly one active device per subscription (admin-only re-bind policy).
create unique index license_devices_one_per_subscription
  on public.license_devices (subscription_id);
create index license_devices_user_id_idx on public.license_devices (user_id);

-- ─── orders (purchase history: packages, services, subscriptions) ───────────
create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete set null,
  type           public.order_type not null,
  items          jsonb not null default '[]'::jsonb,
  amount         numeric(10,2) not null,
  currency       text not null default 'USD',
  status         public.order_status not null default 'pending',
  provider       text not null default 'paypal',
  paypal_order_id text unique,
  coupon_id      uuid references public.coupons(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ─── coupon_redemptions (audit which user used which coupon) ─────────────────
create table public.coupon_redemptions (
  id         uuid primary key default gen_random_uuid(),
  coupon_id  uuid not null references public.coupons(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  order_id   uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create index coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id);

-- ─── device_link_codes (desktop app login via short code) ───────────────────
create table public.device_link_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  user_id         uuid references public.profiles(id) on delete cascade,
  hwid_hash       text not null,
  status          public.link_status not null default 'pending',
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null
);

create index device_link_codes_status_idx on public.device_link_codes (status);

-- ─── Seed default settings ──────────────────────────────────────────────────
insert into public.app_settings (key, value) values
  (
    'adaax_pricing',
    '{"monthly_usd": 10, "yearly_usd": 96, "yearly_discount_pct": 20, "currency": "USD"}'::jsonb
  ),
  (
    'license',
    '{"revalidate_interval_hours": 6, "offline_grace_hours": 0, "device_link_ttl_minutes": 10}'::jsonb
  )
on conflict (key) do nothing;
