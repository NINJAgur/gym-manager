import { s } from '../lib/css';
import { useAuth } from '../auth/AuthProvider';
import { useLang } from '../i18n/LangProvider';
import { Screen } from './Screen';
import { Pressable } from './Pressable';
import { ACTION_ACTIVE, ACTION_HOVER, action } from './CircleButton';

/** Signed in but the profile row is unreadable — schema not deployed, RLS
   blocking, or no row for this user. Without this the app splashes forever. */
export function ProfileError() {
  const { profileError, signOut } = useAuth();
  const { tr } = useLang();

  return (
    <Screen>
      <div
        style={s(
          'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:26px',
        )}
      >
        <div
          style={s(
            'width:100%;background:var(--color-bg);border:1px solid var(--color-text);padding:30px 24px 26px;display:flex;flex-direction:column;gap:22px;box-shadow:var(--shadow-md)',
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
            <span style={s('font:800 26px/1.06 Archivo,sans-serif;letter-spacing:-.025em')}>
              {tr.profileMissing}
            </span>
            <span style={s('font:400 12px/1.5 Archivo,sans-serif;color:var(--color-neutral-700)')}>
              {profileError?.message ?? ''}
            </span>
          </div>
          <div className="hr" />
          <Pressable
            className="btn btn-primary btn-block"
            onClick={() => void signOut()}
            style={s(action(52))}
            hoverStyle={s(ACTION_HOVER)}
            activeStyle={s(ACTION_ACTIVE)}
          >
            <span style={s('font:700 15px/1 Archivo,sans-serif')}>{tr.signOut}</span>
          </Pressable>
        </div>
      </div>
    </Screen>
  );
}
