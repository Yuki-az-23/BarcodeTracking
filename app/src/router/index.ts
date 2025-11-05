import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { authGuard } from './guards/auth.guard'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/scanner'
  },
  {
    path: '/scanner',
    name: 'Scanner',
    component: () => import('@/modules/scanner/ScannerView.vue'),
    meta: { requiresAuth: false } // Set to true to require authentication
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/LoginView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Add auth guard
router.beforeEach(authGuard)

export default router
