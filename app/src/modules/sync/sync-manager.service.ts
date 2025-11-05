import { Network } from '@capacitor/network'
import { apiService } from '@/shared/services/api.service'
import { syncQueue, QueueItem } from './sync-queue.service'
import type { ProcessedScan } from '@/modules/scanner/scanner.service'

export interface SyncConfig {
  maxAttempts?: number
  baseBackoffMs?: number
  maxBackoffMs?: number
  autoSync?: boolean
}

export interface SyncStatus {
  isSyncing: boolean
  queueSize: number
  lastSyncTime: number | null
  lastSyncSuccess: boolean
  error: string | null
}

export type SyncEventType = 'start' | 'progress' | 'complete' | 'error' | 'queue-change'

export interface SyncEvent {
  type: SyncEventType
  data?: unknown
}

export class SyncManager {
  private config: SyncConfig
  private isSyncing = false
  private listeners: Array<(event: SyncEvent) => void> = []
  private networkListener: any = null
  private syncInterval: number | null = null
  private lastSyncTime: number | null = null
  private lastSyncSuccess = true
  private lastError: string | null = null

  constructor(config: SyncConfig = {}) {
    this.config = {
      maxAttempts: config.maxAttempts || 5,
      baseBackoffMs: config.baseBackoffMs || 1000,
      maxBackoffMs: config.maxBackoffMs || 60000,
      autoSync: config.autoSync !== false // Default true
    }
  }

  /**
   * Initialize sync manager
   */
  async initialize(): Promise<void> {
    if (this.config.autoSync) {
      await this.setupNetworkListener()
      await this.setupPeriodicSync()
    }

    // Try initial sync if online
    const networkStatus = await Network.getStatus()
    if (networkStatus.connected) {
      this.sync() // Don't await - let it run in background
    }
  }

  /**
   * Add scan to sync queue
   */
  async queueScan(scan: ProcessedScan): Promise<string> {
    const id = await syncQueue.enqueue(scan)
    this.emitEvent({ type: 'queue-change' })

    // Try immediate sync if online
    const networkStatus = await Network.getStatus()
    if (networkStatus.connected && !this.isSyncing) {
      this.sync() // Don't await
    }

    return id
  }

  /**
   * Manually trigger sync
   */
  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress')
      return
    }

    // Check network connectivity
    const networkStatus = await Network.getStatus()
    if (!networkStatus.connected) {
      console.log('Cannot sync - no network connection')
      return
    }

    this.isSyncing = true
    this.emitEvent({ type: 'start' })

    try {
      await this.processPendingItems()
      this.lastSyncTime = Date.now()
      this.lastSyncSuccess = true
      this.lastError = null
      this.emitEvent({ type: 'complete' })
    } catch (error) {
      this.lastSyncSuccess = false
      this.lastError = error instanceof Error ? error.message : 'Unknown error'
      this.emitEvent({ type: 'error', data: this.lastError })
      console.error('Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Process pending items in queue
   */
  private async processPendingItems(): Promise<void> {
    const maxAttempts = this.config.maxAttempts!

    // Get items ready for retry
    const backoff = this.calculateBackoff(1) // Use minimum backoff
    const items = await syncQueue.getReadyForRetry(backoff)

    if (items.length === 0) {
      return
    }

    console.log(`Syncing ${items.length} items...`)

    let successCount = 0
    let failCount = 0

    for (const item of items) {
      try {
        // Calculate backoff for this item based on attempts
        const itemBackoff = this.calculateBackoff(item.attempts)
        const timeSinceLastAttempt = item.lastAttempt
          ? Date.now() - item.lastAttempt
          : Infinity

        // Skip if not enough time has passed
        if (timeSinceLastAttempt < itemBackoff) {
          continue
        }

        // Try to sync
        await apiService.createScan(item.scan)

        // Success - remove from queue
        await syncQueue.remove(item.id)
        successCount++

        this.emitEvent({
          type: 'progress',
          data: { successCount, failCount, total: items.length }
        })
      } catch (error) {
        failCount++

        // Mark as attempted
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await syncQueue.markAttempted(item.id, errorMessage)

        // Remove if max attempts reached
        if (item.attempts + 1 >= maxAttempts) {
          console.warn(
            `Item ${item.id} failed ${maxAttempts} times, removing from queue`,
            error
          )
          await syncQueue.remove(item.id)
        }

        this.emitEvent({
          type: 'progress',
          data: { successCount, failCount, total: items.length }
        })
      }
    }

    console.log(`Sync complete: ${successCount} success, ${failCount} failed`)

    // Update queue change event
    this.emitEvent({ type: 'queue-change' })
  }

  /**
   * Calculate exponential backoff
   */
  private calculateBackoff(attempts: number): number {
    const backoff = Math.min(
      this.config.baseBackoffMs! * Math.pow(2, attempts),
      this.config.maxBackoffMs!
    )
    // Add jitter to prevent thundering herd
    const jitter = backoff * 0.1 * Math.random()
    return Math.floor(backoff + jitter)
  }

  /**
   * Setup network listener for auto-sync
   */
  private async setupNetworkListener(): Promise<void> {
    this.networkListener = await Network.addListener('networkStatusChange', (status) => {
      if (status.connected && !this.isSyncing) {
        console.log('Network connected, triggering sync...')
        this.sync()
      }
    })
  }

  /**
   * Setup periodic sync (every 5 minutes)
   */
  private async setupPeriodicSync(): Promise<void> {
    this.syncInterval = window.setInterval(
      () => {
        const networkStatus = Network.getStatus()
        networkStatus.then((status) => {
          if (status.connected && !this.isSyncing) {
            this.sync()
          }
        })
      },
      5 * 60 * 1000
    ) // 5 minutes
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const queueSize = await syncQueue.getSize()

    return {
      isSyncing: this.isSyncing,
      queueSize,
      lastSyncTime: this.lastSyncTime,
      lastSyncSuccess: this.lastSyncSuccess,
      error: this.lastError
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return await syncQueue.getStats()
  }

  /**
   * Clear sync queue
   */
  async clearQueue(): Promise<void> {
    await syncQueue.clear()
    this.emitEvent({ type: 'queue-change' })
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: SyncEvent) => void): void {
    this.listeners.push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: SyncEvent) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in sync event listener:', error)
      }
    })
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    if (this.networkListener) {
      this.networkListener.remove()
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.listeners = []
  }
}

// Export singleton instance
export const syncManager = new SyncManager()
