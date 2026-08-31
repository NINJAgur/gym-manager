import { useMemo, useState } from 'react';
import { s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';
import { useAssignExercises, useMasterExercises, useTraineeExercises } from '../hooks/useTrainer';
import type { TraineeOverview } from '../lib/types';
import { Sheet } from './Sheet';
import { Pressable } from './Pressable';

interface Props {
  trainee: TraineeOverview;
  onClose: () => void;
}

/** v2's master-list sheet: checkbox rows over the catalogue, minus whatever
   this trainee already has. */
export function AssignSheet({ trainee, onClose }: Props) {
  const { tr, groupLabel } = useLang();
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');

  const { data: master } = useMasterExercises();
  const { data: assigned } = useTraineeExercises(trainee.id, true);
  const assign = useAssignExercises();

  const available = useMemo(() => {
    const taken = new Set((assigned ?? []).map((ex) => ex.id));
    const needle = query.trim().toLowerCase();
    return (master ?? [])
      .filter((ex) => !taken.has(ex.id))
      .filter(
        (ex) =>
          !needle ||
          ex.name.toLowerCase().includes(needle) ||
          ex.category.toLowerCase().includes(needle),
      );
  }, [master, assigned, query]);

  const pickedIds = Object.keys(picked).filter((id) => picked[id]);
  const firstName = (trainee.full_name ?? trainee.email ?? '').split(' ')[0];

  const onAssign = () => {
    if (pickedIds.length === 0) return onClose();
    assign.mutate({ traineeId: trainee.id, exerciseIds: pickedIds }, { onSuccess: onClose });
  };

  return (
    <Sheet
      kicker={tr.masterList}
      title={`${tr.assignTo} ${firstName}`}
      onClose={onClose}
      footer={
        <div style={s('display:flex;flex-direction:column;gap:10px')}>
          <span style={s('font:500 11.5px/1 Archivo,sans-serif;color:var(--color-neutral-600)')}>
            {assign.isError
              ? tr.assignFailed
              : `${pickedIds.length} ${pickedIds.length === 1 ? tr.selectedOne : tr.selectedMany}`}
          </span>
          <div style={s('display:flex;gap:8px')}>
            <Pressable
              className="btn btn-primary"
              onClick={onAssign}
              disabled={assign.isPending}
              style={s(
                'flex:1;height:50px;justify-content:flex-start;background:var(--color-accent);color:var(--color-bg);display:flex;align-items:center;padding:0 18px;font:700 14.5px/1 Archivo,sans-serif;cursor:pointer;transition:transform .14s ease,background .14s ease',
              )}
              hoverStyle={s('background:var(--color-accent-600)')}
              activeStyle={s('transform:scale(.98);background:var(--color-accent-700)')}
            >
              {assign.isPending ? tr.saving : tr.assignWord}
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
        </div>
      }
    >
      <div className="input" style={s('display:flex;align-items:center;gap:9px;height:42px;padding:0 12px')}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-neutral-600)"
          strokeWidth="2"
          strokeLinecap="round"
          style={s('flex:none')}
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          className="bare"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr.searchCatalogue}
        />
      </div>

      <div
        className="scr"
        style={s(
          'flex:1;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:8px;border-top:2px solid var(--color-text);padding-top:12px',
        )}
      >
        {available.map((exercise) => {
          const on = Boolean(picked[exercise.id]);
          return (
            <div
              key={exercise.id}
              onClick={() => setPicked((prev) => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
              style={s(
                'display:flex;align-items:center;gap:12px;padding:13px 14px;cursor:pointer;border:1px solid ' +
                  (on ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 18%, transparent)') +
                  ';background:' +
                  (on ? 'var(--color-accent-100)' : 'var(--color-neutral-100)') +
                  ';transition:border-color .14s ease,background .14s ease,transform .14s ease',
              )}
            >
              <div
                style={s(
                  'flex:none;width:22px;height:22px;border:1.5px solid ' +
                    (on ? 'var(--color-accent)' : 'var(--color-divider)') +
                    ';background:' +
                    (on ? 'var(--color-accent)' : 'transparent') +
                    ';display:flex;align-items:center;justify-content:center',
                )}
              >
                {on && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-bg)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                )}
              </div>
              <div style={s('flex:1;display:flex;flex-direction:column;gap:4px;min-width:0')}>
                <span dir="auto" style={s('font:600 14px/1.2 Archivo,sans-serif')}>
                  {exercise.name}
                </span>
                <span
                  style={s(
                    'font:400 10px/1 Archivo,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-600)',
                  )}
                >
                  {groupLabel(exercise.category)}
                </span>
              </div>
            </div>
          );
        })}
        {available.length === 0 && (
          <span style={s('font:400 11.5px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)')}>
            {tr.noneLeft}
          </span>
        )}
      </div>
    </Sheet>
  );
}
