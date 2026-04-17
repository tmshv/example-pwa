import { h, style } from '../lib/dom'
import type { CardFill } from '../lib/card-fill'

type Sample = {
  title: string
  body: string
  height: number
}

const SAMPLES: Sample[] = [
  { title: 'Good morning',      body: 'Here is what is happening today.',                height: 140 },
  { title: 'Sunrise',           body: 'Warm peach fading into a soft coral.',            height: 180 },
  { title: 'Trending now',      body: 'Three stories worth your attention.',             height: 150 },
  { title: 'Deep ocean',        body: 'Cool indigo descending into midnight.',           height: 220 },
  { title: 'Weather',           body: 'Partly cloudy, 18\u00B0C, light breeze.',         height: 110 },
  { title: 'Citrus',            body: 'Bright lemon folding into tangerine.',            height: 170 },
  { title: 'From the team',     body: 'Release notes for v1.2 are live.',                height: 140 },
  { title: 'Aurora',            body: 'Teal to violet with a whisper of pink.',          height: 240 },
  { title: 'Offline-friendly',  body: 'All of this is cached by the service worker.',    height: 150 },
  { title: 'Mint',              body: 'Fresh green melting into aquamarine.',            height: 190 },
  { title: 'Safe-area demo',    body: 'Scroll to the bottom \u2014 the bar never clips.', height: 160 },
  { title: 'Berry',             body: 'Magenta drifting into plum.',                     height: 210 },
  { title: 'Overscroll test',   body: 'Pull past the edges. Nothing stretches.',         height: 130 },
  { title: 'Release candidate', body: 'Tag, QA pass, then ship.',                        height: 150 },
  { title: 'Lavender',          body: 'Muted violet into cool periwinkle.',              height: 200 },
  { title: 'Graphite',          body: 'Slate gradient with a soft inner glow.',          height: 180 },
  { title: 'End of feed',       body: 'That is all for now.',                            height: 140 },
]

type Accent =
  | { pattern: 'slashes'; fill: CardFill }
  | { pattern: 'plus';    fill: CardFill }
  | { pattern: 'both' }
  | { pattern: 'cross' }

const ACCENT_BY_INDEX: Record<number, Accent> = {
  1:  { pattern: 'slashes', fill: { gradient: 'linear-45', from: 'peach', to: 'butter' } },
  4:  { pattern: 'cross' },
  7:  { pattern: 'plus',    fill: { gradient: 'radial-tl', from: 'mint',  to: 'sky'    } },
  12: { pattern: 'both' },
}

const CSS = `:host { display: block; }`

class FeedView extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(style(CSS))

    SAMPLES.forEach((s, idx) => {
      const attrs: Record<string, string> = {
        title: s.title,
        body: s.body,
        height: String(s.height),
      }
      const accent = ACCENT_BY_INDEX[idx]
      if (accent) {
        attrs['data-pattern'] = accent.pattern
        if ('fill' in accent) {
          attrs['data-gradient'] = accent.fill.gradient
          attrs['data-from'] = accent.fill.from
          attrs['data-to'] = accent.fill.to
        }
      }
      shadow.append(h('feed-card', attrs))
    })
  }
}

customElements.define('feed-view', FeedView)
