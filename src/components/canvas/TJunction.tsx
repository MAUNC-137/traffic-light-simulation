import { ARENA_CONFIG } from '../../config/arena'

export function TJunction() {
  const asphaltProps = { color: '#161920', roughness: 0.85, metalness: 0.15 }
  const curbProps = { color: '#475569', roughness: 0.9, metalness: 0.1 }
  const grassProps = { color: '#142316', roughness: 0.98, metalness: 0.02 }
  const markingProps = { color: '#f8fafc', roughness: 0.35, metalness: 0.1 }
  const yellowLineProps = { color: '#eab308', roughness: 0.35, metalness: 0.1 }

  return (
    <group>
      {/* 1. Base Ground / Grass */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.09, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial {...grassProps} />
      </mesh>

      {/* 2. Asphalt Road Surfaces */}
      {/* East-West Main Road */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[66, 0.1, 9.2]} />
        <meshStandardMaterial {...asphaltProps} />
      </mesh>
      {/* North Road Branch */}
      <mesh position={[0, 0.01, -14.6]} receiveShadow>
        <boxGeometry args={[9.2, 0.1, 29.2]} />
        <meshStandardMaterial {...asphaltProps} />
      </mesh>

      {/* 3. Sidewalks with Beveled Curbs */}
      {/* South Sidewalk */}
      <mesh position={[0, 0.14, 9.8]} receiveShadow castShadow>
        <boxGeometry args={[66, 0.26, 10.4]} />
        <meshStandardMaterial {...curbProps} />
      </mesh>
      {/* Northwest Sidewalk */}
      <mesh position={[-18.8, 0.14, -18.8]} receiveShadow castShadow>
        <boxGeometry args={[28, 0.26, 28]} />
        <meshStandardMaterial {...curbProps} />
      </mesh>
      {/* Northeast Sidewalk */}
      <mesh position={[18.8, 0.14, -18.8]} receiveShadow castShadow>
        <boxGeometry args={[28, 0.26, 28]} />
        <meshStandardMaterial {...curbProps} />
      </mesh>

      {/* 4. White Road Edge Continuous Lines */}
      {/* South edge */}
      <mesh position={[0, 0.065, 4.3]}>
        <boxGeometry args={[64, 0.015, 0.15]} />
        <meshStandardMaterial {...markingProps} />
      </mesh>
      {/* North branch west edge */}
      <mesh position={[-4.3, 0.065, -15]}>
        <boxGeometry args={[0.15, 0.015, 26]} />
        <meshStandardMaterial {...markingProps} />
      </mesh>
      {/* North branch east edge */}
      <mesh position={[4.3, 0.065, -15]}>
        <boxGeometry args={[0.15, 0.015, 26]} />
        <meshStandardMaterial {...markingProps} />
      </mesh>

      {/* 5. Dashed Center Lines (Yellow) */}
      {[-26, -21, -16, -11].map((x) => (
        <mesh key={`center-w-${x}`} position={[x, 0.065, 0]}>
          <boxGeometry args={[2.8, 0.015, 0.22]} />
          <meshStandardMaterial {...yellowLineProps} />
        </mesh>
      ))}
      {[11, 16, 21, 26].map((x) => (
        <mesh key={`center-e-${x}`} position={[x, 0.065, 0]}>
          <boxGeometry args={[2.8, 0.015, 0.22]} />
          <meshStandardMaterial {...yellowLineProps} />
        </mesh>
      ))}
      {[-11, -16, -21, -26].map((z) => (
        <mesh key={`center-n-${z}`} position={[0, 0.065, z]}>
          <boxGeometry args={[0.22, 0.015, 2.8]} />
          <meshStandardMaterial {...yellowLineProps} />
        </mesh>
      ))}

      {/* 6. Stop Lines */}
      <mesh position={[ARENA_CONFIG.west.stopLine.position[0], 0.066, ARENA_CONFIG.west.stopLine.position[2]]}>
        <boxGeometry args={ARENA_CONFIG.west.stopLine.args} />
        <meshStandardMaterial {...markingProps} />
      </mesh>
      <mesh position={[ARENA_CONFIG.east.stopLine.position[0], 0.066, ARENA_CONFIG.east.stopLine.position[2]]}>
        <boxGeometry args={ARENA_CONFIG.east.stopLine.args} />
        <meshStandardMaterial {...markingProps} />
      </mesh>
      <mesh position={[ARENA_CONFIG.north.stopLine.position[0], 0.066, ARENA_CONFIG.north.stopLine.position[2]]}>
        <boxGeometry args={ARENA_CONFIG.north.stopLine.args} />
        <meshStandardMaterial {...markingProps} />
      </mesh>

      {/* 7. Zebra Cross Stripes */}
      {/* West Zebra */}
      {[-4.0, -3.4, -2.8, -2.2, -1.6, -1.0, -0.4].map((z) => (
        <mesh key={`zebra-w-${z}`} position={[ARENA_CONFIG.west.zebraCross.position[0], 0.066, z]}>
          <boxGeometry args={[1.0, 0.015, 0.35]} />
          <meshStandardMaterial {...markingProps} />
        </mesh>
      ))}

      {/* East Zebra */}
      {[0.4, 1.0, 1.6, 2.2, 2.8, 3.4, 4.0].map((z) => (
        <mesh key={`zebra-e-${z}`} position={[ARENA_CONFIG.east.zebraCross.position[0], 0.066, z]}>
          <boxGeometry args={[1.0, 0.015, 0.35]} />
          <meshStandardMaterial {...markingProps} />
        </mesh>
      ))}

      {/* North Zebra */}
      {[0.4, 1.0, 1.6, 2.2, 2.8, 3.4, 4.0].map((x) => (
        <mesh key={`zebra-n-${x}`} position={[x, 0.066, ARENA_CONFIG.north.zebraCross.position[2]]}>
          <boxGeometry args={[0.35, 0.015, 1.0]} />
          <meshStandardMaterial {...markingProps} />
        </mesh>
      ))}

      {/* 8. Modern Street Lamp Posts with Warm Lighting */}
      {[
        [-14, 5.8],
        [14, 5.8],
        [-5.8, -12],
        [5.8, -12],
      ].map(([x, z], i) => (
        <group key={`lamp-${i}`} position={[x, 0, z]}>
          {/* Post */}
          <mesh position={[0, 2.8, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 5.6, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Lamp Head */}
          <mesh position={[x > 0 ? -0.4 : 0.4, 5.6, z > 0 ? -0.4 : 0.4]} castShadow>
            <boxGeometry args={[0.3, 0.12, 0.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Glowing Fixture */}
          <mesh position={[x > 0 ? -0.4 : 0.4, 5.5, z > 0 ? -0.4 : 0.4]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial emissive="#fde047" emissiveIntensity={2.5} color="#fef08a" />
          </mesh>
          {/* Light Emission */}
          <pointLight
            position={[x > 0 ? -0.4 : 0.4, 5.3, z > 0 ? -0.4 : 0.4]}
            intensity={2.2}
            distance={16}
            color="#fef08a"
          />
        </group>
      ))}

      {/* 9. Low-Poly Roadside Trees Along Sidewalks */}
      {[
        [-24, 7.5],
        [-16, 7.5],
        [16, 7.5],
        [24, 7.5],
        [-8.5, -20],
        [8.5, -20],
        [-16, -7.5],
        [16, -7.5],
      ].map(([tx, tz], i) => (
        <group key={`tree-${i}`} position={[tx, 0.25, tz]}>
          {/* Trunk */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.28, 2.0, 8]} />
            <meshStandardMaterial color="#452a18" roughness={0.9} />
          </mesh>
          {/* Foliage Canopy */}
          <mesh position={[0, 2.4, 0]} castShadow>
            <coneGeometry args={[1.3, 2.2, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
          <mesh position={[0, 3.4, 0]} castShadow>
            <coneGeometry args={[1.0, 1.8, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
