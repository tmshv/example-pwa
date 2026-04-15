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
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom);
  }
  button { padding: 10px 0 12px; font-size: 11px; color: var(--muted); }
  button[data-active="true"] { color: var(--accent); font-weight: 600; }
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
