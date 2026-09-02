import { useState } from 'react';
import { s } from '../lib/css';
import { T } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';

const FIELD = 'display:flex;flex-direction:column;gap:8px';
const LABEL = 'font:700 10.5px/1;color:#5c5f66';
const BUTTON =
  'height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignIn() {
  const { signInWithGoogle, sendSignInLink } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  /** Null until a link has been sent; then the address it went to. */
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>, message: string) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch {
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = () => run(signInWithGoogle, T.sendFailed);

  const onSend = () => {
    if (!EMAIL.test(email.trim())) return setError(T.emailInvalid);
    void run(async () => {
      await sendSignInLink(email);
      setSentTo(email.trim());
    }, T.sendFailed);
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
            'width:100%;background:#fff;border-radius:24px;padding:34px 24px 28px;display:flex;flex-direction:column;gap:18px;box-shadow:0 20px 50px -18px rgba(20,20,25,.3);animation:cardIn .38s cubic-bezier(.22,1,.36,1) both',
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

          {sentTo === null ? (
            <>
              <Press
                onClick={onGoogle}
                disabled={busy}
                style={s(BUTTON + ';background:#e0231a;color:#fff')}
                activeStyle={s('transform:scale(.97)')}
              >
                <span style={s('font:700 15px/1')}>{T.signInGoogle}</span>
              </Press>

              <Separator />

              <div style={s(FIELD)}>
                <label style={s(LABEL)}>{T.emailLabel}</label>
                <input
                  className="field-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSend()}
                  placeholder={T.emailPlaceholder}
                />
              </div>
              <Press
                onClick={onSend}
                disabled={busy}
                style={s(BUTTON + ';background:#17181c;color:#fff')}
                activeStyle={s('transform:scale(.97)')}
              >
                <span style={s('font:700 15px/1')}>{busy ? T.sendingLink : T.sendLink}</span>
              </Press>
            </>
          ) : (
            <>
              <div
                style={s(
                  'display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;background:#f4f5f7;border-radius:16px;padding:18px 16px',
                )}
              >
                <MailIcon />
                <span style={s('font:600 12.5px/1.6;overflow-wrap:anywhere')}>
                  {T.linkSentTo} <span dir="ltr">{sentTo}</span>
                </span>
                {/* The verifier lives in this browser's storage, so a link
                    opened elsewhere cannot complete the sign-in. */}
                <span style={s('font:400 11.5px/1.6;color:#5c5f66')}>{T.linkSameDevice}</span>
                <span style={s('font:400 11px/1.6;color:#8b8f96')}>{T.linkSpam}</span>
              </div>

              <div style={s('display:flex;justify-content:space-between;gap:10px')}>
                <Press
                  onClick={onSend}
                  disabled={busy}
                  style={s('font:700 11.5px/1;color:#b81b13;cursor:pointer')}
                >
                  {busy ? T.sendingLink : T.resendLink}
                </Press>
                <Press
                  onClick={() => {
                    setSentTo(null);
                    setError(null);
                  }}
                  style={s('font:700 11.5px/1;color:#8b8f96;cursor:pointer')}
                >
                  {T.useAnotherEmail}
                </Press>
              </div>
            </>
          )}

          {error && (
            <span style={s('font:600 11.5px/1.5;color:#b81b13;text-align:center')}>{error}</span>
          )}
        </div>
      </div>
    </Screen>
  );
}

function MailIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e0231a" strokeWidth="1.8">
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" strokeLinecap="round" />
    </svg>
  );
}

function Separator() {
  return (
    <div style={s('display:flex;align-items:center;gap:10px')}>
      <span style={s('flex:1;height:1px;background:#eceef0')} />
      <span style={s('font:600 10.5px/1;color:#8b8f96')}>{T.orSeparator}</span>
      <span style={s('flex:1;height:1px;background:#eceef0')} />
    </div>
  );
}
