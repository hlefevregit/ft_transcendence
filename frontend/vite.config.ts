import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: './',  // Assurez-vous que c'est le dossier où se trouve index.html
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      // Redirige les appels à /api vers le backend
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
      }
    }
  }
})
