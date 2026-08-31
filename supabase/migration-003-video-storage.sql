-- ============================================================================
-- 003 — storage for uploaded technique videos.
--
-- The exercise form offers "Or upload a video file" alongside the URL field.
-- Uploads land in a public bucket; the resulting public URL is written to
-- exercises.video_url, so pasted links and uploads are handled identically.
--
-- Run after migration-002. Idempotent.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-videos',
  'exercise-videos',
  true,
  104857600, -- 100 MB
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can watch; only trainers can add or remove.

drop policy if exists "videos: public read" on storage.objects;
create policy "videos: public read" on storage.objects
  for select to public
  using (bucket_id = 'exercise-videos');

drop policy if exists "videos: trainers upload" on storage.objects;
create policy "videos: trainers upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'exercise-videos' and public.is_trainer());

drop policy if exists "videos: trainers delete" on storage.objects;
create policy "videos: trainers delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'exercise-videos' and public.is_trainer());

select id, public, file_size_limit from storage.buckets where id = 'exercise-videos';
