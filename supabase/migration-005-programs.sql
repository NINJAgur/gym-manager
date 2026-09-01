-- ============================================================================
-- 005 — training programs, and account approval.
--
-- Trainers stop assigning loose exercises and start assigning programs. A
-- program is either general (one flat list, for someone training once a week)
-- or split into days (for someone training several times a week).
--
--   programs ─┬─ program_days ─┐
--             └────────────────┴─ program_items ── exercises
--
-- program_items.day_id is null on a general program, set on a split one.
--
-- Accounts now start pending and wait for the trainer to approve them.
--
-- Run after migration-004. Idempotent.
-- ============================================================================

-- ── account status ──────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'active', 'deactivated'));

-- Everyone who already had access keeps it; only new sign-ups wait.
update public.profiles set status = 'active' where status = 'pending';

-- ── programs ────────────────────────────────────────────────────────────────

create table if not exists public.programs (
  id         uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  kind       text not null default 'general' check (kind in ('general', 'split')),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.program_days (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  name       text not null,
  position   integer not null default 0
);

create table if not exists public.program_items (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs (id) on delete cascade,
  day_id      uuid references public.program_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  sets        integer not null default 3 check (sets between 1 and 20),
  reps        integer not null default 10 check (reps between 0 and 100),
  weight      numeric(6, 2) not null default 0 check (weight >= 0),
  position    integer not null default 0
);

create index if not exists programs_trainee_idx      on public.programs (trainee_id);
create index if not exists program_days_program_idx  on public.program_days (program_id);
create index if not exists program_items_program_idx on public.program_items (program_id);
create index if not exists program_items_day_idx     on public.program_items (day_id);

-- ── who owns a program item, for the policies below ─────────────────────────

create or replace function public.program_item_trainee(p_item uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.trainee_id
  from public.program_items i
  join public.programs p on p.id = i.program_id
  where i.id = p_item;
$$;

revoke execute on function public.program_item_trainee(uuid) from public;
grant execute on function public.program_item_trainee(uuid) to authenticated;

-- ── the trainee may move weight, and nothing else ───────────────────────────
-- Column privileges are role-wide, so they cannot express "trainers may edit
-- reps, trainees may not". A trigger can.

create or replace function public.guard_program_item_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_trainer() or auth.uid() is null then
    return new;                        -- trainer, or the SQL editor
  end if;

  if new.sets is distinct from old.sets
     or new.reps is distinct from old.reps
     or new.exercise_id is distinct from old.exercise_id
     or new.program_id is distinct from old.program_id
     or new.day_id is distinct from old.day_id
     or new.position is distinct from old.position then
    raise exception 'trainees may only change weight';
  end if;

  return new;
end;
$$;

drop trigger if exists program_items_guard_edit on public.program_items;
create trigger program_items_guard_edit
  before update on public.program_items
  for each row execute function public.guard_program_item_edit();

-- ── row level security ──────────────────────────────────────────────────────

alter table public.programs      enable row level security;
alter table public.program_days  enable row level security;
alter table public.program_items enable row level security;

drop policy if exists "programs: trainee reads own" on public.programs;
create policy "programs: trainee reads own" on public.programs
  for select to authenticated using (trainee_id = auth.uid());

drop policy if exists "programs: trainers all" on public.programs;
create policy "programs: trainers all" on public.programs
  for all to authenticated using (public.is_trainer()) with check (public.is_trainer());

drop policy if exists "days: trainee reads own" on public.program_days;
create policy "days: trainee reads own" on public.program_days
  for select to authenticated using (
    exists (select 1 from public.programs p where p.id = program_id and p.trainee_id = auth.uid())
  );

drop policy if exists "days: trainers all" on public.program_days;
create policy "days: trainers all" on public.program_days
  for all to authenticated using (public.is_trainer()) with check (public.is_trainer());

drop policy if exists "items: trainee reads own" on public.program_items;
create policy "items: trainee reads own" on public.program_items
  for select to authenticated using (
    exists (select 1 from public.programs p where p.id = program_id and p.trainee_id = auth.uid())
  );

-- The trigger above is what actually restricts them to the weight column.
drop policy if exists "items: trainee updates own" on public.program_items;
create policy "items: trainee updates own" on public.program_items
  for update to authenticated using (
    exists (select 1 from public.programs p where p.id = program_id and p.trainee_id = auth.uid())
  ) with check (
    exists (select 1 from public.programs p where p.id = program_id and p.trainee_id = auth.uid())
  );

drop policy if exists "items: trainers all" on public.program_items;
create policy "items: trainers all" on public.program_items
  for all to authenticated using (public.is_trainer()) with check (public.is_trainer());

-- Trainees log their own weight changes; trainers log for anyone.
drop policy if exists "logs: trainee inserts own" on public.performance_logs;
create policy "logs: trainee inserts own" on public.performance_logs
  for insert to authenticated with check (trainee_id = auth.uid());

grant select, insert, update, delete on public.programs      to authenticated;
grant select, insert, update, delete on public.program_days  to authenticated;
grant select, insert, update, delete on public.program_items to authenticated;

-- ── the trainer's user list ─────────────────────────────────────────────────
-- Replaces trainee_overview: status matters now, and programs replace the
-- assigned-exercise count.

drop view if exists public.trainee_overview;
create view public.trainee_overview
with (security_invoker = on) as
select
  p.id,
  p.full_name,
  p.email,
  p.status,
  p.created_at,
  (select count(*) from public.programs pr where pr.trainee_id = p.id) as program_count,
  (select max(pl.created_at) from public.performance_logs pl where pl.trainee_id = p.id) as last_logged_at
from public.profiles p
where p.role = 'trainee';

grant select on public.trainee_overview to authenticated;

select 'migration 005 applied' as result;
