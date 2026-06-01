// vite.config.js
// REPLACE your existing vite.config.js with this file.
//
// Key PWA fixes:
//  - registerType: 'autoUpdate'   → keeps SW fresh
//  - display: 'standalone'        → required for beforeinstallprompt to fire
//  - start_url + scope            → required for install eligibility
//  - icons with correct sizes     → 192 + 512 both required
//  - screenshots                  → improves install prompt on Android Chrome

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache OpenStreetMap tiles for offline map
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60*60*24*7 },
            },
          },
          {
            // Cache CARTO dark tiles
            urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'carto-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60*60*24*7 },
            },
          },
          {
            // Cache backend API responses
            urlPattern: ({ url }) => url.pathname.startsWith('/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      manifest: {
        // ── REQUIRED fields for install prompt ──────────────────────────────
        name:             'AegisRoad — Road Safety Platform',
        short_name:       'AegisRoad',
        description:      'AI-powered road hazard detection, civic accountability & drive mode alerts',
        start_url:        '/',
        scope:            '/',
        display:          'standalone',          // CRITICAL — must be standalone
        orientation:      'portrait-primary',
        theme_color:      '#0f1117',
        background_color: '#0f1117',
        lang:             'en',
        categories:       ['navigation', 'utilities', 'lifestyle'],

        // ── Icons — Chrome requires BOTH 192 AND 512 for install prompt ─────
        icons: [
          {
            src:     '/icons/icon-72.png',
            sizes:   '72x72',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/icons/icon-96.png',
            sizes:   '96x96',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/icons/icon-128.png',
            sizes:   '128x128',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/icons/icon-192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any',                       // REQUIRED
          },
          {
            src:     '/icons/icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any',                       // REQUIRED
          },
          {
            src:     '/icons/icon-512-maskable.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable',                  // For Android adaptive icons
          },
        ],

        // ── Shortcuts (appear in long-press menu on Android) ──────────────
        shortcuts: [
          {
            name:       'Drive Mode',
            short_name: 'Drive',
            url:        '/?mode=drive',
            description:'Start hazard-aware navigation',
            icons: [{ src:'/icons/icon-96.png', sizes:'96x96' }],
          },
          {
            name:       'Hazard Map',
            short_name: 'Map',
            url:        '/?tab=map',
            description:'View live road hazards near you',
            icons: [{ src:'/icons/icon-96.png', sizes:'96x96' }],
          },
          {
            name:       'AegisChat',
            short_name: 'Chat',
            url:        '/?tab=chat',
            description:'Ask about road conditions',
            icons: [{ src:'/icons/icon-96.png', sizes:'96x96' }],
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet:  ['leaflet', 'react-leaflet'],
          charts:   ['recharts'],
          motion:   ['framer-motion'],
        },
      },
    },
  },
})
