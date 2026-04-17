# Blueprint Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the PWA Layout Demo in an architectural-blueprint visual style — 1px black borders, zero corner radii, monospace type, pastel gradient card fills with repeating SVG patterns overlaid via CSS masks, and a cyanotype dark mode (blue paper, white ink).

**Architecture:** Keep the existing web-components architecture. Rewrite `tokens.css`. Extract feed and diagnostics cards into their own components (`<feed-card>`, `<diagnostic-card>`) that take a per-card fill config via data attributes and apply it as CSS custom properties. Three seamless SVG tiles (`///`, `+++`, `·`) live under `public/patterns/` and are painted onto card `::before` overlays via `-webkit-mask`/`mask`, colored by `--pattern-ink` so a single SVG serves both themes.

**Tech Stack:** Vite 7, TypeScript 5, native Web Components + Shadow DOM, CSS custom properties, Vitest + jsdom.

**Spec reference:** `docs/superpowers/specs/2026-04-17-blueprint-redesign-design.md`

---

## File Structure

Files added:

| File                                  | Responsibility                                                       |
| ------------------------------------- | -------------------------------------------------------------------- |
| `public/patterns/pattern-slashes.svg` | 16×16 seamless `///` tile for feed cards                             |
| `public/patterns/pattern-plus.svg`    | 20×20 seamless `+` tile for diagnostic cards                         |
| `public/patterns/pattern-dots.svg`    | 8×8 seamless dot tile for nav chrome + update banner                 |
| `src/lib/card-fill.ts`                | Pure helpers: `gradientAngles` map + `applyFill()`                   |
| `src/components/feed-card.ts`         | Pastel + `///` blueprint card, configured via attributes             |
| `src/components/diagnostic-card.ts`   | Pastel + `+++` blueprint card with slot for content                  |
| `tests/card-fill.test.ts`             | Unit tests for `applyFill` and `gradientAngles`                      |

Files modified:

| File                                  | Change                                                               |
| ------------------------------------- | -------------------------------------------------------------------- |
| `src/styles/tokens.css`               | Full rewrite — blueprint tokens + pastel palette                     |
| `src/styles/app.css`                  | Remove floating offsets that assumed rounded chrome                  |
| `src/components/app-top-bar.ts`       | Rectangular chrome, bracketed status chip, square swatch             |
| `src/components/app-bottom-bar.ts`    | Rectangular chrome, active tab gets `pattern-dots` overlay           |
| `src/components/app-update-banner.ts` | Rectangular chrome, `pattern-dots` + blush fill, bracketed buttons   |
| `src/components/feed-view.ts`         | Render `<feed-card>` children; rewrite `SAMPLES` with new fill shape |
| `src/components/diagnostics-view.ts`  | Wrap each section in `<diagnostic-card>` with fixed pastel fills     |
| `src/components/about-view.ts`        | Blueprint chrome on `<li>`, no pattern fill                          |
| `src/main.ts`                         | Register the two new card elements                                   |

---

## Task 1: Add pattern SVG assets

**Files:**
- Create: `public/patterns/pattern-slashes.svg`
- Create: `public/patterns/pattern-plus.svg`
- Create: `public/patterns/pattern-dots.svg`

- [ ] **Step 1: Create the directory**

Run: `mkdir -p public/patterns`

- [ ] **Step 2: Write `public/patterns/pattern-slashes.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path d="M-4 20 L20 -4 M0 24 L24 0 M4 28 L28 4" stroke="#000" stroke-width="1" fill="none"/>
</svg>
```

- [ ] **Step 3: Write `public/patterns/pattern-plus.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
  <path d="M10 5 V15 M5 10 H15" stroke="#000" stroke-width="1" fill="none"/>
</svg>
```

- [ ] **Step 4: Write `public/patterns/pattern-dots.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
  <circle cx="4" cy="4" r="1" fill="#000"/>
</svg>
```

- [ ] **Step 5: Verify files served by Vite dev server**

Run: `npm run dev` in one terminal, then in another:
`curl -sS http://localhost:5173/patterns/pattern-slashes.svg | head -1`

Expected: first line is `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">`. Repeat for `pattern-plus.svg` and `pattern-dots.svg`. Stop the dev server after.

- [ ] **Step 6: Commit**

```bash
git add public/patterns
git commit -m "feat: add blueprint pattern SVG assets"
```

---

## Task 2: Rewrite `tokens.css` to the blueprint palette

**Files:**
- Modify: `src/styles/tokens.css` (full rewrite)

- [ ] **Step 1: Replace the entire file with the blueprint tokens**

Overwrite `src/styles/tokens.css` with:

```css
:root {
  --bg:             #ffffff;
  --fg:             #000000;
  --border:         #000000;
  --muted:          rgba(0, 0, 0, 0.6);
  --pattern-ink:    rgba(0, 0, 0, 0.5);
  --ok:             #16a34a;
  --warn:           #d97706;
  --off:            #6b7280;
  --font:           ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;

  --pastel-peach:   #ffd9c2;
  --pastel-mint:    #c8efd6;
  --pastel-sky:     #cfe4f5;
  --pastel-lilac:   #e2d4f2;
  --pastel-butter:  #fff2c2;
  --pastel-blush:   #f5d0dc;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:            #1d3a8a;
    --fg:            #ffffff;
    --border:        #ffffff;
    --muted:         rgba(255, 255, 255, 0.7);
    --pattern-ink:   rgba(255, 255, 255, 0.55);
  }
}
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds. Colors will look wrong in components that still reference removed tokens — that is expected; later tasks rewrite those components.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "refactor: replace design tokens with blueprint palette"
```

---

## Task 3: Add `card-fill.ts` helper + tests

**Files:**
- Create: `src/lib/card-fill.ts`
- Create: `tests/card-fill.test.ts`

- [ ] **Step 1: Write failing test `tests/card-fill.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { gradientAngles, applyFill, type CardFill } from '../src/lib/card-fill'

describe('gradientAngles', () => {
  it('returns a linear gradient for linear-45', () => {
    expect(gradientAngles['linear-45']).toBe(
      'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
    )
  })

  it('returns a radial gradient for radial-tl', () => {
    expect(gradientAngles['radial-tl']).toBe(
      'radial-gradient(at top left, var(--grad-from), var(--grad-to))',
    )
  })

  it('covers every GradientType', () => {
    const keys = Object.keys(gradientAngles).sort()
    expect(keys).toEqual([
      'linear-135',
      'linear-45',
      'linear-horizontal',
      'linear-vertical',
      'radial-br',
      'radial-center',
      'radial-tl',
    ])
  })
})

describe('applyFill', () => {
  it('sets --grad-from, --grad-to, --grad-bg on the element', () => {
    const el = document.createElement('div')
    const fill: CardFill = { gradient: 'linear-vertical', from: 'peach', to: 'mint' }
    applyFill(el, fill)
    expect(el.style.getPropertyValue('--grad-from')).toBe('var(--pastel-peach)')
    expect(el.style.getPropertyValue('--grad-to')).toBe('var(--pastel-mint)')
    expect(el.style.getPropertyValue('--grad-bg')).toBe(
      'linear-gradient(180deg, var(--grad-from), var(--grad-to))',
    )
  })

  it('uses radial template for radial fills', () => {
    const el = document.createElement('div')
    applyFill(el, { gradient: 'radial-br', from: 'sky', to: 'lilac' })
    expect(el.style.getPropertyValue('--grad-bg')).toBe(
      'radial-gradient(at bottom right, var(--grad-from), var(--grad-to))',
    )
  })
})
```

- [ ] **Step 2: Run test — confirm it fails because `card-fill.ts` does not exist**

Run: `npx vitest run tests/card-fill.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/card-fill'`.

- [ ] **Step 3: Write `src/lib/card-fill.ts`**

```ts
export type PastelToken =
  | 'peach' | 'mint' | 'sky' | 'lilac' | 'butter' | 'blush'

export type GradientType =
  | 'linear-45'
  | 'linear-135'
  | 'linear-vertical'
  | 'linear-horizontal'
  | 'radial-tl'
  | 'radial-br'
  | 'radial-center'

export type CardFill = {
  gradient: GradientType
  from: PastelToken
  to: PastelToken
}

export const gradientAngles: Record<GradientType, string> = {
  'linear-45':         'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
  'linear-135':        'linear-gradient(45deg, var(--grad-from), var(--grad-to))',
  'linear-vertical':   'linear-gradient(180deg, var(--grad-from), var(--grad-to))',
  'linear-horizontal': 'linear-gradient(90deg, var(--grad-from), var(--grad-to))',
  'radial-tl':         'radial-gradient(at top left, var(--grad-from), var(--grad-to))',
  'radial-br':         'radial-gradient(at bottom right, var(--grad-from), var(--grad-to))',
  'radial-center':     'radial-gradient(at center, var(--grad-from), var(--grad-to))',
}

export function applyFill(el: HTMLElement, fill: CardFill): void {
  el.style.setProperty('--grad-from', `var(--pastel-${fill.from})`)
  el.style.setProperty('--grad-to',   `var(--pastel-${fill.to})`)
  el.style.setProperty('--grad-bg',   gradientAngles[fill.gradient])
}
```

- [ ] **Step 4: Run test — confirm it passes**

Run: `npx vitest run tests/card-fill.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/card-fill.ts tests/card-fill.test.ts
git commit -m "feat: add card-fill helper with gradient templates"
```

---

## Task 4: Create `<feed-card>` component

**Files:**
- Create: `src/components/feed-card.ts`

- [ ] **Step 1: Write `src/components/feed-card.ts`**

```ts
import { h, style } from '../lib/dom'
import { applyFill, type CardFill, type GradientType, type PastelToken } from '../lib/card-fill'

const CSS = `
  :host {
    display: block;
    position: relative;
    border: 1px solid var(--border);
    background: var(--grad-bg, var(--bg));
    padding: 14px 16px;
    margin-bottom: 12px;
    font-family: var(--font);
    color: var(--fg);
  }
  :host::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--pattern-ink);
    -webkit-mask: url("/patterns/pattern-slashes.svg") repeat;
            mask: url("/patterns/pattern-slashes.svg") repeat;
    -webkit-mask-size: 16px 16px;
            mask-size: 16px 16px;
    pointer-events: none;
  }
  .content { position: relative; z-index: 1; }
  h2 { font-size: 14px; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.02em; }
  p  { font-size: 13px; line-height: 1.45; color: var(--fg); }
`

export class FeedCard extends HTMLElement {
  static observedAttributes = ['title', 'body', 'height', 'data-gradient', 'data-from', 'data-to']
  private titleEl: HTMLElement
  private bodyEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    this.titleEl = h('h2')
    this.bodyEl = h('p')
    shadow.append(style(CSS), h('div', { class: 'content' }, this.titleEl, this.bodyEl))
  }

  connectedCallback() {
    this.syncFill()
    this.titleEl.textContent = this.getAttribute('title') ?? ''
    this.bodyEl.textContent = this.getAttribute('body') ?? ''
    const height = this.getAttribute('height')
    if (height) this.style.minHeight = `${height}px`
  }

  attributeChangedCallback(name: string) {
    if (name === 'title') this.titleEl.textContent = this.getAttribute('title') ?? ''
    if (name === 'body') this.bodyEl.textContent = this.getAttribute('body') ?? ''
    if (name === 'height') {
      const h = this.getAttribute('height')
      this.style.minHeight = h ? `${h}px` : ''
    }
    if (name.startsWith('data-')) this.syncFill()
  }

  private syncFill() {
    const gradient = this.dataset.gradient as GradientType | undefined
    const from = this.dataset.from as PastelToken | undefined
    const to = this.dataset.to as PastelToken | undefined
    if (!gradient || !from || !to) return
    const fill: CardFill = { gradient, from, to }
    applyFill(this, fill)
  }
}

customElements.define('feed-card', FeedCard)
```

- [ ] **Step 2: Import it from `src/main.ts`**

Add one line after the existing `./components/feed-view` import:

Current `src/main.ts` lines 1-13 import `./components/feed-view` on line 9. Insert `./components/feed-card` before it:

```ts
import './components/feed-card'
import './components/feed-view'
```

- [ ] **Step 3: Build to check for TypeScript errors**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/feed-card.ts src/main.ts
git commit -m "feat: add <feed-card> with slash pattern"
```

---

## Task 5: Rewrite `feed-view` to render `<feed-card>` children

**Files:**
- Modify: `src/components/feed-view.ts` (full rewrite)

- [ ] **Step 1: Replace `src/components/feed-view.ts` with**

```ts
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
```

- [ ] **Step 2: Build and run dev server, eyeball feed tab**

Run: `npm run dev`

Open `http://localhost:5173`, stay on Feed tab. Expected: cards render with pastel gradients, `///` diagonal overlay visible, 1px black border, no rounded corners, monospace text. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/feed-view.ts
git commit -m "refactor: render feed with <feed-card> and pastel fills"
```

---

## Task 6: Create `<diagnostic-card>` component

**Files:**
- Create: `src/components/diagnostic-card.ts`

- [ ] **Step 1: Write `src/components/diagnostic-card.ts`**

```ts
import { h, style } from '../lib/dom'
import { applyFill, type CardFill, type GradientType, type PastelToken } from '../lib/card-fill'

const CSS = `
  :host {
    display: block;
    position: relative;
    border: 1px solid var(--border);
    background: var(--grad-bg, var(--bg));
    padding: 12px 14px;
    margin-bottom: 12px;
    font-family: var(--font);
    color: var(--fg);
  }
  :host::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--pattern-ink);
    -webkit-mask: url("/patterns/pattern-plus.svg") repeat;
            mask: url("/patterns/pattern-plus.svg") repeat;
    -webkit-mask-size: 20px 20px;
            mask-size: 20px 20px;
    pointer-events: none;
  }
  .wrap { position: relative; z-index: 1; }
  h3 {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
    color: var(--fg);
  }
  ::slotted(.row)      { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
  ::slotted(.row.wrap) { flex-direction: column; gap: 4px; }
`

export class DiagnosticCard extends HTMLElement {
  static observedAttributes = ['title', 'data-gradient', 'data-from', 'data-to']
  private titleEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    this.titleEl = h('h3')
    shadow.append(
      style(CSS),
      h('div', { class: 'wrap' }, this.titleEl, h('slot')),
    )
  }

  connectedCallback() {
    this.syncTitle()
    this.syncFill()
  }

  attributeChangedCallback(name: string) {
    if (name === 'title') this.syncTitle()
    if (name.startsWith('data-')) this.syncFill()
  }

  private syncTitle() {
    const raw = (this.getAttribute('title') ?? '').toUpperCase()
    this.titleEl.textContent = raw ? `---- ${raw} ----` : ''
  }

  private syncFill() {
    const gradient = this.dataset.gradient as GradientType | undefined
    const from = this.dataset.from as PastelToken | undefined
    const to = this.dataset.to as PastelToken | undefined
    if (!gradient || !from || !to) return
    const fill: CardFill = { gradient, from, to }
    applyFill(this, fill)
  }
}

customElements.define('diagnostic-card', DiagnosticCard)
```

- [ ] **Step 2: Register it in `src/main.ts`**

Insert before the `./components/diagnostics-view` import:

```ts
import './components/diagnostic-card'
import './components/diagnostics-view'
```

- [ ] **Step 3: Build to check for TypeScript errors**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/diagnostic-card.ts src/main.ts
git commit -m "feat: add <diagnostic-card> with plus pattern"
```

---

## Task 7: Rewrite `diagnostics-view` to wrap sections in `<diagnostic-card>`

**Files:**
- Modify: `src/components/diagnostics-view.ts`

Notes on styling boundaries:
- Rows are light-DOM children of `<diagnostic-card>`. The `::slotted(.row)` rule in `diagnostic-card` (see Task 6) handles row-level layout (flex, spacing).
- `::slotted` cannot reach descendants (`.k`, `.v` inside a `.row`), so row-internal text styles are applied inline on the span elements themselves.

- [ ] **Step 1: Replace `src/components/diagnostics-view.ts` with**

```ts
import { h, style } from '../lib/dom'
import { Diagnostics, type DiagnosticsSnapshot } from '../lib/diagnostics'
import type { CardFill } from '../lib/card-fill'

let sharedDiagnostics: Diagnostics | null = null
export function getDiagnostics(): Diagnostics {
  if (!sharedDiagnostics) sharedDiagnostics = new Diagnostics()
  return sharedDiagnostics
}

const FILLS: Record<string, CardFill> = {
  'Safe area insets': { gradient: 'linear-45',       from: 'sky',    to: 'mint'   },
  'Viewport':         { gradient: 'linear-vertical', from: 'peach',  to: 'butter' },
  'Display mode':     { gradient: 'radial-tl',       from: 'lilac',  to: 'blush'  },
  'Network and SW':   { gradient: 'linear-135',      from: 'mint',   to: 'sky'    },
  'Scroll':           { gradient: 'radial-br',       from: 'butter', to: 'peach'  },
  'Platform':         { gradient: 'radial-center',   from: 'blush',  to: 'lilac'  },
}

const K_STYLE = 'color: var(--muted);'
const V_STYLE = 'color: var(--fg); font-variant-numeric: tabular-nums;'
const V_SMALL_STYLE = 'color: var(--fg); font-size: 11px; word-break: break-all;'

function row(label: string, value: string): HTMLElement {
  return h('div', { class: 'row' },
    h('span', { class: 'k', style: K_STYLE }, label),
    h('span', { class: 'v', style: V_STYLE }, value),
  )
}

function card(title: string, ...rows: HTMLElement[]): HTMLElement {
  const fill = FILLS[title]
  return h('diagnostic-card', {
    title,
    'data-gradient': fill.gradient,
    'data-from':     fill.from,
    'data-to':       fill.to,
  }, ...rows)
}

function build(snap: DiagnosticsSnapshot): DocumentFragment {
  const frag = document.createDocumentFragment()

  frag.append(
    card('Safe area insets',
      row('top',    snap.insets.top    + 'px'),
      row('right',  snap.insets.right  + 'px'),
      row('bottom', snap.insets.bottom + 'px'),
      row('left',   snap.insets.left   + 'px'),
    ),
    card('Viewport',
      row('innerWidth x innerHeight', snap.innerWidth + ' x ' + snap.innerHeight),
      row('visualViewport.height',    snap.visualHeight + 'px'),
      row('100dvh (measured)',        snap.dvh + 'px'),
      row('devicePixelRatio',         String(snap.dpr)),
    ),
    card('Display mode',
      row('standalone',   String(snap.standalone)),
      row('color scheme', snap.colorScheme),
    ),
    card('Network and SW',
      row('online',    String(snap.online)),
      row('swState',   snap.swState),
      row('swVersion', snap.swVersion),
    ),
    card('Scroll',
      row('scrollTop', snap.scrollTop + 'px'),
      row('scrollMax', snap.scrollMax + 'px'),
    ),
  )

  const platform = card('Platform', row('platform', snap.platform))
  platform.append(
    h('div', { class: 'row wrap' },
      h('span', { class: 'k', style: K_STYLE }, 'ua'),
      h('span', { class: 'v small', style: V_SMALL_STYLE }, snap.ua),
    ),
  )
  frag.append(platform)

  return frag
}

const CSS = `:host { display: block; font-family: var(--font); }`

class DiagnosticsView extends HTMLElement {
  private container: HTMLElement
  private unsubscribe?: () => void

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    this.container = h('div')
    shadow.append(style(CSS), this.container)
  }

  connectedCallback() {
    const diag = getDiagnostics()
    this.unsubscribe = diag.subscribe((snap) => {
      this.container.replaceChildren(build(snap))
    })
  }

  disconnectedCallback() {
    this.unsubscribe?.()
  }
}

customElements.define('diagnostics-view', DiagnosticsView)
```

- [ ] **Step 2: Build and smoke-test**

Run: `npm run dev`, open the app, click **Diag** tab.

Expected: six pastel-filled cards with `+++` plus overlay, monospace titles wrapped in dashes (`---- SAFE AREA INSETS ----`), key/value rows readable, 1px black/white borders, no rounded corners. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/diagnostics-view.ts
git commit -m "refactor: render diagnostics with <diagnostic-card> sections"
```

---

## Task 8: Rewrite `app-top-bar` — rectangular chrome, bracketed status chip

**Files:**
- Modify: `src/components/app-top-bar.ts`

- [ ] **Step 1: Replace `src/components/app-top-bar.ts` with**

```ts
import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg);
    border: 1px solid var(--border);
    font-family: var(--font);
    color: var(--fg);
  }
  h1 { font-size: 14px; font-weight: 700; letter-spacing: 0.04em; }
  button.chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border: 1px solid var(--border);
    background: transparent;
    font-family: var(--font);
    font-size: 12px;
    color: var(--fg);
  }
  .swatch { width: 8px; height: 8px; border: 1px solid var(--border); background: var(--ok); }
  :host([status="update"])  .swatch { background: var(--warn); }
  :host([status="offline"]) .swatch { background: var(--off); }
`

class AppTopBar extends HTMLElement {
  static observedAttributes = ['status']
  private labelEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    this.labelEl = h('span', { class: 'label' }, '[ online ]')

    const chip = h('button', { class: 'chip', type: 'button' },
      h('span', { class: 'swatch' }),
      this.labelEl,
    )
    chip.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('check-update', { bubbles: true, composed: true }))
    })

    shadow.append(
      style(CSS),
      h('h1', {}, 'PWA LAYOUT DEMO'),
      chip,
    )
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'status') {
      this.labelEl.textContent =
        value === 'update'  ? '[ update ]'  :
        value === 'offline' ? '[ offline ]' :
                              '[ online ]'
    }
  }
}

customElements.define('app-top-bar', AppTopBar)
```

- [ ] **Step 2: Smoke-test**

Run: `npm run dev`, open app. Expected: top bar is a flat rectangle with 1px border, no shadow, no blur. Title `PWA LAYOUT DEMO` monospace. Status chip on the right reads `[ online ]` with a small square swatch. Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/app-top-bar.ts
git commit -m "refactor: give <app-top-bar> blueprint chrome and bracketed chip"
```

---

## Task 9: Rewrite `app-bottom-bar` — active tab gets dots overlay

**Files:**
- Modify: `src/components/app-bottom-bar.ts`

- [ ] **Step 1: Replace `src/components/app-bottom-bar.ts` with**

```ts
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
```

- [ ] **Step 2: Smoke-test**

Run: `npm run dev`. Expected: bottom bar is a flat rectangle, three tabs separated by full-height 1px dividers. Active tab has butter pastel background + dot pattern overlay. Inactive tabs are plain, uppercase monospace. Switching tabs moves the pattern. Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/app-bottom-bar.ts
git commit -m "refactor: give <app-bottom-bar> blueprint chrome and dot-pattern active tab"
```

---

## Task 10: Rewrite `app-update-banner`

**Files:**
- Modify: `src/components/app-update-banner.ts`

- [ ] **Step 1: Replace `src/components/app-update-banner.ts` with**

```ts
import { h, style } from '../lib/dom'

const CSS = `
  :host {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--pastel-blush);
    border: 1px solid var(--border);
    color: var(--fg);
    font-family: var(--font);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  :host([hidden]) { display: none; }
  :host::before {
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
  .label, .actions { position: relative; z-index: 1; }
  .actions { display: flex; gap: 8px; }
  button {
    padding: 4px 10px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--fg);
    font-family: var(--font);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  button.primary { background: var(--pastel-blush); }
`

class AppUpdateBanner extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    const reload = h('button', { class: 'primary', type: 'button' }, '[ RELOAD ]')
    reload.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reload-app', { bubbles: true, composed: true }))
    })

    const dismiss = h('button', { type: 'button' }, '[ DISMISS ]')
    dismiss.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dismiss-update', { bubbles: true, composed: true }))
    })

    shadow.append(
      style(CSS),
      h('span', { class: 'label' }, 'NEW VERSION AVAILABLE'),
      h('div', { class: 'actions' }, reload, dismiss),
    )
  }
}

customElements.define('app-update-banner', AppUpdateBanner)
```

- [ ] **Step 2: Smoke-test visibility manually**

The banner is hidden until an SW update is available. To force-render it during dev, run: `npm run dev`, open DevTools console, run:

```js
document.querySelector('app-update-banner').removeAttribute('hidden')
```

Expected: banner appears at top with blush background + dot pattern + two bracketed buttons. Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/app-update-banner.ts
git commit -m "refactor: give <app-update-banner> blueprint chrome and dot pattern"
```

---

## Task 11: Rewrite `about-view`

**Files:**
- Modify: `src/components/about-view.ts`

- [ ] **Step 1: Replace `src/components/about-view.ts` with**

```ts
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
```

- [ ] **Step 2: Smoke-test**

Run: `npm run dev`, open app, click **About** tab. Expected: list items are plain rectangles with 1px borders, no pastel fills, no pattern overlays, monospace everywhere. Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/about-view.ts
git commit -m "refactor: give <about-view> blueprint chrome without patterns"
```

---

## Task 12: Sweep `app.css` for stale chrome offsets

**Files:**
- Modify: `src/styles/app.css`

- [ ] **Step 1: Read the current file**

Run: `cat src/styles/app.css`

Note which rules reference `--radius`, `--radius-floating`, or shadow-related variables that we removed in Task 2.

- [ ] **Step 2: Update `src/styles/app.css` — remove stale references, keep layout**

Expected state after this task (overwrite file with this content):

```css
html, body {
  height: 100dvh;
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font);
}

app-shell {
  display: block;
  position: relative;
  height: 100dvh;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

app-content {
  display: block;
  height: 100%;
  margin: 0 16px;
}

app-top-bar,
app-bottom-bar,
app-update-banner {
  position: absolute;
  left: 12px;
  right: 12px;
  z-index: 10;
}

app-top-bar {
  top: calc(env(safe-area-inset-top) + 8px);
  padding: 10px 16px;
}

app-update-banner {
  top: calc(env(safe-area-inset-top) + 8px + 44px);
  padding: 8px 14px;
}

app-bottom-bar {
  bottom: calc(env(safe-area-inset-bottom) + 8px);
}
```

- [ ] **Step 3: Smoke-test full app**

Run: `npm run dev`. Go through every tab (Feed, Diag, About). Expected: consistent blueprint look, no overlap between top bar and first card, bottom bar clears the last card, no rounded corners anywhere. Toggle OS dark mode and confirm cyanotype (blue bg, white lines) with pastels unchanged. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/styles/app.css
git commit -m "refactor: update app.css offsets for rectangular chrome"
```

---

## Task 13: Full verification — tests, build, preview

**Files:** (no file changes)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including `tests/card-fill.test.ts` (4 tests) and `tests/diagnostics.test.ts`.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds, `dist/` contains `patterns/pattern-slashes.svg`, `patterns/pattern-plus.svg`, `patterns/pattern-dots.svg`.

Verify with:

```
ls dist/patterns
```

Expected output:

```
pattern-dots.svg
pattern-plus.svg
pattern-slashes.svg
```

- [ ] **Step 3: Preview production bundle and smoke test**

Run: `npm run preview`

Open the preview URL, visit Feed / Diag / About tabs, toggle system dark mode, confirm:
- Feed cards show `///` overlay
- Diagnostic cards show `+++` overlay
- Active bottom tab shows dot overlay
- About cards have no overlay
- All borders are 1px, all corners are sharp
- Pastels look identical across light/dark; only background + line color flip

Stop the preview server.

- [ ] **Step 4: Final commit (docs + plan move)**

Leave this for the human — moving the plan to `docs/plans/completed/` is the project's convention after the work ships.
