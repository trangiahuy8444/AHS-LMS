const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// 1. Load Data Modules
const g8 = require('../data/questions_grade8.js');
const g9 = require('../data/questions_grade9.js');
const g10 = require('../data/questions_grade10.js');

// 2. Load Core Modules (Mocking localStorage for Node environment)
global.localStorage = {
  _data: {},
  getItem(key) { return this._data[key] || null; },
  setItem(key, val) { this._data[key] = String(val); },
  removeItem(key) { delete this._data[key]; },
  clear() { this._data = {}; }
};

const storage = require('../src/core/storage-service.js');
const timer = require('../src/core/exam-timer.js');
const antiCheat = require('../src/core/anti-cheat.js');

test('Kiểm tra dữ liệu Khối 8 chuẩn hoá (Đề cương TN + Tự luận + Đề thi + Model Answer)', (t) => {
  assert.strictEqual(g8.grade, 8);
  assert.strictEqual(g8.practiceQuestions.length, 35, 'Đề cương Khối 8 phải có đúng 35 câu trắc nghiệm');
  assert.strictEqual(g8.practiceEssayQuestions.length, 3, 'Đề cương Khối 8 phải có đúng 3 câu tự luận');
  
  // Kiểm tra modelAnswer có trong tất cả các câu tự luận đề cương
  g8.practiceEssayQuestions.forEach(q => {
    assert.ok(q.modelAnswer && q.modelAnswer.length > 20, `Câu tự luận ${q.num} Khối 8 phải có gợi ý đáp án/rubric`);
  });

  // Kiểm tra 4 mã đề chính thức
  const codes = ['101', '102', '103', '104'];
  codes.forEach(code => {
    const exam = g8.officialExams[code];
    assert.ok(exam, `Phải có mã đề ${code}`);
    assert.strictEqual(exam.mcqQuestions.length, 28, `Mã đề ${code} Khối 8 phải có đúng 28 câu trắc nghiệm`);
    assert.strictEqual(exam.essayQuestions.length, 3, `Mã đề ${code} Khối 8 phải có đúng 3 câu tự luận`);
    exam.essayQuestions.forEach(q => {
      assert.ok(q.modelAnswer && q.modelAnswer.length > 20, `Mã ${code} câu tự luận ${q.num} phải có đáp án rubric`);
    });
  });
});

test('Kiểm tra dữ liệu Khối 9 chuẩn hoá (Đề cương TN + Tự luận + Đề thi + Model Answer)', (t) => {
  assert.strictEqual(g9.grade, 9);
  assert.strictEqual(g9.practiceQuestions.length, 35, 'Đề cương Khối 9 phải có đúng 35 câu trắc nghiệm');
  assert.strictEqual(g9.practiceEssayQuestions.length, 3, 'Đề cương Khối 9 phải có đúng 3 câu tự luận');
  
  g9.practiceEssayQuestions.forEach(q => {
    assert.ok(q.modelAnswer && q.modelAnswer.length > 20, `Câu tự luận ${q.num} Khối 9 phải có gợi ý đáp án/rubric`);
  });

  const codes = ['101', '102', '103', '104'];
  codes.forEach(code => {
    const exam = g9.officialExams[code];
    assert.ok(exam, `Phải có mã đề ${code}`);
    assert.strictEqual(exam.mcqQuestions.length, 28, `Mã đề ${code} Khối 9 phải có đúng 28 câu trắc nghiệm`);
    assert.strictEqual(exam.essayQuestions.length, 3, `Mã đề ${code} Khối 9 phải có đúng 3 câu tự luận`);
    exam.essayQuestions.forEach(q => {
      assert.ok(q.modelAnswer && q.modelAnswer.length > 20, `Mã ${code} câu tự luận ${q.num} phải có đáp án rubric`);
    });
  });
});

test('Kiểm tra dữ liệu Khối 10 chuẩn hoá (Đề cương TN + Đúng/Sai 6 câu + Tự luận + Đề thi + Model Answer)', (t) => {
  assert.strictEqual(g10.grade, 10);
  assert.strictEqual(g10.practiceQuestions.length, 25, 'Đề cương Khối 10 phải có đúng 25 câu ngân hàng trắc nghiệm');
  assert.strictEqual(g10.practiceTfQuestions.length, 6, 'Đề cương Khối 10 phải có đúng 6 câu Đúng/Sai');
  assert.strictEqual(g10.practiceEssayQuestions.length, 3, 'Đề cương Khối 10 phải có đúng 3 câu Tự luận');

  g10.practiceEssayQuestions.forEach(q => {
    assert.ok(q.modelAnswer && q.modelAnswer.length > 20, `Câu tự luận ${q.num} Khối 10 phải có gợi ý đáp án/rubric`);
  });

  g10.practiceTfQuestions.forEach(tf => {
    assert.strictEqual(tf.subQuestions.length, 4, `Câu Đúng/Sai đề cương ${tf.num} phải có đủ 4 ý a, b, c, d`);
    tf.subQuestions.forEach(sub => {
      assert.strictEqual(typeof sub.correctAnswer, 'boolean', `Đáp án ý ${sub.letter} phải là boolean`);
    });
  });

  const codes = ['101', '102', '103', '104'];
  codes.forEach(code => {
    const exam = g10.officialExams[code];
    assert.ok(exam, `Phải có mã đề ${code}`);
    assert.strictEqual(exam.part1_mcq.length, 19, `Khối 10 mã ${code} phải có 19 câu trắc nghiệm Phần I`);
    assert.strictEqual(exam.part2_tf.length, 3, `Khối 10 mã ${code} phải có 3 câu Đúng/Sai Phần II`);
    assert.strictEqual(exam.part3_essay.length, 3, `Khối 10 mã ${code} phải có 3 câu Tự luận Phần III`);
    exam.part3_essay.forEach(q => {
      assert.ok(q.modelAnswer && q.modelAnswer.length > 20, `Khối 10 mã ${code} tự luận ${q.num} phải có rubric`);
    });
  });
});

test('Kiểm tra tệp logo trường học tại assets', (t) => {
  const logoSchool = path.join(__dirname, '../assets/logo_asian_school.png');
  const logoBanner = path.join(__dirname, '../assets/logo_asian_banner.png');
  const logoBase64 = path.join(__dirname, '../assets/logo-base64.js');
  assert.ok(fs.existsSync(logoSchool), 'Phải có tệp logo_asian_school.png');
  assert.ok(fs.existsSync(logoBanner), 'Phải có tệp logo_asian_banner.png');
  assert.ok(fs.existsSync(logoBase64), 'Phải có tệp logo-base64.js');
});

test('Kiểm tra Storage Service, Danh sách lớp & Phân bổ mã đề Asian School', (t) => {
  const classes8 = storage.getClassesForGrade(8);
  const classes9 = storage.getClassesForGrade(9);
  const classes10 = storage.getClassesForGrade(10);

  assert.deepStrictEqual(classes8, ['8/19', '8/20', '8/21', '8/22', '8/23']);
  assert.deepStrictEqual(classes9, ['9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26']);
  assert.deepStrictEqual(classes10, ['10/14', '10/15', '10/16']);

  storage.saveConfig({
    codeAllocationMode: 'class_assigned',
    classMapping: { '8/19': '101', '8/20': '102', '9/20': '101', '10/14': '101' }
  });

  assert.strictEqual(storage.determineExamCode(8, '8/19'), '101');
  assert.strictEqual(storage.determineExamCode(8, '8/20'), '102');
  assert.strictEqual(storage.determineExamCode(9, '9/20'), '101');
  assert.strictEqual(storage.determineExamCode(10, '10/14'), '101');
});

test('Kiểm tra Mật khẩu bài thi chính thức (Exam Password)', (t) => {
  assert.strictEqual(storage.checkExamPassword('asian2026'), true);
  assert.strictEqual(storage.checkExamPassword('wrongPass'), false);
  assert.strictEqual(storage.checkExamPassword(' ASIAN2026 '), true);

  storage.setExamPassword('GiaHuy@2026');
  assert.strictEqual(storage.checkExamPassword('GiaHuy@2026'), true);
  assert.strictEqual(storage.checkExamPassword('asian2026'), false);
  
  storage.setExamPassword('asian2026');
  assert.strictEqual(storage.checkExamPassword('asian2026'), true);
});

test('Kiểm tra Chức năng Chấm Điểm Tự Luận & Tính Tổng Điểm (Grade Essay)', (t) => {
  // Tạo 1 bài nộp thi chính thức: trắc nghiệm 7.0 điểm
  const sub = storage.saveSubmission({
    fullName: 'Lê Văn An',
    studentCode: 'LMS8888',
    grade: 8,
    studentClass: '8/19',
    mode: 'exam',
    examCode: '101',
    mcqPoints: 7.0,
    answers: { essay: { 1: 'Câu trả lời 1...', 2: 'Câu trả lời 2...', 3: 'Câu trả lời 3...' } }
  });

  assert.strictEqual(sub.isGraded, false);

  // Giáo viên chấm tự luận: Câu 1 = 1.0, Câu 2 = 0.75, Câu 3 = 1.0 -> Tổng tự luận = 2.75đ
  const gradeRes = storage.gradeEssaySubmission(sub.id, { 1: 1.0, 2: 0.75, 3: 1.0 }, 'Làm bài rất tốt, câu 2 cần giải thích kỹ hơn');
  assert.strictEqual(gradeRes.success, true);
  assert.strictEqual(gradeRes.submission.essayTotal, 2.75);
  assert.strictEqual(gradeRes.submission.finalScore, 9.75, 'Tổng điểm phải bằng 7.0 + 2.75 = 9.75');
  assert.strictEqual(gradeRes.submission.isGraded, true);
  assert.strictEqual(gradeRes.submission.teacherFeedback, 'Làm bài rất tốt, câu 2 cần giải thích kỹ hơn');

  // Kiểm tra trong CSDL
  const savedInDb = storage.getSubmissionById(sub.id);
  assert.strictEqual(savedInDb.finalScore, 9.75);
  assert.strictEqual(savedInDb.isGraded, true);
});

test('Kiểm tra Lệnh Giám Thị Thời Gian Thực (Proctor Commands)', (t) => {
  const sessionId = 'test-sess-001';

  // 1. Gửi lệnh gia hạn giờ
  const cmdExtend = storage.sendProctorCommand(sessionId, 'extend_time', { minutes: 5 });
  assert.ok(cmdExtend.cmdId.startsWith('cmd-'));

  // 2. Học sinh nhận lệnh đang chờ
  const pending = storage.getPendingProctorCommands(sessionId);
  assert.strictEqual(pending.length, 1);
  assert.strictEqual(pending[0].command, 'extend_time');
  assert.strictEqual(pending[0].payload.minutes, 5);

  // 3. Học sinh tiêu thụ lệnh
  storage.consumeProctorCommand(cmdExtend.cmdId, sessionId);
  const remaining = storage.getPendingProctorCommands(sessionId);
  assert.strictEqual(remaining.length, 0, 'Lệnh đã tiêu thụ không được xuất hiện lại');

  // 4. Lệnh phát thông báo tới toàn bộ phòng thi ('all')
  const cmdAll = storage.sendProctorCommand('all', 'broadcast_message', { message: 'Còn 5 phút nữa hết giờ' });
  const pendingForAny = storage.getPendingProctorCommands('any-student-sess');
  assert.strictEqual(pendingForAny.length, 1);
  assert.strictEqual(pendingForAny[0].payload.message, 'Còn 5 phút nữa hết giờ');

  // 5. Lệnh khóa bài và mở khóa bài thi của Admin
  const cmdLock = storage.sendProctorCommand(sessionId, 'lock_session', { reason: 'Giáo viên khóa bài' });
  assert.strictEqual(cmdLock.command, 'lock_session');
  const pendingLock = storage.getPendingProctorCommands(sessionId);
  assert.strictEqual(pendingLock.some(c => c.command === 'lock_session'), true);
  storage.consumeProctorCommand(cmdLock.cmdId, sessionId);

  const cmdUnlock = storage.sendProctorCommand(sessionId, 'unlock_session', {});
  assert.strictEqual(cmdUnlock.command, 'unlock_session');
  const pendingUnlock = storage.getPendingProctorCommands(sessionId);
  assert.strictEqual(pendingUnlock.some(c => c.command === 'unlock_session'), true);
  storage.consumeProctorCommand(cmdUnlock.cmdId, sessionId);
});

test('Kiểm tra Quản lý Mật khẩu Admin & Nhật ký Hoạt động (Audit Log)', (t) => {
  storage.setAdminPasswordHash('new-hashed-password-12345');
  const cfg = storage.getConfig();
  assert.strictEqual(cfg.adminPasswordHash, 'new-hashed-password-12345');

  const logs = storage.getAuditLogs();
  assert.ok(logs.length > 0, 'Phải có nhật ký ghi nhận các thao tác');
  assert.ok(logs.some(l => l.action.includes('Admin') || l.action.includes('quản trị')));
});

test('Kiểm tra Xuất CSV Bảng Điểm Đầy Đủ Cột Tự Luận & Lời Phê', (t) => {
  // Thêm 1 bài nộp có vi phạm 3 lần để test trừ 5 điểm
  storage.saveSubmission({
    fullName: 'Trần Vi Phạm',
    studentCode: 'LMS9999',
    grade: 8,
    studentClass: '8/20',
    mode: 'exam',
    examCode: '102',
    mcqPoints: 7.0,
    violations: 3,
    penaltyPoints: 5,
    durationFormatted: '34 phút 20 giây'
  });

  const csv = storage.exportSubmissionsCSV();
  assert.ok(csv.includes('Mã LMS'));
  assert.ok(csv.includes('Họ và Tên'));
  assert.ok(csv.includes('Thời Gian Làm Bài'));
  assert.ok(csv.includes('Điểm Phạt Vi Phạm'));
  assert.ok(csv.includes('Điểm Tự Luận (Chấm)'));
  assert.ok(csv.includes('Tổng Điểm (Thang 10)'));
  assert.ok(csv.includes('Trạng Thái Chấm'));
  assert.ok(csv.includes('Lời Phê Của Giáo Viên'));
  assert.ok(csv.includes('LMS8888'));
  assert.ok(csv.includes('Lê Văn An'));
  assert.ok(csv.includes('34 phút 20 giây'));
  assert.ok(csv.includes('-5đ'));
});

test('Kiểm tra Timer & AntiCheat cơ bản & Gia Hạn Thời Gian', (t) => {
  assert.strictEqual(timer.formatTime(45 * 60), '45:00');
  assert.strictEqual(timer.formatTime(75), '01:15');
  assert.strictEqual(timer.formatTime(9), '00:09');

  // Kiểm tra gia hạn giờ (extendSeconds)
  timer.start({ durationMinutes: 10 });
  const beforeSec = timer.remainingSeconds;
  timer.extendSeconds(300); // +5 phút
  assert.ok(timer.remainingSeconds >= beforeSec + 295, 'Đồng hồ phải được cộng thêm thời gian');
  timer.stop();

  let violationsReported = 0;
  antiCheat.start({
    onViolation: (v) => { violationsReported = v.count; }
  });
  antiCheat.triggerViolation('Test violation 1');
  assert.strictEqual(violationsReported, 1);
  antiCheat.triggerViolation('Test violation 2');
  assert.strictEqual(violationsReported, 2);
  antiCheat.stop();
});
