import { s } from '../lib/css';
import { weekWindow } from '../lib/format';
import { useLang } from '../i18n/LangProvider';

/** Seven daily volume totals, newest on the right. */
export function WeeklyVolumeChart({ values }: { values: number[] }) {
  const { tr, lang } = useLang();
  const { days } = weekWindow(lang);
  const max = Math.max(...values, 1);

  return (
    <div style={s('display:flex;flex-direction:column;gap:8px')}>
      <span
        style={s(
          'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--color-accent)',
        )}
      >
        {tr.weeklyVolume}
      </span>
      <div
        style={s(
          'display:flex;align-items:end;gap:8px;height:82px;border-bottom:2px solid var(--color-accent);padding-bottom:0',
        )}
      >
        {values.map((value, index) => (
          <div
            key={index}
            style={s('flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%')}
          >
            <div
              style={s(
                'width:100%;height:' +
                  Math.round((value / max) * 100) +
                  '%;min-height:2px;transform-origin:bottom;background:' +
                  (index >= values.length - 3 ? 'var(--color-accent)' : '#2a2a2a') +
                  ';animation:barGrow .45s cubic-bezier(.3,1.1,.4,1) both;animation-delay:' +
                  index * 40 +
                  'ms',
              )}
            />
          </div>
        ))}
      </div>
      <div style={s('display:flex;gap:8px')}>
        {days.map((day, index) => (
          <span
            key={index}
            style={s(
              'flex:1;font:500 8.5px/1 Archivo,sans-serif;color:var(--color-neutral-600);text-align:center',
            )}
          >
            {day.label}
          </span>
        ))}
      </div>
    </div>
  );
}
