const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const P = require('../src/core/exam-package.js');

const mcqExam = {
  code: '101',
  totalPoints: 10,
  mcqQuestions: [
    { num: 1, question: 'Q1', options: ['a', 'b', 'c', 'd'], correctAnswer: 2, answerLetter: 'C', points: 0.25 },
    { num: 2, question: 'Q2', options: ['a', 'b', 'c', 'd'], correctAnswer: 0, answerLetter: 'A', points: 0.25 }
  ],
  essayQuestions: [{ num: 1, question: 'TL', points: 9.5, modelAnswer: 'Barem chi tiết' }]
};

const tfExam = {
  code: '102',
  part1_mcq: [{ num: 1, question: 'Q1', options: ['a', 'b', 'c', 'd'], correctAnswer: 1, points: 0.25 }],
  part2_tf: [{
    num: 1, points: 1,
    subQuestions: [
      { letter: 'a', text: 'x', correctAnswer: true },
      { letter: 'b', text: 'y', correctAnswer: false },
      { letter: 'c', text: 'z', correctAnswer: true },
      { letter: 'd', text: 't', correctAnswer: false }
    ]
  }],
  part3_essay: []
};

test('stripAnswers bỏ hết đáp án, barem khỏi đề gửi học sinh', () => {
  const out = JSON.stringify(P.stripAnswers(mcqExam)) + JSON.stringify(P.stripAnswers(tfExam));
  assert.ok(!/correctAnswer|answerLetter|modelAnswer/.test(out));
  assert.strictEqual(P.stripAnswers(mcqExam).mcqQuestions[0].options.length, 4, 'Vẫn giữ nội dung câu hỏi và phương án');
  assert.strictEqual(mcqExam.mcqQuestions[0].correctAnswer, 2, 'Không sửa đề gốc');
});

test('gradeExam chấm trắc nghiệm theo điểm từng câu', () => {
  const r = P.gradeExam(mcqExam, { mcq: { 1: 2, 2: 3 } });
  assert.strictEqual(r.correctMcq, 1);
  assert.strictEqual(r.mcqPoints, 0.25);
  assert.strictEqual(r.maxMcqPoints, 0.5);
});

test('gradeExam chấm Đúng/Sai: mặc định hệ số 0,1 / 0,25 / 0,5 / 1 theo số ý đúng', () => {
  const answers = { mcq: { 1: 1 }, tf: { 1: { a: true, b: false, c: false } } }; // 2 ý đúng, ý d bỏ trống
  assert.strictEqual(P.gradeExam(tfExam, answers).mcqPoints, 0.5);
  assert.strictEqual(P.gradeExam(tfExam, answers, { tfScoringPolicy: 'per_statement' }).mcqPoints, 0.75);
  const counts = [[{}, 0], [{ a: true }, 0.1], [{ a: true, b: false }, 0.25], [{ a: true, b: false, c: true }, 0.5], [{ a: true, b: false, c: true, d: false }, 1]];
  counts.forEach(([tf, expected]) => assert.strictEqual(P.gradeExam(tfExam, { tf: { 1: tf } }).tfPoints, expected));
});

test('gradeExam bỏ qua đáp án gửi sai kiểu (chuỗi thay cho số)', () => {
  assert.strictEqual(P.gradeExam(mcqExam, { mcq: { 1: '2' } }).mcqPoints, 0);
});

test('validateExam phát hiện lỗi cấu trúc mã đề', () => {
  assert.deepStrictEqual(P.validateExam(mcqExam), []);
  const bad = JSON.parse(JSON.stringify(mcqExam));
  bad.mcqQuestions[0].answerLetter = 'B';
  bad.mcqQuestions[1].options.pop();
  bad.totalPoints = 9;
  const errors = P.validateExam(bad);
  assert.ok(errors.some(e => e.includes('answerLetter')));
  assert.ok(errors.some(e => e.includes('4 phương án')));
  assert.ok(errors.some(e => e.includes('totalPoints')));
});

test('Cổng học sinh không còn đọc mã đề từ data/ và chỉ gửi bài làm, không tự chấm điểm thi', () => {
  const srcDir = path.join(__dirname, '../src/student');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  const html = walk(srcDir).map(f => fs.readFileSync(f, 'utf8')).join('\n');
  assert.ok(!html.includes('gradeData.officialExams'), 'Không lấy đề chính thức từ data/*.js');
  assert.ok(html.includes('AsianSchoolCloud.startExam'), 'Vào phòng thi qua startExam');
  assert.ok(html.includes('AsianSchoolCloud.submitExam'), 'Nộp bài qua submitExam');
  assert.ok(!html.includes('checkExamPassword'), 'Không kiểm tra mật khẩu phòng thi ở trình duyệt');
});

test('Script và module Firebase không lỗi cú pháp', () => {
  ['../scripts/tach_ma_de_chinh_thuc.cjs', '../src/core/firebase-config.js'].forEach(f => {
    execFileSync(process.execPath, ['--check', path.join(__dirname, f)]);
  });
});

test('firestore.rules: học sinh không đọc được đề kèm đáp án, không gửi được điểm', () => {
  const rules = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8');
  const block = (name) => {
    const start = rules.indexOf(`match /${name}/`);
    return rules.slice(start, rules.indexOf('\n    }', start));
  };
  assert.match(block('exam_bank'), /allow read: if isTeacher\(\);\s*allow write: if bankWriteAllowed\(\);/);
  assert.match(rules, /hasOnly\(\['active'\]\)/, 'Kho đề khóa: chỉ được bật/tắt mã đề');
  assert.match(block('exam_secrets'), /allow read, write: if isTeacher\(\);/);
  const sub = block('submissions');
  assert.match(sub, /allow create: if signedIn\(\) && validSubmission\(request\.resource\.data\);/);
  ['mcqPoints', 'finalScore', 'penaltyPoints', 'autoGradedAt'].forEach(field => {
    assert.ok(!sub.includes(`'${field}'`), `Bài nộp của học sinh không được chứa trường ${field}`);
  });
  assert.match(block('exam_attempts'), /roomPasswordOk\(\)/);
  assert.match(block('exam_public'), /allow list: if isTeacher\(\);\s*allow write: if bankWriteAllowed\(\);/);
  assert.match(rules, /match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
  // Danh sách email giáo viên trong rules phải khớp firebase-config.js
  const cfgJs = fs.readFileSync(path.join(__dirname, '../src/core/firebase-config.js'), 'utf8');
  const rulesEmails = rules.match(/token\.email in \[([^\]]*)\]/)[1].replace(/['\s]/g, '').split(',').sort();
  const clientEmails = cfgJs.match(/TEACHER_EMAILS = \[([^\]]*)\]/)[1].replace(/['\s]/g, '').split(',').sort();
  assert.deepStrictEqual(rulesEmails, clientEmails);
});

test('Trang quản trị tự chấm bài thi chính thức học sinh gửi lên (gói Spark)', () => {
  global.localStorage = global.localStorage || {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  };
  const storage = require('../src/core/storage-service.js');
  const base = { mode: 'exam', grade: 10, examCode: '102', isGraded: false, essayTotal: 0, essayScores: {} };
  localStorage.setItem('asian_school_submissions_v1', JSON.stringify([
    { ...base, id: 'g10_A1_1', violations: 0, answers: { mcq: { 1: 1 }, tf: { 1: { a: true, b: false, c: true } } },
      startedAt: { seconds: 1000, nanoseconds: 0 }, serverSubmittedAt: { seconds: 1000 + 46 * 60, nanoseconds: 0 } },
    { ...base, id: 'g10_A2_1', violations: 3, answers: { mcq: { 1: 1 }, tf: {} } },
    { ...base, id: 'g10_A3_1', examCode: '999', violations: 0, answers: { mcq: {} } }
  ]));
  const n = storage.autoGradeExamSubmissions({ 10: { '102': tfExam } });
  assert.strictEqual(n, 2, 'Chấm 2 bài có mã đề; bỏ qua bài thiếu mã đề trong exam_bank');
  const subs = storage.getSubmissions();
  const s1 = subs.find(s => s.id === 'g10_A1_1');
  assert.strictEqual(s1.mcqPoints, 0.75, '0,25 trắc nghiệm + 0,5 Đúng/Sai (3 ý đúng)');
  assert.strictEqual(s1.finalScore, 0.75);
  assert.strictEqual(s1.durationSeconds, 46 * 60);
  assert.strictEqual(s1.overtimeSeconds, 60, 'Quá 45 phút cấu hình 1 phút');
  const s2 = subs.find(s => s.id === 'g10_A2_1');
  assert.strictEqual(s2.penaltyPoints, 0, 'Không tự trừ điểm vi phạm (giáo viên ghi nhận riêng)');
  assert.strictEqual(s2.finalScore, 0.25, 'Điểm giữ nguyên dù vi phạm 3 lần');
  assert.strictEqual(s2.violations, 3, 'Vẫn lưu số lần vi phạm');
  assert.strictEqual(subs.find(s => s.id === 'g10_A3_1').autoGradedAt, undefined);
  assert.strictEqual(storage.autoGradeExamSubmissions({ 10: { '102': tfExam } }), 0, 'Không chấm lại bài đã chấm');
});

test('saveConfig không đẩy mật khẩu, URL/token webhook lên exam_config công khai', () => {
  const storage = require('../src/core/storage-service.js');
  const writes = [];
  const fakeDb = {
    collection: (c) => ({ doc: (d) => ({ set: (data) => { writes.push({ path: `${c}/${d}`, data }); return Promise.resolve(); } }) })
  };
  global.window = { firebaseDb: fakeDb };
  try {
    storage.saveConfig({ googleDriveWebhookUrl: 'https://script.google.com/macros/s/X/exec', googleDriveWebhookToken: 'bi-mat', examPassword: 'pw' });
  } finally {
    delete global.window;
  }
  const pub = writes.find(w => w.path === 'exam_config/global_config').data;
  ['examPassword', 'adminPasswordHash', 'googleDriveWebhookUrl', 'googleDriveWebhookToken'].forEach(k => {
    assert.ok(!(k in pub), `exam_config không được chứa ${k}`);
  });
  const drive = writes.find(w => w.path === 'exam_secrets/drive');
  assert.deepStrictEqual(drive.data, { googleDriveWebhookUrl: 'https://script.google.com/macros/s/X/exec', googleDriveWebhookToken: 'bi-mat' });
  assert.ok(writes.some(w => w.path === 'exam_secrets/room'));
});

test('Hàng chờ ôn tập: trang quản trị đẩy lên Google Sheets rồi mới xóa; chưa có webhook thì giữ lại', async () => {
  const storage = require('../src/core/storage-service.js');
  const row = { ...storage.toPracticeQueueRow({ id: 'practice-1', studentId: 'HS01', fullName: 'A', studentClass: '9/20', grade: 9, score: 7.5, finalScore: 7.5, attemptNumber: 2 }), uid: 'u1' };
  assert.strictEqual(row.mode, 'practice');
  assert.strictEqual(row.grade, 9);

  const deleted = [];
  storage.saveConfig({ googleDriveWebhookUrl: '', googleDriveWebhookToken: '' });
  assert.strictEqual(await storage.processPracticeQueue([row], id => deleted.push(id)), 0);
  assert.deepStrictEqual(deleted, [], 'Chưa cấu hình webhook: không xóa khỏi hàng chờ');
  assert.ok(storage.getPracticeSubmissions().some(s => s.id === 'practice-1'), 'Vẫn vào bảng điểm ôn tập của trang quản trị');

  const sent = [];
  const realFetch = global.fetch;
  // Giả lập Apps Script: chỉ nhận token 'bi-mat'
  global.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    sent.push(body);
    const ok = body.token === 'bi-mat';
    return { status: 200, text: async () => JSON.stringify(ok ? { success: true } : { success: false, error: 'Token xác thực không hợp lệ' }) };
  };
  try {
    storage.saveConfig({ googleDriveWebhookUrl: 'https://script.google.com/macros/s/X/exec', googleDriveWebhookToken: 'sai' });
    assert.strictEqual(await storage.processPracticeQueue([row], id => deleted.push(id)), 0, 'Sai token: Apps Script từ chối');
    assert.deepStrictEqual(deleted, [], 'Sai token: KHÔNG xóa khỏi hàng chờ (không mất điểm)');
    const test = await storage.testGoogleDriveConnection();
    assert.strictEqual(test.success, false, 'Nút kiểm tra phải báo lỗi khi sai token');
    assert.match(test.error, /Token xác thực không hợp lệ/);
    sent.length = 0;
    storage.saveConfig({ googleDriveWebhookUrl: 'https://script.google.com/macros/s/X/exec', googleDriveWebhookToken: 'bi-mat' });
    assert.strictEqual(await storage.processPracticeQueue([row], id => deleted.push(id)), 1);
    assert.strictEqual(await storage.processPracticeQueue([row], id => deleted.push(id)), 0, 'Không gửi trùng dòng đã đẩy');
  } finally {
    global.fetch = realFetch;
    // Không để URL giả lại cho test sau (tránh gửi yêu cầu mạng thật)
    storage.saveConfig({ googleDriveWebhookUrl: '', googleDriveWebhookToken: '' });
  }
  assert.deepStrictEqual(deleted, ['practice-1']);
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].token, 'bi-mat');
  assert.strictEqual(sent[0].submission.studentId, 'HS01');
});

test('Cổng học sinh không gửi thẳng lên webhook; rules có hàng chờ practice_results', () => {
  const src = fs.readFileSync(path.join(__dirname, '../src/core/storage-service.js'), 'utf8');
  const practiceBranch = src.slice(src.indexOf("if (subData.mode === 'practice') {"), src.indexOf('// 2. NẾU LÀ BÀI THI CHÍNH THỨC'));
  assert.ok(practiceBranch.includes('this.queuePracticeResult(transientDoc)'));
  assert.ok(!practiceBranch.includes('syncRowToGoogleDrive'), 'Máy học sinh không gọi webhook');
  const rules = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8');
  const block = rules.slice(rules.indexOf('match /practice_results/'), rules.indexOf('match /live_sessions/'));
  assert.match(block, /allow read, delete: if isTeacher\(\);/);
  assert.match(block, /d\.uid == request\.auth\.uid/);
});

test('firestore.rules: khóa bài và số vi phạm nằm trên máy chủ', () => {
  const rules = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8');
  const fn = (name) => rules.slice(rules.indexOf(`function ${name}()`), rules.indexOf('\n      }', rules.indexOf(`function ${name}()`)));
  const rv = fn('reportViolation');
  assert.match(rv, /hasOnly\(\['violations', 'locked', 'lockCount'\]\)/, 'Học sinh chỉ ghi được 3 trường vi phạm');
  assert.match(rv, /d\.get\('violations', 0\) >= o\.get\('violations', 0\)/, 'Số vi phạm chỉ tăng');
  assert.match(rv, /d\.get\('locked', false\) == true \|\| o\.get\('locked', false\) == false/, 'Học sinh không tự mở khóa');
  assert.match(rules, /takeover\(\) \|\| retake\(\) \|\| submit\(\) \|\| reportViolation\(\)/);
  assert.match(fn('sessionAllows'), /a\.get\('locked', false\) == false/, 'Đang khóa thì không đọc được đề');
  assert.match(rules, /d\.violations == a\.get\('violations', 0\)/, 'Bài nộp phải khớp số vi phạm trên lượt thi');
  const pc = rules.slice(rules.indexOf('match /proctor_commands/'), rules.indexOf('\n    }', rules.indexOf('match /proctor_commands/')));
  assert.match(pc, /resource\.data\.get\('targetUid', ''\) in \[request\.auth\.uid, 'all'\]/, 'Học sinh chỉ đọc lệnh gửi cho mình');
});

test('Lệnh giám thị ghi targetUid của học sinh nhận lệnh', () => {
  const storage = require('../src/core/storage-service.js');
  storage.updateLiveSession({ sessionId: 'sess-uid-test', uid: 'uid-hs-1', fullName: 'A', mode: 'exam' });
  assert.strictEqual(storage.sendProctorCommand('sess-uid-test', 'extend_time', { minutes: 5 }).targetUid, 'uid-hs-1');
  assert.strictEqual(storage.sendProctorCommand('all', 'broadcast_message', { message: 'x' }).targetUid, 'all');
  assert.strictEqual(storage.sendProctorCommand('sess-khong-co', 'force_submit', {}).targetUid, 'khong_ro');
  storage.removeLiveSession('sess-uid-test');
});

test('Chuẩn hóa mã LMS và họ tên học sinh', () => {
  const N = require('../src/core/normalize.js');
  for (const raw of ['hs-2026-01', 'HS 2026 01', ' Hs-202601 ', 'hs.2026_01', 'ＨＳ２０２６０１']) {
    assert.strictEqual(N.normalizeLmsCode(raw), 'HS202601', raw);
  }
  assert.strictEqual(N.normalizeLmsCode('12-345'), '12345');
  assert.strictEqual(N.normalizeLmsCode(''), '');
  assert.strictEqual(N.normalizeStudentName('  nguyễn   văn  an '), 'Nguyễn Văn An');
  assert.strictEqual(N.normalizeStudentName('TRẦN THỊ ÁNH'), 'Trần Thị Ánh');
  assert.strictEqual(N.normalizeStudentName('lê đức anh'), 'Lê Đức Anh');
  const storage = require('../src/core/storage-service.js');
  const row = storage.toPracticeQueueRow({ id: 'p1', studentId: 'hs-2026-01', fullName: 'nguyễn văn an', grade: 9, score: 5, finalScore: 5 });
  assert.strictEqual(row.studentId, 'HS202601');
  assert.strictEqual(row.fullName, 'Nguyễn Văn An');
});
