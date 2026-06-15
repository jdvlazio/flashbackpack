import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' -> rutas relativas en dist/ para subida estática manual (Cloudflare).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
