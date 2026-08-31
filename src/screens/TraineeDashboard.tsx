import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { s } from '../lib/css';
import { shortDate } from '../lib/format';
import { useAuth } from '../auth/AuthProvider';
import { useLang } from '../i18n/LangProvider';
import { groupByCategory, useAssignedExercises } from '../hooks/useTrainee';
import { Screen } from '../components/Screen';
import { Avatar } from '../components/Avatar';
import { AppMenu } from '../components/AppMenu';
import { CategoryAccordion } from '../components/CategoryAccordion';

export function TraineeDashboard() {
  const { profile } = useAuth();
  const { tr, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const cameFrom = (location.state as { exerciseId?: string } | null)?.exerciseId ?? null;

  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: exercises, isPending } = useAssignedExercises(profile?.id);

  const groups = useMemo(() => groupByCategory(exercises ?? []), [exercises]);

  const lastUpdate = (exercises ?? [])
    .map((ex) => ex.logged_at)
    .filter((iso): iso is string => Boolean(iso))
    .sort()
    .at(-1);

  return (
    <Screen>
      <div
        style={s(
          'position:absolute;top:0;left:0;right:0;z-index:3;background:var(--color-bg);border-bottom:2px solid var(--color-text);padding:34px 22px 14px',
        )}
      >
        <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:12px')}>
          <div style={s('display:flex;flex-direction:column;gap:5px;min-width:0')}>
            <span
              style={s(
                'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--color-neutral-600)',
              )}
            >
              {tr.myExercises}
            </span>
            <span style={s('font:800 22px/1.05 Archivo,sans-serif;letter-spacing:-.02em')}>
              {profile?.full_name ?? profile?.email ?? ''}
            </span>
          </div>
          <div onClick={() => setMenuOpen(true)} style={s('cursor:pointer')}>
            <Avatar name={profile?.full_name ?? profile?.email} />
          </div>
        </div>

        <div style={s('display:flex;gap:24px;margin-top:16px')}>
          <Stat value={String(exercises?.length ?? 0)} label={tr.statExercises} />
          <Stat value={String(groups.length)} label={tr.statGroups} />
          <Stat
            value={lastUpdate ? shortDate(lastUpdate, lang) : tr.dash}
            label={tr.statLastUpdate}
          />
        </div>
      </div>

      <div
        className="scr"
        style={s(
          'position:absolute;inset:162px 0 0;overflow-y:auto;scrollbar-width:none;padding-bottom:30px',
        )}
      >
        {groups.map((group, index) => (
          <CategoryAccordion
            key={group.name}
            group={group}
            index={index}
            open={!closed[group.name]}
            onToggle={() =>
              setClosed((prev) => ({ ...prev, [group.name]: !prev[group.name] }))
            }
            onSelect={(exerciseId) => navigate(`/trainee/exercise/${exerciseId}`)}
            selectedId={cameFrom}
          />
        ))}
        <div
          style={s(
            'padding:18px 22px;font:400 11.5px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)',
          )}
        >
          {isPending ? tr.loading : exercises?.length ? tr.traineeFooter : tr.noExercises}
        </div>
      </div>

      {menuOpen && <AppMenu onClose={() => setMenuOpen(false)} />}
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={s('display:flex;flex-direction:column;gap:4px')}>
      <span style={s('font:800 17px/1 Archivo,sans-serif;font-variant-numeric:tabular-nums')}>
        {value}
      </span>
      <span
        style={s(
          'font:500 9.5px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-600)',
        )}
      >
        {label}
      </span>
    </div>
  );
}
