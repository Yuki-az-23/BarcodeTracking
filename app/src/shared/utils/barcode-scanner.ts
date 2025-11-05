import { BarcodeFormat, BrowserMultiFormatReader, Result } from '@zxing/library'

export interface ScannerConfig {
  formats?: BarcodeFormat[]
  constraints?: MediaStreamConstraints
  timeBetweenScans?: number
}

export interface ScanResult {
  text: string
  format: string
  timestamp: number
}

export class BarcodeScanner {
  private reader: BrowserMultiFormatReader
  private isScanning = false
  private lastScanTime = 0
  private timeBetweenScans: number

  constructor(config: ScannerConfig = {}) {
    this.reader = new BrowserMultiFormatReader()
    this.timeBetweenScans = config.timeBetweenScans || 1000

    // Set supported formats
    if (config.formats) {
      this.reader.hints.set(2, config.formats) // DecodeHintType.POSSIBLE_FORMATS = 2
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Close the stream immediately, we just needed permission
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch (error) {
      console.error('Camera permission denied:', error)
      return false
    }
  }

  async startScanning(
    videoElement: HTMLVideoElement,
    onScan: (result: ScanResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (this.isScanning) {
      console.warn('Scanner is already running')
      return
    }

    try {
      this.isScanning = true

      await this.reader.decodeFromVideoDevice(
        undefined, // Use default camera
        videoElement,
        (result: Result | null, error?: Error) => {
          if (result) {
            // Prevent duplicate scans within timeBetweenScans
            const now = Date.now()
            if (now - this.lastScanTime >= this.timeBetweenScans) {
              this.lastScanTime = now
              onScan({
                text: result.getText(),
                format: result.getBarcodeFormat().toString(),
                timestamp: now
              })
            }
          }

          if (error && onError && !(error.name === 'NotFoundException')) {
            // NotFoundException is expected when no barcode is in view
            onError(error)
          }
        }
      )
    } catch (error) {
      this.isScanning = false
      if (onError) {
        onError(error as Error)
      }
      throw error
    }
  }

  stopScanning(): void {
    if (this.isScanning) {
      this.reader.reset()
      this.isScanning = false
    }
  }

  isActive(): boolean {
    return this.isScanning
  }

  async scanFromImage(imageFile: File): Promise<ScanResult> {
    try {
      const result = await this.reader.decodeFromImageUrl(URL.createObjectURL(imageFile))
      return {
        text: result.getText(),
        format: result.getBarcodeFormat().toString(),
        timestamp: Date.now()
      }
    } catch (error) {
      throw new Error('No barcode found in image')
    }
  }

  getSupportedFormats(): string[] {
    return [
      'QR_CODE',
      'CODE_128',
      'CODE_39',
      'EAN_13',
      'EAN_8',
      'UPC_A',
      'UPC_E',
      'ITF',
      'CODABAR',
      'DATA_MATRIX',
      'PDF_417'
    ]
  }

  destroy(): void {
    this.stopScanning()
  }
}
