import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/gm/',
  build: {
    outDir: '../../docs/gm',
    emptyOutDir: true,
  },
})
