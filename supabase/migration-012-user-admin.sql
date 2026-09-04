-- ============================================================================
-- Three things the trainer needs over accounts: promote someone to trainer,
-- train themselves, and turn away a sign-up they do not recognise.
--
-- The view filtered to role = 'trainee', so a promoted person disappeared from
-- the list that promoted them, with no way back. It now returns everyone and
-- carries the role, which also puts the trainer in their own trainee list —
-- that is how they build a program for themselves.
-- ============================================================================

drop view if exists public.trainee_overview;
create view public.trainee_overview
with (security_invoker = on) as
select
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.status,
  p.created_at,
  (select count(*) from public.programs pr where pr.trainee_id = p.id) as program_count,
  (select max(pl.created_at) from public.performance_logs pl where pl.trainee_id = p.id) as last_logged_at
from public.profiles p;

grant select on public.trainee_overview to authenticated;

-- ── deleting an account ─────────────────────────────────────────────────────
-- Deleting the profile alone would not do it: the row is recreated from
-- auth.users on the next sign-in. The account itself has to go, and only the
-- service role can normally touch auth.users — hence security definer, with
-- the trainer check inside rather than left to RLS.
--
-- auth.users cascades to profiles, which cascades to programs and their items.

create or replace function public.delete_account(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_trainer() then
    raise exception 'only a trainer may delete an account';
  end if;

  if target = auth.uid() then
    raise exception 'a trainer cannot delete their own account';
  end if;

  delete from auth.users where id = target;
end;
$$;

revoke execute on function public.delete_account(uuid) from public, anon;
grant execute on function public.delete_account(uuid) to authenticated;

select 'migration 012 applied' as result;
