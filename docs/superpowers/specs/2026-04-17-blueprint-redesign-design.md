# Blueprint redesign — design spec

Redesign the PWA Layout Demo in an architectural-blueprint visual style: 1px black borders, zero corner radii, monospace type, pastel gradient fills on cards with SVG patterns laid over the gradients. Dark mode becomes a classic cyanotype (blue paper, white ink). Pastel colors stay the same across themes.

## Visual language

### Tokens (`src/styles/tokens.css`, full rewrite)

Light mode ("paper"):

| token             | value                                                 |
| ----------------- | ----------------------------------------------------- |
| `--bg`            | `#ffffff`                                             |
| `--fg`            | `#000000`                                             |
| `--border`        | `#000000`                                             |
| `--muted`         | `rgba(0, 0, 0, 0.6)`                                  |
| `--pattern-ink`   | `rgba(0, 0, 0, 0.5)`                                  |
| `--ok`            | `#16a34a`                                             |
| `--warn`          | `#d97706`                                             |
| `--off`           | `#6b7280`                                             |
| `--font`          | `ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace` |

Dark mode ("cyanotype"):

| token             | value                  |
| ----------------- | ---------------------- |
| `--bg`            | `#1d3a8a`              |
| `--fg`            | `#ffffff`              |
| `--border`        | `#ffffff`              |
| `--muted`         | `rgba(255, 255, 255, 0.7)` |
| `--pattern-ink`   | `rgba(255, 255, 255, 0.55)` |

Pastel palette (identical in both themes):

| token             | hex       | name   |
| ----------------- | --------- | ------ |
| `--pastel-peach`  | `#ffd9c2` | peach  |
| `--pastel-mint`   | `#c8efd6` | mint   |
| `--pastel-sky`    | `#cfe4f5` | sky    |
| `--pastel-lilac`  | `#e2d4f2` | lilac  |
| `--pastel-butter` | `#fff2c2` | butter |
| `--pastel-blush`  | `#f5d0dc` | blush  |

Removed tokens: `--surface`, `--surface-floating`, `--border-floating`, `--shadow-floating`, `--accent`, `--radius`, `--radius-floating`, `--float-gap`.

### Borders and corners

Every component: 1px solid `var(--border)`, `border-radius: 0`. All existing `border-radius`, `box-shadow`, and `backdrop-filter` declarations are removed.

### Typography

Every component uses `var(--font)` (monospace). Titles: uppercase + letter-spaced where they appear as section labels (e.g., `---- SAFE AREA INSETS ----`). Body copy stays sentence-case monospace.

## Pattern assets

Three seamless SVG tiles live in `public/patterns/`:

### `pattern-slashes.svg` (feed cards)

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path d="M-4 20 L20 -4 M0 24 L24 0 M4 28 L28 4"
        stroke="#000" stroke-width="1" fill="none"/>
</svg>
```

16×16 tile, three diagonals at 45°, 8px spacing.

### `pattern-plus.svg` (diagnostic cards)

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
  <path d="M10 5 V15 M5 10 H15" stroke="#000" stroke-width="1" fill="none"/>
</svg>
```

20×20 tile, one centered plus, 10px arms.

### `pattern-dots.svg` (active tab + update banner)

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
  <circle cx="4" cy="4" r="1" fill="#000"/>
</svg>
```

8×8 tile, single 2px-diameter dot per tile.

### Layering (bottom → top)

1. Pastel gradient fill (`background: linear-gradient(...)` or `radial-gradient(...)`)
2. Pattern layer — `::before` pseudo-element with `background: var(--pattern-ink)` and `-webkit-mask`/`mask: url("/patterns/<name>.svg") repeat`
3. 1px solid `var(--border)` rectangle
4. Content

One SVG serves both themes: mask color picks up `--pattern-ink`, which switches between semi-transparent black and semi-transparent white via `prefers-color-scheme`.

## Per-card fill config

### Types

```ts
type PastelToken =
  | 'peach' | 'mint' | 'sky' | 'lilac' | 'butter' | 'blush';

type GradientType =
  | 'linear-45'
  | 'linear-135'
  | 'linear-vertical'
  | 'linear-horizontal'
  | 'radial-tl'
  | 'radial-br'
  | 'radial-center';

type CardFill = {
  gradient: GradientType;
  from: PastelToken;
  to: PastelToken;
};
```

Pattern is not part of `CardFill` — it is bound to the card component (feed card → slashes, diagnostic card → plus).

### Propagation

Card components read `data-gradient`, `data-from`, `data-to` attributes and set matching CSS custom properties on the host:

- `--grad-bg` — full `background-image` string selected from a `gradientAngles` map keyed by `GradientType`
- `--grad-from`, `--grad-to` — resolved via `var(--pastel-<token>)`

CSS then reads `background: var(--grad-bg);` — no per-card stylesheet branching needed.

### Helper

`src/lib/card-fill.ts` exports:

- `gradientAngles: Record<GradientType, string>` — maps each gradient type to a CSS `linear-gradient(...)` / `radial-gradient(...)` template using the `--grad-from` and `--grad-to` variables
- `applyFill(element: HTMLElement, fill: CardFill): void` — sets the three custom properties on `element.style`

Both are pure functions, covered by unit tests in `tests/card-fill.test.ts`.

## Components

### `app-shell`

No visual changes — inherits the new tokens through the global stylesheet.

### `app-top-bar`

Rewrite the host styles:

- `background: var(--bg);` (opaque, matches page)
- `border: 1px solid var(--border);`
- no `border-radius`, no `box-shadow`, no `backdrop-filter`
- `h1` in monospace, 16px, no weight override (monospace bold if needed)

Status chip becomes rectangular:

- 1px solid `var(--border)`, no radius, no background
- Label text wrapped in brackets: `[ online ]`, `[ update ]`, `[ offline ]`
- 8×8px square swatch on the left filled with `var(--ok)` / `var(--warn)` / `var(--off)` and a 1px border; the round `.dot` rule is removed

### `app-bottom-bar`

- Host: solid background, 1px border, no radius, no shadow, no blur
- Three tab buttons separated by full-height 1px dividers (replace the current `top: 20%; bottom: 20%` inset with edge-to-edge)
- Inactive tab: plain, monospace, `var(--muted)` color, no background
- Active tab:
  - `background` uses `--pastel-butter` as a flat fill (no gradient)
  - `::before` overlay with `pattern-dots.svg` mask + `var(--pattern-ink)`
  - text color `var(--fg)`

Keep the existing `::before` dividers — but render them with `opacity: 1` on normal buttons, `opacity: 0` on the active tab and the tab immediately after. (Current logic survives.)

### `app-update-banner`

- Rectangular, 1px solid `var(--border)`, no radius, no shadow
- Fixed fill: `--pastel-blush` flat background + `pattern-dots.svg` overlay
- Monospace label text: `NEW VERSION AVAILABLE`
- Two buttons, each a 1px-bordered rectangle:
  - `[ RELOAD ]` — solid blush fill (same as banner), monospace
  - `[ DISMISS ]` — no fill, just border, monospace

### `feed-view` and new `feed-card`

Extract each feed item into a `<feed-card>` custom element (new file `src/components/feed-card.ts`).

`feed-card` attributes:

- `title` — card title
- `body` — card body text
- `height` — optional min-height
- `data-gradient`, `data-from`, `data-to` — fill config

`feed-card` shadow DOM:

- 1px `var(--border)`, no radius
- `::before` overlay with `pattern-slashes.svg` mask, `var(--pattern-ink)` fill
- Card body text: `var(--fg)` everywhere (pastels are light enough that dark text reads in both themes)

`feed-view` rewrites `SAMPLES`:

- Remove all existing saturated gradients and the `tone` / `gradient` string fields
- Every entry gets `{title, body, height, gradient, from, to}` using the new types
- Keep the current number of cards (17)

### `diagnostics-view` and new `diagnostic-card`

Extract each `<section>` into `<diagnostic-card>` (new file `src/components/diagnostic-card.ts`).

`diagnostic-card` attributes:

- `title` — section heading (e.g., `SAFE AREA INSETS`)
- `data-gradient`, `data-from`, `data-to` — fill config

Content is passed via a default slot — the component is a wrapper that provides gradient + pattern + border + title, and the parent (`diagnostics-view`) builds the rows as light-DOM children. Same shadow-DOM structure as `feed-card`, but uses `pattern-plus.svg` instead.

Section titles rendered with dash padding: `---- SAFE AREA INSETS ----`. Key/value rows already monospace-friendly; just switch to `var(--font)`.

`diagnostics-view` assigns a fixed fill to each of the six sections (hardcoded in the builder) so each renders with a stable, distinct pastel gradient.

### `about-view`

Same blueprint chrome as elsewhere but **no pattern fill** — about is informational, pastel noise would compete with the text.

- `h2` as `REQUIREMENTS` monospace uppercase
- `li` items: 1px `var(--border)` rectangle, plain `var(--bg)` background, no radius, no fill
- Keep the `<ol>` numbering; numbers render in monospace

### `app-content`

No visual change — still a scroll container. Its child margins already handle gap between cards.

## Files touched / added

Modified:

- `src/styles/tokens.css` — full rewrite
- `src/styles/app.css` — remove floating offsets that assumed rounded chrome (confirm `app-top-bar` / `app-bottom-bar` offsets still work with the new sizing)
- `src/components/app-top-bar.ts`
- `src/components/app-bottom-bar.ts`
- `src/components/app-update-banner.ts`
- `src/components/feed-view.ts` — switch to rendering `<feed-card>` elements; rewrite `SAMPLES`
- `src/components/diagnostics-view.ts` — switch to rendering `<diagnostic-card>` elements; assign fixed fills
- `src/components/about-view.ts`

Added:

- `public/patterns/pattern-slashes.svg`
- `public/patterns/pattern-plus.svg`
- `public/patterns/pattern-dots.svg`
- `src/components/feed-card.ts`
- `src/components/diagnostic-card.ts`
- `src/lib/card-fill.ts`
- `tests/card-fill.test.ts`

## Non-goals

- No new animations, transitions, or interaction states beyond what already exists
- No changes to service-worker, PWA manifest, or offline behavior
- No theming API — pastel palette and gradient types are fixed in code
- No accessibility regressions — contrast checks on pastel + dark text are part of implementation review
