const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function harness({ existing = false, submitted = false, mode = 'student_choice', locked = false, otherDevice = false, allowedAttempts = 2, submission = null, submissionError = false, attemptMetadata = {} } = {}) {
  let attempt = existing ? { grade: 8, studentId: '999999', studentClass: '8/19', fullName: 'Hoc Sinh Gia', uid: otherDevice ? 'other-device' : 'owner', examCode: '101', attemptsUsed: 1, allowedAttempts, submitted, locked, deviceChanges: 0, startedAt: { seconds: 1700000000 }, durationMinutes: 45, extraTimeSeconds: 300 } : null;
  const writes = [], sessions = [], reads = []; let receiptWatcher;
  function apply(d) { for (const [k,v] of Object.entries(d)) attempt[k] = v?.increment ? attempt[k] + v.increment : v; }
  const ref = { get: async () => { if (attempt && attempt.uid !== 'owner') throw new Error('permission-denied'); return { exists: !!attempt, metadata: attemptMetadata, data: () => attempt }; }, set: async d => { writes.push(d); attempt = { ...d, startedAt: { seconds: 1700000000 } }; }, update: async d => { if (!attempt) throw new Error('not-found'); writes.push(d); apply(d); } };
  const db = { enablePersistence: async () => {}, collection(name) { return { doc(id) {
    reads.push(name);
    if (name === 'submissions') return {onSnapshot:(_,callback)=>{receiptWatcher=callback;return ()=>{};},get:async()=>{if(submissionError)throw new Error('permission-denied');return {exists:!!submission,metadata:{fromCache:false,hasPendingWrites:false},data:()=>submission};}};
    if (name === 'exam_keys') return {set:async()=>{},get:async()=>({exists:true,metadata:{},data:()=>({at:{toMillis:()=>Date.now()}})})};
    if (name === 'exam_attempts') return ref;
    if (name === 'exam_config') return { get: async () => ({ exists: true, data: () => ({ codeAllocationMode: mode, defaultClassMode: 'both_open', examDurationMinutes: 45, activeCodes: { 8: ['101','102'], 9: ['104'] }, classMapping: { '8/19': '101' } }) }) };
    return { set: async d => { if (name === 'exam_sessions') sessions.push(d); }, get: async () => ({ exists: true, data: () => ({ exam: { code: id.split('_')[1] } }) }) };
  } }; } };
  const firestore = Object.assign(() => db, { FieldValue: { serverTimestamp: () => ({ seconds: 1700000000 }), increment: n => ({ increment:n }), delete: () => null } });
  const window = { location: { pathname:'/test/' }, dispatchEvent() {} };
  vm.runInNewContext(fs.readFileSync('src/core/firebase-config.js','utf8'), { window, document: { readyState:'loading', addEventListener() {} }, CustomEvent: class {}, firebase: { apps:[{}], app: () => ({}), firestore, auth: () => ({ currentUser: { uid:'owner' }, onAuthStateChanged() {} }) }, console: { log() {},warn() {} }, setTimeout,clearTimeout });
  return { cloud:window.AsianSchoolCloud, writes,sessions,reads, emitReceipt:(data,metadata={})=>receiptWatcher({exists:true,data:()=>data,metadata}), attempt: () => attempt };
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

for(const locked of [false,true])test(`exhausted submitted attempt opens results without starting or unlocking a new attempt (locked=${locked})`,async()=>{
 const submission={uid:'owner',attemptId:'g8_8_19_999999',grade:8,studentClass:'8/19',studentId:'999999',fullName:'Hoc Sinh Gia',mcqPoints:0,isGraded:false,correctMcq:0,answers:{mcq:{1:2}},mcqResults:{1:{correctAnswer:2}},teacherFeedback:'Feedback',submittedAt:'2026-11-09T00:00:00Z'};
 const h=harness({existing:true,submitted:true,allowedAttempts:1,locked,submission});
 const result=await h.cloud.startExam({...input,examCode:''});
 assert.equal(result.completed,true);assert.equal(result.result.receiptOnly,true);assert.equal(result.result.mcqPoints,0);assert.equal(result.result.correctMcq,0);
 assert.equal(result.result.answers,undefined);assert.equal(result.result.mcqResults,undefined);assert.equal(result.result.isOfficialReview,undefined);
 assert.equal(h.writes.length,0);assert.equal(h.sessions.length,0);assert.equal(h.reads.includes('exam_public'),false);assert.equal(h.attempt().attemptsUsed,1);assert.equal(h.attempt().locked,locked);
});
test('when details are unavailable, a confirmed submitted attempt still shows a receipt without inventing zero marks',async()=>{
 const h=harness({existing:true,submitted:true,allowedAttempts:1,submissionError:true});
 const result=await h.cloud.startExam(input);
 assert.equal(result.completed,true);assert.equal(result.result.receiptDetailsUnavailable,true);assert.equal(result.result.mcqPoints,undefined);assert.equal(result.result.finalScore,undefined);assert.equal(h.writes.length,0);
});

for(const metadata of [{fromCache:true},{hasPendingWrites:true}])test('receipt cannot confirm an unverified attempt snapshot '+JSON.stringify(metadata),async()=>{
 const h=harness({existing:true,submitted:true,allowedAttempts:1,attemptMetadata:metadata});
 await assert.rejects(h.cloud.startExam(input),/chưa xác nhận/);assert.equal(h.writes.length,0);
});
test('receipt score updates contain no answer keys and ignore unconfirmed snapshots',()=>{
 const h=harness(),values=[];h.cloud.watchSubmission({submissionId:'fake',receiptOnly:true},value=>values.push(value));
 const data={mcqPoints:0,isGraded:true,answers:{mcq:{1:2}},mcqResults:{1:{correctAnswer:2}},isOfficialReview:true};
 h.emitReceipt(data,{fromCache:true});assert.equal(values.length,0);
 h.emitReceipt(data,{fromCache:false,hasPendingWrites:false});assert.equal(values.length,1);assert.equal(values[0].mcqPoints,0);assert.equal(values[0].answers,undefined);assert.equal(values[0].mcqResults,undefined);assert.equal(values[0].isOfficialReview,undefined);
});

test('the result belongs to the latest submitted attempt, and a mismatched class cannot supply its marks',async()=>{
 const h=harness({existing:true,submitted:true,allowedAttempts:3,submission:{grade:8,studentClass:'8/20',studentId:'999999',mcqPoints:7,fullName:'Wrong class'}});
 h.attempt().attemptsUsed=3;
 const result=await h.cloud.startExam(input);
 assert.equal(result.result.receiptDetailsUnavailable,true);assert.equal(result.result.mcqPoints,undefined);assert.equal(result.result.fullName,'Hoc Sinh Gia');
 const valid=harness({existing:true,submitted:true,allowedAttempts:3,submission:{grade:8,studentClass:'8/19',studentId:'999999',mcqPoints:6}});
 valid.attempt().attemptsUsed=3;assert.match((await valid.cloud.startExam(input)).result.submissionId,/_3$/);
});
