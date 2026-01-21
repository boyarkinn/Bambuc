import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://90.156.225.111:5051',
        changeOrigin: true,
      },
      '/v1': {
        target: 'http://90.156.225.111',
        changeOrigin: true,
      },
    },
  },
})
