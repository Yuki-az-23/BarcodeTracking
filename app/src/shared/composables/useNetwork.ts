import { ref, onMounted, onUnmounted } from 'vue'
import { Network } from '@capacitor/network'

export function useNetwork() {
  const isOnline = ref(true)
  const connectionType = ref<string>('unknown')
  let networkListener: any = null

  const checkStatus = async () => {
    const status = await Network.getStatus()
    isOnline.value = status.connected
    connectionType.value = status.connectionType
  }

  const setupListener = async () => {
    networkListener = await Network.addListener('networkStatusChange', (status) => {
      isOnline.value = status.connected
      connectionType.value = status.connectionType

      // Log network changes in development
      if (import.meta.env.DEV) {
        console.log(
          `Network status changed: ${status.connected ? 'Online' : 'Offline'} (${
            status.connectionType
          })`
        )
      }
    })
  }

  onMounted(async () => {
    await checkStatus()
    await setupListener()
  })

  onUnmounted(() => {
    if (networkListener) {
      networkListener.remove()
    }
  })

  return {
    isOnline,
    connectionType,
    checkStatus
  }
}
