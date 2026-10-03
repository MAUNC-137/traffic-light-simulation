import { useEffect } from 'react'
import { useArenaStore } from '../store/arenaStore'
import type { PhaseState } from '../types/pins'

const CYCLE: PhaseState[] = [
  { TL1: 'HIJAU', TL2: 'MERAH', TL3: 'MERAH' },
  { TL1: 'KUNING', TL2: 'KUNING', TL3: 'KUNING' },
  { TL1: 'MERAH', TL2: 'HIJAU', TL3: 'MERAH' },
  { TL1: 'KUNING', TL2: 'KUNING', TL3: 'KUNING' },
  { TL1: 'MERAH', TL2: 'MERAH', TL3: 'HIJAU' },
  { TL1: 'KUNING', TL2: 'KUNING', TL3: 'KUNING' },
]
const DUR = [5000, 1200, 5000, 1200, 5000, 1200]

export function useSimCycle() {
  const isSim = useArenaStore((s) => s.isSimulationMode)
  const setPhase = useArenaStore((s) => s.setPhase)

  useEffect(() => {
    if (!isSim) return
    let i = 0
    let alive = true
    let t: ReturnType<typeof setTimeout>
    const step = () => {
      if (!alive) return
      setPhase(CYCLE[i % CYCLE.length], 'sim')
      t = setTimeout(step, DUR[i % DUR.length])
      i += 1
    }
    step()
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [isSim, setPhase])
}
