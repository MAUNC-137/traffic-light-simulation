import { useArenaStore } from '../../store/arenaStore'

interface Props {
  isConnected: boolean
  onSpawnViolator: () => void
  onResetSimulation: () => void
}

export function SimulationInfoBar({
  isConnected,
  onSpawnViolator,
  onResetSimulation,
}: Props) {
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const phase = useArenaStore((s) => s.phase)
  const vehicles = useArenaStore((s) => s.vehicles)

  return (
    <div className={`info-bar ${isSim ? 'sim-active' : ''}`}>
      {/* Header bar */}
      <div className="info-bar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`mode-tag ${isSim ? 'sim' : 'hardware'}`}>
            {isSim ? '● SIMULASI 3D AKTIF' : '● MODE HARDWARE ARDUINO'}
          </span>

          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: isConnected ? '#4ade80' : 'var(--text-muted)',
            }}
          >
            {isConnected ? '⚡ Arduino Terhubung (Buzzer Siap)' : '○ Arduino Belum Konek'}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isSim && (
            <>
              {/* Reset Simulation */}
              <button
                type="button"
                onClick={onResetSimulation}
                className="btn btn-neutral btn-sm"
                title="Bersihkan semua mobil dan mulai ulang simulasi dari awal"
              >
                <span>🔄 Reset</span>
              </button>

              {/* Fast Violator Trigger */}
              <button
                type="button"
                onClick={onSpawnViolator}
                className="btn btn-sky btn-sm"
                title="Langsung spawn kendaraan di depan garis stop yang langsung menerobos lampu merah"
              >
                <span>🚗+ Pancing Pelanggar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ color: '#cbd5e1', fontSize: 11.5, lineHeight: 1.5 }}>
        {isSim ? (
          <div>
            <b>Simulasi Otomatis Berjalan:</b> Persimpangan 3D beroperasi mandiri ({vehicles.length} kendaraan di arena). Sinyal <code>&apos;B&apos;</code> otomatis dikirim ke Arduino (Buzzer Pin 32) dan speaker browser berbunyi saat ada kendaraan melanggar.
          </div>
        ) : (
          <div>
            <b>Sinkronisasi Hardware Aktif:</b> Fase lampu lalu lintas 3D sinkron langsung dengan program yang berjalan di Arduino Mega fisik. Pelanggaran dideteksi berdasarkan pembacaan sensor ultrasonik fisik.
          </div>
        )}
      </div>

      {/* Telemetry Row */}
      <div className="telemetry-row">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>TL1 (Timur):</span>
          <b style={{ color: phase.TL1 === 'HIJAU' ? '#4ade80' : phase.TL1 === 'KUNING' ? '#facc15' : '#f87171' }}>
            {phase.TL1}
          </b>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>TL2 (Barat):</span>
          <b style={{ color: phase.TL2 === 'HIJAU' ? '#4ade80' : phase.TL2 === 'KUNING' ? '#facc15' : '#f87171' }}>
            {phase.TL2}
          </b>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>TL3 (Utara):</span>
          <b style={{ color: phase.TL3 === 'HIJAU' ? '#4ade80' : phase.TL3 === 'KUNING' ? '#facc15' : '#f87171' }}>
            {phase.TL3}
          </b>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-dim)' }}>
          <span style={{ color: '#4ade80' }}>Sensor Barat & Timur: ON</span>
          <span>·</span>
          <span style={{ color: '#f87171' }}>Sensor Utara: BYPASS</span>
        </div>
      </div>
    </div>
  )
}
