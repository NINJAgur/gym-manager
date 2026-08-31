export type Role = 'trainee' | 'trainer';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Exercise {
  id: string;
  category: string;
  name: string;
  description: string | null;
  video_url: string | null;
  machine_number: string | null;
}

/** An assigned exercise joined with the numbers the trainer most recently set. */
export interface AssignedExercise extends Exercise {
  assigned_at: string;
  weight: number | null;
  reps: number | null;
  logged_at: string | null;
}

/** One entry in an exercise's record history — written by the trainer. */
export interface PerformanceLog {
  id: string;
  trainee_id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  created_at: string;
}

export interface TraineeOverview {
  id: string;
  full_name: string | null;
  email: string | null;
  exercise_count: number;
  last_logged_at: string | null;
}

/** A category and the exercises under it, for the trainee's accordion. */
export interface ExerciseGroup {
  name: string;
  items: AssignedExercise[];
}
