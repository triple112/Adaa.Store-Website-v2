-- ============================================================================
-- Row Level Security policies.
-- Default-deny once RLS is enabled. The service_role key (server-only, used by
-- webhooks / license endpoints / admin mutations) BYPASSES RLS entirely.
-- These policies cover the `anon` and `authenticated` roles.
-- ============================================================================

alter table public.profiles           enable row level security;
alter table public.app_settings        enable row level security;
alter table public.coupons             enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.license_devices     enable row level security;
alter table public.orders              enable row level security;
alter table public.coupon_redemptions  enable row level security;
alter table public.device_link_codes   enable row level security;

-- ─── profiles ───────────────────────────────────────────────────────────────
create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- Users may edit their own profile; the protect_profile_columns() trigger keeps
-- role/banned immutable for non-admins.
create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin full"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── app_settings (public read for pricing display; admin writes) ───────────
create policy "app_settings: public read"
  on public.app_settings for select
  to anon, authenticated
  using (true);

create policy "app_settings: admin write"
  on public.app_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── coupons (admin-only; validation/redemption happens server-side) ────────
create policy "coupons: admin only"
  on public.coupons for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── subscriptions (read own or admin; writes via service role) ─────────────
create policy "subscriptions: read own or admin"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "subscriptions: admin write"
  on public.subscriptions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── license_devices (read own or admin; writes via service role) ───────────
create policy "license_devices: read own or admin"
  on public.license_devices for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "license_devices: admin write"
  on public.license_devices for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── orders (read own or admin; writes via service role) ────────────────────
create policy "orders: read own or admin"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders: admin write"
  on public.orders for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── coupon_redemptions (read own or admin; writes via service role) ────────
create policy "coupon_redemptions: read own or admin"
  on public.coupon_redemptions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "coupon_redemptions: admin write"
  on public.coupon_redemptions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── device_link_codes (admin read only; all flow via service role API) ─────
create policy "device_link_codes: admin read"
  on public.device_link_codes for select
  to authenticated
  using (public.is_admin());
