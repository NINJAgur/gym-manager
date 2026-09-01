import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

/** The canvas is a 390px artboard viewed at 1:1, so its type is small on a
 * real screen. Sizes are emitted against --type-scale (theme.css) rather than
 * baked in, so the whole app retunes from one number. */
const scaled = (px: string) => `calc(${px}px * var(--type-scale, 1))`;

/** `font: 600 12.5px/1.2` — the shorthand cannot carry a calc() in its size
 * slot portably, so it is split into longhands. The canvas omits the family
 * (everything inherits Noto Sans Hebrew), so family is optional here. */
const FONT_SHORTHAND = /^(\d+)\s+([\d.]+)px(?:\/([\d.]+))?(?:\s+(.+))?$/;

function expandFont(value: string): Record<string, string> | null {
  const match = FONT_SHORTHAND.exec(value);
  if (!match) return null;
  const [, weight, size, lineHeight, family] = match;
  return {
    fontWeight: weight,
    fontSize: scaled(size),
    ...(lineHeight ? { lineHeight } : null),
    ...(family ? { fontFamily: family } : null),
  };
}

/** Parse a CSS declaration string into a React style object.
   The design canvas expressed every style as inline CSS text; keeping those
   strings verbatim and parsing them is what guarantees the rendered styles
   match the artboard, rather than a hand transcription that drifts. */
export function s(text: string): CSSProperties {
  const hit = cache.get(text);
  if (hit) return hit;

  const out: Record<string, string> = {};
  for (const decl of text.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    let value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;

    if (prop === 'font') {
      const longhands = expandFont(value);
      if (longhands) {
        Object.assign(out, longhands);
        continue;
      }
    } else if (prop === 'font-size') {
      const px = /^([\d.]+)px$/.exec(value);
      if (px) value = scaled(px[1]);
    }

    out[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] =
      value;
  }

  const style = out as CSSProperties;
  cache.set(text, style);
  return style;
}

/** The canvas's accordion helpers. */
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
