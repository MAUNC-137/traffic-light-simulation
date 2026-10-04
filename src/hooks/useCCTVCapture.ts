import { useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ARENA_CONFIG } from '../config/arena'

export interface CaptureOverlayInfo {
  typeLabel?: string
  plate?: string
  laneName?: string
  phase?: string
  time?: string
}

export function useCCTVCapture() {
  const { gl, scene } = useThree()

  const capture = useCallback(async (): Promise<string | null> => {
    try {
      const rt = new THREE.WebGLRenderTarget(960, 540)
      const cam = new THREE.PerspectiveCamera(65, 960 / 540, 0.1, 200)
      cam.position.set(...ARENA_CONFIG.cctv.position)
      cam.lookAt(new THREE.Vector3(...ARENA_CONFIG.cctv.target))
      cam.updateMatrixWorld()
      const old = gl.getRenderTarget()
      gl.setRenderTarget(rt)
      gl.render(scene, cam)
      gl.setRenderTarget(old)
      const canvas = document.createElement('canvas')
      canvas.width = rt.width
      canvas.height = rt.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      const buf = new Uint8Array(rt.width * rt.height * 4)
      gl.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, buf)
      const flipped = new Uint8Array(buf)
      const row = rt.width * 4
      for (let y = 0; y < rt.height; y++) {
        flipped.set(buf.subarray((rt.height - 1 - y) * row, (rt.height - y) * row), y * row)
      }
      const data = new ImageData(new Uint8ClampedArray(flipped), rt.width, rt.height)
      ctx.putImageData(data as unknown as ImageData, 0, 0)
      rt.dispose()
      return canvas.toDataURL('image/png')
    } catch {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null
      return canvas.toDataURL('image/png')
    }
  }, [gl, scene])

  return capture
}

export function captureCanvasWithOverlay(info?: CaptureOverlayInfo): string | null {
  const webglCanvas = document.querySelector('canvas')
  if (!webglCanvas) return null

  try {
    const w = webglCanvas.width
    const h = webglCanvas.height
    const out = document.createElement('canvas')
    out.width = w
    out.height = h
    const ctx = out.getContext('2d')
    if (!ctx) return webglCanvas.toDataURL('image/png')

    // 1. Salin frame 3D scene (termasuk wireframe 3D highlight)
    ctx.drawImage(webglCanvas, 0, 0, w, h)

    // 2. Bar Telemetri CCTV Atas
    ctx.fillStyle = 'rgba(6, 8, 14, 0.85)'
    ctx.fillRect(0, 0, w, 52)

    // Label Kamera & Status
    ctx.font = 'bold 15px monospace'
    ctx.fillStyle = '#ef4444'
    ctx.fillText('🔴 CCTV TRAFFIC SURVEILLANCE // PELANGGARAN TERDETEKSI', 20, 25)

    ctx.font = '12px monospace'
    ctx.fillStyle = '#94a3b8'
    const nowStr = new Date().toLocaleString('id-ID', { hour12: false })
    ctx.fillText(`CAM-01 INTERSECTION · ${info?.laneName || 'Jalur'} · ${nowStr}`, 20, 42)

    // 3. AI Detection Telemetry Card di kanan atas
    if (info?.plate || info?.typeLabel) {
      const boxW = 310
      const boxH = 44
      const boxX = w - boxW - 20
      const boxY = 4
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1.5
      ctx.fillRect(boxX, boxY, boxW, boxH)
      ctx.strokeRect(boxX, boxY, boxW, boxH)

      ctx.font = 'bold 11px monospace'
      ctx.fillStyle = '#f87171'
      ctx.fillText(`TARGET: ${info.typeLabel?.toUpperCase() || 'KENDARAAN'}`, boxX + 10, boxY + 18)

      ctx.font = 'bold 13px monospace'
      ctx.fillStyle = '#38bdf8'
      ctx.fillText(`PLAT: ${info.plate || 'B 1945 SC'}`, boxX + 10, boxY + 35)

      ctx.fillStyle = '#ef4444'
      ctx.fillText(`[LAMPU MERAH]`, boxX + boxW - 105, boxY + 35)
    }

    return out.toDataURL('image/png')
  } catch {
    return webglCanvas.toDataURL('image/png')
  }
}

export function captureCanvasFallback(): string | null {
  return captureCanvasWithOverlay()
}
