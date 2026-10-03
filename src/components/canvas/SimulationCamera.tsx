import { useRef, useEffect } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { ARENA_CONFIG } from '../../config/arena'

export function SimulationCamera() {
  const ref = useRef<THREE.PerspectiveCamera>(null!)

  const pos = ARENA_CONFIG.cctv.position as unknown as [number, number, number]
  const tgt = ARENA_CONFIG.cctv.target as unknown as [number, number, number]
  const fwd = new THREE.Vector3(tgt[0] - pos[0], tgt[1] - pos[1], tgt[2] - pos[2]).normalize()
  const eye: [number, number, number] = [
    pos[0] + fwd.x * 1.8,
    pos[1] + fwd.y * 1.8 + 0.7,
    pos[2] + fwd.z * 1.8,
  ]
  const targetVec = new THREE.Vector3(...tgt)

  useEffect(() => {
    if (ref.current) ref.current.lookAt(targetVec)
  }, [targetVec.x, targetVec.y, targetVec.z])

  return (
    <PerspectiveCamera
      ref={ref}
      makeDefault
      position={eye}
      fov={58}
      near={0.3}
      far={150}
      onUpdate={(c) => c.lookAt(targetVec)}
    />
  )
}
