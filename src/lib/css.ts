import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

/** Parse a CSS declaration string into a React style object.
   The design canvas expressed every style as inline CSS text; keeping those
   strings verbatim and parsing them is what guarantees the rendered styles
   match the artboard exactly, rather than a hand transcription that drifts. */
export function s(text: string): CSSProperties {
  const hit = cache.get(text);
  if (hit) return hit;

  const out: Record<string, string> = {};
  for (const decl of text.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;
    out[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] =
      value;
  }

  const style = out as CSSProperties;
  cache.set(text, style);
  return style;
}

/** v2's accordion helpers, used by both the trainee groups and trainer cards. */
export const panelStyle = (open: boolean): CSSProperties =>
  s(
    'display:grid;grid-template-rows:' +
      (open ? '1fr' : '0fr') +
      ';opacity:' +
      (open ? 1 : 0) +
      ';transition:grid-template-rows .34s cubic-bezier(.3,1,.4,1),opacity .26s ease',
  );

export const chevStyle = (open: boolean): CSSProperties =>
  s(
    'flex:none;transition:transform .3s cubic-bezier(.3,1.1,.4,1);transform:rotate(' +
      (open ? 180 : 0) +
      'deg)',
  );
