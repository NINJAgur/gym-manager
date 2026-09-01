import { s } from '../lib/css';
import { T } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';

/** Shown between signing in and being let through: a new account waits for the
   trainer to approve it, and a deactivated one says so rather than presenting
   an empty app. */
export function AccountGate({ state }: { state: 'pending' | 'deactivated' }) {
  const { signOut } = useAuth();
  const pending = state === 'pending';

  return (
    <Screen>
      <div
        style={s(
          'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:30px',
        )}
      >
        <div
          style={s(
            'display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center',
          )}
        >
          <div
            style={s(
              'width:72px;height:72px;border-radius:50%;background:#fff;box-shadow:0 14px 34px -14px rgba(20,20,25,.3);display:flex;align-items:center;justify-content:center',
            )}
          >
            {pending ? (
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e0231a"
                strokeWidth="2"
                strokeLinecap="round"
                style={s('animation:spin 2.4s linear infinite;transform-origin:center')}
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            ) : (
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ea1a7"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12h8" />
              </svg>
            )}
          </div>
          <span style={s('font:800 20px/1.3')}>
            {pending ? T.pendingTitle : T.deactivatedTitle}
          </span>
          <span style={s('font:400 13px/1.6;color:#5c5f66;max-width:270px')}>
            {pending ? T.pendingBody : T.deactivatedBody}
          </span>
          <Press
            onClick={() => void signOut()}
            style={s(
              'margin-top:8px;height:46px;padding:0 22px;border-radius:14px;background:#eceef0;color:#5c5f66;display:flex;align-items:center;justify-content:center;font:600 13px/1;cursor:pointer',
            )}
            activeStyle={s('transform:scale(.97)')}
          >
            {T.signOut}
          </Press>
        </div>
      </div>
    </Screen>
  );
}
