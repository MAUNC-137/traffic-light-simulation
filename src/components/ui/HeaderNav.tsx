import { SimToggle } from './SimToggle'

interface Props {
  isConnected: boolean
  isSim: boolean
  onConnectToggle: () => void
  onOpenSettings: () => void
  onTestAlarm: () => void
}

export function HeaderNav({
  isConnected,
  isSim,
  onConnectToggle,
  onOpenSettings,
  onTestAlarm,
}: Props) {
  return (
    <header className="top-nav">
      {/* Brand & Connection Badge */}
      <div className="brand-badge">
        <div className="brand-title">
          <span style={{ color: 'var(--accent-cyan)' }}>◈</span>
          <span>SMARTCROSS</span>
        </div>

        <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span style={{ color: isConnected ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            {isConnected ? 'SERIAL CONNECTED' : 'SERIAL OFF'}
          </span>
        </div>
      </div>

      {/* Simulation / Hardware Mode Toggle */}
      <SimToggle />

      {/* Connect WebSerial Button */}
      <button
        type="button"
        onClick={onConnectToggle}
        className={`btn ${isConnected ? 'btn-danger-outline' : 'btn-emerald'}`}
      >
        <span>{isConnected ? '✕ Disconnect Port' : '🔌 Connect Arduino'}</span>
      </button>

      {/* Hardware Config Button */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="btn btn-neutral"
        title="Buka panel konfigurasi pin hardware dan serial monitor langsung"
      >
        <span>⚙️ Hardware Config</span>
      </button>

      {/* Manual Test Alarm Button */}
      <button
        type="button"
        onClick={onTestAlarm}
        className="btn btn-crimson"
        title={
          isSim
            ? 'Tes pelanggaran simulasi (memotret CCTV, bunyikan alarm buzzer & speaker)'
            : 'Tes pelanggaran fisik (log error hardware & bunyikan buzzer)'
        }
      >
        <span>🚨 Tes Alarm {isSim ? '(Simulasi)' : '(Fisik)'}</span>
      </button>
    </header>
  )
}
