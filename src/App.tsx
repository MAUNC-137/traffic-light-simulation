import { useCallback, useRef, useState } from 'react'
import { Scene } from './components/canvas/Scene'
import { SettingsModal } from './components/ui/SettingsModal'
import { SimToggle } from './components/ui/SimToggle'
import { ViolationLogPanel } from './components/ui/ViolationLogPanel'
import { useSerial } from './hooks/useSerial'
import { useSimCycle } from './hooks/useSimCycle'
import { DEFAULT_PINS, parsePhaseLine, parseViolation } from './types/pins'
import type { PinConfig } from './types/pins'
import { useArenaStore, tlOf } from './store/arenaStore'
import type { LaneId, PhaseSource } from './store/arenaStore'
import { captureCanvasFallback } from './hooks/useCCTVCapture'
import { uploadToCloudinary } from './services/cloudinary'
import { playBuzzerSound } from './utils/buzzerAudio'

const LANE_NUM: Record<number, LaneId> = { 1: 'east', 2: 'west', 3: 'north' }

export default function App() {
  const [pins, setPins] = useState<PinConfig>(DEFAULT_PINS)
  const [open, setOpen] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const [alertBanner, setAlertBanner] = useState<string | null>(null)
  const lastHit = useRef(0)

  const phase = useArenaStore((s) => s.phase)
  const setPhase = useArenaStore((s) => s.setPhase)
  const addViolation = useArenaStore((s) => s.addViolation)
  const attachImage = useArenaStore((s) => s.attachImage)
  const isSim = useArenaStore((s) => s.isSimulationMode)

  const sendRef = useRef<((msg: string) => Promise<void>) | null>(null)

  useSimCycle()

  const triggerViolation = useCallback(
    async (lane: LaneId, source: PhaseSource) => {
      const now = Date.now()
      // Batasi spam deteksi (minimal jeda 1.2 detik)
      if (now - lastHit.current < 1200) return
      lastHit.current = now

      // 1. Kirim sinyal ke Arduino fisik agar Buzzer Fisik di Pin 32 langsung bunyi!
      if (sendRef.current) {
        console.log(`⚡ [SmartCross] Pelanggaran ${lane.toUpperCase()} terdeteksi (${source})! Mengirim sinyal buzzer 'B' ke Arduino...`)
        void sendRef.current('B')
      } else {
        console.warn('⚠️ [SmartCross] Arduino belum terhubung via WebSerial, buzzer fisik tidak dapat dibunyikan.')
      }

      // 2. Bunyikan juga suara alarm buzzer Web Audio API di speaker komputer
      playBuzzerSound(900, 2000)

      const tl = tlOf(lane)
      const cur = useArenaStore.getState().phase[tl]
      setFlashKey((k) => k + 1)

      // 3. Tampilkan notifikasi visual pelanggaran
      const connStatus = sendRef.current ? '🔊 BUZZER FISIK BUNYI!' : '⚠️ ARDUINO BELUM CONNECT'
      setAlertBanner(`🚨 PELANGGARAN ${lane.toUpperCase()} (${tl}) - LAMPU ${cur} | ${connStatus}`)
      setTimeout(() => setAlertBanner(null), 3500)

      // 4. Tambahkan ke panel log pelanggaran secara instan
      const id = addViolation({ lane, tl, phase: cur, image: null, source }).id

      // 5. Jepret tangkapan layar 3D kamera sebagai barang bukti
      setTimeout(async () => {
        try {
          const img = captureCanvasFallback()
          if (!img) return
          attachImage(id, img)
          try {
            const url = await uploadToCloudinary(img, lane === 'west' ? 2 : lane === 'east' ? 1 : 3)
            attachImage(id, img, url)
          } catch {
            // cloudinary optional
          }
        } catch {
          // ignore
        }
      }, 150)
    },
    [addViolation, attachImage],
  )

  const { isSupported, isConnected, logs, connect, disconnect, send, sendPinConfig } = useSerial((line) => {
    if (useArenaStore.getState().isSimulationMode) return
    const p = parsePhaseLine(line)
    if (p) useArenaStore.getState().setPhase(p, 'hardware')
    const v = parseViolation(line)
    if (v && LANE_NUM[v]) void triggerViolation(LANE_NUM[v], 'hardware')
  })

  sendRef.current = isConnected ? send : null

  const onSensorCross = useCallback(
    (lane: LaneId, isViolator?: boolean) => {
      // Sensor utara rusak dan tidak digunakan, jadi tidak ada deteksi pelanggaran untuk utara
      if (lane === 'north') return
      const tl = tlOf(lane)
      const cur = useArenaStore.getState().phase[tl]
      if (cur !== 'MERAH') return
      if (isViolator === false) return
      void triggerViolation(lane, 'sim')
    },
    [triggerViolation],
  )

  void setPhase

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', position: 'relative' }}>
      <Scene phase={phase} flashKey={flashKey} onSensorCross={onSensorCross} />

      <div style={{ position: 'fixed', left: 14, top: 14, zIndex: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ background: 'rgba(12,16,24,0.85)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid #1f293d', borderRadius: 12, padding: '8px 14px', fontSize: 12, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: isConnected ? '#4ade80' : '#94a3b8', fontWeight: 'bold' }}>
              {isConnected ? '● SERIAL CONNECTED' : '○ SERIAL DISCONNECTED'}
            </span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: isSim ? '#38bdf8' : '#fbbf24', fontWeight: 'bold' }}>
              {isSim ? 'SIMULATION MODE' : 'HARDWARE SYNC (ARDUINO)'}
            </span>
          </div>
          <div style={{ fontSize: 11, display: 'flex', gap: 8, alignItems: 'center', color: '#cbd5e1' }}>
            <span>TL1 Timur: <b style={{ color: phase.TL1 === 'HIJAU' ? '#4ade80' : phase.TL1 === 'KUNING' ? '#facc15' : '#f87171' }}>{phase.TL1}</b></span>
            <span>TL2 Barat: <b style={{ color: phase.TL2 === 'HIJAU' ? '#4ade80' : phase.TL2 === 'KUNING' ? '#facc15' : '#f87171' }}>{phase.TL2}</b></span>
            <span>TL3 Utara: <b style={{ color: phase.TL3 === 'HIJAU' ? '#4ade80' : phase.TL3 === 'KUNING' ? '#facc15' : '#f87171' }}>{phase.TL3}</b></span>
          </div>
          <div style={{ fontSize: 10, display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: 4 }}>
            <span style={{ color: '#4ade80' }}>Sensor Barat: Aktif</span>
            <span style={{ color: '#4ade80' }}>Sensor Timur: Aktif</span>
            <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '1px 5px', borderRadius: 4, fontWeight: 'bold' }}>⚠️ Sensor Utara: RUSAK / OFF</span>
          </div>
        </div>
        <SimToggle />
        <button
          type="button"
          onClick={isConnected ? disconnect : connect}
          style={{
            background: isConnected ? '#15803d' : '#2563eb',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {isConnected ? '🟢 Disconnect Arduino' : '🔌 Connect Arduino'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background: '#1e293b',
            color: '#cbd5e1',
            border: '1px solid #334155',
            borderRadius: 10,
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ⚙️ Pin & Serial
        </button>
        <button
          type="button"
          onClick={() => {
            // Pilih jalur barat atau timur (yang bukan utara)
            const currentPhase = useArenaStore.getState().phase
            const redLane: LaneId = currentPhase.TL2 === 'MERAH' ? 'west' : currentPhase.TL1 === 'MERAH' ? 'east' : 'west'
            void triggerViolation(redLane, isSim ? 'sim' : 'hardware')
          }}
          style={{
            background: '#b91c1c',
            color: '#fff',
            border: '1px solid #ef4444',
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
          }}
          title="Klik untuk langsung tes bunyi buzzer di speaker dan catat foto ke log"
        >
          🚨 Tes Langgar & Buzzer
        </button>
      </div>

      {alertBanner && (
        <div
          style={{
            position: 'fixed',
            top: 74,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            background: 'rgba(185, 28, 28, 0.95)',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 0.5,
            boxShadow: '0 8px 30px rgba(220, 38, 38, 0.6)',
            border: '2px solid #fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span>⚠️</span>
          <span>{alertBanner}</span>
        </div>
      )}

      <ViolationLogPanel />

      <SettingsModal
        open={open}
        onClose={() => setOpen(false)}
        pins={pins}
        setPins={setPins}
        onSave={() => sendPinConfig(pins)}
        onConnect={connect}
        onDisconnect={disconnect}
        onTestBuzzer={() => {
          console.log('⚡ [SmartCross] Manual Test: Mengirim sinyal buzzer fisik \'B\'...')
          void send('B')
        }}
        isConnected={isConnected}
        isSupported={isSupported}
        logs={logs}
      />
    </div>
  )
}
