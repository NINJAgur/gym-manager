import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { s } from '../lib/css';
import { formatWeight } from '../lib/format';
import { T, groupLabel } from '../i18n/he';
import { findGuideSlug } from '../lib/guide';
import { useAuth } from '../auth/AuthProvider';
import { useExerciseHistory, usePrograms, useSetNumbers } from '../hooks/usePrograms';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import type { PerformanceLog, ProgramItem } from '../lib/types';
import { Screen } from '../components/Screen';
import { Splash } from '../components/Splash';
import { Press } from '../components/Press';
import { VideoEmbed } from '../components/VideoEmbed';
import { WeightChart } from '../components/WeightChart';

/** One exercise, from the trainee's side: how to do it, what to lift, and how
   the weight has moved. Weight is adjustable; sets and reps are not. */
export function ExerciseDetail() {
  const { exerciseId = '' } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: programs } = usePrograms(profile?.id);
  const { data: history } = useExerciseHistory(profile?.id, exerciseId);
  const setNumbers = useSetNumbers();

  const item = (programs ?? [])
    .flatMap((program) => program.items)
    .find((candidate) => candidate.exercise_id === exerciseId);

  if (!programs) return <Splash />;
  if (!item) return <Navigate to="/trainee" replace />;

  return (
    <Screen>
      <Body
        item={item}
        history={history ?? []}
        onBack={() => navigate('/trainee')}
        onWeight={(weight) =>
          setNumbers.mutate({
            traineeId: profile!.id,
            itemId: item.id,
            exerciseId: item.exercise_id,
            weight,
          })
        }
      />
    </Screen>
  );
}

/** Split out so the debounced weight has somewhere stable to live — the
   parent returns early, before hooks would be safe. */
function Body({
  item,
  history,
  onBack,
  onWeight,
}: {
  item: ProgramItem;
  history: PerformanceLog[];
  onBack: () => void;
  onWeight: (weight: number) => void;
}) {
  const exercise = item.exercise;
  const [weight, setWeight] = useDebouncedSave(item.weight, onWeight);

  return (
    <div className="scr" style={s('flex:1;min-height:0;overflow-y:auto')}>
      <div style={s('position:sticky;top:0;z-index:5;padding:14px 14px 0;background:#f4f5f7')}>
        {/* Falling back to the name match, as the form does: the column is only
            filled once a trainer opens the exercise and saves it, so without
            this every exercise predating that shows nothing at all. */}
        <VideoEmbed
          url={exercise.video_url}
          guideSlug={exercise.guide_slug ?? findGuideSlug(exercise.name)}
          onBack={onBack}
        />
      </div>

      <div style={s('padding:20px 22px 40px;display:flex;flex-direction:column;gap:20px')}>
        <div style={s('display:flex;flex-direction:column;gap:10px;animation:fadeUp .4s both')}>
          <div style={s('display:flex;gap:7px;flex-wrap:wrap')}>
            <span
              style={s(
                'font:600 9.5px/1;border-radius:8px;padding:6px 10px;background:#fdeceb;color:#b81b13;width:fit-content',
              )}
            >
              {groupLabel(exercise.category)}
            </span>
            {exercise.machine_number && (
              <span
                className="num"
                style={s(
                  'font:600 9.5px/1;border-radius:8px;padding:6px 10px;background:#eceef0;color:#5c5f66;width:fit-content',
                )}
              >
                {T.machineNumber} {exercise.machine_number}
              </span>
            )}
          </div>
          <div style={s('font:800 24px/1.15')}>{exercise.name}</div>
          <div style={s('font:400 13.5px/1.6;color:#5c5f66;text-wrap:pretty')}>
            {exercise.description ?? ''}
          </div>
        </div>

        <div style={s('display:flex;gap:10px;animation:fadeUp .4s .05s both')}>
          <div
            style={s(
              'flex:1;background:#fff;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:6px;box-shadow:0 8px 22px -14px rgba(20,20,25,.2)',
            )}
          >
            <span style={s('font:700 10px/1;color:#8b8f96')}>{T.setsByReps}</span>
            <span className="num" style={s('font:800 26px/1;font-variant-numeric:tabular-nums')}>
              {item.sets} × {item.reps}
            </span>
          </div>
          <div
            style={s(
              'flex:1;background:#fff;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 22px -14px rgba(20,20,25,.2)',
            )}
          >
            <span style={s('font:700 10px/1;color:#8b8f96')}>{T.weightKg}</span>
            <div style={s('display:flex;align-items:center;justify-content:space-between;gap:6px')}>
              <Press
                onClick={() => setWeight(Math.max(0, weight - 2.5))}
                style={s(
                  'width:34px;height:34px;border-radius:50%;background:#f4f5f7;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
                )}
                activeStyle={s('transform:scale(.88)')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#17181c"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14" />
                </svg>
              </Press>
              <span className="num" style={s('font:800 24px/1;font-variant-numeric:tabular-nums')}>
                {formatWeight(weight)}
              </span>
              <Press
                onClick={() => setWeight(weight + 2.5)}
                style={s(
                  'width:34px;height:34px;border-radius:50%;background:#e0231a;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 14px -6px rgba(224,35,26,.55);transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
                )}
                activeStyle={s('transform:scale(.88)')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Press>
            </div>
          </div>
        </div>

        <div
          style={s(
            'display:flex;flex-direction:column;gap:10px;background:#fff;border-radius:18px;padding:16px;box-shadow:0 8px 22px -14px rgba(20,20,25,.2)',
          )}
        >
          <span style={s('font:700 11px/1')}>{T.progressChart}</span>
          <WeightChart entries={history} />
        </div>
      </div>
    </div>
  );
}
