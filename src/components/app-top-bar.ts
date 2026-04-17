import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: color-mix(in srgb, var(--bg) 60%, transparent);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
            backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid var(--border);
    font-family: var(--font);
    color: var(--fg);
  }
  h1 { font-size: 14px; font-weight: 700; letter-spacing: 0.04em; }
  button.chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border: 1px solid var(--border);
    background: transparent;
    font-family: var(--font);
    font-size: 12px;
    color: var(--fg);
  }
  .swatch { width: 8px; height: 8px; border: 1px solid var(--border); background: var(--ok); }
  :host([status="update"])  .swatch { background: var(--warn); }
  :host([status="offline"]) .swatch { background: var(--off); }
`

class AppTopBar extends HTMLElement {
  static observedAttributes = ['status']
  private labelEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    this.labelEl = h('span', { class: 'label' }, '[ online ]')

    const chip = h('button', { class: 'chip', type: 'button' },
      h('span', { class: 'swatch' }),
      this.labelEl,
    )
    chip.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('check-update', { bubbles: true, composed: true }))
    })

    shadow.append(
      style(CSS),
      h('h1', {}, 'PWA LAYOUT DEMO'),
      chip,
    )
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'status') {
      this.labelEl.textContent =
        value === 'update'  ? '[ update ]'  :
        value === 'offline' ? '[ offline ]' :
                              '[ online ]'
    }
  }
}

customElements.define('app-top-bar', AppTopBar)
