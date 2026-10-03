import type { PinConfig } from '../../types/pins'

interface Props {
  open: boolean
  onClose: () => void
  pins: PinConfig
  setPins: (p: PinConfig) => void
  onSave: () => void
  onConnect: () => void
  onDisconnect: () => void
  onTestBuzzer?: () => void
  isConnected: boolean
  isSupported: boolean
  logs: string[]
}

export function SettingsModal({ open, onClose, pins, setPins, onSave, onConnect, onDisconnect, onTestBuzzer, isConnected, isSupported, logs }: Props) {
  if (!open) return null

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div style={{ width: 420, maxWidth: '92vw', height: '100%', background: '#101318', color: '#fff', padding: 18, overflowY: 'auto', borderLeft: '1px solid #2a2e36', display: 'flex', flexDirection: 'column', gap: 14 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Arduino Mega Pin Config</h2>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Konfigurasi Hardware SmartCross</div>
          </div>
          <button type="button" onClick={onClose} style={{ background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>X</button>
        </div>

        <div style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: isSupported ? (isConnected ? 'rgba(74,222,128,0.1)' : 'rgba(56,189,248,0.1)') : 'rgba(239,68,68,0.1)', color: isSupported ? (isConnected ? '#4ade80' : '#38bdf8') : '#f87171', border: `1px solid ${isSupported ? (isConnected ? '#166534' : '#0369a1') : '#991b1b'}` }}>
          {isSupported
            ? (isConnected ? '● Terhubung ke Arduino (9600 Baud)' : '○ WebSerial Siap (Klik Connect)')
            : '❌ WebSerial hanya didukung di Google Chrome / MS Edge (via localhost/HTTPS)'}
        </div>

        {/* Section 1: Timur */}
        <div style={{ background: '#161b22', padding: 12, borderRadius: 10, border: '1px solid #30363d' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#58a6ff', marginBottom: 6 }}>
            📍 JALUR TIMUR (TL1) <span style={{ fontSize: 11, color: '#4ade80' }}>● Sensor Aktif</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11 }}>R: <input type="number" value={pins.TL1_RED} onChange={(e) => setPins({ ...pins, TL1_RED: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>Y: <input type="number" value={pins.TL1_YEL} onChange={(e) => setPins({ ...pins, TL1_YEL: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>G: <input type="number" value={pins.TL1_GRN} onChange={(e) => setPins({ ...pins, TL1_GRN: Number(e.target.value) })} style={inputStyle} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
            <label style={{ fontSize: 11 }}>Trig Pin: <input type="number" value={pins.TRIG1} onChange={(e) => setPins({ ...pins, TRIG1: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>Echo Pin: <input type="number" value={pins.ECHO1} onChange={(e) => setPins({ ...pins, ECHO1: Number(e.target.value) })} style={inputStyle} /></label>
          </div>
        </div>

        {/* Section 2: Barat */}
        <div style={{ background: '#161b22', padding: 12, borderRadius: 10, border: '1px solid #30363d' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#58a6ff', marginBottom: 6 }}>
            📍 JALUR BARAT (TL2) <span style={{ fontSize: 11, color: '#4ade80' }}>● Sensor Aktif</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11 }}>R: <input type="number" value={pins.TL2_RED} onChange={(e) => setPins({ ...pins, TL2_RED: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>Y: <input type="number" value={pins.TL2_YEL} onChange={(e) => setPins({ ...pins, TL2_YEL: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>G: <input type="number" value={pins.TL2_GRN} onChange={(e) => setPins({ ...pins, TL2_GRN: Number(e.target.value) })} style={inputStyle} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
            <label style={{ fontSize: 11 }}>Trig Pin: <input type="number" value={pins.TRIG2} onChange={(e) => setPins({ ...pins, TRIG2: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>Echo Pin: <input type="number" value={pins.ECHO2} onChange={(e) => setPins({ ...pins, ECHO2: Number(e.target.value) })} style={inputStyle} /></label>
          </div>
        </div>

        {/* Section 3: Utara */}
        <div style={{ background: '#1a161b', padding: 12, borderRadius: 10, border: '1px solid #4a2830' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#f87171', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>📍 JALUR UTARA (TL3)</span>
            <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 4 }}>SENSOR RUSAK / OFF</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11 }}>R: <input type="number" value={pins.TL3_RED} onChange={(e) => setPins({ ...pins, TL3_RED: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>Y: <input type="number" value={pins.TL3_YEL} onChange={(e) => setPins({ ...pins, TL3_YEL: Number(e.target.value) })} style={inputStyle} /></label>
            <label style={{ fontSize: 11 }}>G: <input type="number" value={pins.TL3_GRN} onChange={(e) => setPins({ ...pins, TL3_GRN: Number(e.target.value) })} style={inputStyle} /></label>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: '#fca5a5' }}>
            * Jalur Utara hanya mengontrol lampu lalu lintas (Sensor ultrasonik dilewati/bypass karena rusak).
          </div>
        </div>

        {/* Section 4: Buzzer */}
        <div style={{ background: '#161b22', padding: 12, borderRadius: 10, border: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>BUZZER PIN:</span>
            <input type="number" value={pins.BUZZER} onChange={(e) => setPins({ ...pins, BUZZER: Number(e.target.value) })} style={{ ...inputStyle, width: 80 }} />
          </label>
          <button
            type="button"
            disabled={!isConnected}
            onClick={onTestBuzzer}
            style={{
              background: isConnected ? '#e11d48' : '#1e293b',
              color: isConnected ? '#fff' : '#64748b',
              border: '1px solid ' + (isConnected ? '#f43f5e' : '#334155'),
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 'bold',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {isConnected ? '🔊 Tes Bunyikan Buzzer Fisik Sekarang (Kirim Sinyal B)' : '⚠️ Connect Arduino Dulu Untuk Tes Buzzer Fisik'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!isConnected ? (
            <button type="button" onClick={onConnect} style={{ flex: 1, background: '#1d7bff', color: '#fff', border: 0, borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontWeight: 700 }}>Connect WebSerial</button>
          ) : (
            <button type="button" onClick={onDisconnect} style={{ flex: 1, background: '#444', color: '#fff', border: 0, borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontWeight: 700 }}>Disconnect</button>
          )}
          <button type="button" onClick={onSave} style={{ flex: 1, background: '#22aa55', color: '#fff', border: 0, borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontWeight: 700 }}>Save Config</button>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Raw Serial Monitor (Live Incoming):</div>
          <pre style={{ margin: 0, background: '#000', border: '1px solid #222', borderRadius: 8, padding: 10, height: 160, overflowY: 'auto', fontSize: 11, color: '#4ade80', fontFamily: 'monospace' }}>
            {logs.length > 0 ? logs.slice(-50).join('\n') : '(Menunggu data serial dari Arduino Mega...)'}
          </pre>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0a0c0f',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: 6,
  padding: '4px 6px',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 2,
}
