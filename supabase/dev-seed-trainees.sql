-- ============================================================================
-- DEV ONLY — fabricates trainee accounts so the trainer dashboard has data.
--
-- These rows are written straight into auth.users, bypassing GoTrue. They have
-- no identity rows and no usable password, so they CANNOT sign in — they exist
-- to populate the trainer views. Delete them before this project is real:
--   delete from auth.users where email like '%@example.test';
-- (cascades to profiles, assignments and logs)
--
-- Re-runnable: every step is guarded.
-- ============================================================================

-- ── 1. accounts ─────────────────────────────────────────────────────────────

do $$
declare
  v_names  text[] := array['Ava Lindqvist', 'Renata Duarte', 'Yui Nakamura', 'Tom Bergeron'];
  v_emails text[] := array['ava@example.test', 'renata@example.test', 'yui@example.test', 'tom@example.test'];
  v_id     uuid;
  i        int;
begin
  for i in 1 .. array_length(v_emails, 1) loop
    select id into v_id from auth.users where email = v_emails[i];

    if v_id is null then
      v_id := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
        v_emails[i], '',
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', v_names[i]),
        '', '', '', ''
      );
    end if;

    -- the on_auth_user_created trigger normally does this; upsert covers re-runs
    insert into public.profiles (id, email, full_name, role)
    values (v_id, v_emails[i], v_names[i], 'trainee')
    on conflict (id) do update set full_name = excluded.full_name;
  end loop;
end $$;

-- ── 2. assignments — four exercises each, stable per trainee ────────────────

insert into public.trainee_exercises (trainee_id, exercise_id)
select p.id, e.id
from public.profiles p
cross join lateral (
  select id from public.exercises
  order by md5(id::text || p.id::text)
  limit 4
) e
where p.email like '%@example.test'
on conflict (trainee_id, exercise_id) do nothing;

-- ── 3. logs — four per assignment, spread over the last ~2 weeks ────────────
-- The per-trainee offset staggers the most recent entry across 0-3 days, so
-- the freshness badges and the 7-day volume bars all differ.

insert into public.performance_logs (trainee_id, exercise_id, weight, reps, created_at)
select
  te.trainee_id,
  te.exercise_id,
  20 + (abs(hashtext(te.exercise_id::text)) % 40) + g * 2.5,
  6 + (abs(hashtext(te.trainee_id::text)) % 8),
  now() - make_interval(days => (9 - g * 3) + (abs(hashtext(p.email)) % 4))
from public.trainee_exercises te
join public.profiles p on p.id = te.trainee_id
cross join generate_series(0, 3) as g
where p.email like '%@example.test'
  and not exists (
    select 1 from public.performance_logs pl
    where pl.trainee_id = te.trainee_id and pl.exercise_id = te.exercise_id
  );

-- ── 4. report ───────────────────────────────────────────────────────────────

select
  p.full_name,
  (select count(*) from public.trainee_exercises te where te.trainee_id = p.id) as exercises,
  (select count(*) from public.performance_logs pl where pl.trainee_id = p.id)  as logs,
  (select max(pl.created_at)::date from public.performance_logs pl where pl.trainee_id = p.id) as last_log
from public.profiles p
where p.email like '%@example.test'
order by p.full_name;
