import { useEffect, useState } from 'react';
import { chevStyle, panelStyle, s } from '../lib/css';
import { daysSince, formatWeight, shortDate } from '../lib/format';
import { useLang } from '../i18n/LangProvider';
import { useExerciseHistory } from '../hooks/useTrainee';
import { useSetNumbers, useTraineeExercises, useUnassignExercise } from '../hooks/useTrainer';
import type { AssignedExercise, TraineeOverview } from '../lib/types';
import { Avatar } from './Avatar';
import { Pressable } from './Pressable';
import { RecordChart } from './RecordChart';

interface Props {
  trainee: TraineeOverview;
  index: number;
  open: boolean;
  onToggle: () => void;
  onAssign: () => void;
}

export function TraineeCard({ trainee, index, open, onToggle, onAssign }: Props) {
  const { tr } = useLang();
  const { data: rows } = useTraineeExercises(trainee.id, open);
  const [openRow, setOpenRow] = useState<string | null>(null);

  const days = trainee.last_logged_at ? daysSince(trainee.last_logged_at) : null;
  const fresh = days !== null && days <= 3;
  const relative =
    days === null
      ? tr.never
      : days === 0
        ? tr.today
        : days === 1
          ? tr.yesterday
          : `${days} ${tr.daysAgo}`;
  const firstName = (trainee.full_name ?? trainee.email ?? '').split(' ')[0];

  return (
    <div
      style={s(
        'border:1px solid color-mix(in srgb, var(--color-text) 20%, transparent);background:var(--color-neutral-100);animation:fadeUp .4s both;animation-delay:' +
          index * 55 +
          'ms',
      )}
    >
      <Pressable
        onClick={onToggle}
        style={s(
          'display:flex;align-items:center;gap:13px;padding:15px 16px;cursor:pointer;transition:background .14s ease',
        )}
        hoverStyle={s('background:var(--color-neutral-200)')}
      >
        <Avatar name={trainee.full_name ?? trainee.email} size={46} />
        <div style={s('flex:1;display:flex;flex-direction:column;gap:6px;min-width:0')}>
          <span style={s('font:600 15.5px/1 Archivo,sans-serif;letter-spacing:-.01em')}>
            {trainee.full_name ?? trainee.email}
          </span>
          <div style={s('display:flex;align-items:center;gap:8px')}>
            <span
              className="tag"
              style={s(
                'font:600 7.5px/1 Archivo,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:5px 7px;white-space:nowrap;' +
                  (fresh
                    ? 'background:var(--color-accent-200);color:var(--color-accent-700)'
                    : 'background:var(--color-neutral-200);color:var(--color-neutral-600)'),
              )}
            >
              {tr.updatedWord} {relative}
            </span>
            <span
              style={s(
                'font:400 9px/1 Archivo,sans-serif;color:var(--color-neutral-600);white-space:nowrap',
              )}
            >
              {trainee.exercise_count} {tr.exercisesWord}
            </span>
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-neutral-600)"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={chevStyle(open)}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Pressable>

      <div style={panelStyle(open)}>
        <div style={s('overflow:hidden')}>
          <div
            style={s(
              'border-top:1px solid color-mix(in srgb, var(--color-text) 16%, transparent);padding:14px 16px 16px;display:flex;flex-direction:column;gap:14px',
            )}
          >
            <div style={s('display:flex;align-items:baseline;justify-content:space-between')}>
              <span
                style={s(
                  'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-600)',
                )}
              >
                {tr.assignedExercises}
              </span>
            </div>

            <div style={s('display:flex;flex-direction:column;gap:8px')}>
              {(rows ?? []).map((row) => (
                <AssignedRow
                  key={row.id}
                  traineeId={trainee.id}
                  row={row}
                  open={openRow === row.id}
                  onToggle={() => setOpenRow((prev) => (prev === row.id ? null : row.id))}
                />
              ))}
            </div>

            <Pressable
              onClick={onAssign}
              style={s(
                'display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px dashed var(--color-accent-700);color:var(--color-accent-700);cursor:pointer;transition:background .14s ease',
              )}
              hoverStyle={s('background:var(--color-accent-100)')}
            >
              <div
                style={s(
                  'flex:none;width:22px;height:22px;border-radius:50%;background:var(--color-accent);color:var(--color-bg);display:flex;align-items:center;justify-content:center',
                )}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span style={s('font:700 12.5px/1 Archivo,sans-serif')}>
                {tr.addExerciseFor} {firstName}
              </span>
            </Pressable>
          </div>
        </div>
      </div>
    </div>
  );
}

/** One assigned exercise. The design has no save button — the steppers are the
   edit surface — so changes are written after a short settle. */
function AssignedRow({
  traineeId,
  row,
  open,
  onToggle,
}: {
  traineeId: string;
  row: AssignedExercise;
  open: boolean;
  onToggle: () => void;
}) {
  const { tr, lang, groupLabel } = useLang();
  const { data: history } = useExerciseHistory(traineeId, open ? row.id : undefined);
  const setNumbers = useSetNumbers();
  const unassign = useUnassignExercise();

  const [weight, setWeight] = useState(row.weight ?? 0);
  const [reps, setReps] = useState(row.reps ?? 0);

  const dirty = weight !== (row.weight ?? 0) || reps !== (row.reps ?? 0);

  // A prescription of zero reps says nothing, and mid-edit the trainer passes
  // through one on the way from "just assigned" to a real number. Wait for it.
  const worthSaving = dirty && reps > 0;

  useEffect(() => {
    if (!worthSaving) return;
    const timer = setTimeout(
      () => setNumbers.mutate({ traineeId, exerciseId: row.id, weight, reps }),
      900,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, reps, worthSaving, traineeId, row.id]);

  return (
    <div>
      <div
        onClick={onToggle}
        style={s(
          'display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--color-bg);border:1px solid color-mix(in srgb, var(--color-text) 18%, transparent);cursor:pointer;transition:background .14s ease' +
            (open ? ';background:var(--color-neutral-200)' : ''),
        )}
      >
        <div style={s('flex:1;display:flex;flex-direction:column;gap:5px;min-width:0')}>
          <span
            dir="auto"
            style={s(
              'font:600 13.5px/1.2 Archivo,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
            )}
          >
            {row.name}
          </span>
          <span
            style={s(
              'font:400 10px/1 Archivo,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-600)',
            )}
          >
            {groupLabel(row.category)} ·{' '}
            {row.logged_at ? shortDate(row.logged_at, lang) : tr.noRecord}
          </span>
        </div>
        <div
          className="num"
          style={s('flex:none;display:flex;align-items:baseline;gap:10px')}
        >
          <span style={s('font:700 14px/1 Archivo,sans-serif;font-variant-numeric:tabular-nums')}>
            {formatWeight(weight)} kg
          </span>
          <span
            style={s(
              'font:500 12px/1 Archivo,sans-serif;color:var(--color-neutral-700);font-variant-numeric:tabular-nums',
            )}
          >
            × {reps}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-neutral-600)"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={chevStyle(open)}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <div style={panelStyle(open)}>
        <div style={s('overflow:hidden')}>
          <div style={s('padding:16px 4px 6px;display:flex;flex-direction:column;gap:18px')}>
            <InlineStepper
              label={tr.weightLabel}
              unit="kg"
              value={formatWeight(weight)}
              onDecrement={() => setWeight((w) => Math.max(0, w - 2.5))}
              onIncrement={() => setWeight((w) => w + 2.5)}
            />
            <InlineStepper
              label={tr.repsLabel}
              unit={tr.repsWord}
              value={String(reps)}
              onDecrement={() => setReps((r) => Math.max(0, r - 1))}
              onIncrement={() => setReps((r) => r + 1)}
            />

            <div style={s('display:flex;flex-direction:column;gap:8px')}>
              <span
                style={s(
                  'font:700 10px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)',
                )}
              >
                {tr.recordHistory}
              </span>
              <RecordChart entries={history ?? []} />
            </div>

            <Pressable
              onClick={() => unassign.mutate({ traineeId, exerciseId: row.id })}
              style={s(
                'text-align:center;padding:10px 0;border:1px solid var(--color-accent);color:var(--color-accent-700);font:700 11.5px/1 Archivo,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .14s ease;display:flex;align-items:center;justify-content:center',
              )}
              hoverStyle={s('background:var(--color-accent-100)')}
            >
              {tr.removeExercise}
            </Pressable>
          </div>
        </div>
      </div>
    </div>
  );
}

const CIRCLE_56 =
  'flex:none;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1),background .14s ease;';

function InlineStepper({
  label,
  unit,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  unit: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div style={s('display:flex;flex-direction:column;gap:11px')}>
      <span
        style={s(
          'font:700 10px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)',
        )}
      >
        {label}
      </span>
      <div style={s('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
        <Pressable
          onClick={onDecrement}
          style={s(CIRCLE_56 + 'border:2px solid var(--color-text);background:var(--color-bg)')}
          hoverStyle={s('background:var(--color-neutral-200)')}
          activeStyle={s('transform:scale(.88);background:var(--color-neutral-300)')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M5 12h14" />
          </svg>
        </Pressable>
        <div
          style={s(
            'flex:1;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px',
          )}
        >
          <span
            style={s(
              'font:800 32px/1 Archivo,sans-serif;letter-spacing:-.03em;font-variant-numeric:tabular-nums',
            )}
          >
            {value}
          </span>
          <span
            style={s(
              'font:600 9px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-600)',
            )}
          >
            {unit}
          </span>
        </div>
        <Pressable
          onClick={onIncrement}
          style={s(CIRCLE_56 + 'background:var(--color-accent);color:var(--color-bg)')}
          hoverStyle={s('background:var(--color-accent-600)')}
          activeStyle={s('transform:scale(.88);background:var(--color-accent-700)')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Pressable>
      </div>
    </div>
  );
}
