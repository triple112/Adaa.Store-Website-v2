-- ============================================================================
-- Add an "installed" order status (تم التركيب) for the installation-reports flow.
-- Adding an enum value must live in its own migration and cannot be used in the
-- same transaction it is created in — it is only referenced later at runtime.
-- ============================================================================

alter type public.order_status add value if not exists 'installed';
