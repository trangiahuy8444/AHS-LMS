const { stripAnswers } = require('../../src/core/exam-package.js');
const PROJECT_ID = 'demo-ahs-local';
const FIRESTORE_ORIGIN = 'http://127.0.0.1:8188';
const AUTH_ORIGIN = 'http://127.0.0.1:9098';
const TEACHER_EMAIL = 'trangiahuy8444@gmail.com';
const BOOTSTRAP_DOC = '_sandbox/bootstrap';

function assertSandboxTarget({projectId, firestoreOrigin, authOrigin}) {
  if (projectId !== PROJECT_ID || firestoreOrigin !== FIRESTORE_ORIGIN || authOrigin !== AUTH_ORIGIN) {
    throw new Error('Chỉ được tạo dữ liệu ở bộ mô phỏng demo-ahs-local trên máy này.');
  }
}
function fakeExam(grade, code) {
  const mcq = Array.from({length:grade === 10 ? 19 : 28}, (_, i) => ({num:i + 1, question:`Câu giả lập ${i + 1}: Chọn phương án A để thử thao tác làm bài.`, options:['Phương án thử A','Phương án thử B','Phương án thử C','Phương án thử D'], correctAnswer:0, points:0.25, explanation:'Dữ liệu giả lập để thử hệ thống.'}));
  const essay = Array.from({length:3}, (_, i) => ({num:i + 1, question:`Tình huống giả lập ${i + 1}. a) Mô tả thao tác em đã thử. b) Nêu kết quả mong đợi.`, points:grade === 10 ? 0.75 : 1, modelAnswer:'Hướng dẫn chấm giả lập: giáo viên thử nhập điểm và nhận xét.'}));
  const exam = {code, title:`ĐỀ GIẢ LẬP KHỐI ${grade} — ${code}`};
  if (grade === 10) {
    exam.part1_mcq = mcq;
    exam.part2_tf = Array.from({length:3}, (_, i) => ({num:i + 1, context:`Tình huống đúng/sai giả lập ${i + 1}.`, points:1, subQuestions:['a','b','c','d'].map((letter, j) => ({letter, text:`Nhận định giả lập ${letter}.`, correctAnswer:j % 2 === 0}))}));
    exam.part3_essay = essay;
  } else { exam.mcqQuestions = mcq; exam.essayQuestions = essay; }
  return exam;
}
function buildSeedDocuments() {
  const codes = ['101','102','103','104'];
  const classes = ['8/19','8/20','8/21','8/22','8/23','9/20','9/21','9/22','9/23','9/24','9/25','9/26','10/14','10/15','10/16'];
  const docs = {
    'exam_config/global_config': {defaultClassMode:'both_open', classAccessControl:Object.fromEntries(classes.map(c => [c, 'both_open'])), codeAllocationMode:'student_choice', activeCodes:{'8':codes,'9':codes,'10':codes}, maxExamAttempts:5, examDurationMinutes:45, practiceDurationMinutes:0, preventEarlySubmission:false, minExamMinutes:0, lockOnExamViolation:true, lockOnPracticeViolation:false, examBankLocked:false, allowPracticeReview:true, allowExamReview:false, allowStudentReviewOfficialExam:false, shuffleQuestions:false, shuffleOptions:false, tfScoringPolicy:'coefficient'},
    'exam_secrets/room':{examPassword:'sandbox-local'}
  };
  for (const grade of [8,9,10]) for (const code of codes) {
    const exam = fakeExam(grade, code);
    docs[`exam_bank/g${grade}_${code}`] = {grade, code, active:true, exam};
    docs[`exam_public/g${grade}_${code}`] = {grade, code, active:true, exam:stripAnswers(exam)};
  }
  return docs;
}
function valueField(value) {
  if (value === null) return {nullValue:null};
  if (Array.isArray(value)) return {arrayValue:{values:value.map(valueField)}};
  if (typeof value === 'object') return {mapValue:{fields:toFields(value)}};
  if (typeof value === 'boolean') return {booleanValue:value};
  if (typeof value === 'number') return Number.isInteger(value) ? {integerValue:String(value)} : {doubleValue:value};
  return {stringValue:String(value)};
}
function toFields(object) { return Object.fromEntries(Object.entries(object).map(([k,v]) => [k,valueField(v)])); }
function fromValue(value) {
  if ('nullValue' in value) return null;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromValue);
  if ('mapValue' in value) return fromFields(value.mapValue.fields || {});
  return value.stringValue;
}
function fromFields(fields) { return Object.fromEntries(Object.entries(fields).map(([k,v]) => [k,fromValue(v)])); }
async function seedSandbox({projectId=PROJECT_ID, firestoreOrigin=FIRESTORE_ORIGIN, authOrigin=AUTH_ORIGIN, fetchImpl=fetch} = {}) {
  assertSandboxTarget({projectId, firestoreOrigin, authOrigin});
  const documentsPath = `projects/${projectId}/databases/(default)/documents`;
  const base = `${firestoreOrigin}/v1/${documentsPath}`;
  const headers = {Authorization:'Bearer owner', 'Content-Type':'application/json'};
  const marker = await fetchImpl(`${base}/${BOOTSTRAP_DOC}`, {headers});
  if (marker.ok) return {created:false};
  if (marker.status !== 404) throw new Error(`Không đọc được dấu khởi tạo cục bộ (${marker.status}).`);
  const writes = [];
  for (const [name, value] of Object.entries(buildSeedDocuments())) {
    const existing = await fetchImpl(`${base}/${name}`, {headers});
    if (existing.ok) continue; // Không đặt lại cấu hình/bài làm nếu hệ thống thử đã có dữ liệu.
    if (existing.status !== 404) throw new Error(`Không đọc được dữ liệu giả lập (${existing.status}).`);
    writes.push({update:{name:`${documentsPath}/${name}`, fields:toFields(value)}, currentDocument:{exists:false}});
  }
  const fakeGoogleToken = Buffer.from(JSON.stringify({sub:'ahs-local-teacher', email:TEACHER_EMAIL, email_verified:true, name:'Giáo viên thử nghiệm'})).toString('base64url');
  const jwt = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${fakeGoogleToken}.`;
  const teacher = await fetchImpl(`${authOrigin}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=local-emulator-key`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({postBody:`id_token=${encodeURIComponent(jwt)}&providerId=google.com`, requestUri:'http://localhost:5188', returnSecureToken:true})});
  if (!teacher.ok) throw new Error(`Không tạo được giáo viên giả lập (${teacher.status}).`);
  writes.push({update:{name:`${documentsPath}/${BOOTSTRAP_DOC}`, fields:toFields({ready:true, version:1})}, currentDocument:{exists:false}});
  const committed = await fetchImpl(`${firestoreOrigin}/v1/projects/${projectId}/databases/(default)/documents:commit`, {method:'POST',headers,body:JSON.stringify({writes})});
  if (!committed.ok) throw new Error(`Không tạo được dữ liệu giả lập (${committed.status}).`);
  return {created:true, examCount:12};
}
module.exports = {PROJECT_ID,FIRESTORE_ORIGIN,AUTH_ORIGIN,assertSandboxTarget,buildSeedDocuments,seedSandbox,toFields,fromFields};
if (require.main === module) seedSandbox().then(result => console.log(result.created ? 'Đã tạo 12 đề giả lập trên máy này.' : 'Giữ nguyên dữ liệu thử đã có.')).catch(error => {console.error(error.message); process.exitCode=1;});
