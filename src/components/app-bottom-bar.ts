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
    background: var(--bg);
    border: 1px solid var(--border);
    font-family: var(--font);
  }
  button {
    position: relative;
    padding: 12px 0;
    font-family: var(--font);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    background: transparent;
    border: 0;
  }
  button + button::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1px;
    width: 1px;
    background: var(--border);
  }
  button[data-active="true"]::before,
  button[data-active="true"] + button::before {
    opacity: 0;
  }
  button[data-active="true"] {
    color: var(--fg);
    background: var(--pastel-butter);
  }
  button[data-active="true"]::after {
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
  button[data-active="true"] span { position: relative; z-index: 1; }
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
      }, h('span', {}, tab.label)) as HTMLButtonElement
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
