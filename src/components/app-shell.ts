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
