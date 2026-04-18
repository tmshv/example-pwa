const POLL_INTERVAL = 30_000

type VersionPayload = { version?: string }

export function initVersionCheck(onUpdateAvailable: () => void): { check: () => Promise<void> } {
  const current = __SW_VERSION__
  let notified = false

  const check = async () => {
    if (notified) return
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}version.json`, {
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = (await res.json()) as VersionPayload
      if (data.version && data.version !== current) {
        notified = true
        onUpdateAvailable()
      }
    } catch (err) {
      console.error('Version check failed:', err)
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
  setInterval(check, POLL_INTERVAL)
  check()

  return { check }
}
