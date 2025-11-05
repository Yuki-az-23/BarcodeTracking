import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ScannerService, ProcessedScan } from './scanner.service'
import { syncManager } from '../sync/sync-manager.service'
import { useToast } from '@/shared/composables/useToast'

export const useScannerStore = defineStore('scanner', () => {
  // State
  const isScanning = ref(false)
  const isInitialized = ref(false)
  const hasPermission = ref(false)
  const recentScans = ref<ProcessedScan[]>([])
  const currentUserId = ref<string>('demo-user') // TODO: Get from auth store

  let scannerService: ScannerService | null = null
  const { showToast } = useToast()

  // Computed
  const scanCount = computed(() => recentScans.value.length)

  // Actions
  async function initialize() {
    if (isInitialized.value) {
      return
    }

    scannerService = new ScannerService({
      userId: currentUserId.value,
      enableHaptics: true,
      enableLocation: false // Can enable later
    })

    isInitialized.value = true
  }

  async function requestPermissions(): Promise<boolean> {
    if (!scannerService) {
      await initialize()
    }

    try {
      hasPermission.value = await scannerService!.requestPermissions()
      return hasPermission.value
    } catch (error) {
      console.error('Permission request failed:', error)
      showToast('Camera permission denied', 'error')
      return false
    }
  }

  async function startScanning(videoElement: HTMLVideoElement) {
    if (!scannerService) {
      await initialize()
    }

    if (!hasPermission.value) {
      const granted = await requestPermissions()
      if (!granted) {
        throw new Error('Camera permission required')
      }
    }

    isScanning.value = true

    await scannerService!.startScanning(
      videoElement,
      async (scan) => {
        await handleScan(scan)
      },
      (error) => {
        console.error('Scanner error:', error)
        showToast('Scanner error: ' + error.message, 'error')
      }
    )
  }

  function stopScanning() {
    if (scannerService) {
      scannerService.stopScanning()
    }
    isScanning.value = false
  }

  async function handleScan(scan: ProcessedScan) {
    try {
      // Add to recent scans
      recentScans.value.unshift(scan)

      // Keep only last 20 scans in memory
      if (recentScans.value.length > 20) {
        recentScans.value = recentScans.value.slice(0, 20)
      }

      // Queue for sync
      await syncManager.queueScan(scan)

      showToast(
        `Scanned: ${scan.originalBarcode}`,
        'success'
      )

      return scan
    } catch (error) {
      console.error('Failed to handle scan:', error)
      showToast('Failed to save scan', 'error')
      throw error
    }
  }

  async function processManualEntry(barcode: string) {
    if (!scannerService) {
      await initialize()
    }

    try {
      const scan = await scannerService!.processManualEntry(barcode)
      await handleScan(scan)
      return scan
    } catch (error) {
      console.error('Manual entry failed:', error)
      showToast('Failed to process barcode', 'error')
      throw error
    }
  }

  async function scanFromImage(imageFile: File) {
    if (!scannerService) {
      await initialize()
    }

    try {
      const scan = await scannerService!.scanFromImage(imageFile)
      await handleScan(scan)
      return scan
    } catch (error) {
      console.error('Image scan failed:', error)
      showToast('No barcode found in image', 'error')
      throw error
    }
  }

  function clearRecentScans() {
    recentScans.value = []
  }

  function $reset() {
    if (scannerService) {
      scannerService.destroy()
      scannerService = null
    }
    isScanning.value = false
    isInitialized.value = false
    hasPermission.value = false
    recentScans.value = []
  }

  return {
    // State
    isScanning,
    isInitialized,
    hasPermission,
    recentScans,
    currentUserId,

    // Computed
    scanCount,

    // Actions
    initialize,
    requestPermissions,
    startScanning,
    stopScanning,
    handleScan,
    processManualEntry,
    scanFromImage,
    clearRecentScans,
    $reset
  }
})
