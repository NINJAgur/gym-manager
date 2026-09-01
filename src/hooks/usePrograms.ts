import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PerformanceLog, Program, ProgramItem } from '../lib/types';
import { qk } from './keys';

const EXERCISE_COLS =
  'id, category, name, description, video_url, machine_number, guide_slug';

const ITEM_COLS = `id, program_id, exercise_id, sets, reps, weight, position,
  exercise:exercises!inner(${EXERCISE_COLS})`;

/** A trainee's programs, each with its items attached. Two round trips rather
   than a nested select, because PostgREST cannot embed and keep the ordering
   predictable. */
export async function fetchPrograms(traineeId: string): Promise<Program[]> {
  const programs = await supabase
    .from('programs')
    .select('id, trainee_id, name, day_of_week, position, created_at')
    .eq('trainee_id', traineeId)
    .order('position')
    .order('created_at');
  if (programs.error) throw programs.error;

  const ids = (programs.data ?? []).map((p) => p.id as string);
  if (ids.length === 0) return [];

  const items = await supabase
    .from('program_items')
    .select(ITEM_COLS)
    .in('program_id', ids)
    .order('position');
  if (items.error) throw items.error;

  return (programs.data as Program[]).map((program) => ({
    ...program,
    items: (items.data as unknown as ProgramItem[])
      .filter((i) => i.program_id === program.id)
      .map((i) => ({ ...i, weight: Number(i.weight) })),
  }));
}

export function usePrograms(traineeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.programs(traineeId ?? ''),
    enabled: Boolean(traineeId) && enabled,
    queryFn: () => fetchPrograms(traineeId!),
  });
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
        .gt('reps', 0)
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data as PerformanceLog[]).map((row) => ({ ...row, weight: Number(row.weight) }));
    },
  });
}

interface SetNumbersVars {
  traineeId: string;
  itemId: string;
  exerciseId: string;
  weight: number;
  /** Omitted by trainees — the database rejects reps changes from them. */
  reps?: number;
}

/** Writes the new numbers onto the program item and appends to the history.
   One history entry per exercise per day: adjusting again the same day
   revises today's entry instead of stacking duplicates on the chart. */
export function useSetNumbers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ traineeId, itemId, exerciseId, weight, reps }: SetNumbersVars) => {
      const patch: Record<string, number> = { weight };
      if (reps !== undefined) patch.reps = reps;

      const updated = await supabase
        .from('program_items')
        .update(patch)
        .eq('id', itemId)
        .select('reps')
        .single();
      if (updated.error) throw updated.error;

      const effectiveReps = (updated.data as { reps: number }).reps;
      if (effectiveReps <= 0) return;

      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const existing = await supabase
        .from('performance_logs')
        .select('id')
        .eq('trainee_id', traineeId)
        .eq('exercise_id', exerciseId)
        .gte('created_at', dayStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      if (existing.error) throw existing.error;

      const today = (existing.data as { id: string }[] | null)?.[0];
      const { error } = today
        ? await supabase
            .from('performance_logs')
            .update({ weight, reps: effectiveReps, created_at: new Date().toISOString() })
            .eq('id', today.id)
        : await supabase
            .from('performance_logs')
            .insert({ trainee_id: traineeId, exercise_id: exerciseId, weight, reps: effectiveReps });
      if (error) throw error;
    },

    onMutate: async (vars) => {
      const key = qk.programs(vars.traineeId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Program[]>(key);

      queryClient.setQueryData<Program[]>(key, (old) =>
        old?.map((program) => ({
          ...program,
          items: program.items.map((item) =>
            item.id === vars.itemId
              ? { ...item, weight: vars.weight, reps: vars.reps ?? item.reps }
              : item,
          ),
        })),
      );
      return { key, previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: qk.programs(vars.traineeId) });
      queryClient.invalidateQueries({ queryKey: qk.history(vars.traineeId, vars.exerciseId) });
    },
  });
}
