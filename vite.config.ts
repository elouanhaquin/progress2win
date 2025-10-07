import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Prevent vite from obscuring rust errors
  clearScreen: false,
  // Use port 5173 for web mode, 1420 for Tauri
  server: {
    port: process.env.VITE_BACKEND_TYPE === 'express' ? 5173 : 1420,
    strictPort: false,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
})
