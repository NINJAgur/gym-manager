import type { CSSProperties } from 'react';
import { s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';

const segBase =
  'padding:9px 16px;font:700 12px/1 Archivo,sans-serif;cursor:pointer;transition:background .14s ease,color .14s ease;';

const segOn = segBase + 'background:var(--color-accent);color:#fff';
const segOff = segBase + 'color:var(--color-neutral-500)';

/** The design canvas's own EN / עברית segmented control. */
export function LangToggle({ style }: { style?: CSSProperties }) {
  const { lang, setLang } = useLang();

  return (
    // direction:ltr keeps EN | עברית in a fixed order; without it the flex row
    // reverses under RTL and the two options trade places as you switch.
    <div className="seg" style={{ flex: 'none', direction: 'ltr', ...style }}>
      <label className="seg-opt" style={s(lang === 'en' ? segOn : segOff)}>
        <input type="radio" name="lang" checked={lang === 'en'} onChange={() => setLang('en')} />
        EN
      </label>
      <label className="seg-opt" style={s(lang === 'he' ? segOn : segOff)}>
        <input type="radio" name="lang" checked={lang === 'he'} onChange={() => setLang('he')} />
        עברית
      </label>
    </div>
  );
}
