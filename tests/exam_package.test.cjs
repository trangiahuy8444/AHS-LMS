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
  const html = fs.readFileSync(path.join(__dirname, '../test/index.html'), 'utf8');
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
  assert.strictEqual(s2.penaltyPoints, 5);
  assert.strictEqual(s2.finalScore, 0, 'Trừ 5 điểm khi vi phạm 3 lần, không âm');
  assert.strictEqual(subs.find(s => s.id === 'g10_A3_1').autoGradedAt, undefined);
  assert.strictEqual(storage.autoGradeExamSubmissions({ 10: { '102': tfExam } }), 0, 'Không chấm lại bài đã chấm');
});
