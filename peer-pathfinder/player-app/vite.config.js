import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/GM-Dashboard-POC/player/',
  build: {
    outDir: '../../docs/player',
    emptyOutDir: true,
  },
})
