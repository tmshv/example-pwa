# PWA template — core / demo split

**Date:** 2026-04-18
**Scope:** Reorganize `example-pwa` so reusable PWA-template code ("core") and the current demo implementation live in physically separate directories within the same repo.

## Purpose

The project is a PWA layout template. After the safe-area / viewport fix (`docs/pwa-layout.md`), the hard, reusable parts are well-understood and distinct from the demo-specific parts. This refactor makes the boundary visible in the file tree: future projects start by copying `src/core/` + the HTML / vite config root + `docs/pwa-layout.md`, and writing a new `src/app/`.

## Non-goals

- No publication of core as a separate artifact (no npm, no separate repo, no monorepo).
- No enforced API surface — no barrel files, no `index.ts` re-exports.
- No behavior changes. Pure reorganization (plus one small additional test).
- No visual redesign of the demo.

## Constraints

- The invariants in `docs/pwa-layout.md` must continue to hold after the refactor.
- `npx tsc -b` must pass.
- `npm test` must pass.
- `npm run build` must pass.
- The demo must still run and look identical in `npm run dev` and `npm run preview`.

## Decisions locked in during brainstorming

| Question | Decision |
|----------|----------|
| Distribution model | **Copy-in template.** No npm package, no monorepo. Core is a convention within the repo. |
| Folder layout | **Two sibling dirs: `src/core/` and `src/app/`.** Demo imports from `src/core/...` by path. |
| Panel ownership (top/bottom) | **Core owns only the shell + layout plumbing.** Top-bar, bottom-bar, update-banner, content-container are 100% demo. |
| Update UI ownership | **Core only exposes SW state callbacks and `reload()` / `checkForUpdate()`.** Demo owns the whole update UI response (banner, toast, whatever). |

## File / directory inventory

### `src/core/`

| File | Responsibility |
|------|----------------|
| `lib/insets.ts`          | Safe-area / viewport mirror → CSS custom properties + `localStorage`. |
| `lib/sw-register.ts`     | `initSW`, `reload()`, `checkForUpdate()`. |
| `lib/version-check.ts`   | Polls `/version.json`; fires once when a newer version appears. |
| `styles/reset.css`       | Minimal CSS reset. |
| `styles/layout.css`      | Structural only: `html, body` with height from `--app-h`, `margin`, `overflow`, `overscroll-behavior`, user-select / touch-action rules. **No theming (background / color / font-family)**, **no bar / banner / content selectors**. `.reload-overlay` CSS lives inline in `index.html <head>` (critical CSS), not here. |
| `components/app-shell.ts` + `.css` | `<app-shell>` custom element. Sets size (`var(--app-h)`), side safe-area padding, `position: relative`. No gradients, no child layout. |

### Root-level core assets (not under `src/core/`)

| File | Responsibility |
|------|----------------|
| `index.html`        | HTML skeleton: viewport meta (`viewport-fit=cover`), `apple-mobile-web-app-*` tags, critical inline `<style>` for `.reload-overlay`, critical inline `<script>` for localStorage → CSS vars, `<app-shell>`, `<div class="reload-overlay">`. Demo places its custom elements inside `<app-shell>`. |
| `vite.config.ts`    | PWA plugin config, `version.json` emitter, `__SW_VERSION__` define. |
| `docs/pwa-layout.md` | Invariants documentation. |

### `src/app/` — demo, replaceable per new project

| File | Responsibility |
|------|----------------|
| `main.ts`                                 | Wiring: imports core CSS + `<app-shell>`, calls `initInsets()`, registers SW, wires UI to `reload()`. |
| `components/app-top-bar.{ts,css}`         | Title + status chip. |
| `components/app-bottom-bar.{ts,css}`      | Three-tab bottom nav. |
| `components/app-update-banner.{ts,css}`   | Update prompt UI. |
| `components/app-content.{ts,css}`         | Scroll container — padding uses `var(--sai-*)` from core + its own bar-height offset. |
| `components/feed-*.{ts,css}`, `about-view.{ts,css}`, `diagnostics-view.{ts,css}` | Views. |
| `lib/diagnostics.ts`                      | State observer powering `diagnostics-view`. |
| `lib/dom.ts`, `lib/card-fill.ts`          | Demo helpers. |
| `styles/tokens.css`                       | Pastel color palette + font. |
| `styles/layout.css`                       | Demo-owned layout rules: bar / banner positioning, `app-content` padding. |

### Shared / root-level

| File | Status |
|------|--------|
| `src/global.d.ts`    | Stays at `src/global.d.ts` — referenced by tsconfig. |
| `public/patterns/*.svg`, `public/icon-*.png`, `public/icon.svg` | Demo-specific assets; stay in `public/` (vite convention). |
| `tests/*`            | Stay at `tests/`. |

## Core API surface

### JS exports

```ts
// src/core/lib/insets.ts
export function initInsets(): void
```
Idempotent setup. Must be called once, before any layout-touching code. Writes `--sai-{top,right,bottom,left}` and `--app-h` to `<html>.style` and persists snapshots to `localStorage['insets-v1']`.

```ts
// src/core/lib/sw-register.ts
export type SwState = 'idle' | 'update-available' | 'offline-ready'
export type SwControl = {
  reload(): Promise<void>
  checkForUpdate(): Promise<boolean>
}
export function initSW(onState: (s: SwState) => void): SwControl
```
Registers the service worker via `virtual:pwa-register`. `onState` fires on status transitions. Demo decides what UI to show on `update-available`. Demo calls `swControl.reload()` when the user accepts.

```ts
// src/core/lib/version-check.ts
export function initVersionCheck(
  onUpdateAvailable: () => void
): { check: () => Promise<void> }
```
Polls `/version.json` every 30 s and on `visibilitychange`. Fires the callback once per session.

```ts
// src/core/components/app-shell.ts
// side-effect import — registers <app-shell> custom element
```

### CSS custom properties set by core

| Property       | Value            | Source                                |
|----------------|------------------|---------------------------------------|
| `--sai-top`    | `{n}px`          | `env(safe-area-inset-top)` via probe  |
| `--sai-right`  | `{n}px`          | `env(safe-area-inset-right)` via probe |
| `--sai-bottom` | `{n}px`          | `env(safe-area-inset-bottom)` via probe |
| `--sai-left`   | `{n}px`          | `env(safe-area-inset-left)` via probe |
| `--app-h`      | `{n}px`          | `visualViewport.height ?? innerHeight` |

All five are set once synchronously on start (from `localStorage` cache, by the inline `<script>`) and again on every `resize` / `visualViewport.resize` (by `initInsets()` in JS).

### HTML contracts (in `index.html`)

- `<head>` contains the synchronous inline `<script>` that reads `localStorage['insets-v1']` and applies the cached per-orientation snapshot. Must be before any stylesheet and before `<body>`.
- `<head>` contains a `<style>` with `.reload-overlay` rules (critical CSS).
- `<body>` contains exactly one `<app-shell>` and exactly one `<div class="reload-overlay">`.
- Viewport meta includes `viewport-fit=cover`.

### Reload-overlay contract

Demo shows / hides the overlay with `element.hidden = true | false`. Core ships it visible by default; demo hides it after `load + rAF`, and re-shows it when triggering `swControl.reload()`.

### What core explicitly does NOT provide

- No top-bar, bottom-bar, update-banner, content-container, or design tokens.
- No `<app-shell>` slots or children contract — shell is an inert container.
- No events, no EventTarget — all communication is callbacks and direct function calls.
- No barrel `index.ts`. Demo imports from `src/core/...` by path.

## The invariant demo must respect

CSS anywhere in `src/app/` must use `var(--sai-X, env(safe-area-inset-X, 0px))` and `var(--app-h, 100dvh)` — **not raw `env()` or `100dvh`**. Violating this reintroduces the reload-layout bug. Full rationale in `docs/pwa-layout.md`.

## Minimum viable demo (reference)

```ts
// src/app/main.ts
import '../core/styles/reset.css'
import '../core/styles/layout.css'
import '../core/components/app-shell'

import { initInsets }       from '../core/lib/insets'
import { initSW }           from '../core/lib/sw-register'
import { initVersionCheck } from '../core/lib/version-check'

initInsets()

const overlay = document.querySelector('.reload-overlay') as HTMLElement
const hide = () => { overlay.hidden = true }
if (document.readyState === 'complete') requestAnimationFrame(hide)
else window.addEventListener('load', () => requestAnimationFrame(hide), { once: true })

const sw = initSW((state) => {
  if (state === 'update-available') {
    // demo UI: banner / toast / auto-reload / etc.
  }
})

initVersionCheck(async () => {
  await sw.checkForUpdate()
})

// When demo UI asks to reload:
// overlay.hidden = false; sw.reload()
```

## Migration plan (file moves)

Mostly moves; two content-level edits.

### Moves

| From | To |
|------|-----|
| `src/lib/insets.ts`                   | `src/core/lib/insets.ts` |
| `src/lib/sw-register.ts`              | `src/core/lib/sw-register.ts` |
| `src/lib/version-check.ts`            | `src/core/lib/version-check.ts` |
| `src/styles/reset.css`                | `src/core/styles/reset.css` |
| `src/components/app-shell.ts`         | `src/core/components/app-shell.ts` |
| `src/components/app-shell.css`        | `src/core/components/app-shell.css` |
| `src/main.ts`                         | `src/app/main.ts` |
| `src/components/app-top-bar.*`        | `src/app/components/app-top-bar.*` |
| `src/components/app-bottom-bar.*`     | `src/app/components/app-bottom-bar.*` |
| `src/components/app-update-banner.*`  | `src/app/components/app-update-banner.*` |
| `src/components/app-content.*`        | `src/app/components/app-content.*` |
| `src/components/feed-card.*`          | `src/app/components/feed-card.*` |
| `src/components/feed-view.ts`         | `src/app/components/feed-view.ts` |
| `src/components/about-view.*`         | `src/app/components/about-view.*` |
| `src/components/diagnostics-view.*`   | `src/app/components/diagnostics-view.*` |
| `src/lib/card-fill.ts`                | `src/app/lib/card-fill.ts` |
| `src/lib/diagnostics.ts`              | `src/app/lib/diagnostics.ts` |
| `src/lib/dom.ts`                      | `src/app/lib/dom.ts` |
| `src/styles/tokens.css`               | `src/app/styles/tokens.css` |

### Content edits

- **Split `src/styles/layout.css`:**
  - `html, body` — **split along structural / themed lines**:
    - Structural half → `src/core/styles/layout.css`: `height: var(--app-h, 100dvh)`, `margin`, `overflow`, `overscroll-behavior`, all user-select / touch-callout / touch-action rules.
    - Themed half → `src/app/styles/layout.css`: `background: var(--bg)`, `color: var(--fg)`, `font-family: var(--font)`. Same `html, body` selector; the two rules merge cleanly in the cascade.
  - `app-top-bar`, `app-bottom-bar`, `app-update-banner` positioning and padding → `src/app/styles/layout.css`.
  - `app-content { margin: 0 16px }` → `src/app/styles/layout.css`.
  - `feed-view, about-view, diagnostics-view` display-block group → `src/app/styles/layout.css`.
  - Demo `main.ts` imports `./styles/layout.css`.
  - The `.reload-overlay` CSS rule is NOT in either `layout.css` — it's already inline in `index.html <head>` (critical CSS). No change.
- **`src/app/main.ts`:** update all import paths to `../core/...` and `./components/...` etc.
- **`index.html`:** update the `<script type="module" src="/src/main.ts">` reference to `/src/app/main.ts`.
- **`tsconfig.json`:** verify `include` still catches the new paths (it matches `src/**/*` by convention — should need no change, but must verify).

### No changes

- `index.html` head content (meta, inline style, inline script) — unchanged.
- `vite.config.ts` — unchanged.
- `public/` — unchanged.
- `docs/pwa-layout.md` — unchanged.
- Test files — unchanged.

## Testing

- Existing tests (`tests/card-fill.test.ts`, `tests/diagnostics.test.ts`) cover demo code. Keep in `tests/` at repo root; update import paths to point at `src/app/...`.
- Add one new test: `tests/core/insets.test.ts`. Calls `initInsets()`, asserts that `--sai-top`, `--sai-bottom`, `--app-h` are written to `document.documentElement.style`, and that `localStorage['insets-v1']` is populated with the current-orientation snapshot. Protects the load-bearing API.

## Verification gates before merge

- `npx tsc -b` clean.
- `npm test` clean.
- `npm run build` succeeds.
- Manual check: `npm run dev` renders the current demo identically.
- Manual check: install as PWA on iOS and Android, trigger update, click reload — layout does not break. (User verifies; Claude cannot verify on-device.)

## Known risks

- The demo's `layout.css` split is the only non-mechanical content change. Missing a selector on the wrong side of the split would break the demo layout. Mitigation: the split is small (few rules) and the visual regression is obvious on first `npm run dev`.
- `main.ts`'s import paths are numerous; a single missed path breaks the build. Mitigation: `tsc -b` catches these.

## Out of scope (future work, not in this refactor)

- Renaming / cleaning component names (e.g., `app-top-bar` could become `demo-top-bar` to emphasize ownership). Deferred.
- Adding a "how to start a new project from this template" README at the repo root. Deferred.
- Extracting `vite.config.ts`'s PWA plugin config into a helper. Unnecessary at this scale.
