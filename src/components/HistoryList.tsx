import { s } from '../lib/css';
import { formatWeight, longDate } from '../lib/format';
import { useLang } from '../i18n/LangProvider';
import type { PerformanceLog } from '../lib/types';

/** v2's "Record history" block — every change the trainer has saved. */
export function HistoryList({ entries }: { entries: PerformanceLog[] | undefined }) {
  const { tr, lang } = useLang();

  return (
    <div style={s('display:flex;flex-direction:column;gap:8px')}>
      <span
        style={s(
          'font:700 11px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid var(--color-text)',
        )}
      >
        {tr.recordHistory}
      </span>
      {(entries ?? []).map((entry, index) => (
        <div
          key={entry.id}
          style={s(
            'display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid color-mix(in srgb, var(--color-text) 16%, transparent);animation:fadeUp .4s both;animation-delay:' +
              index * 60 +
              'ms',
          )}
        >
          <span style={s('font:400 12px/1 Archivo,sans-serif;color:var(--color-neutral-600)')}>
            {longDate(entry.created_at, lang)}
          </span>
          <span
            className="num"
            style={s('font:600 13px/1 Archivo,sans-serif;font-variant-numeric:tabular-nums')}
          >
            {formatWeight(entry.weight)} kg × {entry.reps}
          </span>
        </div>
      ))}
      {entries?.length === 0 && (
        <span style={s('font:400 11.5px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)')}>
          {tr.noHistory}
        </span>
      )}
    </div>
  );
}
