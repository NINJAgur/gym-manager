import { useState } from 'react';
import { s } from '../lib/css';
import { useAuth } from '../auth/AuthProvider';
import { useLang } from '../i18n/LangProvider';
import { Screen } from '../components/Screen';
import { Pressable } from '../components/Pressable';
import { LangToggle } from '../components/LangToggle';
import { ACTION_ACTIVE, ACTION_HOVER, action } from '../components/CircleButton';

/** Decorative backdrop behind the blur — the design's own ghost fixture. */
const GHOST = [
  { name: 'Incline Dumbbell Press', value: '32.5 kg × 9' },
  { name: 'Flat Barbell Bench Press', value: '80 kg × 6' },
  { name: 'Cable Fly', value: '15 kg × 14' },
  { name: 'Back Squat', value: '110 kg × 5' },
  { name: 'Romanian Deadlift', value: '90 kg × 8' },
  { name: 'Leg Press', value: '180 kg × 12' },
];

export function SignIn() {
  const { signInWithGoogle } = useAuth();
  const { tr } = useLang();
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <div style={s('position:absolute;inset:0;filter:blur(6px);opacity:.55;padding:34px 22px')}>
        <span style={s('font:800 22px/1.05 Archivo,sans-serif')}>Marcus Osei</span>
        <div style={s('height:2px;background:var(--color-text);margin:14px 0')} />
        {GHOST.map((row) => (
          <div
            key={row.name}
            style={s(
              'display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid color-mix(in srgb, var(--color-text) 16%, transparent)',
            )}
          >
            <span style={s('font:600 14px/1 Archivo,sans-serif')}>{row.name}</span>
            <span style={s('font:700 14px/1 Archivo,sans-serif')}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Physical `right`, not `inset-inline-end` — the latter flips the
          control to the other corner the instant you switch language. */}
      <LangToggle style={{ position: 'absolute', top: '26px', right: '22px', zIndex: 10 }} />

      <div
        style={s(
          'position:absolute;inset:0;background:color-mix(in srgb, var(--color-bg) 55%, transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:26px;animation:fadeIn .3s ease both',
        )}
      >
        <div
          style={s(
            'width:100%;background:var(--color-bg);border:1px solid var(--color-text);padding:30px 24px 26px;display:flex;flex-direction:column;gap:22px;animation:cardIn .38s cubic-bezier(.22,1,.36,1) both;box-shadow:var(--shadow-md)',
          )}
        >
          <div style={s('display:flex;flex-direction:column;gap:10px')}>
            <span
              style={s(
                'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:var(--color-accent-700)',
              )}
            >
              {tr.perfTracker}
            </span>
            <span style={s('font:800 29px/1.06 Archivo,sans-serif;letter-spacing:-.025em')}>
              {tr.signInLine1}
              <br />
              {tr.signInLine2}
            </span>
          </div>
          <div className="hr" />
          <Pressable
            className="btn btn-primary btn-block"
            onClick={onSignIn}
            disabled={busy}
            style={s(action(56))}
            hoverStyle={s(ACTION_HOVER)}
            activeStyle={s(ACTION_ACTIVE)}
          >
            <span style={s('font:700 15px/1 Archivo,sans-serif')}>{tr.continueGoogle}</span>
            <svg
              className="dir-icon"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </Pressable>
        </div>
      </div>
    </Screen>
  );
}
