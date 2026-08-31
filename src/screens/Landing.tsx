import { useNavigate } from 'react-router-dom';
import { s } from '../lib/css';
import { useAuth } from '../auth/AuthProvider';
import { useLang } from '../i18n/LangProvider';
import { homeFor } from '../auth/RequireRole';
import { Pressable } from '../components/Pressable';
import { LangToggle } from '../components/LangToggle';
import { ACTION_ACTIVE, ACTION_HOVER, action } from '../components/CircleButton';
import { APP_NAME } from '../lib/app';

/** The public homepage. Deliberately readable without signing in: Google's
   OAuth branding review rejects a homepage that is just a login screen, and
   requires it to explain what the app does under a matching app name. */
export function Landing() {
  const { session, profile } = useAuth();
  const { tr, lang, dir, fontFamily } = useLang();
  const navigate = useNavigate();

  const points = [tr.sellPoint1, tr.sellPoint2, tr.sellPoint3, tr.sellPoint4];

  return (
    <div
      dir={dir}
      data-lang={lang}
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        background: 'color-mix(in srgb, var(--color-text) 9%, var(--color-bg))',
        fontFamily,
      }}
    >
      <div
        style={s(
          'max-width:720px;margin:0 auto;min-height:100%;background:var(--color-bg);padding:34px 22px 60px;display:flex;flex-direction:column;gap:34px',
        )}
      >
        <header style={s('display:flex;align-items:center;justify-content:space-between;gap:16px')}>
          <div style={s('display:flex;align-items:center;gap:11px;min-width:0')}>
            {/* Inlined rather than <img src="/favicon.svg">: the file has no
                intrinsic size, so Chromium renders it as a broken image. */}
            <svg width="34" height="34" viewBox="0 0 64 64" style={s('flex:none')} aria-hidden="true">
              <rect x="4" y="18" width="9" height="28" fill="var(--color-text)" />
              <rect x="15" y="24" width="6" height="16" fill="var(--color-text)" />
              <rect x="43" y="24" width="6" height="16" fill="var(--color-text)" />
              <rect x="51" y="18" width="9" height="28" fill="var(--color-text)" />
              <path
                d="M21 38 L28 31 L35 35 L43 26"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={s('font:800 17px/1.05 Archivo,sans-serif;letter-spacing:-.02em')}
            >
              {APP_NAME}
            </span>
          </div>
          <LangToggle />
        </header>

        <div style={s('height:2px;background:var(--color-text)')} />

        <section style={s('display:flex;flex-direction:column;gap:14px;animation:fadeUp .4s both')}>
          <span
            style={s(
              'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:var(--color-accent-700)',
            )}
          >
            {tr.perfTracker}
          </span>
          <h1 style={s('font:800 34px/1.06 Archivo,sans-serif;letter-spacing:-.03em;margin:0')}>
            {tr.landingHeadline}
          </h1>
          <p
            style={s(
              'font:400 15px/1.65 Archivo,sans-serif;color:var(--color-neutral-700);margin:0;text-wrap:pretty',
            )}
          >
            {tr.landingIntro}
          </p>
        </section>

        <section style={s('display:flex;flex-direction:column;gap:0')}>
          {points.map((point, index) => (
            <div
              key={index}
              style={s(
                'display:flex;gap:13px;padding:15px 0;border-bottom:1px solid color-mix(in srgb, var(--color-text) 16%, transparent);animation:fadeUp .4s both;animation-delay:' +
                  index * 60 +
                  'ms',
              )}
            >
              <span
                style={s(
                  'flex:none;width:22px;height:22px;background:var(--color-accent);color:var(--color-bg);display:flex;align-items:center;justify-content:center;font:700 11px/1 Archivo,sans-serif',
                )}
              >
                {index + 1}
              </span>
              <span
                style={s(
                  'font:400 14px/1.6 Archivo,sans-serif;color:var(--color-neutral-700);text-wrap:pretty',
                )}
              >
                {point}
              </span>
            </div>
          ))}
        </section>

        <Pressable
          className="btn btn-primary btn-block"
          onClick={() =>
            navigate(session && profile ? homeFor(profile.role) : '/signin')
          }
          style={s(action(58))}
          hoverStyle={s(ACTION_HOVER)}
          activeStyle={s(ACTION_ACTIVE)}
        >
          <span style={s('font:700 16px/1 Archivo,sans-serif')}>
            {session && profile ? tr.openApp : tr.continueGoogle}
          </span>
          <svg
            className="dir-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </Pressable>

        <footer
          style={s(
            'margin-top:auto;padding-top:22px;border-top:1px solid color-mix(in srgb, var(--color-text) 16%, transparent);display:flex;flex-wrap:wrap;gap:14px;align-items:baseline;justify-content:space-between',
          )}
        >
          <span style={s('font:400 11.5px/1.5 Archivo,sans-serif;color:var(--color-neutral-600)')}>
            {tr.landingFooter}
          </span>
          <a
            href="/privacy"
            style={s('font:600 11.5px/1.5 Archivo,sans-serif;color:var(--color-accent-700)')}
          >
            {tr.privacyPolicy}
          </a>
        </footer>
      </div>
    </div>
  );
}
