import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Ba trang tĩnh trên GitHub Pages: https://trangiahuy8444.github.io/AHS-LMS/{,test/,admin/}
export default defineConfig({
  base: '/AHS-LMS/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        test: resolve(import.meta.dirname, 'test/index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html')
      }
    }
  }
});
