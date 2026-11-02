const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function harness({ existing = false, submitted = false, mode = 'student_choice', locked = false, otherDevice = false } = {}) {
  let attempt = existing ? { grade: 8, studentId: '999999', studentClass: '8/19', fullName: 'Hoc Sinh Gia', uid: otherDevice ? 'other-device' : 'owner', examCode: '101', attemptsUsed: 1, allowedAttempts: 2, submitted, locked, deviceChanges: 0, startedAt: { seconds: 1700000000 }, durationMinutes: 45, extraTimeSeconds: 300 } : null;
  const writes = [], sessions = [];
  function apply(d) { for (const [k,v] of Object.entries(d)) attempt[k] = v?.increment ? attempt[k] + v.increment : v; }
  const ref = { get: async () => { if (attempt && attempt.uid !== 'owner') throw new Error('permission-denied'); return { exists: !!attempt, data: () => attempt }; }, set: async d => { writes.push(d); attempt = { ...d, startedAt: { seconds: 1700000000 } }; }, update: async d => { if (!attempt) throw new Error('not-found'); writes.push(d); apply(d); } };
  const db = { enablePersistence: async () => {}, collection(name) { return { doc(id) {
    if (name === 'exam_attempts') return ref;
    if (name === 'exam_config') return { get: async () => ({ exists: true, data: () => ({ codeAllocationMode: mode, defaultClassMode: 'both_open', examDurationMinutes: 45, activeCodes: { 8: ['101','102'], 9: ['104'] }, classMapping: { '8/19': '101' } }) }) };
    return { set: async d => { if (name === 'exam_sessions') sessions.push(d); }, get: async () => ({ exists: true, data: () => ({ exam: { code: id.split('_')[1] } }) }) };
  } }; } };
  const firestore = Object.assign(() => db, { FieldValue: { serverTimestamp: () => ({ seconds: 1700000000 }), increment: n => ({ increment:n }), delete: () => null } });
  const window = { location: { pathname:'/test/' }, dispatchEvent() {} };
  vm.runInNewContext(fs.readFileSync('src/core/firebase-config.js','utf8'), { window, document: { readyState:'loading', addEventListener() {} }, CustomEvent: class {}, firebase: { apps:[{}], app: () => ({}), firestore, auth: () => ({ currentUser: { uid:'owner' }, onAuthStateChanged() {} }) }, console: { log() {},warn() {} }, setTimeout,clearTimeout });
  return { cloud:window.AsianSchoolCloud, writes,sessions, attempt: () => attempt };
}
const input = { grade:8, studentId:'999999', studentClass:'8/19', fullName:'Hoc Sinh Gia', password:'fake-room' };
test('new student-choice attempt stores the selected active code and assigned public session', async () => {
  const h=harness(); const result=await h.cloud.startExam({ ...input, examCode:'102' });
  assert.equal(result.examCode,'102'); assert.equal(h.attempt().examCode,'102'); assert.equal(h.sessions[0].examDocId,'g8_102');
});
for (const code of [undefined,'','999','104',102]) test(`new choice rejects absent, inactive or wrong-grade code ${code}`, async () => {
  const h=harness(); await assert.rejects(h.cloud.startExam({ ...input,examCode:code }), /mã đề/i); assert.equal(h.writes.length,0);
});
test('resume preserves existing code even when another code is selected or choice is empty', async () => {
  for (const code of ['102','']) { const h=harness({existing:true}); const result=await h.cloud.startExam({...input,examCode:code}); assert.equal(result.examCode,'101'); assert.equal(h.writes.length,0); }
});
test('teacher-granted retake can choose another active code and resets extra time', async () => {
  const h=harness({existing:true,submitted:true}); const result=await h.cloud.startExam({...input,examCode:'102'}); assert.equal(result.examCode,'102'); assert.equal(h.attempt().extraTimeSeconds,0);
});
test('class assigned mode ignores requested student code', async () => {
  const h=harness({mode:'class_assigned'}); const result=await h.cloud.startExam({...input,examCode:'102'}); assert.equal(result.examCode,'101');
});

test('resume on another device accepts blank choice and preserves original code and attempt', async () => {
 const h=harness({existing:true,otherDevice:true}); const result=await h.cloud.startExam({...input,examCode:''});
 assert.equal(result.examCode,'101'); assert.equal(h.attempt().attemptsUsed,1); assert.equal(h.attempt().uid,'owner'); assert.equal(h.attempt().deviceChanges,1);
 assert.ok(h.writes.every(d=>!Object.hasOwn(d,'examCode')));
});
