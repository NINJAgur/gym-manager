import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { s } from '../lib/css';

/** The canvas's bottom sheet: dimmed backdrop, rounded panel sliding up.
   Portalled to the body rather than positioned in place — anchored to the
   nearest positioned ancestor it took that card's height instead of the
   screen's, so a sheet opened from inside a card came out clipped. The
   wrapper carries the 390px centring so the panel keeps the animation's
   transform to itself. */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return createPortal(
    <>
      <div
        onClick={onClose}
        style={s(
          'position:fixed;inset:0;z-index:9;background:rgba(20,20,25,.4);animation:fadeIn .2s ease both',
        )}
      />
      <div
        style={s(
          'position:fixed;left:0;right:0;bottom:0;z-index:10;display:flex;justify-content:center;pointer-events:none',
        )}
      >
        <div
          dir="rtl"
          style={s(
            'pointer-events:auto;width:100%;max-width:390px;max-height:70vh;background:#fff;border-radius:24px 24px 0 0;padding:16px 20px 26px;animation:sheetUp .3s cubic-bezier(.22,1,.36,1) both;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow-sheet)',
          )}
        >
          <span style={s('font:800 17px/1.1')}>{title}</span>
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
