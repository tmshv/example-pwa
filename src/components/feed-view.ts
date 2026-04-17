import { h, style } from '../lib/dom'
import type { CardFill } from '../lib/card-fill'

type Sample = {
  title: string
  body: string
  height: number
  fill: CardFill
}

const SAMPLES: Sample[] = [
  { title: 'Good morning',     body: 'Here is what is happening today.',          height: 140, fill: { gradient: 'linear-45',         from: 'peach',  to: 'butter' } },
  { title: 'Sunrise',          body: 'Warm peach fading into a soft coral.',      height: 180, fill: { gradient: 'linear-vertical',   from: 'peach',  to: 'blush'  } },
  { title: 'Trending now',     body: 'Three stories worth your attention.',       height: 150, fill: { gradient: 'radial-tl',         from: 'mint',   to: 'sky'    } },
  { title: 'Deep ocean',       body: 'Cool indigo descending into midnight.',     height: 220, fill: { gradient: 'linear-135',        from: 'sky',    to: 'lilac'  } },
  { title: 'Weather',          body: 'Partly cloudy, 18\u00B0C, light breeze.',   height: 110, fill: { gradient: 'linear-horizontal', from: 'sky',    to: 'mint'   } },
  { title: 'Citrus',           body: 'Bright lemon folding into tangerine.',      height: 170, fill: { gradient: 'linear-45',         from: 'butter', to: 'peach'  } },
  { title: 'From the team',    body: 'Release notes for v1.2 are live.',          height: 140, fill: { gradient: 'radial-center',     from: 'lilac',  to: 'blush'  } },
  { title: 'Aurora',           body: 'Teal to violet with a whisper of pink.',    height: 240, fill: { gradient: 'linear-vertical',   from: 'mint',   to: 'lilac'  } },
  { title: 'Offline-friendly', body: 'All of this is cached by the service worker.', height: 150, fill: { gradient: 'radial-br',      from: 'butter', to: 'mint'   } },
  { title: 'Mint',             body: 'Fresh green melting into aquamarine.',      height: 190, fill: { gradient: 'linear-45',         from: 'mint',   to: 'sky'    } },
  { title: 'Safe-area demo',   body: 'Scroll to the bottom \u2014 the bar never clips.', height: 160, fill: { gradient: 'linear-horizontal', from: 'blush', to: 'lilac' } },
  { title: 'Berry',            body: 'Magenta drifting into plum.',               height: 210, fill: { gradient: 'linear-135',        from: 'blush',  to: 'lilac'  } },
  { title: 'Overscroll test',  body: 'Pull past the edges. Nothing stretches.',   height: 130, fill: { gradient: 'radial-tl',         from: 'peach',  to: 'sky'    } },
  { title: 'Graphite',         body: 'Slate gradient with a soft inner glow.',    height: 180, fill: { gradient: 'linear-vertical',   from: 'lilac',  to: 'sky'    } },
  { title: 'End of feed',      body: 'That is all for now.',                      height: 140, fill: { gradient: 'radial-center',     from: 'butter', to: 'blush'  } },
]

const CSS = `:host { display: block; }`

class FeedView extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(style(CSS))
    for (const s of SAMPLES) {
      shadow.append(
        h('feed-card', {
          title: s.title,
          body: s.body,
          height: String(s.height),
          'data-gradient': s.fill.gradient,
          'data-from': s.fill.from,
          'data-to': s.fill.to,
        }),
      )
    }
  }
}

customElements.define('feed-view', FeedView)
