import { toastController } from '@ionic/vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export function useToast() {
  async function showToast(
    message: string,
    type: ToastType = 'info',
    duration = 3000
  ): Promise<void> {
    const color = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'primary'
    }[type]

    const toast = await toastController.create({
      message,
      duration,
      color,
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

  async function showSuccessToast(message: string): Promise<void> {
    await showToast(message, 'success')
  }

  async function showErrorToast(message: string): Promise<void> {
    await showToast(message, 'error', 5000)
  }

  async function showWarningToast(message: string): Promise<void> {
    await showToast(message, 'warning')
  }

  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast
  }
}
