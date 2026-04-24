import type { SwState } from '../../core/lib/sw-register'

export interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface DiagnosticsSnapshot {
  insets: Insets
  innerHeight: number
  innerWidth: number
  visualHeight: number
  dvh: number
  dpr: number
  standalone: boolean
  online: boolean
  colorScheme: 'light' | 'dark'
  swState: SwState
  swVersion: string
  scrollTop: number
  scrollMax: number
  ua: string
  platform: string
}

export function readInsetsFromProbe(probe: HTMLElement): Insets {
  const cs = getComputedStyle(probe)
  return {
    top:    Math.round(parseFloat(cs.paddingTop)    || 0),
    right:  Math.round(parseFloat(cs.paddingRight)  || 0),
    bottom: Math.round(parseFloat(cs.paddingBottom) || 0),
    left:   Math.round(parseFloat(cs.paddingLeft)   || 0),
  }
}

export function computeColorScheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type Listener = (snap: DiagnosticsSnapshot) => void

export class Diagnostics {
  private insetProbe: HTMLElement
  private dvhProbe: HTMLElement
  private listeners = new Set<Listener>()
  private rafPending = false
  private swState: DiagnosticsSnapshot['swState'] = 'idle'
  private contentEl: HTMLElement | null = null

  constructor() {
    this.insetProbe = document.createElement('div')
    this.insetProbe.style.cssText = `
      position: fixed; top: 0; left: 0; width: 0; height: 0;
      pointer-events: none; visibility: hidden;
      padding-top: env(safe-area-inset-top);
      padding-right: env(safe-area-inset-right);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
    `
    document.body.appendChild(this.insetProbe)

    this.dvhProbe = document.createElement('div')
    this.dvhProbe.style.cssText = `
      position: fixed; top: 0; left: 0; width: 0; height: 100dvh;
      pointer-events: none; visibility: hidden;
    `
    document.body.appendChild(this.dvhProbe)

    const schedule = () => this.schedule()
    window.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    window.addEventListener('online', schedule)
    window.addEventListener('offline', schedule)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', schedule)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', schedule)
  }

  setContent(el: HTMLElement) {
    this.contentEl = el
    el.addEventListener('scroll', () => this.schedule(), { passive: true })
  }

  setSwState(state: DiagnosticsSnapshot['swState']) {
    this.swState = state
    this.schedule()
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    fn(this.getSnapshot())
    return () => { this.listeners.delete(fn) }
  }

  getSnapshot(): DiagnosticsSnapshot {
    const content = this.contentEl
    const scrollTop = content?.scrollTop ?? 0
    const scrollMax = content ? Math.max(0, content.scrollHeight - content.clientHeight) : 0
    const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
    return {
      insets:       readInsetsFromProbe(this.insetProbe),
      innerHeight:  window.innerHeight,
      innerWidth:   window.innerWidth,
      visualHeight: window.visualViewport?.height ?? window.innerHeight,
      dvh:          Math.round(this.dvhProbe.getBoundingClientRect().height),
      dpr:          window.devicePixelRatio,
      standalone:   window.matchMedia('(display-mode: standalone)').matches,
      online:       navigator.onLine,
      colorScheme:  computeColorScheme(),
      swState:      this.swState,
      swVersion:    __SW_VERSION__,
      scrollTop,
      scrollMax,
      ua:           navigator.userAgent,
      platform:     uaData?.platform ?? 'unknown',
    }
  }

  private schedule() {
    if (this.rafPending) return
    this.rafPending = true
    requestAnimationFrame(() => {
      this.rafPending = false
      const snap = this.getSnapshot()
      this.listeners.forEach((fn) => fn(snap))
    })
  }
}
