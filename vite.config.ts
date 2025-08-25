import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig(async () => {
  // Use dynamic import to load ESM-only plugins safely when Vite bundles the config
  const { default: react } = await import('@vitejs/plugin-react')
  const { default: tailwind } = await import('@tailwindcss/vite')
  const { VitePWA } = await import('vite-plugin-pwa')

  return {
    plugins: [
      react(),
      tailwind(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        includeAssets: ['favicon.svg'],
        manifest: {
          id: '/?source=pwa',
          name: 'imHungryAF',
          short_name: 'imHungryAF',
          description: 'Influencer food recommendations near you',
          theme_color: '#ec4899',
          background_color: '#ffffff',
          start_url: '/?source=pwa',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            { src: '/icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: '/icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ],
          "categories": ["food", "lifestyle", "travel"]
        },
        workbox: {
          // Disable precache file scanning in dev to avoid Workbox warnings
          globPatterns: [],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-runtime',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 14 }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }
              }
            }
          ]
        }
      })
    ],
  }
})
