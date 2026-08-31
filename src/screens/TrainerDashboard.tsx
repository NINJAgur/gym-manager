import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';
import { useAuth } from '../auth/AuthProvider';
import { useTrainees } from '../hooks/useTrainer';
import { Screen } from '../components/Screen';
import { Avatar } from '../components/Avatar';
import { AppMenu } from '../components/AppMenu';
import { TraineeCard } from '../components/TraineeCard';
import { AssignSheet } from '../components/AssignSheet';
import { IconCircle } from '../components/CircleButton';

export function TrainerDashboard() {
  const { tr } = useLang();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: trainees, isPending } = useTrainees();

  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (trainees ?? []).filter(
      (t) =>
        !needle ||
        (t.full_name ?? '').toLowerCase().includes(needle) ||
        (t.email ?? '').toLowerCase().includes(needle),
    );
  }, [trainees, query]);

  const target = (trainees ?? []).find((t) => t.id === assignTarget) ?? null;

  return (
    <Screen>
      <div
        style={s(
          'position:absolute;top:0;left:0;right:0;z-index:3;background:var(--color-bg);border-bottom:2px solid var(--color-text);padding:34px 22px 16px',
        )}
      >
        <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:12px')}>
          <div style={s('display:flex;flex-direction:column;min-width:0')}>
            <span
              style={s(
                'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--color-neutral-600)',
              )}
            >
              {tr.trainerKicker}
            </span>
            <div
              style={s(
                'font:800 22px/1.05 Archivo,sans-serif;letter-spacing:-.02em;margin-top:6px',
              )}
            >
              {trainees?.length ?? 0} {tr.registeredTrainees}
            </div>
          </div>
          <div style={s('flex:none;display:flex;align-items:center;gap:8px')}>
            <IconCircle
              onClick={() => navigate('/trainer/exercises')}
              size={40}
              title={tr.exerciseLibrary}
            >
              <path d="M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
            </IconCircle>
            <div onClick={() => setMenuOpen(true)} style={s('cursor:pointer')}>
              <Avatar name={profile?.full_name ?? profile?.email} size={40} />
            </div>
          </div>
        </div>

        <div
          className="input"
          style={s(
            'display:flex;align-items:center;gap:9px;height:42px;padding:0 12px;margin-top:var(--space-4)',
          )}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-neutral-600)"
            strokeWidth="2"
            strokeLinecap="round"
            style={s('flex:none')}
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            className="bare"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr.searchTrainees}
          />
        </div>
      </div>

      <div
        className="scr"
        style={s(
          'position:absolute;inset:174px 0 0;overflow-y:auto;scrollbar-width:none;padding:14px 22px 28px;display:flex;flex-direction:column;gap:12px',
        )}
      >
        {visible.map((trainee, index) => (
          <TraineeCard
            key={trainee.id}
            trainee={trainee}
            index={index}
            open={expanded === trainee.id}
            onToggle={() => setExpanded((prev) => (prev === trainee.id ? null : trainee.id))}
            onAssign={() => setAssignTarget(trainee.id)}
          />
        ))}
        {visible.length === 0 && (
          <span style={s('font:400 11.5px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)')}>
            {isPending ? tr.loading : tr.noTrainees}
          </span>
        )}
      </div>

      {target && <AssignSheet trainee={target} onClose={() => setAssignTarget(null)} />}
      {menuOpen && <AppMenu onClose={() => setMenuOpen(false)} />}
    </Screen>
  );
}
