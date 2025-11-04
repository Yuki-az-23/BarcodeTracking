import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, AuthUser, LoginCredentials, SignUpData } from '@/shared/services/auth.service'
import { apiService } from '@/shared/services/api.service'
import { useToast } from '@/shared/composables/useToast'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const { showSuccessToast, showErrorToast } = useToast()

  // Computed
  const isAuthenticated = computed(() => user.value !== null)
  const userId = computed(() => user.value?.id || null)
  const userEmail = computed(() => user.value?.email || null)
  const userName = computed(() => user.value?.name || 'User')
  const userRole = computed(() => user.value?.role || 'user')

  // Actions
  async function initialize() {
    if (isInitialized.value) return

    try {
      // Load existing session
      const currentUser = authService.getUser()
      if (currentUser) {
        user.value = currentUser

        // Set token in API service
        const token = authService.getAccessToken()
        if (token) {
          apiService.setToken(token)
        }
      }

      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    }
  }

  async function signUp(data: SignUpData) {
    isLoading.value = true

    try {
      const authUser = await authService.signUp(data)
      user.value = authUser

      // Set token in API service
      const token = authService.getAccessToken()
      if (token) {
        apiService.setToken(token)
      }

      showSuccessToast('Account created successfully!')
      return authUser
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Sign up failed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function signIn(credentials: LoginCredentials) {
    isLoading.value = true

    try {
      const authUser = await authService.signIn(credentials)
      user.value = authUser

      // Set token in API service
      const token = authService.getAccessToken()
      if (token) {
        apiService.setToken(token)
      }

      showSuccessToast('Signed in successfully!')
      return authUser
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Sign in failed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function signOut() {
    isLoading.value = true

    try {
      await authService.signOut()
      user.value = null

      // Clear token from API service
      apiService.clearToken()

      showSuccessToast('Signed out successfully')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Sign out failed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(email: string) {
    isLoading.value = true

    try {
      await authService.resetPassword(email)
      showSuccessToast('Password reset email sent!')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Password reset failed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(newPassword: string) {
    isLoading.value = true

    try {
      await authService.updatePassword(newPassword)
      showSuccessToast('Password updated successfully!')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Password update failed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: { name?: string }) {
    isLoading.value = true

    try {
      const authUser = await authService.updateProfile(data)
      user.value = authUser
      showSuccessToast('Profile updated successfully!')
      return authUser
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Profile update failed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function refreshSession() {
    try {
      const session = await authService.refreshSession()
      if (session) {
        const currentUser = authService.getUser()
        user.value = currentUser

        // Update token in API service
        apiService.setToken(session.access_token)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }

  function $reset() {
    user.value = null
    isLoading.value = false
    isInitialized.value = false
  }

  return {
    // State
    user,
    isLoading,
    isInitialized,

    // Computed
    isAuthenticated,
    userId,
    userEmail,
    userName,
    userRole,

    // Actions
    initialize,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    $reset
  }
})
