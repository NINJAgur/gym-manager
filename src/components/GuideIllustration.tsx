import { useEffect, useState } from 'react';
import { s } from '../lib/css';
import { GUIDE_FRAMES, guideFrame, guideThumb } from '../lib/guide';

/** Cycles the guide's three SVG frames into a demonstration loop. Frames are
   preloaded before the animation starts, otherwise the first pass stutters
   while each one is fetched. */
export function GuideIllustration({
  slug,
  fps = 1.6,
  still = false,
}: {
  slug: string;
  fps?: number;
  /** Shows the catalogue's thumbnail instead of animating. */
  still?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (still) return;
    setReady(false);
    let live = true;
    Promise.all(
      Array.from({ length: GUIDE_FRAMES }, (_, i) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => resolve();
          img.src = guideFrame(slug, i);
        });
      }),
    ).then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [slug, still]);

  useEffect(() => {
    if (!ready || still) return;
    const timer = setInterval(() => setFrame((f) => f + 1), 1000 / fps);
    return () => clearInterval(timer);
  }, [ready, fps, still]);

  return (
    <img
      src={still ? guideThumb(slug) : guideFrame(slug, frame)}
      alt=""
      // The source draws white figures for its own dark theme — a single
      // #fff fill, nothing else — so they are invisible on our light ground.
      // Inverting turns the silhouette to ink and leaves the background
      // transparent; the opacity softens pure black towards --text.
      style={s(
        'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:8px;filter:invert(1);opacity:.86',
      )}
    />
  );
}
