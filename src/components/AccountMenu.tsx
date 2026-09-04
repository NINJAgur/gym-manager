import { useRef } from 'react';
import { s } from '../lib/css';
import { T } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { Sheet } from './Sheet';
import { Press } from './Press';
import { ProfilePicture } from './ProfilePicture';
import { useUploadAvatar } from '../hooks/useTrainer';

/** Behind the avatar: who you are, and the way out. */
export function AccountMenu({ onClose }: { onClose: () => void }) {
  const { profile, signOut } = useAuth();
  const upload = useUploadAvatar();
  const picker = useRef<HTMLInputElement>(null);

  return (
    <Sheet title={profile?.full_name ?? profile?.email ?? ''} onClose={onClose}>
      <div style={s('display:flex;align-items:center;gap:14px')}>
        <input
          ref={picker}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && profile) upload.mutate({ userId: profile.id, file });
          }}
        />
        {/* The avatar is the control: tapping it picks a new picture, with a
            camera badge so it does not look like decoration. */}
        <Press
          onClick={() => picker.current?.click()}
          disabled={upload.isPending}
          title={T.changePicture}
          style={s('position:relative;flex:none;cursor:pointer;transition:transform .14s ease')}
          activeStyle={s('transform:scale(.94)')}
        >
          <ProfilePicture
            url={profile?.avatar_url}
            name={profile?.full_name ?? profile?.email}
            size={64}
            accent
          />
          <span
            style={s(
              'position:absolute;bottom:-2px;left:-2px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:var(--shadow-knob);display:flex;align-items:center;justify-content:center',
            )}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#17181c"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8.5h3.5L8 6h8l1.5 2.5H21v11H3z" />
              <circle cx="12" cy="13.5" r="3.5" />
            </svg>
          </span>
        </Press>
        <div style={s('display:flex;flex-direction:column;gap:5px;min-width:0')}>
          <span style={s('font:400 12.5px/1.5;color:#8b8f96;overflow-wrap:anywhere')}>
            {profile?.email ?? ''}
          </span>
          {(upload.isPending || upload.isError) && (
            <span
              style={s(
                'font:600 11px/1.4;color:' + (upload.isError ? '#b81b13' : '#8b8f96'),
              )}
            >
              {upload.isPending ? T.uploading : T.uploadFailed}
            </span>
          )}
        </div>
      </div>
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
