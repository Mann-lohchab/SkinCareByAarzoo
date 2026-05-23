import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Use relative asset paths in production by default so dist can be hosted
  // from a subpath (or opened directly) without broken /assets/* URLs.
  base: command === 'build' ? process.env.VITE_BASE_PATH || './' : '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          stream: ['@stream-io/video-react-sdk', 'stream-chat', 'stream-chat-react'],
          vendor: ['axios', 'zustand', 'three'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
}))
