import { useEffect, useState } from 'react';
import { s } from '../lib/css';
import { GUIDE_FRAMES, guideFrame, guideThumb } from '../lib/guide';

/** Two poses, cross-faded.
 *
 * The poses are not registered to each other — the figure is drawn at a
 * different size in each, so fading one into the other made the body appear to
 * zoom. The first frame is scaled up to meet the second, which takes most of
 * that out. It is one factor for all 302 exercises rather than a measured one
 * per exercise, so it is a correction rather than a cure: it suits the curls
 * and presses, and a pose that changes shape completely still shifts a little.
 *
 * The art is a white silhouette drawn for the source's dark theme, so the file
 * is used as a mask and filled with ink rather than colour-shifted. */
const INK = '#17181c';
const FRAME_SCALE = [1.1, 1];

const layer = (url: string, visible: boolean, scale: number) =>
  'position:absolute;inset:8px;' +
  `background-color:${INK};` +
  `-webkit-mask:url(${url}) center center / contain no-repeat;` +
  `mask:url(${url}) center center / contain no-repeat;` +
  `transform:scale(${scale});` +
  'transition:opacity .5s ease-in-out;opacity:' +
  (visible ? '.9' : '0');

export function GuideIllustration({
  slug,
  fps = 0.7,
  still = false,
}: {
  slug: string;
  fps?: number;
  /** Shows the catalogue's own thumbnail instead of animating. */
  still?: boolean;
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (still) return;
    const timer = setInterval(() => setFrame((f) => f + 1), 1000 / fps);
    return () => clearInterval(timer);
  }, [still, fps]);

  if (still) return <div style={s(layer(guideThumb(slug), true, 1))} />;

  return (
    <>
      {Array.from({ length: GUIDE_FRAMES }, (_, i) => (
        <div
          key={i}
          style={s(layer(guideFrame(slug, i), i === frame % GUIDE_FRAMES, FRAME_SCALE[i] ?? 1))}
        />
      ))}
    </>
  );
}
