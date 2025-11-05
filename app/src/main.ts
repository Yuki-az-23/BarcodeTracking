import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'
import { validateConfig } from './shared/config/env'
import { setupGlobalErrorHandler } from './shared/utils/error-handler'

// Ionic CSS
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

// Optional CSS utils
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

// Validate configuration before app starts
validateConfig()

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(router)

// Setup global error handler
setupGlobalErrorHandler(app)

router.isReady().then(() => {
  app.mount('#app')
})
