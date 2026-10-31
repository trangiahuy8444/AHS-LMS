import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createExamBankActions } from '../src/admin/actions/examBankActions.js';

// Hoàn toàn là dữ liệu giả; không tạo kết nối Firebase.
const attempt = (patch = {}) => ({
  fullName: 'Học Sinh Giả', studentId: '999999', studentClass: '8/1',
  attemptsUsed: 1, allowedAttempts: 2, examCode: '103', submitted: true,
  deviceChanges: 2, ...patch
});
function setup(data) {
  const ref = { get: vi.fn().mockResolvedValue({ exists: true, data: () => data }) };
  const tx = { get: vi.fn().mockResolvedValue({ exists: true, data: () => data }), update: vi.fn() };
  window.firebaseDb = { collection: vi.fn().mockReturnValue({ doc: vi.fn().mockReturnValue(ref) }),
    runTransaction: vi.fn(fn => fn(tx)) };
  window.AsianSchoolStorage = { logAudit: vi.fn() };
  const s = { config: { maxExamAttempts: 1 }, attemptGrade: 8, attemptLms: '999999', setAttemptStatus: vi.fn() };
  return { ...createExamBankActions(s), s, tx };
}
beforeEach(() => { delete window.AsianSchoolNormalize; });
describe('lượt thi quản trị dùng schema phẳng của exam_attempts', () => {
  it('tra cứu hiển thị đã nộp, đúng mã đề và số lần đổi thiết bị', async () => {
    const { handleLookupAttempt, s } = setup(attempt());
    await handleLookupAttempt();
    expect(s.setAttemptStatus).toHaveBeenCalledWith(expect.stringContaining('mã đề 103, đã nộp, đổi thiết bị 2 lần'));
    expect(s.setAttemptStatus).toHaveBeenCalledWith(expect.stringContaining('1/2 lượt'));
  });
  it('tra cứu hiển thị lượt đang làm từ submitted=false', async () => {
    const { handleLookupAttempt, s } = setup(attempt({ submitted: false, deviceChanges: 0 }));
    await handleLookupAttempt();
    expect(s.setAttemptStatus).toHaveBeenCalledWith(expect.stringContaining('mã đề 103, đang làm dở'));
    expect(s.setAttemptStatus.mock.calls[0][0]).not.toContain('đổi thiết bị');
  });
  it('không cấp lượt mới khi lượt hiện tại chưa nộp', async () => {
    const { handleGrantAttempt, s, tx } = setup(attempt({ submitted: false }));
    await handleGrantAttempt();
    expect(tx.update).not.toHaveBeenCalled();
    expect(window.AsianSchoolStorage.logAudit).not.toHaveBeenCalled();
    expect(s.setAttemptStatus).toHaveBeenCalledWith(expect.stringContaining('chờ nộp bài'));
  });
  it('chỉ cấp lượt sau khi nộp và tăng từ allowedAttempts lớn hơn attemptsUsed', async () => {
    const { handleGrantAttempt, s, tx } = setup(attempt({ allowedAttempts: 4, attemptsUsed: 2 }));
    await handleGrantAttempt();
    expect(tx.update).toHaveBeenCalledWith(expect.anything(), { allowedAttempts: 5 });
    expect(window.AsianSchoolStorage.logAudit).toHaveBeenCalledTimes(1);
    expect(s.setAttemptStatus).toHaveBeenCalledWith(expect.stringContaining('2/5 lượt'));
    expect(s.setAttemptStatus).toHaveBeenCalledWith(expect.stringContaining('đã nộp'));
  });
  it('cấp lượt từ attemptsUsed nếu số lượt đã dùng vượt cấu hình cũ', async () => {
    const { handleGrantAttempt, tx } = setup(attempt({ allowedAttempts: 1, attemptsUsed: 3 }));
    await handleGrantAttempt();
    expect(tx.update).toHaveBeenCalledWith(expect.anything(), { allowedAttempts: 4 });
  });
  it('không cấp lượt khi thiếu trạng thái nộp, tránh coi dữ liệu không rõ là đã nộp', async () => {
    const d = attempt(); delete d.submitted;
    const { handleGrantAttempt, tx } = setup(d);
    await handleGrantAttempt();
    expect(tx.update).not.toHaveBeenCalled();
  });
});
