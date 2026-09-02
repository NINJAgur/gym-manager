-- ============================================================================
-- Repairs the trainee edit guard after migration 008.
--
-- 008 dropped program_items.day_id, but this trigger function still referenced
-- new.day_id. plpgsql resolves NEW's fields at runtime, so every trainee
-- weight update raised `record "new" has no field "day_id"` and rolled back —
-- the number appeared to reset to whatever the trainer had set. Trainers never
-- saw it: is_trainer() returns before that line.
--
-- Same rule as before, minus the column that no longer exists.
-- ============================================================================

create or replace function public.guard_program_item_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_trainer() or auth.uid() is null then
    return new;                        -- trainer, or the SQL editor
  end if;

  if new.sets is distinct from old.sets
     or new.reps is distinct from old.reps
     or new.exercise_id is distinct from old.exercise_id
     or new.program_id is distinct from old.program_id
     or new.position is distinct from old.position then
    raise exception 'trainees may only change weight';
  end if;

  return new;
end;
$$;
