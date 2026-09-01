export type Role = 'trainee' | 'trainer';
export type AccountStatus = 'pending' | 'active' | 'deactivated';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  status: AccountStatus;
  created_at: string;
}

export interface Exercise {
  id: string;
  category: string;
  name: string;
  description: string | null;
  video_url: string | null;
  machine_number: string | null;
  /** Illustration fallback from the open Workout Guide catalogue. */
  guide_slug: string | null;
}

/** One line of a program: an exercise plus the numbers set for it. */
export interface ProgramItem {
  id: string;
  program_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
  position: number;
  exercise: Exercise;
}

export interface Program {
  id: string;
  trainee_id: string;
  name: string;
  /** 0=Sunday .. 6=Saturday, or null when the program is not tied to a day. */
  day_of_week: number | null;
  position: number;
  created_at: string;
  items: ProgramItem[];
}

/** Written whenever a weight is changed, so the chart has a series. */
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
  status: AccountStatus;
  created_at: string;
  program_count: number;
  last_logged_at: string | null;
}
