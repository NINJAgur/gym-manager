import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

/** The canvas authored type for a 390px artboard viewed at 1:1, which leaves
 * the 9-11px labels hard to read on a real screen.
 *
 * The boost cannot be uniform. Small labels need a lot of it; display sizes
 * need almost none, and overscaling them makes headings wrap and shout. So
 * each size is emitted against one of three variables chosen by how large it
 * already is, letting the ramp differ per script — Archivo needs its large end
 * held back where Noto Sans Hebrew does not. Values in i18n/LangProvider. */
const bucket = (px: number) => (px < 13 ? 'sm' : px <= 24 ? 'md' : 'lg');
const scaled = (px: string) => `calc(${px}px * var(--type-${bucket(Number(px))}, 1))`;

/** `font: 600 10px/1.2 Archivo,sans-serif`. The shorthand cannot carry a
 * calc() in its size slot portably, so it is split into longhands. */
const FONT_SHORTHAND = /^(\d+)\s+([\d.]+)px(?:\/([\d.]+))?\s+(.+)$/;

function expandFont(value: string): Record<string, string> | null {
  const match = FONT_SHORTHAND.exec(value);
  if (!match) return null;
  const [, weight, size, lineHeight, family] = match;
  return {
    fontWeight: weight,
    fontSize: scaled(size),
    ...(lineHeight ? { lineHeight } : null),
    fontFamily: family,
  };
}

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
