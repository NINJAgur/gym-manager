-- ============================================================================
-- Profile pictures.
--
-- Files live under a folder named for the owner's user id, which is what the
-- storage policies key off — that is how "only your own picture" is expressed
-- without a column to join against.
-- ============================================================================

alter table public.profiles
  add column if not exists avatar_url text;

comment on column public.profiles.avatar_url is
  'Public URL of the profile picture in the avatars bucket. Null means initials.';

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Anyone signed in can see a picture: the trainer sees their trainees, and a
-- trainee sees their own. Writes are confined to your own folder.

drop policy if exists "avatars: readable" on storage.objects;
create policy "avatars: readable" on storage.objects
  for select to authenticated, anon
  using (bucket_id = 'avatars');

drop policy if exists "avatars: write own" on storage.objects;
create policy "avatars: write own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars: update own" on storage.objects;
create policy "avatars: update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars: delete own" on storage.objects;
create policy "avatars: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- The view feeds the trainer's lists, so it carries the picture too.
drop view if exists public.trainee_overview;
create view public.trainee_overview
with (security_invoker = on) as
select
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.status,
  p.avatar_url,
  p.created_at,
  (select count(*) from public.programs pr where pr.trainee_id = p.id) as program_count,
  (select max(pl.created_at) from public.performance_logs pl where pl.trainee_id = p.id) as last_logged_at
from public.profiles p;

grant select on public.trainee_overview to authenticated;

select 'migration 013 applied' as result;
