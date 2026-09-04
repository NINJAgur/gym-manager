import { s } from '../lib/css';
import { initials } from '../lib/format';

/** The picture if there is one, the initials otherwise. One component so the
   fallback cannot drift between the header, the menu and the trainer's lists. */
export function ProfilePicture({
  url,
  name,
  size,
  accent = false,
}: {
  url: string | null | undefined;
  name: string | null | undefined;
  size: number;
  /** Red ground for the signed-in person's own avatar. */
  accent?: boolean;
}) {
  const base = `flex:none;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;`;

  if (url) {
    return (
      <div style={s(base + 'background:#eceef0')}>
        <img
          src={url}
          alt=""
          style={s('width:100%;height:100%;object-fit:cover')}
        />
      </div>
    );
  }

  return (
    <div
      style={s(
        base +
          `font:700 ${Math.round(size * 0.31)}px/1;` +
          (accent
            ? 'background:#e0231a;color:#fff;box-shadow:0 6px 14px -8px rgba(224,35,26,.7)'
            : 'background:#eceef0;color:#5c5f66'),
      )}
    >
      {initials(name)}
    </div>
  );
}
