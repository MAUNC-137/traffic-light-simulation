import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
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
  onCross?: (lane: LaneId, isViolator: boolean) => void
  onDone?: (id: string) => void
}

export function Vehicle({ id, lane, turn, isViolator, color, speed, onCross }: Props) {
  const ref = useRef<THREE.Group>(null!)
  const progress = useRef(0)
  const crossed = useRef(false)
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
      if (isRed) onCross?.(lane, isViolator)
    }
  })

  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[1.1, 0.7, 2.2]} />
        <meshStandardMaterial color={isViolator ? '#dc2626' : color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.75, -0.1]}>
        <boxGeometry args={[1.0, 0.5, 1.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
      </mesh>
      {[[-0.55, 0.7], [0.55, 0.7], [-0.55, -0.7], [0.55, -0.7]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.28, 0.28, 0.2, 16]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function VehicleSpawner({ onCross }: { onCross: (lane: LaneId, isViolator: boolean) => void }) {
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const vehicles = useArenaStore((s) => s.vehicles)
  const spawn = useArenaStore((s) => s.spawnVehicle)
  const clear = useArenaStore((s) => s.clearVehicles)

  useEffect(() => {
    if (!isSim) {
      clear()
      return
    }
    // Spawn 2 kendaraan langsung saat simulasi aktif agar tidak menunggu
    spawn()
    spawn()
    const t = setInterval(() => {
      const cur = useArenaStore.getState().vehicles
      if (cur.length < 9) spawn()
    }, 1500)
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
