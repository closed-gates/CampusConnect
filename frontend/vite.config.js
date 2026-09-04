import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix sockjs-client ReferenceError: global is not defined in browser
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // jsPDF v4 dynamically imports these optional peer deps for HTML-to-canvas
      // rendering. We don't use that feature (PDFs are generated programmatically),
      // so we stub them out with an empty module to prevent Vite import errors.
      'canvg': path.resolve(__dirname, 'src/stubs/empty.js'),
      'html2canvas': path.resolve(__dirname, 'src/stubs/empty.js'),
      'dompurify': path.resolve(__dirname, 'src/stubs/empty.js'),
    },
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


