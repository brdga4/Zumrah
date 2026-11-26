import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));
const studentSource = fileURLToPath(
  new URL('../student-pwa/src', import.meta.url),
);

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@student': studentSource,
    },

    dedupe: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },

  server: {
    fs: {
      allow: [frontendRoot],
    },

    proxy: {
      '/api': {
        target: 'https://api.zumrah.tech',
        changeOrigin: true,
      },

      '/hubs': {
        target: 'https://api.zumrah.tech',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});