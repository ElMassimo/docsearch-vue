import { defineConfig } from 'vitest/config'

import packageMetadata from './package.json'

export default defineConfig({
  define: {
    __DOCSEARCH_VUE_VERSION__: JSON.stringify(packageMetadata.version)
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    exclude: ['tests/e2e/**', '**/node_modules/**', '**/dist/**']
  }
})
