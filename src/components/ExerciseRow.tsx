import { s } from '../lib/css';
import { formatWeight, shortDate } from '../lib/format';
import { useLang } from '../i18n/LangProvider';
import type { AssignedExercise } from '../lib/types';

interface Props {
  exercise: AssignedExercise;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

export function ExerciseRow({ exercise, index, selected, onSelect }: Props) {
  const { tr, lang } = useLang();
  const logged = exercise.logged_at;

  return (
    <div
      onClick={onSelect}
      style={s(
        'display:flex;align-items:center;gap:12px;padding:16px 22px;cursor:pointer;border-bottom:1px solid var(--color-accent-900);animation:fadeUp .38s both;animation-delay:' +
          index * 50 +
          'ms;transition:background .14s ease;background:' +
          (selected ? '#1a1a1a' : '#000'),
      )}
    >
      <div style={s('flex:1;display:flex;flex-direction:column;gap:6px;min-width:0')}>
        <span
          style={s('font:600 15px/1.25 Archivo,sans-serif;letter-spacing:-.01em;color:#fff')}
        >
          {exercise.name}
        </span>
        <span style={s('font:400 11.5px/1 Archivo,sans-serif;color:var(--color-neutral-500)')}>
          {logged ? `${tr.updatedWord} ${shortDate(logged, lang)}` : tr.noRecord}
        </span>
      </div>
      <div style={s('flex:none;text-align:end;display:flex;flex-direction:column;gap:6px')}>
        <span
          style={s(
            'font:700 15px/1 Archivo,sans-serif;color:#fff;font-variant-numeric:tabular-nums',
          )}
        >
          {exercise.weight === null ? tr.dash : `${formatWeight(exercise.weight)} kg`}
        </span>
        <span
          style={s(
            'font:500 11.5px/1 Archivo,sans-serif;color:var(--color-neutral-500);font-variant-numeric:tabular-nums',
          )}
        >
          {exercise.reps === null ? '' : `${exercise.reps} ${tr.repsWord}`}
        </span>
      </div>
      <svg
        className="dir-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        style={s('flex:none')}
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </div>
  );
}
