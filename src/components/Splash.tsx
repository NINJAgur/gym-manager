/** Shown while auth resolves. */
export function Splash() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '3px solid #dfe1e4',
          borderTopColor: '#e0231a',
          animation: 'spin .8s linear infinite',
        }}
      />
    </div>
  );
}
