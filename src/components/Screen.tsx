import type { ReactNode } from 'react';
import { useLang } from '../i18n/LangProvider';

/** v2's 390x812 artboard becomes the viewport: the outer ground is the body
   tint, the inner column is --color-bg and the positioning context for the
   absolute header, footer and sheets. */
export function Screen({ children }: { children: ReactNode }) {
  const { lang, dir, fontFamily } = useLang();

  return (
    <div
      dir={dir}
      data-lang={lang}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'color-mix(in srgb, var(--color-text) 9%, var(--color-bg))',
        display: 'flex',
        justifyContent: 'center',
        fontFamily,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '390px',
          height: '100%',
          background: 'var(--color-bg)',
          position: 'relative',
          overflow: 'hidden',
          // A flex column instead of the artboard's absolute insets: headers
          // and action bars size to their own content, so type can grow
          // without clipping against a hard-coded offset.
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}
