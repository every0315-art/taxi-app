import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
