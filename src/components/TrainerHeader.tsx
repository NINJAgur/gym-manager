import { useState } from 'react';
import { s } from '../lib/css';
import { T } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { Press } from './Press';
import { ProfilePicture } from './ProfilePicture';
import { AccountMenu } from './AccountMenu';

/** Every trainer screen's header. The avatar is the way out — the bottom nav
   has no room for it, and without this there was no sign-out at all. */
export function TrainerHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div style={s('flex:none;padding:30px 18px 12px')}>
        <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:12px')}>
          <div style={s('min-width:0')}>
            <span style={s('font:600 10px/1;color:#8b8f96')}>{T.trainerKicker}</span>
            <div style={s('font:800 20px/1.05;margin-top:5px')}>{title}</div>
          </div>
          <Press
            onClick={() => setMenuOpen(true)}
            title={T.signOut}
            style={s('flex:none;cursor:pointer;transition:transform .14s ease')}
            activeStyle={s('transform:scale(.94)')}
          >
            <ProfilePicture
              url={profile?.avatar_url}
              name={profile?.full_name ?? profile?.email}
              size={44}
              accent
            />
          </Press>
        </div>
        {children}
      </div>
      {menuOpen && <AccountMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}
