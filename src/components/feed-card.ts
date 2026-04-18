import { h, style } from '../lib/dom'
import { applyFill, type Fill, type PastelToken } from '../lib/card-fill'

const BASE = import.meta.env.BASE_URL

const CSS = `
  :host {
    display: block;
    position: relative;
    border: 1px solid var(--border);
    background: var(--grad-bg, var(--bg));
    padding: 14px 16px;
    margin-bottom: 12px;
    font-family: var(--font);
    color: var(--fg);
  }
  :host([data-border="dashed"]) { border-style: dashed; }
  :host([data-pattern="slashes"])::before,
  :host([data-pattern="both"])::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--pattern-ink);
    -webkit-mask: url("${BASE}patterns/pattern-slashes.svg") no-repeat top left;
            mask: url("${BASE}patterns/pattern-slashes.svg") no-repeat top left;
    -webkit-mask-size: auto;
            mask-size: auto;
    pointer-events: none;
  }
  :host([data-pattern="plus"])::after,
  :host([data-pattern="both"])::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--pattern-ink);
    -webkit-mask: url("${BASE}patterns/pattern-plus.svg") no-repeat top left;
            mask: url("${BASE}patterns/pattern-plus.svg") no-repeat top left;
    -webkit-mask-size: auto;
            mask-size: auto;
    pointer-events: none;
  }
  :host([data-pattern="cross"])::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("${BASE}patterns/pattern-cross.svg") no-repeat center / 100% 100%;
    pointer-events: none;
  }
  .content { position: relative; z-index: 1; }
  h2 { font-size: 14px; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.02em; }
  p  { font-size: 13px; line-height: 1.45; color: var(--fg); }
`

export class FeedCard extends HTMLElement {
  static observedAttributes = ['title', 'body', 'height', 'data-from', 'data-to', 'data-angle']
  private titleEl: HTMLElement
  private bodyEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    this.titleEl = h('h2')
    this.bodyEl = h('p')
    shadow.append(style(CSS), h('div', { class: 'content' }, this.titleEl, this.bodyEl))
  }

  connectedCallback() {
    this.syncFill()
    this.titleEl.textContent = this.getAttribute('title') ?? ''
    this.bodyEl.textContent = this.getAttribute('body') ?? ''
    const height = this.getAttribute('height')
    if (height) this.style.minHeight = `${height}px`
  }

  attributeChangedCallback(name: string) {
    if (name === 'title') this.titleEl.textContent = this.getAttribute('title') ?? ''
    if (name === 'body') this.bodyEl.textContent = this.getAttribute('body') ?? ''
    if (name === 'height') {
      const value = this.getAttribute('height')
      this.style.minHeight = value ? `${value}px` : ''
    }
    if (name.startsWith('data-')) this.syncFill()
  }

  private syncFill() {
    const from = this.dataset.from as PastelToken | undefined
    const to = this.dataset.to as PastelToken | undefined
    if (!from || !to) {
      this.style.removeProperty('--grad-from')
      this.style.removeProperty('--grad-to')
      this.style.removeProperty('--grad-bg')
      return
    }
    const angle = this.dataset.angle ? Number(this.dataset.angle) : undefined
    const fill: Fill = { from, to, angle }
    applyFill(this, fill)
  }
}

customElements.define('feed-card', FeedCard)
