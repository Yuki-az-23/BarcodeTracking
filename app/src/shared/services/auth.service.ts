import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'
import { appConfig } from '../config/env'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData extends LoginCredentials {
  name?: string
}

class AuthService {
  private supabase: SupabaseClient | null = null
  private currentUser: AuthUser | null = null
  private currentSession: Session | null = null

  constructor() {
    this.initialize()
  }

  /**
   * Initialize Supabase client
   */
  private initialize(): void {
    if (!appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
      console.warn('Supabase not configured. Auth will not work.')
      return
    }

    this.supabase = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })

    // Load existing session
    this.loadSession()

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)
      this.currentSession = session
      this.currentUser = session ? this.mapUser(session.user) : null
    })
  }

  /**
   * Load existing session from storage
   */
  private async loadSession(): Promise<void> {
    if (!this.supabase) return

    const { data } = await this.supabase.auth.getSession()
    if (data.session) {
      this.currentSession = data.session
      this.currentUser = this.mapUser(data.session.user)
    }
  }

  /**
   * Map Supabase user to AuthUser
   */
  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name,
      role: user.user_metadata?.role || 'user'
    }
  }

  /**
   * Sign up new user
   */
  async signUp(data: SignUpData): Promise<AuthUser> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data: authData, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!authData.user) {
      throw new Error('Sign up failed')
    }

    this.currentUser = this.mapUser(authData.user)
    return this.currentUser
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthUser> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Sign in failed')
    }

    this.currentSession = data.session
    this.currentUser = this.mapUser(data.user)
    return this.currentUser
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.supabase) return

    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }

    this.currentUser = null
    this.currentSession = null
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.currentUser
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.currentSession
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.currentSession?.access_token || null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<Session | null> {
    if (!this.supabase) return null

    const { data, error } = await this.supabase.auth.refreshSession()
    if (error) {
      console.error('Failed to refresh session:', error)
      return null
    }

    this.currentSession = data.session
    return data.session
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Update user metadata
   */
  async updateProfile(data: { name?: string }): Promise<AuthUser> {
    if (!this.supabase) {
      throw new Error('Supabase not configured')
    }

    const { data: userData, error } = await this.supabase.auth.updateUser({
      data
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!userData.user) {
      throw new Error('Update failed')
    }

    this.currentUser = this.mapUser(userData.user)
    return this.currentUser
  }
}

// Export singleton instance
export const authService = new AuthService()
