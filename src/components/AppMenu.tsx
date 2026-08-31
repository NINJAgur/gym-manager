import { s } from '../lib/css';
import { useAuth } from '../auth/AuthProvider';
import { useLang } from '../i18n/LangProvider';
import { Sheet } from './Sheet';
import { Pressable } from './Pressable';
import { LangToggle } from './LangToggle';

/** Account sheet behind the avatar — language and sign-out. */
export function AppMenu({ onClose }: { onClose: () => void }) {
  const { profile, signOut } = useAuth();
  const { tr } = useLang();

  return (
    <Sheet
      kicker={tr.perfTracker}
      title={profile?.full_name ?? profile?.email ?? ''}
      onClose={onClose}
      footer={
        <Pressable
          className="btn btn-primary btn-block"
          onClick={() => void signOut()}
          style={s(
            'height:50px;margin-top:0;justify-content:space-between;padding:0 18px;background:var(--color-accent);color:var(--color-bg);display:flex;align-items:center;cursor:pointer;transition:transform .14s ease,background .14s ease',
          )}
          hoverStyle={s('background:var(--color-accent-600)')}
          activeStyle={s('transform:scale(.98);background:var(--color-accent-700)')}
        >
          <span style={s('font:700 14.5px/1 Archivo,sans-serif')}>{tr.signOut}</span>
          <svg
            className="dir-icon"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M15 12H3m4-4-4 4 4 4M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
          </svg>
        </Pressable>
      }
    >
      <div
        style={s(
          'display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;border-top:2px solid var(--color-text)',
        )}
      >
        <span style={s('font:400 12.5px/1 Archivo,sans-serif;color:var(--color-neutral-600)')}>
          {profile?.email ?? ''}
        </span>
        <LangToggle />
      </div>
    </Sheet>
  );
}
