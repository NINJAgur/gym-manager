-- ============================================================================
-- Lets a trainee revise their own log entry for the day.
--
-- The chart keeps one row per exercise per day, so a second adjustment updates
-- that row instead of stacking duplicates. Trainees had an insert policy but
-- no update policy, so the update matched zero rows — silently, since RLS
-- filters rather than errors. The day's first value stayed on the chart while
-- the program item moved on, which looked like the graph not updating.
--
-- Scoped to their own rows. Not restricted to today's: the app only ever
-- touches today's row, and a date predicate here would disagree with the
-- app's local midnight for the hours either side of UTC midnight.
-- ============================================================================

drop policy if exists "logs: trainee updates own" on public.performance_logs;
create policy "logs: trainee updates own" on public.performance_logs
  for update to authenticated
  using (trainee_id = auth.uid())
  with check (trainee_id = auth.uid());
