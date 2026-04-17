import { h, style } from '../lib/dom'

const TABS = [
  { id: 'feed',        label: 'Feed'  },
  { id: 'diagnostics', label: 'Diag'  },
  { id: 'about',       label: 'About' },
] as const

const CSS = `
  :host {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    background: var(--surface-floating);
    border: 1px solid var(--border-floating);
    border-radius: 25px;
    box-shadow: var(--shadow-floating);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
  button {
    position: relative;
    padding: 10px 0;
    margin: 6px 0;
    font-size: 12px;
    letter-spacing: 0.02em;
    color: var(--muted);
    border-radius: 16px;
    transition: background 160ms ease, color 160ms ease;
  }
  button + button::before {
    content: "";
    position: absolute;
    top: 20%;
    bottom: 20%;
    left: -3px;
    width: 1px;
    background: var(--border);
  }
  button[data-active="true"] {
    color: var(--accent);
    font-weight: 600;
    background: rgba(37, 99, 235, 0.12);
  }
  button[data-active="true"]::before,
  button[data-active="true"] + button::before {
    opacity: 0;
  }
  @media (prefers-color-scheme: dark) {
    button[data-active="true"] { background: rgba(96, 165, 250, 0.18); }
  }
`

class AppBottomBar extends HTMLElement {
  static observedAttributes = ['active-tab']
  private buttons: HTMLButtonElement[] = []

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(style(CSS))

    for (const tab of TABS) {
      const btn = h('button', {
        type: 'button',
        'data-tab': tab.id,
        'data-active': 'false',
      }, tab.label) as HTMLButtonElement
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('tab-change', {
          detail: tab.id,
          bubbles: true,
          composed: true,
        }))
      })
      this.buttons.push(btn)
      shadow.append(btn)
    }
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'active-tab') {
      for (const btn of this.buttons) {
        btn.dataset.active = btn.dataset.tab === value ? 'true' : 'false'
      }
    }
  }
}

customElements.define('app-bottom-bar', AppBottomBar)
