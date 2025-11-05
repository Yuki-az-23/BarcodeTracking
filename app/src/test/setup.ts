import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Capacitor plugins
global.Capacitor = {
  getPlatform: () => 'web',
  isNativePlatform: () => false,
  isPluginAvailable: () => false,
  convertFileSrc: (path: string) => path
} as any

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
