import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to '/fatehub/' for GitHub Pages deployment
  // For local dev without the base path, set to '/'
  base: '/Fatehub/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
