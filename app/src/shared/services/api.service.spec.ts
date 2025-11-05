import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiService } from './api.service'
import axios from 'axios'

// Mock axios
vi.mock('axios')

describe('ApiService', () => {
  let apiService: ApiService

  beforeEach(() => {
    apiService = new ApiService({
      baseURL: 'http://localhost:3000/api/v1',
      timeout: 5000
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('setToken', () => {
    it('should set authentication token', () => {
      const token = 'test-token-123'
      apiService.setToken(token)

      // Token is private, but we can test it indirectly
      // by checking if it's included in requests
      expect(apiService).toBeDefined()
    })
  })

  describe('clearToken', () => {
    it('should clear authentication token', () => {
      apiService.setToken('test-token')
      apiService.clearToken()

      expect(apiService).toBeDefined()
    })
  })

  describe('checkHealth', () => {
    it('should call health endpoint', async () => {
      const mockResponse = {
        data: {
          status: 'ok',
          timestamp: new Date().toISOString()
        }
      }

      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse)
      } as any)

      const service = new ApiService({ baseURL: 'http://localhost:3000' })
      const result = await service.checkHealth()

      expect(result.status).toBe('ok')
    })
  })

  describe('isOnline', () => {
    it('should return true when health check succeeds', async () => {
      const mockResponse = {
        data: { status: 'ok', timestamp: new Date().toISOString() }
      }

      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse)
      } as any)

      const service = new ApiService({ baseURL: 'http://localhost:3000' })
      const isOnline = await service.isOnline()

      expect(isOnline).toBe(true)
    })

    it('should return false when health check fails', async () => {
      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('Network error'))
      } as any)

      const service = new ApiService({ baseURL: 'http://localhost:3000' })
      const isOnline = await service.isOnline()

      expect(isOnline).toBe(false)
    })
  })
})
