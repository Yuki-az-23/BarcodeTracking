import * as Sentry from '@sentry/capacitor'
import * as SentryVue from '@sentry/vue'
import { Router } from 'vue-router'
import { appConfig } from '../config/env'

export interface SentryConfig {
  dsn: string
  environment?: string
  release?: string
  tracesSampleRate?: number
  replaysSessionSampleRate?: number
  replaysOnErrorSampleRate?: number
}

class SentryService {
  private isInitialized = false

  /**
   * Initialize Sentry
   */
  initialize(app: any, router: Router, config?: Partial<SentryConfig>): void {
    const dsn = config?.dsn || import.meta.env.VITE_SENTRY_DSN

    if (!dsn) {
      console.warn('Sentry DSN not configured. Error tracking disabled.')
      return
    }

    if (this.isInitialized) {
      console.warn('Sentry already initialized')
      return
    }

    try {
      Sentry.init(
        {
          app,
          dsn,
          environment: config?.environment || appConfig.isDevelopment ? 'development' : 'production',
          release: config?.release || appConfig.appVersion,

          // Performance monitoring
          integrations: [
            new SentryVue.BrowserTracing({
              routingInstrumentation: SentryVue.vueRouterInstrumentation(router)
            }),
            new Sentry.Replay()
          ],

          // Sampling rates
          tracesSampleRate: config?.tracesSampleRate || 0.1, // 10% of transactions
          replaysSessionSampleRate: config?.replaysSessionSampleRate || 0.1, // 10% of sessions
          replaysOnErrorSampleRate: config?.replaysOnErrorSampleRate || 1.0, // 100% when error

          // Before sending
          beforeSend(event, hint) {
            // Don't send in development unless explicitly enabled
            if (appConfig.isDevelopment && !import.meta.env.VITE_SENTRY_ENABLED) {
              return null
            }

            // Filter out certain errors
            if (event.exception) {
              const errorMessage = hint.originalException?.toString() || ''

              // Ignore network errors in offline mode
              if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_NETWORK')) {
                return null
              }

              // Ignore aborted requests
              if (errorMessage.includes('canceled') || errorMessage.includes('aborted')) {
                return null
              }
            }

            return event
          },

          // Ignore certain errors
          ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            // Random plugins/extensions
            'originalCreateNotification',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',
            // Facebook errors
            'fb_xd_fragment',
            // Network errors (handled separately)
            'NetworkError',
            'Failed to fetch'
          ]
        },
        SentryVue.init
      )

      this.isInitialized = true
      console.log('Sentry initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Sentry:', error)
    }
  }

  /**
   * Manually capture exception
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) return

    Sentry.captureException(error, {
      extra: context
    })
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.isInitialized) return

    Sentry.captureMessage(message, level)
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (!this.isInitialized) return

    Sentry.setUser(user)
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: Record<string, any>): void {
    if (!this.isInitialized) return

    Sentry.setContext(name, context)
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    message: string
    category?: string
    level?: Sentry.SeverityLevel
    data?: Record<string, any>
  }): void {
    if (!this.isInitialized) return

    Sentry.addBreadcrumb(breadcrumb)
  }

  /**
   * Start a transaction for performance monitoring
   */
  startTransaction(name: string, op: string): Sentry.Transaction | null {
    if (!this.isInitialized) return null

    return Sentry.startTransaction({ name, op })
  }

  /**
   * Check if Sentry is initialized
   */
  isEnabled(): boolean {
    return this.isInitialized
  }
}

// Export singleton instance
export const sentryService = new SentryService()
