import { h } from '../lib/dom'
import { applyFill, type Fill, type PastelToken } from '../lib/card-fill'
import './feed-card.css'

const BASE = import.meta.env.BASE_URL

const PATTERN_FILES: Record<string, string[]> = {
  slashes: ['pattern-slashes.svg'],
  plus:    ['pattern-plus.svg'],
  both:    ['pattern-slashes.svg', 'pattern-plus.svg'],
  cross:   ['pattern-cross.svg'],
  dots:    ['pattern-dots.svg'],
}

export class FeedCard extends HTMLElement {
  static observedAttributes = [
    'title', 'body', 'height',
    'data-from', 'data-to', 'data-angle', 'data-pattern',
  ]
  private titleTextEl = h('span')
  private bodyTextEl  = h('span')
  private titleEl = h('h2', {}, this.titleTextEl)
  private bodyEl  = h('p',  {}, this.bodyTextEl)
  private contentEl = h('div', { class: 'content' }, this.titleEl, this.bodyEl)

  connectedCallback() {
    if (this.childElementCount === 0) {
      this.renderPatterns()
      this.append(this.contentEl)
    }
    this.titleTextEl.textContent = this.getAttribute('title') ?? ''
    this.bodyTextEl.textContent  = this.getAttribute('body')  ?? ''
    const height = this.getAttribute('height')
    if (height) this.style.minHeight = `${height}px`
    this.syncFill()
  }

  attributeChangedCallback(name: string) {
    if (name === 'title')  this.titleTextEl.textContent = this.getAttribute('title') ?? ''
    if (name === 'body')   this.bodyTextEl.textContent  = this.getAttribute('body')  ?? ''
    if (name === 'height') {
      const value = this.getAttribute('height')
      this.style.minHeight = value ? `${value}px` : ''
    }
    if (name === 'data-pattern' && this.isConnected) this.renderPatterns()
    if (name.startsWith('data-')) this.syncFill()
  }

  private renderPatterns() {
    for (const img of Array.from(this.querySelectorAll(':scope > .pattern'))) {
      img.remove()
    }
    const key = this.dataset.pattern
    if (!key) return
    const files = PATTERN_FILES[key] ?? []
    for (const file of files) {
      this.prepend(h('img', {
        class: 'pattern',
        src: `${BASE}patterns/${file}`,
        'aria-hidden': 'true',
      }))
    }
  }

  private syncFill() {
    const from = this.dataset.from as PastelToken | undefined
    const to   = this.dataset.to   as PastelToken | undefined
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
