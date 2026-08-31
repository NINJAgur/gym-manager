import type { Lang } from '../i18n/strings';

const locale = (lang: Lang) => (lang === 'he' ? 'he-IL' : 'en-GB');

/** "32.5" / "80" — the design trims a trailing .0 and keeps one decimal. */
export function formatWeight(value: number): string {
  return Number(value).toFixed(1).replace('.0', '');
}

/** "6 Jun" */
export function shortDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(locale(lang), { day: 'numeric', month: 'short' });
}

/** "6 Jun 2026" */
export function longDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(locale(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function daysSince(iso: string): number {
  const then = new Date(iso);
  const a = Date.UTC(then.getFullYear(), then.getMonth(), then.getDate());
  const now = new Date();
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** "Marcus Osei" -> "MO"; falls back to the first two letters of one word. */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
