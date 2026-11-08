export const WEB_SANDBOX_PROJECT_ID = 'ahs-lms-sandbox';
const TEACHER_HOST = 'ahs-lms-sandbox.web.app';
const STUDENT_HOST = 'ahs-lms-sandbox.firebaseapp.com';

export function validateWebSandboxFirebaseConfig(config) {
  if (!config || config.projectId !== WEB_SANDBOX_PROJECT_ID || config.authDomain !== STUDENT_HOST || !config.apiKey || typeof config.apiKey !== 'string' || !config.appId || typeof config.appId !== 'string') {
    throw new Error('Thiếu cấu hình Firebase riêng của website thử; đã dừng, không kết nối hệ thống học sinh.');
  }
  return Object.freeze({...config});
}

export function createWebSandboxRuntime({ firebaseConfig, hostname, protocol }) {
  const config = validateWebSandboxFirebaseConfig(firebaseConfig);
  if (protocol !== 'https:' || ![TEACHER_HOST, STUDENT_HOST].includes(hostname)) {
    throw new Error('Bản thử trên web chỉ hoạt động tại hai địa chỉ HTTPS của dự án thử riêng.');
  }
  return Object.freeze({
    mode: 'web-sandbox', projectId: WEB_SANDBOX_PROJECT_ID, firebaseConfig: config,
    teacherUrl: `https://${TEACHER_HOST}/admin/`, studentUrl: `https://${STUDENT_HOST}/test/`
  });
}
