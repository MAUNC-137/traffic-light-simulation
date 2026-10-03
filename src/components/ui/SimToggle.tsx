import { useArenaStore } from '../../store/arenaStore'

export function SimToggle() {
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const setSim = useArenaStore((s) => s.setSimulationMode)
  return (
    <button
      type="button"
      onClick={() => setSim(!isSim)}
      style={{
        background: isSim ? '#7c3aed' : '#111827',
        color: '#fff',
        border: `1px solid ${isSim ? '#a78bfa' : '#334155'}`,
        borderRadius: 10,
        padding: '8px 12px',
        fontWeight: 800,
        letterSpacing: 0.4,
        cursor: 'pointer',
        boxShadow: '0 6px 14px rgba(0,0,0,.35)',
      }}
      title={isSim ? 'Matikan simulasi, kembali ke hardware' : 'Jalankan simulasi otomatis'}
    >
      {isSim ? '● SIM ON' : '○ SIM OFF'}
    </button>
  )
}
