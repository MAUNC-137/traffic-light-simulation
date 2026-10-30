// Web Serial API TypeScript declarations

export interface SerialPortOptions {
  baudRate: number
  dataBits?: number
  stopBits?: number
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
  flowControl?: 'none' | 'hardware'
}

export interface WebSerialPort {
  readable: ReadableStream<BufferSource> | null
  writable: WritableStream<Uint8Array> | null
  open(options: SerialPortOptions): Promise<void>
  close(): Promise<void>
  forget?(): Promise<void>
}

export interface SerialNavigator extends Navigator {
  serial?: {
    requestPort(options?: { filters?: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<WebSerialPort>
    getPorts(): Promise<WebSerialPort[]>
  }
}
