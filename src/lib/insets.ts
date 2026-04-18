const STORAGE_KEY = 'insets-v1'

type Snap = { t: number; r: number; b: number; l: number; h: number }
type Cache = Partial<Record<'p' | 'l', Snap>>

const readCache = (): Cache => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

const writeCache = (c: Cache): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)) } catch {}
}

const orient = (): 'p' | 'l' =>
  window.matchMedia('(orientation: portrait)').matches ? 'p' : 'l'

export function initInsets(): void {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;visibility:hidden;' +
    'padding-top:env(safe-area-inset-top);' +
    'padding-right:env(safe-area-inset-right);' +
    'padding-bottom:env(safe-area-inset-bottom);' +
    'padding-left:env(safe-area-inset-left);'
  document.body.appendChild(probe)

  const root = document.documentElement.style

  const sync = () => {
    const cs = getComputedStyle(probe)
    const t = Math.round(parseFloat(cs.paddingTop)    || 0)
    const r = Math.round(parseFloat(cs.paddingRight)  || 0)
    const b = Math.round(parseFloat(cs.paddingBottom) || 0)
    const l = Math.round(parseFloat(cs.paddingLeft)   || 0)
    const h = Math.round(window.visualViewport?.height ?? window.innerHeight)

    const o = orient()
    const cache = readCache()
    const prev = cache[o] ?? { t: 0, r: 0, b: 0, l: 0, h: 0 }

    // Never decrease insets within an orientation — protects against
    // iOS reload transient where env() returns 0 for a few frames.
    const next: Snap = {
      t: Math.max(t, prev.t),
      r: Math.max(r, prev.r),
      b: Math.max(b, prev.b),
      l: Math.max(l, prev.l),
      h: h > 0 ? h : prev.h,
    }

    root.setProperty('--sai-top',    next.t + 'px')
    root.setProperty('--sai-right',  next.r + 'px')
    root.setProperty('--sai-bottom', next.b + 'px')
    root.setProperty('--sai-left',   next.l + 'px')
    if (next.h > 0) root.setProperty('--app-h', next.h + 'px')

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const hasInsets = t > 0 || r > 0 || b > 0 || l > 0
    if ((hasInsets || isStandalone) && h > 0) {
      cache[o] = next
      writeCache(cache)
    }
  }

  sync()
  window.addEventListener('resize', sync, { passive: true })
  window.visualViewport?.addEventListener('resize', sync)
}
