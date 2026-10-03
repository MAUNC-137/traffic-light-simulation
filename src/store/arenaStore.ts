import { create } from 'zustand'
import { DEFAULT_PHASE } from '../types/pins'
import type { LightColor, PhaseState } from '../types/pins'

export type LaneId = 'west' | 'east' | 'north'
export type TLKey = 'TL1' | 'TL2' | 'TL3'
export type PhaseSource = 'hardware' | 'sim'
export type Turn = 'straight' | 'left' | 'right'

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
}

export interface VehicleState {
  id: string
  lane: LaneId
  turn: Turn
  isViolator: boolean
  color: string
  speed: number
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

const COLORS = ['#e11d48', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e']
const TURNS_BY_LANE: Record<LaneId, Turn[]> = {
  west: ['straight', 'left'],
  east: ['straight', 'right'],
  north: ['left', 'right'],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
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
    const lane = (partial?.lane as LaneId) ?? (pick(['west', 'east', 'north'] as LaneId[]))
    const turn = (partial?.turn as Turn) ?? pick(TURNS_BY_LANE[lane])
    const v: VehicleState = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lane,
      turn,
      isViolator: partial?.isViolator ?? Math.random() < 0.6,
      color: partial?.color ?? pick(COLORS),
      speed: partial?.speed ?? 5 + Math.random() * 2.5,
    }
    set((s) => ({ vehicles: [...s.vehicles, v].slice(-12) }))
    return v
  },
  despawnVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),
  clearVehicles: () => set({ vehicles: [] }),
}))
