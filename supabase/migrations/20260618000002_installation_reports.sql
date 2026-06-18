-- ============================================================================
-- Installation reports (تقارير عملية التركيب).
--   * installation_reports — structured, admin-created reports tied to an order.
--   * legacy_reports        — admin-only archive of the old Canva PDFs.
--   * orders.installed_at   — timestamp set when a report marks the order installed.
--   * private storage bucket for the legacy PDFs (served via signed URLs).
-- ============================================================================

alter table public.orders
  add column if not exists installed_at timestamptz;

-- ─── installation_reports (one per order) ───────────────────────────────────
create table if not exists public.installation_reports (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null unique references public.orders(id) on delete cascade,
  created_by       uuid references public.profiles(id) on delete set null,
  customer_name    text,
  discord_username text,
  discord_nickname text,
  cpu_model        text,
  gpu_model        text,
  -- Flexible metric rows: [{ label, before?, after?, value?, unit? }]
  metrics          jsonb not null default '[]'::jsonb,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists installation_reports_order_id_idx
  on public.installation_reports (order_id);

create trigger installation_reports_set_updated_at
  before update on public.installation_reports
  for each row execute function public.set_updated_at();

-- ─── legacy_reports (admin-only archive of old PDFs) ────────────────────────
create table if not exists public.legacy_reports (
  id               uuid primary key default gen_random_uuid(),
  nickname         text not null,          -- = original filename (Discord nickname)
  discord_username text,                    -- editable; fills in over time for search
  storage_path     text not null,          -- path inside the private bucket
  file_size        bigint,
  created_at       timestamptz not null default now()
);

create index if not exists legacy_reports_nickname_idx
  on public.legacy_reports (lower(nickname));

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.installation_reports enable row level security;
alter table public.legacy_reports        enable row level security;

-- The owner of the linked order can read their report; admins read all.
create policy "installation_reports: read own or admin"
  on public.installation_reports for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = installation_reports.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "installation_reports: admin write"
  on public.installation_reports for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Legacy archive is admin-only (writes via service role).
create policy "legacy_reports: admin only"
  on public.legacy_reports for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Private storage bucket for legacy PDFs ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('installation-reports', 'installation-reports', false)
on conflict (id) do nothing;
