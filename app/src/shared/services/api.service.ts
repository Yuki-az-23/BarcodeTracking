import axios, { AxiosInstance, AxiosError } from 'axios'
import type { ProcessedScan } from '@/modules/scanner/scanner.service'

export interface ApiConfig {
  baseURL: string
  timeout?: number
  token?: string
}

export interface ApiError {
  ok: false
  code: string
  message: string
  details?: unknown
  traceId?: string
}

export interface ScanResponse {
  ok: boolean
  scanId: string
  data?: ProcessedScan
}

export interface ProductResponse {
  barcode: string
  name: string
  supplier: string
  warrantyMonths: number
}

export class ApiService {
  private client: AxiosInstance
  private token: string | null = null

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (config.token) {
      this.setToken(config.token)
    }

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        // Add request ID for tracing
        config.headers['x-request-id'] = this.generateRequestId()
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        return Promise.reject(this.handleError(error))
      }
    )
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null
  }

  /**
   * Health check
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health')
    return response.data
  }

  /**
   * Create a scan
   */
  async createScan(scan: ProcessedScan): Promise<ScanResponse> {
    const response = await this.client.post<ScanResponse>('/scan', {
      barcode: scan.originalBarcode,
      internalBarcode: scan.internalBarcode,
      userId: scan.userId,
      timestamp: scan.timestamp,
      location: scan.location
    })
    return response.data
  }

  /**
   * Get product by barcode
   */
  async getProduct(barcode: string): Promise<ProductResponse> {
    const response = await this.client.get<ProductResponse>(`/product/${barcode}`)
    return response.data
  }

  /**
   * Get scans for a user
   */
  async getUserScans(userId: string): Promise<ProcessedScan[]> {
    const response = await this.client.get(`/scans/${userId}`)
    return response.data.scans || []
  }

  /**
   * Batch sync scans
   */
  async batchSyncScans(scans: ProcessedScan[]): Promise<{
    success: number
    failed: number
    errors: Array<{ scan: ProcessedScan; error: string }>
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ scan: ProcessedScan; error: string }>
    }

    // Process scans sequentially to avoid overwhelming the server
    for (const scan of scans) {
      try {
        await this.createScan(scan)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({
          scan,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  /**
   * Check if online
   */
  async isOnline(): Promise<boolean> {
    try {
      await this.checkHealth()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError<ApiError>): Error {
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data
      return new Error(apiError?.message || 'Server error')
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error - please check your connection')
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred')
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}

// Create singleton instance
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const apiService = new ApiService({
  baseURL: apiBaseURL
})
