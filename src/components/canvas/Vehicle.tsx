import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useArenaStore, tlOf } from '../../store/arenaStore'
import type { LaneId, VehicleState } from '../../store/arenaStore'
import { buildPath, stopProgress } from '../../config/vehiclePaths'

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
          <div className="violator-hud-badge">
            <div className="violator-hud-title">
              <span>🚨 PELANGGAR</span>
              <span className="violator-hud-type">{typeLabel}</span>
            </div>
            <div className="violator-hud-plate">{plate}</div>
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
                  type === 'motor' ? 1.6 : type === 'truck' ? 2.8 : type === 'bus' ? 3.8 : 2.5,
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
        /* Sepeda Motor */
        <group>
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[0.32, 0.4, 1.4]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.65, 0.3]}>
            <boxGeometry args={[0.26, 0.22, 0.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.72, 0.45]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.03, 0.03, 0.65, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.55, 0.71]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={3} />
          </mesh>
          <mesh position={[0, 0.45, -0.72]}>
            <boxGeometry args={[0.12, 0.08, 0.04]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
          </mesh>
          {[0.55, -0.55].map((z, i) => (
            <mesh key={i} position={[0, 0.26, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.26, 0.26, 0.1, 16]} />
              <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>
          ))}
          <mesh castShadow position={[0, 0.75, -0.1]}>
            <boxGeometry args={[0.3, 0.45, 0.26]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 1.05, -0.1]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial
              color={isViolator ? '#ef4444' : '#f59e0b'}
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
        </group>
      ) : type === 'truck' ? (
        /* Truk Box */
        <group>
          <mesh castShadow position={[0, 0.65, 0.8]}>
            <boxGeometry args={[1.3, 0.9, 1.1]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.8, 1.3]}>
            <boxGeometry args={[1.15, 0.42, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.95, -0.7]}>
            <boxGeometry args={[1.4, 1.3, 2.2]} />
            <meshStandardMaterial
              color={isViolator ? '#b91c1c' : '#f8fafc'}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
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
          {[
            [-0.65, 0.8],
            [0.65, 0.8],
            [-0.65, -0.3],
            [0.65, -0.3],
            [-0.65, -1.3],
            [0.65, -1.3],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.28, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.28, 0.28, 0.22, 16]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ) : type === 'bus' ? (
        /* Mini Bus */
        <group>
          <mesh castShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[1.35, 1.15, 3.4]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.38, 0.45, 3.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.7} />
          </mesh>
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
          {[
            [-0.65, 1.1],
            [0.65, 1.1],
            [-0.65, -1.1],
            [0.65, -1.1],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.28, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.3, 0.3, 0.22, 16]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ) : type === 'suv' ? (
        /* Mobil SUV */
        <group>
          <mesh castShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[1.25, 0.55, 2.3]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh castShadow position={[0, 0.8, -0.15]}>
            <boxGeometry args={[1.1, 0.52, 1.35]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.6} />
          </mesh>
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
          {[
            [-0.6, 0.75],
            [0.6, 0.75],
            [-0.6, -0.75],
            [0.6, -0.75],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.26, z]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.29, 0.29, 0.22, 16]} />
              <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ) : (
        /* Mobil Sedan (Default) */
        <group>
          <mesh castShadow position={[0, 0.26, 0]}>
            <boxGeometry args={[1.1, 0.42, 2.2]} />
            <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh castShadow position={[0, 0.68, -0.1]}>
            <boxGeometry args={[0.96, 0.44, 1.15]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.6} />
          </mesh>
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
          {[
            [-0.55, 0.7],
            [0.55, 0.7],
            [-0.55, -0.7],
            [0.55, -0.7],
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

  // Inisialisasi spawn dan interval rutin saat simulasi aktif
  useEffect(() => {
    if (!isSim) {
      clear()
      return
    }

    // Spawn 3 kendaraan awal
    spawn({ type: 'sedan', initialProgress: 0.15 })
    spawn({ type: 'motor', initialProgress: 0.25 })
    spawn({ type: 'truck', initialProgress: 0.05 })

    const timer = setInterval(() => {
      const cur = useArenaStore.getState().vehicles
      if (cur.length < 10) spawn()
    }, 1400)

    return () => clearInterval(timer)
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
