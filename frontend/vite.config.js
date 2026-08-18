import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix sockjs-client ReferenceError: global is not defined in browser
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      // Forward all /api/* requests to the Spring Boot backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Forward WebSocket (SockJS) connections for real-time seat updates
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})


