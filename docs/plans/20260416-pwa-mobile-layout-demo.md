# PWA Mobile Layout Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reference mobile PWA that demonstrates correct safe-area handling, overscroll containment, `100dvh` layout, offline support, and an update-available prompt on iOS 26+ and Android 16+.

**Architecture:** Vite 8 + TypeScript + native Web Components. `<app-shell>` is a light-DOM grid container owning the page layout; other components are autonomous custom elements with Shadow DOM that communicate via DOM events. PWA behavior comes from `vite-plugin-pwa` in `registerType: 'prompt'` mode. A shared `Diagnostics` class exposes live safe-area insets, viewport sizes, SW state, and online status to `<diagnostics-view>` and the top-bar status chip. **No element uses innerHTML assignment** — shadow trees are built programmatically via an `h()` / `style()` helper in `src/lib/dom.ts`.

**Tech Stack:** Vite 8, TypeScript 5, native Web Components, `vite-plugin-pwa` (Workbox `generateSW`), Vitest + jsdom (unit tests on diagnostics logic).

**Spec reference:** `docs/superpowers/specs/2026-04-16-pwa-mobile-layout-demo-design.md`

---

## File Structure

```
package.json
tsconfig.json
vite.config.ts
index.html
.gitignore
src/
  main.ts
  global.d.ts
  styles/
    reset.css
    tokens.css
    app.css
  components/
    app-shell.ts
    app-top-bar.ts
    app-bottom-bar.ts
    app-content.ts
    app-update-banner.ts
    feed-view.ts
    diagnostics-view.ts
    about-view.ts
  lib/
    dom.ts
    diagnostics.ts
    sw-register.ts
tests/
  diagnostics.test.ts
```

Responsibility per file:

| File                                  | Responsibility                                                      |
| ------------------------------------- | ------------------------------------------------------------------- |
| `package.json`                        | Scripts, dependencies                                               |
| `tsconfig.json`                       | TypeScript compiler config                                          |
| `vite.config.ts`                      | Vite + vite-plugin-pwa + Vitest config, `__SW_VERSION__` define     |
| `index.html`                          | Viewport meta, theme-color metas, app-shell DOM                     |
| `src/main.ts`                         | Imports styles + components, bootstraps content, wires SW           |
| `src/global.d.ts`                     | Types for `__SW_VERSION__` and `virtual:pwa-register`               |
| `src/styles/reset.css`                | Minimal CSS reset                                                   |
| `src/styles/tokens.css`               | CSS custom properties (light + dark)                                |
| `src/styles/app.css`                  | Global layout, `<app-shell>` grid, selection/overscroll rules       |
| `src/lib/dom.ts`                      | `h()` + `style()` helpers for programmatic DOM construction         |
| `src/lib/diagnostics.ts`              | `Diagnostics` class — snapshot + subscribe API                      |
| `src/lib/sw-register.ts`              | Wraps `virtual:pwa-register`                                        |
| `src/components/app-shell.ts`         | Light-DOM grid container, tab routing, SW attribute toggling        |
| `src/components/app-top-bar.ts`       | Title + tappable status chip                                        |
| `src/components/app-bottom-bar.ts`    | 3 tab buttons, emits `tab-change`                                   |
| `src/components/app-content.ts`       | Shadow-DOM scroll container with a default slot                     |
| `src/components/app-update-banner.ts` | Reload / Dismiss buttons                                            |
| `src/components/feed-view.ts`         | Placeholder card feed (varied heights)                              |
| `src/components/about-view.ts`        | Static list of requirements and how to verify them                  |
| `src/components/diagnostics-view.ts`  | Live diagnostics cards bound to shared Diagnostics instance         |
| `tests/diagnostics.test.ts`           | Unit tests for pure helpers in `diagnostics.ts`                     |

---

## Task 1: Bootstrap the project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [x] **Step 1: Create `package.json`**

```json
{
  "name": "example-pwa-layout",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "jsdom": "^25.0.0",
    "typescript": "^5.6.0",
    "vite": "^8.0.0",
    "vite-plugin-pwa": "^0.22.0",
    "vitest": "^3.0.0"
  }
}
```

- [x] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite-plugin-pwa/client", "vitest/globals"]
  },
  "include": ["src", "tests", "vite.config.ts"]
}
```

- [x] **Step 3: Create `.gitignore`**

```
node_modules
dist
dev-dist
.DS_Store
*.log
```

- [x] **Step 4: Install dependencies**

Run: `npm install`
Expected: packages installed; `node_modules/` populated; `package-lock.json` created.

- [x] **Step 5: Initialize git and commit**

```bash
git init
git add package.json package-lock.json tsconfig.json .gitignore
git commit -m "Bootstrap Vite + TS project"
```

---

## Task 2: Configure Vite, PWA plugin, and Vitest

**Files:**
- Create: `vite.config.ts`
- Create: `src/global.d.ts`

- [x] **Step 1: Create `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

const SW_VERSION = new Date().toISOString()

export default defineConfig({
  define: {
    __SW_VERSION__: JSON.stringify(SW_VERSION),
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'PWA Layout Demo',
        short_name: 'Layout',
        description: 'Mobile PWA layout reference',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0b0c',
        theme_color: '#0b0b0c',
        start_url: '/',
        scope: '/',
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
```

- [x] **Step 2: Create `src/global.d.ts`**

```ts
declare const __SW_VERSION__: string

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegisteredSW?: (swScriptUrl: string, registration?: ServiceWorkerRegistration) => void
    onRegisterError?: (error: unknown) => void
  }
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}
```

- [x] **Step 3: Commit**

```bash
git add vite.config.ts src/global.d.ts
git commit -m "Configure Vite, vite-plugin-pwa, and Vitest (jsdom)"
```

---

## Task 3: `index.html` with viewport and PWA meta tags

**Files:**
- Create: `index.html`

- [x] **Step 1: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>PWA Layout Demo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)">
  </head>
  <body>
    <app-shell>
      <app-top-bar></app-top-bar>
      <app-update-banner hidden></app-update-banner>
      <app-content></app-content>
      <app-bottom-bar></app-bottom-bar>
    </app-shell>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [x] **Step 2: Commit**

```bash
git add index.html
git commit -m "Add index.html with PWA viewport and theme-color metas"
```

---

## Task 4: Reset, tokens, and global styles

**Files:**
- Create: `src/styles/reset.css`
- Create: `src/styles/tokens.css`
- Create: `src/styles/app.css`

- [x] **Step 1: Write `src/styles/reset.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
input, textarea, select { font: inherit; }
```

- [x] **Step 2: Write `src/styles/tokens.css`**

```css
:root {
  --bg:      #fafafa;
  --surface: #ffffff;
  --fg:      #0b0b0c;
  --muted:   #6b7280;
  --accent:  #2563eb;
  --border:  rgba(0, 0, 0, 0.08);
  --ok:      #16a34a;
  --warn:    #d97706;
  --off:     #6b7280;
  --font:    system-ui, -apple-system, sans-serif;
  --radius:  10px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:      #0b0b0c;
    --surface: #15151a;
    --fg:      #f5f5f7;
    --muted:   #9ca3af;
    --accent:  #60a5fa;
    --border:  rgba(255, 255, 255, 0.08);
    --ok:      #22c55e;
    --warn:    #fbbf24;
    --off:     #9ca3af;
  }
}
```

- [x] **Step 3: Write `src/styles/app.css`**

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
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100dvh;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

app-shell[update-available] {
  grid-template-rows: auto auto 1fr auto;
}
```

- [x] **Step 4: Commit**

```bash
git add src/styles
git commit -m "Add reset, design tokens, and global layout styles"
```

---

## Task 5: DOM helpers — `src/lib/dom.ts`

Every component builds its shadow tree through these helpers. **We never assign to `.innerHTML`** — instead we construct elements programmatically and set text via `textContent`. This eliminates an entire class of XSS bugs and keeps the code uniform.

**Files:**
- Create: `src/lib/dom.ts`

- [x] **Step 1: Write `src/lib/dom.ts`**

```ts
type Child = Node | string

export function h(
  tag: string,
  props: Record<string, string> = {},
  ...children: Child[]
): HTMLElement {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) {
    el.setAttribute(k, v)
  }
  for (const child of children) {
    el.append(typeof child === 'string' ? document.createTextNode(child) : child)
  }
  return el
}

export function style(css: string): HTMLStyleElement {
  const el = document.createElement('style')
  el.textContent = css
  return el
}
```

- [x] **Step 2: Commit**

```bash
git add src/lib/dom.ts
git commit -m "Add h() and style() DOM helpers"
```

---

## Task 6: `<app-shell>` — light-DOM grid container

**Files:**
- Create: `src/components/app-shell.ts`

- [x] **Step 1: Write `src/components/app-shell.ts`**

```ts
export type Tab = 'feed' | 'diagnostics' | 'about'

class AppShell extends HTMLElement {
  private currentTab: Tab = 'feed'

  connectedCallback() {
    this.addEventListener('tab-change', (e) => {
      const tab = (e as CustomEvent<Tab>).detail
      this.setActiveTab(tab)
    })

    this.addEventListener('sw-state', (e) => {
      const state = (e as CustomEvent<string>).detail
      if (state === 'update-available') {
        this.toggleAttribute('update-available', true)
        this.querySelector('app-update-banner')?.removeAttribute('hidden')
      }
    })

    this.addEventListener('dismiss-update', () => {
      this.toggleAttribute('update-available', false)
      this.querySelector('app-update-banner')?.setAttribute('hidden', '')
    })
  }

  private setActiveTab(tab: Tab) {
    if (this.currentTab === tab) return
    this.currentTab = tab
    const content = this.querySelector('app-content') as HTMLElement | null
    if (!content) return
    content.replaceChildren(document.createElement(`${tab}-view`))
    this.querySelector('app-bottom-bar')?.setAttribute('active-tab', tab)
  }
}

customElements.define('app-shell', AppShell)
```

- [x] **Step 2: Commit**

```bash
git add src/components/app-shell.ts
git commit -m "Add <app-shell> with tab routing and SW state handling"
```

---

## Task 7: `<app-top-bar>` — title + status chip

**Files:**
- Create: `src/components/app-top-bar.ts`

- [x] **Step 1: Write `src/components/app-top-bar.ts`**

```ts
import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    padding-top: calc(env(safe-area-inset-top) + 8px);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  h1 { font-size: 17px; font-weight: 600; }
  button.chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    font-size: 12px;
    color: var(--muted);
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ok); }
  :host([status="update"])  .dot { background: var(--warn); }
  :host([status="offline"]) .dot { background: var(--off); }
`

class AppTopBar extends HTMLElement {
  static observedAttributes = ['status']
  private labelEl: HTMLElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    this.labelEl = h('span', { class: 'label' }, 'online')

    const chip = h('button', { class: 'chip', type: 'button' },
      h('span', { class: 'dot' }),
      this.labelEl,
    )
    chip.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('tab-change', {
        detail: 'diagnostics',
        bubbles: true,
        composed: true,
      }))
    })

    shadow.append(
      style(CSS),
      h('h1', {}, 'PWA Layout Demo'),
      chip,
    )
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'status') {
      this.labelEl.textContent =
        value === 'update'  ? 'update'  :
        value === 'offline' ? 'offline' :
                              'online'
    }
  }
}

customElements.define('app-top-bar', AppTopBar)
```

- [x] **Step 2: Commit**

```bash
git add src/components/app-top-bar.ts
git commit -m "Add <app-top-bar> with title and status chip"
```

---

## Task 8: `<app-bottom-bar>` — 3 tabs

**Files:**
- Create: `src/components/app-bottom-bar.ts`

- [x] **Step 1: Write `src/components/app-bottom-bar.ts`**

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
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom);
  }
  button { padding: 10px 0 12px; font-size: 11px; color: var(--muted); }
  button[data-active="true"] { color: var(--accent); font-weight: 600; }
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
      }, tab.label) as HTMLButtonElement
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

- [x] **Step 2: Commit**

```bash
git add src/components/app-bottom-bar.ts
git commit -m "Add <app-bottom-bar> with three tabs"
```

---

## Task 9: `<app-content>` — scroll container

**Files:**
- Create: `src/components/app-content.ts`

- [x] **Step 1: Write `src/components/app-content.ts`**

```ts
import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: block;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
  }
`

class AppContent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(style(CSS), h('slot'))
  }
}

customElements.define('app-content', AppContent)
```

- [x] **Step 2: Commit**

```bash
git add src/components/app-content.ts
git commit -m "Add <app-content> scroll container"
```

---

## Task 10: `<app-update-banner>` — Reload / Dismiss

**Files:**
- Create: `src/components/app-update-banner.ts`

- [x] **Step 1: Write `src/components/app-update-banner.ts`**

```ts
import { h, style } from '../lib/dom'

const CSS = `
  :host {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--accent);
    color: white;
    font-size: 14px;
  }
  :host([hidden]) { display: none; }
  .actions { display: flex; gap: 12px; }
  button {
    padding: 4px 8px;
    border-radius: 6px;
    color: white;
    font-weight: 600;
  }
  button.primary { background: rgba(255, 255, 255, 0.2); }
`

class AppUpdateBanner extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    const reload = h('button', { class: 'primary', type: 'button' }, 'Reload')
    reload.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reload-app', { bubbles: true, composed: true }))
    })

    const dismiss = h('button', { type: 'button' }, 'Dismiss')
    dismiss.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dismiss-update', { bubbles: true, composed: true }))
    })

    shadow.append(
      style(CSS),
      h('span', {}, 'New version available'),
      h('div', { class: 'actions' }, reload, dismiss),
    )
  }
}

customElements.define('app-update-banner', AppUpdateBanner)
```

- [x] **Step 2: Commit**

```bash
git add src/components/app-update-banner.ts
git commit -m "Add <app-update-banner> with reload and dismiss actions"
```

---

## Task 11: `<feed-view>` — realistic card feed

**Files:**
- Create: `src/components/feed-view.ts`

- [x] **Step 1: Write `src/components/feed-view.ts`**

```ts
import { h, style } from '../lib/dom'

const SAMPLES: Array<{ title: string; body: string; height: number }> = [
  { title: 'Good morning',      body: 'Here is what is happening today.',             height: 140 },
  { title: 'Trending now',      body: 'Three stories worth your attention.',          height: 180 },
  { title: 'Weather',           body: 'Partly cloudy, 18°C, light breeze.',           height: 110 },
  { title: 'For you',           body: 'Picked based on recent activity.',             height: 220 },
  { title: 'From the team',     body: 'Release notes for v1.2 are live.',             height: 160 },
  { title: 'Offline-friendly',  body: 'All of this is cached by the service worker.', height: 150 },
  { title: 'Safe-area demo',    body: 'Scroll to the bottom — the bar never clips.',  height: 200 },
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
```

- [x] **Step 2: Commit**

```bash
git add src/components/feed-view.ts
git commit -m "Add <feed-view> with sample cards"
```

---

## Task 12: `<about-view>` — requirement list

**Files:**
- Create: `src/components/about-view.ts`

- [x] **Step 1: Write `src/components/about-view.ts`**

```ts
import { h, style } from '../lib/dom'

const REQUIREMENTS: Array<[string, string]> = [
  ['Works on iOS 26+ and Android 16+', 'Open on both platforms; everything below should be observable.'],
  ['No text selection',                'Long-press anywhere — no selection highlight or callout menu appears.'],
  ['No rubber-band overscroll',        'Drag past the top or bottom of the feed — no stretch, no bounce.'],
  ['No browser UI controls',           'Diagnostics tab → Display mode card shows standalone: true.'],
  ['Works offline',                    'Enable airplane mode and relaunch — the app loads and stays usable.'],
  ['Update prompt',                    'After a new deploy, the top banner appears with Reload and Dismiss.'],
  ['Safe areas',                       'Diagnostics tab → Safe area card shows non-zero insets on notched devices.'],
  ['Full-height content',              'Diagnostics tab → Viewport card shows measured 100dvh equals innerHeight.'],
  ['Pinned top/bottom bars',           'Scroll the feed — top and bottom bars never move.'],
]

const CSS = `
  :host { display: block; padding: 16px; }
  h2 { font-size: 17px; font-weight: 600; margin-bottom: 12px; }
  ol { list-style: decimal inside; }
  li {
    margin-bottom: 14px;
    padding: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  strong { display: block; margin-bottom: 4px; }
  span   { color: var(--muted); font-size: 13px; }
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
      h('h2', {}, 'Requirements'),
      list,
    )
  }
}

customElements.define('about-view', AboutView)
```

- [x] **Step 2: Commit**

```bash
git add src/components/about-view.ts
git commit -m "Add <about-view> with requirement list"
```

---

## Task 13: Diagnostics library with unit tests (TDD)

**Files:**
- Create: `src/lib/diagnostics.ts`
- Test: `tests/diagnostics.test.ts`

- [x] **Step 1: Write the failing test first**

Create `tests/diagnostics.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { readInsetsFromProbe, computeColorScheme } from '../src/lib/diagnostics'

describe('readInsetsFromProbe', () => {
  it('parses pixel paddings into integers', () => {
    const probe = document.createElement('div')
    probe.style.paddingTop = '20px'
    probe.style.paddingRight = '0px'
    probe.style.paddingBottom = '34px'
    probe.style.paddingLeft = '10px'
    document.body.appendChild(probe)

    const insets = readInsetsFromProbe(probe)
    expect(insets).toEqual({ top: 20, right: 0, bottom: 34, left: 10 })

    document.body.removeChild(probe)
  })
})

describe('computeColorScheme', () => {
  it('returns "dark" when prefers-color-scheme matches dark', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
      matches: true,
    } as unknown as MediaQueryList))
    expect(computeColorScheme()).toBe('dark')
    spy.mockRestore()
  })

  it('returns "light" when prefers-color-scheme does not match dark', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
      matches: false,
    } as unknown as MediaQueryList))
    expect(computeColorScheme()).toBe('light')
    spy.mockRestore()
  })
})
```

- [x] **Step 2: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — `Cannot find module '../src/lib/diagnostics'` or `readInsetsFromProbe is not a function`.

- [x] **Step 3: Write `src/lib/diagnostics.ts` to make tests pass**

```ts
export interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface DiagnosticsSnapshot {
  insets: Insets
  innerHeight: number
  innerWidth: number
  visualHeight: number
  dvh: number
  dpr: number
  standalone: boolean
  online: boolean
  colorScheme: 'light' | 'dark'
  swState: 'idle' | 'update-available' | 'offline-ready'
  swVersion: string
  scrollTop: number
  scrollMax: number
  ua: string
  platform: string
}

export function readInsetsFromProbe(probe: HTMLElement): Insets {
  const cs = getComputedStyle(probe)
  return {
    top:    parseInt(cs.paddingTop,    10) || 0,
    right:  parseInt(cs.paddingRight,  10) || 0,
    bottom: parseInt(cs.paddingBottom, 10) || 0,
    left:   parseInt(cs.paddingLeft,   10) || 0,
  }
}

export function computeColorScheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type Listener = (snap: DiagnosticsSnapshot) => void

export class Diagnostics {
  private insetProbe: HTMLElement
  private dvhProbe: HTMLElement
  private listeners = new Set<Listener>()
  private rafPending = false
  private swState: DiagnosticsSnapshot['swState'] = 'idle'
  private contentEl: HTMLElement | null = null

  constructor() {
    this.insetProbe = document.createElement('div')
    this.insetProbe.style.cssText = `
      position: fixed; top: 0; left: 0; width: 0; height: 0;
      pointer-events: none; visibility: hidden;
      padding-top: env(safe-area-inset-top);
      padding-right: env(safe-area-inset-right);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
    `
    document.body.appendChild(this.insetProbe)

    this.dvhProbe = document.createElement('div')
    this.dvhProbe.style.cssText = `
      position: fixed; top: 0; left: 0; width: 0; height: 100dvh;
      pointer-events: none; visibility: hidden;
    `
    document.body.appendChild(this.dvhProbe)

    const schedule = () => this.schedule()
    window.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    window.addEventListener('online', schedule)
    window.addEventListener('offline', schedule)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', schedule)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', schedule)
  }

  setContent(el: HTMLElement) {
    this.contentEl = el
    el.addEventListener('scroll', () => this.schedule(), { passive: true })
  }

  setSwState(state: DiagnosticsSnapshot['swState']) {
    this.swState = state
    this.schedule()
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    fn(this.getSnapshot())
    return () => { this.listeners.delete(fn) }
  }

  getSnapshot(): DiagnosticsSnapshot {
    const content = this.contentEl
    const scrollTop = content?.scrollTop ?? 0
    const scrollMax = content ? content.scrollHeight - content.clientHeight : 0
    const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
    return {
      insets:       readInsetsFromProbe(this.insetProbe),
      innerHeight:  window.innerHeight,
      innerWidth:   window.innerWidth,
      visualHeight: window.visualViewport?.height ?? window.innerHeight,
      dvh:          Math.round(this.dvhProbe.getBoundingClientRect().height),
      dpr:          window.devicePixelRatio,
      standalone:   window.matchMedia('(display-mode: standalone)').matches,
      online:       navigator.onLine,
      colorScheme:  computeColorScheme(),
      swState:      this.swState,
      swVersion:    __SW_VERSION__,
      scrollTop,
      scrollMax,
      ua:           navigator.userAgent,
      platform:     uaData?.platform ?? 'unknown',
    }
  }

  private schedule() {
    if (this.rafPending) return
    this.rafPending = true
    requestAnimationFrame(() => {
      this.rafPending = false
      const snap = this.getSnapshot()
      this.listeners.forEach((fn) => fn(snap))
    })
  }
}
```

- [x] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS — 3 tests passing.

- [x] **Step 5: Commit**

```bash
git add src/lib/diagnostics.ts tests/diagnostics.test.ts
git commit -m "Add Diagnostics class with unit tests for pure helpers"
```

---

## Task 14: `<diagnostics-view>` — live cards

**Files:**
- Create: `src/components/diagnostics-view.ts`

- [x] **Step 1: Write `src/components/diagnostics-view.ts`**

```ts
import { h, style } from '../lib/dom'
import { Diagnostics, type DiagnosticsSnapshot } from '../lib/diagnostics'

let sharedDiagnostics: Diagnostics | null = null
export function getDiagnostics(): Diagnostics {
  if (!sharedDiagnostics) sharedDiagnostics = new Diagnostics()
  return sharedDiagnostics
}

function row(label: string, value: string): HTMLElement {
  return h('div', { class: 'row' },
    h('span', { class: 'k' }, label),
    h('span', { class: 'v' }, value),
  )
}

function section(title: string, ...rows: HTMLElement[]): HTMLElement {
  return h('section', {},
    h('h3', {}, title),
    ...rows,
  )
}

function build(snap: DiagnosticsSnapshot): DocumentFragment {
  const frag = document.createDocumentFragment()

  frag.append(
    section('Safe area insets',
      row('top',    snap.insets.top    + 'px'),
      row('right',  snap.insets.right  + 'px'),
      row('bottom', snap.insets.bottom + 'px'),
      row('left',   snap.insets.left   + 'px'),
    ),
    section('Viewport',
      row('innerWidth × innerHeight', snap.innerWidth + ' × ' + snap.innerHeight),
      row('visualViewport.height',    snap.visualHeight + 'px'),
      row('100dvh (measured)',        snap.dvh + 'px'),
      row('devicePixelRatio',         String(snap.dpr)),
    ),
    section('Display mode',
      row('standalone',   String(snap.standalone)),
      row('color scheme', snap.colorScheme),
    ),
    section('Network and SW',
      row('online',    String(snap.online)),
      row('swState',   snap.swState),
      row('swVersion', snap.swVersion),
    ),
    section('Scroll',
      row('scrollTop', snap.scrollTop + 'px'),
      row('scrollMax', snap.scrollMax + 'px'),
    ),
  )

  const platform = section('Platform',
    row('platform', snap.platform),
  )
  platform.append(
    h('div', { class: 'row wrap' },
      h('span', { class: 'k' }, 'ua'),
      h('span', { class: 'v small' }, snap.ua),
    ),
  )
  frag.append(platform)

  return frag
}

const CSS = `
  :host { display: block; padding: 12px 12px 32px; }
  section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
    margin-bottom: 12px;
  }
  h3 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
  .row.wrap { flex-direction: column; gap: 4px; }
  .k { color: var(--muted); }
  .v { font-variant-numeric: tabular-nums; }
  .v.small { font-size: 11px; word-break: break-all; color: var(--muted); }
`

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

- [x] **Step 2: Commit**

```bash
git add src/components/diagnostics-view.ts
git commit -m "Add <diagnostics-view> bound to shared Diagnostics instance"
```

---

## Task 15: SW register wrapper and `main.ts` wiring

**Files:**
- Create: `src/lib/sw-register.ts`
- Create: `src/main.ts`

- [x] **Step 1: Write `src/lib/sw-register.ts`**

```ts
import { registerSW } from 'virtual:pwa-register'

export type SwState = 'idle' | 'update-available' | 'offline-ready'

export function initSW(onState: (s: SwState) => void) {
  const updateSW = registerSW({
    onNeedRefresh()  { onState('update-available') },
    onOfflineReady() { onState('offline-ready') },
  })
  return () => updateSW(true)
}
```

- [x] **Step 2: Write `src/main.ts`**

```ts
import './styles/reset.css'
import './styles/tokens.css'
import './styles/app.css'
import './components/app-shell'
import './components/app-top-bar'
import './components/app-bottom-bar'
import './components/app-content'
import './components/app-update-banner'
import './components/feed-view'
import './components/about-view'
import './components/diagnostics-view'
import { getDiagnostics } from './components/diagnostics-view'
import { initSW } from './lib/sw-register'

const shell     = document.querySelector('app-shell')      as HTMLElement
const content   = document.querySelector('app-content')    as HTMLElement
const topBar    = document.querySelector('app-top-bar')    as HTMLElement
const bottomBar = document.querySelector('app-bottom-bar') as HTMLElement

content.replaceChildren(document.createElement('feed-view'))
bottomBar.setAttribute('active-tab', 'feed')

const diag = getDiagnostics()
diag.setContent(content)
diag.subscribe((snap) => {
  if (snap.swState === 'update-available') {
    topBar.setAttribute('status', 'update')
  } else if (!snap.online) {
    topBar.setAttribute('status', 'offline')
  } else {
    topBar.setAttribute('status', 'online')
  }
})

const reloadSW = initSW((state) => {
  diag.setSwState(state)
  shell.dispatchEvent(new CustomEvent('sw-state', { detail: state }))
})
shell.addEventListener('reload-app', () => { reloadSW() })
```

- [x] **Step 3: Type-check the project**

Run: `npx tsc -b`
Expected: exits with code 0; no output.

- [x] **Step 4: Commit**

```bash
git add src/lib/sw-register.ts src/main.ts
git commit -m "Wire SW registration and bootstrap app in main.ts"
```

---

## Task 16: Build verification and dev-server smoke test

- [x] **Step 1: Build the project**

Run: `npm run build`
Expected: `dist/` created, containing `index.html`, `assets/`, `sw.js`, `manifest.webmanifest`, and Workbox precache files. No errors.

- [x] **Step 2: Start the dev server** (skipped - manual verification)

Run: `npm run dev`
Expected: Vite prints `Local: http://localhost:5173/` (or similar).

- [x] **Step 3: Open in desktop Chrome and smoke-test** (skipped - manual verification)

Open `http://localhost:5173/` in Chrome. Verify:
- Feed loads with cards
- Top bar shows title + `online` chip
- Bottom bar shows Feed / Diag / About
- Tapping tabs switches content
- Diagnostics tab shows non-zero viewport values, `standalone: false` (desktop browser), `online: true`, non-empty `swVersion`
- Tapping the top-bar status chip jumps to the Diagnostics tab

- [x] **Step 4: Verify service worker is registered** (skipped - manual verification)

Open DevTools → Application → Service Workers.
Expected: a service worker listed with status "activated and is running".

- [x] **Step 5: Verify offline** (skipped - manual verification)

In DevTools → Application → Service Workers, check **Offline**. Reload the page.
Expected: app loads fully from cache; tabs still work; Diagnostics shows `online: false`; top-bar chip turns gray.

- [x] **Step 6: Verify update flow** (skipped - manual verification)

Uncheck **Offline**. Make a small edit to `src/components/about-view.ts` (e.g. add a trailing space in a constant). Save. Vite rebuilds.
Within a few seconds, expect the top banner: "New version available · Reload · Dismiss". Top-bar chip turns amber.
Tap **Reload**. Expected: page reloads and banner is gone.
Repeat the edit. This time tap **Dismiss**. Expected: banner hides, grid collapses back to 3 rows, chip stays amber.

---

## Task 17: Device verification on iOS 26+ and Android 16+

- [ ] **Step 1: Build and serve on LAN**

Run: `npm run build && npm run preview`
Expected: Vite preview server starts and prints a `Network:` URL like `http://192.168.x.x:4173/`.

- [ ] **Step 2: Verify on iOS 26+ (Safari → Add to Home Screen)**

On the iOS device, open the Network URL in Safari. Tap Share → **Add to Home Screen**. Launch from the home screen. Verify:

| Req | Check                                                                                  |
| --- | -------------------------------------------------------------------------------------- |
| 1   | App launches and runs                                                                  |
| 2   | Long-press any card text — no selection, no callout                                    |
| 3   | Pull the feed past top and past bottom — no rubber-band                                |
| 4   | No Safari chrome visible; Diagnostics → Display mode shows `standalone: true`          |
| 5   | Enable Airplane Mode, relaunch from home screen — app loads and stays usable           |
| 7   | Diagnostics → Safe area insets card shows non-zero `top` and `bottom` (Dynamic Island) |
| 8   | Diagnostics → Viewport card shows measured `100dvh` equal to `innerHeight`             |
| 9   | Scroll the feed — top and bottom bars do not move                                      |

- [ ] **Step 3: Verify on Android 16+ (Chrome → Install app)**

On the Android device, open the Network URL in Chrome. Use the address-bar **Install** prompt or menu → Install app. Launch from the launcher. Verify the same table as Step 2, additionally:
- Diagnostics → Safe area card shows non-zero `top` (status bar) and `bottom` (gesture navigation bar)

- [ ] **Step 4: Verify update prompt end-to-end**

Back on the host machine, bump `SW_VERSION` in `vite.config.ts` (or touch any source file). Rebuild: `npm run build && npm run preview`.
On both devices, reopen the installed app. Within a few seconds, the top banner should appear. Tap **Reload** — the new version activates and the chip returns to green.

- [ ] **Step 5: Fix anything surfaced by manual verification**

If any requirement fails on device, fix it and commit the fix as a separate `fix:` commit.

---

## Spec requirement coverage

| Req | Task(s) implementing it                                        |
| --- | -------------------------------------------------------------- |
| 1   | Task 16 (smoke test) + Task 17 (device verification)           |
| 2   | Task 4 (`user-select: none`, `-webkit-touch-callout: none`)    |
| 3   | Task 4 (`overscroll-behavior: none` + `contain`)               |
| 4   | Task 2 (manifest `display: standalone`) + Task 3 (meta tags)   |
| 5   | Task 2 (Workbox precache) + Task 15 (SW registration)          |
| 6   | Task 2 (`registerType: prompt`) + Tasks 6, 10, 15 (banner UX)  |
| 7   | Task 3 (`viewport-fit=cover`) + Tasks 4, 7, 8 (inset padding)  |
| 8   | Task 4 (`100dvh` + grid `1fr`)                                 |
| 9   | Task 4 (grid `auto 1fr auto`) + Tasks 7, 8 (sticky bars)       |
