-- ============================================================================
-- 004 — the seeded catalogue in Hebrew.
--
-- Exercise names and descriptions are rows, not UI strings, so the EN/עברית
-- toggle cannot translate them. There is one `name` column, so it holds one
-- language: Hebrew, since that is what the trainees read.
--
-- Categories stay English in the database on purpose — GROUP_HE in
-- src/i18n/strings.ts translates them at render time, so they follow the
-- toggle. Do not translate them here or that mapping stops matching.
--
-- Matched on the English name, so it only touches the seeded rows and leaves
-- anything the trainer has since added alone. Re-runnable: once renamed, the
-- English names no longer match and the statements become no-ops.
-- ============================================================================

update public.exercises set
  name = case name
    when 'Incline Dumbbell Press'   then 'לחיצת חזה בשיפוע עם משקולות'
    when 'Flat Barbell Bench Press' then 'לחיצת חזה שטוחה במוט'
    when 'Cable Fly'                then 'פרפר בפולי'
    when 'Weighted Dip'             then 'מקבילים עם משקל'
    when 'Dumbbell Pullover'        then 'פולאובר עם משקולת'

    when 'Chest-Supported Row'      then 'חתירה בתמיכת חזה'
    when 'Weighted Pull-Up'         then 'מתח עם משקל'
    when 'Lat Pulldown'             then 'פולי עליון'
    when 'Face Pull'                then 'משיכת פנים בחבל'
    when 'Single-Arm Cable Row'     then 'חתירה ביד אחת בפולי'

    when 'Back Squat'               then 'סקוואט עם מוט'
    when 'Romanian Deadlift'        then 'דדליפט רומני'
    when 'Leg Press'                then 'לחיצת רגליים'
    when 'Standing Calf Raise'      then 'הרמת עקבים בעמידה'
    when 'Barbell Hip Thrust'       then 'הרמת אגן עם מוט'
    when 'Bulgarian Split Squat'    then 'סקוואט בולגרי'

    when 'Seated Overhead Press'    then 'לחיצת כתפיים בישיבה'
    when 'Cable Lateral Raise'      then 'הרחקת כתפיים בפולי'
    when 'Reverse Pec Deck'         then 'פרפר הפוך במכשיר'
    when 'Arnold Press'             then 'לחיצת ארנולד'

    when 'Rope Triceps Pushdown'    then 'פשיטת מרפקים בחבל'
    when 'Hammer Curl'              then 'כפיפת מרפקים בפטיש'

    when 'Hanging Leg Raise'        then 'הרמת רגליים בתלייה'
    else name
  end,
  description = case name
    when 'Incline Dumbbell Press'   then 'ספסל בשיפוע של 30 מעלות. דחוף למעלה ומעט פנימה, מרפקים אסופים בזווית של כ-45 מעלות.'
    when 'Flat Barbell Bench Press' then 'רגליים נעוצות ברצפה, המוט יורד לאמצע החזה, פרקי הידיים מעל המרפקים.'
    when 'Cable Fly'                then 'הטיה קלה קדימה, מרפקים רכים, כיווץ בקו האמצע וחזרה בשליטה.'
    when 'Weighted Dip'             then 'הטיית גו קדימה, מרפקים אחורה, עצור כשהכתפיים מגיעות לגובה המרפקים.'
    when 'Dumbbell Pullover'        then 'אגן נמוך, מרפקים רכים, מתיחה מאחורי הראש ומשיכה אל החזה.'

    when 'Chest-Supported Row'      then 'הכרית בגובה עצם החזה, משוך אל הצלעות התחתונות, החזק רגע והורד בשליטה.'
    when 'Weighted Pull-Up'         then 'תלייה מלאה למטה, סנטר מעל המוט למעלה. תעד את המשקל הנוסף, לא את משקל הגוף.'
    when 'Lat Pulldown'             then 'המוט אל עצם הבריח, צלעות למטה, מרפקים נמשכים אחורה ולמטה.'
    when 'Face Pull'                then 'החבל בגובה העיניים, משוך אל המצח וסובב את כפות הידיים אחורה.'
    when 'Single-Arm Cable Row'     then 'אגן מיושר, משוך את הידית אל המותן, ותן לשכמה להתקדם בחזרה.'

    when 'Back Squat'               then 'נעל את הליבה, שבור בירכיים ובברכיים יחד, ירך מתחת למקביל.'
    when 'Romanian Deadlift'        then 'כיפוף ירכיים עם גב ישר, המוט צמוד לירכיים, עצור בסוף מתיחת הירך האחורית.'
    when 'Leg Press'                then 'ברכיים בקו הבהונות, עצור לפני שהגב התחתון מתעגל מהכרית.'
    when 'Standing Calf Raise'      then 'מתיחה מלאה למטה, עצירה למעלה, בלי קפיצות.'
    when 'Barbell Hip Thrust'       then 'כתפיים על הספסל, סנטר אסוף, דחוף מהעקבים עד ליישור מלא של הגו.'
    when 'Bulgarian Split Squat'    then 'רגל אחורית מוגבהת, שוק קדמית כמעט אנכית, רד עד שהברך האחורית כמעט נוגעת.'

    when 'Seated Overhead Press'    then 'צלעות מעל האגן, מסלול המוט קרוב לפנים, נעילה מלאה מעל הראש.'
    when 'Cable Lateral Raise'      then 'הובל עם המרפק עד גובה הכתף, בלי הרמת כתפיים למעלה.'
    when 'Reverse Pec Deck'         then 'ידיים רחבות, הנע מהכתף האחורית ועצור בקו הכתפיים.'
    when 'Arnold Press'             then 'התחל עם כפות ידיים פנימה בגובה הסנטר, סובב החוצה בדחיפה וחזור באותו מסלול.'

    when 'Rope Triceps Pushdown'    then 'מרפקים צמודים לצלעות, פתח את החבל בתחתית, יישור מלא.'
    when 'Hammer Curl'              then 'אחיזה ניטרלית, מרפקים יציבים, בלי תנופה מהאגן.'

    when 'Hanging Leg Raise'        then 'תלייה מלאה, גלגל את האגן פנימה, הרם את הרגליים בלי נדנוד.'
    else description
  end
where name in (
  'Incline Dumbbell Press', 'Flat Barbell Bench Press', 'Cable Fly', 'Weighted Dip',
  'Dumbbell Pullover', 'Chest-Supported Row', 'Weighted Pull-Up', 'Lat Pulldown',
  'Face Pull', 'Single-Arm Cable Row', 'Back Squat', 'Romanian Deadlift', 'Leg Press',
  'Standing Calf Raise', 'Barbell Hip Thrust', 'Bulgarian Split Squat',
  'Seated Overhead Press', 'Cable Lateral Raise', 'Reverse Pec Deck', 'Arnold Press',
  'Rope Triceps Pushdown', 'Hammer Curl', 'Hanging Leg Raise'
);

select category, name from public.exercises order by category, name;
