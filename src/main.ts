import './core/styles/reset.css'
import './styles/tokens.css'
import './styles/layout.css'
import './core/components/app-shell'
import './app/components/app-top-bar'
import './app/components/app-bottom-bar'
import './app/components/app-content'
import './app/components/app-update-banner'
import './app/components/feed-card'
import './app/components/feed-view'
import './app/components/about-view'
import './app/components/diagnostics-view'
import { getDiagnostics } from './app/components/diagnostics-view'
import { initInsets } from './core/lib/insets'
import { initSW } from './core/lib/sw-register'
import { initVersionCheck } from './core/lib/version-check'

initInsets()

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
const hideOverlay = () => { reloadOverlay.hidden = true }
if (document.readyState === 'complete') {
  requestAnimationFrame(hideOverlay)
} else {
  window.addEventListener('load', () => requestAnimationFrame(hideOverlay), { once: true })
}
shell.addEventListener('reload-app', () => {
  reloadOverlay.hidden = false
  sw.reload().catch((err) => {
    console.error('SW reload failed:', err)
    reloadOverlay.hidden = true
  })
})
shell.addEventListener('check-update', () => {
  sw.checkForUpdate()
})

initVersionCheck(async () => {
  await sw.checkForUpdate()
  diag.setSwState('update-available')
  shell.dispatchEvent(new CustomEvent('sw-state', { detail: 'update-available' }))
})
