import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

export type SensorStatus = 'active' | 'damaged' | 'none'

interface Props {
  position?: [number, number, number]
  rotationY?: number
  status?: SensorStatus
}

export function UltrasonicSensor({ position = [0, 0, 0], rotationY = 0, status = 'active' }: Props) {
  const w1 = useRef<THREE.Mesh>(null!)
  const w2 = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (status !== 'active') return
    const t = clock.getElapsedTime()
    const s1 = 1 + Math.sin(t * 3.5) * 0.12
    const s2 = 1 + Math.cos(t * 2.8) * 0.15

    if (w1.current) {
      w1.current.scale.set(s1, 1, s1)
      const m1 = w1.current.material as THREE.MeshStandardMaterial
      m1.opacity = 0.14 + 0.06 * Math.sin(t * 3.5)
    }

    if (w2.current) {
      w2.current.scale.set(s2, 1, s2)
      const m2 = w2.current.material as THREE.MeshStandardMaterial
      m2.opacity = 0.2 + 0.08 * Math.cos(t * 2.8)
    }
  })

  if (status === 'none') return null

  const isDamaged = status === 'damaged'

  return (
    <group position={position} rotation-y={rotationY}>
      {/* Sensor Bracket / Mount */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.12, 0.16, 0.12]} />
        <meshStandardMaterial color={isDamaged ? '#1e242c' : '#2d333b'} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Sensor Body Case */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.55, 0.22, 0.28]} />
        <meshStandardMaterial
          color={isDamaged ? '#334155' : '#0066cc'}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* Ultrasonic Dual Transmitters */}
      <mesh position={[-0.14, -0.18, 0]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial
          color={isDamaged ? '#64748b' : '#c0c6ce'}
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.14, -0.18, 0]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial
          color={isDamaged ? '#64748b' : '#c0c6ce'}
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>

      {/* Indicator LED: Green for active, blinking Red for damaged */}
      <mesh position={[0, -0.05, 0.15]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial
          color={isDamaged ? '#ef4444' : '#22c55e'}
          emissive={isDamaged ? '#dc2626' : '#16a34a'}
          emissiveIntensity={isDamaged ? 2 : 3}
        />
      </mesh>

      {/* Downward Wave Beams (Only active when status === 'active') */}
      {!isDamaged && (
        <>
          <mesh ref={w1} position={[0, -1.9, 0]} rotation-x={Math.PI}>
            <coneGeometry args={[1.3, 3.6, 24, 1, true]} />
            <meshStandardMaterial
              color="#00f2ff"
              transparent
              opacity={0.14}
              side={2}
              depthWrite={false}
            />
          </mesh>

          <mesh ref={w2} position={[0, -1.8, 0]} rotation-x={Math.PI}>
            <coneGeometry args={[0.85, 3.2, 24, 1, true]} />
            <meshStandardMaterial
              color="#00ffff"
              transparent
              opacity={0.2}
              side={2}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  )
}
