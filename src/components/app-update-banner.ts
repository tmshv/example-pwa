import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--accent);
    color: white;
    font-size: 14px;
  }
  :host([hidden]) { display: none; }
  .actions { display: flex; gap: 12px; }
  button {
    padding: 4px 8px;
    border-radius: 6px;
    color: white;
    font-weight: 600;
  }
  button.primary { background: rgba(255, 255, 255, 0.2); }
`

class AppUpdateBanner extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    const reload = h('button', { class: 'primary', type: 'button' }, 'Reload')
    reload.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reload-app', { bubbles: true, composed: true }))
    })

    const dismiss = h('button', { type: 'button' }, 'Dismiss')
    dismiss.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dismiss-update', { bubbles: true, composed: true }))
    })

    shadow.append(
      style(CSS),
      h('span', {}, 'New version available'),
      h('div', { class: 'actions' }, reload, dismiss),
    )
  }
}

customElements.define('app-update-banner', AppUpdateBanner)
