import { BarcodeScanner, ScanResult } from '@/shared/utils/barcode-scanner'
import { BarcodeGenerator } from '@/shared/utils/barcode-generator'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export interface ProcessedScan {
  originalBarcode: string
  internalBarcode: string
  format: string
  timestamp: string
  userId: string
  location?: {
    latitude: number
    longitude: number
  }
}

export interface ScannerServiceConfig {
  userId: string
  enableHaptics?: boolean
  enableLocation?: boolean
}

export class ScannerService {
  private scanner: BarcodeScanner
  private config: ScannerServiceConfig
  private videoElement: HTMLVideoElement | null = null

  constructor(config: ScannerServiceConfig) {
    this.config = config
    this.scanner = new BarcodeScanner({
      timeBetweenScans: 1500 // Prevent duplicate scans within 1.5s
    })
  }

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    return await this.scanner.requestPermissions()
  }

  /**
   * Start scanning with video element
   */
  async startScanning(
    videoElement: HTMLVideoElement,
    onScan: (scan: ProcessedScan) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    this.videoElement = videoElement

    await this.scanner.startScanning(
      videoElement,
      async (result: ScanResult) => {
        // Provide haptic feedback
        if (this.config.enableHaptics) {
          await this.vibrate()
        }

        // Process the scan
        const processedScan = await this.processScan(result)
        onScan(processedScan)
      },
      onError
    )
  }

  /**
   * Stop scanning
   */
  stopScanning(): void {
    this.scanner.stopScanning()
    this.videoElement = null
  }

  /**
   * Process raw scan result
   */
  private async processScan(result: ScanResult): Promise<ProcessedScan> {
    // Generate internal barcode
    const internalBarcode = BarcodeGenerator.generate({
      originalCode: result.text,
      supplierId: this.extractSupplier(result.text)
    })

    // Get location if enabled
    let location: { latitude: number; longitude: number } | undefined

    if (this.config.enableLocation) {
      location = await this.getCurrentLocation()
    }

    return {
      originalBarcode: result.text,
      internalBarcode,
      format: result.format,
      timestamp: new Date(result.timestamp).toISOString(),
      userId: this.config.userId,
      location
    }
  }

  /**
   * Manual entry processing
   */
  async processManualEntry(barcode: string): Promise<ProcessedScan> {
    const result: ScanResult = {
      text: barcode,
      format: 'MANUAL',
      timestamp: Date.now()
    }

    return await this.processScan(result)
  }

  /**
   * Scan from image file
   */
  async scanFromImage(imageFile: File): Promise<ProcessedScan> {
    const result = await this.scanner.scanFromImage(imageFile)
    return await this.processScan(result)
  }

  /**
   * Extract supplier from barcode (basic implementation)
   */
  private extractSupplier(barcode: string): string {
    // This is a simplified version - in production, you'd have a mapping table
    // For now, use first 4 chars as supplier code
    const cleaned = barcode.replace(/[^A-Z0-9]/gi, '')
    return cleaned.substring(0, 4).toUpperCase() || 'UNKN'
  }

  /**
   * Get current location
   */
  private async getCurrentLocation(): Promise<
    { latitude: number; longitude: number } | undefined
  > {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60000
        })
      })

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
    } catch (error) {
      console.warn('Could not get location:', error)
      return undefined
    }
  }

  /**
   * Provide haptic feedback
   */
  private async vibrate(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch (error) {
      // Haptics not available on web
      console.debug('Haptics not available')
    }
  }

  /**
   * Check if scanner is active
   */
  isScanning(): boolean {
    return this.scanner.isActive()
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopScanning()
    this.scanner.destroy()
  }
}
