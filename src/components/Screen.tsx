import type { ReactNode } from 'react';

/** The canvas's 390x812 artboard becomes the viewport: same ground, same
   overflow clip, same positioning context for sheets and the bottom nav.
   Capped at the design width and centred so wide screens do not stretch it. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--ground)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '390px',
          height: '100%',
          background: 'var(--bg)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}
