/**
 * Environment configuration
 * Loads variables from import.meta.env (Vite)
 */

export interface AppConfig {
  apiUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
  isDevelopment: boolean
  isProduction: boolean
  appVersion: string
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key]

  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    console.warn(`Environment variable ${key} is not set`)
    return ''
  }

  return value
}

export const appConfig: AppConfig = {
  // API Configuration
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3000/api/v1'),

  // Supabase Configuration (optional)
  supabaseUrl: getEnvVar('VITE_SUPABASE_URL', ''),
  supabaseAnonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // App Version
  appVersion: import.meta.env.VITE_APP_VERSION || '0.1.0'
}

// Validate critical configuration
export function validateConfig(): void {
  const errors: string[] = []

  if (!appConfig.apiUrl) {
    errors.push('API URL is not configured (VITE_API_URL)')
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    if (appConfig.isProduction) {
      throw new Error('Critical configuration missing')
    }
  }
}

// Log configuration in development
if (appConfig.isDevelopment) {
  console.log('App Configuration:', {
    apiUrl: appConfig.apiUrl,
    environment: appConfig.isDevelopment ? 'development' : 'production',
    version: appConfig.appVersion
  })
}
