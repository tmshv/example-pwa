import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: block;
    height: 100%;
    margin: 0 20px;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    padding-top: calc(env(safe-area-inset-top) + var(--float-gap) + 72px);
    padding-bottom: calc(env(safe-area-inset-bottom) + var(--float-gap) + 64px);
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
