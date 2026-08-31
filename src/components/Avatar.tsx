import { s } from '../lib/css';
import { initials } from '../lib/format';

/** v2's ringed initials circle — 44px in the trainee header, 46px on cards. */
export function Avatar({ name, size = 44 }: { name: string | null | undefined; size?: number }) {
  return (
    <div
      style={s(
        'flex:none;width:' +
          size +
          'px;height:' +
          size +
          'px;border-radius:50%;border:1px solid var(--color-text);display:flex;align-items:center;justify-content:center;font:700 14px/1 Archivo,sans-serif',
      )}
    >
      {initials(name)}
    </div>
  );
}
