export interface PinConfig {
  TL1_RED: number
  TL1_YEL: number
  TL1_GRN: number
  TL2_RED: number
  TL2_YEL: number
  TL2_GRN: number
  TL3_RED: number
  TL3_YEL: number
  TL3_GRN: number
  TRIG1: number
  ECHO1: number
  TRIG2: number
  ECHO2: number
  TRIG3: number
  ECHO3: number
  BUZZER: number
}

export const DEFAULT_PINS: PinConfig = {
  TL1_RED: 27,
  TL1_YEL: 28,
  TL1_GRN: 29,
  TL2_RED: 2,
  TL2_YEL: 3,
  TL2_GRN: 4,
  TL3_RED: 40,
  TL3_YEL: 41,
  TL3_GRN: 42,
  TRIG1: 30, // Timur (TL1)
  ECHO1: 31,
  TRIG2: 11, // Barat (TL2)
  ECHO2: 12,
  TRIG3: 0,  // Utara (TL3) - Sensor Rusak / Tidak Dipakai
  ECHO3: 0,
  BUZZER: 32,
}

export type LightColor = 'MERAH' | 'KUNING' | 'HIJAU'

export interface PhaseState {
  TL1: LightColor
  TL2: LightColor
  TL3: LightColor
}

export const DEFAULT_PHASE: PhaseState = {
  TL1: 'MERAH',
  TL2: 'HIJAU',
  TL3: 'MERAH',
}

export function buildConfigString(cfg: PinConfig): string {
  return `CONFIG:TL1_RED=${cfg.TL1_RED},TL1_YEL=${cfg.TL1_YEL},TL1_GRN=${cfg.TL1_GRN},TL2_RED=${cfg.TL2_RED},TL2_YEL=${cfg.TL2_YEL},TL2_GRN=${cfg.TL2_GRN},TL3_RED=${cfg.TL3_RED},TL3_YEL=${cfg.TL3_YEL},TL3_GRN=${cfg.TL3_GRN},TRIG1=${cfg.TRIG1},ECHO1=${cfg.ECHO1},TRIG2=${cfg.TRIG2},ECHO2=${cfg.ECHO2},TRIG3=${cfg.TRIG3},ECHO3=${cfg.ECHO3},BUZZER=${cfg.BUZZER}`
}

export function parsePhaseLine(line: string): PhaseState | null {
  // Format 1: Output Arduino smartcross.ino
  // Contoh: "=== BARAT HIJAU | UTARA MERAH | TIMUR MERAH ==="
  const mb = line.match(/BARAT\s+(HIJAU|KUNING|MERAH)/i)
  const mu = line.match(/UTARA\s+(HIJAU|KUNING|MERAH)/i)
  const mt = line.match(/TIMUR\s+(HIJAU|KUNING|MERAH)/i)
  if (mb && mu && mt) {
    return {
      TL1: mt[1].toUpperCase() as LightColor, // Timur
      TL2: mb[1].toUpperCase() as LightColor, // Barat
      TL3: mu[1].toUpperCase() as LightColor, // Utara
    }
  }

  // Format 2: Fallback format TL 1 / TL 2 / TL 3
  const m1 = line.match(/TL\s*1\s+(MERAH|KUNING|HIJAU)/i)
  const m2 = line.match(/TL\s*2\s+(MERAH|KUNING|HIJAU)/i)
  const m3 = line.match(/TL\s*3\s+(MERAH|KUNING|HIJAU)/i)

  if (!m1 || !m2 || !m3) return null

  return {
    TL1: m1[1].toUpperCase() as LightColor,
    TL2: m2[1].toUpperCase() as LightColor,
    TL3: m3[1].toUpperCase() as LightColor,
  }
}

export function parseViolation(line: string): number | null {
  // Format 1: Output Arduino smartcross.ino
  // Contoh: "BARAT: 3 cm | TIMUR: 30 cm | !!! PELANGGARAN BARAT !!!"
  if (/PELANGGARAN\s+BARAT/i.test(line)) return 2 // Jalur Barat = TL2 = 2
  if (/PELANGGARAN\s+TIMUR/i.test(line)) return 1 // Jalur Timur = TL1 = 1
  if (/PELANGGARAN\s+UTARA/i.test(line)) return 3 // Jalur Utara = TL3 = 3

  // Format 2: Fallback format PELANGGARAN JALUR [123]
  const m = line.match(/PELANGGARAN\s+JALUR\s+([123])/i)
  if (!m) return null
  return Number(m[1])
}
