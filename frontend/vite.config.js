import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // No strictPort — will auto try 5174, 5175... if 5173 is busy
  },
})
