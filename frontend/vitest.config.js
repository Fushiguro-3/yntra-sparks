import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Separate from vite.config.js (which wires the dev server's backend proxy
// and Tailwind's Vite plugin — neither of which the test runner needs) but
// still shares the `@` alias so test files can import exactly like app code.
export default mergeConfig(
  defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }),
  defineVitestConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.js'],
      css: false,
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**']
    }
  })
)
