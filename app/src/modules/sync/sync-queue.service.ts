import { Preferences } from '@capacitor/preferences'
import type { ProcessedScan } from '@/modules/scanner/scanner.service'

export interface QueueItem {
  id: string
  scan: ProcessedScan
  attempts: number
  lastAttempt: number | null
  createdAt: number
  error?: string
}

const QUEUE_KEY = 'sync_queue'
const MAX_QUEUE_SIZE = 1000

export class SyncQueueService {
  /**
   * Add scan to queue
   */
  async enqueue(scan: ProcessedScan): Promise<string> {
    const queue = await this.getQueue()

    // Check queue size limit
    if (queue.length >= MAX_QUEUE_SIZE) {
      throw new Error('Sync queue is full')
    }

    const item: QueueItem = {
      id: this.generateId(),
      scan,
      attempts: 0,
      lastAttempt: null,
      createdAt: Date.now()
    }

    queue.push(item)
    await this.saveQueue(queue)

    return item.id
  }

  /**
   * Get all pending items
   */
  async getPending(): Promise<QueueItem[]> {
    return await this.getQueue()
  }

  /**
   * Get items ready for retry (not recently attempted)
   */
  async getReadyForRetry(backoffMs: number): Promise<QueueItem[]> {
    const queue = await this.getQueue()
    const now = Date.now()

    return queue.filter((item) => {
      if (item.lastAttempt === null) {
        return true // Never attempted
      }
      // Ready if enough time has passed since last attempt
      return now - item.lastAttempt >= backoffMs
    })
  }

  /**
   * Mark item as attempted
   */
  async markAttempted(id: string, error?: string): Promise<void> {
    const queue = await this.getQueue()
    const item = queue.find((i) => i.id === id)

    if (item) {
      item.attempts++
      item.lastAttempt = Date.now()
      if (error) {
        item.error = error
      }
      await this.saveQueue(queue)
    }
  }

  /**
   * Remove item from queue (successfully synced)
   */
  async remove(id: string): Promise<void> {
    let queue = await this.getQueue()
    queue = queue.filter((item) => item.id !== id)
    await this.saveQueue(queue)
  }

  /**
   * Remove multiple items
   */
  async removeBatch(ids: string[]): Promise<void> {
    let queue = await this.getQueue()
    queue = queue.filter((item) => !ids.includes(item.id))
    await this.saveQueue(queue)
  }

  /**
   * Clear entire queue
   */
  async clear(): Promise<void> {
    await this.saveQueue([])
  }

  /**
   * Get queue size
   */
  async getSize(): Promise<number> {
    const queue = await this.getQueue()
    return queue.length
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number
    neverAttempted: number
    failedOnce: number
    failedMultiple: number
    oldestItem: number | null
  }> {
    const queue = await this.getQueue()

    const stats = {
      total: queue.length,
      neverAttempted: 0,
      failedOnce: 0,
      failedMultiple: 0,
      oldestItem: null as number | null
    }

    if (queue.length === 0) {
      return stats
    }

    stats.oldestItem = Math.min(...queue.map((item) => item.createdAt))

    queue.forEach((item) => {
      if (item.attempts === 0) {
        stats.neverAttempted++
      } else if (item.attempts === 1) {
        stats.failedOnce++
      } else {
        stats.failedMultiple++
      }
    })

    return stats
  }

  /**
   * Get items that have failed too many times
   */
  async getFailedItems(maxAttempts: number): Promise<QueueItem[]> {
    const queue = await this.getQueue()
    return queue.filter((item) => item.attempts >= maxAttempts)
  }

  /**
   * Remove items that have failed too many times
   */
  async removeFailedItems(maxAttempts: number): Promise<number> {
    const queue = await this.getQueue()
    const failedIds = queue
      .filter((item) => item.attempts >= maxAttempts)
      .map((item) => item.id)

    await this.removeBatch(failedIds)
    return failedIds.length
  }

  /**
   * Get queue from storage
   */
  private async getQueue(): Promise<QueueItem[]> {
    try {
      const result = await Preferences.get({ key: QUEUE_KEY })
      if (!result.value) {
        return []
      }
      return JSON.parse(result.value)
    } catch (error) {
      console.error('Error reading sync queue:', error)
      return []
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueueItem[]): Promise<void> {
    try {
      await Preferences.set({
        key: QUEUE_KEY,
        value: JSON.stringify(queue)
      })
    } catch (error) {
      console.error('Error saving sync queue:', error)
      throw new Error('Failed to save sync queue')
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}

// Export singleton instance
export const syncQueue = new SyncQueueService()
