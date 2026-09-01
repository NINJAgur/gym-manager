import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { s } from '../lib/css';
import { T, WEEKDAYS, groupLabel } from '../i18n/he';
import { useCreateProgram, useExercises, useTrainees, useUpdateProgram } from '../hooks/useTrainer';
import type { DraftItem } from '../hooks/useTrainer';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { Sheet } from '../components/Sheet';
import { usePrograms } from '../hooks/usePrograms';

/** Build a program and assign it in one go. A program is a named list of
   exercises, optionally pinned to a weekday — a trainee who splits their week
   gets one program per day rather than one program holding every day. */
export function ProgramBuilder() {
  const [params] = useSearchParams();
  const traineeId = params.get('trainee') ?? '';
  const programId = params.get('program');
  const navigate = useNavigate();

  const { data: trainees } = useTrainees();
  const { data: exercises } = useExercises();
  const create = useCreateProgram();
  const update = useUpdateProgram();
  const { data: programs } = usePrograms(traineeId, Boolean(programId));
  const editing = (programs ?? []).find((p) => p.id === programId);

  const [name, setName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [picking, setPicking] = useState(false);

  // Fills the form once the program being edited arrives.
  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setDayOfWeek(editing.day_of_week);
    setItems(
      editing.items.map((item) => ({
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
      })),
    );
  }, [editing]);

  const trainee = (trainees ?? []).find((t) => t.id === traineeId);
  const firstName = (trainee?.full_name ?? '').split(' ')[0];
  const byId = useMemo(
    () => new Map((exercises ?? []).map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const valid = name.trim().length > 0 && items.length > 0 && Boolean(traineeId);

  const patchItem = (index: number, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const saving = create.isPending || update.isPending;
  const failed = create.isError || update.isError;

  const onSave = () => {
    if (!valid) return;
    const draft = { traineeId, name: name.trim(), dayOfWeek, items };
    const done = { onSuccess: () => navigate('/trainer') };
    if (programId) update.mutate({ ...draft, programId }, done);
    else create.mutate(draft, done);
  };

  return (
    <Screen>
      <div style={s('flex:none;display:flex;align-items:center;gap:12px;padding:30px 20px 12px')}>
        <Press
          onClick={() => navigate('/trainer')}
          style={s(
            'flex:none;width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:0 4px 12px -6px rgba(20,20,25,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease',
          )}
          activeStyle={s('transform:scale(.92)')}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#17181c"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Press>
        <div style={s('min-width:0')}>
          <span style={s('font:600 10px/1;color:#8b8f96')}>
            {programId ? T.programForPrefix : T.newProgramFor2}
            {firstName}
          </span>
          <div style={s('font:800 20px/1.1;margin-top:5px')}>
            {programId ? T.editProgram : T.builderTitle}
          </div>
        </div>
      </div>

      <div
        className="scr"
        style={s(
          'flex:1;min-height:0;overflow-y:auto;padding:6px 20px 24px;display:flex;flex-direction:column;gap:18px',
        )}
      >
        <div style={s('display:flex;flex-direction:column;gap:8px')}>
          <label style={s('font:700 10.5px/1;color:#5c5f66')}>{T.programName}</label>
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={T.programNamePlaceholder}
          />
        </div>

        {/* Optional: a program that is not tied to a weekday just has none. */}
        <div style={s('display:flex;flex-direction:column;gap:8px')}>
          <label style={s('font:700 10.5px/1;color:#5c5f66')}>{T.programDay}</label>
          <div style={s('display:flex;flex-wrap:wrap;gap:8px')}>
            {[null, ...WEEKDAYS.keys()].map((day) => (
              <Press
                key={day ?? 'none'}
                onClick={() => setDayOfWeek(day)}
                style={s(
                  'padding:9px 13px;border-radius:11px;font:600 11.5px/1;cursor:pointer;' +
                    (dayOfWeek === day
                      ? 'background:#17181c;color:#fff'
                      : 'background:#fff;color:#17181c'),
                )}
              >
                {day === null ? T.noDay : WEEKDAYS[day]}
              </Press>
            ))}
          </div>
        </div>

        <div
          style={s(
            'flex:none;border-radius:16px;background:#fff;box-shadow:0 6px 18px -14px rgba(20,20,25,.22);overflow:hidden',
          )}
        >
            {/* Same column headers the trainee sees, so the numbers in each
                box are identifiable rather than three bare inputs. */}
            <div
              style={s(
                'display:flex;align-items:center;gap:8px;padding:9px 14px;background:#f9f9fa;border-top:1px solid #f0f1f2;font:600 10px/1;color:#8b8f96',
              )}
            >
              <span style={s('flex:1')}>{T.colExercise}</span>
              <span style={s('width:36px;text-align:center')}>{T.colSets}</span>
              <span style={s('width:44px;text-align:center')}>{T.colReps}</span>
              <span style={s('width:44px;text-align:center')}>{T.colKg}</span>
              {/* Keeps the headers over their columns now the rows end in a
                  remove button. */}
              <span style={s('flex:none;width:24px')} />
            </div>

            {items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                style={s(
                  'flex:none;display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid #f0f1f2',
                )}
              >
                <span
                  style={s(
                    'flex:1;font:600 12.5px/1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
                  )}
                >
                  {byId.get(item.exercise_id)?.name ?? ''}
                </span>
                <NumberCell
                  width={36}
                  value={item.sets}
                  onChange={(sets) => patchItem(itemIndex, { sets })}
                />
                <NumberCell
                  width={44}
                  value={item.reps}
                  onChange={(reps) => patchItem(itemIndex, { reps })}
                />
                <NumberCell
                  width={44}
                  value={item.weight}
                  step={2.5}
                  onChange={(weight) => patchItem(itemIndex, { weight })}
                />
                <Press
                  onClick={() => removeItem(itemIndex)}
                  title={T.removeFromProgram}
                  style={s(
                    'flex:none;width:24px;height:24px;border-radius:50%;background:#fdeceb;color:#b81b13;display:flex;align-items:center;justify-content:center;cursor:pointer',
                  )}
                  activeStyle={s('transform:scale(.9)')}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </Press>
              </div>
            ))}

            <Press
              onClick={() => setPicking(true)}
              style={s(
                'display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid #f0f1f2;color:#b81b13;cursor:pointer',
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span style={s('font:700 11.5px/1')}>{T.addExercise}</span>
            </Press>
        </div>
      </div>

      <div
        style={s(
          'flex:none;padding:16px 20px 26px;background:linear-gradient(to top,#f4f5f7 60%,rgba(244,245,247,0))',
        )}
      >
        <Press
          onClick={onSave}
          disabled={!valid || saving}
          style={s(
            'height:56px;border-radius:18px;background:#e0231a;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
          )}
          activeStyle={s('transform:scale(.97)')}
        >
          <span style={s('font:700 15.5px/1')}>
            {saving ? T.saving : failed ? T.saveFailed : programId ? T.saveChanges : T.saveProgram}
          </span>
        </Press>
      </div>

      {picking && (
        <Sheet title={T.pickFromLibrary} onClose={() => setPicking(false)}>
          <div
            className="scr"
            style={s('flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px')}
          >
            {(exercises ?? []).map((exercise) => (
              <Press
                key={exercise.id}
                onClick={() => {
                  setItems((prev) => [
                    ...prev,
                    { exercise_id: exercise.id, sets: 3, reps: 10, weight: 0 },
                  ]);
                  setPicking(false);
                }}
                style={s(
                  'display:flex;align-items:center;justify-content:space-between;padding:12px 13px;border-radius:14px;background:#f4f5f7;cursor:pointer',
                )}
              >
                <span style={s('font:600 13.5px/1')}>{exercise.name}</span>
                <span style={s('font:500 10px/1;color:#8b8f96')}>
                  {groupLabel(exercise.category)}
                </span>
              </Press>
            ))}
          </div>
        </Sheet>
      )}
    </Screen>
  );
}

function NumberCell({
  value,
  width,
  step = 1,
  onChange,
}: {
  value: number;
  width: number;
  step?: number;
  onChange: (next: number) => void;
}) {
  return (
    <input
      className="cell-input num"
      style={{ width: `${width}px` }}
      inputMode="decimal"
      value={String(value)}
      onChange={(e) => {
        const next = Number(e.target.value.replace(',', '.'));
        if (!Number.isNaN(next) && next >= 0) onChange(next);
      }}
      step={step}
    />
  );
}
