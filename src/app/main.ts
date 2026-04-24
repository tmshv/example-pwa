import '../core/styles/reset.css'
import '../core/styles/layout.css'
import './styles/tokens.css'
import './styles/layout.css'
import '../core/components/app-shell'
import './components/app-top-bar'
import './components/app-bottom-bar'
import './components/app-content'
import './components/app-update-banner'
import './components/feed-card'
import './components/feed-view'
import './components/about-view'
import './components/diagnostics-view'
import { getDiagnostics } from './components/diagnostics-view'
import { initInsets } from '../core/lib/insets'
import { initSW } from '../core/lib/sw-register'
import { watchVersion } from '../core/lib/version-check'

type Tab = 'feed' | 'diagnostics' | 'about'

initInsets()

const shell     = document.querySelector('app-shell')         as HTMLElement
const content   = document.querySelector('app-content')       as HTMLElement
const topBar    = document.querySelector('app-top-bar')       as HTMLElement
const bottomBar = document.querySelector('app-bottom-bar')    as HTMLElement
const banner    = document.querySelector('app-update-banner') as HTMLElement

let currentTab: Tab = 'feed'
content.replaceChildren(document.createElement('feed-view'))
bottomBar.setAttribute('active-tab', currentTab)

shell.addEventListener('tab-change', (e) => {
  const tab = (e as CustomEvent<Tab>).detail
  if (currentTab === tab) return
  currentTab = tab
  content.replaceChildren(document.createElement(`${tab}-view`))
  bottomBar.setAttribute('active-tab', tab)
})

shell.addEventListener('dismiss-update', () => {
  banner.setAttribute('hidden', '')
})

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
  if (state === 'update-available') {
    banner.removeAttribute('hidden')
  }
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

;(async () => {
  for await (const _ of watchVersion(new URL('version.json', document.baseURI))) {
    await sw.checkForUpdate()
    diag.setSwState('update-available')
    banner.removeAttribute('hidden')
  }
})()
