// Standard loading screen with optional emoji + title + subtitle.
// Replaces ad-hoc loading blocks scattered across views.
export function LoadingState({ emoji = '⏳', title = 'Loading…', subtitle, padded = true }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        textAlign: 'center',
        padding: padded ? '60px 20px' : '20px',
        color: 'var(--text-main)',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '16px',
          animation: 'fluent-pulse 1.6s ease-in-out infinite',
        }}
      >
        {emoji}
      </div>
      <h2 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>{title}</h2>
      {subtitle && (
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subtitle}</p>
      )}
      <style>{`
        @keyframes fluent-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
