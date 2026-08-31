import { s } from '../lib/css';
import { shortDate } from '../lib/format';
import { useLang } from '../i18n/LangProvider';
import type { PerformanceLog } from '../lib/types';

const W = 280;
const H = 88;

/** v2's record-history sparkline. The geometry is the design's:
   x spread across a 280-unit box, y mapped into 78 of 88 units with the
   floor pulled 2kg below the minimum so a flat line still sits off the base. */
export function RecordChart({ entries }: { entries: PerformanceLog[] }) {
  const { tr, lang } = useLang();

  // The query returns newest first; the chart reads left to right.
  const points = [...entries].reverse().slice(-7);

  if (points.length === 0) {
    return (
      <span style={s('font:400 11px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)')}>
        {tr.noHistory}
      </span>
    );
  }

  const values = points.map((p) => p.weight);
  const vmax = Math.max(...values);
  const vmin = Math.min(...values) - 2;
  const span = vmax - vmin || 1;
  const step = points.length > 1 ? W / (points.length - 1) : 0;

  const coords = values.map((v, i) => ({
    cx: (i * step).toFixed(1),
    cy: (86 - ((v - vmin) / span) * 78).toFixed(1),
  }));

  return (
    <>
      <div style={s('display:flex;align-items:end;gap:7px;height:74px;padding-top:2px')}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={s('width:100%;height:88px;overflow:visible')}
        >
          {coords.length > 1 && (
            <polyline
              points={coords.map((c) => `${c.cx},${c.cy}`).join(' ')}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={s('animation:lineGrow .6s ease both')}
            />
          )}
          {coords.map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r="3.5" fill="var(--color-accent)" />
          ))}
        </svg>
      </div>
      <div style={s('display:flex;justify-content:space-between')}>
        {points.map((p, i) => (
          <span
            key={i}
            style={s(
              'font:500 8px/1 Archivo,sans-serif;color:var(--color-neutral-500);flex:1;text-align:center',
            )}
          >
            {shortDate(p.created_at, lang)}
          </span>
        ))}
      </div>
    </>
  );
}
