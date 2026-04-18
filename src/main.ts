import './styles/reset.css'
import './styles/tokens.css'
import './styles/layout.css'
import './components/app-shell'
import './components/app-top-bar'
import './components/app-bottom-bar'
import './components/app-content'
import './components/app-update-banner'
import './components/feed-card'
import './components/feed-view'
import './components/about-view'
import './components/diagnostics-view'
import { getDiagnostics } from './components/diagnostics-view'
import { initSW } from './lib/sw-register'
import { initVersionCheck } from './lib/version-check'

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

const sw = initSW((state) => {
  diag.setSwState(state)
  shell.dispatchEvent(new CustomEvent('sw-state', { detail: state }))
})
const reloadOverlay = document.querySelector('.reload-overlay') as HTMLElement
hideOverlayWhenLayoutStable(reloadOverlay)
shell.addEventListener('reload-app', () => {
  reloadOverlay.hidden = false
  sw.reload().catch((err) => {
    console.error('SW reload failed:', err)
    reloadOverlay.hidden = true
  })
})

function hideOverlayWhenLayoutStable(overlay: HTMLElement, timeoutMs = 1500) {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;visibility:hidden;' +
    'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)'
  document.body.appendChild(probe)

  const start = performance.now()
  let prev = ''
  let stable = 0

  const done = () => {
    probe.remove()
    overlay.hidden = true
  }

  const tick = () => {
    const cs = getComputedStyle(probe)
    const curr = `${window.innerHeight}|${cs.paddingTop}|${cs.paddingBottom}`
    if (curr === prev) stable++
    else { stable = 0; prev = curr }
    if (stable >= 3 || performance.now() - start > timeoutMs) done()
    else requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
shell.addEventListener('check-update', () => {
  sw.checkForUpdate()
})

initVersionCheck(async () => {
  await sw.checkForUpdate()
  diag.setSwState('update-available')
  shell.dispatchEvent(new CustomEvent('sw-state', { detail: 'update-available' }))
})
