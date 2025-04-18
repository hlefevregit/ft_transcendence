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
    hmr: {
			protocol: 'wss',
			host: 'localhost',
			port: 5173,
		},
    proxy: {
      '/api': {
        target: 'https://backend:3000',
        changeOrigin: true,
        secure: false
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
