<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <h1>Barcode Tracker</h1>
          <p>Scan. Track. Manage.</p>
        </div>

        <form @submit.prevent="handleLogin">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input
              v-model="email"
              type="email"
              required
              autocomplete="email"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
            ></ion-input>
          </ion-item>

          <ion-button
            expand="block"
            type="submit"
            class="ion-margin-top"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </ion-button>
        </form>

        <div class="footer-text ion-text-center ion-margin-top">
          <p>Don't have an account? Contact your administrator.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const isLoading = computed(() => authStore.isLoading)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return
  }

  try {
    await authStore.signIn({
      email: email.value,
      password: password.value
    })

    // Navigate to scanner on success
    router.push('/scanner')
  } catch (error) {
    // Error is already shown by the store via toast
    console.error('Login failed:', error)
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 2rem;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.logo-section p {
  color: var(--ion-color-medium);
}

ion-item {
  margin-bottom: 1rem;
}

.footer-text {
  color: var(--ion-color-medium);
  font-size: 0.875rem;
}
</style>
