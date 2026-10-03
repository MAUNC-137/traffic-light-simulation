import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CCTVProps {
  position: [number, number, number]
  target?: [number, number, number]
  flashKey: number
}

export function CCTV({ position, target = [0, 0, 0], flashKey }: CCTVProps) {
  const [flash, setFlash] = useState(false)
  const light = useRef<THREE.PointLight>(null!)
  const camHead = useRef<THREE.Group>(null!)

  const [x, poleHeight, z] = position

  useEffect(() => {
    if (flashKey === 0) return
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 700)
    return () => clearTimeout(t)
  }, [flashKey])

  useEffect(() => {
    if (target && camHead.current) {
      camHead.current.lookAt(new THREE.Vector3(...target))
    }
  }, [target])

  useFrame(({ clock }) => {
    if (!light.current) return
    if (!flash) {
      light.current.intensity = 0
      return
    }
    light.current.intensity = Math.sin(clock.getElapsedTime() * 40) > 0 ? 14 : 0
  })

  return (
    // Base anchored firmly on the ground at [x, 0, z] with rotation [0, 0, 0]
    <group position={[x, 0, z]}>
      {/* 1. Base Plate on Ground */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 2. Perfectly Vertical Pole (Standing from Y=0 to Y=poleHeight) */}
      <mesh position={[0, poleHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, poleHeight, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* 3. Top Junction Box at poleHeight */}
      <mesh position={[0, poleHeight, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 4. Camera Head Group (ONLY this group rotates and executes lookAt) */}
      <group ref={camHead} position={[0, poleHeight, 0]}>
        {/* Forward mounting arm */}
        <mesh position={[0, 0, 0.35]} rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Camera Enclosure Body */}
        <group position={[0, 0, 0.6]}>
          {/* Cylindrical Main Camera Body */}
          <mesh rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.8, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.6} />
          </mesh>

          {/* Front Lens Ring Housing */}
          <mesh position={[0, 0, 0.42]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.21, 0.19, 0.1, 20]} />
            <meshStandardMaterial color="#020617" roughness={0.15} metalness={0.3} />
          </mesh>

          {/* Front Camera Lens Glass */}
          <mesh position={[0, 0, 0.47]}>
            <circleGeometry args={[0.16, 20]} />
            <meshStandardMaterial
              color="#001824"
              metalness={0.95}
              roughness={0.05}
              emissive={flash ? '#ffffff' : '#000000'}
              emissiveIntensity={flash ? 3 : 0}
            />
          </mesh>

          {/* Top Protective Sun Visor */}
          <mesh position={[0, 0.14, 0.08]} castShadow>
            <boxGeometry args={[0.26, 0.02, 0.75]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
          </mesh>

          {/* Status Recording Red LED */}
          <mesh position={[0.12, 0.08, -0.15]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={flash ? 8 : 1} />
          </mesh>

          {/* Violation Flash Light right at lens */}
          <pointLight ref={light} position={[0, 0, 0.6]} intensity={0} color="#ffffff" distance={25} decay={2} />
        </group>
      </group>
    </group>
  )
}
