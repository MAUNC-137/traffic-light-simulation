export const ARENA_CONFIG = {
  west: { // RUAS BARAT (Kiri) - Kendaraan datang dari Kiri (-X)
    laneCenterZ: -2.25,
    stopLine: { position: [-7.5, 0.06, -2.25] as [number, number, number], args: [0.5, 0.02, 4.5] as [number, number, number] },
    zebraCross: { position: [-6.5, 0.06, -2.25] as [number, number, number] },
    trafficLight: {
      position: [-6.0, 0, -4.5] as [number, number, number],
      rotationY: -Math.PI / 2, // Lengan melintang ke +Z di atas aspal
      headRotationY: 0, // Lensa mutlak -X (total yaw -PI/2)
    },
  },
  east: { // RUAS TIMUR (Kanan) - Kendaraan datang dari Kanan (+X)
    laneCenterZ: 2.25,
    stopLine: { position: [7.5, 0.06, 2.25] as [number, number, number], args: [0.5, 0.02, 4.5] as [number, number, number] },
    zebraCross: { position: [6.5, 0.06, 2.25] as [number, number, number] },
    trafficLight: {
      position: [6.0, 0, 4.5] as [number, number, number],
      rotationY: Math.PI / 2, // Lengan melintang ke -Z di atas aspal
      headRotationY: 0, // Lensa mutlak +X (total yaw PI/2)
    },
  },
  north: { // RUAS UTARA (Depan) - Kendaraan datang dari Utara (-Z)
    laneCenterX: 2.25,
    stopLine: { position: [2.25, 0.06, -7.5] as [number, number, number], args: [4.5, 0.02, 0.5] as [number, number, number] },
    zebraCross: { position: [2.25, 0.06, -6.5] as [number, number, number] },
    trafficLight: {
      position: [4.5, 0, -6.0] as [number, number, number],
      rotationY: Math.PI,
      headRotationY: 0,
    },
  },
  cctv: {
    position: [0, 10, 17] as [number, number, number],
    target: [0, 1, -2] as [number, number, number],
  },
} as const
