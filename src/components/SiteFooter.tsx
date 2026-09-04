import { s } from '../lib/css';
import { T } from '../i18n/he';

/** CC BY-SA wants the creator and the source named, not just the licence. */
const SOURCE = {
  target: '_blank',
  rel: 'noreferrer',
  style: s('color:#a4a7ac;text-decoration:underline'),
} as const;

/** Two lines: who made it, then who the illustrations came from. `full` adds
 * the privacy link and the licence, for the public homepage.
 *
 * The two lines are not a choice — at 130px and 340px they cannot share the
 * design's 390px. BottomNav is lifted to clear the height that costs. */
export function SiteFooter({ full = false }: { full?: boolean }) {
  return (
    <footer
      style={s(
        'flex:none;margin-top:auto;display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:4px 8px;padding:12px 16px;text-align:center',
      )}
    >
      <span style={s('font:600 10.5px/1.6;color:#8b8f96')}>{T.credits}</span>

      {full && (
        <>
          <span style={s('font:400 10.5px/1.6;color:#c9cbce')}>·</span>
          <a href="/privacy" style={s('font:600 10.5px/1.6;color:#b81b13')}>
            {T.privacyPolicy}
          </a>
          <span style={s('font:400 10.5px/1.6;color:#c9cbce')}>·</span>
        </>
      )}

      <span style={s('font:400 10.5px/1.6;color:#a4a7ac')}>
        {T.videoCredit}{' '}
        <a href="https://github.com/everkinetic/data" {...SOURCE}>
          Everkinetic
        </a>{' '}
        {T.videoCreditVia}{' '}
        <a href="https://github.com/bryllim/workout-guide" {...SOURCE}>
          Workout Guide
        </a>
        {full && (
          <>
            {', '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" {...SOURCE}>
              {T.illustrationLicence}
            </a>
          </>
        )}
      </span>
    </footer>
  );
}
