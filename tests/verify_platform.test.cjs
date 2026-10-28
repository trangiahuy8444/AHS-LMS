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

// Mã nguồn giao diện (Vite): gộp mọi tệp .js/.jsx của trang và phần dùng chung để kiểm tra chuỗi
function readPageSource(page) {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : (/\.(jsx?|mjs)$/.test(e.name) ? [path.join(dir, e.name)] : []));
  return [path.join(__dirname, '../src', page), path.join(__dirname, '../src/shared')]
    .filter(d => fs.existsSync(d)).flatMap(walk).map(f => fs.readFileSync(f, 'utf8')).join('\n');
}

// Mã đề chính thức kèm đáp án chỉ nằm ở private/ trên máy giáo viên (gitignore), không có trong data/ công khai
function loadPrivateExams(grade) {
  const file = path.join(__dirname, `../private/ma_de_chinh_thuc_khoi_${grade}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).officialExams : null;
}
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
  assert.strictEqual(g8.officialExams, undefined, 'data/questions_grade8.js công khai không được chứa mã đề chính thức');
  const officialExams = loadPrivateExams(8);
  if (!officialExams) {
    t.skip('Không có private/ma_de_chinh_thuc_khoi_8.json trên máy này');
    return;
  }
  const codes = ['101', '102', '103', '104'];
  codes.forEach(code => {
    const exam = officialExams[code];
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

  assert.strictEqual(g9.officialExams, undefined, 'data/questions_grade9.js công khai không được chứa mã đề chính thức');
  const officialExams = loadPrivateExams(9);
  if (!officialExams) {
    t.skip('Không có private/ma_de_chinh_thuc_khoi_9.json trên máy này');
    return;
  }
  const codes = ['101', '102', '103', '104'];
  codes.forEach(code => {
    const exam = officialExams[code];
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

  assert.strictEqual(g10.officialExams, undefined, 'data/questions_grade10.js công khai không được chứa mã đề chính thức');
  const officialExams = loadPrivateExams(10);
  if (!officialExams) {
    t.skip('Không có private/ma_de_chinh_thuc_khoi_10.json trên máy này');
    return;
  }
  const codes = ['101', '102', '103', '104'];
  codes.forEach(code => {
    const exam = officialExams[code];
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
  const logoSchool = path.join(__dirname, '../public/assets/logo_asian_school.png');
  const logoBanner = path.join(__dirname, '../public/assets/logo_asian_banner.png');
  const logoBase64 = path.join(__dirname, '../public/assets/logo-base64.js');
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
  assert.strictEqual(storage.getConfig().examPassword, '', 'Mã nguồn không được chứa mật khẩu phòng thi mặc định');
  assert.strictEqual(storage.checkExamPassword(''), false, 'Chưa đặt mật khẩu thì không ai vào được phòng thi');
  storage.setExamPassword('asian2026');
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

test('Kiểm tra Đăng nhập Quản trị qua Firebase Auth & Nhật ký Hoạt động (Audit Log)', (t) => {
  assert.strictEqual(storage.getConfig().adminPasswordHash, undefined, 'Không còn mật khẩu admin trong cấu hình phía client');
  const adminHtml = readPageSource('admin');
  assert.ok(adminHtml.includes('AsianSchoolAuth.signInTeacher'), 'Cổng quản trị phải đăng nhập bằng Firebase Auth');
  assert.ok(!adminHtml.includes('8c6976e5b5410415'), 'Không còn hash mật khẩu admin mặc định');

  const logs = storage.getAuditLogs();
  assert.ok(logs.length > 0, 'Phải có nhật ký ghi nhận các thao tác');
  assert.ok(logs.some(l => l.action.includes('mật khẩu phòng thi')));
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

test('Kiểm tra Phân quyền Ca thi Độc lập theo Từng Lớp Học (Class Access Control Matrix)', (t) => {
  // Mặc định tất cả các lớp là practice_only
  assert.strictEqual(storage.getClassAccessMode('8/19'), 'practice_only');
  assert.strictEqual(storage.getClassAccessMode('9/20'), 'practice_only');
  assert.strictEqual(storage.getClassAccessMode('10/14'), 'practice_only');

  // Giáo viên bắt đầu ca thi cho Lớp 8/19
  storage.setQuickExamClass('8/19');
  assert.strictEqual(storage.getClassAccessMode('8/19'), 'exam_only', 'Lớp 8/19 phải ở chế độ thi chính thức (exam_only)');
  assert.strictEqual(storage.getClassAccessMode('8/20'), 'practice_only', 'Lớp 8/20 vẫn phải ở chế độ ôn tập (practice_only)');
  assert.strictEqual(storage.getClassAccessMode('9/20'), 'practice_only', 'Lớp 9/20 vẫn phải ở chế độ ôn tập (practice_only)');

  // Giáo viên tùy chỉnh lớp 9/20 mở cả 2
  storage.setClassAccessMode('9/20', 'both_open');
  assert.strictEqual(storage.getClassAccessMode('9/20'), 'both_open');

  // Đóng toàn bộ ca thi -> tất cả về practice_only
  storage.closeAllExamSessions();
  assert.strictEqual(storage.getClassAccessMode('8/19'), 'practice_only');
  assert.strictEqual(storage.getClassAccessMode('9/20'), 'practice_only');
  assert.strictEqual(storage.getClassAccessMode('10/14'), 'practice_only');
});

test('Kiểm tra Phiên Ôn Tập Đề Cương Theo Mã LMS (Session Scope & Không Lưu CSDL Vĩnh Viễn)', (t) => {
  const studentLms = 'LMS_TEST_2026';
  storage.resetPracticeSession(studentLms);
  assert.strictEqual(storage.getPracticeAttempts(studentLms), 0);

  const a1 = storage.incrementPracticeAttempt(studentLms);
  assert.strictEqual(a1, 1);
  const a2 = storage.incrementPracticeAttempt(studentLms);
  assert.strictEqual(a2, 2);

  const initialSubmissionsCount = storage.getSubmissions().length;

  // Học sinh nộp bài ôn tập
  const practiceResult = storage.saveSubmission({
    fullName: 'Nguyễn Rèn Luyện',
    studentCode: studentLms,
    studentId: studentLms,
    grade: 8,
    studentClass: '8/19',
    mode: 'practice',
    score: 9.5,
    mcqPoints: 9.5
  });

  assert.strictEqual(practiceResult.isPracticeOnly, true);
  assert.strictEqual(practiceResult.attemptNumber, 3, 'Lần làm bài phải được tự động tăng lên 3');

  // Khẳng định CSDL submissions không bị ô nhiễm bởi bài ôn tập
  const afterSubmissionsCount = storage.getSubmissions().length;
  assert.strictEqual(afterSubmissionsCount, initialSubmissionsCount, 'Bài làm ôn tập tuyệt đối KHÔNG được lưu vào CSDL vĩnh viễn');

  // Reset phiên khi hết phiên đăng nhập
  storage.resetPracticeSession(studentLms);
  assert.strictEqual(storage.getPracticeAttempts(studentLms), 0);
});

test('Kiểm tra Vòng Đời Dữ Liệu Bài Thi (Retention Summary) & Dọn Dẹp An Toàn (2-3 Tuần)', (t) => {
  // Thêm 2 bài thi chính thức
  storage.saveSubmission({
    fullName: 'Thí Sinh Khóa 1',
    studentCode: 'LMS_EXAM_01',
    grade: 8,
    studentClass: '8/19',
    mode: 'exam',
    examCode: '101',
    mcqPoints: 8.0
  });

  storage.saveSubmission({
    fullName: 'Thí Sinh Khóa 2',
    studentCode: 'LMS_EXAM_02',
    grade: 9,
    studentClass: '9/20',
    mode: 'exam',
    examCode: '102',
    mcqPoints: 7.5
  });

  const summary = storage.getExamRetentionSummary();
  assert.ok(summary.totalCount >= 2, 'Tổng số bài thi chính thức phải >= 2');
  assert.strictEqual(summary.retentionDays, 21, 'Hạn lưu trữ mặc định phải là 21 ngày (3 tuần)');

  // Dọn dẹp kỳ thi cũ
  const purgeRes = storage.purgeOldExamSubmissions({ purgeAll: true });
  assert.strictEqual(purgeRes.success, true);
  assert.ok(purgeRes.deletedCount >= 2);

  const remainingExams = storage.getSubmissions().filter(s => s.mode === 'exam');
  assert.strictEqual(remainingExams.length, 0, 'Toàn bộ bài thi chính thức phải được dọn dẹp sạch');
});

test('Kiểm tra Cấu hình Kết Nối Google Drive Webhook & Payload Sao Lưu', (t) => {
  storage.saveConfig({
    googleDriveWebhookUrl: 'https://script.google.com/macros/s/AKfycb_sample_test/exec',
    retentionDays: 21
  });

  const cfg = storage.getConfig();
  assert.strictEqual(cfg.googleDriveWebhookUrl, 'https://script.google.com/macros/s/AKfycb_sample_test/exec');
  assert.strictEqual(cfg.retentionDays, 21);
});

test('Kiểm tra Thuật toán Ngẫu Nhiên Hóa Đề Cương (THCS 28 TN + 3 TL; THPT 19 TN + 3 Đ/S + 3 TL)', (t) => {
  const g8Data = require('../data/questions_grade8.js');
  const g9Data = require('../data/questions_grade9.js');
  const g10Data = require('../data/questions_grade10.js');

  // Khối 8: Rút 28 câu trắc nghiệm + 3 câu tự luận
  const set8 = storage.generatePracticeSet(8, g8Data);
  assert.strictEqual(set8.mcqQuestions.length, 28, 'Khối 8 đề cương phải có đúng 28 câu trắc nghiệm');
  assert.strictEqual(set8.essayQuestions.length, 3, 'Khối 8 đề cương phải có đúng 3 câu tự luận');
  assert.strictEqual(set8.tfQuestions.length, 0, 'Khối 8 không có câu Đúng/Sai');

  // Khối 9: Rút 28 câu trắc nghiệm + 3 câu tự luận
  const set9 = storage.generatePracticeSet(9, g9Data);
  assert.strictEqual(set9.mcqQuestions.length, 28, 'Khối 9 đề cương phải có đúng 28 câu trắc nghiệm');
  assert.strictEqual(set9.essayQuestions.length, 3, 'Khối 9 đề cương phải có đúng 3 câu tự luận');
  assert.strictEqual(set9.tfQuestions.length, 0, 'Khối 9 không có câu Đúng/Sai');

  // Khối 10: Rút 19 câu trắc nghiệm + 3 câu đúng/sai + 3 câu tự luận
  const set10 = storage.generatePracticeSet(10, g10Data);
  assert.strictEqual(set10.mcqQuestions.length, 19, 'Khối 10 đề cương phải có đúng 19 câu trắc nghiệm');
  assert.strictEqual(set10.tfQuestions.length, 3, 'Khối 10 đề cương phải có đúng 3 câu Đúng/Sai');
  assert.strictEqual(set10.essayQuestions.length, 3, 'Khối 10 đề cương phải có đúng 3 câu tự luận');

  // Kiểm tra xáo trộn phương án bảo toàn tính chính xác của đáp án đúng
  const sampleQ = {
    id: 999,
    question: 'Hệ nhị phân dùng mấy chữ số?',
    options: ['Một chữ số', 'Hai chữ số 0 và 1', 'Mười chữ số', 'Tám chữ số'],
    correctAnswer: 1,
    answerLetter: 'B'
  };
  const shuffledQ = storage.shuffleQuestionOptions(sampleQ);
  assert.strictEqual(shuffledQ.options[shuffledQ.correctAnswer], 'Hai chữ số 0 và 1', 'Đáp án đúng phải luôn bảo toàn nội dung sau khi xáo trộn phương án');
});

test('Kiểm tra Cấu hình Admin: Thời Gian Làm Bài & Chế Độ Trộn Đề', (t) => {
  storage.saveConfig({
    examDurationMinutes: 30,
    practiceDurationMinutes: 15,
    shuffleQuestions: true,
    shuffleOptions: true
  });

  const cfg = storage.getConfig();
  assert.strictEqual(cfg.examDurationMinutes, 30);
  assert.strictEqual(cfg.practiceDurationMinutes, 15);
  assert.strictEqual(cfg.shuffleQuestions, true);
  assert.strictEqual(cfg.shuffleOptions, true);
});

test('Kiểm tra Cú pháp firebase-config.js (Không lỗi cú pháp, sẵn sàng kết nối Firestore)', (t) => {
  const code = fs.readFileSync(path.join(__dirname, '../src/core/firebase-config.js'), 'utf8');
  assert.doesNotThrow(() => {
    new Function(code);
  }, 'firebase-config.js phải hợp lệ về cú pháp JavaScript');
});

test('Kiểm tra Giám sát trực tiếp phiên Ôn tập Đề cương từ xa (Live Monitoring) & Không lưu CSDL vĩnh viễn (0% Database)', (t) => {
  // Gửi phiên trực tiếp với mode practice phục vụ giáo viên giám sát từ xa
  const res = storage.updateLiveSession({
    sessionId: 'sess-practice-test-123',
    fullName: 'HS Ôn Tập Test',
    studentClass: '10/14',
    studentId: 'HS99999',
    grade: 10,
    mode: 'practice',
    violations: 2
  });

  assert.strictEqual(res.mode, 'practice');
  const currentSessions = storage.getLiveSessions();
  // Giáo viên thấy học sinh trên bảng giám sát trực tiếp
  assert.strictEqual(currentSessions.some(s => s.sessionId === 'sess-practice-test-123'), true, 'Giáo viên phải thấy học sinh ôn tập trên bảng giám sát trực tiếp');

  // Khi học sinh kết thúc phiên, dọn dẹp sạch sẽ
  storage.removeLiveSession('sess-practice-test-123');
  assert.strictEqual(storage.getLiveSessions().some(s => s.sessionId === 'sess-practice-test-123'), false, 'Dọn dẹp phiên ôn tập hoàn tất');

  // Đảm bảo tuyệt đối không ghi vào CSDL submissions vĩnh viễn
  const subRes = storage.saveSubmission({
    sessionId: 'sess-practice-test-123',
    fullName: 'HS Ôn Tập Test',
    studentClass: '10/14',
    studentId: 'HS99999',
    grade: 10,
    mode: 'practice',
    score: 8.5
  });
  assert.strictEqual(subRes.isPracticeOnly, true);
  const allPermanentSubs = storage.getSubmissions();
  assert.strictEqual(allPermanentSubs.some(s => s.studentId === 'HS99999'), false, 'CSDL vĩnh viễn submissions tuyệt đối không chứa bài ôn tập');
});

test('Kiểm tra Tính Chuẩn Xác của Ngân Hàng Đáp Án Khối 8, 9, 10 (100% Khớp Mã Chữ và Chỉ Số)', (t) => {
  [8, 9, 10].forEach(g => {
    const data = require(`../data/questions_grade${g}.js`);
    data.practiceQuestions.forEach((q, idx) => {
      const expLetter = String.fromCharCode(65 + q.correctAnswer);
      assert.strictEqual(q.answerLetter, expLetter, `Khối ${g} Câu ${idx+1} answerLetter (${q.answerLetter}) phải khớp correctAnswer (${expLetter})`);
    });
  });
});

test('Kiểm tra Hàm Kiểm tra Kết nối Google Drive Webhook (testGoogleDriveConnection)', async (t) => {
  assert.ok(typeof storage.testGoogleDriveConnection === 'function', 'Phải có hàm testGoogleDriveConnection');
  // Khi URL rỗng
  const resEmpty = await storage.testGoogleDriveConnection('');
  assert.strictEqual(resEmpty.success, false);
  assert.ok(resEmpty.error.includes('Vui lòng dán URL'));
});

test('Kiểm tra Cú pháp Đặt Tên Tệp Chụp Màn Hình (Chứa Số Lần Làm Cho Ôn Tập Đề Cương)', (t) => {
  const testHtml = readPageSource('student');
  assert.ok(testHtml.includes("const attemptTag = mode === 'practice' ? `_Lan${scoreResult?.attemptNumber || 1}` : '';"),
    'handleCaptureScreenshot phải gán attemptTag _LanX khi ở chế độ ôn tập');
  assert.ok(testHtml.includes("`LMS_${cleanLms}_${cleanName}_Lop_${cleanClass}_Tin${grade}_${modeTag}${attemptTag}.png`"),
    'Tên file chụp ảnh phải bao gồm attemptTag');
  assert.ok(testHtml.includes("SỐ LẦN ĐÃ LÀM: LẦN THỨ"),
    'Thẻ kết quả bài làm phải hiển thị số lần đã làm rõ ràng');
  assert.ok(!testHtml.includes('overflow-hidden p-6 sm:p-8 space-y-5"'),
    'Thẻ kết quả bài làm không được có overflow-hidden gây che mất/cắt viền số lần làm');
});

test('Kiểm tra Bật/Tắt Cấu Hình Bắt Buộc Trả Lời Hết 100% Câu Hỏi (requireAllQuestionsAnswered)', (t) => {
  const cfg = storage.getConfig();
  assert.strictEqual(typeof cfg.requireAllQuestionsAnswered, 'boolean', 'requireAllQuestionsAnswered phải là boolean trong config');
  
  storage.saveConfig({ requireAllQuestionsAnswered: true });
  assert.strictEqual(storage.getConfig().requireAllQuestionsAnswered, true);
  
  storage.saveConfig({ requireAllQuestionsAnswered: false });
  assert.strictEqual(storage.getConfig().requireAllQuestionsAnswered, false);
});

test('Kiểm tra Chức năng Xóa Bài Nộp Khỏi CSDL (deleteSubmission)', (t) => {
  // Tạo 1 submission mẫu
  const sub = storage.saveSubmission({
    fullName: 'Thí Sinh Cần Xóa',
    studentCode: 'DEL001',
    grade: 8,
    studentClass: '8/19',
    mode: 'exam',
    examCode: '101',
    mcqPoints: 5.0
  });

  assert.ok(storage.getSubmissionById(sub.id), 'Bài nộp phải tồn tại trước khi xóa');
  
  const delRes = storage.deleteSubmission(sub.id);
  assert.strictEqual(delRes.success, true, 'deleteSubmission phải trả về { success: true } khi xóa thành công');
  assert.strictEqual(storage.getSubmissionById(sub.id), null, 'Bài nộp không được tồn tại sau khi xóa');
});

test('Kiểm tra Reset Vi Phạm Khi Giám Thị Mở Khóa (antiCheat.resetViolations)', (t) => {
  assert.ok(typeof antiCheat.resetViolations === 'function', 'antiCheat phải có hàm resetViolations');
  antiCheat.violationCount = 3;
  antiCheat.resetViolations();
  assert.strictEqual(antiCheat.violationCount, 0, 'violationCount phải về 0 sau khi reset');
});

test('Kiểm tra Tự Luận Chờ Giáo Viên Chấm & Điểm Nộp Bài Thi Chính Thức Chỉ Tính Trắc Nghiệm', (t) => {
  const examSub = storage.saveSubmission({
    fullName: 'Nguyễn Văn Thi',
    studentCode: 'THI101',
    grade: 10,
    studentClass: '10/14',
    mode: 'exam',
    examCode: '101',
    mcqPoints: 6.25,
    answers: { essay: { 1: 'Ý trả lời bài thi' } }
  });

  assert.strictEqual(examSub.isGraded, false, 'Bài thi mới nộp phải có isGraded = false');
  assert.strictEqual(examSub.essayTotal, 0, 'Phần tự luận chưa chấm phải là 0 điểm');
  assert.strictEqual(examSub.finalScore, 6.25, 'Điểm tạm tính khi nộp bài chỉ lấy trắc nghiệm/đúng sai, không tự cộng điểm tự luận');
  
  // Cleanup
  storage.deleteSubmission(examSub.id);
});

test('Kiểm tra Cơ Chế Chặn Inspect Code & Phím Tắt DevTools Cả Mac & Windows', (t) => {
  const antiCheatCode = fs.readFileSync(path.join(__dirname, '../src/core/anti-cheat.js'), 'utf8');
  const testHtml = readPageSource('student');

  // Kiểm tra phím tắt trên Mac (Cmd + Option + I/J/C/U) và Windows (F12, Ctrl + Shift + I/J/C, Ctrl + U)
  assert.ok(antiCheatCode.includes("e.altKey") && antiCheatCode.includes("e.shiftKey"), 'anti-cheat.js phải kiểm tra cả altKey và shiftKey cho Mac/Windows');
  assert.ok(antiCheatCode.includes("['I', 'i', 'J', 'j', 'C', 'c'].includes(key)"), 'anti-cheat.js phải chặn các tổ hợp phím mở Developer Tools');
  assert.ok(testHtml.includes("e.preventDefault()"), 'test/index.html phải ngăn chặn sự kiện khi bấm phím tắt inspect');
});

test('Kiểm tra Cú pháp JSX của Cổng Học Sinh và Cổng Quản Trị (biên dịch bằng Vite/Oxc)', async (t) => {
  const { transformWithOxc } = require('vite');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : (e.name.endsWith('.jsx') ? [path.join(dir, e.name)] : []));
  const files = walk(path.join(__dirname, '../src'));
  assert.ok(files.length >= 2, 'Phải có tệp .jsx của hai cổng');
  for (const f of files) {
    await transformWithOxc(fs.readFileSync(f, 'utf8'), f, { jsx: { runtime: 'automatic' } });
  }
});

test('Kiểm tra Hàm Dọn Dẹp Thí Sinh Lớp Cũ & Thí Sinh Hết Ca trong StorageService', (t) => {
  storage.updateLiveSession({ sessionId: 's-819-1', studentClass: '8/19', fullName: 'Nguyen A', status: 'in_progress', lastPing: Date.now() });
  storage.updateLiveSession({ sessionId: 's-819-2', studentClass: '8/19', fullName: 'Le B', status: 'in_progress', lastPing: Date.now() });
  storage.updateLiveSession({ sessionId: 's-820-1', studentClass: '8/20', fullName: 'Tran C', status: 'in_progress', lastPing: Date.now() });
  
  assert.ok(storage.getLiveSessions().some(s => s.sessionId === 's-819-1'));
  assert.ok(storage.getLiveSessions().some(s => s.sessionId === 's-820-1'));

  // Xóa toàn bộ học sinh lớp 8/19
  const resClear = storage.clearLiveSessionsByClass('8/19');
  assert.strictEqual(resClear.success, true);
  assert.strictEqual(resClear.count, 2);
  assert.ok(!storage.getLiveSessions().some(s => s.studentClass === '8/19'), 'Không còn học sinh 8/19');
  assert.ok(storage.getLiveSessions().some(s => s.studentClass === '8/20'), 'Học sinh 8/20 vẫn được giữ nguyên');

  // Kiểm tra dọn dẹp thí sinh không hoạt động / đã nộp
  storage.updateLiveSession({ sessionId: 's-stale', studentClass: '8/20', fullName: 'Stale D', status: 'submitted', lastPing: Date.now() });
  const resStale = storage.cleanStaleLiveSessions(10);
  assert.strictEqual(resStale.success, true);
  assert.ok(!storage.getLiveSessions().some(s => s.sessionId === 's-stale'), 'Thí sinh submitted đã được dọn sạch');
});

test('Kiểm tra Quản lý Bảng Điểm Ôn Tập Đề Cương Riêng Biệt (Practice Submissions)', (t) => {
  const pDoc = {
    studentId: 'LMS8888',
    fullName: 'Hoang Van E',
    studentClass: '8/21',
    mode: 'practice',
    score: 8.5,
    correctCount: 24,
    totalQuestions: 28,
    durationFormatted: '18 phút 30 giây'
  };

  const saved = storage.saveSubmission(pDoc);
  assert.strictEqual(saved.mode, 'practice');
  assert.strictEqual(saved.isPracticeOnly, true);
  
  const practiceList = storage.getPracticeSubmissions();
  assert.ok(practiceList.length > 0, 'Kho bài nộp ôn tập phải chứa bài vừa nộp');
  const found = practiceList.find(s => s.studentId === 'LMS8888');
  assert.ok(found, 'Tìm thấy bài ôn tập của học sinh');
  assert.strictEqual(found.studentClass, '8/21');
  assert.strictEqual(found.attemptNumber, 1);

  // Xóa bài ôn tập
  const delRes = storage.deletePracticeSubmission(found.id);
  assert.strictEqual(delRes.success, true);
  assert.ok(!storage.getPracticeSubmissions().some(s => s.id === found.id));
});

test('Kiểm tra Bảo Mật Khóa Bài Thi & Cơ Chế Toàn Màn Hình Khi Giáo Viên Mở Khóa', (t) => {
  const testHtml = readPageSource('student');
  assert.ok(testHtml.includes('isProctorUnlocked'), 'Phải có state isProctorUnlocked');
  assert.ok(testHtml.includes('ĐANG CHỜ GIÁO VIÊN DUYỆT MỞ KHÓA'), 'Phải hiển thị trạng thái chờ giáo viên mở khóa');
  assert.ok(testHtml.includes('THẦY TRẦN GIA HUY ĐÃ DUYỆT MỞ KHÓA'), 'Phải có giao diện khi Thầy đã mở khóa');
  assert.ok(testHtml.includes('BẤM VÀO ĐÂY ĐỂ VÀO LẠI TOÀN MÀN HÌNH'), 'Phải có nút bấm kích hoạt toàn màn hình');
  assert.ok(testHtml.includes('handleStudentResumeFromLock'), 'Phải gọi hàm handleStudentResumeFromLock');
});

test('Kiểm tra Thích Ứng Đa Thiết Bị & Widget Thời Gian Trực Tiếp Trên Bài Làm', (t) => {
  const testHtml = readPageSource('student');
  assert.ok(testHtml.includes('question-palette-sidebar'), 'Phải có id định vị bảng câu hỏi cho mobile');
  assert.ok(testHtml.includes('formatElapsed'), 'Phải có hàm định dạng thời gian trôi qua');
  assert.ok(testHtml.includes('WIDGET ĐỒNG HỒ THỜI GIAN TRỰC TIẾP'), 'Sidebar phải có widget đồng hồ trực tiếp');
  assert.ok(testHtml.includes('SỐ LẦN ĐÃ LÀM: LẦN THỨ'), 'Thẻ kết quả và Canvas fallback phải có số lần rèn luyện');
  
  const adminHtml = readPageSource('admin');
  assert.ok(adminHtml.includes('Mẫu Bảng Điểm:'), 'Admin Tab 5 phải có bộ chọn mẫu bảng điểm');
  assert.ok(adminHtml.includes('BẢNG TỔNG HỢP KẾT QUẢ ÔN TẬP ĐỀ CƯƠNG TIN HỌC'), 'Tab 5 phải có tiêu đề bảng điểm ôn tập');
  assert.ok(adminHtml.includes('Dọn Thí Sinh Hết Ca'), 'Tab 1 phải có nút dọn dẹp thí sinh hết ca');
  assert.ok(adminHtml.includes('Xóa Lớp Này'), 'Tab 1 phải có nút dọn dẹp thí sinh theo lớp');
  assert.ok(adminHtml.includes('xl:grid-cols-4'), 'Lưới giám sát Tab 1 phải hỗ trợ responsive 4 cột trên laptop');
});






