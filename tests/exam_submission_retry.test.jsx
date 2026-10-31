import { beforeEach, expect, it, vi } from 'vitest';
import { createExamSubmitActions } from '../src/student/actions/examSubmitActions.js';

function setup() {
  const state = { grade: 8, mode: 'exam', fullName: 'Học Sinh Giả', studentClass: '8/1', studentId: '999999',
    sessionId: 'fake-session', assignedCode: '101', examAnswers: { mcq: { 1: 2 }, tf: {}, essay: {} }, violations: 2,
    config: {}, currentOfficialExam: {}, submittingExamRef: { current: false },
    setExamState: vi.fn(), setIsContactingServer: vi.fn(), setShowSubmitModal: vi.fn(), setScoreResult: vi.fn(), showDialog: vi.fn() };
  return { state, ...createExamSubmitActions(state) };
}
beforeEach(() => {
  localStorage.clear();
  window.AsianSchoolTimer = { stop: vi.fn() };
  window.AsianSchoolAntiCheat = { setSubmitting: vi.fn(), stop: vi.fn(), exitFullscreen: vi.fn() };
  window.AsianSchoolStorage = { updateLiveSession: vi.fn() };
  window.AsianSchoolCloud = { submitExam: vi.fn() };
});
it('chuyển sessionId tới máy chủ và chỉ xóa bản pending sau khi nộp thành công', async () => {
  let complete;
  window.AsianSchoolCloud.submitExam.mockReturnValue(new Promise(resolve => { complete = resolve; }));
  const { handleSubmitExam, state } = setup();
  const operation = handleSubmitExam(true);
  expect(window.AsianSchoolCloud.submitExam).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 'fake-session' }));
  expect(localStorage.getItem('asian_school_pending_exam_v1')).not.toBeNull();
  expect(state.setExamState).not.toHaveBeenCalled();
  complete({ submissionId: 'fake-submission' });
  await operation;
  expect(localStorage.getItem('asian_school_pending_exam_v1')).toBeNull();
  expect(state.setExamState).toHaveBeenCalledWith('submitted');
});
it('giữ bài khi mạng lỗi; nút thử lại dùng cùng phiên và bài, không gửi hai lần cùng lúc', async () => {
  window.AsianSchoolCloud.submitExam.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ submissionId: 'same' });
  const { handleSubmitExam, state } = setup();
  await handleSubmitExam(true);
  expect(localStorage.getItem('asian_school_pending_exam_v1')).not.toBeNull();
  expect(state.setExamState).not.toHaveBeenCalled();
  expect(state.submittingExamRef.current).toBe(false);
  const retry = state.showDialog.mock.calls[0][3];
  await Promise.all([retry(), retry()]);
  expect(window.AsianSchoolCloud.submitExam).toHaveBeenCalledTimes(2);
  expect(window.AsianSchoolCloud.submitExam.mock.calls[0][0]).toEqual(window.AsianSchoolCloud.submitExam.mock.calls[1][0]);
});
