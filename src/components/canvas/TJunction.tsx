import { ARENA_CONFIG } from '../../config/arena'

export function TJunction() {
  const asphaltProps = { color: '#1a1d24', roughness: 0.8, metalness: 0.2 }
  const curbProps = { color: '#6e7683', roughness: 0.9, metalness: 0.1 }
  const grassProps = { color: '#284d22', roughness: 0.95, metalness: 0.05 }
  const markingProps = { color: '#f0f3f6', roughness: 0.4, metalness: 0.1 }
  const yellowLineProps = { color: '#e5ad23', roughness: 0.4, metalness: 0.1 }

  return (
    <group>
      {/* 1. Base Terrain (Grass) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial {...grassProps} />
      </mesh>

      {/* 2. Asphalt Road Surfaces */}
      {/* East-West Main Road (Width 9, X: -32 to +32, Z: -4.5 to +4.5, Top Surface Y = 0.06) */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[64, 0.1, 9]} />
        <meshStandardMaterial {...asphaltProps} />
      </mesh>
      {/* North Road Branch (Width 9, X: -4.5 to +4.5, Z: -28 to 0) */}
      <mesh position={[0, 0.01, -14]} receiveShadow>
        <boxGeometry args={[9, 0.1, 28]} />
        <meshStandardMaterial {...asphaltProps} />
      </mesh>

      {/* 3. Curbs & Sidewalks */}
      {/* South Sidewalk (Along the bottom side of Main Road: Z: 4.5 to 14.5) */}
      <mesh position={[0, 0.12, 9.5]} receiveShadow castShadow>
        <boxGeometry args={[64, 0.22, 10]} />
        <meshStandardMaterial {...curbProps} />
      </mesh>
      {/* Northwest Sidewalk block */}
      <mesh position={[-18.5, 0.12, -18.5]} receiveShadow castShadow>
        <boxGeometry args={[27, 0.22, 27]} />
        <meshStandardMaterial {...curbProps} />
      </mesh>
      {/* Northeast Sidewalk block */}
      <mesh position={[18.5, 0.12, -18.5]} receiveShadow castShadow>
        <boxGeometry args={[27, 0.22, 27]} />
        <meshStandardMaterial {...curbProps} />
      </mesh>

      {/* 4. Dashed Center Lines (Y = 0.065 to sit above asphalt) */}
      {[-26, -21, -16, -11].map((x) => (
        <mesh key={`center-w-${x}`} position={[x, 0.065, 0]}>
          <boxGeometry args={[2.8, 0.02, 0.2]} />
          <meshStandardMaterial {...yellowLineProps} />
        </mesh>
      ))}
      {[11, 16, 21, 26].map((x) => (
        <mesh key={`center-e-${x}`} position={[x, 0.065, 0]}>
          <boxGeometry args={[2.8, 0.02, 0.2]} />
          <meshStandardMaterial {...yellowLineProps} />
        </mesh>
      ))}
      {[-11, -16, -21, -26].map((z) => (
        <mesh key={`center-n-${z}`} position={[0, 0.065, z]}>
          <boxGeometry args={[0.2, 0.02, 2.8]} />
          <meshStandardMaterial {...yellowLineProps} />
        </mesh>
      ))}

      {/* 5. Stop Lines from ARENA_CONFIG (Y = 0.065) */}
      <mesh position={[ARENA_CONFIG.west.stopLine.position[0], 0.065, ARENA_CONFIG.west.stopLine.position[2]]}>
        <boxGeometry args={ARENA_CONFIG.west.stopLine.args} />
        <meshStandardMaterial {...markingProps} />
      </mesh>
      <mesh position={[ARENA_CONFIG.east.stopLine.position[0], 0.065, ARENA_CONFIG.east.stopLine.position[2]]}>
        <boxGeometry args={ARENA_CONFIG.east.stopLine.args} />
        <meshStandardMaterial {...markingProps} />
      </mesh>
      <mesh position={[ARENA_CONFIG.north.stopLine.position[0], 0.065, ARENA_CONFIG.north.stopLine.position[2]]}>
        <boxGeometry args={ARENA_CONFIG.north.stopLine.args} />
        <meshStandardMaterial {...markingProps} />
      </mesh>

      {/* 6. Zebra Cross Stripes from ARENA_CONFIG (Left-Hand Driving Lanes, Y = 0.065) */}
      {/* West Zebra: LHD incoming lane Z is negative (-4.0 to -0.4), X = -6.5 */}
      {[-4.0, -3.4, -2.8, -2.2, -1.6, -1.0, -0.4].map((z) => (
        <mesh key={`zebra-w-${z}`} position={[ARENA_CONFIG.west.zebraCross.position[0], 0.065, z]}>
          <boxGeometry args={[1.0, 0.02, 0.35]} />
          <meshStandardMaterial {...markingProps} />
        </mesh>
      ))}

      {/* East Zebra: LHD incoming lane Z is positive (0.4 to 4.0), X = 6.5 */}
      {[0.4, 1.0, 1.6, 2.2, 2.8, 3.4, 4.0].map((z) => (
        <mesh key={`zebra-e-${z}`} position={[ARENA_CONFIG.east.zebraCross.position[0], 0.065, z]}>
          <boxGeometry args={[1.0, 0.02, 0.35]} />
          <meshStandardMaterial {...markingProps} />
        </mesh>
      ))}

      {/* North Zebra: LHD incoming lane X is positive (0.4 to 4.0), Z = -6.5 */}
      {[0.4, 1.0, 1.6, 2.2, 2.8, 3.4, 4.0].map((x) => (
        <mesh key={`zebra-n-${x}`} position={[x, 0.065, ARENA_CONFIG.north.zebraCross.position[2]]}>
          <boxGeometry args={[0.35, 0.02, 1.0]} />
          <meshStandardMaterial {...markingProps} />
        </mesh>
      ))}
    </group>
  )
}
