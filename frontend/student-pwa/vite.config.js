import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.zumrah.tech',
        changeOrigin: true,
      },
      // Proxy SignalR requests to the backend
      '/hubs': {
        target: 'https://api.zumrah.tech',
        changeOrigin: true,
        ws: true,
      }
    },
  },
})
