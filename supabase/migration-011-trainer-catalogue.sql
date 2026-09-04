-- ============================================================================
-- DESTRUCTIVE — replaces the whole exercise catalogue with the trainer's list.
--
-- exercises is referenced by program_items and performance_logs, both ON DELETE
-- CASCADE, so emptying it also empties every program and every logged weight.
-- That is fine while the only data is test data; it is not fine later.
--
-- Run the SELECT on its own first. It reports what the DELETE will destroy.
--
-- Machine numbers are split out of the names into machine_number, so the app
-- shows them as their own badge instead of repeating them in the title.
-- The trainer's sub-headings (כתף אמצעית, יד קדמית, ...) have no column of
-- their own — the app has six muscle groups — so they are kept in description.
-- ============================================================================

select
  (select count(*) from public.exercises)        as exercises_to_delete,
  (select count(*) from public.program_items)    as program_items_lost,
  (select count(*) from public.performance_logs) as weight_history_lost;

-- ── once the numbers above are acceptable, run the rest ─────────────────────

delete from public.exercises;

insert into public.exercises (category, name, machine_number, description) values
  ('Legs', 'סקווט כנגד משקולת יד', null, null),
  ('Legs', 'סקווט כנגד מוט', null, null),
  ('Legs', 'סקווט בסמיט משין', null, null),
  ('Legs', 'לאנג''ים סטטים כנגד משקולת יד', null, null),
  ('Legs', 'לאנג''ים דינמיים כנגד משקולת יד', null, null),
  ('Legs', 'לחיצת רגליים במכונה', '9/10', null),
  ('Legs', 'בישיבה כפיפת בירכיים במכונה', '4', null),
  ('Legs', 'בשכיבה כפיפת ברכיים במכונה', '11', null),
  ('Legs', 'כפיפת בירכיים במכונה רגל רגל', '41/42', null),
  ('Legs', 'בישיבה פשיטת ברכיים במכונה', '2/3/5', null),
  ('Legs', 'בישיבה הרחקת ירך במכונה', '12/14/15', null),
  ('Legs', 'בישיבה מקרבי ירך במכונה', '12/13', null),
  ('Back', 'עליות מתח באחיזה רחבה', null, null),
  ('Back', 'עליות מתח באחיזה צרה', null, null),
  ('Back', 'בישיבה משיכת פולי עליון לפנים באחיזה רחבה עם מוט', '7/8', null),
  ('Back', 'בישיבה משיכת פולי עליון לפנים באחיזה צרה עם משולש', '7/8', null),
  ('Back', 'בישיבה משיכה במכונה', '17', null),
  ('Back', 'בישיבה משיכה במכונה עם ידיות', '16', null),
  ('Back', 'בישיבה חתירה במכונה', '18/19', null),
  ('Back', 'בישיבה חתירה בפולי תחתון עם משולש', null, null),
  ('Back', 'בשכיבה על ספסל פול אובר כנגד משקולת יד', null, null),
  ('Back', 'בישיבה חתירה בפולי עליון יד יד', null, null),
  ('Chest', 'בשכיבה על ספסל לחיצת חזה בסמיט משין', null, null),
  ('Chest', 'בשכיבה על ספסל בשיפוע חיובי לחיצת חזה בסמיט משין', null, null),
  ('Chest', 'בשכיבה על ספסל לחיצת חזה כנגד משקולת יד', null, null),
  ('Chest', 'בשכיבה על ספסל בשיפוע חיובי לחיצת חזה כנגד משקולת יד', null, null),
  ('Chest', 'בישיבה פרפר במכונה', '28/30/31/32', null),
  ('Chest', 'בישיבה לחיצת חזה במכונה', '29/33/34', null),
  ('Chest', 'בישיבה מקבילים במכונה באחיזה רחבה', '22/23', null),
  ('Chest', 'מקבילים באחיזה רחבה', null, null),
  ('Shoulders', 'בישיבה לחיצת כתף במכונה', '24/25', 'כתף אמצעית'),
  ('Shoulders', 'בעמידה הרחקת כתף כנגד משקולת יד', null, 'כתף אמצעית'),
  ('Shoulders', 'בישיבה לחיצת כתפיים כנגד משקולת יד', null, 'כתף אמצעית'),
  ('Shoulders', 'בעמידה הרחקת כתף כנגד פולי תחתון', null, 'כתף אמצעית'),
  ('Shoulders', 'בעמידה כפיפת כתף כנגד פלטה או משקולת יד', null, 'כתף קדמית'),
  ('Arms', 'בעמידה כפיפת מרפקים כנגד משקולת יד', null, 'יד קדמית'),
  ('Arms', 'בישיבה כפיפת מרפקים במכונה', '21', 'יד קדמית'),
  ('Arms', 'בעמידה על מדרגה כפיפת מרפקים כנגד פולי תחתון עם מוט קטן', null, 'יד קדמית'),
  ('Arms', 'בעמידה כפיפת מרפקים כנגד פולי תחתון עם מוט קטן', null, 'יד קדמית'),
  ('Arms', 'בעמידה על מדרגה כפיפת מרפקים בפולי תחתון (פטישים) עם חבל', null, 'יד קדמית'),
  ('Arms', 'בעמידה כפיפת מרפקים בפולי תחתון (פטישים) עם חבל', null, 'יד קדמית'),
  ('Arms', 'בעמידה כפיפת מרפקים (פטישים) כנגד משקולת יד', null, 'יד קדמית'),
  ('Arms', 'בעמידה כפיפת מרפקים כנגד מוט אולימפי', null, 'יד קדמית'),
  ('Arms', 'בישיבה פשיטת מרפקים במכונה', '20', 'יד אחורית'),
  ('Arms', 'בישיבה מקבילים במכונה באחיזה צרה', '22/23', 'יד אחורית'),
  ('Arms', 'מקבילים באחיזה צרה', null, 'יד אחורית'),
  ('Arms', 'בעמידה פשיטת מרפקים בפולי עליון עם מוט או חבל', null, 'יד אחורית'),
  ('Arms', 'בעמידה פשיטת מרפקים בפולי עליון יד יד', null, 'יד אחורית'),
  ('Arms', 'בישיבה פשיטת מרפקים מאחורי הראש כנגד משקולת יד', null, 'יד אחורית');

select category, count(*) as exercises
from public.exercises
group by category
order by category;
