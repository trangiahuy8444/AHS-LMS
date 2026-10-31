import { beforeEach, expect, it, vi } from 'vitest';
import { createProctorActions } from '../src/admin/actions/proctorActions.js';

const fakeSession = { sessionId: 'fake-session', studentId: '999999', grade: 8, mode: 'exam', violations: 3, isLocked: true };
function setup(sessions = [fakeSession]) {
  window.AsianSchoolStorage = {
    getLiveSessions: vi.fn(() => sessions), sendProctorCommand: vi.fn(), updateLiveSession: vi.fn()
  };
  const state = { showToast: vi.fn(), showDialog: vi.fn(), setShowBroadcastModal: vi.fn(),
    broadcastTarget: 'all', broadcastMsgInput: '', setBroadcastMsgInput: vi.fn() };
  const actions = createProctorActions(state);
  actions.handleUnlockSession('fake-session', 'Học Sinh Giả');
  const confirm = state.showDialog.mock.calls[0][3];
  return { state, confirm, storage: window.AsianSchoolStorage };
}
beforeEach(() => {
  window.AsianSchoolCloud = { setAttemptLock: vi.fn().mockResolvedValue(undefined) };
});
it('phiên đã biến mất: không gửi lệnh, đổi live hoặc báo thành công', async () => {
  const { state, confirm, storage } = setup([]);
  await confirm();
  expect(window.AsianSchoolCloud.setAttemptLock).not.toHaveBeenCalled();
  expect(storage.sendProctorCommand).not.toHaveBeenCalled();
  expect(storage.updateLiveSession).not.toHaveBeenCalled();
  expect(state.showToast).not.toHaveBeenCalled();
  expect(state.showDialog).toHaveBeenLastCalledWith('Không Tìm Thấy Phiên', expect.any(String), 'warning');
});
it('máy chủ từ chối mở khóa: không gửi lệnh, đổi live hoặc báo thành công', async () => {
  window.AsianSchoolCloud.setAttemptLock.mockRejectedValue(new Error('permission-denied'));
  const { state, confirm, storage } = setup();
  await confirm();
  expect(window.AsianSchoolCloud.setAttemptLock).toHaveBeenCalledWith({ grade: 8, studentId: '999999', locked: false });
  expect(storage.sendProctorCommand).not.toHaveBeenCalled();
  expect(storage.updateLiveSession).not.toHaveBeenCalled();
  expect(state.showToast).not.toHaveBeenCalled();
  expect(state.showDialog).toHaveBeenLastCalledWith('Chưa Ghi Được Lên Máy Chủ', expect.stringContaining('permission-denied'), 'error');
});
it('chờ xác nhận máy chủ trước khi phát lệnh và báo mở khóa thành công', async () => {
  let acknowledge;
  window.AsianSchoolCloud.setAttemptLock.mockReturnValue(new Promise(resolve => { acknowledge = resolve; }));
  const { state, confirm, storage } = setup();
  const operation = confirm();
  expect(storage.sendProctorCommand).not.toHaveBeenCalled();
  expect(storage.updateLiveSession).not.toHaveBeenCalled();
  expect(state.showToast).not.toHaveBeenCalled();
  acknowledge();
  await operation;
  expect(storage.sendProctorCommand).toHaveBeenCalledWith('fake-session', 'unlock_session', {
    sessionId: 'fake-session', studentId: '999999', grade: 8
  });
  expect(storage.updateLiveSession).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 'fake-session', status: 'in_progress', isLocked: false }));
  expect(state.showToast).toHaveBeenCalledWith(expect.any(String), 'success', expect.any(String));
});
it('ôn tập vẫn mở khóa qua lệnh giám thị mà không ghi exam_attempts', async () => {
  const { state, confirm, storage } = setup([{ ...fakeSession, mode: 'practice' }]);
  await confirm();
  expect(window.AsianSchoolCloud.setAttemptLock).not.toHaveBeenCalled();
  expect(storage.sendProctorCommand).toHaveBeenCalled();
  expect(storage.updateLiveSession).toHaveBeenCalledWith(expect.objectContaining({ status: 'practicing', isLocked: false }));
  expect(state.showToast).toHaveBeenCalledWith(expect.any(String), 'success', expect.any(String));
});
