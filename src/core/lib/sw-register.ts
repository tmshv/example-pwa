import { registerSW } from "virtual:pwa-register"

export type SwState = "idle" | "update-available" | "offline-ready"

export type SwControl = {
    reload: () => Promise<void>
    checkForUpdate: () => Promise<boolean>
}

export function initSW(onState: (s: SwState) => void): SwControl {
    let registration: ServiceWorkerRegistration | undefined

    const updateSW = registerSW({
        onNeedRefresh() {
            onState("update-available")
        },
        onOfflineReady() {
            onState("offline-ready")
        },
        onRegisteredSW(_swUrl, reg) {
            registration = reg
        },
    })

    return {
        async reload() {
            if (registration?.waiting) {
                const controllerChanged = new Promise<void>(resolve => {
                    navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })
                })
                await updateSW(false)
                await controllerChanged
            }
            window.location.reload()
        },
        async checkForUpdate() {
            if (!registration) return false
            try {
                await registration.update()
                return true
            } catch {
                return false
            }
        },
    }
}
