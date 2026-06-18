-- ============================================================================
-- Applied-tweaks checklist on installation reports.
-- Stored as grouped applied items: [{ category, items: [string] }] (only the
-- tweaks that were actually applied — unchecked ones are dropped).
-- ============================================================================

alter table public.installation_reports
  add column if not exists tweaks jsonb not null default '[]'::jsonb;
