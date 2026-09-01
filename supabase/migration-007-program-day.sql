-- ============================================================================
-- A program is now a named workout with an optional weekday, rather than a
-- general/split pair with a table of days. Purely additive: program_days and
-- programs.kind are left in place — the app stops writing them, but dropping
-- them would destroy existing rows, so that is a separate decision.
-- ============================================================================

alter table public.programs
  add column if not exists day_of_week smallint check (day_of_week between 0 and 6);

comment on column public.programs.day_of_week is
  '0=Sunday .. 6=Saturday. Null when the program is not tied to a particular day.';

-- kind stops being written by the app; keep a default so old inserts still work.
alter table public.programs alter column kind set default 'general';
