import catalogue from './guide-exercises.json';
import hebrew from './guide-he.json';

/** Open exercise illustrations from bryllim.github.io/workout-guide — 302
   exercises, three SVG frames each, which we cycle to animate. Not video:
   the source has none, so this stands in until a real clip is uploaded. */
const BASE = 'https://bryllim.github.io/workout-guide/frames';

/** Each exercise ships three SVGs, but they are not three steps of one loop:
   frame 2 is a heavier-outlined still the catalogue uses as its thumbnail,
   while 1 and 3 are the two poses that read as movement when alternated.
   Cycling all three made the bold still flash through the animation. */
const ANIMATION_FRAMES = [1, 3];
export const GUIDE_FRAMES = ANIMATION_FRAMES.length;

export interface GuideExercise {
  slug: string;
  /** The catalogue's own English name — what auto-matching works against. */
  name: string;
  /** What the trainer actually sees. */
  he: string;
}

const HE = hebrew as Record<string, string>;

export const GUIDE: GuideExercise[] = (catalogue as { slug: string; name: string }[])
  .map((entry) => ({ ...entry, he: HE[entry.slug] ?? entry.name }))
  .sort((a, b) => a.he.localeCompare(b.he, 'he'));

export const guideName = (slug: string | null | undefined): string | null => {
  if (!slug) return null;
  return GUIDE.find((entry) => entry.slug === slug)?.he ?? slug;
};

export const guideFrame = (slug: string, frame: number) =>
  `${BASE}/${slug}/frame-${ANIMATION_FRAMES[((frame % GUIDE_FRAMES) + GUIDE_FRAMES) % GUIDE_FRAMES]}.svg`;

/** The still, for anywhere an icon is wanted rather than a demonstration. */
export const guideThumb = (slug: string) => `${BASE}/${slug}/frame-2.svg`;

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/[-_/]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** The Latin normaliser strips everything outside a-z, which erases a Hebrew
   name down to the empty string. Hebrew needs its own: drop niqqud and the
   geresh marks that vary between typists, and keep the letters. */
const normaliseHe = (value: string) =>
  value
    .replace(/[֑-ׇ]/g, '')
    .replace(/[־–—-]/g, ' ')
    .replace(/[^א-ת0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const HEBREW = /[א-ת]/;

const BY_NAME = new Map(GUIDE.map((entry) => [normalise(entry.name), entry.slug]));
const BY_HE = new Map(GUIDE.map((entry) => [normaliseHe(entry.he), entry.slug]));

/** A partial name is matched while the trainer is still typing, so a short
   needle would lock onto whatever two-letter entry it happens to sit inside. */
const MIN_MATCH = 4;

function match(needle: string, index: Map<string, string>): string | null {
  if (needle.length < MIN_MATCH) return null;

  const exact = index.get(needle);
  if (exact) return exact;

  // Then the longest catalogue name wholly contained in the exercise name,
  // so "Barbell Back Squat" still finds "Back Squat" rather than "Squat".
  let best: { slug: string; length: number } | null = null;
  for (const [candidate, slug] of index) {
    if (
      candidate.length >= MIN_MATCH &&
      (needle.includes(candidate) || candidate.includes(needle)) &&
      (!best || candidate.length > best.length)
    ) {
      best = { slug, length: candidate.length };
    }
  }
  return best?.slug ?? null;
}

/** Best-effort match on an exercise name, in whichever script it is written.
   Approximate by design: "סקוואט עם מוט" lands on plain "סקוואט", which is the
   right movement if not the exact variant — the form lets it be overridden. */
export function findGuideSlug(name: string | null | undefined): string | null {
  const raw = (name ?? '').trim();
  if (!raw) return null;
  return HEBREW.test(raw) ? match(normaliseHe(raw), BY_HE) : match(normalise(raw), BY_NAME);
}

/** Searches the Hebrew name and the English one, so a trainer can type either
   — the catalogue is English underneath and some terms are borrowed anyway. */
export function searchGuide(query: string, limit = 60): GuideExercise[] {
  const raw = query.trim();
  if (!raw) return GUIDE.slice(0, limit);

  const hebrewTerms = raw.split(/\s+/).filter(Boolean);
  const latinTerms = normalise(raw).split(' ').filter(Boolean);

  return GUIDE.filter((entry) => {
    const heWords = entry.he.split(/[\s־-]+/);
    const enWords = normalise(entry.name).split(' ');
    return (
      hebrewTerms.every((term) => heWords.some((word) => word.startsWith(term))) ||
      (latinTerms.length > 0 &&
        latinTerms.every((term) => enWords.some((word) => word.startsWith(term))))
    );
  }).slice(0, limit);
}
