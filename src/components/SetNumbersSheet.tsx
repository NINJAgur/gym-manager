import { useState } from 'react';
import { s } from '../lib/css';
import { formatWeight } from '../lib/format';
import { useLang } from '../i18n/LangProvider';
import { useExerciseHistory } from '../hooks/useTrainee';
import { useSetNumbers } from '../hooks/useTrainer';
import type { AssignedExercise } from '../lib/types';
import { Sheet } from './Sheet';
import { Stepper } from './Stepper';
import { HistoryList } from './HistoryList';
import { Pressable } from './Pressable';

const WEIGHT_STEP = 2.5;

interface Props {
  traineeId: string;
  exercise: AssignedExercise;
  onClose: () => void;
}

/** The steppers live here, on the trainer's side. Saving appends to the
   exercise's record history, which is shown underneath. */
export function SetNumbersSheet({ traineeId, exercise, onClose }: Props) {
  const { tr, groupLabel } = useLang();
  const { data: history } = useExerciseHistory(traineeId, exercise.id);
  const setNumbers = useSetNumbers();

  const [weight, setWeight] = useState(exercise.weight ?? 0);
  const [reps, setReps] = useState(exercise.reps ?? 0);

  const dirty = weight !== (exercise.weight ?? 0) || reps !== (exercise.reps ?? 0);

  const onSave = () => {
    setNumbers.mutate(
      { traineeId, exerciseId: exercise.id, weight, reps },
      { onSuccess: onClose },
    );
  };

  return (
    <Sheet
      kicker={groupLabel(exercise.category)}
      title={exercise.name}
      onClose={onClose}
      footer={
        <div style={s('display:flex;gap:8px')}>
          <Pressable
            className="btn btn-primary"
            onClick={onSave}
            disabled={setNumbers.isPending || !dirty}
            style={s(
              'flex:1;height:50px;justify-content:flex-start;background:var(--color-accent);color:var(--color-bg);display:flex;align-items:center;padding:0 18px;font:700 14.5px/1 Archivo,sans-serif;cursor:pointer;transition:transform .14s ease,background .14s ease',
            )}
            hoverStyle={s('background:var(--color-accent-600)')}
            activeStyle={s('transform:scale(.98);background:var(--color-accent-700)')}
          >
            {setNumbers.isPending ? tr.saving : setNumbers.isError ? tr.saveFailed : tr.saveWord}
          </Pressable>
          <Pressable
            className="btn btn-secondary"
            onClick={onClose}
            style={s(
              'flex:none;height:50px;justify-content:flex-start;border:1px solid var(--color-text);display:flex;align-items:center;padding:0 18px;font:600 14.5px/1 Archivo,sans-serif;cursor:pointer;transition:transform .14s ease,background .14s ease',
            )}
            hoverStyle={s('background:var(--color-neutral-200)')}
            activeStyle={s('transform:scale(.98)')}
          >
            {tr.cancelWord}
          </Pressable>
        </div>
      }
    >
      <div
        className="scr"
        style={s(
          'flex:1;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:16px',
        )}
      >
        <Stepper
          label={tr.currentWeight}
          record={`${tr.recordWord} ${exercise.weight === null ? tr.dash : `${formatWeight(exercise.weight)} kg`}`}
          value={formatWeight(weight)}
          unit={`kg · ${tr.stepWord} ${WEIGHT_STEP}`}
          onDecrement={() => setWeight((w) => Math.max(0, w - WEIGHT_STEP))}
          onIncrement={() => setWeight((w) => w + WEIGHT_STEP)}
        />
        <Stepper
          label={tr.currentReps}
          record={`${tr.recordWord} ${exercise.reps === null ? tr.dash : exercise.reps}`}
          value={String(reps)}
          unit={`${tr.repsWord} · ${tr.stepWord} 1`}
          onDecrement={() => setReps((r) => Math.max(0, r - 1))}
          onIncrement={() => setReps((r) => r + 1)}
        />
        <HistoryList entries={history} />
      </div>
    </Sheet>
  );
}
