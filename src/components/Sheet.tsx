import type { ReactNode } from 'react';
import { s } from '../lib/css';
import { Pressable } from './Pressable';

interface Props {
  kicker: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** v2's bottom sheet — dimmed backdrop plus a panel that slides up. */
export function Sheet({ kicker, title, onClose, children, footer }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        style={s(
          'position:absolute;inset:0;z-index:9;background:color-mix(in srgb, var(--color-text) 42%, transparent);animation:fadeIn .2s ease both',
        )}
      />
      <div
        style={s(
          'position:absolute;left:0;right:0;bottom:0;z-index:10;background:var(--color-bg);border-top:2px solid var(--color-text);padding:16px 22px 26px;animation:sheetUp .3s cubic-bezier(.22,1,.36,1) both;max-height:78%;display:flex;flex-direction:column;gap:14px',
        )}
      >
        <div style={s('display:flex;align-items:flex-start;justify-content:space-between;gap:12px')}>
          <div style={s('display:flex;flex-direction:column;gap:5px;min-width:0')}>
            <span
              style={s(
                'font:600 9.5px/1 Archivo,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--color-neutral-600)',
              )}
            >
              {kicker}
            </span>
            <span
              style={s(
                'font:800 19px/1.08 Archivo,sans-serif;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
              )}
            >
              {title}
            </span>
          </div>
          <Pressable
            onClick={onClose}
            style={s(
              'flex:none;width:34px;height:34px;border-radius:50%;border:1px solid var(--color-divider);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease,background .14s ease',
            )}
            hoverStyle={s('background:var(--color-neutral-200)')}
            activeStyle={s('transform:scale(.9)')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Pressable>
        </div>

        {children}

        {footer}
      </div>
    </>
  );
}
