# PWA core/demo split — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Physically separate the reusable PWA-template code ("core") from the demo implementation by moving files into `src/core/` and `src/app/`, splitting `layout.css` along structural/themed lines, and adding one regression test for `initInsets()`.

**Architecture:** Two sibling directories, copy-in template. No barrel files, no npm packaging. Demo imports from `src/core/…` by path. See `docs/superpowers/specs/2026-04-18-pwa-core-demo-split-design.md` for the full spec. Invariants documented in `docs/pwa-layout.md`.

**Tech Stack:** Vite 7, vite-plugin-pwa 1.2, TypeScript 5.6, vitest 3.2, plain custom elements. No framework.

**Verification gates after each task:**
- `npx tsc -b` clean
- `npm test` clean
- `npm run build` clean (only after tasks that touch vite config or index.html)
- Manual `npm run dev` visual check (only after layout.css split and final task)

---

### Task 1: Create new directory skeleton

**Files:**
- Create: `src/core/lib/`, `src/core/styles/`, `src/core/components/`
- Create: `src/app/lib/`, `src/app/styles/`, `src/app/components/`
- Create: `tests/core/`

- [x] Run: `mkdir -p src/core/lib src/core/styles src/core/components src/app/lib src/app/styles src/app/components tests/core`
- [x] Verify dirs exist: `ls -d src/core src/core/lib src/core/styles src/core/components src/app src/app/lib src/app/styles src/app/components tests/core` — all must print.
- [x] No commit yet. These are empty dirs; git will not track them. They will be populated by the next tasks.

---

### Task 2: Move core `lib/` modules (insets, sw-register, version-check)

**Files:**
- Move: `src/lib/insets.ts` → `src/core/lib/insets.ts`
- Move: `src/lib/sw-register.ts` → `src/core/lib/sw-register.ts`
- Move: `src/lib/version-check.ts` → `src/core/lib/version-check.ts`
- Modify: `src/main.ts` (import paths for the three modules above)

- [x] Run: `git mv src/lib/insets.ts src/core/lib/insets.ts`
- [x] Run: `git mv src/lib/sw-register.ts src/core/lib/sw-register.ts`
- [x] Run: `git mv src/lib/version-check.ts src/core/lib/version-check.ts`
- [x] Open `src/main.ts` and update three import paths:
  - `from './lib/insets'` → `from './core/lib/insets'`
  - `from './lib/sw-register'` → `from './core/lib/sw-register'`
  - `from './lib/version-check'` → `from './core/lib/version-check'`
- [x] Run: `npx tsc -b` — expect clean.
- [x] Run: `npm test` — expect 5/5 passing.
- [x] Commit: `git add -A && git commit -m "Move insets, sw-register, version-check to src/core/lib/"`

---

### Task 3: Move core styles and `<app-shell>` component

**Files:**
- Move: `src/styles/reset.css` → `src/core/styles/reset.css`
- Move: `src/components/app-shell.ts` → `src/core/components/app-shell.ts`
- Move: `src/components/app-shell.css` → `src/core/components/app-shell.css`
- Modify: `src/main.ts` (import paths for `reset.css` and `app-shell`)

- [x] Run: `git mv src/styles/reset.css src/core/styles/reset.css`
- [x] Run: `git mv src/components/app-shell.ts src/core/components/app-shell.ts`
- [x] Run: `git mv src/components/app-shell.css src/core/components/app-shell.css`
- [x] Verify `app-shell.ts`'s internal import `import './app-shell.css'` still resolves (same folder — should need no change). Read `src/core/components/app-shell.ts` line 1 to confirm.
- [x] Open `src/main.ts` and update two import paths:
  - `import './styles/reset.css'` → `import './core/styles/reset.css'`
  - `import './components/app-shell'` → `import './core/components/app-shell'`
- [x] Run: `npx tsc -b` — expect clean.
- [x] Run: `npm test` — expect 5/5 passing.
- [x] Commit: `git add -A && git commit -m "Move reset.css and app-shell to src/core/"`

---

### Task 4: Move demo components and their CSS

**Files:**
- Move all of the following into `src/app/components/`:
  - `src/components/app-top-bar.ts`, `src/components/app-top-bar.css`
  - `src/components/app-bottom-bar.ts`, `src/components/app-bottom-bar.css`
  - `src/components/app-update-banner.ts`, `src/components/app-update-banner.css`
  - `src/components/app-content.ts`, `src/components/app-content.css`
  - `src/components/feed-card.ts`, `src/components/feed-card.css`
  - `src/components/feed-view.ts`
  - `src/components/about-view.ts`, `src/components/about-view.css`
  - `src/components/diagnostics-view.ts`, `src/components/diagnostics-view.css`
- Modify: `src/main.ts` (all demo-component import paths)

- [x] Run (single command with semicolons or several, one per file):
```
git mv src/components/app-top-bar.ts src/app/components/
git mv src/components/app-top-bar.css src/app/components/
git mv src/components/app-bottom-bar.ts src/app/components/
git mv src/components/app-bottom-bar.css src/app/components/
git mv src/components/app-update-banner.ts src/app/components/
git mv src/components/app-update-banner.css src/app/components/
git mv src/components/app-content.ts src/app/components/
git mv src/components/app-content.css src/app/components/
git mv src/components/feed-card.ts src/app/components/
git mv src/components/feed-card.css src/app/components/
git mv src/components/feed-view.ts src/app/components/
git mv src/components/about-view.ts src/app/components/
git mv src/components/about-view.css src/app/components/
git mv src/components/diagnostics-view.ts src/app/components/
git mv src/components/diagnostics-view.css src/app/components/
```
- [x] Open `src/main.ts` and update component import paths. Replace all occurrences of `./components/` with `./app/components/`. Concrete lines affected:
  - `import './components/app-top-bar'` → `import './app/components/app-top-bar'`
  - `import './components/app-bottom-bar'` → `import './app/components/app-bottom-bar'`
  - `import './components/app-content'` → `import './app/components/app-content'`
  - `import './components/app-update-banner'` → `import './app/components/app-update-banner'`
  - `import './components/feed-card'` → `import './app/components/feed-card'`
  - `import './components/feed-view'` → `import './app/components/feed-view'`
  - `import './components/about-view'` → `import './app/components/about-view'`
  - `import './components/diagnostics-view'` → `import './app/components/diagnostics-view'`
  - `from './components/diagnostics-view'` → `from './app/components/diagnostics-view'`
- [x] Run: `npx tsc -b` — expect clean. (Tests may still import from `src/lib/...`; that's fine for this task — lib move is Task 5.) NOTE: tsc shows expected errors because components import `../lib/...` which now points at the still-empty `src/app/lib/`; Task 5 resolves this. Tests pass (5/5).
- [x] Commit: `git add -A && git commit -m "Move demo components to src/app/components/"`

---

### Task 5: Move demo `lib/` modules (card-fill, diagnostics, dom)

**Files:**
- Move: `src/lib/card-fill.ts` → `src/app/lib/card-fill.ts`
- Move: `src/lib/diagnostics.ts` → `src/app/lib/diagnostics.ts`
- Move: `src/lib/dom.ts` → `src/app/lib/dom.ts`
- Modify: imports in `src/app/components/*.ts` that reference `../lib/...`
- Modify: `tests/card-fill.test.ts`, `tests/diagnostics.test.ts` import paths

- [ ] Run:
```
git mv src/lib/card-fill.ts src/app/lib/card-fill.ts
git mv src/lib/diagnostics.ts src/app/lib/diagnostics.ts
git mv src/lib/dom.ts src/app/lib/dom.ts
```
- [ ] Confirm component files inside `src/app/components/` still resolve — their imports use `../lib/...` which after the move still resolves correctly because both moved from `src/…/` to `src/app/…/` preserving the relative structure. Run `npx tsc -b` to verify; expect clean.
- [ ] Edit `tests/card-fill.test.ts` line 2:
  - `from '../src/lib/card-fill'` → `from '../src/app/lib/card-fill'`
- [ ] Edit `tests/diagnostics.test.ts` line 2:
  - `from '../src/lib/diagnostics'` → `from '../src/app/lib/diagnostics'`
- [ ] Run: `npm test` — expect 5/5 passing.
- [ ] Commit: `git add -A && git commit -m "Move demo lib modules to src/app/lib/"`

---

### Task 6: Move `tokens.css` into demo styles

**Files:**
- Move: `src/styles/tokens.css` → `src/app/styles/tokens.css`
- Modify: `src/main.ts` (one import path)

- [ ] Run: `git mv src/styles/tokens.css src/app/styles/tokens.css`
- [ ] Edit `src/main.ts`:
  - `import './styles/tokens.css'` → `import './app/styles/tokens.css'`
- [ ] Run: `npx tsc -b` — expect clean.
- [ ] Run: `npm test` — expect 5/5 passing.
- [ ] Commit: `git add -A && git commit -m "Move tokens.css to src/app/styles/"`

---

### Task 7: Move `main.ts` into `src/app/` and update `index.html`

**Files:**
- Move: `src/main.ts` → `src/app/main.ts`
- Modify: all import paths inside `src/app/main.ts`
- Modify: `index.html` (`<script>` src attribute)

- [ ] Run: `git mv src/main.ts src/app/main.ts`
- [ ] Open `src/app/main.ts`. Every `./core/…` import becomes `../core/…`. Every `./app/…` import becomes `./` (shedding the `app/` prefix since we are now inside `src/app/`). The one straggler — `./styles/layout.css` which still points at the as-yet-unmoved `src/styles/layout.css` — becomes `../styles/layout.css` temporarily; Task 8 finalizes it. Concrete list of changes:
  - `import './core/styles/reset.css'` → `import '../core/styles/reset.css'`
  - `import './app/styles/tokens.css'` → `import './styles/tokens.css'`
  - `import './styles/layout.css'` → `import '../styles/layout.css'` (temporary path to the file not yet moved; Task 8 finalizes)
  - `import './core/components/app-shell'` → `import '../core/components/app-shell'`
  - `import './app/components/app-top-bar'` → `import './components/app-top-bar'`
  - `import './app/components/app-bottom-bar'` → `import './components/app-bottom-bar'`
  - `import './app/components/app-content'` → `import './components/app-content'`
  - `import './app/components/app-update-banner'` → `import './components/app-update-banner'`
  - `import './app/components/feed-card'` → `import './components/feed-card'`
  - `import './app/components/feed-view'` → `import './components/feed-view'`
  - `import './app/components/about-view'` → `import './components/about-view'`
  - `import './app/components/diagnostics-view'` → `import './components/diagnostics-view'`
  - `from './app/components/diagnostics-view'` → `from './components/diagnostics-view'`
  - `from './core/lib/insets'` → `from '../core/lib/insets'`
  - `from './core/lib/sw-register'` → `from '../core/lib/sw-register'`
  - `from './core/lib/version-check'` → `from '../core/lib/version-check'`
- [ ] Open `index.html` line 30 (the module script tag):
  - `<script type="module" src="/src/main.ts"></script>` → `<script type="module" src="/src/app/main.ts"></script>`
- [ ] Run: `npx tsc -b` — expect clean.
- [ ] Run: `npm test` — expect 5/5 passing.
- [ ] Run: `npm run build` — expect clean.
- [ ] Commit: `git add -A && git commit -m "Move main.ts to src/app/ and point index.html at new path"`

---

### Task 8: Split `layout.css` along structural/themed lines

**Files:**
- Create: `src/core/styles/layout.css`
- Create: `src/app/styles/layout.css`
- Delete: `src/styles/layout.css`
- Modify: `src/app/main.ts` (two import paths for layout.css)

- [ ] Create `src/core/styles/layout.css` with **structural-only** rules. Full contents:

```css
html, body {
  height: var(--app-h, 100dvh);
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

- [ ] Create `src/app/styles/layout.css` with **themed + demo layout** rules. Full contents:

```css
html, body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font);
}

app-content {
  margin: 0 16px;
}

app-top-bar,
app-bottom-bar,
app-update-banner {
  position: absolute;
  left: 16px;
  right: 16px;
  z-index: 10;
}

app-top-bar {
  top: calc(var(--sai-top, env(safe-area-inset-top, 0px)) + 8px);
  padding: 10px 16px;
}

app-update-banner {
  top: calc(var(--sai-top, env(safe-area-inset-top, 0px)) + 8px + 44px);
  padding: 8px 14px;
}

app-bottom-bar {
  bottom: calc(var(--sai-bottom, env(safe-area-inset-bottom, 0px)) + 8px);
}

feed-view,
about-view,
diagnostics-view {
  display: block;
  font-family: var(--font);
  color: var(--fg);
}
```

- [ ] Delete the old file: `git rm src/styles/layout.css`
- [ ] In `src/app/main.ts`, replace the single layout.css import with two imports (order matters — core first, then demo override):
  - Remove: `import '../styles/layout.css'`
  - Add after reset.css import: `import '../core/styles/layout.css'`
  - Add after tokens.css import: `import './styles/layout.css'`
- [ ] Run: `npx tsc -b` — expect clean.
- [ ] Run: `npm test` — expect 5/5 passing.
- [ ] Run: `npm run build` — expect clean.
- [ ] Run: `npm run dev` in another terminal. Open http://localhost:5173 (or whatever port Vite prints). Visually verify: feed is visible, top-bar is at top with title + status chip, bottom-bar with three tabs is at the bottom. Navigate to Diag and About tabs. Kill dev server.
- [ ] Commit: `git add -A && git commit -m "Split layout.css into core (structural) and demo (themed) halves"`

---

### Task 9: Clean up empty legacy directories

**Files:**
- Delete: `src/lib/`, `src/components/`, `src/styles/` (if empty)

- [ ] Run: `ls src/lib src/components src/styles 2>&1` — each should show empty output or "No such file". If any file remains, STOP; Tasks 2–8 did not fully move their targets. Do not proceed until all three dirs are empty.
- [ ] Run: `rmdir src/lib src/components src/styles`
- [ ] Run: `git status` — expect no changes (empty dirs aren't tracked by git, so rmdir doesn't show up; this step only tidies the filesystem).
- [ ] No commit needed.

---

### Task 10: Add regression test for `initInsets()`

**Files:**
- Create: `tests/core/insets.test.ts`

- [ ] Write `tests/core/insets.test.ts` with three assertions. Full contents:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initInsets } from '../../src/core/lib/insets'

describe('initInsets', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    localStorage.clear()
    document.querySelectorAll('div').forEach((el) => el.remove())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('writes CSS custom properties to <html> for all five inset/height vars', () => {
    initInsets()
    const style = document.documentElement.style
    expect(style.getPropertyValue('--sai-top')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--sai-right')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--sai-bottom')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--sai-left')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--app-h')).toMatch(/^\d+px$/)
  })

  it('persists a snapshot under localStorage key "insets-v1" when standalone mode is active', () => {
    window.matchMedia = ((q: string) => ({
      matches: q.includes('standalone') || q.includes('portrait'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    initInsets()
    const raw = localStorage.getItem('insets-v1')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).toHaveProperty('p')
    expect(parsed.p).toEqual(
      expect.objectContaining({
        t: expect.any(Number),
        r: expect.any(Number),
        b: expect.any(Number),
        l: expect.any(Number),
        h: expect.any(Number),
      }),
    )
  })

  it('does not decrease a cached inset when a later probe reads 0', () => {
    localStorage.setItem(
      'insets-v1',
      JSON.stringify({ p: { t: 44, r: 0, b: 34, l: 0, h: 800 } }),
    )
    window.matchMedia = ((q: string) => ({
      matches: q.includes('standalone') || q.includes('portrait'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    initInsets()
    const raw = localStorage.getItem('insets-v1')!
    const parsed = JSON.parse(raw)
    expect(parsed.p.t).toBeGreaterThanOrEqual(44)
    expect(parsed.p.b).toBeGreaterThanOrEqual(34)
  })
})
```

- [ ] Run: `npm test` — expect 8/8 passing (5 existing + 3 new).
- [ ] If any new test fails, read the failure carefully before editing `insets.ts` — the tests assert current documented behavior. Most likely cause of failure is a difference in jsdom's handling of `getComputedStyle` for `env()`; in that case the first test's regex may need relaxing to `/^-?\d+(\.\d+)?px$/`. Any tighter fix (e.g., changing `insets.ts`) needs human review — do NOT silently loosen assertions below "values are set and are valid lengths".
- [ ] Commit: `git add -A && git commit -m "Add regression test for initInsets behavior"`

---

### Task 11: Final verification sweep

**Files:** none

- [ ] Run: `npx tsc -b`. Expect: clean, no output.
- [ ] Run: `npm test`. Expect: `Tests  8 passed (8)`.
- [ ] Run: `npm run build`. Expect: Vite outputs `dist/` with `index.html`, `assets/*.js`, `assets/*.css`, `sw.js`, `workbox-*.js`, `manifest.webmanifest`, `version.json`.
- [ ] Run: `npm run dev`. Open the printed URL in a browser. Verify:
  - Feed view renders with cards.
  - Top-bar shows title + status chip (`[ online ]`).
  - Bottom-bar shows three tabs; clicking Diag/About switches views.
  - Diagnostics view shows non-zero safe-area insets (if on mobile) or zeros (desktop).
  - No console errors.
- [ ] Kill dev server.
- [ ] No commit needed — this task only verifies.

---

### Task 12 (optional): Document how to reuse the core in a new project

**Files:**
- Create: `docs/using-core.md`

- [ ] Only do this task if you want to make the template's reuse story explicit. Otherwise skip.
- [ ] Write a short doc covering: the minimum set of files to copy when bootstrapping a new PWA (`src/core/`, `index.html`, `vite.config.ts`, `public/` placeholders, `docs/pwa-layout.md`), the wiring required in a new `src/app/main.ts`, and the invariant about `var(--sai-*)` / `var(--app-h)` usage. Keep under 100 lines.
- [ ] Commit: `git add docs/using-core.md && git commit -m "Add core-reuse quickstart doc"`
