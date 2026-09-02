import { useNavigate } from 'react-router-dom';
import { s } from '../lib/css';
import { useAuth } from '../auth/AuthProvider';
import { homeFor } from '../App';
import { Press } from '../components/Press';
import { APP_NAME } from '../lib/app';

const POINTS = [
  'המאמן בונה תוכנית אימון — כללית או מפוצלת לפי ימים — ומשייך אותה למתאמן.',
  'המתאמן רואה את התוכנית כטבלה: תרגיל, סטים, חזרות ומשקל, בדיוק כמו בגיליון.',
  'לכל תרגיל יש סרטון הדגמה, תיאור ומספר מכשיר, כך שאין צורך לזכור דגשים.',
  'המאמן קובע חזרות ומשקל, המתאמן מעדכן משקל בלבד, וגרף מציג את ההתקדמות.',
];

/** The public homepage. Readable without signing in: Google's OAuth branding
   review rejects a homepage that is only a login screen. */
export function Landing() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        background: 'var(--ground)',
      }}
    >
      <div
        style={s(
          'max-width:720px;margin:0 auto;min-height:100%;background:#f4f5f7;padding:34px 22px 60px;display:flex;flex-direction:column;gap:28px',
        )}
      >
        <header style={s('display:flex;align-items:center;gap:11px')}>
          {/* The app mark: a dumbbell whose bar is a rising progress line. */}
          <svg width="46" height="46" viewBox="0 0 64 64" style={s('flex:none')} aria-hidden="true">
            <rect width="64" height="64" rx="15" fill="#fff" />
            <g fill="#17181c">
              <rect x="6" y="19" width="9" height="26" rx="3.5" />
              <rect x="17" y="25" width="6" height="14" rx="2.5" />
              <rect x="41" y="25" width="6" height="14" rx="2.5" />
              <rect x="49" y="19" width="9" height="26" rx="3.5" />
            </g>
            <path
              d="M23 38 L29.5 31.5 L36 35 L41 27"
              fill="none"
              stroke="#e0231a"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={s('font:800 18px/1.1')}>{APP_NAME}</span>
        </header>

        <section style={s('display:flex;flex-direction:column;gap:12px;animation:fadeUp .4s both')}>
          <h1 style={s('font:800 30px/1.15;margin:0')}>המאמן קובע. אתה מתאמן.</h1>
          <p style={s('font:400 15px/1.7;color:#5c5f66;margin:0;text-wrap:pretty')}>
            כלי פרטי למאמן אישי ולמתאמנים שלו. המאמן בונה תוכניות אימון ומשייך אותן; המתאמן פותח
            את האפליקציה בחדר הכושר ורואה בדיוק מה לעשות, עם סרטון הדגמה והיסטוריית התקדמות.
          </p>
        </section>

        <section style={s('display:flex;flex-direction:column;gap:10px')}>
          {POINTS.map((point, index) => (
            <div
              key={index}
              style={s(
                'display:flex;gap:12px;padding:14px;border-radius:16px;background:#fff;box-shadow:var(--shadow-card);animation:fadeUp .4s both;animation-delay:' +
                  index * 60 +
                  'ms',
              )}
            >
              <span
                className="num"
                style={s(
                  'flex:none;width:24px;height:24px;border-radius:8px;background:#fdeceb;color:#b81b13;display:flex;align-items:center;justify-content:center;font:700 11px/1',
                )}
              >
                {index + 1}
              </span>
              <span style={s('font:400 13.5px/1.6;color:#5c5f66;text-wrap:pretty')}>{point}</span>
            </div>
          ))}
        </section>

        <Press
          onClick={() => navigate(session && profile ? homeFor(profile.role) : '/app')}
          style={s(
            'height:56px;border-radius:18px;background:#e0231a;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1)',
          )}
          activeStyle={s('transform:scale(.97)')}
        >
          {/* The same words either way now that sign-in offers two methods:
              the button leads to the choice rather than naming one. */}
          <span style={s('font:700 15.5px/1')}>כניסה לאפליקציה</span>
        </Press>

        <footer
          style={s(
            'margin-top:auto;padding-top:20px;border-top:1px solid #dfe1e4;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:baseline',
          )}
        >
          <span style={s('font:400 11.5px/1.5;color:#8b8f96')}>
            התחברות עם חשבון Google או עם קוד לדוא״ל. המאמן מאשר גישה לחשבון חדש.
          </span>
          <a href="/privacy" style={s('font:600 11.5px/1.5;color:#b81b13')}>
            מדיניות פרטיות
          </a>
        </footer>
      </div>
    </div>
  );
}
