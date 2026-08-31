import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { AssignedExercise, ExerciseGroup, PerformanceLog } from '../lib/types';
import { qk } from './keys';

const EXERCISE_COLS = 'id, category, name, description, video_url, machine_number';

interface AssignmentRow {
  assigned_at: string;
  exercises: {
    id: string;
    category: string;
    name: string;
    description: string | null;
    video_url: string | null;
    machine_number: string | null;
  };
}

interface LatestRow {
  exercise_id: string;
  weight: number;
  reps: number;
  created_at: string;
}

/** Assigned exercises joined with the numbers the trainer most recently set.
   Shared by the trainee dashboard and the trainer's expanded card. */
export async function fetchAssignedExercises(traineeId: string): Promise<AssignedExercise[]> {
  const [assignments, latest] = await Promise.all([
    supabase
      .from('trainee_exercises')
      .select(`assigned_at, exercises!inner(${EXERCISE_COLS})`)
      .eq('trainee_id', traineeId),
    supabase
      .from('latest_logs')
      .select('exercise_id, weight, reps, created_at')
      .eq('trainee_id', traineeId),
  ]);

  if (assignments.error) throw assignments.error;
  if (latest.error) throw latest.error;

  const byExercise = new Map<string, LatestRow>(
    (latest.data as LatestRow[]).map((row) => [row.exercise_id, row]),
  );

  return (assignments.data as unknown as AssignmentRow[])
    .map(({ assigned_at, exercises }) => {
      const log = byExercise.get(exercises.id);
      return {
        ...exercises,
        assigned_at,
        weight: log ? Number(log.weight) : null,
        reps: log ? log.reps : null,
        logged_at: log ? log.created_at : null,
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

export function useAssignedExercises(traineeId: string | undefined) {
  return useQuery({
    queryKey: qk.assigned(traineeId ?? ''),
    enabled: Boolean(traineeId),
    queryFn: () => fetchAssignedExercises(traineeId!),
  });
}

/** Collapses the flat list into the accordion's category groups. */
export function groupByCategory(exercises: AssignedExercise[]): ExerciseGroup[] {
  const groups = new Map<string, AssignedExercise[]>();
  for (const exercise of exercises) {
    const bucket = groups.get(exercise.category);
    if (bucket) bucket.push(exercise);
    else groups.set(exercise.category, [exercise]);
  }
  return [...groups].map(([name, items]) => ({ name, items }));
}

export function useExerciseHistory(traineeId: string | undefined, exerciseId: string | undefined) {
  return useQuery({
    queryKey: qk.history(traineeId ?? '', exerciseId ?? ''),
    enabled: Boolean(traineeId && exerciseId),
    queryFn: async (): Promise<PerformanceLog[]> => {
      const { data, error } = await supabase
        .from('performance_logs')
        .select('id, trainee_id, exercise_id, weight, reps, created_at')
        .eq('trainee_id', traineeId!)
        .eq('exercise_id', exerciseId!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data as PerformanceLog[]).map((row) => ({ ...row, weight: Number(row.weight) }));
    },
  });
}
