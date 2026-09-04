import { s } from '../lib/css';
import { T } from '../i18n/he';

/** One line on every screen: who made it, and the privacy link.
 *
 * `full` adds the media licence, which belongs where someone would go looking
 * for it — the public homepage and the privacy page — rather than under every
 * screen in the app. */
export function SiteFooter({ full = false }: { full?: boolean }) {
  return (
    <footer
      style={s(
        'flex:none;margin-top:auto;display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:4px 8px;padding:12px 16px;text-align:center',
      )}
    >
      <span style={s('font:600 10.5px/1.6;color:#8b8f96')}>{T.credits}</span>
      <span style={s('font:400 10.5px/1.6;color:#c9cbce')}>·</span>
      <a href="/privacy" style={s('font:600 10.5px/1.6;color:#b81b13')}>
        {T.privacyPolicy}
      </a>

      {full && (
        <>
          <span style={s('font:400 10.5px/1.6;color:#c9cbce')}>·</span>
          <span style={s('font:400 10.5px/1.6;color:#a4a7ac')}>
            {T.videoCredit}{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
              style={s('color:#a4a7ac;text-decoration:underline')}
            >
              {T.illustrationLicence}
            </a>
          </span>
        </>
      )}
    </footer>
  );
}
