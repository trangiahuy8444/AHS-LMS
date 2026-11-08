import { createWebSandboxRuntime } from './webSandboxEnvironment.js';

// Chế độ thử được chọn lúc khởi động máy chủ, không lấy từ tham số URL.
export function createRuntimeEnvironment({ sandbox, hostname, port, protocol, sessionId }) {
  if (!sandbox) {
    if (['ahs-lms-sandbox.web.app','ahs-lms-sandbox.firebaseapp.com'].includes(hostname)) {
      throw new Error('Website thử nhận nhầm bản dựng; đã dừng để không kết nối hệ thống học sinh.');
    }
    return null;
  }
  if (!['localhost', '127.0.0.1'].includes(hostname) || port !== '5188' || protocol !== 'http:' || !sessionId) {
    throw new Error('Hệ thống thử chỉ chạy tại localhost hoặc 127.0.0.1:5188 bằng trình khởi động cục bộ.');
  }
  return Object.freeze({ mode: 'local-sandbox', projectId: 'demo-ahs-local', host: '127.0.0.1', authPort: 9098, firestorePort: 8188, sessionId });
}

export function prepareSandboxStorage(storage, runtime) {
  if (!runtime || storage.getItem('ahs_sandbox_run') === runtime.sessionId) return;
  for (const key of Object.keys(storage)) {
    if (key.startsWith('ahs_') || key.startsWith('asian_school_')) storage.removeItem(key);
  }
  storage.setItem('ahs_sandbox_run', runtime.sessionId);
}

export function installRuntimeEnvironment() {
  let webConfig;
  if (import.meta.env.MODE === 'sandbox-web') {
    try { webConfig = JSON.parse(import.meta.env.VITE_AHS_SANDBOX_FIREBASE_CONFIG || '{}'); }
    catch { throw new Error('Cấu hình website thử không hợp lệ.'); }
  }
  const runtime = import.meta.env.MODE === 'sandbox-web' ? createWebSandboxRuntime({
    firebaseConfig: webConfig, hostname: window.location.hostname, protocol: window.location.protocol
  }) : createRuntimeEnvironment({
    sandbox: import.meta.env.MODE === 'sandbox',
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    sessionId: import.meta.env.VITE_AHS_SANDBOX_SESSION_ID
  });
  if (runtime?.mode === 'local-sandbox') {
    prepareSandboxStorage(window.localStorage, runtime);
    prepareSandboxStorage(window.sessionStorage, runtime);
  }
  Object.defineProperty(window, 'AsianSchoolRuntime', { value: runtime, writable: false, configurable: false });
}
