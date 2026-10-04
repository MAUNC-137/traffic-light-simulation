import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { TJunction } from './TJunction'
import { TrafficLight } from './TrafficLight'
import { CCTV } from './CCTV'
import { VehicleSpawner } from './Vehicle'
import { ARENA_CONFIG } from '../../config/arena'
import type { PhaseState } from '../../types/pins'
import type { LaneId, VehicleState } from '../../store/arenaStore'

interface Props {
  phase: PhaseState
  flashKey: number
  onSensorCross?: (lane: LaneId, isViolator: boolean, vehicle: VehicleState) => void
}

export function Scene({ phase, flashKey, onSensorCross }: Props) {
  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [24, 20, 24], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#080a0f']} />

      <ambientLight intensity={0.65} />

      <directionalLight
        position={[15, 24, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.0005}
      />

      <directionalLight position={[-8, 12, -6]} intensity={0.35} />
      <hemisphereLight args={['#b1e1ff', '#1a3302', 0.3]} />

      <TJunction />

      <TrafficLight
        position={[...ARENA_CONFIG.west.trafficLight.position]}
        rotationY={ARENA_CONFIG.west.trafficLight.rotationY}
        headRotationY={ARENA_CONFIG.west.trafficLight.headRotationY}
        active={phase.TL2}
        armLength={4.2}
        sensorStatus="active"
      />

      <TrafficLight
        position={[...ARENA_CONFIG.east.trafficLight.position]}
        rotationY={ARENA_CONFIG.east.trafficLight.rotationY}
        headRotationY={ARENA_CONFIG.east.trafficLight.headRotationY}
        active={phase.TL1}
        armLength={4.2}
        sensorStatus="active"
      />

      <TrafficLight
        position={[...ARENA_CONFIG.north.trafficLight.position]}
        rotationY={ARENA_CONFIG.north.trafficLight.rotationY}
        headRotationY={ARENA_CONFIG.north.trafficLight.headRotationY}
        active={phase.TL3}
        armLength={3.8}
        sensorStatus="damaged"
      />

      <CCTV
        position={[...ARENA_CONFIG.cctv.position]}
        target={[...ARENA_CONFIG.cctv.target]}
        flashKey={flashKey}
      />

      <VehicleSpawner onCross={(lane, isV, v) => onSensorCross?.(lane, isV, v)} />

      {/* OrbitControls aktif selalu sehingga pengguna bisa memutar dan zoom kamera 3D bebas */}
      <OrbitControls
        enablePan
        enableRotate
        enableZoom
        maxPolarAngle={Math.PI / 2.15}
        minDistance={6}
        maxDistance={70}
        target={[0, 1, 0]}
      />
    </Canvas>
  )
}
