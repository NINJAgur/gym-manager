-- ============================================================================
-- Master exercise list — the catalogue the assign modal reads from.
-- Lifted from the design's GROUPS + MASTER fixtures. Re-runnable.
-- ============================================================================

insert into public.exercises (category, name, description) values
  ('Chest', 'Incline Dumbbell Press',  'Bench at 30 degrees. Press up and slightly together, elbows tucked to about 45 degrees. Log the heaviest weight you completed with clean form.'),
  ('Chest', 'Flat Barbell Bench Press','Feet planted, bar to mid-chest, wrists stacked over the elbows. Log the top set only.'),
  ('Chest', 'Cable Fly',               'Slight forward lean, elbows soft, squeeze at the midline and control the return.'),
  ('Chest', 'Weighted Dip',            'Torso leaning forward, elbows back, stop when the shoulders reach the elbows.'),
  ('Chest', 'Dumbbell Pullover',       'Hips low, elbows soft, stretch back over the head and pull the weight to the chest.'),

  ('Back', 'Chest-Supported Row',      'Pad at the sternum, pull to the lower ribs, hold a beat and lower under control.'),
  ('Back', 'Weighted Pull-Up',         'Full hang at the bottom, chin over the bar at the top. Log added weight, not bodyweight.'),
  ('Back', 'Lat Pulldown',             'Bar to the collarbone, ribs down, elbows driving into the back pocket.'),
  ('Back', 'Face Pull',                'Rope at eye height, pull to the forehead and rotate the hands back.'),
  ('Back', 'Single-Arm Cable Row',     'Square the hips, pull the handle to the hip, let the shoulder blade travel forward on the return.'),

  ('Legs', 'Back Squat',               'Brace, break at the hips and knees together, thighs past parallel. Log the top set.'),
  ('Legs', 'Romanian Deadlift',        'Hinge with a long spine, bar tracking the thighs, stop at the end of the hamstring stretch.'),
  ('Legs', 'Leg Press',                'Knees tracking over the toes, stop short of the lower back rounding off the pad.'),
  ('Legs', 'Standing Calf Raise',      'Full stretch at the bottom, pause at the top, no bouncing.'),
  ('Legs', 'Barbell Hip Thrust',       'Shoulders on the bench, chin tucked, drive through the heels to a flat torso at the top.'),
  ('Legs', 'Bulgarian Split Squat',    'Rear foot elevated, front shin near vertical, sink until the back knee is just off the floor.'),

  ('Shoulders', 'Seated Overhead Press','Ribs stacked over the hips, bar path close to the face, lock out overhead.'),
  ('Shoulders', 'Cable Lateral Raise',  'Lead with the elbow to shoulder height, no shrug at the top.'),
  ('Shoulders', 'Reverse Pec Deck',     'Arms wide, drive with the rear delts and stop level with the shoulders.'),
  ('Shoulders', 'Arnold Press',         'Start palms-in at the chin, rotate out as you press, reverse the path on the way down.'),

  ('Arms', 'Rope Triceps Pushdown',    'Elbows pinned to the ribs, spread the rope at the bottom, full lockout.'),
  ('Arms', 'Hammer Curl',              'Neutral grip, elbows still, no swing from the hips.'),

  ('Core', 'Hanging Leg Raise',        'Dead hang, curl the pelvis under, raise the legs without swinging.')
on conflict (category, name) do nothing;
