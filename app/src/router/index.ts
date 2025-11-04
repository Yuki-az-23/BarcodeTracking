import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/scanner'
  },
  {
    path: '/scanner',
    name: 'Scanner',
    component: () => import('@/modules/scanner/ScannerView.vue')
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

export default router
