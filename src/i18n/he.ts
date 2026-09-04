/** Hebrew only. The app dropped its language toggle: one audience, one
   language, and the second string table was pure overhead. Wording follows
   the v3 design canvas wherever it supplies one. */
export const T = {
  // sign-in / gate
  signInTitle: 'כניסה לחשבון שלך',
  signInSubtitle: 'התרגילים והתוכניות שלך, בכל מקום שבו אתה מתאמן',
  signInGoogle: 'כניסה עם Google',
  orSeparator: 'או',
  emailLabel: 'דוא״ל',
  emailPlaceholder: 'name@example.com',
  sendLink: 'שליחת קישור כניסה',
  sendingLink: 'שולח…',
  linkSentTo: 'שלחנו קישור כניסה אל',
  linkSameDevice: 'פתח את הקישור מאותו מכשיר ואותו דפדפן שבהם ביקשת אותו.',
  linkSpam: 'לא הגיע? בדוק בתיקיית הספאם.',
  resendLink: 'שליחה חוזרת',
  useAnotherEmail: 'כתובת אחרת',
  emailInvalid: 'כתובת דוא״ל לא תקינה',
  sendFailed: 'שליחת הקישור נכשלה — נסה שוב',
  pendingTitle: 'החשבון שלך מחכה לאישור',
  pendingBody: 'המאמן שלך יבדוק את הפרטים ויאשר את הגישה בקרוב. תקבל התראה כשהחשבון יופעל.',
  deactivatedTitle: 'הגישה שלך הושבתה',
  deactivatedBody: 'המאמן שלך השבית את החשבון. פנה אליו אם לדעתך מדובר בטעות.',
  signOut: 'יציאה',
  changePicture: 'החלפת תמונה',

  // trainee home
  greeting: 'שלום',
  greetingSub: 'מוכן להתקדם היום!',
  noProgram: 'אין תוכנית משויכת',
  colExercise: 'תרגיל',
  colSets: 'סטים',
  colReps: 'חזרות',
  colKg: 'ק"ג',
  updateWeight: 'עדכון משקל נוכחי',
  emptyProgram: 'המאמן שלך עדיין לא הוסיף תרגילים לתוכנית.',
  emptyProgramSelf: 'אין תוכנית משויכת.',

  // trainee detail
  setsByReps: 'סטים × חזרות',
  weightKg: 'משקל (ק"ג)',
  progressChart: 'גרף התקדמות משקל',
  technique: 'טכניקה',
  noVideo: 'אין סרטון הדגמה',
  illustration: 'הדגמה',
  guidePick: 'בחירת איור הדגמה',
  guideNone: 'ללא איור',
  guideSearch: 'חיפוש תרגיל',
  noHistory: 'אין עדיין היסטוריה',

  // trainer — trainees
  trainerKicker: 'מאמן',
  traineesTitle: 'מתאמנים',
  statusActive: 'פעיל',
  statusPending: 'ממתין לאישור',
  statusDeactivated: 'מושבת',
  addExercise: 'הוספת תרגיל',
  removeFromProgram: 'הסר תרגיל מהתוכנית',
  removeProgram: 'מחיקת תוכנית',
  newProgramFor: 'תוכנית אימון חדשה ל',
  weight: 'משקל',
  reps: 'חזרות',
  noTrainees: 'עדיין לא נרשמו מתאמנים.',
  noPrograms: 'אין עדיין תוכניות.',

  // program builder
  newProgramFor2: 'תוכנית חדשה ל',
  builderTitle: 'בניית תוכנית אימון',
  editProgram: 'עריכת תוכנית',
  programForPrefix: 'תוכנית של ',
  programName: 'שם התוכנית',
  programNamePlaceholder: 'לדוגמה: אימון A – חזה + כתפיים',
  programDay: 'יום אימון (אופציונלי)',
  noDay: 'בלי יום קבוע',
  saveProgram: 'שמירת תוכנית ושיוך למתאמן',
  pickFromLibrary: 'בחירת תרגיל ממאגר',
  dayPrefix: 'יום',

  // user management
  usersTitle: 'ניהול משתמשים',
  awaitingApproval: 'ממתינים לאישור',
  usersLabel: 'משתמשים',
  signedUp: 'נרשם',
  noPending: 'אין בקשות ממתינות.',
  promoteToTrainer: 'הפוך למאמן',
  demoteToTrainee: 'הפוך למתאמן',
  roleTrainer: 'מאמן',
  roleTrainee: 'מתאמן',
  rejectAndDelete: 'דחיית הבקשה ומחיקת החשבון',
  myTraining: 'האימון שלי',
  newProgramForMe: 'תוכנית חדשה',

  // exercise library
  libraryTitle: 'מאגר תרגילים',
  newExercise: 'תרגיל חדש',
  editExercise: 'עריכת תרגיל',
  emptyLibrary: 'המאגר ריק. הוסף את התרגיל הראשון.',

  // exercise form
  exerciseName: 'שם התרגיל',
  exerciseNamePlaceholder: 'לדוגמה: לחיצת חזה בשיפוע',
  muscleGroup: 'קבוצת שרירים',
  demoVideo: 'סרטון הדגמה',
  videoPlaceholder: 'הדבק קישור לסרטון',
  uploadVideo: 'או העלה קובץ וידאו',
  uploading: 'מעלה…',
  uploadFailed: 'ההעלאה נכשלה',
  machineNumber: 'מספר מכשיר',
  machinePlaceholder: 'לדוגמה 14',
  description: 'תיאור',
  descriptionPlaceholder: 'הגדרה, ביצוע נכון ומה לרשום',
  saveExercise: 'שמירת תרגיל',
  saveChanges: 'שמירת שינויים',
  nameRequired: 'שם התרגיל הוא שדה חובה',
  confirmDelete: 'הקש שוב למחיקה',

  // bottom nav
  navTrainees: 'מתאמנים',
  navExercises: 'תרגילים',
  navUsers: 'משתמשים',

  // shared
  loading: 'טוען…',
  saving: 'שומר…',
  saveFailed: 'השמירה נכשלה — נסה שוב',
  profileMissing: 'לא הצלחנו לטעון את הפרופיל שלך',
  credits: 'עידן גורין - בן רפאל',
  videoCredit: 'סרטוני ההדגמה:',
  videoCreditVia: 'דרך',
  privacyPolicy: 'מדיניות פרטיות',
  illustrationLicence: 'רישיון CC BY-SA 4.0',
  dash: '—',
  cancel: 'ביטול',
} as const;

/** Muscle groups are stored in English so the exercise form and the library
   agree on a key; these are what the user actually sees. */
export const GROUP_HE: Record<string, string> = {
  Chest: 'חזה',
  Back: 'גב',
  Legs: 'רגליים',
  Shoulders: 'כתפיים',
  Arms: 'ידיים',
  Core: 'בטן',
};

export const GROUP_KEYS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

export const groupLabel = (key: string): string => GROUP_HE[key] ?? key;

/** Sunday-first, matching the weekday numbering stored on a program. */
export const WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const dayLabel = (day: number | null | undefined): string | null =>
  day === null || day === undefined ? null : `${T.dayPrefix} ${WEEKDAYS[day]}`;

export const HE_DATE = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' });
