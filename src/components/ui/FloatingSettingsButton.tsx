export function FloatingSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 20,
        height: 48,
        padding: '0 18px',
        borderRadius: 24,
        border: '1px solid #333',
        background: '#111',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 700,
      }}
    >
      SET
    </button>
  )
}
