import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { panelStyle, s } from '../lib/css';
import { formatWeight, initials } from '../lib/format';
import { T, dayLabel } from '../i18n/he';
import { useAuth } from '../auth/AuthProvider';
import { usePrograms, useSetNumbers } from '../hooks/usePrograms';
import type { ProgramItem } from '../lib/types';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { useDebouncedSave } from '../hooks/useDebouncedSave';
import { AccountMenu } from '../components/AccountMenu';

/** The trainee's whole app: their program as a table, one row per exercise.
   Tapping a row opens a weight stepper — weight is the only thing they may
   change, which the database enforces too. */
/** One template for the header and every row, so the columns cannot drift
   apart. The name takes whatever is left after the numeric columns. */
const GRID = 'minmax(0,1fr) 34px 40px 56px 30px';

export function TraineeHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: programs, isPending } = usePrograms(profile?.id);
  const setNumbers = useSetNumbers();

  const [programId, setProgramId] = useState<string | null>(null);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const list = programs ?? [];
  const active = list.find((p) => p.id === programId) ?? list[0];
  const firstName = (profile?.full_name ?? '').split(' ')[0];

  return (
    <Screen>
      <div className="scr" style={s('flex:1;min-height:0;overflow-y:auto;padding-bottom:20px')}>
        <div
          style={s(
            'padding:30px 18px 6px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px',
          )}
        >
          <div style={s('display:flex;align-items:center;gap:12px;min-width:0')}>
            <Press
              onClick={() => setMenuOpen(true)}
              style={s(
                'width:52px;height:52px;border-radius:50%;background:#e0231a;flex:none;display:flex;align-items:center;justify-content:center;font:700 16px/1;color:#fff;cursor:pointer;box-shadow:0 6px 14px -8px rgba(224,35,26,.7)',
              )}
              activeStyle={s('transform:scale(.94)')}
            >
              {initials(profile?.full_name ?? profile?.email)}
            </Press>
            <div style={s('display:flex;flex-direction:column;gap:3px;min-width:0')}>
              <span style={s('font:800 17px/1.15')}>
                {T.greeting} {firstName} 👋
              </span>
              <span style={s('font:400 12px/1;color:#8b8f96')}>{T.greetingSub}</span>
            </div>
          </div>
        </div>

        {list.length > 1 && (
          <div className="scr" style={s('display:flex;gap:8px;overflow-x:auto;padding:14px 18px 4px')}>
            {list.map((program) => (
              <Press
                key={program.id}
                onClick={() => {
                  setProgramId(program.id);
                  setOpenRow(null);
                }}
                style={s(
                  'flex:none;padding:8px 14px;border-radius:12px;font:600 12px/1;cursor:pointer;' +
                    (program.id === active?.id
                      ? 'background:#e0231a;color:#fff;box-shadow:0 6px 14px -8px rgba(224,35,26,.7)'
                      : 'background:#fff;color:#5c5f66'),
                )}
              >
                {program.name}
              </Press>
            ))}
          </div>
        )}

        <div
          style={s(
            'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px 12px',
          )}
        >
          <span style={s('display:flex;align-items:center;gap:8px;font:800 15px/1;min-width:0')}>
            <span style={s('flex:none;width:3px;height:15px;border-radius:2px;background:#e0231a')} />
            {active?.name ?? T.noProgram}
          </span>
          {active && dayLabel(active.day_of_week) && (
            <span
              style={s(
                'flex:none;padding:7px 12px;border-radius:10px;font:600 11.5px/1;background:#fff;color:#5c5f66',
              )}
            >
              {dayLabel(active.day_of_week)}
            </span>
          )}
        </div>

        <div
          style={s(
            'margin:0 18px 14px;border-radius:18px;background:#fff;box-shadow:var(--shadow-raised);overflow:hidden',
          )}
        >
          <div
            style={s(
              'display:grid;grid-template-columns:' +
                GRID +
                ';align-items:center;gap:6px;padding:10px 14px;background:#f4f5f7;font:600 10.5px/1;color:#8b8f96',
            )}
          >
            <span>{T.colExercise}</span>
            <span style={s('text-align:center')}>{T.colSets}</span>
            <span style={s('text-align:center')}>{T.colReps}</span>
            <span style={s('text-align:center;color:#b81b13')}>{T.colKg}</span>
            <span />
          </div>

          {(active?.items ?? []).map((item) => (
            <Row
              key={item.id}
              item={item}
              open={openRow === item.id}
              onToggle={() => setOpenRow((prev) => (prev === item.id ? null : item.id))}
              onOpenDetail={() => navigate(`/exercise/${item.id}`)}
              onWeight={(weight) =>
                setNumbers.mutate({
                  traineeId: profile!.id,
                  itemId: item.id,
                  exerciseId: item.exercise_id,
                  weight,
                })
              }
            />
          ))}

          {(active?.items.length ?? 0) === 0 && (
            <div style={s('padding:22px 16px;font:400 12px/1.6;color:#8b8f96;text-align:center')}>
              {isPending ? T.loading : T.emptyProgram}
            </div>
          )}
        </div>
      </div>

      {menuOpen && <AccountMenu onClose={() => setMenuOpen(false)} />}
    </Screen>
  );
}

function Row({
  item,
  open,
  onToggle,
  onOpenDetail,
  onWeight,
}: {
  item: ProgramItem;
  open: boolean;
  onToggle: () => void;
  onOpenDetail: () => void;
  onWeight: (weight: number) => void;
}) {
  const [weight, setWeight] = useDebouncedSave(item.weight, onWeight);

  return (
    <div>
      <div
        style={s(
          'display:grid;grid-template-columns:' +
            GRID +
            ';align-items:center;gap:6px;padding:11px 14px;border-top:1px solid #f0f1f2',
        )}
      >
        <span
          onClick={onToggle}
          style={s(
            'font:600 13px/1.3;cursor:pointer;overflow-wrap:anywhere;min-width:0',
          )}
        >
          {item.exercise.name}
        </span>
        <span className="num" style={s('text-align:center;font:500 12.5px/1;color:#5c5f66')}>
          {item.sets}
        </span>
        <span className="num" style={s('text-align:center;font:500 12.5px/1;color:#5c5f66')}>
          {item.reps}
        </span>
        <div onClick={onToggle} style={s('display:flex;justify-content:center;cursor:pointer')}>
          <span
            className="num"
            style={s(
              'background:#fdeceb;color:#b81b13;border-radius:9px;padding:5px 7px;font:700 12.5px/1;font-variant-numeric:tabular-nums',
            )}
          >
            {formatWeight(weight)}
          </span>
        </div>
        <Press
          onClick={onOpenDetail}
          style={s(
            'flex:none;width:30px;height:30px;border-radius:8px;background:#f4f5f7;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease',
          )}
          activeStyle={s('transform:scale(.9)')}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5c5f66"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        </Press>
      </div>

      <div style={panelStyle(open)}>
        <div style={s('overflow:hidden')}>
          <div
            style={s(
              'padding:6px 16px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#f9f9fa',
            )}
          >
            <span style={s('font:600 11px/1;color:#5c5f66')}>{T.updateWeight}</span>
            <div style={s('display:flex;align-items:center;gap:10px')}>
              <Press
                onClick={() => setWeight(Math.max(0, weight - 1))}
                style={s(
                  'width:38px;height:38px;border-radius:50%;background:#fff;box-shadow:var(--shadow-knob);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
                )}
                activeStyle={s('transform:scale(.88)')}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#17181c"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14" />
                </svg>
              </Press>
              <span
                className="num"
                style={s('font:800 20px/1;min-width:44px;text-align:center;font-variant-numeric:tabular-nums')}
              >
                {formatWeight(weight)}
              </span>
              <Press
                onClick={() => setWeight(weight + 1)}
                style={s(
                  'width:38px;height:38px;border-radius:50%;background:#e0231a;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 14px -6px rgba(224,35,26,.55);transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
                )}
                activeStyle={s('transform:scale(.88)')}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Press>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
