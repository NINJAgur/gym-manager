import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chevStyle, s } from '../lib/css';
import { formatWeight, initials } from '../lib/format';
import { T, dayLabel, groupLabel } from '../i18n/he';
import {
  useAddProgramItem,
  useDeleteProgram,
  useDeleteProgramItem,
  useExercises,
  useTrainees,
} from '../hooks/useTrainer';
import { useExerciseHistory, usePrograms, useSetNumbers } from '../hooks/usePrograms';
import type { Program, ProgramItem, TraineeOverview } from '../lib/types';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { Sheet } from '../components/Sheet';
import { BottomNav } from '../components/BottomNav';
import { TrainerHeader } from '../components/TrainerHeader';
import { Stepper } from '../components/Stepper';
import { WeightChart } from '../components/WeightChart';
import { useDebouncedSave } from '../hooks/useDebouncedSave';

const STATUS = {
  active: { label: T.statusActive, style: 'background:#e6f6ea;color:#1c8a3e' },
  pending: { label: T.statusPending, style: 'background:#fff3d6;color:#946200' },
  deactivated: { label: T.statusDeactivated, style: 'background:#eceef0;color:#9ea1a7' },
} as const;

export function TrainerTrainees() {
  const { data: trainees, isPending } = useTrainees();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Screen>
      <TrainerHeader title={T.traineesTitle} />

      <div
        className="scr"
        style={s(
          'flex:1;min-height:0;overflow-y:auto;padding:0 18px 96px;display:flex;flex-direction:column;gap:12px',
        )}
      >
        {(trainees ?? []).map((trainee, index) => (
          <TraineeCard
            key={trainee.id}
            trainee={trainee}
            index={index}
            open={expanded === trainee.id}
            onToggle={() => setExpanded((prev) => (prev === trainee.id ? null : trainee.id))}
          />
        ))}
        {(trainees?.length ?? 0) === 0 && (
          <span style={s('font:400 12px/1.6;color:#8b8f96;text-align:center;padding:20px 0')}>
            {isPending ? T.loading : T.noTrainees}
          </span>
        )}
      </div>

      <BottomNav />
    </Screen>
  );
}

function TraineeCard({
  trainee,
  index,
  open,
  onToggle,
}: {
  trainee: TraineeOverview;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  const { data: programs } = usePrograms(trainee.id, open);
  const status = STATUS[trainee.status] ?? STATUS.active;
  const firstName = (trainee.full_name ?? '').split(' ')[0];

  return (
    <div
      style={s(
        'flex:none;border-radius:18px;background:#fff;box-shadow:var(--shadow-card);overflow:visible;animation:fadeUp .4s both;animation-delay:' +
          index * 55 +
          'ms',
      )}
    >
      <Press
        onClick={onToggle}
        style={s('display:flex;align-items:center;gap:13px;padding:14px 16px;cursor:pointer')}
      >
        <div
          style={s(
            'flex:none;width:44px;height:44px;border-radius:50%;background:#eceef0;display:flex;align-items:center;justify-content:center;font:700 13px/1;color:#5c5f66',
          )}
        >
          {initials(trainee.full_name ?? trainee.email)}
        </div>
        <div style={s('flex:1;display:flex;flex-direction:column;gap:6px;min-width:0')}>
          <span style={s('font:600 15px/1')}>{trainee.full_name ?? trainee.email}</span>
          <div style={s('display:flex;align-items:center;gap:6px;flex-wrap:wrap')}>
            <span style={s('font:600 9.5px/1;border-radius:7px;padding:5px 8px;' + status.style)}>
              {status.label}
            </span>
            {(programs ?? []).map((program) => (
              <span
                key={program.id}
                style={s('font:600 9.5px/1;border-radius:7px;padding:5px 8px;background:#eceef0;color:#5c5f66')}
              >
                {program.name}
              </span>
            ))}
          </div>
        </div>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ea1a7"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={chevStyle(open)}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Press>

      {open && (
        <div
          style={s(
            'padding:2px 16px 16px;display:flex;flex-direction:column;gap:14px;animation:fadeUp .25s ease both',
          )}
        >
          {(programs ?? []).map((program) => (
            <ProgramBlock key={program.id} program={program} traineeId={trainee.id} />
          ))}
          {(programs?.length ?? 0) === 0 && (
            <span style={s('font:400 11.5px/1.6;color:#8b8f96;text-align:center')}>
              {T.noPrograms}
            </span>
          )}
          <Press
            onClick={() => navigate(`/trainer/program/new?trainee=${trainee.id}`)}
            style={s(
              'text-align:center;padding:12px 0;border-radius:14px;border:1.5px dashed #c9cbce;color:#5c5f66;font:700 12.5px/1;cursor:pointer',
            )}
            activeStyle={s('transform:scale(.98)')}
          >
            {T.newProgramFor}
            {firstName}
          </Press>
        </div>
      )}
    </div>
  );
}

function ProgramBlock({ program, traineeId }: { program: Program; traineeId: string }) {
  const navigate = useNavigate();
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [armed, setArmed] = useState(false);
  const { data: exercises } = useExercises();
  const addItem = useAddProgramItem();
  const removeProgram = useDeleteProgram();

  // Deleting a program takes its items with it, so it asks twice. Disarms on
  // its own rather than staying primed.
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  // Already in the program, so the picker does not offer a duplicate.
  const taken = new Set(program.items.map((item) => item.exercise_id));
  const available = (exercises ?? []).filter((exercise) => !taken.has(exercise.id));

  return (
    <div style={s('border-radius:14px;background:#f4f5f7;overflow:hidden')}>
      <div style={s('display:flex;align-items:center;gap:8px;padding:11px 13px')}>
        <span style={s('flex:1;font:700 12.5px/1;min-width:0')}>{program.name}</span>
        {dayLabel(program.day_of_week) && (
          <span style={s('font:500 9.5px/1;color:#8b8f96')}>{dayLabel(program.day_of_week)}</span>
        )}
        <Press
          title={T.editProgram}
          onClick={() => navigate(`/trainer/program/new?trainee=${traineeId}&program=${program.id}`)}
          style={s(
            'flex:none;width:26px;height:26px;border-radius:50%;background:#eceef0;color:#5c5f66;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease',
          )}
          activeStyle={s('transform:scale(.9)')}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </Press>
        <Press
          title={armed ? T.confirmDelete : T.removeProgram}
          onClick={() => {
            if (armed) removeProgram.mutate({ programId: program.id, traineeId });
            else setArmed(true);
          }}
          style={s(
            'flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease;' +
              (armed ? 'background:#e0231a;color:#fff' : 'background:#fdeceb;color:#e0231a'),
          )}
          activeStyle={s('transform:scale(.9)')}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            {armed ? (
              <path d="m4 12.5 5 5L20 6.5" />
            ) : (
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
            )}
          </svg>
        </Press>
      </div>

      {program.items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          traineeId={traineeId}
          open={openRow === item.id}
          onToggle={() => setOpenRow((prev) => (prev === item.id ? null : item.id))}
        />
      ))}

      <Press
        onClick={() => setPicking(true)}
        style={s('display:flex;align-items:center;gap:8px;padding:11px 13px;cursor:pointer;color:#b81b13')}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span style={s('font:700 12px/1')}>{T.addExercise}</span>
      </Press>

      {picking && (
        <Sheet title={T.pickFromLibrary} onClose={() => setPicking(false)}>
          <div
            className="scr"
            style={s('flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px')}
          >
            {available.map((exercise) => (
              <Press
                key={exercise.id}
                onClick={() => {
                  addItem.mutate({
                    traineeId,
                    programId: program.id,
                    exerciseId: exercise.id,
                    position: program.items.length,
                  });
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
            {available.length === 0 && (
              <span style={s('font:400 12px/1.6;color:#8b8f96;text-align:center;padding:12px 0')}>
                {T.emptyLibrary}
              </span>
            )}
          </div>
        </Sheet>
      )}
    </div>
  );
}

function ItemRow({
  item,
  traineeId,
  open,
  onToggle,
}: {
  item: ProgramItem;
  traineeId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const setNumbers = useSetNumbers();
  const removeItem = useDeleteProgramItem();
  const { data: history } = useExerciseHistory(open ? traineeId : undefined, item.exercise_id);

  // Both steppers share one debounced commit, so adjusting weight then reps
  // is a single write rather than a race between two.
  const [numbers, setNumbersLocal] = useDebouncedSave(
    { weight: item.weight, reps: item.reps },
    ({ weight, reps }) =>
      setNumbers.mutate({ traineeId, itemId: item.id, exerciseId: item.exercise_id, weight, reps }),
  );

  return (
    <div>
      <Press
        onClick={onToggle}
        style={s(
          'display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:pointer' +
            (open ? ';background:#eceef0' : ''),
        )}
      >
        <div style={s('flex:1;display:flex;flex-direction:column;gap:4px;min-width:0')}>
          <span
            style={s('font:600 13px/1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}
          >
            {item.exercise.name}
          </span>
          <span style={s('font:400 10px/1;color:#8b8f96')}>
            {groupLabel(item.exercise.category)}
          </span>
        </div>
        <div className="num" style={s('flex:none;display:flex;align-items:baseline;gap:8px')}>
          <span style={s('font:700 13.5px/1;font-variant-numeric:tabular-nums')}>
            {formatWeight(numbers.weight)} ק"ג
          </span>
          <span style={s('font:500 12px/1;color:#8b8f96;font-variant-numeric:tabular-nums')}>
            × {numbers.reps}
          </span>
        </div>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ea1a7"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={chevStyle(open)}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Press>

      {open && (
        <div
          style={s(
            'padding:6px 12px 14px;display:flex;flex-direction:column;gap:16px;animation:fadeUp .25s ease both',
          )}
        >
          <Stepper
            label={T.weight}
            value={numbers.weight}
            onChange={(weight) => setNumbersLocal({ ...numbers, weight })}
          />
          <Stepper
            label={T.reps}
            value={numbers.reps}
            step={1}
            onChange={(reps) => setNumbersLocal({ ...numbers, reps })}
          />

          <div style={s('display:flex;flex-direction:column;gap:8px')}>
            <span style={s('font:700 10px/1;color:#5c5f66')}>{T.progressChart}</span>
            <div style={s('background:#fff;border-radius:14px;padding:10px 10px 4px')}>
              <WeightChart entries={history ?? []} height={88} />
            </div>
          </div>

          <Press
            onClick={() => removeItem.mutate({ itemId: item.id, traineeId })}
            style={s(
              'text-align:center;padding:10px 0;border-radius:12px;background:#fdeceb;color:#b81b13;font:700 11.5px/1;cursor:pointer',
            )}
            activeStyle={s('transform:scale(.98)')}
          >
            {T.removeFromProgram}
          </Press>
        </div>
      )}
    </div>
  );
}
