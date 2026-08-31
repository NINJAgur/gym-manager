import { useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  style: CSSProperties;
  /** The design's `style-hover` / `style-active` attributes, as objects. */
  hoverStyle?: CSSProperties;
  activeStyle?: CSSProperties;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

/** The canvas resolved `style-hover`/`style-active` into the inline style at
   render time. Inline styles beat class rules, so the app does the same. */
export function Pressable({
  style,
  hoverStyle,
  activeStyle,
  className,
  onClick,
  disabled,
  children,
}: Props) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <div
      className={className}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      style={{
        ...style,
        ...(hover && !disabled ? hoverStyle : null),
        ...(active && !disabled ? activeStyle : null),
        ...(disabled ? { opacity: 0.45, cursor: 'not-allowed' } : null),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  );
}
