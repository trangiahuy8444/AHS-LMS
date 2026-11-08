import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { validateWebSandboxFirebaseConfig, WEB_SANDBOX_PROJECT_ID } from './src/shared/webSandboxEnvironment.js';

export default defineConfig(({ mode }) => {
  const isWebSandbox = mode === 'sandbox-web';
  const isSandbox = mode === 'sandbox' || isWebSandbox;
  if (isWebSandbox) {
    const env = loadEnv(mode, import.meta.dirname, 'VITE_');
    let config;
    try { config = JSON.parse(env.VITE_AHS_SANDBOX_FIREBASE_CONFIG || '{}'); }
    catch { throw new Error('Cấu hình bản dựng website thử không hợp lệ.'); }
    validateWebSandboxFirebaseConfig(config);
  }
  return {
    resolve: { alias: isSandbox ? [
      { find: /^(?:.*\/)?core\/roster-data\.js$/, replacement: resolve(import.meta.dirname, 'src/sandbox/roster-data.js') },
      { find: /^(?:.*\/)?data\/questions_grade(?:8|9|10)\.js$/, replacement: resolve(import.meta.dirname, 'src/sandbox/practiceData.js') }
    ] : [] },
    server: mode === 'sandbox' ? {
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' http://127.0.0.1:9098 http://127.0.0.1:8188 ws://localhost:5188 ws://127.0.0.1:5188"
      }
    } : {},
    base: isWebSandbox ? '/' : '/AHS-LMS/',
    plugins: [react(), ...(isWebSandbox ? [{
      name: 'sandbox-environment-marker',
      generateBundle() {
        this.emitFile({type:'asset',fileName:'sandbox-environment.json',source:JSON.stringify({mode:'sandbox-web',projectId:WEB_SANDBOX_PROJECT_ID})});
      },
      transformIndexHtml(html) { return html.replace(/<title>/, '<title>HỆ THỐNG THỬ — '); }
    }] : [])],
    test: { environment: 'jsdom', include: ['tests/**/*.test.jsx'] },
    build: {
      outDir: isWebSandbox ? 'dist-sandbox' : 'dist',
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          test: resolve(import.meta.dirname, 'test/index.html'),
          admin: resolve(import.meta.dirname, 'admin/index.html')
        }
      }
    }
  };
});
