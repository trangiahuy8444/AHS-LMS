const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(mode = 'practice') {
  const live = { sessionId: 'fake-session', uid: 'fake-owner', grade: 8, studentClass: '8/19', studentId: '999999', fullName: 'Học Sinh Giả', mode, status: 'in_progress', violations: 2 };
  const attempt = { ...live, submitted: false, locked: false, startedAt: { seconds: 1700000000 } };
  const docs = new Map([['live_sessions/fake-session', live], ['exam_attempts/g8_8_19_999999', attempt]]);
  const db = {
    enablePersistence: async () => {},
    collection: collection => ({ doc: id => ({ path: `${collection}/${id}`, get: async () => ({ exists: docs.has(`${collection}/${id}`), data: () => docs.get(`${collection}/${id}`) }) }) }),
    runTransaction: async callback => callback({
      get: async ref => ({ exists: docs.has(ref.path), data: () => docs.get(ref.path) }),
      update: (ref, fields) => Object.assign(docs.get(ref.path), fields),
      set: (ref, data) => docs.set(ref.path, data)
    })
  };
  let queriedUid = null;
  const rawCollection = db.collection;
  db.collection = name => ({ ...rawCollection(name), where: (field, operator, uid) => { queriedUid = uid; return { onSnapshot: () => () => {} }; } });
  const window = { location: { pathname: '/admin/' }, dispatchEvent() {} };
  vm.runInNewContext(fs.readFileSync('src/core/firebase-config.js', 'utf8'), {
    window, firebase: { apps: [{}], app: () => ({}), firestore: Object.assign(() => db, { FieldValue: {} }), auth: () => ({ currentUser: { uid: 'fake-teacher' }, onAuthStateChanged() {} }) },
    document: { readyState: 'loading', addEventListener() {} }, CustomEvent: class {}, console: { log() {}, warn() {} }, setTimeout, clearTimeout
  });
  return { cloud: window.AsianSchoolCloud, docs, live, attempt, queriedUid: () => queriedUid };
}
const request = { sessionId: 'fake-session', grade: 8, studentClass: '8/19', studentId: '999999', uid: 'fake-owner', mode: 'practice', message: 'Em tập trung làm bài.', requestId: 'request-1' };
test('teacher reminders increment separately and a retried send is recorded only once', async () => {
  const h = setup();
  const first = await h.cloud.recordTeacherReminder(request);
  const retry = await h.cloud.recordTeacherReminder(request);
  assert.equal(first.count, 1); assert.equal(retry.count, 1);
  const second = await h.cloud.recordTeacherReminder({ ...request, requestId: 'request-2' });
  assert.equal(second.count, 2); assert.equal(h.live.violations, 2);
  assert.equal(h.live.isLocked, undefined);
  assert.equal(h.docs.size, 5);
});
test('official reminder persists on the current attempt and starts a new count for a new attempt', async () => {
  const h = setup('exam');
  await h.cloud.recordTeacherReminder({ ...request, mode: 'exam' });
  assert.equal(h.attempt.teacherReminder.count, 1);
  assert.equal(h.attempt.locked, false); assert.equal(h.attempt.violations, 2);
  h.attempt.startedAt = { seconds: 1700001000 };
  const next = await h.cloud.recordTeacherReminder({ ...request, mode: 'exam', requestId: 'request-new-attempt' });
  assert.equal(next.count, 1);
});
test('rejects stale targets, blank messages and submitted attempts', async () => {
  const h = setup('exam');
  await assert.rejects(h.cloud.recordTeacherReminder({ ...request, mode: 'exam', studentClass: '8/20' }));
  await assert.rejects(h.cloud.recordTeacherReminder({ ...request, mode: 'exam', message: '   ' }));
  h.attempt.submitted = true;
  await assert.rejects(h.cloud.recordTeacherReminder({ ...request, mode: 'exam' }));
  assert.equal(h.attempt.teacherReminder, undefined);
});

test('teacher watches the practice student UID rather than the teacher own UID', () => {
  const h = setup();
  h.cloud.watchTeacherReminder({ ...request, uid: 'fake-owner' }, () => {});
  assert.equal(h.queriedUid(), 'fake-owner');
});
