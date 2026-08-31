import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { s } from '../lib/css';
import { useLang } from '../i18n/LangProvider';

const OPEN = 84;
const MAX = 92;
const TRIGGER = 42;

interface Props {
  onDelete: () => void;
  onPress: () => void;
  children: ReactNode;
}

/** v2's swipe-to-unassign: the row slides aside to reveal a delete panel.
   Direction follows the writing direction, so RTL reveals on the left. */
export function SwipeRow({ onDelete, onPress, children }: Props) {
  const { dir } = useLang();
  const sign = dir === 'rtl' ? 1 : -1;

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, offset: 0, moved: 0 });

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    start.current = { x: e.clientX, offset, moved: 0 };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = e.clientX - start.current.x;
    start.current.moved = Math.max(start.current.moved, Math.abs(delta));
    const next = start.current.offset + delta;
    setOffset(sign < 0 ? Math.min(0, Math.max(-MAX, next)) : Math.max(0, Math.min(MAX, next)));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const past = Math.abs(offset) > TRIGGER;
    setOffset(past ? sign * OPEN : 0);
    // A tap is a press; a drag is not.
    if (start.current.moved < 5 && start.current.offset === 0) onPress();
  };

  return (
    <div
      style={s('position:relative;overflow:hidden;background:var(--color-accent-800)')}
    >
      <div
        onClick={onDelete}
        style={s(
          'position:absolute;top:0;inset-inline-end:0;bottom:0;width:84px;display:flex;align-items:center;justify-content:center;background:var(--color-accent);color:var(--color-bg);cursor:pointer',
        )}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
        </svg>
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={s(
          'position:relative;display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--color-bg);border:1px solid color-mix(in srgb, var(--color-text) 18%, transparent);touch-action:pan-y;user-select:none;cursor:pointer;transform:translateX(' +
            offset +
            'px);transition:' +
            (dragging ? 'none' : 'transform .28s cubic-bezier(.3,1.05,.4,1)'),
        )}
      >
        {children}
      </div>
    </div>
  );
}
