import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { AssignedExercise, Exercise, PerformanceLog, TraineeOverview } from '../lib/types';
import { fetchAssignedExercises } from './useTrainee';
import { qk } from './keys';

const EXERCISE_COLS = 'id, category, name, description, video_url, machine_number';

export function useTrainees() {
  return useQuery({
    queryKey: qk.trainees(),
    queryFn: async (): Promise<TraineeOverview[]> => {
      const { data, error } = await supabase
        .from('trainee_overview')
        .select('id, full_name, email, exercise_count, last_logged_at')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data as TraineeOverview[];
    },
  });
}

/** The expanded card's rows — only fetched once a card is open. */
export function useTraineeExercises(traineeId: string, enabled: boolean) {
  return useQuery({
    queryKey: qk.assigned(traineeId),
    enabled,
    queryFn: () => fetchAssignedExercises(traineeId),
  });
}

// ── catalogue ───────────────────────────────────────────────────────────────

export function useMasterExercises() {
  return useQuery({
    queryKey: qk.masterExercises(),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Exercise[]> => {
      const { data, error } = await supabase
        .from('exercises')
        .select(EXERCISE_COLS)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Exercise[];
    },
  });
}

export function useExercise(id: string | undefined) {
  return useQuery({
    queryKey: qk.exercise(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<Exercise> => {
      const { data, error } = await supabase
        .from('exercises')
        .select(EXERCISE_COLS)
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Exercise;
    },
  });
}

export type ExerciseDraft = Omit<Exercise, 'id'> & { id?: string };

export function useSaveExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: ExerciseDraft): Promise<Exercise> => {
      const row = {
        category: draft.category.trim(),
        name: draft.name.trim(),
        description: draft.description?.trim() || null,
        video_url: draft.video_url?.trim() || null,
        machine_number: draft.machine_number?.trim() || null,
      };

      const query = draft.id
        ? supabase.from('exercises').update(row).eq('id', draft.id)
        : supabase.from('exercises').insert(row);

      const { data, error } = await query.select(EXERCISE_COLS).single();
      if (error) throw error;
      return data as Exercise;
    },
    onSuccess: (exercise) => {
      queryClient.invalidateQueries({ queryKey: qk.masterExercises() });
      queryClient.invalidateQueries({ queryKey: qk.exercise(exercise.id) });
      queryClient.invalidateQueries({ queryKey: ['assigned'] });
    },
  });
}

/** The form's "Or upload a video file" button. Returns the public URL, which
   is then stored in exercises.video_url exactly like a pasted link. */
export function useUploadVideo() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from('exercise-videos')
        .upload(path, file, { cacheControl: '3600', contentType: file.type || undefined });
      if (error) throw error;
      return supabase.storage.from('exercise-videos').getPublicUrl(path).data.publicUrl;
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.masterExercises() });
      queryClient.invalidateQueries({ queryKey: ['assigned'] });
      queryClient.invalidateQueries({ queryKey: qk.trainees() });
    },
  });
}

// ── assignment ──────────────────────────────────────────────────────────────

export function useAssignExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ traineeId, exerciseIds }: { traineeId: string; exerciseIds: string[] }) => {
      if (exerciseIds.length === 0) return;
      const { error } = await supabase
        .from('trainee_exercises')
        .insert(exerciseIds.map((exercise_id) => ({ trainee_id: traineeId, exercise_id })));
      if (error) throw error;
    },
    onSuccess: (_data, { traineeId }) => {
      queryClient.invalidateQueries({ queryKey: qk.assigned(traineeId) });
      queryClient.invalidateQueries({ queryKey: qk.trainees() });
    },
  });
}

/** Swipe-to-unassign. Optimistic so the row leaves under the finger. */
export function useUnassignExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ traineeId, exerciseId }: { traineeId: string; exerciseId: string }) => {
      const { error } = await supabase
        .from('trainee_exercises')
        .delete()
        .eq('trainee_id', traineeId)
        .eq('exercise_id', exerciseId);
      if (error) throw error;
    },

    onMutate: async ({ traineeId, exerciseId }) => {
      const key = qk.assigned(traineeId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AssignedExercise[]>(key);
      queryClient.setQueryData<AssignedExercise[]>(key, (old) =>
        old?.filter((ex) => ex.id !== exerciseId),
      );
      return { key, previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
    },

    onSettled: (_data, _err, { traineeId }) => {
      queryClient.invalidateQueries({ queryKey: qk.assigned(traineeId) });
      queryClient.invalidateQueries({ queryKey: qk.trainees() });
    },
  });
}

// ── the numbers ─────────────────────────────────────────────────────────────

interface SetNumbersVars {
  traineeId: string;
  exerciseId: string;
  weight: number;
  reps: number;
}

/** The trainer sets weight and reps; each save appends to the record history.
   Optimistic, so the sheet reflects the new numbers immediately. */
export function useSetNumbers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ traineeId, exerciseId, weight, reps }: SetNumbersVars) => {
      const { data, error } = await supabase
        .from('performance_logs')
        .insert({ trainee_id: traineeId, exercise_id: exerciseId, weight, reps })
        .select('id, trainee_id, exercise_id, weight, reps, created_at')
        .single();
      if (error) throw error;
      return { ...(data as PerformanceLog), weight: Number((data as PerformanceLog).weight) };
    },

    onMutate: async (vars) => {
      const assignedKey = qk.assigned(vars.traineeId);
      const historyKey = qk.history(vars.traineeId, vars.exerciseId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: assignedKey }),
        queryClient.cancelQueries({ queryKey: historyKey }),
      ]);

      const prevAssigned = queryClient.getQueryData<AssignedExercise[]>(assignedKey);
      const prevHistory = queryClient.getQueryData<PerformanceLog[]>(historyKey);
      const now = new Date().toISOString();

      queryClient.setQueryData<AssignedExercise[]>(assignedKey, (old) =>
        old?.map((ex) =>
          ex.id === vars.exerciseId
            ? { ...ex, weight: vars.weight, reps: vars.reps, logged_at: now }
            : ex,
        ),
      );
      queryClient.setQueryData<PerformanceLog[]>(historyKey, (old) => [
        {
          id: `optimistic-${now}`,
          trainee_id: vars.traineeId,
          exercise_id: vars.exerciseId,
          weight: vars.weight,
          reps: vars.reps,
          created_at: now,
        },
        ...(old ?? []),
      ]);

      return { assignedKey, historyKey, prevAssigned, prevHistory };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(ctx.assignedKey, ctx.prevAssigned);
      queryClient.setQueryData(ctx.historyKey, ctx.prevHistory);
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: qk.assigned(vars.traineeId) });
      queryClient.invalidateQueries({ queryKey: qk.history(vars.traineeId, vars.exerciseId) });
      queryClient.invalidateQueries({ queryKey: qk.trainees() });
    },
  });
}
