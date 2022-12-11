import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 8000,
    proxy: {
      '/api': 'http://localhost:3000',
    }
  },
  build: {
    target: 'esnext',
  },
});
