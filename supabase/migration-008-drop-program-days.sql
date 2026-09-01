-- ============================================================================
-- DESTRUCTIVE — run only after confirming the counts below are acceptable.
--
-- Retires what the general/split model left behind: the program_days table,
-- program_items.day_id, and programs.kind. Nothing in the app reads any of
-- them since migration 007. Programs and their items are untouched — items
-- belong to a program through program_id, not through a day.
--
-- Run the SELECT on its own first. It reports what the DROP will destroy.
-- ============================================================================

select
  (select count(*) from public.program_days)                          as days_to_delete,
  (select count(*) from public.program_items where day_id is not null) as items_losing_their_day,
  (select count(*) from public.programs)                              as programs_kept,
  (select count(*) from public.program_items)                         as items_kept;

-- ── Once the numbers above look right, run the rest ─────────────────────────

alter table public.program_items drop column if exists day_id;

drop table if exists public.program_days;

alter table public.programs drop column if exists kind;
