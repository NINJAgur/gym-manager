import { s } from '../lib/css';
import { formatWeight } from '../lib/format';
import { Press } from './Press';

interface Props {
  label: string;
  value: number;
  /** Weight and reps both move by 1. */
  step?: number;
  /** Round buttons: 38 on the trainee's inline row, 48 in the trainer's panel. */
  size?: number;
  onChange: (next: number) => void;
}

const minus = (px: number) => (
  <svg
    width={px}
    height={px}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#17181c"
    strokeWidth="2.4"
    strokeLinecap="round"
  >
    <path d="M5 12h14" />
  </svg>
);

const plus = (px: number) => (
  <svg
    width={px}
    height={px}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.6"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** The canvas's paired round steppers: a white knob to decrease, an accent
   one to increase, the value between them. */
export function Stepper({ label, value, step = 1, size = 48, onChange }: Props) {
  const icon = Math.round(size * 0.36);

  return (
    <div style={s('display:flex;flex-direction:column;gap:10px')}>
      <span style={s('font:700 10px/1;color:#5c5f66')}>{label}</span>
      <div style={s('display:flex;align-items:center;justify-content:space-between;gap:8px')}>
        <Press
          onClick={() => onChange(Math.max(0, value - step))}
          style={s(
            `flex:none;width:${size}px;height:${size}px;border-radius:50%;background:#fff;box-shadow:var(--shadow-knob);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)`,
          )}
          activeStyle={s('transform:scale(.88)')}
        >
          {minus(icon)}
        </Press>
        <span
          className="num"
          style={s('font:800 24px/1;flex:1;text-align:center;font-variant-numeric:tabular-nums')}
        >
          {formatWeight(value)}
        </span>
        <Press
          onClick={() => onChange(value + step)}
          style={s(
            `flex:none;width:${size}px;height:${size}px;border-radius:50%;background:#e0231a;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-accent);transition:transform .14s cubic-bezier(.34,1.5,.5,1)`,
          )}
          activeStyle={s('transform:scale(.88)')}
        >
          {plus(icon)}
        </Press>
      </div>
    </div>
  );
}
