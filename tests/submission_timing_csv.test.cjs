const { test } = require('node:test');
const assert = require('node:assert/strict');
const data = new Map();
global.localStorage = { getItem: k => data.get(k) || null, setItem: (k,v) => data.set(k,v) };
const storage = require('../src/core/storage-service.js');
const start = 1793260800;
const row = (patch = {}) => ({ id: 'fake-late', mode: 'exam', grade: 8, studentId: '999999', fullName: 'Học Sinh Giả', studentClass: '8/19', examCode: '101',
  mcqPoints: 4.25, essayTotal: 2, finalScore: 6.25, isGraded: true, violations: 0,
  startedAt: { seconds: start, nanoseconds: 0 }, serverSubmittedAt: { seconds: start + 2702, nanoseconds: 0 }, durationMinutes: 45, extraTimeSeconds: 0,
  submittedAt: '2000-01-01T00:00:00.000Z', ...patch });
function cells(line) { return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').replace(/""/g, '"')); }
test('CSV giữ 16 cột cũ, nối trạng thái nộp và số giây trễ, giữ nguyên điểm', () => {
  const rows = [row(), row({ id: 'fake-extended', extraTimeSeconds: 300 }), row({ id: 'fake-old', durationMinutes: undefined }), row({ id: 'fake-practice', mode: 'practice' })];
  data.set('asian_school_submissions_v1', JSON.stringify(rows));
  const before = data.get('asian_school_submissions_v1');
  const csv = storage.exportSubmissionsCSV();
  assert.equal(csv.charCodeAt(0), 0xfeff);
  const [headers, ...result] = csv.slice(1).split('\r\n').map(cells);
  assert.deepEqual(headers.slice(0,16), ['STT','Mã LMS','Họ và Tên','Lớp','Khối','Chế Độ','Mã Đề','Thời Gian Làm Bài','Điểm TN / Đ-S (Tự động)','Điểm Tự Luận (Chấm)','Ghi Chú Vi Phạm','Tổng Điểm (Thang 10)','Trạng Thái Chấm','Lời Phê Của Giáo Viên','Số Lần Vi Phạm','Thời Gian Nộp']);
  assert.deepEqual(headers.slice(16), ['Trạng Thái Nộp', 'Số Giây Trễ']);
  assert.deepEqual(result.map(r => r.slice(16)), [['Nộp muộn','2'],['Đúng hạn','0'],['Chưa đủ dữ liệu',''],['','']]);
  assert.ok(result.every(r => r[8] === '4.25' && r[9] === '2' && r[11] === '6.25'));
  assert.equal(data.get('asian_school_submissions_v1'), before, 'Xuất không sửa điểm hay dữ liệu gốc');
});
test('tự chấm tính overtime theo duration/extra lưu trên bài, không theo config hiện tại và không phạt muộn', () => {
  const exams = { 8: { '101': { code: '101', mcqQuestions: [{ num: 1, points: 0.25, correctAnswer: 0 }] } } };
  data.set('asian_school_exam_config_v1', JSON.stringify({ examDurationMinutes: 1 }));
  data.set('asian_school_submissions_v1', JSON.stringify([row({ answers: { mcq: { 1: 0 } }, isGraded: false, extraTimeSeconds: 300 })]));
  storage.autoGradeExamSubmissions(exams);
  const sub = JSON.parse(data.get('asian_school_submissions_v1'))[0];
  assert.equal(sub.overtimeSeconds, 0);
  assert.equal(sub.finalScore, 0.25);
  assert.equal(sub.penaltyPoints, 0);
});
