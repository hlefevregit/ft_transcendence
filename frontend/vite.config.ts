import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// import fs from 'fs';

// const patchBabylonGUI = () => {
//   const guiPath = path.resolve(__dirname, 'node_modules/@babylonjs/gui/2D');
//   if (!fs.existsSync(guiPath)) {
//     throw new Error('@babylonjs/gui/2D not found in node_modules');
//   }
// };
// patchBabylonGUI();

export default defineConfig({
  root: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  },
  optimizeDeps: {
    include: [
      '@babylonjs/core',
      '@babylonjs/gui/2D',
      '@babylonjs/loaders/glTF/glTFFileLoader',
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@babylonjs/gui/2D': path.resolve(__dirname, 'node_modules/@babylonjs/gui/2D'),
      '@babylonjs/glTF/glTFFileLoader': path.resolve(__dirname, 'node_modules/@babylonjs/glTF/glTFFileLoader')
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'c2r10p2',
      'c3r2p3',
      'c3r2p3.42nice.fr',
      'c3r2p4.42nice.fr',
      'c3r2p5.42nice.fr',
    ],
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
})
