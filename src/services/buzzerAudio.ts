// Web Audio API Buzzer Synthesizer
// Menghasilkan bunyi alarm buzzer piezo 2000Hz persis seperti tone(BUZZER, 2000) pada mikrokontroler Arduino

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Unlock audio context pada interaksi pertama user (klik/tap/keyboard)
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
 * @param durationMs Durasi bunyi (default 900ms)
 * @param frequency Frekuensi nada (default 2000Hz sesuai kode Arduino)
 */
export function playBuzzerSound(durationMs = 900, frequency = 2000) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Pola 3 pulsa alarm piezo cepat
    const pulses = 3
    const pulseDuration = durationMs / (pulses * 2 - 1) / 1000

    for (let i = 0; i < pulses; i++) {
      const startTime = ctx.currentTime + i * (pulseDuration * 2)
      const stopTime = startTime + pulseDuration

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Sawtooth waveform menyerupai suara tajam piezo buzzer
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(frequency, startTime)

      gain.gain.setValueAtTime(0.001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02)
      gain.gain.setValueAtTime(0.35, stopTime - 0.02)
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
