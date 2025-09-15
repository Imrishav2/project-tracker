import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
  },
  define: {
    // This will allow us to use environment variables in our code
    __APP_ENV__: JSON.stringify(process.env.APP_ENV || 'development'),
  },
});