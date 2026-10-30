import { useCallback, useEffect, useRef, useState } from 'react'
import { Scene } from './components/canvas/Scene'
import { SettingsModal } from './components/ui/SettingsModal'
import { ViolationLogPanel } from './components/ui/ViolationLogPanel'
import { SimulationInfoBar } from './components/ui/SimulationInfoBar'
import { HeaderNav } from './components/ui/HeaderNav'
import { AlertBanner, type AlertData } from './components/ui/AlertBanner'
import { useSerial } from './hooks/useSerial'
import { useSimCycle } from './hooks/useSimCycle'
import { DEFAULT_PINS, parsePhaseLine, parseViolation } from './types/pins'
import type { PinConfig } from './types/pins'
import { useArenaStore, tlOf } from './store/arenaStore'
import type { LaneId, PhaseSource, VehicleState, VehicleType } from './store/arenaStore'
import { captureCanvasWithOverlay } from './hooks/useCCTVCapture'
import { uploadToCloudinary } from './services/cloudinary'
import { playBuzzerSound } from './services/buzzerAudio'

const LANE_NUM: Record<number, LaneId> = { 1: 'east', 2: 'west', 3: 'north' }

export default function App() {
  const [pins, setPins] = useState<PinConfig>(DEFAULT_PINS)
  const [openSettings, setOpenSettings] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const [alertData, setAlertData] = useState<AlertData | null>(null)

  const lastHit = useRef(0)
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sendFnRef = useRef<((msg: string) => Promise<void>) | null>(null)

  const phase = useArenaStore((s) => s.phase)
  const addViolation = useArenaStore((s) => s.addViolation)
  const attachImage = useArenaStore((s) => s.attachImage)
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const spawnVehicle = useArenaStore((s) => s.spawnVehicle)

  // Siklus traffic light otomatis saat simulasi aktif
  useSimCycle()

  // Handler utama eksekusi pelanggaran
  const triggerViolation = async (lane: LaneId, source: PhaseSource, vehicle?: VehicleState) => {
    const now = Date.now()
    if (now - lastHit.current < 1200) return
    lastHit.current = now

    // 1. Bunyikan Web Audio API Buzzer (speaker browser)
    playBuzzerSound(1000, 2000)

    // 2. Kirim sinyal ke Arduino fisik (Pin 32 Buzzer) jika serial terhubung
    if (sendFnRef.current) {
      console.log(`⚡ [SmartCross] Pelanggaran ${lane.toUpperCase()} (${source}) -> Mengirim sinyal buzzer 'B' ke Arduino...`)
      void sendFnRef.current('B')
    }

    const tl = tlOf(lane)
    const cur = useArenaStore.getState().phase[tl]
    setFlashKey((k) => k + 1)

    // 3. Notifikasi visual banner
    const laneName = lane === 'west' ? 'BARAT (TL2)' : lane === 'east' ? 'TIMUR (TL1)' : 'UTARA (TL3)'
    const buzzerNotice = sendFnRef.current ? '🔊 BUZZER FISIK AKTIF' : '⚠️ ARDUINO STANDBY'

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

    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current)
    alertTimeoutRef.current = setTimeout(() => setAlertData(null), 4000)

    // 4. Catat ke Zustand store
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
        : 'Objek terdeteksi oleh sensor ultrasonik fisik (Jarak <= 4 cm saat Merah)'

    const id = addViolation({ lane, tl, phase: cur, image: null, source, detail, vehicleInfo }).id

    // 5. Jepret tangkapan layar 3D CCTV dengan overlay telemetri
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
            // Cloudinary opsional
          }
        } catch {
          // ignore
        }
      }, 150)
    }
  }

  // Koneksi WebSerial ke Arduino Mega
  const { isSupported, isConnected, logs, connect, disconnect, send, sendPinConfig } = useSerial((line) => {
    const v = parseViolation(line)
    if (v && LANE_NUM[v]) {
      void triggerViolation(LANE_NUM[v], 'hardware')
    }

    if (useArenaStore.getState().isSimulationMode) return

    const p = parsePhaseLine(line)
    if (p) useArenaStore.getState().setPhase(p, 'hardware')
  })

  // Sinkronkan ref send fungsi
  useEffect(() => {
    sendFnRef.current = isConnected ? send : null
  }, [isConnected, send])

  const triggerViolationRef = useRef(triggerViolation)
  useEffect(() => {
    triggerViolationRef.current = triggerViolation
  })

  const onSensorCross = useCallback(
    (lane: LaneId, isViolator?: boolean, vehicle?: VehicleState) => {
      if (lane === 'north') return
      const tl = tlOf(lane)
      const cur = useArenaStore.getState().phase[tl]
      if (cur !== 'MERAH') return
      if (isViolator === false) return
      void triggerViolationRef.current(lane, 'sim', vehicle)
    },
    [],
  )

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
      initialProgress: 0.36,
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

  const handleTestAlarm = () => {
    const currentPhase = useArenaStore.getState().phase
    const redLane: LaneId =
      currentPhase.TL2 === 'MERAH' ? 'west' : currentPhase.TL1 === 'MERAH' ? 'east' : 'west'
    void triggerViolation(redLane, isSim ? 'sim' : 'hardware')
  }

  return (
    <div className="app-viewport">
      {/* 3D Scene Viewport */}
      <Scene phase={phase} flashKey={flashKey} onSensorCross={onSensorCross} />

      {/* Top Industrial Navigation Bar */}
      <HeaderNav
        isConnected={isConnected}
        isSim={isSim}
        onConnectToggle={isConnected ? disconnect : connect}
        onOpenSettings={() => setOpenSettings(true)}
        onTestAlarm={handleTestAlarm}
      />

      {/* Alert Banner Notifikasi Pelanggaran */}
      <AlertBanner alert={alertData} isConnected={isConnected} />

      {/* Simulation Info & Control HUD (Bottom Left) */}
      <SimulationInfoBar
        isConnected={isConnected}
        onSpawnViolator={handleSpawnViolator}
        onResetSimulation={handleResetSimulation}
      />

      {/* Violation Log Panel (Right Side) */}
      <ViolationLogPanel />

      {/* Settings Drawer Modal */}
      <SettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        pins={pins}
        setPins={setPins}
        onSave={() => sendPinConfig(pins)}
        onConnect={connect}
        onDisconnect={disconnect}
        onTestBuzzer={() => {
          console.log("⚡ [SmartCross] Manual Test: Mengirim sinyal buzzer fisik 'B'...")
          void send('B')
        }}
        isConnected={isConnected}
        isSupported={isSupported}
        logs={logs}
      />
    </div>
  )
}
