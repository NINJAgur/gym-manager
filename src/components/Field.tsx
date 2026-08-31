import type { ReactNode } from 'react';
import { s } from '../lib/css';

/** v2 has no forms, so this borrows its section idiom: an uppercase rule-less
   label over the design system's .input shell. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div style={s('display:flex;flex-direction:column;gap:8px')}>
      <span
        style={s('font:700 11px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase')}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span style={s('font:400 10.5px/1.4 Archivo,sans-serif;color:var(--color-neutral-600)')}>
          {hint}
        </span>
      )}
    </div>
  );
}
