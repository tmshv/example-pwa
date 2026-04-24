import { h } from '../lib/dom'
import './about-view.css'

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

class AboutView extends HTMLElement {
  connectedCallback() {
    if (this.childElementCount > 0) return

    const list = h('ol')
    for (const [title, how] of REQUIREMENTS) {
      list.append(
        h('li', {},
          h('strong', {}, title),
          h('span',   {}, how),
        ),
      )
    }
    this.append(
      h('h2', {}, '---- REQUIREMENTS ----'),
      list,
    )
  }
}

customElements.define('about-view', AboutView)
