-- ============================================================================
-- Remove a user and everything belonging to them.
--
-- Deleting from auth.users cascades all the way down:
--   auth.users -> profiles -> trainee_exercises
--                          -> performance_logs
-- so the account, its assignments and its whole record history go together.
-- This cannot be undone.
--
-- Step 1 shows what matches. Check it is the single row you expect BEFORE
-- running step 2 — the pattern is a prefix match, so a stray account sharing
-- the prefix would go with it.
-- ============================================================================

-- ── step 1: look ────────────────────────────────────────────────────────────

select
  u.id,
  u.email,
  u.created_at,
  p.full_name,
  p.role,
  (select count(*) from public.trainee_exercises te where te.trainee_id = u.id) as assignments,
  (select count(*) from public.performance_logs pl where pl.trainee_id = u.id)  as history_rows
from auth.users u
left join public.profiles p on p.id = u.id
where u.email ilike '%';

-- ── step 2: delete ──────────────────────────────────────────────────────────
-- Run this on its own once step 1 shows the right row.

-- delete from auth.users
-- where email ilike '[prefix]%'
-- returning id, email;
