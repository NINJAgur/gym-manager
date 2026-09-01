-- ============================================================================
-- 006 — an illustration for exercises that have no uploaded video.
--
-- guide_slug points at an exercise in the open Workout Guide catalogue
-- (bryllim.github.io/workout-guide), which publishes three SVG frames per
-- exercise. The app cycles those frames as a demonstration loop when
-- video_url is empty.
--
-- Run after migration-005. Idempotent.
-- ============================================================================

alter table public.exercises
  add column if not exists guide_slug text;

comment on column public.exercises.guide_slug is
  'Slug in the open Workout Guide illustration catalogue; the fallback shown when video_url is null.';

select 'migration 006 applied' as result;
