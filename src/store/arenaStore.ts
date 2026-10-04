import { create } from 'zustand'
import { DEFAULT_PHASE } from '../types/pins'
import type { LightColor, PhaseState } from '../types/pins'

export type LaneId = 'west' | 'east' | 'north'
export type TLKey = 'TL1' | 'TL2' | 'TL3'
export type PhaseSource = 'hardware' | 'sim'
export type Turn = 'straight' | 'left' | 'right'
export type VehicleType = 'sedan' | 'suv' | 'motor' | 'truck' | 'bus'

export interface VehicleInfo {
  type: VehicleType
  typeLabel: string
  plate: string
  color: string
}

export interface ViolationLog {
  id: string
  timestamp: number
  time: string
  lane: LaneId
  tl: TLKey
  phase: LightColor
  image: string | null
  cloudUrl?: string
  source: PhaseSource
  detail?: string
  vehicleInfo?: VehicleInfo
}

export interface VehicleState {
  id: string
  lane: LaneId
  turn: Turn
  isViolator: boolean
  color: string
  speed: number
  type: VehicleType
  plate: string
  typeLabel: string
  initialProgress?: number
}

interface ArenaState {
  isSimulationMode: boolean
  phase: PhaseState
  phaseSource: PhaseSource
  logs: ViolationLog[]
  lastViolationAt: number
  vehicles: VehicleState[]
  setSimulationMode: (v: boolean) => void
  setPhase: (p: PhaseState, source: PhaseSource) => void
  addViolation: (v: Omit<ViolationLog, 'id' | 'timestamp' | 'time'>) => ViolationLog
  attachImage: (id: string, image: string | null, cloudUrl?: string) => void
  clearLogs: () => void
  spawnVehicle: (v?: Partial<VehicleState>) => VehicleState
  despawnVehicle: (id: string) => void
  clearVehicles: () => void
  resetSimulation: () => void
}

const LANE_TL: Record<LaneId, TLKey> = { west: 'TL2', east: 'TL1', north: 'TL3' }

export function laneOf(tl: TLKey): LaneId {
  if (tl === 'TL1') return 'east'
  if (tl === 'TL2') return 'west'
  return 'north'
}

export function tlOf(lane: LaneId): TLKey {
  return LANE_TL[lane]
}

export function getVehicleTypeLabel(type: VehicleType): string {
  switch (type) {
    case 'motor':
      return 'Sepeda Motor'
    case 'truck':
      return 'Truk Box'
    case 'bus':
      return 'Mini Bus'
    case 'suv':
      return 'Mobil SUV'
    case 'sedan':
    default:
      return 'Mobil Sedan'
  }
}

const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#e2e8f0', '#1e293b']
const TURNS_BY_LANE: Record<LaneId, Turn[]> = {
  west: ['straight', 'left'],
  east: ['straight', 'right'],
  north: ['left', 'right'],
}

const VEHICLE_TYPES: VehicleType[] = ['sedan', 'sedan', 'suv', 'motor', 'motor', 'truck', 'bus']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePlate(): string {
  const regions = ['B', 'D', 'F', 'B', 'B']
  const reg = pick(regions)
  const num = Math.floor(1000 + Math.random() * 8999)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const s1 = letters[Math.floor(Math.random() * letters.length)]
  const s2 = letters[Math.floor(Math.random() * letters.length)]
  return `${reg} ${num} ${s1}${s2}`
}

export const useArenaStore = create<ArenaState>((set) => ({
  isSimulationMode: false,
  phase: DEFAULT_PHASE,
  phaseSource: 'hardware',
  logs: [],
  lastViolationAt: 0,
  vehicles: [],
  setSimulationMode: (v) => set({ isSimulationMode: v, phaseSource: v ? 'sim' : 'hardware' }),
  setPhase: (p, source) => set({ phase: p, phaseSource: source }),
  addViolation: (v) => {
    const timestamp = Date.now()
    const log: ViolationLog = {
      ...v,
      id: `${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
      time: new Date(timestamp).toLocaleTimeString('id-ID', { hour12: false }),
    }
    set((s) => ({ logs: [log, ...s.logs].slice(0, 50), lastViolationAt: timestamp }))
    return log
  },
  attachImage: (id, image, cloudUrl) =>
    set((s) => ({
      logs: s.logs.map((l) => (l.id === id ? { ...l, image: image ?? l.image, cloudUrl: cloudUrl ?? l.cloudUrl } : l)),
    })),
  clearLogs: () => set({ logs: [] }),
  spawnVehicle: (partial) => {
    const lane = (partial?.lane as LaneId) ?? pick(['west', 'east', 'north'] as LaneId[])
    const turn = (partial?.turn as Turn) ?? pick(TURNS_BY_LANE[lane])
    const type = partial?.type ?? pick(VEHICLE_TYPES)
    const plate = partial?.plate ?? generatePlate()
    const typeLabel = getVehicleTypeLabel(type)
    const color = partial?.color ?? (type === 'motor' ? pick(['#1e293b', '#ef4444', '#2563eb']) : pick(COLORS))

    const v: VehicleState = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lane,
      turn,
      type,
      plate,
      typeLabel,
      isViolator: partial?.isViolator ?? Math.random() < 0.5,
      color,
      speed: partial?.speed ?? (type === 'motor' ? 6.5 + Math.random() * 2 : type === 'truck' ? 4 + Math.random() * 1.5 : 5.2 + Math.random() * 2),
      initialProgress: partial?.initialProgress ?? 0,
    }
    set((s) => ({ vehicles: [...s.vehicles, v].slice(-14) }))
    return v
  },
  despawnVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),
  clearVehicles: () => set({ vehicles: [] }),
  resetSimulation: () =>
    set({
      vehicles: [],
      phase: DEFAULT_PHASE,
      phaseSource: 'sim',
    }),
}))
