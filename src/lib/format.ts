/** "32.5" / "80" — the canvas trims a trailing .0 and keeps one decimal. */
export function formatWeight(value: number): string {
  return Number(value).toFixed(1).replace('.0', '');
}

const HE_SHORT = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' });
const HE_LONG = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export const shortDate = (iso: string) => HE_SHORT.format(new Date(iso));
export const longDate = (iso: string) => HE_LONG.format(new Date(iso));

export function daysSince(iso: string): number {
  const then = new Date(iso);
  const a = Date.UTC(then.getFullYear(), then.getMonth(), then.getDate());
  const now = new Date();
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** "לפני שעתיים" / "לפני 3 ימים" — how long ago someone signed up. */
export function relativeSince(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return 'זה עתה';
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 2 ? 'לפני שעתיים' : `לפני ${hours} שעות`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'לפני יום';
  if (days === 2) return 'לפני יומיים';
  return `לפני ${days} ימים`;
}

/** "מרקוס אושיי" -> "מא"; falls back to the first two letters of one word. */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
}
