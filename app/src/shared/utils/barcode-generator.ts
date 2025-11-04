/**
 * Generates internal barcodes in the format:
 * INV-[SUPPLIER]-[TIMESTAMP]-[CHECKSUM]
 */

export interface BarcodeGenerationData {
  originalCode: string
  supplierId?: string
  warehouseId?: string
}

export class BarcodeGenerator {
  private static readonly PREFIX = 'INV'

  /**
   * Generate an internal barcode
   */
  static generate(data: BarcodeGenerationData): string {
    const supplier = (data.supplierId || 'UNKN').padStart(4, '0').substring(0, 4)
    const timestamp = this.encodeTimestamp(Date.now())
    const checksum = this.calculateChecksum(data.originalCode, supplier, timestamp)

    return `${this.PREFIX}-${supplier}-${timestamp}-${checksum}`
  }

  /**
   * Validate an internal barcode format
   */
  static validate(barcode: string): boolean {
    const pattern = /^INV-[A-Z0-9]{4}-[A-Z0-9]{6,8}-[A-Z0-9]{4}$/
    return pattern.test(barcode)
  }

  /**
   * Parse an internal barcode to extract components
   */
  static parse(barcode: string): {
    prefix: string
    supplierId: string
    timestamp: number
    checksum: string
  } | null {
    if (!this.validate(barcode)) {
      return null
    }

    const parts = barcode.split('-')
    return {
      prefix: parts[0],
      supplierId: parts[1],
      timestamp: this.decodeTimestamp(parts[2]),
      checksum: parts[3]
    }
  }

  /**
   * Encode timestamp to base36 string
   */
  private static encodeTimestamp(timestamp: number): string {
    return timestamp.toString(36).toUpperCase().substring(0, 8)
  }

  /**
   * Decode base36 timestamp string to number
   */
  private static decodeTimestamp(encoded: string): number {
    return parseInt(encoded, 36)
  }

  /**
   * Calculate checksum using simple algorithm
   */
  private static calculateChecksum(...parts: string[]): string {
    const combined = parts.join('')
    let sum = 0

    for (let i = 0; i < combined.length; i++) {
      sum += combined.charCodeAt(i) * (i + 1)
    }

    // Convert to base36 and take last 4 chars
    return sum.toString(36).toUpperCase().padStart(4, '0').substring(0, 4)
  }

  /**
   * Generate a unique ID for sync queue items
   */
  static generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}
