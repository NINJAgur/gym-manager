import { useState } from 'react';
import { s } from '../lib/css';
import { videoSource } from '../lib/video';
import { useLang } from '../i18n/LangProvider';
import { Pressable } from './Pressable';

/** One frame across both states so the growth can interpolate — swapping
   between two elements would remount and it would jump instead.

   Both heights are lengths rather than an aspect-ratio, because the playing
   size needs to be a fraction of the *screen*, not of the column width.
   The poster keeps the design's 16:9 against the column (capped at 390px);
   playback takes 70% of the visual viewport, sliding the rest down under it. */
const POSTER_H = 'calc(min(100vw, 390px) * 9 / 16)';
const PLAYING_H = 'calc(var(--app-height, 100vh) * 0.7)';

const FRAME =
  'position:relative;width:100%;border-bottom:2px solid var(--color-text);display:flex;align-items:center;justify-content:center;overflow:hidden;transition:height .38s cubic-bezier(.22,1,.36,1),background-color .38s ease;height:';

const CORNER =
  'flex:none;width:32px;height:32px;border-radius:50%;background:var(--color-bg);border:1px solid var(--color-text);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease';

interface Props {
  url: string | null;
  /** The artboard has no back affordance; the app needs one. */
  onBack?: () => void;
}

export function VideoEmbed({ url, onBack }: Props) {
  const { tr } = useLang();
  const [playing, setPlaying] = useState(false);
  const source = videoSource(url);
  const live = playing && source !== null;

  return (
    <div
      className={live ? undefined : 'grayscale'}
      style={s(
        FRAME +
          (live
            ? `${PLAYING_H};background:#000`
            : `${POSTER_H};background:var(--color-neutral-300)`),
      )}
    >
      {live ? (
        <>
          {source.kind === 'iframe' ? (
            <iframe
              src={source.src}
              title={tr.techniqueWord}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={s('position:absolute;inset:0;width:100%;height:100%;border:0')}
            />
          ) : (
            <video
              src={source.src}
              controls
              autoPlay
              style={s('position:absolute;inset:0;width:100%;height:100%;object-fit:contain')}
            />
          )}
          <Pressable
            onClick={() => setPlaying(false)}
            style={s(CORNER + ';position:absolute;top:16px;inset-inline-end:18px;z-index:2')}
            activeStyle={s('transform:scale(.9)')}
          >
            <CloseIcon />
          </Pressable>
        </>
      ) : (
        <>
          <div
            style={s(
              'position:absolute;inset:0;background:repeating-linear-gradient(45deg,color-mix(in srgb, var(--color-text) 5%, transparent) 0 11px,transparent 11px 22px)',
            )}
          />
          <div
            style={s(
              'position:absolute;top:16px;left:18px;right:18px;display:flex;align-items:center;gap:10px;z-index:2',
            )}
          >
            {onBack && (
              <Pressable
                onClick={onBack}
                style={s(CORNER)}
                hoverStyle={s('background:var(--color-neutral-200)')}
                activeStyle={s('transform:scale(.9)')}
              >
                <svg
                  className="dir-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </Pressable>
            )}
            <span
              style={s(
                'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-800);white-space:nowrap',
              )}
            >
              {source ? tr.techniqueWord : tr.noVideo}
            </span>
          </div>
          {source && (
            <Pressable
              onClick={() => setPlaying(true)}
              style={s(
                'position:relative;width:64px;height:64px;border-radius:50%;background:var(--color-bg);border:2px solid var(--color-text);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .16s ease',
              )}
              activeStyle={s('transform:scale(.92)')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </Pressable>
          )}
        </>
      )}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
