import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';
import { GROUP_NAMES } from '../i18n/strings';
import { useExercise, useSaveExercise, useUploadVideo } from '../hooks/useTrainer';
import { Screen } from '../components/Screen';
import { Splash } from '../components/Splash';
import { Pressable } from '../components/Pressable';
import { ACTION_ACTIVE, ACTION_HOVER, IconCircle, action } from '../components/CircleButton';

const LABEL =
  'font:700 10.5px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)';
const TEXT_INPUT = 'height:48px;font:500 14px/1 Archivo,sans-serif';

export function ExerciseEditor() {
  const { exerciseId } = useParams();
  const isNew = exerciseId === 'new' || !exerciseId;
  const { tr, groupLabel } = useLang();
  const navigate = useNavigate();

  const { data: existing, isPending } = useExercise(isNew ? undefined : exerciseId);
  const save = useSaveExercise();
  const upload = useUploadVideo();
  const filePicker = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(GROUP_NAMES[0]);
  const [video, setVideo] = useState('');
  const [machine, setMachine] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setCategory(existing.category);
    setVideo(existing.video_url ?? '');
    setMachine(existing.machine_number ?? '');
    setDescription(existing.description ?? '');
  }, [existing]);

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
      },
      { onSuccess: () => navigate('/trainer/exercises') },
    );
  };

  // The picker is a hidden input; the dashed button is the design's control.
  const onPick = (file: File | undefined) => {
    if (!file) return;
    upload.mutate(file, { onSuccess: (url) => setVideo(url) });
  };

  const groups = [...new Set([...GROUP_NAMES, category].filter(Boolean))];

  return (
    <Screen>
      <div
        style={s(
          'flex:none;position:relative;z-index:3;background:var(--color-bg);border-bottom:2px solid var(--color-text);display:flex;align-items:center;gap:12px;padding:34px 20px 14px',
        )}
      >
        <IconCircle onClick={() => navigate('/trainer/exercises')} size={34} scale={0.92} mirror>
          <path d="m15 6-6 6 6 6" />
        </IconCircle>
        <span style={s('font:800 18px/1 Archivo,sans-serif;letter-spacing:-.02em')}>
          {isNew ? tr.newExercise : tr.editExercise}
        </span>
      </div>

      <div
        className="scr"
        style={s(
          'flex:1;min-height:0;overflow-y:auto;scrollbar-width:none;padding:22px 22px 24px;display:flex;flex-direction:column;gap:22px',
        )}
      >
        <div className="field">
          <label style={s(LABEL)}>{tr.exerciseName}</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr.namePlaceholder}
            style={s(TEXT_INPUT)}
          />
        </div>

        <div style={s('display:flex;flex-direction:column;gap:10px')}>
          <label style={s(LABEL)}>{tr.muscleGroup}</label>
          <div style={s('display:flex;flex-wrap:wrap;gap:8px')}>
            {groups.map((group) => {
              const on = group === category;
              return (
                <div
                  key={group}
                  onClick={() => setCategory(group)}
                  style={s(
                    'flex:none;padding:10px 16px;font:600 12.5px/1 Archivo,sans-serif;cursor:pointer;border:1px solid ' +
                      (on ? 'var(--color-accent)' : 'var(--color-text)') +
                      ';background:' +
                      (on ? 'var(--color-accent)' : 'var(--color-bg)') +
                      ';color:' +
                      (on ? 'var(--color-bg)' : 'var(--color-text)') +
                      ';transition:background .14s ease,color .14s ease',
                  )}
                >
                  {groupLabel(group)}
                </div>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label style={s(LABEL)}>{tr.techniqueVideo}</label>
          <input
            className="input"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder={tr.pasteVideoUrl}
            style={s(TEXT_INPUT)}
            dir="ltr"
          />
          <input
            ref={filePicker}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <Pressable
            className="btn btn-secondary btn-block"
            onClick={() => filePicker.current?.click()}
            disabled={upload.isPending}
            style={s(
              'height:46px;margin-top:8px;justify-content:center;gap:8px;border:1px dashed var(--color-text);background:var(--color-neutral-100);cursor:pointer;transition:background .14s ease',
            )}
            hoverStyle={s('background:var(--color-neutral-200)')}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
            </svg>
            <span style={s('font:600 13px/1 Archivo,sans-serif')}>
              {upload.isPending ? tr.uploading : upload.isError ? tr.uploadFailed : tr.uploadVideo}
            </span>
          </Pressable>
        </div>

        <div className="field">
          <label style={s(LABEL)}>{tr.machineLabel}</label>
          <input
            className="input"
            value={machine}
            onChange={(e) => setMachine(e.target.value)}
            placeholder={tr.machinePlaceholder}
            style={s(TEXT_INPUT)}
          />
        </div>

        <div className="field">
          <label style={s(LABEL)}>{tr.descriptionLabel}</label>
          <textarea
            className="input"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={tr.descriptionPlaceholder}
            style={s('font:400 13.5px/1.6 Archivo,sans-serif;resize:none;height:auto')}
          />
        </div>
      </div>

      <div
        style={s(
          'flex:none;padding:16px 22px 26px;background:var(--color-bg);border-top:2px solid var(--color-text);z-index:6',
        )}
      >
        <Pressable
          className="btn btn-primary btn-block"
          onClick={onSave}
          disabled={!valid || save.isPending}
          style={s(action(58))}
          hoverStyle={s(ACTION_HOVER)}
          activeStyle={s(ACTION_ACTIVE)}
        >
          <span style={s('font:700 16px/1 Archivo,sans-serif')}>
            {save.isPending
              ? tr.saving
              : save.isError
                ? tr.saveFailed
                : !valid
                  ? tr.requiredField
                  : isNew
                    ? tr.saveExercise
                    : tr.saveChanges}
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </Pressable>
      </div>
    </Screen>
  );
}
