import { registerSW } from 'virtual:pwa-register'

export type SwState = 'idle' | 'update-available' | 'offline-ready'

export function initSW(onState: (s: SwState) => void) {
  const updateSW = registerSW({
    onNeedRefresh()  { onState('update-available') },
    onOfflineReady() { onState('offline-ready') },
    onRegisterError(error) { console.error('SW registration failed:', error) },
  })
  return () => updateSW(true)
}
