import { h } from '../lib/dom'
import type { PastelToken } from '../lib/card-fill'

type Border = 'solid' | 'dashed'
type Pattern = 'slashes' | 'plus' | 'both' | 'cross' | 'crosses' | 'dots'

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
  { title: 'Sunrise over the quiet harbor', body: 'Warm peach slides into a soft coral and settles on the water long before anyone is awake to notice. The gulls know first, and then the boats, and then us.', height: 180, pattern: 'slashes', from: 'peach', to: 'butter' },
  { title: 'Trending now',      body: 'Three stories worth your attention.',             height: 150 },
  { title: 'Twilight notebook', body: 'A small field of dots in hexagonal order, resting on a pale sky fading into lilac. Quiet, grid-adjacent, hand-drawn in spirit.', height: 180, pattern: 'dots', from: 'sky', to: 'lilac' },
  { title: 'Deep ocean',        body: 'Cool indigo descending into midnight.',           height: 220, border: 'dashed' },
  { title: 'Weather',           body: 'Partly cloudy all afternoon, holding at 18\u00B0C with a light breeze from the west. Rain is possible after sunset but unlikely to amount to much.', height: 140, pattern: 'cross' },
  { title: 'Citrus',            body: 'Bright lemon folding into tangerine.',            height: 170 },
  { title: 'From the team',     body: 'Release notes for v1.2 are live.',                height: 140 },
  { title: 'Aurora across the northern sky', body: 'Teal fades into violet with a whisper of pink, drifts westward for an hour, then folds in on itself and disappears without a sound. The cameras keep pointing up long after it is gone.', height: 240, pattern: 'plus', from: 'mint', to: 'sky' },
  { title: 'Offline-friendly',  body: 'All of this is cached by the service worker.',    height: 150 },
  { title: 'Mint',              body: 'Fresh green melting into aquamarine.',            height: 190, border: 'dashed' },
  { title: 'Safe-area demo',    body: 'Scroll to the bottom \u2014 the bar never clips.', height: 160 },
  { title: 'Berry',             body: 'Magenta drifting into plum.',                     height: 210 },
  { title: 'Overscroll test',   body: 'Pull past the top edge. Pull past the bottom. Nothing stretches, nothing bounces, nothing rubber-bands back into place.', height: 160, pattern: 'slashes' },
  { title: 'Grid lines',        body: 'A crosshatch of tiny pluses laid out on a clean white surface. Useful for seeing how text sits on top of a busy pattern when the type needs to stay readable.', height: 160, pattern: 'plus' },
  { title: 'Diagonal weave',    body: 'The same small grid turned forty-five degrees: tiny crosses leaning into each other, warm butter folding into soft blush across the tile.', height: 180, pattern: 'crosses', from: 'butter', to: 'blush' },
  { title: 'Release candidate', body: 'Tag, QA pass, then ship.',                        height: 150 },
  { title: 'Lavender',          body: 'Muted violet into cool periwinkle.',              height: 200 },
  { title: 'Graphite',          body: 'Slate gradient with a soft inner glow.',          height: 180 },
  { title: 'Diagonal weave',    body: 'Test. Test. Test', height: 100, pattern: 'slashes', from: 'lilac', to: 'butter' },
  { title: 'End of feed',       body: 'That is all for now.',                            height: 140 },
]

class FeedView extends HTMLElement {
  connectedCallback() {
    if (this.childElementCount > 0) return

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
      this.append(h('feed-card', attrs))
    }
  }
}

customElements.define('feed-view', FeedView)
