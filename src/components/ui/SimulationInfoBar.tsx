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
    <div
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        maxWidth: 580,
        background: 'rgba(10, 13, 20, 0.94)',
        border: `1px solid ${isSim ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: 12,
        padding: '12px 16px',
        color: '#f1f5f9',
        zIndex: 22,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontSize: 12,
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 8px',
              borderRadius: 5,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono)',
              background: isSim ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isSim ? '#38bdf8' : '#fbbf24',
              border: `1px solid ${isSim ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}
          >
            {isSim ? '● SIMULASI 3D AKTIF' : '● MODE HARDWARE ARDUINO'}
          </span>

          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: isConnected ? '#4ade80' : '#94a3b8',
            }}
          >
            {isConnected ? '⚡ Arduino Terhubung (Buzzer Siap)' : '○ Arduino Belum Konek'}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {isSim && (
            <>
              {/* Reset Simulasi */}
              <button
                type="button"
                onClick={onResetSimulation}
                style={{
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Bersihkan semua mobil dan mulai ulang simulasi dari awal"
              >
                <span>🔄 Reset</span>
              </button>

              {/* Fast Violator Trigger */}
              <button
                type="button"
                onClick={onSpawnViolator}
                style={{
                  background: '#0369a1',
                  color: '#f0f9ff',
                  border: '1px solid #38bdf8',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 2px 8px rgba(3, 105, 161, 0.4)',
                }}
                title="Langsung spawn kendaraan di depan garis stop yang langsung menerobos lampu merah dalam 1 detik"
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
            <b>Simulasi Otomatis Berjalan:</b> Persimpangan 3D beroperasi mandiri ({vehicles.length} kendaraan di arena). Sinyal <code>'B'</code> otomatis dikirim ke Arduino (Buzzer Pin 32) seketika saat ada kendaraan melanggar.
          </div>
        ) : (
          <div>
            <b>Sinkronisasi Hardware Aktif:</b> Fase lampu lalu lintas di layar 3D sinkron langsung dengan program yang berjalan di Arduino Mega fisik. Pelanggaran dideteksi berdasarkan pembacaan sensor ultrasonik fisik.
          </div>
        )}
      </div>

      {/* Telemetry row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: '#94a3b8',
        }}
      >
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', color: '#64748b' }}>
          <span style={{ color: '#4ade80' }}>Sensor Barat & Timur: ON</span>
          <span>·</span>
          <span style={{ color: '#f87171' }}>Sensor Utara: BYPASS</span>
        </div>
      </div>
    </div>
  )
}
