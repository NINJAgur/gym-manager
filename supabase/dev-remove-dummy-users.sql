-- ============================================================================
-- Remove the fabricated trainees from dev-seed-trainees.sql.
--
-- Those accounts were written straight into auth.users with no identity row,
-- purely so the trainer screens had something to show. Deleting them cascades:
--   auth.users -> profiles -> programs -> program_days
--                                      -> program_items
--                          -> performance_logs
--
-- Real accounts are untouched: the filter matches only the @example.test
-- addresses the seed script created. Step 1 shows what will go.
-- ============================================================================

-- ── step 1: look ────────────────────────────────────────────────────────────

select
  u.id,
  u.email,
  p.full_name,
  (select count(*) from public.programs pr where pr.trainee_id = u.id) as programs,
  (select count(*) from public.performance_logs pl where pl.trainee_id = u.id) as history_rows
from auth.users u
left join public.profiles p on p.id = u.id
where u.email like '%@example.test'
order by u.email;

-- ── step 2: delete ──────────────────────────────────────────────────────────
-- Run this once step 1 lists only the accounts you expect.

-- delete from auth.users
-- where email like '%@example.test'
-- returning id, email;
