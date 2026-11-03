const { test } = require('node:test');
const assert = require('node:assert/strict');

const storage = require('../src/core/storage-service.js');
const { createExamSubmitActions } = require('../src/student/actions/examSubmitActions.js');

test('Cấu hình mặc định có chống nộp bài sớm 15 phút và khóa xem lại bài thi', () => {
  const cfg = storage.getConfig();
  assert.equal(cfg.preventEarlySubmission, true);
  assert.equal(cfg.minExamMinutes, 15);
  assert.equal(cfg.allowStudentReviewOfficialExam, false);
});

test('Chống nộp bài sớm chặn nộp bài thi chính thức khi chưa đủ thời gian tối thiểu', async () => {
  let dialogShown = null;
  let submitted = false;

  const state = {
    grade: 8,
    mode: 'exam',
    studentClass: '8/19',
    studentId: '111',
    sessionId: 'session-123',
    assignedCode: '101',
    elapsedSeconds: 5 * 60, // Mới làm 5 phút, chưa đủ 15 phút
    config: { preventEarlySubmission: true, minExamMinutes: 15 },
    submittingExamRef: { current: false },
    setShowSubmitModal: () => {},
    setIsContactingServer: () => {},
    showDialog: (title, msg, type) => {
      dialogShown = { title, msg, type };
    },
    examAnswers: { mcq: {}, tf: {}, essay: {} },
    currentOfficialExam: { mcqQuestions: [] }
  };

  const { handleSubmitExam } = createExamSubmitActions(state);
  await handleSubmitExam(false);

  assert.ok(dialogShown !== null, 'Phải hiển thị hộp thoại cảnh báo nộp sớm');
  assert.match(dialogShown.title, /Chưa Đến Thời Gian Nộp Bài/);
  assert.equal(state.submittingExamRef.current, false, 'Không được chuyển trạng thái nộp');
});

test('Cho phép nộp bài khi đã làm đủ thời gian tối thiểu', async () => {
  let cloudSubmitted = false;

  // Mock AsianSchoolCloud
  global.window = {
    AsianSchoolTimer: { stop: () => {} },
    AsianSchoolAntiCheat: { setSubmitting: () => {}, stop: () => {}, exitFullscreen: () => {} },
    AsianSchoolCloud: {
      submitExam: async () => {
        cloudSubmitted = true;
        return { mode: 'exam', pendingGrading: true, submissionId: 'sub-1' };
      }
    },
    AsianSchoolStorage: {
      updateLiveSession: () => {}
    }
  };

  const state = {
    grade: 8,
    mode: 'exam',
    studentClass: '8/19',
    studentId: '111',
    sessionId: 'session-123',
    assignedCode: '101',
    elapsedSeconds: 20 * 60, // Đã làm 20 phút (vượt qua mốc 15 phút)
    config: { preventEarlySubmission: true, minExamMinutes: 15 },
    submittingExamRef: { current: false },
    setShowSubmitModal: () => {},
    setIsContactingServer: () => {},
    setScoreResult: () => {},
    setExamState: () => {},
    showDialog: () => {},
    examAnswers: { mcq: {}, tf: {}, essay: {} },
    currentOfficialExam: { mcqQuestions: [] }
  };

  const { handleSubmitExam } = createExamSubmitActions(state);
  await handleSubmitExam(false);

  assert.equal(cloudSubmitted, true, 'Máy chủ phải nhận bài khi đã làm đủ thời gian tối thiểu');
});

test('Khi hết giờ (isForced = true) hoặc lệnh giám thị, bỏ qua chặn nộp bài sớm', async () => {
  let cloudSubmitted = false;

  global.window = {
    AsianSchoolTimer: { stop: () => {} },
    AsianSchoolAntiCheat: { setSubmitting: () => {}, stop: () => {}, exitFullscreen: () => {} },
    AsianSchoolCloud: {
      submitExam: async () => {
        cloudSubmitted = true;
        return { mode: 'exam', pendingGrading: true, submissionId: 'sub-timeout' };
      }
    },
    AsianSchoolStorage: {
      updateLiveSession: () => {}
    }
  };

  const state = {
    grade: 8,
    mode: 'exam',
    studentClass: '8/19',
    studentId: '111',
    sessionId: 'session-123',
    assignedCode: '101',
    elapsedSeconds: 2 * 60, // Mới làm 2 phút nhưng hết giờ hoặc giám thị thu bài
    config: { preventEarlySubmission: true, minExamMinutes: 15 },
    submittingExamRef: { current: false },
    setShowSubmitModal: () => {},
    setIsContactingServer: () => {},
    setScoreResult: () => {},
    setExamState: () => {},
    showDialog: () => {},
    examAnswers: { mcq: {}, tf: {}, essay: {} },
    currentOfficialExam: { mcqQuestions: [] }
  };

  const { handleSubmitExam } = createExamSubmitActions(state);
  await handleSubmitExam(true); // isForced = true

  assert.equal(cloudSubmitted, true, 'Phải nộp ngay khi hết giờ làm bài bất kể số phút đã làm');
});
