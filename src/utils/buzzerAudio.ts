// Web Audio API Buzzer Synthesizer
// Menghasilkan bunyi alarm buzzer piezo 2000Hz persis seperti tone(BUZZER, 2000) di Arduino

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Aktifkan audio context pada interaksi pertama user (klik/tap) agar tidak diblokir browser
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    getAudioContext()
    window.removeEventListener('click', unlockAudio)
    window.removeEventListener('keydown', unlockAudio)
  }
  window.addEventListener('click', unlockAudio)
  window.addEventListener('keydown', unlockAudio)
}

/**
 * Membunyikan suara buzzer alarm di speaker komputer/browser
 * @param durationMs Durasi bunyi (default 800ms)
 * @param frequency Frekuensi nada (default 2000Hz sesuai kode Arduino)
 */
export function playBuzzerSound(durationMs = 900, frequency = 2000) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Buat pola bunyi beep-beep-beep cepat (3 pulsa alarm) yang dramatis dan realistis
    const pulses = 3
    const pulseDuration = durationMs / (pulses * 2 - 1) / 1000

    for (let i = 0; i < pulses; i++) {
      const startTime = ctx.currentTime + i * (pulseDuration * 2)
      const stopTime = startTime + pulseDuration

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Tipe gelombang square / saw menghasilkan suara buzzer piezo tajam yang keras
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(frequency, startTime)

      // Envelope volume
      gain.gain.setValueAtTime(0.001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.4, startTime + 0.02)
      gain.gain.setValueAtTime(0.4, stopTime - 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, stopTime)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(stopTime)
    }
  } catch (e) {
    console.warn('Gagal membunyikan audio buzzer:', e)
  }
}
