import { h, style } from '../lib/dom'

const SAMPLES: Array<{ title: string; body: string; height: number }> = [
  { title: 'Good morning',      body: 'Here is what is happening today.',             height: 140 },
  { title: 'Trending now',      body: 'Three stories worth your attention.',          height: 180 },
  { title: 'Weather',           body: 'Partly cloudy, 18\u00B0C, light breeze.',           height: 110 },
  { title: 'For you',           body: 'Picked based on recent activity.',             height: 220 },
  { title: 'From the team',     body: 'Release notes for v1.2 are live.',             height: 160 },
  { title: 'Offline-friendly',  body: 'All of this is cached by the service worker.', height: 150 },
  { title: 'Safe-area demo',    body: 'Scroll to the bottom \u2014 the bar never clips.',  height: 200 },
  { title: 'Overscroll test',   body: 'Pull past the edges. Nothing stretches.',      height: 130 },
  { title: 'More cards',        body: 'Varied heights keep scroll believable.',       height: 170 },
  { title: 'End of feed',       body: 'That is all for now.',                         height: 140 },
]

const CSS = `
  :host { display: block; padding: 12px 12px 24px; }
  article {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 12px;
  }
  h2 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  p  { font-size: 14px; color: var(--muted); line-height: 1.4; }
`

class FeedView extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(style(CSS))
    for (const s of SAMPLES) {
      const article = h('article', { style: `min-height: ${s.height}px;` },
        h('h2', {}, s.title),
        h('p',  {}, s.body),
      )
      shadow.append(article)
    }
  }
}

customElements.define('feed-view', FeedView)
