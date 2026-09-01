import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { s } from '../lib/css';
import { GROUP_KEYS, T, groupLabel } from '../i18n/he';
import { discardUpload, useExercise, useSaveExercise, useUploadVideo } from '../hooks/useTrainer';
import { Screen } from '../components/Screen';
import { Splash } from '../components/Splash';
import { Press } from '../components/Press';
import { Sheet } from '../components/Sheet';
import { GuideIllustration } from '../components/GuideIllustration';
import { findGuideSlug, guideName, searchGuide } from '../lib/guide';

const LABEL = 'font:700 10.5px/1;color:#5c5f66';

export function ExerciseForm() {
  const { exerciseId } = useParams();
  const isNew = exerciseId === 'new' || !exerciseId;
  const navigate = useNavigate();

  const { data: existing, isPending } = useExercise(isNew ? undefined : exerciseId);
  const save = useSaveExercise();
  const upload = useUploadVideo();
  const filePicker = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(GROUP_KEYS[0]);
  const [video, setVideo] = useState('');
  const [guideSlug, setGuideSlug] = useState<string | null>(null);
  // Once the trainer picks an illustration themselves, typing stops re-guessing.
  const [guideManual, setGuideManual] = useState(false);
  const [pickingGuide, setPickingGuide] = useState(false);
  const [guideQuery, setGuideQuery] = useState('');
  const [machine, setMachine] = useState('');
  const [description, setDescription] = useState('');

  // Uploads land in the bucket before the form is saved, so leaving without
  // saving — or uploading twice — would strand files nothing references.
  const uploaded = useRef<string[]>([]);
  const keptUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setCategory(existing.category);
    setVideo(existing.video_url ?? '');
    setGuideSlug(existing.guide_slug ?? findGuideSlug(existing.name));
    setGuideManual(Boolean(existing.guide_slug));
    setMachine(existing.machine_number ?? '');
    setDescription(existing.description ?? '');
  }, [existing]);

  useEffect(
    () => () => {
      for (const url of uploaded.current) {
        if (url !== keptUrl.current) void discardUpload(url);
      }
    },
    [],
  );

  if (!isNew && isPending) return <Splash />;

  const valid = name.trim().length > 0;

  const onSave = () => {
    if (!valid) return;
    save.mutate(
      {
        id: isNew ? undefined : exerciseId,
        name,
        category,
        description,
        machine_number: machine,
        video_url: video,
        guide_slug: guideSlug,
      },
      {
        onSuccess: (saved) => {
          keptUrl.current = saved.video_url;
          navigate('/trainer/exercises');
        },
      },
    );
  };

  return (
    <Screen>
      <div style={s('flex:none;display:flex;align-items:center;gap:12px;padding:30px 20px 14px')}>
        <Press
          onClick={() => navigate('/trainer/exercises')}
          style={s(
            'width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:0 4px 12px -6px rgba(20,20,25,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease',
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
        <span style={s('font:800 17px/1')}>{isNew ? T.newExercise : T.editExercise}</span>
      </div>

      <div
        className="scr"
        style={s(
          'flex:1;min-height:0;overflow-y:auto;padding:8px 20px 24px;display:flex;flex-direction:column;gap:18px',
        )}
      >
        <div style={s('display:flex;flex-direction:column;gap:8px')}>
          <label style={s(LABEL)}>{T.exerciseName}</label>
          <input
            className="field-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              // Re-guess on every keystroke rather than keeping the first hit:
              // a partial name matches something broader than the full one.
              if (!guideManual) setGuideSlug(findGuideSlug(e.target.value));
            }}
            placeholder={T.exerciseNamePlaceholder}
          />
        </div>

        <div style={s('display:flex;flex-direction:column;gap:8px')}>
          <label style={s(LABEL)}>{T.muscleGroup}</label>
          <div style={s('display:flex;flex-wrap:wrap;gap:8px')}>
            {GROUP_KEYS.map((key) => {
              const on = key === category;
              return (
                <Press
                  key={key}
                  onClick={() => setCategory(key)}
                  style={s(
                    'flex:none;padding:10px 16px;border-radius:12px;font:600 12.5px/1;cursor:pointer;' +
                      (on
                        ? 'background:#e0231a;color:#fff'
                        : 'background:#fff;color:#17181c;border:1px solid #dfe1e4'),
                  )}
                >
                  {groupLabel(key)}
                </Press>
              );
            })}
          </div>
        </div>

        <div style={s('display:flex;flex-direction:column;gap:8px')}>
          <label style={s(LABEL)}>{T.demoVideo}</label>

          {/* Until a real clip is uploaded, an illustration from the open
              Workout Guide catalogue stands in. Auto-matched from the name
              where it can be, picked by hand otherwise. */}
          <Press
            onClick={() => setPickingGuide(true)}
            style={s(
              'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #dfe1e4;cursor:pointer',
            )}
          >
            <div
              style={s(
                'flex:none;width:44px;height:44px;border-radius:10px;background:#f4f5f7;position:relative;overflow:hidden',
              )}
            >
              {guideSlug && <GuideIllustration slug={guideSlug} still />}
            </div>
            <span style={s('flex:1;font:600 12.5px/1.3;min-width:0')}>
              {guideSlug ? guideName(guideSlug) : T.guidePick}
            </span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ea1a7"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
          </Press>

          <input
            ref={filePicker}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              upload.mutate(file, {
                onSuccess: (url) => {
                  uploaded.current.push(url);
                  setVideo(url);
                },
              });
            }}
          />
          <Press
            onClick={() => filePicker.current?.click()}
            disabled={upload.isPending}
            style={s(
              'height:46px;border-radius:14px;border:1.5px dashed #c9cbce;background:#eceef0;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer',
            )}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5c5f66"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
            </svg>
            <span style={s('font:600 13px/1;color:#5c5f66')}>
              {upload.isPending ? T.uploading : upload.isError ? T.uploadFailed : T.uploadVideo}
            </span>
          </Press>
        </div>

        <div style={s('display:flex;flex-direction:column;gap:8px')}>
          <label style={s(LABEL)}>{T.machineNumber}</label>
          <input
            className="field-input"
            value={machine}
            onChange={(e) => setMachine(e.target.value)}
            placeholder={T.machinePlaceholder}
          />
        </div>

        <div style={s('display:flex;flex-direction:column;gap:8px')}>
          <label style={s(LABEL)}>{T.description}</label>
          <textarea
            className="field-input"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={T.descriptionPlaceholder}
          />
        </div>
      </div>

      <div
        style={s(
          'flex:none;padding:16px 20px 26px;background:linear-gradient(to top,#f4f5f7 60%,rgba(244,245,247,0))',
        )}
      >
        <Press
          onClick={onSave}
          disabled={!valid || save.isPending}
          style={s(
            'height:56px;border-radius:18px;background:#e0231a;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
          )}
          activeStyle={s('transform:scale(.97)')}
        >
          <span style={s('font:700 15.5px/1')}>
            {save.isPending
              ? T.saving
              : save.isError
                ? T.saveFailed
                : !valid
                  ? T.nameRequired
                  : isNew
                    ? T.saveExercise
                    : T.saveChanges}
          </span>
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </Press>
      </div>

      {pickingGuide && (
        <Sheet title={T.guidePick} onClose={() => setPickingGuide(false)}>
          <input
            className="field-input"
            value={guideQuery}
            onChange={(e) => setGuideQuery(e.target.value)}
            placeholder={T.guideSearch}
          />
          <div
            className="scr"
            style={s('flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px')}
          >
            <Press
              onClick={() => {
                setGuideSlug(null);
                setGuideManual(true);
                setPickingGuide(false);
              }}
              style={s(
                'flex:none;padding:12px 13px;border-radius:14px;background:#f4f5f7;cursor:pointer;font:600 13px/1;color:#8b8f96',
              )}
            >
              {T.guideNone}
            </Press>
            {searchGuide(guideQuery).map((entry) => (
              <Press
                key={entry.slug}
                onClick={() => {
                  setGuideSlug(entry.slug);
                  setGuideManual(true);
                  setPickingGuide(false);
                }}
                style={s(
                  'flex:none;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:14px;background:#f4f5f7;cursor:pointer',
                )}
              >
                <div
                  style={s(
                    'flex:none;width:40px;height:40px;border-radius:10px;background:#fff;position:relative;overflow:hidden',
                  )}
                >
                  <GuideIllustration slug={entry.slug} still />
                </div>
                <div style={s('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}>
                  <span style={s('font:600 13px/1.3')}>{entry.he}</span>
                  <span dir="ltr" style={s('font:400 10px/1;color:#8b8f96;text-align:right')}>
                    {entry.name}
                  </span>
                </div>
              </Press>
            ))}
          </div>
        </Sheet>
      )}
    </Screen>
  );
}
