const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function harness({ submitted = false, extraTimeSeconds = 300, locked = false, transactionError, durationMinutes = 45, configDurationMinutes = 45 } = {}) {
  const updates = [], reads = [];
  const attempt = { uid: 'fake-owner', grade: 8, studentId: '999999', studentClass: '8/19', fullName: 'Học Sinh Giả', examCode: '101', attemptsUsed: 1,
    deviceChanges: 0, submitted, locked, extraTimeSeconds, durationMinutes, startedAt: { seconds: 1700000000 }, violations: 0 };
  const ref = { async get(options) { reads.push(options); return { exists: true, data: () => attempt, metadata: { fromCache: false, hasPendingWrites: false } }; },
    async update(data) { updates.push(data); Object.assign(attempt, data); }, async set() {} };
  const db = { enablePersistence: () => Promise.resolve(), collection(name) { return { doc(id) {
    if (name === 'exam_attempts') return ref;
    if (name === 'exam_config') return { get: async () => ({ exists: true, data: () => ({ defaultClassMode: 'both_open', activeCodes: { 8: ['101'] }, classMapping: { '8/19': '101' }, examDurationMinutes: configDurationMinutes }) }) };
    return { path: `${name}/${id}`, set: async () => {}, get: async () => ({ exists: true, data: () => ({ exam: {} }) }) };
  } }; }, async runTransaction(fn) {
    if (transactionError) throw transactionError;
    return fn({ get: r => r.get({ source: 'server' }), update: (r, data) => { updates.push(data); Object.assign(attempt, data); } });
  } };
  const firestore = Object.assign(() => db, { FieldValue: { serverTimestamp: () => 'SERVER_TIME', increment: n => n, delete: () => 'DELETE' } });
  const window = { location: { pathname: '/test/' }, dispatchEvent() {} };
  const auth = { currentUser: { uid: 'fake-owner' }, onAuthStateChanged() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/firebase-config.js'), 'utf8'), {
    window, document: { readyState: 'loading', addEventListener() {} }, CustomEvent: class {}, console: { log() {}, warn() {} },
    firebase: { apps: [{}], app: () => ({}), firestore, auth: () => auth }, setTimeout, clearTimeout
  });
  return { cloud: window.AsianSchoolCloud, updates, reads, attempt };
}

test('reload lượt thi phục hồi tổng giờ được giáo viên cộng từ máy chủ', async () => {
  const h = harness({ extraTimeSeconds: 600 });
  const start = await h.cloud.startExam({ grade: 8, studentId: '999999', studentClass: '8/19', password: 'fake-password' });
  assert.equal(start.durationMinutes, 55);
  assert.equal(start.baseDurationSeconds, 2700);
  assert.equal(start.extraTimeSeconds, 600);
  assert.equal(start.deadlineMs, 1700000000000 + 3300000);
});
test('gia hạn chính thức cộng vào giá trị hiện hành trong transaction', async () => {
  const h = harness({ extraTimeSeconds: 300 });
  const result = await h.cloud.extendExamTime({ grade: 8, studentId: '999999', minutes: 5 });
  assert.equal(result.applied, true);
  assert.equal(result.extraTimeSeconds, 600);
  assert.equal(h.updates.length, 1);
  assert.equal(h.updates[0].extraTimeSeconds, 600);
});
test('gia hạn bỏ qua lượt đã nộp kể cả khi live session còn hiện đang làm', async () => {
  const h = harness({ submitted: true });
  const result = await h.cloud.extendExamTime({ grade: 8, studentId: '999999', minutes: 5 });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'submitted');
  assert.equal(h.updates.length, 0);
});
test('gia hạn lỗi máy chủ không trả kết quả thành công', async () => {
  const h = harness({ transactionError: new Error('permission-denied') });
  await assert.rejects(h.cloud.extendExamTime({ grade: 8, studentId: '999999', minutes: 5 }), /permission-denied/);
  assert.equal(h.updates.length, 0);
});

 test('reload dùng thời lượng đã chụp trên lượt, không đổi theo cấu hình mới', async () => {
  const h = harness({ durationMinutes: 45, configDurationMinutes: 60, extraTimeSeconds: 300 });
  const start = await h.cloud.startExam({ grade: 8, studentId: '999999', studentClass: '8/19', password: 'fake-password' });
  assert.equal(start.durationMinutes, 50);
  assert.equal(start.baseDurationSeconds, 2700);
});
 test('retake chụp cấu hình hiện tại và reset giờ gia hạn của lượt cũ', async () => {
  const h = harness({ submitted: true, extraTimeSeconds: 600, configDurationMinutes: 60 });
  h.attempt.allowedAttempts = 2;
  const start = await h.cloud.startExam({ grade: 8, studentId: '999999', studentClass: '8/19', password: 'fake-password' });
  assert.equal(h.attempt.durationMinutes, 60);
  assert.equal(h.attempt.extraTimeSeconds, 0);
  assert.equal(start.durationMinutes, 60);
});
