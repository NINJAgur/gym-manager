-- ============================================================================
-- Gym Performance Tracker — schema, RLS, views, triggers
-- Run in the Supabase SQL editor (or `supabase db reset` with this as a migration).
-- Idempotent: safe to re-run.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── tables ──────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'trainee' check (role in ('trainee', 'trainer')),
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  unique (category, name)
);

create table if not exists public.trainee_exercises (
  id          uuid primary key default gen_random_uuid(),
  trainee_id  uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (trainee_id, exercise_id)
);

create table if not exists public.performance_logs (
  id          uuid primary key default gen_random_uuid(),
  trainee_id  uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  weight      numeric(6, 2) not null check (weight >= 0),
  reps        integer not null check (reps >= 0),
  created_at  timestamptz not null default now()
);

create index if not exists trainee_exercises_trainee_idx
  on public.trainee_exercises (trainee_id);
create index if not exists performance_logs_lookup_idx
  on public.performance_logs (trainee_id, exercise_id, created_at desc);
create index if not exists performance_logs_recent_idx
  on public.performance_logs (trainee_id, created_at desc);

-- ── helpers ─────────────────────────────────────────────────────────────────

-- security definer so profile policies can call it without recursing into
-- the very policies being evaluated.
create or replace function public.is_trainer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'trainer'
  );
$$;

revoke execute on function public.is_trainer() from public;
grant execute on function public.is_trainer() to authenticated;

-- ── triggers ────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The trigger only fires for new sign-ups, so backfill anyone who
-- authenticated before this script was run.
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

-- A trainee updating their own profile must not be able to promote themselves.
-- auth.uid() is null outside a PostgREST user context (SQL editor, migrations,
-- service role) — those are trusted, and are how the first trainer is created.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_trainer() then
    raise exception 'role changes are reserved for trainers';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ── row level security ──────────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.exercises         enable row level security;
alter table public.trainee_exercises enable row level security;
alter table public.performance_logs  enable row level security;

-- profiles
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles: trainers read all" on public.profiles;
create policy "profiles: trainers read all" on public.profiles
  for select to authenticated using (public.is_trainer());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles: trainers update any" on public.profiles;
create policy "profiles: trainers update any" on public.profiles
  for update to authenticated using (public.is_trainer()) with check (public.is_trainer());

-- exercises (master list) — readable by every signed-in user, writable by trainers
drop policy if exists "exercises: read" on public.exercises;
create policy "exercises: read" on public.exercises
  for select to authenticated using (true);

drop policy if exists "exercises: trainers write" on public.exercises;
create policy "exercises: trainers write" on public.exercises
  for all to authenticated using (public.is_trainer()) with check (public.is_trainer());

-- assignments
drop policy if exists "assignments: trainee reads own" on public.trainee_exercises;
create policy "assignments: trainee reads own" on public.trainee_exercises
  for select to authenticated using (trainee_id = auth.uid());

drop policy if exists "assignments: trainers read all" on public.trainee_exercises;
create policy "assignments: trainers read all" on public.trainee_exercises
  for select to authenticated using (public.is_trainer());

drop policy if exists "assignments: trainers write" on public.trainee_exercises;
create policy "assignments: trainers write" on public.trainee_exercises
  for all to authenticated using (public.is_trainer()) with check (public.is_trainer());

-- performance logs
drop policy if exists "logs: trainee reads own" on public.performance_logs;
create policy "logs: trainee reads own" on public.performance_logs
  for select to authenticated using (trainee_id = auth.uid());

drop policy if exists "logs: trainers read all" on public.performance_logs;
create policy "logs: trainers read all" on public.performance_logs
  for select to authenticated using (public.is_trainer());

-- a trainee may only log against an exercise actually assigned to them
drop policy if exists "logs: trainee inserts own" on public.performance_logs;
create policy "logs: trainee inserts own" on public.performance_logs
  for insert to authenticated with check (
    trainee_id = auth.uid()
    and exists (
      select 1 from public.trainee_exercises te
      where te.trainee_id = auth.uid() and te.exercise_id = performance_logs.exercise_id
    )
  );

-- ── views ───────────────────────────────────────────────────────────────────
-- security_invoker keeps the caller's RLS in force through the view.

-- Most recent log per (trainee, exercise).
drop view if exists public.latest_logs;
create view public.latest_logs
with (security_invoker = on) as
select distinct on (pl.trainee_id, pl.exercise_id)
  pl.trainee_id,
  pl.exercise_id,
  pl.weight,
  pl.reps,
  pl.created_at
from public.performance_logs pl
order by pl.trainee_id, pl.exercise_id, pl.created_at desc;

-- Trainer list rows: one per trainee, with counts and freshness.
drop view if exists public.trainee_overview;
create view public.trainee_overview
with (security_invoker = on) as
select
  p.id,
  p.full_name,
  p.email,
  (select count(*) from public.trainee_exercises te where te.trainee_id = p.id) as exercise_count,
  (select max(pl.created_at) from public.performance_logs pl where pl.trainee_id = p.id) as last_logged_at
from public.profiles p
where p.role = 'trainee';

-- ── grants ──────────────────────────────────────────────────────────────────
-- RLS decides who sees what; these only open the door to PostgREST.

grant select on public.latest_logs, public.trainee_overview to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.exercises to authenticated;
grant select, insert, update, delete on public.trainee_exercises to authenticated;
grant select, insert on public.performance_logs to authenticated;

-- ============================================================================
-- Promote yourself to trainer after the first Google sign-in:
--   update public.profiles set role = 'trainer' where email = 'you@example.com';
-- ============================================================================
