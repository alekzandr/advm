import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/advm/',  // Update this to match your GitHub repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      }
    },
    // Generate source maps for debugging
    sourcemap: true
  },
  // Copy data files to dist
  publicDir: 'src/data',
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@js': resolve(__dirname, './src/js'),
      '@css': resolve(__dirname, './src/css'),
      '@data': resolve(__dirname, './src/data')
    }
  }
});
