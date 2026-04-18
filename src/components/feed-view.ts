import { h, style } from '../lib/dom'
import type { PastelToken } from '../lib/card-fill'

type Border = 'solid' | 'dashed'
type Pattern = 'slashes' | 'plus' | 'both' | 'cross'

type Sample = {
  title: string
  body: string
  height: number
  border?: Border
  pattern?: Pattern
  from?: PastelToken
  to?: PastelToken
  angle?: number
}

const SAMPLES: Sample[] = [
  { title: 'Good morning',      body: 'Here is what is happening today.',                height: 140 },
  { title: 'Sunrise',           body: 'Warm peach fading into a soft coral.',            height: 180, pattern: 'slashes', from: 'peach', to: 'butter' },
  { title: 'Trending now',      body: 'Three stories worth your attention.',             height: 150 },
  { title: 'Deep ocean',        body: 'Cool indigo descending into midnight.',           height: 220, border: 'dashed' },
  { title: 'Weather',           body: 'Partly cloudy, 18\u00B0C, light breeze.',         height: 110, pattern: 'cross' },
  { title: 'Citrus',            body: 'Bright lemon folding into tangerine.',            height: 170 },
  { title: 'From the team',     body: 'Release notes for v1.2 are live.',                height: 140 },
  { title: 'Aurora',            body: 'Teal to violet with a whisper of pink.',          height: 240, pattern: 'plus', from: 'mint', to: 'sky' },
  { title: 'Offline-friendly',  body: 'All of this is cached by the service worker.',    height: 150 },
  { title: 'Mint',              body: 'Fresh green melting into aquamarine.',            height: 190, border: 'dashed' },
  { title: 'Safe-area demo',    body: 'Scroll to the bottom \u2014 the bar never clips.', height: 160 },
  { title: 'Berry',             body: 'Magenta drifting into plum.',                     height: 210 },
  { title: 'Overscroll test',   body: 'Pull past the edges. Nothing stretches.',         height: 130, pattern: 'both' },
  { title: 'Release candidate', body: 'Tag, QA pass, then ship.',                        height: 150 },
  { title: 'Lavender',          body: 'Muted violet into cool periwinkle.',              height: 200 },
  { title: 'Graphite',          body: 'Slate gradient with a soft inner glow.',          height: 180 },
  { title: 'End of feed',       body: 'That is all for now.',                            height: 140 },
]

const CSS = `:host { display: block; }`

class FeedView extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(style(CSS))

    for (const s of SAMPLES) {
      const attrs: Record<string, string> = {
        title: s.title,
        body: s.body,
        height: String(s.height),
      }
      if (s.border === 'dashed') attrs['data-border'] = 'dashed'
      if (s.pattern) attrs['data-pattern'] = s.pattern
      if (s.from && s.to) {
        attrs['data-from'] = s.from
        attrs['data-to'] = s.to
        if (s.angle !== undefined) attrs['data-angle'] = String(s.angle)
      }
      shadow.append(h('feed-card', attrs))
    }
  }
}

customElements.define('feed-view', FeedView)
