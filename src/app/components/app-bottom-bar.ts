import { h } from '../lib/dom'
import './app-bottom-bar.css'

const BASE = import.meta.env.BASE_URL

const TABS = [
  { id: 'feed',        label: 'Feed'  },
  { id: 'diagnostics', label: 'Diag'  },
  { id: 'about',       label: 'About' },
] as const

class AppBottomBar extends HTMLElement {
  static observedAttributes = ['active-tab']
  private buttons: HTMLButtonElement[] = []

  connectedCallback() {
    if (this.buttons.length > 0) return

    for (const tab of TABS) {
      const pattern = h('img', {
        class: 'pattern',
        src: `${BASE}patterns/pattern-dots.svg`,
        'aria-hidden': 'true',
      })
      const label = h('span', { class: 'label' }, tab.label)
      const btn = h('button', {
        type: 'button',
        'data-tab': tab.id,
        'data-active': 'false',
      }, pattern, label) as HTMLButtonElement
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('tab-change', {
          detail: tab.id,
          bubbles: true,
        }))
      })
      this.buttons.push(btn)
      this.append(btn)
    }

    const active = this.getAttribute('active-tab')
    if (active) this.syncActive(active)
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'active-tab') this.syncActive(value)
  }

  private syncActive(value: string | null) {
    for (const btn of this.buttons) {
      btn.dataset.active = btn.dataset.tab === value ? 'true' : 'false'
    }
  }
}

customElements.define('app-bottom-bar', AppBottomBar)
