import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chevStyle, s } from '../lib/css';
import { T, groupLabel } from '../i18n/he';
import { useDeleteExercise, useExercises } from '../hooks/useTrainer';
import type { Exercise } from '../lib/types';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { BottomNav } from '../components/BottomNav';
import { TrainerHeader } from '../components/TrainerHeader';

export function ExerciseLibrary() {
  const navigate = useNavigate();
  const { data: exercises, isPending } = useExercises();
  const remove = useDeleteExercise();

  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [armed, setArmed] = useState<string | null>(null);

  // A trash tap arms; the second within three seconds deletes.
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(null), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  const groups = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const exercise of exercises ?? []) {
      const bucket = map.get(exercise.category);
      if (bucket) bucket.push(exercise);
      else map.set(exercise.category, [exercise]);
    }
    return [...map].map(([name, items]) => ({ name, items }));
  }, [exercises]);

  return (
    <Screen>
      <TrainerHeader title={T.libraryTitle}>
        <Press
          onClick={() => navigate('/trainer/exercises/new')}
          style={s(
            'height:48px;border-radius:14px;margin-top:14px;background:#e0231a;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
          )}
          activeStyle={s('transform:scale(.97)')}
        >
          <span style={s('font:700 14px/1')}>{T.newExercise}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Press>
      </TrainerHeader>

      <div
        className="scr"
        style={s(
          'flex:1;min-height:0;overflow-y:auto;padding:0 18px 96px;display:flex;flex-direction:column;gap:12px',
        )}
      >
        {groups.map((group, index) => {
          const open = !closed[group.name];
          return (
            <div
              key={group.name}
              style={s(
                'flex:none;border-radius:18px;background:#fff;box-shadow:var(--shadow-card);overflow:hidden;animation:fadeUp .4s both;animation-delay:' +
                  index * 55 +
                  'ms',
              )}
            >
              <Press
                onClick={() => setClosed((prev) => ({ ...prev, [group.name]: !prev[group.name] }))}
                style={s(
                  'display:flex;align-items:center;justify-content:space-between;padding:13px 16px;cursor:pointer',
                )}
              >
                <div style={s('display:flex;align-items:center;gap:9px')}>
                  <span style={s('font:700 12.5px/1')}>{groupLabel(group.name)}</span>
                  <span
                    className="num"
                    style={s('font:500 11px/1;color:#8b8f96;font-variant-numeric:tabular-nums')}
                  >
                    {group.items.length}
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

              {open &&
                group.items.map((exercise) => (
                  <div
                    key={exercise.id}
                    style={s(
                      'display:flex;align-items:center;gap:10px;padding:11px 16px;border-top:1px solid #f0f1f2;animation:fadeUp .25s ease both',
                    )}
                  >
                    <span
                      style={s(
                        'flex:1;font:600 13.5px/1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
                      )}
                    >
                      {exercise.name}
                    </span>
                    <Press
                      title={T.editExercise}
                      onClick={() => navigate(`/trainer/exercises/${exercise.id}`)}
                      style={s(
                        'flex:none;width:30px;height:30px;border-radius:50%;background:#f4f5f7;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease',
                      )}
                      activeStyle={s('transform:scale(.9)')}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#5c5f66"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </Press>
                    <Press
                      title={armed === exercise.id ? T.confirmDelete : undefined}
                      onClick={() => {
                        if (armed === exercise.id) remove.mutate(exercise.id);
                        else setArmed(exercise.id);
                      }}
                      style={s(
                        'flex:none;width:30px;height:30px;border-radius:50%;background:#fdeceb;color:#e0231a;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease' +
                          (armed === exercise.id ? ';background:#e0231a;color:#fff' : ''),
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
                      >
                        {armed === exercise.id ? (
                          <path d="m4 12.5 5 5L20 6.5" />
                        ) : (
                          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                        )}
                      </svg>
                    </Press>
                  </div>
                ))}
            </div>
          );
        })}
        {groups.length === 0 && (
          <span style={s('font:400 12px/1.6;color:#8b8f96;text-align:center;padding:20px 0')}>
            {isPending ? T.loading : T.emptyLibrary}
          </span>
        )}
      </div>

      <BottomNav />
    </Screen>
  );
}
