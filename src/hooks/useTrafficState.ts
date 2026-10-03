import { useEffect, useState } from 'react'
import { DEFAULT_PHASE, parsePhaseLine, parseViolation } from '../types/pins'
import type { PhaseState } from '../types/pins'

export function useTrafficState(lastLine: string | null, onViolation: (lane: number) => void) {
  const [phase, setPhase] = useState<PhaseState>(DEFAULT_PHASE)

  useEffect(() => {
    if (!lastLine) return
    const p = parsePhaseLine(lastLine)
    if (p) setPhase(p)

    const v = parseViolation(lastLine)
    if (v) onViolation(v)
  }, [lastLine, onViolation])

  return { phase }
}
