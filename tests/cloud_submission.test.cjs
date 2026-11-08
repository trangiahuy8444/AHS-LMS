const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function cloudHarness({ submitted = false, metadata = {}, readError, commitError, locked = false, durationMinutes, extraTimeSeconds, configDurationMinutes = 45, withArchive = false } = {}) {
  const reads = [], writes = [], updates = [];
  const attempt = { uid: 'fake-owner', fullName: 'Học Sinh Giả', studentClass: '8/1', studentId: '999999',
    examCode: '101', attemptsUsed: 1, allowedAttempts: 2, submitted, locked, violations: 3,
    durationMinutes, extraTimeSeconds, startedAt: { seconds: Math.floor(Date.now() / 1000) - 60 } };
  const ref = {
    id: 'g8_999999', path: 'exam_attempts/g8_999999',
    async get(options) { reads.push(options); if (readError) throw readError; return { exists: true, metadata, data: () => attempt }; },
    async update(data) { updates.push(data); },
    async set(data) { updates.push(data); }
  };
  const db = {
    enablePersistence: () => Promise.resolve(),
    collection(name) { return { doc(id) {
      if (name === 'exam_attempts') return ref;
      if (name === 'exam_config') return { get: async () => ({ exists: true, data: () => ({ defaultClassMode: 'both_open', activeCodes: { 8: ['101'] }, classMapping: { '8/1': '101' }, examDurationMinutes: configDurationMinutes }) }) };
      return { path: `${name}/${id}`, set: async () => {}, get: async () => ({ exists: true, data: () => ({ exam: {} }) }) };
    } }; },
    batch() { return { update: (...args) => writes.push(['update', ...args]), set: (...args) => writes.push(['set', ...args]),
      commit: async () => { if (commitError) throw commitError; if (writes.some(w => w[0] === 'update' && w[2]?.submitted === true)) attempt.submitted = true; } }; }
  };
  const firestore = Object.assign(() => db, { FieldValue: { serverTimestamp: () => 'SERVER_TIME', increment: n => n, delete: () => 'DELETE' } });
  const auth = { currentUser: { uid: 'fake-owner' }, onAuthStateChanged() {} };
  const window = { location: { pathname: '/test/' }, dispatchEvent() {} };
  const context = { window, document: { readyState: 'loading', addEventListener() {} }, CustomEvent: class {},
    console: { log() {}, warn() {} }, firebase: { apps: [{}], app: () => ({}), firestore, auth: () => auth },
    setTimeout: (fn, ms) => { const t = setTimeout(fn, ms); t.unref(); return t; }, clearTimeout };
  if (withArchive) vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/drive-archive.js'), 'utf8'), context);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/firebase-config.js'), 'utf8'), context);
  return { cloud: window.AsianSchoolCloud, reads, writes, updates, attempt };
}
const input = { grade: 8, studentId: '999999', sessionId: 'fake-session', answers: { mcq: { 1: 2 }, tf: {}, essay: {} } };

test('submitExam yêu cầu đọc máy chủ trước khi xác nhận đã nộp và retry không ghi đè', async () => {
  const h = cloudHarness({ submitted: true });
  const result = await h.cloud.submitExam(input);
  assert.equal(h.reads[0]?.source, 'server');
  assert.equal(result.submissionId, 'g8_999999_1');
  assert.equal(h.writes.length, 0);
});

for (const metadata of [{ fromCache: true }, { hasPendingWrites: true }]) {
  test(`submitExam không xác nhận snapshot chưa được máy chủ xác thực ${JSON.stringify(metadata)}`, async () => {
    const h = cloudHarness({ submitted: true, metadata });
    await assert.rejects(h.cloud.submitExam(input), /máy chủ|xác nhận/);
    assert.equal(h.writes.length, 0);
  });
}

test('submitExam ghi ID ổn định, sessionId và tổng vi phạm máy chủ; không gửi điểm', async () => {
  const h = cloudHarness();
  const result = await h.cloud.submitExam(input);
  const payload = h.writes.find(w => w[0] === 'set')[2];
  assert.equal(result.submissionId, 'g8_999999_1');
  assert.equal(payload.sessionId, 'fake-session');
  assert.equal(payload.violations, 3);
  assert.equal(payload.score, undefined);
  assert.equal(h.writes.filter(w => w[0] === 'set').length, 1);
});

test('submitExam lỗi mạng không báo thành công và không ghi bài từ cache', async () => {
  const h = cloudHarness({ readError: new Error('offline') });
  await assert.rejects(h.cloud.submitExam(input));
  assert.equal(h.writes.length, 0);
});

test('startExam không tự reset khóa để dùng lượt được cấp thêm', async () => {
  const h = cloudHarness({ submitted: true, locked: true });
  await assert.rejects(h.cloud.startExam({ ...input, studentClass: '8/1', fullName: 'Học Sinh Giả' }), /khóa|giám thị/);
  assert.equal(h.updates.length, 0);
});

test('submitExam commit thất bại không báo đã nộp', async () => {
  const h = cloudHarness({ commitError: new Error('write denied') });
  await assert.rejects(h.cloud.submitExam(input), /write denied/);
  assert.equal(h.attempt.submitted, false);
});

test('submitExam retry sau xác nhận thành công giữ cùng ID và không ghi đè lần hai', async () => {
  const h = cloudHarness();
  const first = await h.cloud.submitExam(input);
  const second = await h.cloud.submitExam({ ...input, answers: { mcq: { 1: 0 } } });
  assert.equal(first.submissionId, second.submissionId);
  assert.equal(h.writes.filter(w => w[0] === 'set').length, 1);
  assert.equal(h.writes.find(w => w[0] === 'set')[2].answers.mcq[1], 2);
});

 test('bài nộp ghi thời lượng và tổng gia hạn từ lượt máy chủ, bỏ qua giá trị học sinh tự gửi', async () => {
  const h = cloudHarness({ durationMinutes: 45, extraTimeSeconds: 600, configDurationMinutes: 90 });
  await h.cloud.submitExam({ ...input, durationMinutes: 999, extraTimeSeconds: 999999, isLate: false });
  const payload = h.writes.find(w => w[0] === 'set')[2];
  assert.equal(payload.durationMinutes, 45);
  assert.equal(payload.extraTimeSeconds, 600);
  assert.equal(payload.isLate, undefined);
  assert.equal(payload.serverSubmittedAt, 'SERVER_TIME');
});
 test('lượt legacy thiếu durationMinutes không suy hạn từ cấu hình hiện hành', async () => {
  const h = cloudHarness({ configDurationMinutes: 60 });
  await h.cloud.submitExam(input);
  const payload = h.writes.find(w => w[0] === 'set')[2];
  assert.equal(payload.durationMinutes, null);
  assert.equal(payload.extraTimeSeconds, 0);
});

test('real archive helper enqueues attempt and submission jobs in the canonical submit commit', async () => {
  const h = cloudHarness({withArchive:true});
  const result = await h.cloud.submitExam(input);
  assert.equal(result.submissionId,'g8_999999_1');
  assert.equal(h.writes.length,4);
  const jobs=h.writes.filter(w=>w[0]==='set'&&w[1].path?.startsWith('drive_archive_jobs/'));
  assert.equal(jobs.length,2);
  assert.deepEqual(jobs.map(w=>w[1].path),['drive_archive_jobs/exam_attempts_g8_999999','drive_archive_jobs/submissions_g8_999999_1']);
  for(const write of jobs) {
    assert.equal(write[2].grade,8);assert.equal(write[2].studentClass,'8/1');
    assert.equal(write[2].pending,true);assert.equal(write[2].revision,1);
    assert.equal(write[2].answers,undefined);assert.equal(write[3].merge,true);
  }
});
test('real archive helper commits violation increment with the matching attempt job', async () => {
  const h=cloudHarness({withArchive:true});
  const ok=await h.cloud.reportViolation({grade:8,studentClass:'8/1',studentId:'999999',lock:true});
  assert.equal(ok,true);assert.equal(h.writes.length,2);
  const update=h.writes.find(w=>w[0]==='update');
  assert.equal(update[2].violations,1);assert.equal(update[2].locked,true);
  const job=h.writes.find(w=>w[1].path==='drive_archive_jobs/exam_attempts_g8_999999');
  assert.equal(job[2].pending,true);assert.equal(job[2].studentClass,'8/1');
});
