import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// Paper & Book light surface (src/themes.css) — used for the installed shell.
const PAPER = '#f6f1e6'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // A new service worker waits until every LifeClues tab is closed, so an
      // update never reloads the page out from under a memory being written.
      registerType: 'prompt',
      // Registered by hand in src/main.jsx (no plugin-injected reload script).
      injectRegister: null,
      // Never register a service worker during `npm run dev`.
      devOptions: { enabled: false },
      manifestFilename: 'manifest.webmanifest',
      manifest: {
        id: '/app',
        name: 'LifeClues',
        short_name: 'LifeClues',
        description: 'A private space for your memories. Small Clues. Big Memories.',
        lang: 'en',
        dir: 'ltr',
        categories: ['lifestyle', 'productivity'],
        // "/" stays the public landing page; the installed app opens the
        // journal, which sends you to /login when you are signed out.
        start_url: '/app',
        scope: '/',
        display: 'standalone',
        background_color: PAPER,
        theme_color: PAPER,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Only the built shell: JS, CSS, HTML, the manifest and the icons
        // (favicon.svg, icons.svg, pwa-*.png, apple-touch-icon.png). Adding the
        // same files again via includeAssets would precache them a second time.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // SPA routes (/app, /login, /privacy …) resolve to the precached shell.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        runtimeCaching: [
          // Memories, sessions and tokens are never served from a cache.
          { urlPattern: /^\/api\//, handler: 'NetworkOnly' },
          // Anything else non-document (fonts, images) stays on the network
          // too — LifeClues keeps no offline copy of anything.
          {
            urlPattern: ({ request }) => request.destination !== 'document',
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    allowedHosts: ['localui.abdulmajid.in', '.abdulmajid.in'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
      },
    },
  },
})
