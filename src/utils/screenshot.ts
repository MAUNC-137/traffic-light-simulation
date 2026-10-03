export function captureCanvas(): string | null {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null
  return canvas.toDataURL('image/png')
}
