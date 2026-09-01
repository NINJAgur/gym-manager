import { s } from '../lib/css';
import { T } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { Sheet } from './Sheet';
import { Press } from './Press';

/** Behind the avatar: who you are, and the way out. */
export function AccountMenu({ onClose }: { onClose: () => void }) {
  const { profile, signOut } = useAuth();

  return (
    <Sheet title={profile?.full_name ?? profile?.email ?? ''} onClose={onClose}>
      <span style={s('font:400 12.5px/1.5;color:#8b8f96')}>{profile?.email ?? ''}</span>
      <Press
        onClick={() => void signOut()}
        style={s(
          'height:50px;border-radius:16px;background:#eceef0;color:#5c5f66;display:flex;align-items:center;justify-content:center;font:700 14px/1;cursor:pointer;transition:transform .14s ease',
        )}
        activeStyle={s('transform:scale(.97)')}
      >
        {T.signOut}
      </Press>
    </Sheet>
  );
}
