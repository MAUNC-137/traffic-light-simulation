import { useArenaStore } from '../../store/arenaStore'

export function SimToggle() {
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const setSim = useArenaStore((s) => s.setSimulationMode)

  return (
    <button
      type="button"
      onClick={() => setSim(!isSim)}
      className="btn"
      style={{
        background: isSim ? '#0f293a' : '#111622',
        color: isSim ? '#38bdf8' : 'var(--text-muted)',
        borderColor: isSim ? '#0284c7' : 'var(--border-subtle)',
        boxShadow: isSim ? '0 2px 10px rgba(2, 132, 199, 0.25)' : 'none',
      }}
      title={
        isSim
          ? 'Klik untuk mematikan simulasi (beralih ke kontrol Arduino fisik)'
          : 'Klik untuk mengaktifkan simulasi virtual 3D otomatis'
      }
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: isSim ? '#38bdf8' : '#475569',
          boxShadow: isSim ? '0 0 8px #38bdf8' : 'none',
          animation: isSim ? 'pulseSubtle 2s infinite ease-in-out' : 'none',
        }}
      />
      <span>{isSim ? 'SIMULASI AKTIF' : 'SIMULASI NONAKTIF'}</span>
    </button>
  )
}
