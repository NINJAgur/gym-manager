import { s } from '../lib/css';
import { T } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { Screen } from './Screen';
import { Press } from './Press';

/** Signed in but the profile row is unreadable — schema not deployed, RLS
   blocking, or no row for this user. Without this the app splashes forever. */
export function ProfileError() {
  const { profileError, signOut } = useAuth();

  return (
    <Screen>
      <div
        style={s(
          'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:26px',
        )}
      >
        <div
          style={s(
            'width:100%;background:#fff;border-radius:24px;padding:30px 24px 26px;display:flex;flex-direction:column;gap:16px;box-shadow:0 20px 50px -18px rgba(20,20,25,.3)',
          )}
        >
          <span style={s('font:800 20px/1.3')}>{T.profileMissing}</span>
          <span style={s('font:400 12px/1.6;color:#8b8f96')} dir="ltr">
            {profileError?.message ?? ''}
          </span>
          <Press
            onClick={() => void signOut()}
            style={s(
              'height:50px;border-radius:16px;background:#eceef0;color:#5c5f66;display:flex;align-items:center;justify-content:center;font:700 14px/1;cursor:pointer',
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
