import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chevStyle, panelStyle, s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';
import { useDeleteExercise, useMasterExercises } from '../hooks/useTrainer';
import type { Exercise } from '../lib/types';
import { Screen } from '../components/Screen';
import { Pressable } from '../components/Pressable';
import { ACTION_ACTIVE, ACTION_HOVER, IconCircle, action } from '../components/CircleButton';

export function ExerciseCatalogue() {
  const { tr, groupLabel } = useLang();
  const navigate = useNavigate();
  const { data: exercises, isPending } = useMasterExercises();
  const remove = useDeleteExercise();

  const [opened, setOpened] = useState<Record<string, boolean>>({});
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
      <div
        style={s(
          'flex:none;position:relative;z-index:3;background:var(--color-bg);border-bottom:2px solid var(--color-text);padding:34px 22px 14px',
        )}
      >
        <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:12px')}>
          <div style={s('display:flex;align-items:center;gap:12px;min-width:0')}>
            <IconCircle onClick={() => navigate('/trainer')} size={34} scale={0.92} mirror>
              <path d="m15 6-6 6 6 6" />
            </IconCircle>
            <div style={s('display:flex;flex-direction:column;gap:5px;min-width:0')}>
              <span
                style={s(
                  'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--color-neutral-600)',
                )}
              >
                {tr.trainerKicker}
              </span>
              <span style={s('font:800 22px/1.05 Archivo,sans-serif;letter-spacing:-.02em')}>
                {tr.exerciseLibrary}
              </span>
            </div>
          </div>
        </div>
        <Pressable
          className="btn btn-primary btn-block"
          onClick={() => navigate('/trainer/exercises/new')}
          style={s(action(46) + ';margin-top:14px;padding:0 16px')}
          hoverStyle={s(ACTION_HOVER)}
          activeStyle={s(ACTION_ACTIVE)}
        >
          <span style={s('font:700 14px/1 Archivo,sans-serif')}>{tr.newExercise}</span>
          <svg
            width="19"
            height="19"
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

      <div
        className="scr"
        style={s(
          'flex:1;min-height:0;overflow-y:auto;scrollbar-width:none;padding-bottom:28px',
        )}
      >
        {groups.map((group, gi) => {
          const open = Boolean(opened[group.name]);
          return (
            <div
              key={group.name}
              style={s('animation:fadeUp .4s both;animation-delay:' + gi * 55 + 'ms')}
            >
              <Pressable
                onClick={() => setOpened((prev) => ({ ...prev, [group.name]: !prev[group.name] }))}
                style={s(
                  'display:flex;align-items:center;justify-content:space-between;padding:14px 22px;cursor:pointer;background:var(--color-neutral-200);border-bottom:1px solid color-mix(in srgb, var(--color-text) 16%, transparent);transition:background .14s ease',
                )}
                hoverStyle={s('background:var(--color-neutral-300)')}
              >
                <div style={s('display:flex;align-items:center;gap:10px')}>
                  <span
                    style={s(
                      'font:700 12px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase',
                    )}
                  >
                    {groupLabel(group.name)}
                  </span>
                  <span
                    style={s(
                      'font:500 11px/1 Archivo,sans-serif;color:var(--color-neutral-600);font-variant-numeric:tabular-nums',
                    )}
                  >
                    {group.items.length}
                  </span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={chevStyle(open)}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Pressable>

              <div style={panelStyle(open)}>
                <div style={s('overflow:hidden')}>
                  {group.items.map((exercise) => (
                    <div
                      key={exercise.id}
                      style={s(
                        'display:flex;align-items:center;gap:10px;padding:13px 22px;border-bottom:1px solid color-mix(in srgb, var(--color-text) 12%, transparent)',
                      )}
                    >
                      <span
                        dir="auto"
                        style={s(
                          'flex:1;font:600 14px/1.2 Archivo,sans-serif;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
                        )}
                      >
                        {exercise.name}
                      </span>
                      <IconCircle
                        onClick={() => navigate(`/trainer/exercises/${exercise.id}`)}
                        size={32}
                        title={tr.editExercise}
                      >
                        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </IconCircle>
                      <IconCircle
                        danger
                        size={32}
                        title={armed === exercise.id ? tr.confirmDelete : tr.removeExercise}
                        onClick={() => {
                          if (armed === exercise.id) remove.mutate(exercise.id);
                          else setArmed(exercise.id);
                        }}
                      >
                        {armed === exercise.id ? (
                          <path d="m4 12.5 5 5L20 6.5" />
                        ) : (
                          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                        )}
                      </IconCircle>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div
          style={s(
            'padding:18px 22px;font:400 11.5px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)',
          )}
        >
          {isPending ? tr.loading : groups.length ? tr.libraryFooter : tr.emptyCatalogue}
        </div>
      </div>
    </Screen>
  );
}
