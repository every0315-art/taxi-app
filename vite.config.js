import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'タクシー営業',
        short_name: 'タクシー営業',
        description: 'タクシードライバー向け営業支援アプリ',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tetsudo\.rti-giken\.jp\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'train-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/train': {
        target: 'https://tetsudo.rti-giken.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/train/, ''),
      },
    },
  },
})
