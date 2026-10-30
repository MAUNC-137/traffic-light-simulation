import { useCallback, useEffect, useRef, useState } from 'react'
import { buildConfigString } from '../types/pins'
import type { PinConfig } from '../types/pins'
import type { SerialNavigator, WebSerialPort } from '../types/serial'

export function useSerial(onLine?: (line: string) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [lastLine, setLastLine] = useState<string | null>(null)

  const portRef = useRef<WebSerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null)
  const keepReading = useRef(false)
  const bufferRef = useRef('')

  const onLineRef = useRef(onLine)
  useEffect(() => {
    onLineRef.current = onLine
  })

  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator

  const connect = useCallback(async () => {
    const nav = navigator as SerialNavigator
    if (!nav.serial) {
      alert('Browser tidak mendukung WebSerial. Gunakan Google Chrome atau Microsoft Edge.')
      return
    }

    try {
      const port = await nav.serial.requestPort()
      await port.open({ baudRate: 9600 })

      if (!port.readable) {
        throw new Error('Port tidak memiliki readable stream.')
      }

      portRef.current = port
      setIsConnected(true)
      keepReading.current = true

      const decoder = new TextDecoderStream()
      void port.readable.pipeTo(decoder.writable)
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
        alert(
          'Gagal menghubungkan ke Arduino: ' +
            (error?.message || String(err)) +
            '\n\nPastikan Serial Monitor di Arduino IDE sudah DITUTUP.',
        )
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
    readerRef.current = null
    portRef.current = null
    setIsConnected(false)
  }, [])

  const send = useCallback(async (msg: string) => {
    const port = portRef.current
    if (!port?.writable) {
      console.warn('⚠️ [WebSerial] Belum terhubung ke Arduino, tidak bisa kirim:', msg)
      return
    }

    let retries = 6
    while (port.writable.locked && retries > 0) {
      await new Promise((r) => setTimeout(r, 30))
      retries--
    }

    if (port.writable.locked) {
      console.warn('⚠️ [WebSerial] Writable stream masih locked, abaikan pengiriman:', msg)
      return
    }

    let writer: WritableStreamDefaultWriter<Uint8Array> | null = null
    try {
      writer = port.writable.getWriter()
      await writer.write(new TextEncoder().encode(msg + '\n'))
      console.log('⚡ [WebSerial] Berhasil kirim sinyal ke Arduino:', msg)
    } catch (e) {
      console.error('❌ [WebSerial] Gagal kirim ke Arduino:', e)
    } finally {
      try {
        writer?.releaseLock()
      } catch {
        // ignore
      }
    }
  }, [])

  const sendPinConfig = useCallback(
    async (cfg: PinConfig) => {
      await send(buildConfigString(cfg))
    },
    [send],
  )

  useEffect(() => {
    return () => {
      keepReading.current = false
    }
  }, [])

  return { isSupported, isConnected, logs, lastLine, connect, disconnect, send, sendPinConfig }
}
