-- Run AFTER scripts/import-woo-orders.mjs (applied via Supabase MCP/SQL editor).
-- 1) Continue live order numbering right after the highest imported WooCommerce id (→ next = 5106).
select setval('public.order_number_seq', (select max(order_number) from public.orders), true);

-- 2) Claim imported/guest orders for any email that already has an account.
--    (Future signups/guest checkouts are claimed automatically by handle_new_user.)
update public.orders o
   set user_id = p.id
  from public.profiles p
 where o.user_id is null
   and o.email is not null
   and lower(o.email) = lower(p.email);
