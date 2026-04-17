import { h, style } from '../lib/dom'
import { Diagnostics, type DiagnosticsSnapshot } from '../lib/diagnostics'
import type { CardFill } from '../lib/card-fill'

let sharedDiagnostics: Diagnostics | null = null
export function getDiagnostics(): Diagnostics {
  if (!sharedDiagnostics) sharedDiagnostics = new Diagnostics()
  return sharedDiagnostics
}

const FILLS: Record<string, CardFill> = {
  'Safe area insets': { gradient: 'linear-45',       from: 'sky',    to: 'mint'   },
  'Viewport':         { gradient: 'linear-vertical', from: 'peach',  to: 'butter' },
  'Display mode':     { gradient: 'radial-tl',       from: 'lilac',  to: 'blush'  },
  'Network and SW':   { gradient: 'linear-135',      from: 'mint',   to: 'sky'    },
  'Scroll':           { gradient: 'radial-br',       from: 'butter', to: 'peach'  },
  'Platform':         { gradient: 'radial-center',   from: 'blush',  to: 'lilac'  },
}

const K_STYLE = 'color: var(--muted);'
const V_STYLE = 'color: var(--fg); font-variant-numeric: tabular-nums;'
const V_SMALL_STYLE = 'color: var(--fg); font-size: 11px; word-break: break-all;'

function row(label: string, value: string): HTMLElement {
  return h('div', { class: 'row' },
    h('span', { class: 'k', style: K_STYLE }, label),
    h('span', { class: 'v', style: V_STYLE }, value),
  )
}

function card(title: string, ...rows: HTMLElement[]): HTMLElement {
  const fill = FILLS[title]
  return h('diagnostic-card', {
    title,
    'data-gradient': fill.gradient,
    'data-from':     fill.from,
    'data-to':       fill.to,
  }, ...rows)
}

function build(snap: DiagnosticsSnapshot): DocumentFragment {
  const frag = document.createDocumentFragment()

  frag.append(
    card('Safe area insets',
      row('top',    snap.insets.top    + 'px'),
      row('right',  snap.insets.right  + 'px'),
      row('bottom', snap.insets.bottom + 'px'),
      row('left',   snap.insets.left   + 'px'),
    ),
    card('Viewport',
      row('innerWidth x innerHeight', snap.innerWidth + ' x ' + snap.innerHeight),
      row('visualViewport.height',    snap.visualHeight + 'px'),
      row('100dvh (measured)',        snap.dvh + 'px'),
      row('devicePixelRatio',         String(snap.dpr)),
    ),
    card('Display mode',
      row('standalone',   String(snap.standalone)),
      row('color scheme', snap.colorScheme),
    ),
    card('Network and SW',
      row('online',    String(snap.online)),
      row('swState',   snap.swState),
      row('swVersion', snap.swVersion),
    ),
    card('Scroll',
      row('scrollTop', snap.scrollTop + 'px'),
      row('scrollMax', snap.scrollMax + 'px'),
    ),
  )

  const platform = card('Platform', row('platform', snap.platform))
  platform.append(
    h('div', { class: 'row wrap' },
      h('span', { class: 'k', style: K_STYLE }, 'ua'),
      h('span', { class: 'v small', style: V_SMALL_STYLE }, snap.ua),
    ),
  )
  frag.append(platform)

  return frag
}

const CSS = `:host { display: block; font-family: var(--font); }`

class DiagnosticsView extends HTMLElement {
  private container: HTMLElement
  private unsubscribe?: () => void

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    this.container = h('div')
    shadow.append(style(CSS), this.container)
  }

  connectedCallback() {
    const diag = getDiagnostics()
    this.unsubscribe = diag.subscribe((snap) => {
      this.container.replaceChildren(build(snap))
    })
  }

  disconnectedCallback() {
    this.unsubscribe?.()
  }
}

customElements.define('diagnostics-view', DiagnosticsView)
