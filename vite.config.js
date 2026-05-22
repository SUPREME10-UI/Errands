import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'public/index.html'),
        services:  resolve(__dirname, 'public/services.html'),
        dashboard: resolve(__dirname, 'public/dashboard.html'),
        contact:   resolve(__dirname, 'public/contact.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
