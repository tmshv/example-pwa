import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: block;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
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
