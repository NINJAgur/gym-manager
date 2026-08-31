import { s } from '../lib/css';
import { Pressable } from './Pressable';

interface Props {
  label: string;
  /** Right-hand "Record 32.5 kg" line. */
  record: string;
  value: string;
  unit: string;
  /** The trainee sees the same block without the two circles. */
  readOnly?: boolean;
  onDecrement?: () => void;
  onIncrement?: () => void;
}

const CIRCLE =
  'flex:none;width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1),background .14s ease;';

/** v2's oversized stepper: outlined minus, accent-filled plus, 46px numeral. */
export function Stepper({
  label,
  record,
  value,
  unit,
  readOnly,
  onDecrement,
  onIncrement,
}: Props) {
  return (
    <div
      style={s(
        'display:flex;flex-direction:column;gap:13px;padding-top:6px;border-top:2px solid var(--color-text)',
      )}
    >
      <div style={s('display:flex;align-items:baseline;justify-content:space-between;padding-top:8px')}>
        <span
          style={s('font:700 11px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase')}
        >
          {label}
        </span>
        <span style={s('font:500 11px/1 Archivo,sans-serif;color:var(--color-neutral-600)')}>
          {record}
        </span>
      </div>
      <div style={s('display:flex;align-items:center;justify-content:space-between;gap:10px')}>
        {!readOnly && (
          <Pressable
            onClick={onDecrement}
            style={s(CIRCLE + 'border:2px solid var(--color-text);background:var(--color-bg)')}
            hoverStyle={s('background:var(--color-neutral-200)')}
            activeStyle={s('transform:scale(.9);background:var(--color-neutral-300)')}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M5 12h14" />
            </svg>
          </Pressable>
        )}
        <div
          style={s(
            'flex:1;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px',
          )}
        >
          <span
            style={s(
              'font:800 46px/1 Archivo,sans-serif;letter-spacing:-.03em;font-variant-numeric:tabular-nums',
            )}
          >
            {value}
          </span>
          <span
            style={s(
              'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-600)',
            )}
          >
            {unit}
          </span>
        </div>
        {!readOnly && (
          <Pressable
            onClick={onIncrement}
            style={s(CIRCLE + 'background:var(--color-accent);color:var(--color-bg)')}
            hoverStyle={s('background:var(--color-accent-600)')}
            activeStyle={s('transform:scale(.9);background:var(--color-accent-700)')}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Pressable>
        )}
      </div>
    </div>
  );
}
