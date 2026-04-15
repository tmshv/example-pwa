import { h, style } from '../lib/dom'
import { Diagnostics, type DiagnosticsSnapshot } from '../lib/diagnostics'

let sharedDiagnostics: Diagnostics | null = null
export function getDiagnostics(): Diagnostics {
  if (!sharedDiagnostics) sharedDiagnostics = new Diagnostics()
  return sharedDiagnostics
}

function row(label: string, value: string): HTMLElement {
  return h('div', { class: 'row' },
    h('span', { class: 'k' }, label),
    h('span', { class: 'v' }, value),
  )
}

function section(title: string, ...rows: HTMLElement[]): HTMLElement {
  return h('section', {},
    h('h3', {}, title),
    ...rows,
  )
}

function build(snap: DiagnosticsSnapshot): DocumentFragment {
  const frag = document.createDocumentFragment()

  frag.append(
    section('Safe area insets',
      row('top',    snap.insets.top    + 'px'),
      row('right',  snap.insets.right  + 'px'),
      row('bottom', snap.insets.bottom + 'px'),
      row('left',   snap.insets.left   + 'px'),
    ),
    section('Viewport',
      row('innerWidth × innerHeight', snap.innerWidth + ' × ' + snap.innerHeight),
      row('visualViewport.height',    snap.visualHeight + 'px'),
      row('100dvh (measured)',        snap.dvh + 'px'),
      row('devicePixelRatio',         String(snap.dpr)),
    ),
    section('Display mode',
      row('standalone',   String(snap.standalone)),
      row('color scheme', snap.colorScheme),
    ),
    section('Network and SW',
      row('online',    String(snap.online)),
      row('swState',   snap.swState),
      row('swVersion', snap.swVersion),
    ),
    section('Scroll',
      row('scrollTop', snap.scrollTop + 'px'),
      row('scrollMax', snap.scrollMax + 'px'),
    ),
  )

  const platform = section('Platform',
    row('platform', snap.platform),
  )
  platform.append(
    h('div', { class: 'row wrap' },
      h('span', { class: 'k' }, 'ua'),
      h('span', { class: 'v small' }, snap.ua),
    ),
  )
  frag.append(platform)

  return frag
}

const CSS = `
  :host { display: block; padding: 12px 12px 32px; }
  section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
    margin-bottom: 12px;
  }
  h3 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
  .row.wrap { flex-direction: column; gap: 4px; }
  .k { color: var(--muted); }
  .v { font-variant-numeric: tabular-nums; }
  .v.small { font-size: 11px; word-break: break-all; color: var(--muted); }
`

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
