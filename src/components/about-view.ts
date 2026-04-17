import { h, style } from '../lib/dom'

const REQUIREMENTS: Array<[string, string]> = [
  ['Works on iOS 26+ and Android 16+', 'Open on both platforms; everything below should be observable.'],
  ['No text selection',                'Long-press anywhere - no selection highlight or callout menu appears.'],
  ['No rubber-band overscroll',        'Drag past the top or bottom of the feed - no stretch, no bounce.'],
  ['No browser UI controls',           'Diagnostics tab -> Display mode card shows standalone: true.'],
  ['Works offline',                    'Enable airplane mode and relaunch - the app loads and stays usable.'],
  ['Update prompt',                    'After a new deploy, the top banner appears with Reload and Dismiss.'],
  ['Safe areas',                       'Diagnostics tab -> Safe area card shows non-zero insets on notched devices.'],
  ['Full-height content',              'Diagnostics tab -> Viewport card shows measured 100dvh equals innerHeight.'],
  ['Pinned top/bottom bars',           'Scroll the feed - top and bottom bars never move.'],
]

const CSS = `
  :host { display: block; font-family: var(--font); color: var(--fg); }
  h2 {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
  }
  ol { list-style: decimal inside; }
  li {
    margin-bottom: 12px;
    padding: 12px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
  }
  strong { display: block; margin-bottom: 4px; font-weight: 700; }
  span   { color: var(--muted); font-size: 12px; line-height: 1.45; }
`

class AboutView extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const list = h('ol')
    for (const [title, how] of REQUIREMENTS) {
      list.append(
        h('li', {},
          h('strong', {}, title),
          h('span',   {}, how),
        ),
      )
    }
    shadow.append(
      style(CSS),
      h('h2', {}, '---- REQUIREMENTS ----'),
      list,
    )
  }
}

customElements.define('about-view', AboutView)
