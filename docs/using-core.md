# Reusing the PWA core in a new project

The `src/core/` tree is a copy-in template: reusable structural pieces that survive between projects. The `src/app/` tree is project-specific demo code. To bootstrap a new PWA, copy the core, keep a few root files, and write a fresh `src/app/`.

## What to copy

Minimum set from this repo:

- `src/core/` — the entire directory
  - `lib/insets.ts`, `lib/sw-register.ts`, `lib/version-check.ts`
  - `styles/reset.css`, `styles/layout.css` (structural only)
  - `components/app-shell.ts`, `components/app-shell.css`
- `src/global.d.ts` — declares `__SW_VERSION__` (and the `virtual:pwa-register` module) so core code type-checks
- `index.html` — including the inline insets-cache `<script>` in `<head>`. The `.reload-overlay` markup and its style block are demo-only; drop them unless you also port the overlay hide logic from `src/app/main.ts`.
- `vite.config.ts` — Vite + `vite-plugin-pwa` setup, including the `emit-version-json` plugin that `version-check.ts` polls, and the `define: { __SW_VERSION__: … }` injection that `version-check.ts` reads as its current version.
- `public/` — supply your own icons (`icon.svg`, `icon-192.png`, `icon-512.png`, `icon-180.png`). Shape and sizes must match what `vite.config.ts` references in the manifest.
- `docs/pwa-layout.md` — keep as-is; it documents the layout invariants the core depends on

Do NOT copy `src/app/` or `tests/` — those are demo/project code.

## Wiring a new `src/app/main.ts`

Your new entry file lives at `src/app/main.ts` and `index.html` points at it via `<script type="module" src="/src/app/main.ts"></script>`. Minimal skeleton:

```ts
import '../core/styles/reset.css'
import '../core/styles/layout.css'
// your project styles go here, e.g.:
// import './styles/tokens.css'
// import './styles/layout.css'
import '../core/components/app-shell'
// register your own view / bar / content custom elements here

import { initInsets } from '../core/lib/insets'
import { initSW } from '../core/lib/sw-register'
import { initVersionCheck } from '../core/lib/version-check'

initInsets()

const shell = document.querySelector('app-shell') as HTMLElement

const sw = initSW((state) => {
  shell.dispatchEvent(new CustomEvent('sw-state', { detail: state }))
})

shell.addEventListener('reload-app', () => {
  sw.reload().catch((err) => console.error('SW reload failed:', err))
})
shell.addEventListener('check-update', () => { sw.checkForUpdate() })

initVersionCheck(async () => {
  await sw.checkForUpdate()
  shell.dispatchEvent(new CustomEvent('sw-state', { detail: 'update-available' }))
})
```

`initInsets()` must be the first call — it populates the CSS custom properties the layout binds to. `<app-shell>` expects child elements `<app-top-bar>`, `<app-bottom-bar>`, `<app-content>`, `<app-update-banner>` (or whatever you choose to register); adapt `index.html` to match your element names.

## Invariants you must preserve

These come from `docs/pwa-layout.md` — they exist because raw `env(safe-area-inset-*)` and `100dvh` are wrong for the first frames after a PWA reload on iOS/Android. The core fixes that; your app code must not reintroduce the bug:

- In CSS, always use `var(--sai-top, env(safe-area-inset-top, 0px))` (and `--sai-right` / `--sai-bottom` / `--sai-left`) for safe-area sizing. Never raw `env(safe-area-inset-*)`.
- In CSS, always use `var(--app-h, 100dvh)` for app-frame height. Never raw `100dvh`.
- Keep the synchronous inline insets-cache `<script>` in `<head>` of `index.html`. Do not make it `defer` / `async` and do not move it to `<body>`.
- Call `initInsets()` once, before anything touches the layout, at the top of your entry file.

Breaking any of these brings back the visible layout jump on first paint after reload.
