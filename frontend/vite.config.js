import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // TODO: change to false in production
    proxy: {
      '/api': 'http://backend:8080', // backend container and port inside Docker network
    }

  },
});
