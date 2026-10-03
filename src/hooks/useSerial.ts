import { useCallback, useEffect, useRef, useState } from 'react'
import { buildConfigString } from '../types/pins'
import type { PinConfig } from '../types/pins'

export function useSerial(onLine?: (line: string) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [lastLine, setLastLine] = useState<string | null>(null)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readerRef = useRef<any>(null)
  const keepReading = useRef(false)
  const bufferRef = useRef('')

  const onLineRef = useRef(onLine)
  useEffect(() => {
    onLineRef.current = onLine
  })

  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator

  const connect = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any
    if (!nav.serial) {
      alert('Browser tidak mendukung WebSerial. Gunakan Google Chrome atau Microsoft Edge.')
      return
    }

    try {
      const port = await nav.serial.requestPort()
      await port.open({ baudRate: 9600 })

      portRef.current = port
      setIsConnected(true)
      keepReading.current = true

      const decoder = new TextDecoderStream()
      port.readable.pipeTo(decoder.writable)
      const reader = decoder.readable.getReader()
      readerRef.current = reader

      try {
        while (keepReading.current) {
          const { value, done } = await reader.read()
          if (done) break
          if (value) {
            bufferRef.current += value
            let idx = bufferRef.current.search(/\r?\n/)
            while (idx >= 0) {
              const line = bufferRef.current.slice(0, idx).trim()
              bufferRef.current = bufferRef.current.slice(idx + 1).replace(/^\n/, '')
              if (line) {
                setLastLine(line)
                setLogs((p) => [...p.slice(-199), line])
                onLineRef.current?.(line)
              }
              idx = bufferRef.current.search(/\r?\n/)
            }
          }
        }
      } catch {
        keepReading.current = false
      }
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string }
      if (error?.name !== 'NotFoundError') {
        alert('Gagal menghubungkan ke Arduino: ' + (error?.message || String(err)) + '\n\nPastikan Serial Monitor di Arduino IDE sudah DITUTUP.')
      }
      setIsConnected(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    keepReading.current = false
    try {
      await readerRef.current?.cancel()
    } catch {
      // ignore
    }
    try {
      await portRef.current?.close()
    } catch {
      // ignore
    }
    portRef.current = null
    setIsConnected(false)
  }, [])

  const send = useCallback(async (msg: string) => {
    if (!portRef.current?.writable) {
      console.warn('[WebSerial] Belum terhubung ke Arduino, tidak bisa kirim:', msg)
      return
    }
    try {
      const writer = portRef.current.writable.getWriter()
      await writer.write(new TextEncoder().encode(msg + '\n'))
      writer.releaseLock()
      console.log('⚡ [WebSerial] Berhasil kirim sinyal ke Arduino:', msg)
    } catch (e) {
      console.error('❌ [WebSerial] Gagal kirim ke Arduino:', e)
    }
  }, [])

  const sendPinConfig = useCallback(async (cfg: PinConfig) => {
    await send(buildConfigString(cfg))
  }, [send])

  useEffect(() => {
    return () => {
      keepReading.current = false
    }
  }, [])

  return { isSupported, isConnected, logs, lastLine, connect, disconnect, send, sendPinConfig }
}
