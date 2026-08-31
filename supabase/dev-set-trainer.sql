-- ============================================================================
-- Hand the trainer role from one account to another.
--
-- 'trainer' is the highest role there is — the schema allows only
-- 'trainee' | 'trainer'. A trainer reads every trainee, owns the exercise
-- library, and sets everyone's weight and reps.
--
-- The new trainer must have signed in at least once: profiles rows are created
-- by the on_auth_user_created trigger, so an account that has never
-- authenticated has nothing to promote. The block below refuses rather than
-- silently leaving you with no trainer at all.
--
-- Safe to run from the SQL editor: guard_profile_role only blocks role changes
-- made by a signed-in user, and auth.uid() is null here.
-- ============================================================================

do $$
declare
  v_incoming uuid;
  v_outgoing uuid;
begin
  select id into v_incoming from public.profiles where email = 'ninjagur.dev@gmail.com';
  select id into v_outgoing from public.profiles where email = 'edangur11@gmail.com';

  if v_incoming is null then
    raise exception
      'ninjagur.dev@gmail.com has no profile yet. Sign in once with that account, then re-run.';
  end if;

  -- Promote first, so there is never a moment with zero trainers.
  update public.profiles set role = 'trainer' where id = v_incoming;

  if v_outgoing is not null then
    update public.profiles set role = 'trainee' where id = v_outgoing;
  end if;
end $$;

-- ── who is what now ─────────────────────────────────────────────────────────

select
  p.email,
  p.full_name,
  p.role,
  (select count(*) from public.trainee_exercises te where te.trainee_id = p.id) as assigned
from public.profiles p
order by p.role desc, p.email;
