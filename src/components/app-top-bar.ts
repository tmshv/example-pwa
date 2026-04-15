import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    padding-top: calc(env(safe-area-inset-top) + 8px);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  h1 { font-size: 17px; font-weight: 600; }
  button.chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    font-size: 12px;
    color: var(--muted);
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ok); }
  :host([status="update"])  .dot { background: var(--warn); }
  :host([status="offline"]) .dot { background: var(--off); }
`

class AppTopBar extends HTMLElement {
  static observedAttributes = ['status']
  private labelEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    this.labelEl = h('span', { class: 'label' }, 'online')

    const chip = h('button', { class: 'chip', type: 'button' },
      h('span', { class: 'dot' }),
      this.labelEl,
    )
    chip.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('tab-change', {
        detail: 'diagnostics',
        bubbles: true,
        composed: true,
      }))
    })

    shadow.append(
      style(CSS),
      h('h1', {}, 'PWA Layout Demo'),
      chip,
    )
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'status') {
      this.labelEl.textContent =
        value === 'update'  ? 'update'  :
        value === 'offline' ? 'offline' :
                              'online'
    }
  }
}

customElements.define('app-top-bar', AppTopBar)
