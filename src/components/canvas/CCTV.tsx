import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CCTVProps {
  position: [number, number, number]
  target?: [number, number, number]
  flashKey: number
}

export function CCTV({ position, target = [0, 0, 0], flashKey }: CCTVProps) {
  const light = useRef<THREE.PointLight>(null!)
  const camHead = useRef<THREE.Group>(null!)
  const lensMat = useRef<THREE.MeshStandardMaterial>(null!)
  const ledMat = useRef<THREE.MeshStandardMaterial>(null!)
  const flashUntil = useRef(0)

  const [x, poleHeight, z] = position

  useEffect(() => {
    if (flashKey === 0) return
    flashUntil.current = performance.now() + 700
  }, [flashKey])

  useEffect(() => {
    if (target && camHead.current) {
      camHead.current.lookAt(new THREE.Vector3(...target))
    }
  }, [target])

  useFrame(({ clock }) => {
    const isFlashing = performance.now() < flashUntil.current

    if (light.current) {
      if (!isFlashing) {
        light.current.intensity = 0
      } else {
        light.current.intensity = Math.sin(clock.getElapsedTime() * 40) > 0 ? 14 : 0
      }
    }

    if (lensMat.current) {
      lensMat.current.emissive.set(isFlashing ? '#ffffff' : '#000000')
      lensMat.current.emissiveIntensity = isFlashing ? 3 : 0
    }

    if (ledMat.current) {
      ledMat.current.emissiveIntensity = isFlashing ? 8 : 1
    }
  })

  return (
    <group position={[x, 0, z]}>
      {/* 1. Base Plate on Ground */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 2. Vertical Pole */}
      <mesh position={[0, poleHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, poleHeight, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* 3. Top Junction Box */}
      <mesh position={[0, poleHeight, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 4. Camera Head Group */}
      <group ref={camHead} position={[0, poleHeight, 0]}>
        {/* Forward mounting arm */}
        <mesh position={[0, 0, 0.35]} rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Camera Enclosure Body */}
        <group position={[0, 0, 0.6]}>
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
              ref={lensMat}
              color="#001824"
              metalness={0.95}
              roughness={0.05}
              emissive="#000000"
              emissiveIntensity={0}
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
            <meshStandardMaterial
              ref={ledMat}
              color="#ff2222"
              emissive="#ff2222"
              emissiveIntensity={1}
            />
          </mesh>

          {/* Violation Flash Light */}
          <pointLight
            ref={light}
            position={[0, 0, 0.6]}
            intensity={0}
            color="#ffffff"
            distance={25}
            decay={2}
          />
        </group>
      </group>
    </group>
  )
}
