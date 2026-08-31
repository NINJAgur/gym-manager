import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { s } from '../lib/css';
import { formatWeight } from '../lib/format';
import { useAuth } from '../auth/AuthProvider';
import { useLang } from '../i18n/LangProvider';
import { useAssignedExercises, useExerciseHistory } from '../hooks/useTrainee';
import { Screen } from '../components/Screen';
import { Splash } from '../components/Splash';
import { HistoryList } from '../components/HistoryList';
import { VideoEmbed } from '../components/VideoEmbed';

/** Read-only. The trainee sees the required weight and reps, the technique
   video and description, and their record history. No logging. */
export function ExerciseDetail() {
  const { exerciseId = '' } = useParams();
  const { profile } = useAuth();
  const { tr, groupLabel } = useLang();
  const navigate = useNavigate();

  const { data: exercises } = useAssignedExercises(profile?.id);
  const { data: history } = useExerciseHistory(profile?.id, exerciseId);
  const exercise = exercises?.find((ex) => ex.id === exerciseId);
  const back = () => navigate('/trainee', { state: { exerciseId } });

  if (!exercises) return <Splash />;
  if (!exercise) return <Navigate to="/trainee" replace />;

  return (
    <Screen>
      <div
        className="scr"
        style={s('position:absolute;inset:0;overflow-y:auto;scrollbar-width:none')}
      >
        <div style={s('position:sticky;top:0;z-index:5;background:var(--color-bg)')}>
          <VideoEmbed url={exercise.video_url} onBack={back} />
        </div>

        <div style={s('padding:20px 22px 40px;display:flex;flex-direction:column;gap:22px')}>
          <div style={s('display:flex;flex-direction:column;gap:10px;animation:fadeUp .4s both')}>
            <div style={s('display:flex;gap:7px;flex-wrap:wrap')}>
              <span
                className="tag tag-accent"
                style={s(
                  'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:6px 9px',
                )}
              >
                {groupLabel(exercise.category)}
              </span>
              <span
                className="tag tag-neutral"
                style={s(
                  'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:6px 9px',
                )}
              >
                {tr.assignedExercise}
              </span>
              {exercise.machine_number && (
                <span
                  className="tag tag-neutral"
                  style={s(
                    'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:6px 9px',
                  )}
                >
                  {tr.machineWord} {exercise.machine_number}
                </span>
              )}
            </div>
            <div
              dir="auto"
              style={s('font:800 27px/1.06 Archivo,sans-serif;letter-spacing:-.02em')}
            >
              {exercise.name}
            </div>
            <div
              dir="auto"
              style={s(
                'font:400 13.5px/1.6 Archivo,sans-serif;color:var(--color-neutral-700);text-wrap:pretty',
              )}
            >
              {exercise.description ?? ''}
            </div>
          </div>

          <div
            style={s(
              'display:flex;gap:0;border-top:2px solid var(--color-text);border-bottom:2px solid var(--color-text);animation:fadeUp .4s .05s both',
            )}
          >
            <div
              style={s(
                'flex:1;padding:18px 4px 18px 0;display:flex;flex-direction:column;gap:6px;border-right:1px solid color-mix(in srgb, var(--color-text) 20%, transparent)',
              )}
            >
              <span
                style={s(
                  'font:700 10.5px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-600)',
                )}
              >
                {tr.weightRequired}
              </span>
              <span
                className="num"
                style={s(
                  'font:800 42px/1 Archivo,sans-serif;letter-spacing:-.03em;font-variant-numeric:tabular-nums',
                )}
              >
                {exercise.weight === null ? tr.dash : formatWeight(exercise.weight)}
                <span style={s('font:700 16px/1 Archivo,sans-serif;color:var(--color-neutral-600)')}>
                  {' '}
                  kg
                </span>
              </span>
            </div>
            <div
              style={s(
                'flex:1;padding:18px 0 18px 20px;display:flex;flex-direction:column;gap:6px',
              )}
            >
              <span
                style={s(
                  'font:700 10.5px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-600)',
                )}
              >
                {tr.repsRequired}
              </span>
              <span
                className="num"
                style={s(
                  'font:800 42px/1 Archivo,sans-serif;letter-spacing:-.03em;font-variant-numeric:tabular-nums',
                )}
              >
                {exercise.reps === null ? tr.dash : exercise.reps}
              </span>
            </div>
          </div>

          <HistoryList entries={history} />
        </div>
      </div>
    </Screen>
  );
}
