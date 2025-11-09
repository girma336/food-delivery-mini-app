import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  base: '/', // Ensures relative paths
  server: {
    historyApiFallback: true, // Catches 404s in dev server
  },
  build: {
    outDir: 'dist', // Default, but explicit is good
  },
});
