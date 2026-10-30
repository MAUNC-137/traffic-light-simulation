import { useEffect } from 'react'
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
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 900 }}>◈</span>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: '0.04em' }}>
                KONFIGURASI HARDWARE
              </h2>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              Arduino Mega 2560 &bull; 9600 Baud
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-neutral btn-sm"
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
        <div className="config-section">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>JALUR TIMUR (TL1)</span>
            <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'var(--font-mono)' }}>● Sensor Aktif</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Red Pin:
              <input type="number" value={pins.TL1_RED} onChange={(e) => setPins({ ...pins, TL1_RED: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Yel Pin:
              <input type="number" value={pins.TL1_YEL} onChange={(e) => setPins({ ...pins, TL1_YEL: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Grn Pin:
              <input type="number" value={pins.TL1_GRN} onChange={(e) => setPins({ ...pins, TL1_GRN: Number(e.target.value) })} className="config-input" />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Trig Pin:
              <input type="number" value={pins.TRIG1} onChange={(e) => setPins({ ...pins, TRIG1: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Echo Pin:
              <input type="number" value={pins.ECHO1} onChange={(e) => setPins({ ...pins, ECHO1: Number(e.target.value) })} className="config-input" />
            </label>
          </div>
        </div>

        {/* Section 2: Barat */}
        <div className="config-section">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>JALUR BARAT (TL2)</span>
            <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'var(--font-mono)' }}>● Sensor Aktif</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Red Pin:
              <input type="number" value={pins.TL2_RED} onChange={(e) => setPins({ ...pins, TL2_RED: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Yel Pin:
              <input type="number" value={pins.TL2_YEL} onChange={(e) => setPins({ ...pins, TL2_YEL: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Grn Pin:
              <input type="number" value={pins.TL2_GRN} onChange={(e) => setPins({ ...pins, TL2_GRN: Number(e.target.value) })} className="config-input" />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Trig Pin:
              <input type="number" value={pins.TRIG2} onChange={(e) => setPins({ ...pins, TRIG2: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Echo Pin:
              <input type="number" value={pins.ECHO2} onChange={(e) => setPins({ ...pins, ECHO2: Number(e.target.value) })} className="config-input" />
            </label>
          </div>
        </div>

        {/* Section 3: Utara (Bypass / Rusak) */}
        <div className="config-section bypass">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>JALUR UTARA (TL3)</span>
            <span style={{ fontSize: 9.5, background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
              SENSOR OFF / BYPASS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Red Pin:
              <input type="number" value={pins.TL3_RED} onChange={(e) => setPins({ ...pins, TL3_RED: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Yel Pin:
              <input type="number" value={pins.TL3_YEL} onChange={(e) => setPins({ ...pins, TL3_YEL: Number(e.target.value) })} className="config-input" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Grn Pin:
              <input type="number" value={pins.TL3_GRN} onChange={(e) => setPins({ ...pins, TL3_GRN: Number(e.target.value) })} className="config-input" />
            </label>
          </div>
          <div style={{ marginTop: 8, fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
            * Jalur Utara hanya mengontrol sinyal lampu lalu lintas (sensor ultrasonik fisik dinonaktifkan).
          </div>
        </div>

        {/* Section 4: Buzzer */}
        <div className="config-section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>PIN BUZZER FISIK:</span>
            <input
              type="number"
              value={pins.BUZZER}
              onChange={(e) => setPins({ ...pins, BUZZER: Number(e.target.value) })}
              className="config-input"
              style={{ width: 90 }}
            />
          </label>
          <button
            type="button"
            disabled={!isConnected}
            onClick={onTestBuzzer}
            className={`btn ${isConnected ? 'btn-crimson' : 'btn-neutral'}`}
            style={{ width: '100%', opacity: isConnected ? 1 : 0.6, cursor: isConnected ? 'pointer' : 'not-allowed' }}
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
              className="btn btn-emerald"
              style={{ flex: 1, padding: '10px 0' }}
            >
              Connect WebSerial
            </button>
          ) : (
            <button
              type="button"
              onClick={onDisconnect}
              className="btn btn-danger-outline"
              style={{ flex: 1, padding: '10px 0' }}
            >
              Disconnect Port
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            className="btn btn-sky"
            style={{ flex: 1, padding: '10px 0' }}
          >
            Kirim Config Pin
          </button>
        </div>

        {/* Live Serial Monitor */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
            LIVE SERIAL MONITOR INCOMING:
          </div>
          <pre
            style={{
              margin: 0,
              background: '#05070a',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: 10,
              height: 150,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
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
