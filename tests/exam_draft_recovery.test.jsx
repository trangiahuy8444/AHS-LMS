import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createExamDraftIdentity, readExamDraft, saveExamDraft, clearExamDraft } from '../src/student/actions/examDraft.js';
import { useStudentController } from '../src/student/hooks/useStudentController.js';

vi.mock('../src/student/hooks/useProctorCommands.js', () => ({ useProctorCommands: () => ({}) }));
vi.mock('../src/student/hooks/useBlockDevtools.js', () => ({ useBlockDevtools: () => {} }));
const startedAtMs = 1700000000000;
const identityInput = { grade: 8, studentClass: '8/19', studentId: '999999', examCode: '101', startedAtMs, uid: 'fake-owner' };
const answers = { mcq: { 1: 2 }, tf: { 1: { a: true, b: false } }, essay: { 1: 'Bài làm giả' } };
const identity = () => createExamDraftIdentity(identityInput);
function serverStart(overrides = {}) {
  return { examCode: '101', startedAtMs, durationMinutes: 45, exam: { mcqQuestions: [] }, violations: 0, ...overrides };
}
beforeEach(() => {
  sessionStorage.clear(); localStorage.clear();
  localStorage.setItem('ahs_student_fullname_v1', 'Học Sinh Giả');
  localStorage.setItem('ahs_student_class_v1', '8/19');
  localStorage.setItem('ahs_student_lms_v1', '999999');
  window.AsianSchoolStorage = { getClassAccessMode: () => 'exam_only', getConfig: () => ({}),
    onConfigChange: () => () => {}, generatePracticeSet: () => ({ mcqQuestions: [], tfQuestions: [], essayQuestions: [] }),
    updateLiveSession: vi.fn() };
  window.AsianSchoolAuth = { uid: () => 'fake-owner' };
  window.AsianSchoolCloud = { startExam: vi.fn().mockResolvedValue(serverStart()), submitExam: vi.fn().mockResolvedValue({ submissionId: 'fake-submission' }) };
  window.AsianSchoolTimer = { start: vi.fn(), stop: vi.fn() };
  window.AsianSchoolAntiCheat = { requestFullscreen: vi.fn().mockResolvedValue(undefined), start: vi.fn(), stop: vi.fn(),
    setLocked: vi.fn(), setSubmitting: vi.fn(), exitFullscreen: vi.fn() };
});
afterEach(cleanup);

it('draft chỉ chứa bài làm, không mang trường đề/đáp án chuẩn sang bộ nhớ', () => {
  expect(saveExamDraft(identity(), { ...answers, exam: { correctAnswer: 3 }, correctAnswer: 2 })).toBe(true);
  expect(readExamDraft(identity())).toEqual(answers);
  const stored = Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.getItem(sessionStorage.key(i))).join('');
  expect(stored).not.toMatch(/correctAnswer|"exam"/);
});
it.each(['grade', 'studentClass', 'studentId', 'examCode', 'startedAtMs', 'uid'])('draft không phục hồi khi khác %s', field => {
  saveExamDraft(identity(), answers);
  const changed = { grade: 9, studentClass: '8/20', studentId: '888888', examCode: '102', startedAtMs: startedAtMs + 1, uid: 'another-owner' };
  expect(readExamDraft(createExamDraftIdentity({ ...identityInput, [field]: changed[field] }))).toBeNull();
});
it('draft hỏng hoặc storage bị chặn không làm hỏng luồng làm bài', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  expect(saveExamDraft(identity(), answers, blocked)).toBe(false);
  expect(readExamDraft(identity(), blocked)).toBeNull();
  expect(() => clearExamDraft(identity(), blocked)).not.toThrow();
  expect(createExamDraftIdentity({ ...identityInput, startedAtMs: NaN })).toBeNull();
});
async function open(hook) {
  act(() => hook.result.current.setExamPasswordInput('fake-password'));
  await act(async () => hook.result.current.handleStart());
}
it('mount không ghi rỗng đè draft; chỉ restore sau máy chủ xác nhận kể cả khi lượt đang khóa', async () => {
  saveExamDraft(identity(), answers);
  let confirm;
  window.AsianSchoolCloud.startExam.mockReturnValue(new Promise(resolve => { confirm = resolve; }));
  const hook = renderHook(() => useStudentController());
  expect(readExamDraft(identity())).toEqual(answers);
  act(() => hook.result.current.setExamPasswordInput('fake-password'));
  let starting;
  await act(async () => { starting = hook.result.current.handleStart(); await Promise.resolve(); });
  expect(hook.result.current.examAnswers).toEqual({ mcq: {}, tf: {}, essay: {} });
  expect(readExamDraft(identity())).toEqual(answers);
  await act(async () => { confirm(serverStart({ locked: true, exam: null })); await starting; });
  expect(hook.result.current.isSessionLocked).toBe(true);
  expect(hook.result.current.examAnswers).toEqual(answers);
  expect(readExamDraft(identity())).toEqual(answers);
});
it('lưu khi đang làm và phục hồi sau reload cùng lượt; lượt mới bắt đầu rỗng', async () => {
  const first = renderHook(() => useStudentController());
  await open(first);
  act(() => first.result.current.setExamAnswers(answers));
  expect(readExamDraft(identity())).toEqual(answers);
  first.unmount();
  const reloaded = renderHook(() => useStudentController());
  await open(reloaded);
  expect(reloaded.result.current.examAnswers).toEqual(answers);
  reloaded.unmount();
  window.AsianSchoolCloud.startExam.mockResolvedValue(serverStart({ startedAtMs: startedAtMs + 1000 }));
  const nextAttempt = renderHook(() => useStudentController());
  await open(nextAttempt);
  expect(nextAttempt.result.current.examAnswers).toEqual({ mcq: {}, tf: {}, essay: {} });
});
it('nộp lỗi giữ draft và pending; chỉ xóa draft đúng lượt sau xác nhận thành công', async () => {
  const hook = renderHook(() => useStudentController());
  await open(hook);
  act(() => hook.result.current.setExamAnswers(answers));
  window.AsianSchoolCloud.submitExam.mockRejectedValueOnce(new Error('offline'));
  await act(async () => hook.result.current.handleSubmitExam(true));
  expect(readExamDraft(identity())).toEqual(answers);
  expect(localStorage.getItem('asian_school_pending_exam_v1')).not.toBeNull();
  await act(async () => hook.result.current.handleSubmitExam(true));
  expect(readExamDraft(identity())).toBeNull();
  expect(localStorage.getItem('asian_school_pending_exam_v1')).toBeNull();
  expect(hook.result.current.examState).toBe('submitted');
});
it('hết giờ sau khi nhập/khôi phục bài nộp đáp án mới nhất, không dùng closure rỗng lúc bắt đầu', async () => {
  saveExamDraft(identity(), answers);
  const hook = renderHook(() => useStudentController());
  await open(hook);
  const latestAnswers = { ...answers, mcq: { 1: 1, 2: 3 } };
  act(() => hook.result.current.setExamAnswers(latestAnswers));
  const timeout = window.AsianSchoolTimer.start.mock.calls[0][0].onTimeout;
  await act(async () => { timeout(); await Promise.resolve(); });
  expect(window.AsianSchoolCloud.submitExam).toHaveBeenCalledWith(expect.objectContaining({ answers: latestAnswers }));
});
it('hết giờ ôn tập dùng bài làm, phiên và tổng vi phạm mới nhất của học sinh', async () => {
  window.AsianSchoolStorage.getClassAccessMode = () => 'practice_only';
  window.AsianSchoolStorage.getConfig = () => ({ practiceDurationMinutes: 5 });
  window.AsianSchoolStorage.generatePracticeSet = () => ({
    mcqQuestions: [{ id: 'fake-q1', correctAnswer: 2 }, { id: 'fake-q2', correctAnswer: 1 }],
    tfQuestions: [], essayQuestions: []
  });
  window.AsianSchoolStorage.saveSubmission = vi.fn(() => ({ attemptNumber: 1 }));
  window.AsianSchoolStorage.determineExamCode = () => 'DE_CUONG';
  const hook = renderHook(() => useStudentController());
  await act(async () => hook.result.current.handleStart());
  const latestAnswers = { mcq: { 'fake-q1': 2, 'fake-q2': 1 }, tf: {}, essay: {} };
  act(() => {
    hook.result.current.setPracticeAnswers(latestAnswers);
    hook.result.current.setTotalViolations(4);
  });
  const sessionId = hook.result.current.sessionId;
  expect(sessionId).not.toBe('');
  const timeout = window.AsianSchoolTimer.start.mock.calls[0][0].onTimeout;
  act(() => timeout());
  expect(window.AsianSchoolStorage.saveSubmission).toHaveBeenCalledWith(expect.objectContaining({
    answers: latestAnswers, score: 0.5, violations: 4, sessionId
  }));
  expect(hook.result.current.scoreResult.score).toBe(0.5);
  expect(hook.result.current.examState).toBe('submitted');
  expect(window.AsianSchoolCloud.submitExam).not.toHaveBeenCalled();
});

it('completed entry opens the result directly without starting a timer, anti-cheat or a new draft',async()=>{
 window.AsianSchoolCloud.startExam.mockResolvedValue({completed:true,examCode:'101',result:{receiptOnly:true,examCode:'101',mcqPoints:0,submissionId:'fake-submission'}});
 const hook=renderHook(()=>useStudentController());
 act(()=>hook.result.current.setMode('exam'));
 await open(hook);
 expect(hook.result.current.examState).toBe('submitted');
 expect(hook.result.current.scoreResult).toMatchObject({receiptOnly:true,mcqPoints:0});
 expect(hook.result.current.currentOfficialExam).toBeNull();
 expect(window.AsianSchoolTimer.start).not.toHaveBeenCalled();
 expect(window.AsianSchoolAntiCheat.start).not.toHaveBeenCalled();
 expect(window.AsianSchoolStorage.updateLiveSession).not.toHaveBeenCalled();
 expect(hook.result.current.examDraftSession).toBeNull();
});
it('exam draft survives loss of tab storage and restores the active question',async()=>{
 const {readExamDraftPosition}=await import('../src/student/actions/examDraft.js');
 saveExamDraft(identity(),answers,undefined,9);
 sessionStorage.clear();
 expect(readExamDraft(identity())).toEqual(answers);
 expect(readExamDraftPosition(identity())).toBe(9);
});

it('practice restart restores the same set, answers, position and original deadline', async () => {
  window.AsianSchoolStorage.getClassAccessMode = () => 'practice_only';
  window.AsianSchoolStorage.getConfig = () => ({ practiceDurationMinutes: 30 });
  const exactSet = { mcqQuestions: [{ id: 1, correctAnswer: 2 }, { id: 2, correctAnswer: 1 }], tfQuestions: [], essayQuestions: [] };
  window.AsianSchoolStorage.generatePracticeSet = vi.fn(() => exactSet);
  window.AsianSchoolStorage.determineExamCode = () => 'DE_CUONG';
  const first = renderHook(() => useStudentController());
  await act(async () => first.result.current.handleStart());
  const firstStart = first.result.current.examStartTime.getTime();
  const savedAnswers = { mcq: { 1: 2 }, tf: {}, essay: { 1: 'Nội dung đang viết' } };
  act(() => { first.result.current.setPracticeAnswers(savedAnswers); first.result.current.setActiveQuestionIdx(1); });
  first.unmount();
  sessionStorage.clear();
  window.AsianSchoolStorage.getConfig = () => ({ practiceDurationMinutes: 45 });
  window.AsianSchoolStorage.generatePracticeSet.mockReturnValue({mcqQuestions:[{id:99}],tfQuestions:[],essayQuestions:[]});
  const resumed = renderHook(() => useStudentController());
  window.AsianSchoolStorage.generatePracticeSet.mockClear();
  await act(async () => resumed.result.current.handleStart());
  expect(resumed.result.current.practiceAnswers).toEqual(savedAnswers);
  expect(resumed.result.current.practiceSet).toEqual(exactSet);
  expect(resumed.result.current.activeQuestionIdx).toBe(1);
  expect(resumed.result.current.examStartTime.getTime()).toBe(firstStart);
  expect(window.AsianSchoolStorage.generatePracticeSet).not.toHaveBeenCalled();
  const options = window.AsianSchoolTimer.start.mock.calls.at(-1)[0];
  expect(options.deadlineMs).toBe(firstStart + 30 * 60000);
});
it('already-expired restored exam submits recovered answers once after state is restored', async () => {
  saveExamDraft(identity(), answers);
  window.AsianSchoolCloud.startExam.mockResolvedValue(serverStart({deadlineMs: startedAtMs + 2700000, serverNowMs: startedAtMs + 2800000}));
  window.AsianSchoolTimer.start.mockImplementation(options => options.onTimeout());
  const hook = renderHook(() => useStudentController());
  await open(hook);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
  expect(window.AsianSchoolCloud.submitExam).toHaveBeenCalledTimes(1);
  expect(window.AsianSchoolCloud.submitExam).toHaveBeenCalledWith(expect.objectContaining({answers}));
});
