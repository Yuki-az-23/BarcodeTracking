export interface Scan {
  id: string
  productId: string
  userId: string
  timestamp: Date
}

export interface CreateScanDto {
  barcode: string
  internalBarcode: string
  userId: string
  timestamp: string
}

export interface ScanResponse {
  ok: boolean
  scanId: string
  data?: CreateScanDto
}

export interface ScanResult {
  success: boolean
  barcode: string
  internalBarcode?: string
  timestamp: string
  error?: string
}
