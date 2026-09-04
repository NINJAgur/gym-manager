import { useLocation, useNavigate } from 'react-router-dom';
import { s } from '../lib/css';
import { T } from '../i18n/he';

const TABS = [
  {
    to: '/trainer',
    label: T.navTrainees,
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
      </>
    ),
  },
  {
    to: '/trainer/exercises',
    label: T.navExercises,
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 3v3h6V3" />
      </>
    ),
  },
  {
    to: '/trainer/me',
    label: T.myTraining,
    icon: (
      <>
        <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
      </>
    ),
  },
  {
    to: '/trainer/users',
    label: T.navUsers,
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
];

/** The canvas's floating dark pill. Trainer-only — a trainee has one screen. */
export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      style={s(
        'position:absolute;bottom:80px;left:14px;right:14px;height:62px;background:#17181c;border-radius:31px;display:flex;align-items:center;justify-content:space-around;padding:0 8px;box-shadow:var(--shadow-nav);z-index:8',
      )}
    >
      {TABS.map((tab) => {
        const active = tab.to === '/trainer' ? pathname === '/trainer' : pathname.startsWith(tab.to);
        return (
          <button
            key={tab.to}
            type="button"
            className="hnav-item"
            data-active={active}
            onClick={() => navigate(tab.to)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={active ? 2 : 1.8}
            >
              {tab.icon}
            </svg>
            <span style={s(`font:${active ? 600 : 500} 8.5px/1`)}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
