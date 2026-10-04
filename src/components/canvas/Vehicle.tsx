import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ARENA_CONFIG } from '../../config/arena'
import { useArenaStore, tlOf } from '../../store/arenaStore'
import type { LaneId, Turn, VehicleState } from '../../store/arenaStore'

const Y = 0.35

function v(x: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, Y, z)
}

export function buildPath(lane: LaneId, turn: Turn): THREE.CatmullRomCurve3 {
  if (lane === 'west') {
    const z0 = ARENA_CONFIG.west.laneCenterZ
    const stop = ARENA_CONFIG.west.stopLine.position[0]
    const start = v(-32, z0)
    const pre = v(stop - 0.6, z0)
    if (turn === 'straight') return new THREE.CatmullRomCurve3([start, pre, v(10, z0), v(32, z0)])
    if (turn === 'left') return new THREE.CatmullRomCurve3([start, pre, v(-2, -1), v(-2.25, -14), v(-2.25, -30)])
    return new THREE.CatmullRomCurve3([start, pre, v(4, 4), v(14, 2.25), v(32, 2.25)])
  }
  if (lane === 'east') {
    const z0 = ARENA_CONFIG.east.laneCenterZ
    const stop = ARENA_CONFIG.east.stopLine.position[0]
    const start = v(32, z0)
    const pre = v(stop + 0.6, z0)
    if (turn === 'straight') return new THREE.CatmullRomCurve3([start, pre, v(-10, z0), v(-32, z0)])
    if (turn === 'right') return new THREE.CatmullRomCurve3([start, pre, v(2, 1.2), v(-2.25, -14), v(-2.25, -30)])
    return new THREE.CatmullRomCurve3([start, pre, v(-4, -4), v(-14, -2.25), v(-32, -2.25)])
  }
  const x0 = ARENA_CONFIG.north.laneCenterX
  const stop = ARENA_CONFIG.north.stopLine.position[2]
  const start = v(x0, -32)
  const pre = v(x0, stop - 0.6)
  if (turn === 'straight') return new THREE.CatmullRomCurve3([start, pre, v(x0, 8), v(x0, 30)])
  if (turn === 'left') return new THREE.CatmullRomCurve3([start, pre, v(1.5, -1), v(12, -2.25), v(32, -2.25)])
  return new THREE.CatmullRomCurve3([start, pre, v(3.5, 3), v(-12, 2.25), v(-32, 2.25)])
}

function stopProgress(curve: THREE.CatmullRomCurve3, lane: LaneId): number {
  const pts = curve.getPoints(200)
  let best = 1
  let bestD = Infinity
  const sx = lane === 'north' ? ARENA_CONFIG.north.stopLine.position[0] : lane === 'west' ? ARENA_CONFIG.west.stopLine.position[0] : ARENA_CONFIG.east.stopLine.position[0]
  const sz = lane === 'north' ? ARENA_CONFIG.north.stopLine.position[2] : lane === 'west' ? ARENA_CONFIG.west.stopLine.position[2] : ARENA_CONFIG.east.stopLine.position[2]
  pts.forEach((p, i) => {
    const d = Math.hypot(p.x - sx, p.z - sz)
    if (d < bestD) {
      bestD = d
      best = i / (pts.length - 1)
    }
  })
  return best
}

interface Props extends VehicleState {
  onCross?: (lane: LaneId, isViolator: boolean, vehicle: VehicleState) => void
  onDone?: (id: string) => void
}

export function Vehicle(props: Props) {
  const { id, lane, turn, isViolator, color, speed, type, plate, typeLabel, initialProgress, onCross } = props
  const ref = useRef<THREE.Group>(null!)
  const progress = useRef(initialProgress ?? 0)
  const crossed = useRef(false)
  const [hasCrossedRed, setHasCrossedRed] = useState(false)
  const despawn = useArenaStore((s) => s.despawnVehicle)
  const curve = useMemo(() => buildPath(lane, turn), [lane, turn])
  const len = useMemo(() => curve.getLength(), [curve])
  const stopAt = useMemo(() => stopProgress(curve, lane), [curve, lane])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const tan = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const d = Math.min(dt, 0.05)
    const tl = tlOf(lane)
    const phase = useArenaStore.getState().phase[tl]
    const isRed = phase === 'MERAH'
    const beforeStop = progress.current < stopAt - 0.015
    const nearStop = Math.abs(progress.current - stopAt) < 0.02

    // Kendaraan taat aturan akan berhenti di garis stop saat lampu merah
    if (!isViolator && isRed && (beforeStop || nearStop)) {
      const p = Math.min(progress.current, stopAt - 0.015)
      curve.getPoint(p, tmp)
      g.position.copy(tmp)
      curve.getTangent(p, tan)
      if (tan.lengthSq() > 0) g.rotation.y = Math.atan2(tan.x, tan.z)
      return
    }

    progress.current += ((speed * d) / len) * 1.6
    if (progress.current >= 1) {
      despawn(id)
      return
    }
    curve.getPoint(progress.current, tmp)
    g.position.copy(tmp)
    curve.getTangent(progress.current, tan)
    if (tan.lengthSq() > 0) g.rotation.y = Math.atan2(tan.x, tan.z)

    if (!crossed.current && progress.current >= stopAt) {
      crossed.current = true
      if (isRed) {
        setHasCrossedRed(true)
        onCross?.(lane, isViolator, props)
      }
    }
  })

  const mainColor = isViolator ? '#ef4444' : color

  return (
    <group ref={ref}>
      {/* 3D Detection HUD di atas kendaraan jika melanggar */}
      {hasCrossedRed && isViolator && (
        <Html
          position={[0, type === 'truck' ? 2.6 : type === 'bus' ? 2.4 : 1.9, 0]}
          center
          distanceFactor={18}
          zIndexRange={[10, 0]}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.94)',
              color: '#f87171',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 10.5,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
              border: '1.5px solid #ef4444',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              pointerEvents: 'none',
              transform: 'scale(1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🚨 PELANGGAR</span>
              <span style={{ color: '#f1f5f9' }}>{typeLabel}</span>
            </div>
            <div
              style={{
                fontSize: 9.5,
                background: '#000',
                color: '#38bdf8',
                padding: '1px 5px',
                borderRadius: 3,
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              {plate}
            </div>
          </div>
        </Html>
      )}

      {/* 3D WebGL Bounding Box & Target Highlight di Canvas */}
      {hasCrossedRed && isViolator && (
        <group position={[0, type === 'truck' ? 0.9 : type === 'bus' ? 0.75 : 0.5, 0]}>
          <lineSegments>
            <edgesGeometry
              args={[
                new THREE.BoxGeometry(
                  type === 'motor' ? 0.6 : type === 'truck' ? 1.6 : 1.4,
                  type === 'motor' ? 1.3 : type === 'truck' ? 2.0 : 1.3,
                  type === 'motor' ? 1.6 : type === 'truck' ? 2.8 : type === 'bus' ? 3.8 : 2.5
                ),
              ]}
            />
            <lineBasicMaterial color="#ef4444" linewidth={3} />
          </lineSegments>
          {/* Cincin Target Pelanggar Merah */}
          <mesh position={[0, type === 'truck' ? 1.35 : 0.95, 0]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.3, 0.45, 16]} />
            <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {type === 'motor' ? (
        /* ==================== SEPEDA MOTOR ==================== */
        <group>
          {/* Bodi Motor */}
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[0.32, 0.4, 1.4]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Tangki & Stang */}
          <mesh position={[0, 0.65, 0.3]}>
            <boxGeometry args={[0.26, 0.22, 0.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.72, 0.45]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.03, 0.03, 0.65, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Lampu Depan & Belakang */}
          <mesh position={[0, 0.55, 0.71]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
          </mesh>
          <mesh position={[0, 0.45, -0.72]}>
            <boxGeometry args={[0.12, 0.08, 0.04]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
          </mesh>
          {/* Roda Depan & Belakang */}
          {[0.55, -0.55].map((z, i) => (
            <mesh key={i} position={[0, 0.26, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.26, 0.26, 0.1, 16]} />
              <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>
          ))}
          {/* Pengendara (Rider) */}
          <mesh castShadow position={[0, 0.75, -0.1]}>
            <boxGeometry args={[0.3, 0.45, 0.26]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Helm */}
          <mesh castShadow position={[0, 1.05, -0.1]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color={isViolator ? '#ef4444' : '#f59e0b'} roughness={0.2} metalness={0.3} />
          </mesh>
        </group>
      ) : type === 'truck' ? (
        /* ==================== TRUK BOX ==================== */
        <group>
          {/* Kabin Depan */}
          <mesh castShadow position={[0, 0.65, 0.8]}>
            <boxGeometry args={[1.3, 0.9, 1.1]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Kaca Depan */}
          <mesh position={[0, 0.8, 1.3]}>
            <boxGeometry args={[1.15, 0.42, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Box Kargo Belakang */}
          <mesh castShadow position={[0, 0.95, -0.7]}>
            <boxGeometry args={[1.4, 1.3, 2.2]} />
            <meshStandardMaterial color={isViolator ? '#b91c1c' : '#f8fafc'} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Lampu Depan & Belakang */}
          {[-0.45, 0.45].map((x, i) => (
            <mesh key={`hl-${i}`} position={[x, 0.45, 1.36]}>
              <boxGeometry args={[0.2, 0.12, 0.04]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
            </mesh>
          ))}
          {[-0.55, 0.55].map((x, i) => (
            <mesh key={`tl-${i}`} position={[x, 0.45, -1.82]}>
              <boxGeometry args={[0.18, 0.12, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
            </mesh>
          ))}
          {/* 6 Roda Truk */}
          {[
            [-0.65, 0.8], [0.65, 0.8],
            [-0.65, -0.3], [0.65, -0.3],
            [-0.65, -1.3], [0.65, -1.3],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.28, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.28, 0.28, 0.22, 16]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ) : type === 'bus' ? (
        /* ==================== MINI BUS ==================== */
        <group>
          {/* Bodi Bus Panjang */}
          <mesh castShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[1.35, 1.15, 3.4]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Jalur Kaca Samping */}
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.38, 0.45, 3.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.7} />
          </mesh>
          {/* Lampu Depan & Belakang */}
          {[-0.5, 0.5].map((x, i) => (
            <mesh key={`hl-${i}`} position={[x, 0.45, 1.72]}>
              <boxGeometry args={[0.2, 0.12, 0.04]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
            </mesh>
          ))}
          {[-0.5, 0.5].map((x, i) => (
            <mesh key={`tl-${i}`} position={[x, 0.45, -1.72]}>
              <boxGeometry args={[0.2, 0.12, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
            </mesh>
          ))}
          {/* 4 Roda Bus */}
          {[
            [-0.65, 1.1], [0.65, 1.1],
            [-0.65, -1.1], [0.65, -1.1],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.28, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.3, 0.3, 0.22, 16]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ) : type === 'suv' ? (
        /* ==================== MOBIL SUV ==================== */
        <group>
          {/* Bodi Bawah SUV */}
          <mesh castShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[1.25, 0.55, 2.3]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Kabin Atas SUV */}
          <mesh castShadow position={[0, 0.8, -0.15]}>
            <boxGeometry args={[1.1, 0.52, 1.35]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.6} />
          </mesh>
          {/* Lampu Depan & Belakang */}
          {[-0.45, 0.45].map((x, i) => (
            <mesh key={`hl-${i}`} position={[x, 0.35, 1.16]}>
              <boxGeometry args={[0.18, 0.1, 0.04]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
            </mesh>
          ))}
          {[-0.45, 0.45].map((x, i) => (
            <mesh key={`tl-${i}`} position={[x, 0.38, -1.16]}>
              <boxGeometry args={[0.18, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
            </mesh>
          ))}
          {/* 4 Roda SUV */}
          {[
            [-0.6, 0.75], [0.6, 0.75],
            [-0.6, -0.75], [0.6, -0.75],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.26, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.29, 0.29, 0.22, 16]} />
              <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ) : (
        /* ==================== MOBIL SEDAN (DEFAULT) ==================== */
        <group>
          {/* Bodi Bawah */}
          <mesh castShadow position={[0, 0.26, 0]}>
            <boxGeometry args={[1.1, 0.42, 2.2]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Kabin Kaca */}
          <mesh castShadow position={[0, 0.68, -0.1]}>
            <boxGeometry args={[0.96, 0.44, 1.15]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.6} />
          </mesh>
          {/* Lampu Depan & Belakang */}
          {[-0.42, 0.42].map((x, i) => (
            <mesh key={`hl-${i}`} position={[x, 0.28, 1.11]}>
              <boxGeometry args={[0.16, 0.1, 0.04]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
            </mesh>
          ))}
          {[-0.42, 0.42].map((x, i) => (
            <mesh key={`tl-${i}`} position={[x, 0.32, -1.11]}>
              <boxGeometry args={[0.16, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
            </mesh>
          ))}
          {/* 4 Roda Sedan */}
          {[
            [-0.55, 0.7], [0.55, 0.7],
            [-0.55, -0.7], [0.55, -0.7],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.24, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 16]} />
              <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export function VehicleSpawner({
  onCross,
}: {
  onCross: (lane: LaneId, isViolator: boolean, vehicle: VehicleState) => void
}) {
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const vehicles = useArenaStore((s) => s.vehicles)
  const spawn = useArenaStore((s) => s.spawnVehicle)
  const clear = useArenaStore((s) => s.clearVehicles)

  useEffect(() => {
    if (!isSim) {
      clear()
      return
    }
    // Langsung spawn beberapa jenis kendaraan saat simulasi aktif
    spawn({ type: 'sedan', initialProgress: 0.15 })
    spawn({ type: 'motor', initialProgress: 0.25 })
    spawn({ type: 'truck', initialProgress: 0.05 })

    const t = setInterval(() => {
      const cur = useArenaStore.getState().vehicles
      if (cur.length < 10) spawn()
    }, 1400)
    return () => clearInterval(t)
  }, [isSim, spawn, clear])

  if (!isSim) return null
  return (
    <group>
      {vehicles.map((vv) => (
        <Vehicle key={vv.id} {...vv} onCross={onCross} />
      ))}
    </group>
  )
}
