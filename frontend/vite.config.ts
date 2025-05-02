import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


export default defineConfig({
  root: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      host: 'localhost',
      clientPort: 8080,
      path: '/@vite/client',
    },
    proxy: {
      '/api': {
        target: 'https://backend:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/wss': {
        target: 'wss://backend:3000',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
