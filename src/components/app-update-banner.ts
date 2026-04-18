import { h, style } from '../lib/dom'

const CSS = `
  :host {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--pastel-blush);
    border: 1px solid var(--border);
    color: var(--fg);
    font-family: var(--font);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  :host([hidden]) { display: none; }
  :host::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--pattern-ink);
    -webkit-mask: url("/patterns/pattern-dots.svg") repeat;
            mask: url("/patterns/pattern-dots.svg") repeat;
    -webkit-mask-size: 8px 8px;
            mask-size: 8px 8px;
    pointer-events: none;
  }
  .label, .actions { position: relative; z-index: 1; }
  .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .actions { display: flex; gap: 8px; flex-shrink: 0; }
  button {
    padding: 4px 10px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--fg);
    font-family: var(--font);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  button.primary { background: var(--pastel-blush); }
`

class AppUpdateBanner extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    const reload = h('button', { class: 'primary', type: 'button' }, '[ RELOAD ]')
    reload.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reload-app', { bubbles: true, composed: true }))
    })

    const dismiss = h('button', { type: 'button' }, '[ DISMISS ]')
    dismiss.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dismiss-update', { bubbles: true, composed: true }))
    })

    shadow.append(
      style(CSS),
      h('span', { class: 'label' }, 'NEW VERSION AVAILABLE'),
      h('div', { class: 'actions' }, reload, dismiss),
    )
  }
}

customElements.define('app-update-banner', AppUpdateBanner)
