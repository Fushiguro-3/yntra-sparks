import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Dev-only proxy: keeps the browser's view of the app "same-site" with the
// backend so the httpOnly refresh cookie (no SameSite/Secure flags set
// server-side yet) behaves predictably instead of relying on cross-site
// cookie rules. Borrowed from Ervan's setup — swap for VITE_API_BASE_URL
// pointed at the real backend origin once we deploy.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
