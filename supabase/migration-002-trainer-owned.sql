-- ============================================================================
-- 002 — the trainer owns the numbers.
--
-- performance_logs stops meaning "what the trainee lifted" and starts meaning
-- "what the trainer set". Trainees get select-only; trainers write for anyone.
-- exercises gain the metadata the new editor screen collects.
--
-- Run after schema.sql. Idempotent.
-- ============================================================================

alter table public.exercises
  add column if not exists video_url      text,
  add column if not exists machine_number text;

-- ── performance_logs: trainer writes, trainee reads ─────────────────────────

drop policy if exists "logs: trainee inserts own" on public.performance_logs;

drop policy if exists "logs: trainers write" on public.performance_logs;
create policy "logs: trainers write" on public.performance_logs
  for all to authenticated
  using (public.is_trainer())
  with check (public.is_trainer());

grant insert, update, delete on public.performance_logs to authenticated;

-- ── trainee_exercises: trainers already hold `for all`; confirm the grant ───

grant delete on public.trainee_exercises to authenticated;

-- ── verify ──────────────────────────────────────────────────────────────────

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and tablename in ('performance_logs', 'exercises')
order by tablename, policyname;
