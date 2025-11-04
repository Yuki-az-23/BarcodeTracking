import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { syncManager, SyncStatus, SyncEvent } from './sync-manager.service'
import { Network } from '@capacitor/network'

export const useSyncStore = defineStore('sync', () => {
  // State
  const isSyncing = ref(false)
  const queueSize = ref(0)
  const lastSyncTime = ref<number | null>(null)
  const lastSyncSuccess = ref(true)
  const error = ref<string | null>(null)
  const isOnline = ref(true)
  const syncProgress = ref<{
    successCount: number
    failCount: number
    total: number
  } | null>(null)

  // Computed
  const hasPendingSync = computed(() => queueSize.value > 0)

  const syncStatusText = computed(() => {
    if (isSyncing.value) {
      if (syncProgress.value) {
        const { successCount, total } = syncProgress.value
        return `Syncing ${successCount}/${total}...`
      }
      return 'Syncing...'
    }
    if (queueSize.value > 0) {
      return `${queueSize.value} pending`
    }
    if (lastSyncTime.value) {
      return 'Synced'
    }
    return 'No sync yet'
  })

  const lastSyncTimeFormatted = computed(() => {
    if (!lastSyncTime.value) return null
    return new Date(lastSyncTime.value).toLocaleString()
  })

  // Actions
  async function initialize() {
    // Setup network listener
    await setupNetworkListener()

    // Setup sync event listeners
    syncManager.addEventListener(handleSyncEvent)

    // Initialize sync manager
    await syncManager.initialize()

    // Load initial status
    await updateStatus()
  }

  async function setupNetworkListener() {
    // Get initial network status
    const status = await Network.getStatus()
    isOnline.value = status.connected

    // Listen for network changes
    await Network.addListener('networkStatusChange', (status) => {
      isOnline.value = status.connected
    })
  }

  function handleSyncEvent(event: SyncEvent) {
    switch (event.type) {
      case 'start':
        isSyncing.value = true
        syncProgress.value = null
        error.value = null
        break

      case 'progress':
        if (event.data) {
          syncProgress.value = event.data as any
        }
        break

      case 'complete':
        isSyncing.value = false
        lastSyncSuccess.value = true
        lastSyncTime.value = Date.now()
        syncProgress.value = null
        updateStatus()
        break

      case 'error':
        isSyncing.value = false
        lastSyncSuccess.value = false
        error.value = event.data as string
        syncProgress.value = null
        updateStatus()
        break

      case 'queue-change':
        updateStatus()
        break
    }
  }

  async function updateStatus() {
    const status: SyncStatus = await syncManager.getStatus()
    queueSize.value = status.queueSize
    lastSyncTime.value = status.lastSyncTime
    lastSyncSuccess.value = status.lastSyncSuccess
    error.value = status.error
  }

  async function manualSync() {
    if (!isOnline.value) {
      error.value = 'No internet connection'
      return
    }

    await syncManager.sync()
  }

  async function clearQueue() {
    await syncManager.clearQueue()
    await updateStatus()
  }

  async function getQueueStats() {
    return await syncManager.getQueueStats()
  }

  function $reset() {
    isSyncing.value = false
    queueSize.value = 0
    lastSyncTime.value = null
    lastSyncSuccess.value = true
    error.value = null
    isOnline.value = true
    syncProgress.value = null
  }

  return {
    // State
    isSyncing,
    queueSize,
    lastSyncTime,
    lastSyncSuccess,
    error,
    isOnline,
    syncProgress,

    // Computed
    hasPendingSync,
    syncStatusText,
    lastSyncTimeFormatted,

    // Actions
    initialize,
    manualSync,
    clearQueue,
    getQueueStats,
    updateStatus,
    $reset
  }
})
