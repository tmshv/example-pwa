import { registerSW } from 'virtual:pwa-register'

export type SwState = 'idle' | 'update-available' | 'offline-ready'

export type SwControl = {
  reload: () => Promise<void>
  checkForUpdate: () => Promise<boolean>
}

export function initSW(onState: (s: SwState) => void): SwControl {
  let registration: ServiceWorkerRegistration | undefined

  const updateSW = registerSW({
    onNeedRefresh()  { onState('update-available') },
    onOfflineReady() { onState('offline-ready') },
    onRegisterError(error) { console.error('SW registration failed:', error) },
    onRegisteredSW(_swUrl, reg) { registration = reg },
  })

  return {
    reload: () => updateSW(true),
    async checkForUpdate() {
      if (!registration) return false
      try {
        await registration.update()
        return true
      } catch (err) {
        console.error('SW update check failed:', err)
        return false
      }
    },
  }
}
