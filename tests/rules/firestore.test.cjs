const { test, before, after, beforeEach } = require('node:test');
const fs = require('node:fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, updateDoc, serverTimestamp, deleteField, writeBatch } = require('node:module').createRequire(require.resolve('@firebase/rules-unit-testing'))('firebase/firestore');
let env;
const projectId = 'demo-ahs-rules';
const attempt = { grade: 8, studentId: '100001', studentClass: '8/19', fullName: 'Hoc Sinh Gia', uid: 'owner', examCode: '101', attemptsUsed: 1, submitted: true, startedAt: new Date(), deviceChanges: 0, allowedAttempts: 2, locked: true };
const live = { sessionId: 'session-owner-tab1', uid: 'owner', grade: 8, studentId: '100001', studentClass: '8/19', fullName: 'Hoc Sinh Gia', mode: 'practice', status: 'practicing', examCode: 'DE_CUONG', violations: 0, lastPing: Date.now(), timeLeft: 'Tự do' };
const db = (uid) => uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
const teacher = () => env.authenticatedContext('teacher', { email: 'trangiahuy8444@gmail.com', email_verified: true }).firestore();
before(async () => {
  if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') throw new Error('Rules tests require local emulator 127.0.0.1:8080');
  env = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8080, rules: fs.readFileSync('firestore.rules', 'utf8') } });
});
after(async () => { if (env) await env.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const d = ctx.firestore();
    await Promise.all([
      setDoc(doc(d, 'exam_config/global_config'), { classAccessControl: { '8/19': 'both_open' }, activeCodes: { '8': ['101', '102'] }, classMapping: { '8/19': '101' } }),
      setDoc(doc(d, 'exam_secrets/room'), { examPassword: 'fake-room' }),
      setDoc(doc(d, 'exam_keys/owner'), { password: 'fake-room' }),
      setDoc(doc(d, 'exam_attempts/g8_100001'), attempt),
      setDoc(doc(d, 'exam_bank/g8_101'), { exam: { fake: true } }),
      setDoc(doc(d, 'exam_public/g8_101'), { exam: { fake: true } }),
      setDoc(doc(d, 'exam_public/g8_102'), { exam: { fake: true } }),
      setDoc(doc(d, 'exam_sessions/owner'), { attemptId: 'g8_100001', examDocId: 'g8_101' })
    ]);
  });
});
function retake(d) { return updateDoc(doc(d, 'exam_attempts/g8_100001'), { attemptsUsed: 2, submitted: false, startedAt: serverTimestamp(), examCode: '101', submittedAt: deleteField(), violations: 0, locked: false, lockCount: 0, lockReason: deleteField(), durationMinutes: 45, extraTimeSeconds: 0 }); }
test('locked submitted attempt cannot retake until teacher unlocks', async () => {
  await assertFails(retake(db('owner')));
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_attempts/g8_100001'), { locked: false }));
  await assertSucceeds(retake(db('owner')));
});
test('exhausted allowance still denies retake', async () => {
  await env.withSecurityRulesDisabled(ctx => updateDoc(doc(ctx.firestore(), 'exam_attempts/g8_100001'), { locked: false, allowedAttempts: 1 }));
  await assertFails(retake(db('owner')));
});
test('official answers and room secrets are teacher only', async () => {
  for (const path of ['exam_bank/g8_101', 'exam_secrets/room']) {
    await assertFails(getDoc(doc(db('owner'), path)));
    await assertFails(getDoc(doc(db(null), path)));
    await assertSucceeds(getDoc(doc(teacher(), path)));
  }
});
test('public exam is restricted to active unlocked assigned attempt', async () => {
  await assertFails(getDoc(doc(db('owner'), 'exam_public/g8_101')));
  await env.withSecurityRulesDisabled(ctx => updateDoc(doc(ctx.firestore(), 'exam_attempts/g8_100001'), { locked: false, submitted: false }));
  await assertSucceeds(getDoc(doc(db('owner'), 'exam_public/g8_101')));
  await assertFails(getDoc(doc(db('owner'), 'exam_public/g8_102')));
  await assertFails(getDoc(doc(db('other'), 'exam_public/g8_101')));
});
test('students cannot write grades or create proctor commands', async () => {
  await assertFails(setDoc(doc(db('owner'), 'submissions/fake'), { uid: 'owner', finalScore: 10 }));
  await assertFails(setDoc(doc(db('owner'), 'proctor_commands/fake'), { targetUid: 'owner', command: 'unlock_session' }));
});
test('live create and heartbeat merge accept current schema and per-tab id', async () => {
  await assertSucceeds(setDoc(doc(db('owner'), 'live_sessions/' + live.sessionId), live));
  await assertSucceeds(setDoc(doc(db('owner'), 'live_sessions/' + live.sessionId), { lastPing: Date.now(), violations: 1 }, { merge: true }));
});
test('live rejects unknown fields on create and update', async () => {
  const ref = doc(db('owner'), 'live_sessions/' + live.sessionId);
  await assertFails(setDoc(ref, { ...live, arbitraryPayload: 'unexpected' }));
  await assertSucceeds(setDoc(ref, live));
  await assertFails(updateDoc(ref, { arbitraryPayload: 'unexpected' }));
});
test('live rejects oversized name, invalid count and mismatched id', async () => {
  const ref = doc(db('owner'), 'live_sessions/' + live.sessionId);
  for (const extra of [{ fullName: 'x'.repeat(81) }, { violations: -1 }, { violations: '3' }, { sessionId: 'another' }, { uid: 'other' }]) await assertFails(setDoc(ref, { ...live, ...extra }));
});
test('live owner cannot read or update another owner session', async () => {
  await assertSucceeds(setDoc(doc(db('owner'), 'live_sessions/' + live.sessionId), live));
  await assertFails(getDoc(doc(db('other'), 'live_sessions/' + live.sessionId)));
  await assertFails(updateDoc(doc(db('other'), 'live_sessions/' + live.sessionId), { violations: 4 }));
  await assertSucceeds(getDoc(doc(teacher(), 'live_sessions/' + live.sessionId)));
});

test('new attempt accepts a valid room key and denies wrong room key', async () => {
  const d = db('owner');
  const fresh = { grade: 8, studentId: '100002', studentClass: '8/19', fullName: 'Hoc Sinh Gia', uid: 'owner', examCode: '101', attemptsUsed: 1, submitted: false, startedAt: serverTimestamp(), deviceChanges: 0, durationMinutes: 45, extraTimeSeconds: 0 };
  await assertSucceeds(setDoc(doc(d, 'exam_attempts/g8_100002'), fresh));
  await assertSucceeds(setDoc(doc(d, 'exam_keys/owner'), { password: 'wrong', at: serverTimestamp() }));
  await assertFails(setDoc(doc(d, 'exam_attempts/g8_100003'), { ...fresh, studentId: '100003' }));
});
test('unverified teacher email has no teacher privileges', async () => {
  const d = env.authenticatedContext('fake-teacher', { email: 'trangiahuy8444@gmail.com', email_verified: false }).firestore();
  await assertFails(getDoc(doc(d, 'exam_bank/g8_101')));
  await assertFails(updateDoc(doc(d, 'exam_attempts/g8_100001'), { locked: false }));
});
test('legacy live field stays immutable but does not block valid heartbeat merge', async () => {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'live_sessions/' + live.sessionId), { ...live, legacyUnknown: 'old-value' }));
  const ref = doc(db('owner'), 'live_sessions/' + live.sessionId);
  await assertSucceeds(setDoc(ref, { lastPing: Date.now(), violations: 1 }, { merge: true }));
  await assertFails(updateDoc(ref, { legacyUnknown: 'new-value' }));
  await assertFails(updateDoc(ref, { anotherUnknown: 'new-value' }));
});

async function seedActive(extra = {}) {
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), 'exam_attempts/g8_100001'), {
    ...attempt, submitted: false, locked: false, durationMinutes: 45, extraTimeSeconds: 300,
    startedAt: new Date(Date.now() - 60 * 60000), ...extra
  }));
}
async function submitActive(patch = {}) {
  const d = db('owner');
  const a = (await getDoc(doc(d, 'exam_attempts/g8_100001'))).data();
  const batch = writeBatch(d);
  batch.update(doc(d, 'exam_attempts/g8_100001'), { submitted: true, submittedAt: serverTimestamp() });
  batch.set(doc(d, 'submissions/g8_100001_1'), {
    id: 'g8_100001_1', uid: 'owner', attemptId: 'g8_100001', sessionId: 'test-session',
    fullName: a.fullName, studentClass: a.studentClass, studentId: a.studentId, grade: a.grade,
    mode: 'exam', examCode: a.examCode, attemptNumber: 1, deviceChanges: 0,
    answers: {}, violations: 0, startedAt: a.startedAt, durationMinutes: a.durationMinutes === undefined ? null : a.durationMinutes,
    extraTimeSeconds: a.extraTimeSeconds || 0, submittedAt: new Date().toISOString(), serverSubmittedAt: serverTimestamp(),
    isGraded: false, essayScores: {}, essayTotal: 0, teacherFeedback: '', ...patch
  });
  return batch.commit();
}
test('new attempts cannot invent duration or extra time', async () => {
  const fresh = { grade: 8, studentId: '100002', studentClass: '8/19', fullName: 'Hoc Sinh Gia', uid: 'owner', examCode: '101', attemptsUsed: 1, submitted: false, startedAt: serverTimestamp(), deviceChanges: 0, durationMinutes: 45, extraTimeSeconds: 0 };
  for (const patch of [{ durationMinutes: 90 }, { extraTimeSeconds: 300 }, { durationMinutes: 0 }]) {
    await assertFails(setDoc(doc(db('owner'), 'exam_attempts/g8_100002'), { ...fresh, ...patch }));
  }
});
test('only teacher can persist extra time; retake resets extension', async () => {
  await seedActive();
  await assertFails(updateDoc(doc(db('owner'), 'exam_attempts/g8_100001'), { extraTimeSeconds: 600 }));
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_attempts/g8_100001'), { extraTimeSeconds: 600 }));
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_attempts/g8_100001'), { submitted: true }));
  await assertSucceeds(retake(db('owner')));
  const saved = (await getDoc(doc(db('owner'), 'exam_attempts/g8_100001'))).data();
  require('node:assert/strict').equal(saved.extraTimeSeconds, 0);
});
test('late submission is accepted with server timing; forged duration and extension denied', async () => {
  await seedActive();
  await assertFails(submitActive({ durationMinutes: 90 }));
  await assertFails(submitActive({ extraTimeSeconds: 9999 }));
  await assertFails(submitActive({ isLate: false }));
  await assertSucceeds(submitActive());
});

test('legacy attempt without duration accepts submission but cannot invent deadline', async () => {
  await seedActive();
  await env.withSecurityRulesDisabled(ctx => updateDoc(doc(ctx.firestore(), 'exam_attempts/g8_100001'), { durationMinutes: deleteField(), extraTimeSeconds: deleteField() }));
  await assertFails(submitActive({ durationMinutes: 45 }));
  await assertSucceeds(submitActive());
});

test('student-choice permits an active code for the grade and denies inactive or other-grade codes', async () => {
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_config/global_config'), { codeAllocationMode: 'student_choice', 'activeCodes.9': ['104'] }));
  const fresh = { grade: 8, studentId: '100002', studentClass: '8/19', fullName: 'Hoc Sinh Gia', uid: 'owner', examCode: '102', attemptsUsed: 1, submitted: false, startedAt: serverTimestamp(), deviceChanges: 0, durationMinutes: 45, extraTimeSeconds: 0 };
  for (const code of ['999','104','']) await assertFails(setDoc(doc(db('owner'), 'exam_attempts/g8_100002'), { ...fresh, examCode: code }));
  await assertSucceeds(setDoc(doc(db('owner'), 'exam_attempts/g8_100002'), fresh));
  await assertSucceeds(setDoc(doc(db('owner'), 'exam_sessions/owner'), { attemptId: 'g8_100002', examDocId: 'g8_102' }));
  await assertSucceeds(getDoc(doc(db('owner'), 'exam_public/g8_102')));
  await assertFails(getDoc(doc(db('owner'), 'exam_public/g8_101')));
  await assertFails(updateDoc(doc(db('owner'), 'exam_attempts/g8_100002'), { examCode: '101' }));
});
test('student-choice retake requires allowance and cannot bypass lock', async () => {
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_config/global_config'), { codeAllocationMode: 'student_choice' }));
  const change = () => updateDoc(doc(db('owner'), 'exam_attempts/g8_100001'), { attemptsUsed: 2, submitted: false, startedAt: serverTimestamp(), examCode: '102', submittedAt: deleteField(), violations: 0, locked: false, lockCount: 0, lockReason: deleteField(), durationMinutes: 45, extraTimeSeconds: 0 });
  await assertFails(change());
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_attempts/g8_100001'), { locked:false,allowedAttempts:1 }));
  await assertFails(change());
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_attempts/g8_100001'), { allowedAttempts:2 }));
  await assertSucceeds(change());
});

test('student-choice takeover changes only device owner and keeps original code and attempt', async () => {
  await seedActive({ uid:'previous-device', examCode:'101' });
  await assertSucceeds(updateDoc(doc(teacher(), 'exam_config/global_config'), { codeAllocationMode:'student_choice' }));
  await assertFails(getDoc(doc(db('owner'), 'exam_attempts/g8_100001')));
  await assertSucceeds(updateDoc(doc(db('owner'), 'exam_attempts/g8_100001'), { uid:'owner',deviceChanges:1 }));
  const saved = (await getDoc(doc(db('owner'), 'exam_attempts/g8_100001'))).data();
  require('node:assert/strict').equal(saved.examCode,'101');
  require('node:assert/strict').equal(saved.attemptsUsed,1);
  await assertFails(updateDoc(doc(db('owner'), 'exam_attempts/g8_100001'), { uid:'owner',deviceChanges:2,examCode:'102' }));
});

test('resuming an active exam requires the current room password', async () => {
  await seedActive();
  const d = db('owner');
  const session = doc(d, 'exam_sessions/owner');
  const data = { attemptId: 'g8_100001', examDocId: 'g8_101' };
  await assertSucceeds(setDoc(doc(d, 'exam_keys/owner'), { password: 'wrong' }));
  await assertFails(setDoc(session, data));
  await assertSucceeds(setDoc(doc(d, 'exam_keys/owner'), { password: ' FAKE-ROOM ' }));
  await assertSucceeds(setDoc(session, data));
});

function reminderCloud(database, uid) {
  const { createRequire } = require('node:module');
  const firebase = createRequire(require.resolve('@firebase/rules-unit-testing'))('firebase/compat/app');
  const window = { location: { pathname: '/admin/' }, dispatchEvent() {} };
  const firestore = Object.assign(() => database, { FieldValue: firebase.firestore.FieldValue });
  const run = new Function('window', 'firebase', 'document', 'CustomEvent', 'console', fs.readFileSync('src/core/firebase-config.js', 'utf8'));
  run(window, { apps: [{}], app: () => ({}), firestore, auth: () => ({ currentUser: { uid }, onAuthStateChanged() {} }) },
    { readyState: 'loading', addEventListener() {} }, class {}, { log() {}, warn() {} });
  return window.AsianSchoolCloud;
}

function waitForReminder(cloud, target, count) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { unsubscribe(); reject(new Error('Reminder snapshot timed out')); }, 5000);
    const unsubscribe = cloud.watchTeacherReminder(target, value => {
      if (value?.count === count) { clearTimeout(timeout); unsubscribe(); resolve(value); }
    });
  });
}

test('official teacher reminders are atomic, idempotent, protected and readable on legacy attempts', async () => {
  await seedActive({ violations: 0, locked: false });
  const t = teacher();
  const liveExam = { ...live, mode: 'exam', status: 'in_progress' };
  await assertSucceeds(setDoc(doc(db('owner'), 'live_sessions/' + live.sessionId), liveExam));
  const cloud = reminderCloud(t, 'teacher');
  const target = { ...liveExam, message: 'Em tập trung làm bài.', requestId: 'exam-reminder-1' };
  const counts = await Promise.all([
    cloud.recordTeacherReminder(target),
    cloud.recordTeacherReminder({ ...target, requestId: 'exam-reminder-2' })
  ]);
  require('node:assert/strict').deepEqual(counts.map(x => x.count).sort(), [1, 2]);
  await cloud.recordTeacherReminder(target);
  const saved = (await getDoc(doc(t, 'exam_attempts/g8_100001'))).data();
  require('node:assert/strict').equal(saved.teacherReminder.count, 2);
  require('node:assert/strict').equal(saved.violations, 0);
  require('node:assert/strict').equal(saved.locked, false);
  const student = db('owner');
  await assertFails(updateDoc(doc(student, 'exam_attempts/g8_100001'), { 'teacherReminder.count': 0 }));
  await assertFails(updateDoc(doc(student, 'live_sessions/' + live.sessionId), { 'teacherReminder.count': 0 }));
  await assertSucceeds(updateDoc(doc(student, 'live_sessions/' + live.sessionId), { lastPing: Date.now() }));
  const received = await waitForReminder(reminderCloud(student, 'owner'), target, 2);
  require('node:assert/strict').equal(received.message, 'Em tập trung làm bài.');
});

test('practice reminders survive live recreation and stay separate for the same LMS in different classes', async () => {
  const t = teacher();
  const { deleteDoc } = require('node:module').createRequire(require.resolve('@firebase/rules-unit-testing'))('firebase/firestore');
  const other = { ...live, sessionId: 'session-other-tab', uid: 'other', studentClass: '8/20' };
  await assertSucceeds(setDoc(doc(db('owner'), 'live_sessions/' + live.sessionId), live));
  await assertSucceeds(setDoc(doc(db('other'), 'live_sessions/' + other.sessionId), other));
  const cloud = reminderCloud(t, 'teacher');
  await cloud.recordTeacherReminder({ ...live, message: 'Nhắc lớp 8/19.', requestId: 'practice-owner' });
  await cloud.recordTeacherReminder({ ...other, message: 'Nhắc lớp 8/20.', requestId: 'practice-other' });
  const student = db('owner');
  await assertFails(updateDoc(doc(student, 'proctor_commands/reminder-state-' + live.sessionId), { 'payload.reminder.count': 0 }));
  await assertFails(getDoc(doc(student, 'proctor_commands/reminder-state-' + other.sessionId)));
  await assertSucceeds(deleteDoc(doc(student, 'live_sessions/' + live.sessionId)));
  const received = await waitForReminder(reminderCloud(student, 'owner'), live, 1);
  require('node:assert/strict').equal(received.message, 'Nhắc lớp 8/19.');
  await assertSucceeds(setDoc(doc(student, 'live_sessions/' + live.sessionId), live));
  const next = await cloud.recordTeacherReminder({ ...live, message: 'Nhắc lần hai.', requestId: 'practice-owner-2' });
  require('node:assert/strict').equal(next.count, 2);
  const teacherView = await waitForReminder(cloud, live, 2);
  require('node:assert/strict').equal(teacherView.message, 'Nhắc lần hai.');
});

test('guidance merges only the selected mode and students cannot edit it', async () => {
  const ref = doc(teacher(), 'exam_config/global_config');
  await assertSucceeds(setDoc(ref, { studentGuidance: { exam: { title: 'Thi', body: 'Nội quy riêng' } } }, { merge: true }));
  await assertSucceeds(setDoc(ref, { studentGuidance: { practice: { title: 'Ôn tập', body: 'Hoàn thành 3 lần.' } } }, { merge: true }));
  const saved = (await getDoc(ref)).data();
  require('node:assert/strict').equal(saved.studentGuidance.exam.body, 'Nội quy riêng');
  require('node:assert/strict').equal(saved.studentGuidance.practice.body, 'Hoàn thành 3 lần.');
  await assertFails(updateDoc(doc(db('owner'), 'exam_config/global_config'), { 'studentGuidance.practice.body': 'Tự sửa' }));
});
