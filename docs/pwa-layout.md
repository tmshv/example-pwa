# PWA layout — safe-area / viewport handling

Why the layout binds to `var(--sai-*)` and `var(--app-h)` instead of using `env(safe-area-inset-*)` and `100dvh` directly.

## The bug this prevents

On installed PWAs, iOS WebKit and Android Chrome transiently return wrong values on reload / navigation:

- **iOS 15+ standalone:** `env(safe-area-inset-*)` resolves to 0 for several frames after page reload (and after client-side navigations) until a user-interaction-like event prompts WebKit to re-evaluate. Documented: [Apple Developer 699415](https://developer.apple.com/forums/thread/699415), [Apple Developer 716552](https://developer.apple.com/forums/thread/716552), [vercel/next.js#81264](https://github.com/vercel/next.js/discussions/81264).
- **Android Chrome standalone:** `100dvh` briefly includes the system nav-bar area while `display-mode: standalone` is re-established after reload.

Observed symptom before the fix: on RELOAD the top/bottom bars jumped — on iOS the layout shifted up and exposed a white strip where the home-indicator safe area had been; on Android the bottom bar clipped below the visible viewport. Both self-corrected after ~100–500 ms, but the glitch was always visible.

## How the fix works

1. `src/core/lib/insets.ts` installs a hidden `env()`-probe element and mirrors its computed padding (+ `visualViewport.height`) into five CSS custom properties on `<html>`: `--sai-top`, `--sai-right`, `--sai-bottom`, `--sai-left`, `--app-h`.
2. The current orientation's snapshot is persisted to `localStorage['insets-v1']` keyed by `p` (portrait) or `l` (landscape).
3. A synchronous inline `<script>` in `index.html` runs **before any CSS evaluates**, reads the cache, and applies it to `<html>.style`. First paint of every subsequent page load uses correct values — the broken first-paint phase no longer exists.
4. CSS uses `var(--sai-X, env(safe-area-inset-X, 0px))` so if JS is disabled or the cache is empty, it still falls back to `env()`.
5. On every `resize` / `visualViewport.resize`, values re-sync.

## Invariants — do not break these

| Rule | Where | Why |
|------|-------|-----|
| Never use raw `env(safe-area-inset-*)` for layout sizing in CSS. Always `var(--sai-X, env(safe-area-inset-X, 0px))`. | Every CSS file | Raw `env()` reads the transient 0 on reload. |
| Never use raw `100dvh` for app-frame sizing. Use `var(--app-h, 100dvh)`. | `src/core/styles/layout.css`, `src/core/components/app-shell.css` | Raw `100dvh` reads the transient wrong viewport on Android reload. |
| The inline `<script>` in `index.html` must stay in `<head>` and must be synchronous. | `index.html` | Must set CSS custom props before first paint. Moving it to `<body>` or making it `defer`/`async` reintroduces the glitch. |
| The orientation-key ("p"/"l") must match between the inline script and `insets.ts`. | Both | Mismatch = wrong cached snapshot applied on first paint. |
| `Math.max(current, prev.X)` in `sync()` must stay. | `src/core/lib/insets.ts` | Without it, the first post-reload read (which can be 0 on iOS) overwrites the good cached values. |
| `localStorage` writes are gated on `display-mode: standalone || hasInsets > 0`. | `src/core/lib/insets.ts` | Prevents caching 0s from a pre-standalone transient state or from browser-mode sessions. |
| The `initInsets()` call must remain at the top of the entry file, before any layout-touching code. | `src/app/main.ts` | Ensures custom props are kept in sync for the lifetime of the session. |

## Further reading

- [firt.dev — PWA Power Tips](https://firt.dev/pwa-design-tips/) — why iOS PWAs force-reload on every app switch, which is the trigger that makes the transient state user-visible.
- [dev.to — Avoid notches in your PWA with just CSS](https://dev.to/marionauta/avoid-notches-in-your-pwa-with-just-css-al7) — CSS-custom-property mirror pattern.
- [Latitudes-Dev/shuvcode#264](https://github.com/Latitudes-Dev/shuvcode/issues/264) — similar fix rationale for a different codebase.
