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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
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
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
