/** Shown while auth resolves — the ground plus the design's accent rule. */
export function Splash() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'color-mix(in srgb, var(--color-text) 9%, var(--color-bg))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '72px', height: '2px', background: 'var(--color-accent)' }} />
    </div>
  );
}
