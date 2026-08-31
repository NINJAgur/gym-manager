export type Lang = 'en' | 'he';

/** English strings are the design's own wording wherever v2 supplies one. */
export const TR = {
  en: {
    // sign-in
    perfTracker: 'Performance tracker',
    signInLine1: 'Sign in to',
    signInLine2: 'your gym stats',
    continueGoogle: 'Continue with Google',

    // trainee dashboard
    myExercises: 'My exercises',
    statExercises: 'Exercises',
    statGroups: 'Groups',
    statLastUpdate: 'Last update',
    updatedWord: 'Updated',
    repsWord: 'reps',
    traineeFooter: 'Set by your trainer. Tap an exercise for details.',

    // trainee detail
    assignedExercise: 'Assigned exercise',
    techniqueWord: 'Technique',
    weightRequired: 'Weight required',
    repsRequired: 'Reps required',
    recordHistory: 'Record history',
    machineWord: 'Machine',
    noVideo: 'No technique video',

    // trainer — trainees
    trainerKicker: 'Trainer',
    registeredTrainees: 'registered trainees',
    searchTrainees: 'Search trainees',
    exercisesWord: 'exercises',
    assignedExercises: 'Assigned exercises',
    addExerciseFor: 'Add exercise for',
    weightLabel: 'Weight',
    repsLabel: 'Reps',
    removeExercise: 'Remove exercise',
    masterList: 'Master list',
    assignTo: 'Assign to',
    assignWord: 'Assign',
    cancelWord: 'Cancel',
    selectedOne: 'exercise selected',
    selectedMany: 'exercises selected',

    // trainer — library
    exerciseLibrary: 'Exercise library',
    newExercise: 'New exercise',
    editExercise: 'Edit exercise',
    libraryFooter: 'Edit or remove any exercise, or add a new one to the shared library.',
    searchCatalogue: 'Search library',

    // trainer — form
    exerciseName: 'Exercise name',
    namePlaceholder: 'e.g. Incline Dumbbell Press',
    muscleGroup: 'Muscle group',
    techniqueVideo: 'Technique video',
    pasteVideoUrl: 'Paste a video URL',
    uploadVideo: 'Or upload a video file',
    uploading: 'Uploading…',
    uploadFailed: 'Upload failed',
    machineLabel: 'Machine number',
    machinePlaceholder: 'e.g. 14',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Setup, execution cues, and what to log.',
    saveExercise: 'Save exercise',
    saveChanges: 'Save changes',
    requiredField: 'Name is required',
    confirmDelete: 'Tap again to delete',

    // shared / states
    signOut: 'Sign out',
    profileMissing: "We couldn't load your profile",
    today: 'today',
    yesterday: 'yesterday',
    daysAgo: 'days ago',
    never: 'never',
    noRecord: 'not set',
    dash: '—',
    loading: 'Loading…',
    noExercises: 'Nothing assigned yet. Your trainer will add exercises here.',
    noneAssigned: 'No exercises assigned yet.',
    noTrainees: 'No trainees have signed in yet.',
    noHistory: 'No history yet.',
    noneLeft: 'Everything in the library is already assigned.',
    emptyCatalogue: 'The library is empty. Add the first exercise.',
    saving: 'Saving…',
    saveFailed: 'Could not save — retry',
    assignFailed: 'Could not assign — retry',
  },

  he: {
    // sign-in
    perfTracker: 'מעקב ביצועים',
    signInLine1: 'התחברות',
    signInLine2: 'לנתוני האימונים שלך',
    continueGoogle: 'המשך עם Google',

    // trainee dashboard
    myExercises: 'התרגילים שלי',
    statExercises: 'תרגילים',
    statGroups: 'קבוצות',
    statLastUpdate: 'עודכן לאחרונה',
    updatedWord: 'עודכן',
    repsWord: 'חזרות',
    traineeFooter: 'נקבע על ידי המאמן שלך. הקש על תרגיל לפרטים.',

    // trainee detail
    assignedExercise: 'תרגיל משויך',
    techniqueWord: 'טכניקה',
    weightRequired: 'משקל נדרש',
    repsRequired: 'חזרות נדרשות',
    recordHistory: 'היסטוריית שיאים',
    machineWord: 'מכשיר',
    noVideo: 'אין סרטון טכניקה',

    // trainer — trainees
    trainerKicker: 'מאמן',
    registeredTrainees: 'מתאמנים רשומים',
    searchTrainees: 'חיפוש מתאמנים',
    exercisesWord: 'תרגילים',
    assignedExercises: 'תרגילים משויכים',
    addExerciseFor: 'הוספת תרגיל ל',
    weightLabel: 'משקל',
    repsLabel: 'חזרות',
    removeExercise: 'הסרת תרגיל',
    masterList: 'רשימת תרגילים',
    assignTo: 'שיוך ל',
    assignWord: 'שיוך',
    cancelWord: 'ביטול',
    selectedOne: 'תרגיל נבחר',
    selectedMany: 'תרגילים נבחרו',

    // trainer — library
    exerciseLibrary: 'מאגר התרגילים',
    newExercise: 'תרגיל חדש',
    editExercise: 'עריכת תרגיל',
    libraryFooter: 'ערוך או הסר תרגיל, או הוסף חדש למאגר המשותף.',
    searchCatalogue: 'חיפוש במאגר',

    // trainer — form
    exerciseName: 'שם התרגיל',
    namePlaceholder: 'לדוגמה: לחיצת חזה בשיפוע',
    muscleGroup: 'קבוצת שרירים',
    techniqueVideo: 'סרטון טכניקה',
    pasteVideoUrl: 'הדבק קישור לסרטון',
    uploadVideo: 'או העלה קובץ וידאו',
    uploading: 'מעלה…',
    uploadFailed: 'ההעלאה נכשלה',
    machineLabel: 'מספר מכשיר',
    machinePlaceholder: 'לדוגמה 14',
    descriptionLabel: 'תיאור',
    descriptionPlaceholder: 'הכנה, דגשי ביצוע, ומה לתעד.',
    saveExercise: 'שמירת תרגיל',
    saveChanges: 'שמירת שינויים',
    requiredField: 'שם הוא שדה חובה',
    confirmDelete: 'הקש שוב למחיקה',

    // shared / states
    signOut: 'התנתקות',
    profileMissing: 'לא הצלחנו לטעון את הפרופיל שלך',
    today: 'היום',
    yesterday: 'אתמול',
    daysAgo: 'ימים',
    never: 'אף פעם',
    noRecord: 'לא נקבע',
    dash: '—',
    loading: 'טוען…',
    noExercises: 'עדיין לא שויכו תרגילים. המאמן שלך יוסיף אותם כאן.',
    noneAssigned: 'עדיין לא שויכו תרגילים.',
    noTrainees: 'עדיין לא התחברו מתאמנים.',
    noHistory: 'אין עדיין היסטוריה.',
    noneLeft: 'כל התרגילים במאגר כבר משויכים.',
    emptyCatalogue: 'המאגר ריק. הוסף את התרגיל הראשון.',
    saving: 'שומר…',
    saveFailed: 'השמירה נכשלה — נסה שוב',
    assignFailed: 'השיוך נכשל — נסה שוב',
  },
} as const;

export type Strings = Record<keyof (typeof TR)['en'], string>;

export const GROUP_HE: Record<string, string> = {
  Chest: 'חזה',
  Back: 'גב',
  Legs: 'רגליים',
  Shoulders: 'כתפיים',
  Arms: 'ידיים',
  Core: 'בטן',
};

/** The form's chip picker, from the design's GROUP_NAMES. */
export const GROUP_NAMES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];

export const FONT_FAMILY: Record<Lang, string> = {
  en: 'Archivo,system-ui,sans-serif',
  he: "'Noto Sans Hebrew',Archivo,system-ui,sans-serif",
};
