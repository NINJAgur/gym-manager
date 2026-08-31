import type { ReactNode } from 'react';
import { s } from '../lib/css';
import { Pressable } from './Pressable';

/** v2's primary action bar. Height varies by screen (56 sign-in, 46 library,
   58 form save); everything else is identical. */
export const action = (height: number) =>
  'height:' +
  height +
  'px;margin-top:0;justify-content:space-between;padding:0 20px;background:var(--color-accent);color:var(--color-bg);cursor:pointer;transition:transform .14s cubic-bezier(.34,1.5,.5,1),background .14s ease';

export const ACTION_HOVER = 'background:var(--color-accent-600)';
export const ACTION_ACTIVE = 'transform:scale(.97);background:var(--color-accent-700)';

/** v2's outlined icon circle — the form back button, the library edit pencil. */
export function IconCircle({
  onClick,
  size = 34,
  scale = 0.9,
  danger,
  title,
  children,
}: {
  onClick: () => void;
  size?: number;
  scale?: number;
  danger?: boolean;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      onClick={onClick}
      style={s(
        'flex:none;width:' +
          size +
          'px;height:' +
          size +
          'px;border-radius:50%;border:1px solid ' +
          (danger ? 'var(--color-accent);color:var(--color-accent)' : 'var(--color-text)') +
          ';display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease,background .14s ease,color .14s ease',
      )}
      hoverStyle={s(
        danger ? 'background:var(--color-accent-100)' : 'background:var(--color-neutral-200)',
      )}
      activeStyle={s(
        'transform:scale(' +
          scale +
          ')' +
          (danger ? ';background:var(--color-accent);color:var(--color-bg)' : ''),
      )}
    >
      <svg
        width={Math.round(size * 0.42)}
        height={Math.round(size * 0.42)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {title && <title>{title}</title>}
        {children}
      </svg>
    </Pressable>
  );
}
