import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // In development and preview, /api is forwarded to the local Express API.
  server: {
    port: 5173,
    proxy: { '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000' },
  },
  preview: {
    proxy: { '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
