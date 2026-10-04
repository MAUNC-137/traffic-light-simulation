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

export function SettingsModal({
  open,
  onClose,
  pins,
  setPins,
  onSave,
  onConnect,
  onDisconnect,
  onTestBuzzer,
  isConnected,
  isSupported,
  logs,
}: Props) {
  if (!open) return null

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        style={{
          width: 440,
          maxWidth: '92vw',
          height: '100%',
          background: '#0d111a',
          color: '#f1f5f9',
          padding: 20,
          overflowY: 'auto',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#06b6d4', fontWeight: 900 }}>◈</span>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: '0.04em' }}>
                KONFIGURASI HARDWARE
              </h2>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              Arduino Mega 2560 &bull; 9600 Baud
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#182030',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            ✕
          </button>
        </div>

        {/* WebSerial Status Banner */}
        <div
          style={{
            fontSize: 11.5,
            padding: '9px 12px',
            borderRadius: 8,
            fontFamily: 'var(--font-mono)',
            background: isSupported
              ? isConnected
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(56, 189, 248, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            color: isSupported ? (isConnected ? '#34d399' : '#38bdf8') : '#f87171',
            border: `1px solid ${
              isSupported ? (isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)') : 'rgba(239, 68, 68, 0.3)'
            }`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{isSupported ? (isConnected ? '●' : '○') : '✕'}</span>
          <span>
            {isSupported
              ? isConnected
                ? 'Terhubung ke Arduino Mega (COM Port Aktif)'
                : 'WebSerial Siap: Klik "Connect WebSerial" untuk menyambungkan'
              : 'WebSerial hanya didukung di Google Chrome / Edge (localhost/HTTPS)'}
          </span>
        </div>

        {/* Section 1: Timur */}
        <div style={{ background: '#111624', padding: 12, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>JALUR TIMUR (TL1)</span>
            <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'var(--font-mono)' }}>● Sensor Aktif</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Red Pin:
              <input type="number" value={pins.TL1_RED} onChange={(e) => setPins({ ...pins, TL1_RED: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Yel Pin:
              <input type="number" value={pins.TL1_YEL} onChange={(e) => setPins({ ...pins, TL1_YEL: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Grn Pin:
              <input type="number" value={pins.TL1_GRN} onChange={(e) => setPins({ ...pins, TL1_GRN: Number(e.target.value) })} style={inputStyle} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Trig Pin:
              <input type="number" value={pins.TRIG1} onChange={(e) => setPins({ ...pins, TRIG1: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Echo Pin:
              <input type="number" value={pins.ECHO1} onChange={(e) => setPins({ ...pins, ECHO1: Number(e.target.value) })} style={inputStyle} />
            </label>
          </div>
        </div>

        {/* Section 2: Barat */}
        <div style={{ background: '#111624', padding: 12, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>JALUR BARAT (TL2)</span>
            <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'var(--font-mono)' }}>● Sensor Aktif</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Red Pin:
              <input type="number" value={pins.TL2_RED} onChange={(e) => setPins({ ...pins, TL2_RED: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Yel Pin:
              <input type="number" value={pins.TL2_YEL} onChange={(e) => setPins({ ...pins, TL2_YEL: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Grn Pin:
              <input type="number" value={pins.TL2_GRN} onChange={(e) => setPins({ ...pins, TL2_GRN: Number(e.target.value) })} style={inputStyle} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Trig Pin:
              <input type="number" value={pins.TRIG2} onChange={(e) => setPins({ ...pins, TRIG2: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Echo Pin:
              <input type="number" value={pins.ECHO2} onChange={(e) => setPins({ ...pins, ECHO2: Number(e.target.value) })} style={inputStyle} />
            </label>
          </div>
        </div>

        {/* Section 3: Utara */}
        <div style={{ background: '#181216', padding: 12, borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>JALUR UTARA (TL3)</span>
            <span style={{ fontSize: 9.5, background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
              SENSOR OFF / BYPASS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Red Pin:
              <input type="number" value={pins.TL3_RED} onChange={(e) => setPins({ ...pins, TL3_RED: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Yel Pin:
              <input type="number" value={pins.TL3_YEL} onChange={(e) => setPins({ ...pins, TL3_YEL: Number(e.target.value) })} style={inputStyle} />
            </label>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>
              Grn Pin:
              <input type="number" value={pins.TL3_GRN} onChange={(e) => setPins({ ...pins, TL3_GRN: Number(e.target.value) })} style={inputStyle} />
            </label>
          </div>
          <div style={{ marginTop: 8, fontSize: 10.5, color: '#94a3b8', lineHeight: 1.4 }}>
            * Jalur Utara hanya mengontrol sinyal lampu lalu lintas (sensor ultrasonik fisik dinonaktifkan).
          </div>
        </div>

        {/* Section 4: Buzzer */}
        <div style={{ background: '#111624', padding: 12, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#f1f5f9' }}>PIN BUZZER FISIK:</span>
            <input
              type="number"
              value={pins.BUZZER}
              onChange={(e) => setPins({ ...pins, BUZZER: Number(e.target.value) })}
              style={{ ...inputStyle, width: 90 }}
            />
          </label>
          <button
            type="button"
            disabled={!isConnected}
            onClick={onTestBuzzer}
            style={{
              background: isConnected ? '#291316' : '#141824',
              color: isConnected ? '#f87171' : '#64748b',
              border: `1px solid ${isConnected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: isConnected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {isConnected ? '🔊 Tes Bunyikan Buzzer Fisik Sekarang (Kirim Sinyal B)' : '⚠️ Hubungkan Arduino Dulu Untuk Tes Buzzer'}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {!isConnected ? (
            <button
              type="button"
              onClick={onConnect}
              style={{
                flex: 1,
                background: '#047857',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 0',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Connect WebSerial
            </button>
          ) : (
            <button
              type="button"
              onClick={onDisconnect}
              style={{
                flex: 1,
                background: '#1e2433',
                color: '#fb7185',
                border: '1px solid rgba(251, 113, 133, 0.3)',
                borderRadius: 8,
                padding: '10px 0',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Disconnect Port
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            style={{
              flex: 1,
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 0',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            Kirim Config Pin
          </button>
        </div>

        {/* Live Serial Monitor */}
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
            LIVE SERIAL MONITOR INCOMING:
          </div>
          <pre
            style={{
              margin: 0,
              background: '#05070a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              padding: 10,
              height: 150,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#475569 #05070a',
              fontSize: 10.5,
              color: '#34d399',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.45,
            }}
          >
            {logs.length > 0 ? logs.slice(-50).join('\n') : '(Menunggu transmisi serial dari Arduino Mega...)'}
          </pre>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#070a10',
  color: '#f1f5f9',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 6,
  padding: '5px 8px',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
}
