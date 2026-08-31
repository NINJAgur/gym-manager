export const VIDEO_BUCKET = 'exercise-videos';

const PUBLIC_PREFIX = `/storage/v1/object/public/${VIDEO_BUCKET}/`;

/** The object path if this URL is a file we uploaded, otherwise null.
   Guards the cleanup: a pasted YouTube link is not ours to delete. */
export function storagePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const at = url.indexOf(PUBLIC_PREFIX);
  if (at < 0) return null;
  const path = url.slice(at + PUBLIC_PREFIX.length).split(/[?#]/)[0];
  return path ? decodeURIComponent(path) : null;
}

export type VideoSource =
  | { kind: 'iframe'; src: string }
  | { kind: 'file'; src: string }
  | null;

/** Turns whatever the trainer pasted into something embeddable.
   YouTube and Vimeo become player iframes; anything else is treated as a
   direct media file and handed to <video>. */
export function videoSource(url: string | null | undefined): VideoSource {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  const host = parsed.hostname.replace(/^www\./, '');
  const youtube = (id: string) => ({
    kind: 'iframe' as const,
    src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
  });

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1);
    return id ? youtube(id) : null;
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const fromQuery = parsed.searchParams.get('v');
    if (fromQuery) return youtube(fromQuery);
    const match = parsed.pathname.match(/^\/(?:embed|shorts|v)\/([^/]+)/);
    return match ? youtube(match[1]) : null;
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
    return /^\d+$/.test(id)
      ? { kind: 'iframe', src: `https://player.vimeo.com/video/${id}?autoplay=1` }
      : null;
  }

  return { kind: 'file', src: trimmed };
}
