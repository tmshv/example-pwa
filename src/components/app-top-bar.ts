import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface-floating);
    border: 1px solid var(--border-floating);
    border-radius: 25px;
    box-shadow: var(--shadow-floating);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
  h1 { font-size: 16px; font-weight: 600; }
  button.chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    font-size: 12px;
    color: var(--muted);
    background: rgba(255, 255, 255, 0.4);
  }
  @media (prefers-color-scheme: dark) {
    button.chip { background: rgba(255, 255, 255, 0.05); }
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
      this.dispatchEvent(new CustomEvent('check-update', {
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
