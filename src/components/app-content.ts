import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: block;
    height: 100%;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    padding-top: calc(env(safe-area-inset-top) + 52px);
    padding-bottom: calc(env(safe-area-inset-bottom) + 52px);
  }
`

class AppContent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(style(CSS), h('slot'))
  }
}

customElements.define('app-content', AppContent)
