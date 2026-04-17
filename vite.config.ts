/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

declare const process: { env: Record<string, string | undefined> }

const SW_VERSION = new Date().toISOString()
const BASE = process.env.BASE_URL ?? '/'

export default defineConfig({
  base: BASE,
  define: {
    __SW_VERSION__: JSON.stringify(SW_VERSION),
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'PWA Layout Demo',
        short_name: 'Layout',
        description: 'Mobile PWA layout reference',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: `${BASE}icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${BASE}icon.svg`, sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      devOptions: { enabled: false, type: 'module' },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
