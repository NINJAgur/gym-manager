import { s } from '../lib/css';
import { initials, relativeSince } from '../lib/format';
import { T } from '../i18n/he';
import { useSetAccountStatus, useTrainees } from '../hooks/useTrainer';
import type { TraineeOverview } from '../lib/types';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { BottomNav } from '../components/BottomNav';
import { TrainerHeader } from '../components/TrainerHeader';

/** Approve new sign-ups, and switch existing people on and off. Nobody reaches
   the app until the trainer lets them in. */
export function UserManagement() {
  const { data: users, isPending } = useTrainees();
  const setStatus = useSetAccountStatus();

  const pending = (users ?? []).filter((u) => u.status === 'pending');
  const decided = (users ?? []).filter((u) => u.status !== 'pending');

  return (
    <Screen>
      <TrainerHeader title={T.usersTitle} />

      <div
        className="scr"
        style={s(
          'flex:1;min-height:0;overflow-y:auto;padding:0 18px 96px;display:flex;flex-direction:column;gap:22px',
        )}
      >
        <section style={s('flex:none;display:flex;flex-direction:column;gap:10px')}>
          <span style={s('font:700 11px/1;color:#b81b13')}>
            {T.awaitingApproval} · {pending.length}
          </span>
          {pending.map((user, index) => (
            <div
              key={user.id}
              style={s(
                'flex:none;border-radius:16px;background:#fff;box-shadow:var(--shadow-card);display:flex;align-items:center;gap:12px;padding:13px 14px;animation:fadeUp .4s both;animation-delay:' +
                  index * 60 +
                  'ms',
              )}
            >
              <Avatar name={user.full_name ?? user.email} />
              <div style={s('flex:1;display:flex;flex-direction:column;gap:3px;min-width:0')}>
                <span style={s('font:600 14px/1')}>{user.full_name ?? user.email}</span>
                <span style={s('font:400 10.5px/1;color:#8b8f96')}>
                  {T.signedUp} {relativeSince(user.created_at)}
                </span>
              </div>
              <Press
                title={T.statusActive}
                onClick={() => setStatus.mutate({ id: user.id, status: 'active' })}
                style={s(
                  'width:36px;height:36px;border-radius:50%;background:#e6f6ea;color:#1c8a3e;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease',
                )}
                activeStyle={s('transform:scale(.88)')}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                >
                  <path d="m4 12.5 5 5L20 6.5" />
                </svg>
              </Press>
              <Press
                title={T.statusDeactivated}
                onClick={() => setStatus.mutate({ id: user.id, status: 'deactivated' })}
                style={s(
                  'width:36px;height:36px;border-radius:50%;background:#fdeceb;color:#b81b13;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease',
                )}
                activeStyle={s('transform:scale(.88)')}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </Press>
            </div>
          ))}
          {pending.length === 0 && (
            <span style={s('font:400 11.5px/1.6;color:#8b8f96')}>
              {isPending ? T.loading : T.noPending}
            </span>
          )}
        </section>

        <section style={s('flex:none;display:flex;flex-direction:column;gap:10px')}>
          <span style={s('font:700 11px/1;color:#8b8f96')}>
            {T.usersLabel} · {decided.length}
          </span>
          {decided.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              index={index}
              onToggle={() =>
                setStatus.mutate({
                  id: user.id,
                  status: user.status === 'active' ? 'deactivated' : 'active',
                })
              }
            />
          ))}
        </section>
      </div>

      <BottomNav />
    </Screen>
  );
}

function Avatar({ name, dim }: { name: string | null | undefined; dim?: boolean }) {
  return (
    <div
      style={s(
        'flex:none;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 13px/1;' +
          (dim ? 'background:#f4f5f7;color:#c9cbce' : 'background:#eceef0;color:#5c5f66'),
      )}
    >
      {initials(name)}
    </div>
  );
}

function UserRow({
  user,
  index,
  onToggle,
}: {
  user: TraineeOverview;
  index: number;
  onToggle: () => void;
}) {
  const active = user.status === 'active';

  return (
    <div
      style={s(
        'flex:none;border-radius:16px;background:#fff;box-shadow:var(--shadow-card);display:flex;align-items:center;gap:12px;padding:13px 14px;animation:fadeUp .4s both;animation-delay:' +
          index * 55 +
          'ms',
      )}
    >
      <Avatar name={user.full_name ?? user.email} dim={!active} />
      <div style={s('flex:1;display:flex;flex-direction:column;gap:3px;min-width:0')}>
        <span style={s('font:600 14px/1;' + (active ? 'color:#17181c' : 'color:#9ea1a7'))}>
          {user.full_name ?? user.email}
        </span>
        <span style={s('font:400 10.5px/1;color:#8b8f96')}>
          {active ? T.statusActive : T.statusDeactivated}
        </span>
      </div>
      <Press
        onClick={onToggle}
        style={s(
          'width:46px;height:28px;border-radius:14px;padding:3px;cursor:pointer;flex:none;transition:background .16s ease;' +
            (active ? 'background:#e0231a' : 'background:#dfe1e4'),
        )}
      >
        {/* translateX is physical, and the shell is RTL, so the knob travels
            the other way to land on the correct side of the track. */}
        <div
          style={s(
            'width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .18s cubic-bezier(.34,1.5,.5,1);transform:translateX(' +
              (active ? '-18px' : '0') +
              ')',
          )}
        />
      </Press>
    </div>
  );
}
