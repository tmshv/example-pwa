import { h, style } from '../lib/dom'
import { applyFill, type CardFill, type GradientType, type PastelToken } from '../lib/card-fill'

const CSS = `
  :host {
    display: block;
    position: relative;
    border: 1px solid var(--border);
    background: var(--grad-bg, var(--bg));
    padding: 12px 14px;
    margin-bottom: 12px;
    font-family: var(--font);
    color: var(--fg);
  }
  :host::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--pattern-ink);
    -webkit-mask: url("/patterns/pattern-plus.svg") repeat;
            mask: url("/patterns/pattern-plus.svg") repeat;
    -webkit-mask-size: 20px 20px;
            mask-size: 20px 20px;
    pointer-events: none;
  }
  .wrap { position: relative; z-index: 1; }
  h3 {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
    color: var(--fg);
  }
  ::slotted(.row)      { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
  ::slotted(.row.wrap) { flex-direction: column; gap: 4px; }
`

export class DiagnosticCard extends HTMLElement {
  static observedAttributes = ['title', 'data-gradient', 'data-from', 'data-to']
  private titleEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    this.titleEl = h('h3')
    shadow.append(
      style(CSS),
      h('div', { class: 'wrap' }, this.titleEl, h('slot')),
    )
  }

  connectedCallback() {
    this.syncTitle()
    this.syncFill()
  }

  attributeChangedCallback(name: string) {
    if (name === 'title') this.syncTitle()
    if (name.startsWith('data-')) this.syncFill()
  }

  private syncTitle() {
    const raw = (this.getAttribute('title') ?? '').toUpperCase()
    this.titleEl.textContent = raw ? `---- ${raw} ----` : ''
  }

  private syncFill() {
    const gradient = this.dataset.gradient as GradientType | undefined
    const from = this.dataset.from as PastelToken | undefined
    const to = this.dataset.to as PastelToken | undefined
    if (!gradient || !from || !to) return
    const fill: CardFill = { gradient, from, to }
    applyFill(this, fill)
  }
}

customElements.define('diagnostic-card', DiagnosticCard)
