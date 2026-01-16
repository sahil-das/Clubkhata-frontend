import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update service worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
      manifest: {
        name: 'ClubKhata - Club Management',
        short_name: 'ClubKhata',
        description: 'Manage subscriptions, donations, and expenses for your club.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Makes it feel like a native app
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png', // Ensure you generate and add this to /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Ensure you generate and add this to /public
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Cache these file types for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Example: Cache specific API calls if needed (Optional)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/subscriptions'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-subscriptions-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})