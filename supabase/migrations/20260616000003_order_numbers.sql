-- ============================================================================
-- Human-friendly sequential order numbers (start at 5000).
-- ============================================================================

create sequence if not exists public.order_number_seq start 5000;

alter table public.orders
  add column if not exists order_number bigint not null default nextval('public.order_number_seq');

create unique index if not exists orders_order_number_key
  on public.orders (order_number);
