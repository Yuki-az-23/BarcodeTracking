import { toastController } from '@ionic/vue'
import { appConfig } from '../config/env'

export interface AppError {
  message: string
  code?: string
  details?: unknown
  timestamp: string
  userFriendly: boolean
}

class ErrorHandler {
  private errorLog: AppError[] = []
  private maxLogSize = 100

  /**
   * Handle any error in the application
   */
  async handle(error: unknown, context?: string): Promise<void> {
    const appError = this.normalizeError(error, context)

    // Log error
    this.logError(appError)

    // Show user-friendly message if applicable
    if (appError.userFriendly) {
      await this.showErrorToast(appError.message)
    }

    // Log to console in development
    if (appConfig.isDevelopment) {
      console.error(`[Error Handler] ${context || 'Unknown context'}:`, error)
    }

    // TODO: Send to error tracking service (Sentry, etc.) in production
    if (appConfig.isProduction) {
      this.sendToErrorTracking(appError, context)
    }
  }

  /**
   * Normalize different error types to AppError
   */
  private normalizeError(error: unknown, context?: string): AppError {
    const timestamp = new Date().toISOString()

    // Already an AppError
    if (this.isAppError(error)) {
      return error
    }

    // Standard Error
    if (error instanceof Error) {
      return {
        message: error.message,
        code: error.name,
        details: error.stack,
        timestamp,
        userFriendly: this.isUserFriendlyError(error.message)
      }
    }

    // String error
    if (typeof error === 'string') {
      return {
        message: error,
        timestamp,
        userFriendly: true
      }
    }

    // Object with message
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return {
        message: (error as any).message,
        code: (error as any).code,
        details: error,
        timestamp,
        userFriendly: true
      }
    }

    // Unknown error type
    return {
      message: 'An unexpected error occurred',
      details: error,
      timestamp,
      userFriendly: true
    }
  }

  /**
   * Check if error object is already an AppError
   */
  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'timestamp' in error &&
      'userFriendly' in error
    )
  }

  /**
   * Determine if error message is user-friendly
   */
  private isUserFriendlyError(message: string): boolean {
    const technicalPatterns = [
      /undefined/i,
      /null/i,
      /cannot read property/i,
      /is not a function/i,
      /unexpected token/i,
      /syntax error/i
    ]

    return !technicalPatterns.some((pattern) => pattern.test(message))
  }

  /**
   * Log error to internal log
   */
  private logError(error: AppError): void {
    this.errorLog.unshift(error)

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }
  }

  /**
   * Show error toast to user
   */
  private async showErrorToast(message: string): Promise<void> {
    const toast = await toastController.create({
      message,
      duration: 4000,
      color: 'danger',
      position: 'bottom',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    })

    await toast.present()
  }

  /**
   * Send error to tracking service
   */
  private sendToErrorTracking(error: AppError, context?: string): void {
    // Import dynamically to avoid circular dependencies
    import('../services/sentry.service').then(({ sentryService }) => {
      if (sentryService.isEnabled()) {
        sentryService.captureException(new Error(error.message), {
          context,
          code: error.code,
          details: error.details,
          timestamp: error.timestamp
        })
      }
    })
  }

  /**
   * Get recent errors (for debugging)
   */
  getRecentErrors(count = 10): AppError[] {
    return this.errorLog.slice(0, count)
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = []
  }

  /**
   * Create a user-friendly error
   */
  createError(message: string, code?: string, details?: unknown): AppError {
    return {
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      userFriendly: true
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

/**
 * Global error handler for Vue
 */
export function setupGlobalErrorHandler(app: any): void {
  app.config.errorHandler = (err: unknown, instance: any, info: string) => {
    errorHandler.handle(err, `Vue Error: ${info}`)
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(event.reason, 'Unhandled Promise Rejection')
    event.preventDefault()
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    errorHandler.handle(event.error || event.message, 'Global Error')
  })
}
