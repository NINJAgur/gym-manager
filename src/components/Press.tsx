import { useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  style: CSSProperties;
  /** The canvas's `style-active`, applied while pressed. */
  activeStyle?: CSSProperties;
  hoverStyle?: CSSProperties;
  className?: string;
  title?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

/** The canvas resolved `style-active` into the inline style at render time.
   Inline styles beat class rules, so the app does the same. */
export function Press({
  style,
  activeStyle,
  hoverStyle,
  className,
  title,
  onClick,
  disabled,
  children,
}: Props) {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div
      className={className}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      title={title}
      style={{
        ...style,
        ...(hover && !disabled ? hoverStyle : null),
        ...(active && !disabled ? activeStyle : null),
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : null),
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
