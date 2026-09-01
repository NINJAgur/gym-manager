import { useState } from 'react';
import { s } from '../lib/css';
import { videoSource } from '../lib/video';
import { T } from '../i18n/he';
import { Press } from './Press';
import { GuideIllustration } from './GuideIllustration';

/** One frame across both states so the growth interpolates — swapping between
   two elements would remount and it would jump. The poster keeps the canvas's
   16:9; playback takes 70% of the visual viewport, as asked for earlier. */
const POSTER_H = 'calc(min(100vw, 390px) * 9 / 16)';
const PLAYING_H = 'calc(var(--app-height, 100vh) * 0.7)';

const FRAME =
  'position:relative;width:100%;border-radius:22px;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:height .38s cubic-bezier(.22,1,.36,1),background-color .38s ease;height:';

const CORNER =
  'position:absolute;top:14px;width:32px;height:32px;border-radius:50%;background:#fff;box-shadow:var(--shadow-knob);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;transition:transform .14s ease';

export function VideoEmbed({
  url,
  guideSlug,
  onBack,
}: {
  url: string | null;
  /** Shown when there is no uploaded clip: an animated illustration loop. */
  guideSlug?: string | null;
  onBack?: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const source = videoSource(url);
  const live = playing && source !== null;

  return (
    <div
      style={s(
        FRAME +
          (live
            ? `${PLAYING_H};background:#000`
            : `${POSTER_H};background:${guideSlug && !source ? '#fff' : '#dfe1e4'}`),
      )}
    >
      {live ? (
        <>
          {source.kind === 'iframe' ? (
            <iframe
              src={source.src}
              title={T.technique}
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
          <Press
            onClick={() => setPlaying(false)}
            style={s(CORNER + ';left:16px')}
            activeStyle={s('transform:scale(.9)')}
          >
            <CloseIcon />
          </Press>
        </>
      ) : (
        <>
          {/* The illustration is a stand-in, not a backdrop: once a real clip
              exists it owns the poster, so the play button is not sitting on
              top of an unrelated animation. */}
          {guideSlug && !source ? (
            <GuideIllustration slug={guideSlug} />
          ) : (
            <div
              style={s(
                'position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(20,20,25,.04) 0 11px,transparent 11px 22px)',
              )}
            />
          )}
          <span style={s('position:absolute;top:14px;right:16px;font:600 9.5px/1;color:#5c5f66')}>
            {source ? T.technique : guideSlug ? T.illustration : T.noVideo}
          </span>
          {onBack && (
            <Press
              onClick={onBack}
              style={s(CORNER + ';left:16px')}
              activeStyle={s('transform:scale(.9)')}
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
          )}
          {source && (
            <Press
              onClick={() => setPlaying(true)}
              style={s(
                'position:relative;width:60px;height:60px;border-radius:50%;background:#e0231a;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 24px -6px rgba(224,35,26,.6);transition:transform .16s ease',
              )}
              activeStyle={s('transform:scale(.92)')}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </Press>
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
      stroke="#17181c"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
