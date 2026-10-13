
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://zumrah-api-c9guedfya3bdgga3.germanywestcentral-01.azurewebsites.net',
        changeOrigin: true,
      },
    },
  },
})