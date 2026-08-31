import { chevStyle, panelStyle, s } from '../lib/css';
import { formatWeight, shortDate } from '../lib/format';
import { useLang } from '../i18n/LangProvider';
import type { ExerciseGroup } from '../lib/types';
import { Pressable } from './Pressable';

interface Props {
  group: ExerciseGroup;
  index: number;
  open: boolean;
  onToggle: () => void;
  onSelect: (exerciseId: string) => void;
  selectedId: string | null;
}

/** v2's trainee accordion: a grey category band over white exercise rows. */
export function CategoryAccordion({
  group,
  index,
  open,
  onToggle,
  onSelect,
  selectedId,
}: Props) {
  const { tr, lang, groupLabel } = useLang();

  return (
    <div style={s('animation:fadeUp .4s both;animation-delay:' + index * 55 + 'ms')}>
      <Pressable
        onClick={onToggle}
        style={s(
          'display:flex;align-items:center;justify-content:space-between;padding:14px 22px;cursor:pointer;background:var(--color-neutral-200);border-bottom:1px solid color-mix(in srgb, var(--color-text) 16%, transparent);transition:background .14s ease',
        )}
        hoverStyle={s('background:var(--color-neutral-300)')}
      >
        <div style={s('display:flex;align-items:center;gap:10px')}>
          <span
            style={s(
              'font:700 12px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase',
            )}
          >
            {groupLabel(group.name)}
          </span>
          <span
            style={s(
              'font:500 11px/1 Archivo,sans-serif;color:var(--color-neutral-600);font-variant-numeric:tabular-nums',
            )}
          >
            {group.items.length}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={chevStyle(open)}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Pressable>

      <div style={panelStyle(open)}>
        <div style={s('overflow:hidden')}>
          {group.items.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => onSelect(exercise.id)}
              style={s(
                'display:flex;align-items:center;gap:12px;padding:14px 22px;cursor:pointer;border-bottom:1px solid color-mix(in srgb, var(--color-text) 12%, transparent);transition:background .14s ease,transform .14s ease;background:' +
                  (exercise.id === selectedId ? 'var(--color-accent-200)' : 'var(--color-bg)'),
              )}
            >
              <div style={s('flex:1;display:flex;flex-direction:column;gap:5px;min-width:0')}>
                <span
                  dir="auto"
                  style={s('font:600 14.5px/1.25 Archivo,sans-serif;letter-spacing:-.01em')}
                >
                  {exercise.name}
                </span>
                <span
                  style={s('font:400 11.5px/1 Archivo,sans-serif;color:var(--color-neutral-600)')}
                >
                  {exercise.machine_number ? `${tr.machineWord} ${exercise.machine_number} · ` : ''}
                  {exercise.logged_at
                    ? `${tr.updatedWord} ${shortDate(exercise.logged_at, lang)}`
                    : tr.noRecord}
                </span>
              </div>
              <div style={s('flex:none;text-align:end;display:flex;flex-direction:column;gap:5px')}>
                <span
                  className="num"
                  style={s('font:700 15px/1 Archivo,sans-serif;font-variant-numeric:tabular-nums')}
                >
                  {exercise.weight === null ? tr.dash : `${formatWeight(exercise.weight)} kg`}
                </span>
                <span
                  style={s(
                    'font:500 11.5px/1 Archivo,sans-serif;color:var(--color-neutral-600);font-variant-numeric:tabular-nums',
                  )}
                >
                  {exercise.reps === null ? '' : `${exercise.reps} ${tr.repsWord}`}
                </span>
              </div>
              <svg
                className="dir-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-neutral-500)"
                strokeWidth="2.2"
                strokeLinecap="round"
                style={s('flex:none')}
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
