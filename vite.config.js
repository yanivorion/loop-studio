import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/loop-studio/',
  server: {
    host: true,
    port: 3000
  }
});
