import type { LightColor } from '../../types/pins'
import { UltrasonicSensor, type SensorStatus } from './UltrasonicSensor'

interface Props {
  position: [number, number, number]
  rotationY?: number
  headRotationY?: number
  active: LightColor
  armLength?: number
  sensorStatus?: SensorStatus
}

export function TrafficLight({
  position,
  rotationY = 0,
  headRotationY = 0,
  active,
  armLength = 3.6,
  sensorStatus = 'active',
}: Props) {
  const metalMatProps = {
    color: '#3d444d',
    metalness: 0.75,
    roughness: 0.35,
  }

  const housingMatProps = {
    color: '#15181d',
    metalness: 0.5,
    roughness: 0.4,
  }

  const isRed = active === 'MERAH'
  const isYellow = active === 'KUNING'
  const isGreen = active === 'HIJAU'

  return (
    <group position={position} rotation-y={rotationY}>
      {/* 1. Pole Base Plate (Flange & Anchor Bolts on Ground Y=0) */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial {...metalMatProps} />
      </mesh>
      {/* 4 Corner Bolts */}
      {[-0.24, 0.24].map((x) =>
        [-0.24, 0.24].map((z) => (
          <mesh key={`bolt-${x}-${z}`} position={[x, 0.13, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
            <meshStandardMaterial color="#8a94a0" metalness={0.9} roughness={0.2} />
          </mesh>
        )),
      )}

      {/* 2. Main Vertical Mast Column (5.2m High) */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 5.2, 16]} />
        <meshStandardMaterial {...metalMatProps} />
      </mesh>
      {/* Pole Top Cap */}
      <mesh position={[0, 5.25, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.2, 16]} />
        <meshStandardMaterial {...metalMatProps} />
      </mesh>

      {/* 3. Horizontal Cantilever Arm (Mast Arm extending over the road) */}
      <group position={[0, 4.9, 0]}>
        <mesh position={[armLength / 2, 0, 0]} rotation-z={-Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.09, 0.14, armLength, 16]} />
          <meshStandardMaterial {...metalMatProps} />
        </mesh>

        {/* 4. Traffic Signal Head (Hanging at the end of the Mast Arm with independent rotation) */}
        <group position={[armLength, -0.6, 0]} rotation-y={headRotationY}>
          {/* Signal Box Backing/Housing */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.65, 1.85, 0.42]} />
            <meshStandardMaterial {...housingMatProps} />
          </mesh>
          {/* Backplate Border Flange */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[0.85, 2.05, 0.05]} />
            <meshStandardMaterial color="#0b0d10" roughness={0.8} />
          </mesh>

          {/* Lenses, Visors & Dynamic PointLights */}

          {/* --- RED LIGHT --- */}
          <group position={[0, 0.6, 0.21]}>
            <mesh position={[0, 0, -0.05]}>
              <sphereGeometry args={[0.20, 32, 32]} />
              <meshStandardMaterial
                color={isRed ? '#ff1a1a' : '#2d0a0a'}
                emissive={isRed ? '#ff0000' : '#000000'}
                emissiveIntensity={isRed ? 6 : 0}
                roughness={isRed ? 0.1 : 0.8}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.05, 0.15]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.23, 0.23, 0.25, 32, 1, true, 0, Math.PI]} />
              <meshStandardMaterial {...housingMatProps} side={2} />
            </mesh>
            <pointLight
              color="#ff1a1a"
              intensity={isRed ? 4.5 : 0}
              distance={5}
              decay={2}
              position={[0, 0, 0.15]}
            />
          </group>

          {/* --- YELLOW LIGHT --- */}
          <group position={[0, 0, 0.21]}>
            <mesh position={[0, 0, -0.05]}>
              <sphereGeometry args={[0.20, 32, 32]} />
              <meshStandardMaterial
                color={isYellow ? '#ffc800' : '#2d240a'}
                emissive={isYellow ? '#ff9900' : '#000000'}
                emissiveIntensity={isYellow ? 6 : 0}
                roughness={isYellow ? 0.1 : 0.8}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.05, 0.15]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.23, 0.23, 0.25, 32, 1, true, 0, Math.PI]} />
              <meshStandardMaterial {...housingMatProps} side={2} />
            </mesh>
            <pointLight
              color="#ffaa00"
              intensity={isYellow ? 4.5 : 0}
              distance={5}
              decay={2}
              position={[0, 0, 0.15]}
            />
          </group>

          {/* --- GREEN LIGHT --- */}
          <group position={[0, -0.6, 0.21]}>
            <mesh position={[0, 0, -0.05]}>
              <sphereGeometry args={[0.20, 32, 32]} />
              <meshStandardMaterial
                color={isGreen ? '#00ff55' : '#0a2d14'}
                emissive={isGreen ? '#00e640' : '#000000'}
                emissiveIntensity={isGreen ? 6 : 0}
                roughness={isGreen ? 0.1 : 0.8}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.05, 0.15]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.23, 0.23, 0.25, 32, 1, true, 0, Math.PI]} />
              <meshStandardMaterial {...housingMatProps} side={2} />
            </mesh>
            <pointLight
              color="#00ff55"
              intensity={isGreen ? 4.5 : 0}
              distance={5}
              decay={2}
              position={[0, 0, 0.15]}
            />
          </group>
        </group>

        {/* 5. Ultrasonic Sensor Attached to the Cantilever Arm */}
        <UltrasonicSensor position={[armLength * 0.72, -0.15, 0]} rotationY={0} status={sensorStatus} />
      </group>
    </group>
  )
}
