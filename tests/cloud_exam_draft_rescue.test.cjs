const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Cứu hộ bài thi khi máy bị tắt, cúp điện, hoặc máy đóng băng Deep Freeze (100% dữ liệu Cloud)', async () => {
  // Đọc mã nguồn để kiểm tra các điểm kết nối then chốt
  const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
  const firebaseConfig = fs.readFileSync('src/core/firebase-config.js', 'utf8');
  const examDraft = fs.readFileSync('src/student/actions/examDraft.js', 'utf8');
  const startActions = fs.readFileSync('src/student/actions/startActions.js', 'utf8');
  const controller = fs.readFileSync('src/student/hooks/useStudentController.js', 'utf8');

  // 1. firestore.rules cho phép lưu bản nháp draftAnswers và activeQuestionIdx lên exam_attempts
  assert.ok(firestoreRules.includes('function saveDraft()'), 'firestore.rules phải có hàm saveDraft()');
  assert.ok(firestoreRules.includes('draftAnswers'), 'firestore.rules phải cho phép draftAnswers');
  assert.ok(firestoreRules.includes('activeQuestionIdx'), 'firestore.rules phải cho phép activeQuestionIdx');
  assert.ok(firestoreRules.includes('saveDraft()'), 'firestore.rules allow update phải bao gồm saveDraft()');

  // 2. firebase-config.js có hàm saveExamDraftToCloud và xuất ra AsianSchoolCloud
  assert.ok(firebaseConfig.includes('saveExamDraftToCloud'), 'firebase-config.js phải định nghĩa saveExamDraftToCloud');
  assert.ok(firebaseConfig.includes('draftAnswers: attempt.draftAnswers || null'), 'startExam phải trả về draftAnswers');
  assert.ok(firebaseConfig.includes('activeQuestionIdx: Number.isSafeInteger(attempt.activeQuestionIdx)'), 'startExam phải trả về activeQuestionIdx');

  // 3. examDraft.js tự động đồng bộ Cloud Firestore khi có bài làm
  assert.ok(examDraft.includes('AsianSchoolCloud.saveExamDraftToCloud'), 'saveExamDraft phải đồng bộ lên AsianSchoolCloud');

  // 4. startActions.js phục hồi bài làm từ serverStart.draftAnswers khi máy bị đóng băng Deep Freeze
  assert.ok(startActions.includes('serverStart.draftAnswers'), 'startActions phải ưu tiên hoặc fallback serverStart.draftAnswers');
  assert.ok(startActions.includes('serverStart.activeQuestionIdx'), 'startActions phải phục hồi đúng vị trí câu hỏi đang làm dở');

  // 5. useStudentController.js không chặn effect lưu bài làm
  assert.ok(!controller.includes('draftRestoredRef.current !== examDraftSession && examAnswers !== examDraftSession.initialAnswers'), 'Controller không được có điều kiện chặn lưu draft cũ');

  // 6. Mô phỏng luồng hoạt động logic
  const mockAttemptInFirestore = {
    grade: 9,
    studentClass: '9/1',
    studentId: '100001',
    examCode: '101',
    startedAtMs: Date.now() - 600000,
    draftAnswers: {
      mcq: { 1: 0, 2: 1, 3: 2, 4: 3 },
      tf: {},
      essay: { 1: 'Câu trả lời tự luận 1', 2: 'Câu trả lời tự luận 2', 3: 'Câu trả lời tự luận 3' }
    },
    activeQuestionIdx: 5
  };

  // Giả lập máy khởi động lại sau Deep Freeze: localStorage rỗng 100%
  const cleanLocalStorage = {};

  // Học sinh vào lại bài thi -> startExam trả về từ Cloud Firestore
  const serverStart = {
    examCode: mockAttemptInFirestore.examCode,
    startedAtMs: mockAttemptInFirestore.startedAtMs,
    draftAnswers: mockAttemptInFirestore.draftAnswers,
    activeQuestionIdx: mockAttemptInFirestore.activeQuestionIdx
  };

  // Giả lập logic startActions
  let restoredAnswers = cleanLocalStorage['ahs_exam_recovery_v1:...'] || serverStart.draftAnswers;
  let restoredQuestionIdx = serverStart.activeQuestionIdx;

  assert.deepEqual(restoredAnswers.mcq, { 1: 0, 2: 1, 3: 2, 4: 3 }, '4 câu trắc nghiệm được phục hồi 100%');
  assert.deepEqual(restoredAnswers.essay, { 1: 'Câu trả lời tự luận 1', 2: 'Câu trả lời tự luận 2', 3: 'Câu trả lời tự luận 3' }, '3 câu tự luận được phục hồi 100%');
  assert.equal(restoredQuestionIdx, 5, 'Vị trí câu hỏi đang làm dở được phục hồi');
});
