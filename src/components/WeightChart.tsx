import { s } from '../lib/css';
import { formatWeight, shortDate } from '../lib/format';
import { T } from '../i18n/he';
import type { PerformanceLog } from '../lib/types';

const W = 280;
const H = 88;
/** Inset so the first and last value labels are not half off the edge. */
const PAD = 22;

/** Weight progress over time — one point per day, which is what the writer
   guarantees: a second edit on the same day revises that day's row.
   Deliberately LTR regardless of the surrounding RTL: the polyline runs
   oldest-to-newest in SVG coordinates, which never flip, so an RTL labels row
   would read backwards against its own line. Value labels are HTML rather
   than <text> because the SVG is stretched with preserveAspectRatio="none",
   which would distort glyphs. */
export function WeightChart({ entries, height = 96 }: { entries: PerformanceLog[]; height?: number }) {
  // A freshly added exercise sits at 0kg until the trainer sets it. That is a
  // placeholder, not a measurement, so it is not a point on the curve.
  const byDay = new Map<string, PerformanceLog>();
  for (const entry of entries) {
    if (entry.weight <= 0) continue;
    const day = entry.created_at.slice(0, 10);
    const seen = byDay.get(day);
    // Defensive: if older rows predate the one-per-day rule, keep the latest.
    if (!seen || entry.created_at > seen.created_at) byDay.set(day, entry);
  }

  const points = [...byDay.values()]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(-7);

  if (points.length === 0) {
    return <span style={s('font:400 11px/1.5;color:#8b8f96')}>{T.noHistory}</span>;
  }

  const values = points.map((p) => p.weight);
  const vmax = Math.max(...values);
  const vmin = Math.min(...values);
  // A flat series would divide by zero and sit on the floor; give it a band.
  const span = vmax - vmin || Math.max(vmax * 0.2, 1);
  const floor = vmax === vmin ? vmin - span / 2 : vmin - span * 0.25;
  const range = vmax + span * 0.25 - floor;

  const inner = W - PAD * 2;
  const coords = values.map((v, i) => ({
    x: points.length > 1 ? PAD + (i * inner) / (points.length - 1) : W / 2,
    y: H - 10 - ((v - floor) / range) * (H - 26),
    value: v,
  }));

  return (
    <div dir="ltr" style={s('display:flex;flex-direction:column;gap:4px')}>
      <div style={s(`position:relative;width:100%;height:${height}px`)}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={s(`position:absolute;inset:0;width:100%;height:${height}px`)}
        >
          {coords.length > 1 && (
            <polyline
              points={coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')}
              fill="none"
              stroke="#e0231a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={s('animation:lineGrow .6s ease both')}
            />
          )}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r="3.4"
              fill="#e0231a"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {coords.map((c, i) => (
          <span
            key={i}
            className="num"
            style={{
              position: 'absolute',
              left: `${(c.x / W) * 100}%`,
              top: `${(c.y / H) * 100}%`,
              transform: 'translate(-50%, -160%)',
              fontWeight: 700,
              fontSize: 'calc(9.5px * var(--type-scale, 1))',
              lineHeight: 1,
              color: '#17181c',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {formatWeight(c.value)}
          </span>
        ))}
      </div>

      <div style={s('display:flex;justify-content:space-between;padding:0 4px')}>
        {points.map((p, i) => (
          <span
            key={i}
            style={s('font:500 8.5px/1;color:#8b8f96;flex:1;text-align:center;white-space:nowrap')}
          >
            {shortDate(p.created_at)}
          </span>
        ))}
      </div>
    </div>
  );
}
