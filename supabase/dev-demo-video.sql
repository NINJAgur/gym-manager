-- ============================================================================
-- DEV ONLY — puts a playable clip on one exercise so the embed can be tried.
--
-- This is a generic public sample file, not a technique video. It exercises
-- the direct-file path (<video controls>) in src/lib/video.ts. To try the
-- iframe path instead, paste a YouTube or Vimeo link into the exercise form
-- and the same field will render a player.
--
-- Undo:  update public.exercises set video_url = null where name = 'Hammer Curl';
-- ============================================================================

update public.exercises
set video_url = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    machine_number = coalesce(machine_number, '15')
where name = 'Hammer Curl';

select name, category, machine_number, video_url
from public.exercises
where video_url is not null;
