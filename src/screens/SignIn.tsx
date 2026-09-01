import { useState } from 'react';
import { s } from '../lib/css';
import { T } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';

export function SignIn() {
  const { signInWithGoogle } = useAuth();
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
      <div
        style={s(
          'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:26px',
        )}
      >
        <div
          style={s(
            'width:100%;background:#fff;border-radius:24px;padding:34px 24px 28px;display:flex;flex-direction:column;gap:20px;box-shadow:0 20px 50px -18px rgba(20,20,25,.3);animation:cardIn .38s cubic-bezier(.22,1,.36,1) both',
          )}
        >
          <div
            style={s(
              'display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center',
            )}
          >
            {/* The app mark, so sign-in and the home-screen icon agree. */}
            <svg width="60" height="60" viewBox="0 0 64 64" style={s('margin-bottom:6px')} aria-hidden="true">
              <rect width="64" height="64" rx="15" fill="#f4f5f7" />
              <g fill="#17181c">
                <rect x="6" y="19" width="9" height="26" rx="3.5" />
                <rect x="17" y="25" width="6" height="14" rx="2.5" />
                <rect x="41" y="25" width="6" height="14" rx="2.5" />
                <rect x="49" y="19" width="9" height="26" rx="3.5" />
              </g>
              <path
                d="M23 38 L29.5 31.5 L36 35 L41 27"
                fill="none"
                stroke="#e0231a"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={s('font:800 22px/1.2')}>{T.signInTitle}</span>
            <span style={s('font:400 12.5px/1.55;color:#5c5f66')}>{T.signInSubtitle}</span>
          </div>
          <Press
            onClick={onSignIn}
            disabled={busy}
            style={s(
              'height:54px;border-radius:16px;background:#e0231a;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
            )}
            activeStyle={s('transform:scale(.97)')}
          >
            <span style={s('font:700 15px/1')}>{T.signInGoogle}</span>
          </Press>
        </div>
      </div>
    </Screen>
  );
}
