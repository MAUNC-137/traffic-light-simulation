import { useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ARENA_CONFIG } from '../config/arena'

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

export function captureCanvasFallback(): string | null {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null
  return canvas.toDataURL('image/png')
}
