import * as THREE from 'three'
import { ARENA_CONFIG } from './arena'
import type { LaneId, Turn } from '../store/arenaStore'

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

export function stopProgress(curve: THREE.CatmullRomCurve3, lane: LaneId): number {
  const pts = curve.getPoints(200)
  let best = 1
  let bestD = Infinity
  const sx =
    lane === 'north'
      ? ARENA_CONFIG.north.stopLine.position[0]
      : lane === 'west'
        ? ARENA_CONFIG.west.stopLine.position[0]
        : ARENA_CONFIG.east.stopLine.position[0]
  const sz =
    lane === 'north'
      ? ARENA_CONFIG.north.stopLine.position[2]
      : lane === 'west'
        ? ARENA_CONFIG.west.stopLine.position[2]
        : ARENA_CONFIG.east.stopLine.position[2]

  pts.forEach((p, i) => {
    const d = Math.hypot(p.x - sx, p.z - sz)
    if (d < bestD) {
      bestD = d
      best = i / (pts.length - 1)
    }
  })
  return best
}
