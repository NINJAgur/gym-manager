import { useMemo, useState } from 'react';
import { s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';
import { useAssignExercises, useMasterExercises, useTraineeExercises } from '../hooks/useTrainer';
import type { TraineeOverview } from '../lib/types';
import { Pressable } from './Pressable';

interface Props {
  trainee: TraineeOverview;
  onClose: () => void;
}

/** Fixed overlay on top of the dashboard, exactly as designed: master list
   minus what the trainee already has, multi-select, insert on Done. */
export function AssignExerciseModal({ trainee, onClose }: Props) {
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

  const onDone = () => {
    if (pickedIds.length === 0) {
      onClose();
      return;
    }
    assign.mutate({ traineeId: trainee.id, exerciseIds: pickedIds }, { onSuccess: onClose });
  };

  return (
    <div
      style={s(
        'position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.8);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:fadeIn .26s ease both',
      )}
    >
      <div
        style={s(
          'width:100%;max-height:100%;background:#000;border:1px solid var(--color-accent);display:flex;flex-direction:column;animation:cardIn .34s cubic-bezier(.22,1,.36,1) both',
        )}
      >
        <div
          style={s(
            'padding:20px 20px 16px;border-bottom:1px solid var(--color-accent);display:flex;align-items:flex-start;justify-content:space-between;gap:12px',
          )}
        >
          <div style={s('display:flex;flex-direction:column;gap:6px')}>
            <span
              style={s(
                'font:600 9px/1 Archivo,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--color-accent)',
              )}
            >
              {tr.masterList}
            </span>
            <span
              style={s('font:800 20px/1.06 Archivo,sans-serif;letter-spacing:-.02em;color:#fff')}
            >
              {tr.assignTo} {firstName}
            </span>
          </div>
          <svg
            onClick={onClose}
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.6"
            strokeLinecap="round"
            style={s('flex:none;margin-top:4px;cursor:pointer')}
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </div>

        <div
          style={s(
            'padding:14px 20px;border-bottom:1px solid var(--color-accent-900);display:flex;align-items:center;gap:10px',
          )}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.2"
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
            placeholder={tr.searchMaster}
          />
        </div>

        <div className="scr" style={s('flex:1;overflow-y:auto;scrollbar-width:none')}>
          {available.map((exercise) => {
            const on = Boolean(picked[exercise.id]);
            return (
              <div
                key={exercise.id}
                onClick={() => setPicked((prev) => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                style={s(
                  'display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;border-bottom:1px solid #1c1c1c;transition:background .14s ease;background:' +
                    (on ? '#141414' : '#000'),
                )}
              >
                <div style={s('flex:1;display:flex;flex-direction:column;gap:5px;min-width:0')}>
                  <span style={s('font:600 14px/1.2 Archivo,sans-serif;color:#fff')}>
                    {exercise.name}
                  </span>
                  <span
                    style={s(
                      'font:400 10px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-600)',
                    )}
                  >
                    {groupLabel(exercise.category)}
                  </span>
                </div>
                <div
                  style={s(
                    'flex:none;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background .16s ease,color .16s ease,transform .16s cubic-bezier(.34,1.5,.5,1);' +
                      (on
                        ? 'background:var(--color-accent);color:#fff'
                        : 'background:transparent;color:var(--color-accent);border:1px solid var(--color-accent)'),
                  )}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  >
                    <path d={on ? 'm4 12.5 5 5L20 6.5' : 'M12 5v14M5 12h14'} />
                  </svg>
                </div>
              </div>
            );
          })}
          {available.length === 0 && (
            <div
              style={s(
                'padding:18px 20px;font:400 11.5px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)',
              )}
            >
              {tr.noneLeft}
            </div>
          )}
        </div>

        <div
          style={s(
            'padding:16px 20px 18px;border-top:1px solid var(--color-accent);display:flex;align-items:center;justify-content:space-between;gap:12px',
          )}
        >
          <span style={s('font:500 11.5px/1 Archivo,sans-serif;color:var(--color-neutral-500)')}>
            {assign.isError
              ? tr.assignFailed
              : `${pickedIds.length} ${pickedIds.length === 1 ? tr.assignedOne : tr.assignedMany}`}
          </span>
          <Pressable
            className="btn btn-primary"
            onClick={onDone}
            disabled={assign.isPending}
            style={s(
              'height:44px;justify-content:flex-start;padding:0 18px;background:var(--color-accent);color:#fff;cursor:pointer;transition:transform .14s ease,background .14s ease',
            )}
            hoverStyle={s('background:var(--color-accent-600)')}
            activeStyle={s('transform:scale(.97);background:var(--color-accent-700)')}
          >
            <span style={s('font:700 14px/1 Archivo,sans-serif')}>
              {assign.isPending ? tr.saving : tr.done}
            </span>
          </Pressable>
        </div>
      </div>
    </div>
  );
}
