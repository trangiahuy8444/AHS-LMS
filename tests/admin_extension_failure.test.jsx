import { beforeEach, expect, it, vi } from 'vitest';
import { createProctorActions } from '../src/admin/actions/proctorActions.js';
const exam = { sessionId: 'fake-exam', mode: 'exam', grade: 8, studentId: '999999', status: 'in_progress' };
function setup(sessions = [exam]) {
  window.AsianSchoolStorage = { getLiveSessions: vi.fn(() => sessions), sendProctorCommand: vi.fn() };
  window.AsianSchoolCloud = { extendExamTime: vi.fn().mockResolvedValue({ applied: true, extraTimeSeconds: 300 }) };
  const state = { showDialog: vi.fn(), showToast: vi.fn() };
  return { state, actions: createProctorActions(state) };
}
beforeEach(() => vi.restoreAllMocks());
it('gia hạn chính thức chờ máy chủ; không gửi lệnh legacy gây cộng hai lần', async () => {
  const { state, actions } = setup();
  let acknowledge;
  window.AsianSchoolCloud.extendExamTime.mockReturnValue(new Promise(resolve => { acknowledge = resolve; }));
  actions.handleExtendTime('fake-exam', 'Học Sinh Giả', 5);
  const operation = state.showDialog.mock.calls[0][3]();
  expect(window.AsianSchoolCloud.extendExamTime).toHaveBeenCalledWith({ grade: 8, studentId: '999999', minutes: 5 });
  expect(state.showToast).not.toHaveBeenCalled();
  acknowledge({ applied: true, extraTimeSeconds: 300 }); await operation;
  expect(state.showToast).toHaveBeenCalledWith(expect.any(String), 'success', expect.any(String));
  expect(window.AsianSchoolStorage.sendProctorCommand).not.toHaveBeenCalled();
});
it('máy chủ từ chối gia hạn: không phát command hoặc báo thành công', async () => {
  const { state, actions } = setup();
  window.AsianSchoolCloud.extendExamTime.mockRejectedValue(new Error('permission-denied'));
  actions.handleExtendTime('fake-exam', 'Học Sinh Giả', 5);
  await state.showDialog.mock.calls[0][3]();
  expect(state.showToast).not.toHaveBeenCalled();
  expect(window.AsianSchoolStorage.sendProctorCommand).not.toHaveBeenCalled();
  expect(state.showDialog).toHaveBeenLastCalledWith(expect.any(String), expect.stringContaining('permission-denied'), 'error');
});
it('gia hạn cả phòng chỉ một lần mỗi lượt khối/LMS và bỏ qua thẻ đã nộp', async () => {
  const { state, actions } = setup([exam, { ...exam, sessionId: 'duplicate-tab' }, { ...exam, sessionId: 'other-grade', grade: 9 },
    { ...exam, sessionId: 'submitted', studentId: '888888', status: 'submitted' }]);
  actions.handleExtendTimeAll(5);
  await state.showDialog.mock.calls[0][3]();
  expect(window.AsianSchoolCloud.extendExamTime).toHaveBeenCalledTimes(2);
  expect(window.AsianSchoolCloud.extendExamTime).toHaveBeenCalledWith({ grade: 8, studentId: '999999', minutes: 5 });
  expect(window.AsianSchoolCloud.extendExamTime).toHaveBeenCalledWith({ grade: 9, studentId: '999999', minutes: 5 });
  expect(window.AsianSchoolStorage.sendProctorCommand).not.toHaveBeenCalled();
});
it('gia hạn cả phòng báo đúng lỗi từng lượt và không báo thành công toàn phòng khi chỉ một phần đạt', async () => {
  const { state, actions } = setup([exam, { ...exam, sessionId: 'other', studentId: '888888' }]);
  window.AsianSchoolCloud.extendExamTime.mockImplementation(({ studentId }) => studentId === '888888'
    ? Promise.reject(new Error('write-failed')) : Promise.resolve({ applied: true }));
  actions.handleExtendTimeAll(5);
  await state.showDialog.mock.calls[0][3]();
  expect(state.showToast).not.toHaveBeenCalled();
  expect(state.showDialog).toHaveBeenLastCalledWith(expect.any(String), expect.stringMatching(/888888.*write-failed/s), 'warning');
});
it('máy chủ báo đã nộp không gia hạn hoặc báo thành công', async () => {
  const { state, actions } = setup();
  window.AsianSchoolCloud.extendExamTime.mockResolvedValue({ applied: false, reason: 'submitted' });
  actions.handleExtendTime('fake-exam', 'Học Sinh Giả', 5);
  await state.showDialog.mock.calls[0][3]();
  expect(state.showToast).not.toHaveBeenCalled();
  expect(window.AsianSchoolStorage.sendProctorCommand).not.toHaveBeenCalled();
});
it('ôn tập giữ cách cộng giờ bằng lệnh, không sửa lượt thi chính thức', async () => {
  const { state, actions } = setup([{ ...exam, mode: 'practice' }]);
  actions.handleExtendTime('fake-exam', 'Học Sinh Giả', 5);
  await state.showDialog.mock.calls[0][3]();
  expect(window.AsianSchoolCloud.extendExamTime).not.toHaveBeenCalled();
  expect(window.AsianSchoolStorage.sendProctorCommand).toHaveBeenCalledWith('fake-exam', 'extend_time', { minutes: 5 });
});
