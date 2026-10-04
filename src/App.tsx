import { useCallback, useRef, useState } from 'react'
import { Scene } from './components/canvas/Scene'
import { SettingsModal } from './components/ui/SettingsModal'
import { SimToggle } from './components/ui/SimToggle'
import { ViolationLogPanel } from './components/ui/ViolationLogPanel'
import { SimulationInfoBar } from './components/ui/SimulationInfoBar'
import { useSerial } from './hooks/useSerial'
import { useSimCycle } from './hooks/useSimCycle'
import { DEFAULT_PINS, parsePhaseLine, parseViolation } from './types/pins'
import type { PinConfig } from './types/pins'
import { useArenaStore, tlOf } from './store/arenaStore'
import type { LaneId, PhaseSource, VehicleState, VehicleType } from './store/arenaStore'
import { captureCanvasWithOverlay } from './hooks/useCCTVCapture'
import { uploadToCloudinary } from './services/cloudinary'

const LANE_NUM: Record<number, LaneId> = { 1: 'east', 2: 'west', 3: 'north' }

interface AlertData {
  type: 'sim' | 'hardware'
  title: string
  message: string
  buzzerNotice: string
  vehiclePlate?: string
  vehicleType?: string
}

export default function App() {
  const [pins, setPins] = useState<PinConfig>(DEFAULT_PINS)
  const [open, setOpen] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const [alertData, setAlertData] = useState<AlertData | null>(null)
  const lastHit = useRef(0)

  const phase = useArenaStore((s) => s.phase)
  const setPhase = useArenaStore((s) => s.setPhase)
  const addViolation = useArenaStore((s) => s.addViolation)
  const attachImage = useArenaStore((s) => s.attachImage)
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const spawnVehicle = useArenaStore((s) => s.spawnVehicle)

  const sendRef = useRef<((msg: string) => Promise<void>) | null>(null)

  useSimCycle()

  const triggerViolation = useCallback(
    async (lane: LaneId, source: PhaseSource, vehicle?: VehicleState) => {
      const now = Date.now()
      // Batasi spam deteksi (minimal jeda 1.2 detik)
      if (now - lastHit.current < 1200) return
      lastHit.current = now

      // 1. Kirim sinyal ke Arduino fisik agar Buzzer Fisik di Pin 32 langsung bunyi!
      if (sendRef.current) {
        console.log(`⚡ [SmartCross] Pelanggaran ${lane.toUpperCase()} (${source}) -> Mengirim sinyal buzzer 'B' ke Arduino...`)
        void sendRef.current('B')
      } else {
        console.warn('⚠️ [SmartCross] Arduino belum terhubung via WebSerial, buzzer fisik tidak dapat dibunyikan.')
      }

      const tl = tlOf(lane)
      const cur = useArenaStore.getState().phase[tl]
      setFlashKey((k) => k + 1)

      // 3. Notifikasi visual banner dengan deteksi identitas kendaraan
      const laneName = lane === 'west' ? 'BARAT (TL2)' : lane === 'east' ? 'TIMUR (TL1)' : 'UTARA (TL3)'
      const buzzerNotice = sendRef.current ? '🔊 BUZZER FISIK AKTIF' : '⚠️ ARDUINO STANDBY'

      if (source === 'sim') {
        const vehDesc = vehicle ? `${vehicle.typeLabel} [${vehicle.plate}]` : 'Kendaraan Virtual'
        setAlertData({
          type: 'sim',
          title: 'PELANGGARAN SIMULASI 3D',
          message: `${vehDesc} menerobos lampu ${cur} di Jalur ${laneName}`,
          buzzerNotice,
          vehiclePlate: vehicle?.plate,
          vehicleType: vehicle?.typeLabel,
        })
      } else {
        setAlertData({
          type: 'hardware',
          title: 'PELANGGARAN SENSOR FISIK (ARDUINO)',
          message: `Objek terdeteksi melewati batas stop line Jalur ${laneName} saat lampu ${cur}`,
          buzzerNotice,
        })
      }

      setTimeout(() => setAlertData(null), 4000)

      // 4. Tambahkan ke panel log pelanggaran secara instan dengan identitas kendaraan
      const vehicleInfo = vehicle
        ? {
            type: vehicle.type,
            typeLabel: vehicle.typeLabel,
            plate: vehicle.plate,
            color: vehicle.color,
          }
        : undefined

      const detail =
        source === 'sim'
          ? `${vehicle?.typeLabel || 'Kendaraan'} (${vehicle?.plate || 'Plat N/A'}) menerobos lampu merah di persimpangan 3D`
          : `Objek terdeteksi oleh sensor ultrasonik fisik (Jarak <= 4 cm saat Merah)`

      const id = addViolation({ lane, tl, phase: cur, image: null, source, detail, vehicleInfo }).id

      // 5. Jepret tangkapan layar 3D kamera sebagai barang bukti HANYA jika sumbernya simulasi mobil!
      if (source === 'sim') {
        setTimeout(async () => {
          try {
            const img = captureCanvasWithOverlay({
              typeLabel: vehicle?.typeLabel,
              plate: vehicle?.plate,
              laneName,
              phase: cur,
            })
            if (!img) return
            attachImage(id, img)
            try {
              const url = await uploadToCloudinary(img, lane === 'west' ? 2 : lane === 'east' ? 1 : 3)
              attachImage(id, img, url)
            } catch {
              // cloudinary opsional
            }
          } catch {
            // ignore
          }
        }, 150)
      }
    },
    [addViolation, attachImage],
  )

  const { isSupported, isConnected, logs, connect, disconnect, send, sendPinConfig } = useSerial((line) => {
    // Selalu pantau pelanggaran fisik dari sensor ultrasonik Arduino
    const v = parseViolation(line)
    if (v && LANE_NUM[v]) {
      void triggerViolation(LANE_NUM[v], 'hardware')
    }

    // Jika mode simulasi aktif, jangan timpa fase siklus 3D dengan pembacaan serial
    if (useArenaStore.getState().isSimulationMode) return

    const p = parsePhaseLine(line)
    if (p) useArenaStore.getState().setPhase(p, 'hardware')
  })

  sendRef.current = isConnected ? send : null

  const onSensorCross = useCallback(
    (lane: LaneId, isViolator?: boolean, vehicle?: VehicleState) => {
      // Sensor utara rusak dan tidak digunakan
      if (lane === 'north') return
      const tl = tlOf(lane)
      const cur = useArenaStore.getState().phase[tl]
      if (cur !== 'MERAH') return
      if (isViolator === false) return
      void triggerViolation(lane, 'sim', vehicle)
    },
    [triggerViolation],
  )

  // Fungsi untuk memancing kendaraan pelanggar langsung pada jalur yang sedang lampu MERAH
  const handleSpawnViolator = useCallback(() => {
    const currentPhase = useArenaStore.getState().phase
    let targetLane: LaneId = 'west'
    if (currentPhase.TL2 === 'MERAH') {
      targetLane = 'west'
    } else if (currentPhase.TL1 === 'MERAH') {
      targetLane = 'east'
    }

    const types: VehicleType[] = ['motor', 'truck', 'bus', 'sedan', 'suv']
    const pickedType = types[Math.floor(Math.random() * types.length)]

    spawnVehicle({
      lane: targetLane,
      type: pickedType,
      isViolator: true,
      color: '#ef4444',
      speed: 7.5,
      initialProgress: 0.36, // Spawn langsung di dekat garis stop agar melanggar dalam ~1 detik!
    })
  }, [spawnVehicle])

  const handleResetSimulation = useCallback(() => {
    useArenaStore.getState().resetSimulation()
    setTimeout(() => {
      spawnVehicle({ type: 'sedan', initialProgress: 0.15 })
      spawnVehicle({ type: 'motor', initialProgress: 0.25 })
      spawnVehicle({ type: 'truck', initialProgress: 0.05 })
    }, 100)
  }, [spawnVehicle])

  void setPhase

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#05070a', position: 'relative' }}>
      {/* 3D Scene Viewport (Kamera dapat diputar & di-zoom bebas dengan mouse drag) */}
      <Scene phase={phase} flashKey={flashKey} onSensorCross={onSensorCross} />

      {/* Top Industrial Navigation Bar */}
      <header
        style={{
          position: 'fixed',
          left: 16,
          top: 16,
          zIndex: 22,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Brand & Connection Badge */}
        <div
          style={{
            background: 'rgba(10, 13, 20, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: '7px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#f1f5f9' }}>
            <span style={{ color: '#06b6d4' }}>◈</span>
            <span style={{ letterSpacing: '0.06em' }}>SMARTCROSS</span>
          </div>

          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isConnected ? '#10b981' : '#64748b',
                boxShadow: isConnected ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span style={{ color: isConnected ? '#10b981' : '#94a3b8', fontWeight: 600 }}>
              {isConnected ? 'SERIAL CONNECTED' : 'SERIAL OFF'}
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <SimToggle />

        {/* Connect Button */}
        <button
          type="button"
          onClick={isConnected ? disconnect : connect}
          style={{
            background: isConnected ? '#1c1917' : '#047857',
            color: isConnected ? '#fb7185' : '#ffffff',
            border: `1px solid ${isConnected ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.5)'}`,
            borderRadius: 8,
            padding: '7px 14px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
            boxShadow: isConnected ? 'none' : '0 2px 10px rgba(16, 185, 129, 0.25)',
          }}
        >
          <span>{isConnected ? '✕ Disconnect Port' : '🔌 Connect Arduino'}</span>
        </button>

        {/* Pin Settings Button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background: '#111622',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            padding: '7px 12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
          title="Buka panel konfigurasi pin hardware dan serial monitor langsung"
        >
          <span>⚙️ Hardware Config</span>
        </button>

        {/* Manual Test Trigger */}
        <button
          type="button"
          onClick={() => {
            const currentPhase = useArenaStore.getState().phase
            const redLane: LaneId = currentPhase.TL2 === 'MERAH' ? 'west' : currentPhase.TL1 === 'MERAH' ? 'east' : 'west'
            void triggerViolation(redLane, isSim ? 'sim' : 'hardware')
          }}
          style={{
            background: '#291316',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 8,
            padding: '7px 13px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
          title={isSim ? 'Tes pelanggaran simulasi (memotret CCTV & bunyikan buzzer)' : 'Tes pelanggaran fisik (log error hardware & bunyikan buzzer)'}
        >
          <span>🚨 Tes Alarm {isSim ? '(Simulasi)' : '(Fisik)'}</span>
        </button>
      </header>

      {/* Alert Banner Notifikasi Pelanggaran dengan Deteksi Kendaraan */}
      {alertData && (
        <div
          style={{
            position: 'fixed',
            top: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            background: alertData.type === 'sim' ? 'rgba(15, 23, 42, 0.96)' : 'rgba(30, 10, 14, 0.96)',
            color: '#fff',
            padding: '12px 22px',
            borderRadius: 10,
            border: `1.5px solid ${alertData.type === 'sim' ? '#38bdf8' : '#ef4444'}`,
            boxShadow: alertData.type === 'sim' ? '0 10px 30px rgba(56, 189, 248, 0.3)' : '0 10px 30px rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            backdropFilter: 'blur(12px)',
            maxWidth: '90vw',
          }}
        >
          <div
            style={{
              fontSize: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {alertData.type === 'sim' ? '🚨' : '⚡'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-mono)',
                  color: alertData.type === 'sim' ? '#38bdf8' : '#f87171',
                }}
              >
                {alertData.title}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>·</span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: sendRef.current ? '#4ade80' : '#f59e0b',
                  fontWeight: 600,
                }}
              >
                {alertData.buzzerNotice}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{alertData.message}</span>
              {alertData.vehiclePlate && (
                <span
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  {alertData.vehiclePlate}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simulation Info & Control HUD (Bottom Left) */}
      <SimulationInfoBar
        isConnected={isConnected}
        onSpawnViolator={handleSpawnViolator}
        onResetSimulation={handleResetSimulation}
      />

      {/* Violation Log Panel (Right Side) */}
      <ViolationLogPanel />

      {/* Settings Modal */}
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
