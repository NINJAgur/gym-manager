import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { AccountStatus, Exercise, TraineeOverview } from '../lib/types';
import { VIDEO_BUCKET, storagePath } from '../lib/video';
import { qk } from './keys';

const EXERCISE_COLS =
  'id, category, name, description, video_url, machine_number, guide_slug';

// ── users ───────────────────────────────────────────────────────────────────

export function useTrainees() {
  return useQuery({
    queryKey: qk.trainees(),
    queryFn: async (): Promise<TraineeOverview[]> => {
      const { data, error } = await supabase
        .from('trainee_overview')
        .select('id, full_name, email, status, created_at, program_count, last_logged_at')
        .order('full_name');
      if (error) throw error;
      return data as TraineeOverview[];
    },
  });
}

export function useSetAccountStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AccountStatus }) => {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.trainees() }),
  });
}

// ── exercise library ────────────────────────────────────────────────────────

export function useExercises() {
  return useQuery({
    queryKey: qk.exercises(),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Exercise[]> => {
      const { data, error } = await supabase
        .from('exercises')
        .select(EXERCISE_COLS)
        .order('category')
        .order('name');
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
        guide_slug: draft.guide_slug || null,
      };

      let previousVideo: string | null = null;
      if (draft.id) {
        const prev = await supabase
          .from('exercises')
          .select('video_url')
          .eq('id', draft.id)
          .single();
        previousVideo = (prev.data as { video_url: string | null } | null)?.video_url ?? null;
      }

      const query = draft.id
        ? supabase.from('exercises').update(row).eq('id', draft.id)
        : supabase.from('exercises').insert(row);
      const { data, error } = await query.select(EXERCISE_COLS).single();
      if (error) throw error;

      if (previousVideo !== row.video_url) await discardUpload(previousVideo);
      return data as Exercise;
    },
    onSuccess: (exercise) => {
      queryClient.invalidateQueries({ queryKey: qk.exercises() });
      queryClient.invalidateQueries({ queryKey: qk.exercise(exercise.id) });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const existing = await supabase.from('exercises').select('video_url').eq('id', id).single();
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
      await discardUpload((existing.data as { video_url: string | null } | null)?.video_url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.exercises() });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(VIDEO_BUCKET)
        .upload(path, file, { cacheControl: '3600', contentType: file.type || undefined });
      if (error) throw error;
      return supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
    },
  });
}

/** Remove an uploaded file nothing points at any more. Pasted links are left
   alone, and a storage failure never fails the surrounding write. */
export async function discardUpload(url: string | null | undefined): Promise<void> {
  const path = storagePath(url);
  if (!path) return;
  try {
    await supabase.storage.from(VIDEO_BUCKET).remove([path]);
  } catch {
    /* orphan left behind; the row is already correct */
  }
}

// ── program authoring ───────────────────────────────────────────────────────

export interface DraftItem {
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface ProgramDraft {
  traineeId: string;
  name: string;
  /** 0=Sunday .. 6=Saturday, or null when it is not tied to a day. */
  dayOfWeek: number | null;
  items: DraftItem[];
}

/** Creates the program and its items. Not a transaction — PostgREST has no way
   to express one — so a failure part-way leaves the program behind and it is
   deleted on the way out rather than left half-built. */
export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: ProgramDraft) => {
      const created = await supabase
        .from('programs')
        .insert({
          trainee_id: draft.traineeId,
          name: draft.name.trim(),
          day_of_week: draft.dayOfWeek,
        })
        .select('id')
        .single();
      if (created.error) throw created.error;
      const programId = (created.data as { id: string }).id;

      try {
        const rows = draft.items.map((item, index) => ({
          program_id: programId,
          exercise_id: item.exercise_id,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          position: index,
        }));

        if (rows.length > 0) {
          const { error } = await supabase.from('program_items').insert(rows);
          if (error) throw error;
        }
      } catch (error) {
        await supabase.from('programs').delete().eq('id', programId);
        throw error;
      }

      return programId;
    },
    onSuccess: (_id, draft) => {
      queryClient.invalidateQueries({ queryKey: qk.programs(draft.traineeId) });
      queryClient.invalidateQueries({ queryKey: qk.trainees() });
    },
  });
}

/** Removes the program, and its days and items with it — both cascade. */
/** Saves edits to an existing program. Items are replaced wholesale rather
   than diffed: performance_logs key off trainee and exercise, never off an
   item id, so nothing historical depends on those rows surviving. */
export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: ProgramDraft & { programId: string }) => {
      const updated = await supabase
        .from('programs')
        .update({ name: draft.name.trim(), day_of_week: draft.dayOfWeek })
        .eq('id', draft.programId);
      if (updated.error) throw updated.error;

      const cleared = await supabase
        .from('program_items')
        .delete()
        .eq('program_id', draft.programId);
      if (cleared.error) throw cleared.error;

      if (draft.items.length === 0) return;
      const { error } = await supabase.from('program_items').insert(
        draft.items.map((item, index) => ({
          program_id: draft.programId,
          exercise_id: item.exercise_id,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          position: index,
        })),
      );
      if (error) throw error;
    },
    onSuccess: (_data, draft) =>
      queryClient.invalidateQueries({ queryKey: qk.programs(draft.traineeId) }),
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ programId }: { programId: string; traineeId: string }) => {
      const { error } = await supabase.from('programs').delete().eq('id', programId);
      if (error) throw error;
    },
    onSuccess: (_data, { traineeId }) => {
      queryClient.invalidateQueries({ queryKey: qk.programs(traineeId) });
      queryClient.invalidateQueries({ queryKey: qk.trainees() });
    },
  });
}

export function useDeleteProgramItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string; traineeId: string }) => {
      const { error } = await supabase.from('program_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: (_data, { traineeId }) =>
      queryClient.invalidateQueries({ queryKey: qk.programs(traineeId) }),
  });
}

export function useAddProgramItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      traineeId: string;
      programId: string;
      exerciseId: string;
      position: number;
    }) => {
      const { error } = await supabase.from('program_items').insert({
        program_id: vars.programId,
        exercise_id: vars.exerciseId,
        position: vars.position,
      });
      if (error) throw error;
    },
    onSuccess: (_data, { traineeId }) =>
      queryClient.invalidateQueries({ queryKey: qk.programs(traineeId) }),
  });
}
