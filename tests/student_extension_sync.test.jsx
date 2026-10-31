import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useProctorCommands } from '../src/student/hooks/useProctorCommands.js';
let callback;
let commands;
const startMs = 1700000000000;
function state(mode = 'exam') {
  return { grade: 8, studentId: '999999', studentClass: '8/19', sessionId: 'fake-session', assignedCode: '101', mode,
    examState: 'in_progress', isSessionLocked: false, isSessionLockedRef: { current: false },
    officialTimingRef: { current: { startedAtMs: startMs, examCode: '101', baseDurationSeconds: 2700, extraTimeSeconds: 300 } },
    setIsSessionLocked: vi.fn(), setIsProctorUnlocked: vi.fn(), setLockReason: vi.fn(), setOfficialExam: vi.fn(),
    setBroadcastNotice: vi.fn(), setTotalViolations: vi.fn(), setViolations: vi.fn(), config: {} };
}
beforeEach(() => {
  vi.useFakeTimers();
  commands = [];
  window.AsianSchoolStorage = { getPendingProctorCommands: () => commands.filter(c => !c.consumed),
    consumeProctorCommand: id => { const found = commands.find(c => c.cmdId === id); if (found) found.consumed = true; } };
  window.AsianSchoolCloud = { watchAttempt: vi.fn((args, cb) => { callback = cb; return () => {}; }) };
  window.AsianSchoolTimer = { extendSeconds: vi.fn(), syncDeadline: vi.fn() };
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
const snap = extraTimeSeconds => ({ locked: false, examCode: '101', startedAt: { seconds: startMs / 1000 }, extraTimeSeconds });
it('snapshot máy chủ đồng bộ hạn tuyệt đối; snapshot lặp và command cũ không cộng hai lần', () => {
  renderHook(() => useProctorCommands(state()));
  act(() => callback(snap(600), { fromServer: true }));
  expect(window.AsianSchoolTimer.syncDeadline).toHaveBeenCalledWith(startMs + 3300000);
  act(() => callback(snap(600), { fromServer: true }));
  commands.push({ cmdId: 'legacy-extra', command: 'extend_time', createdAt: Date.now(), payload: { minutes: 5 } });
  act(() => vi.advanceTimersByTime(2000));
  expect(window.AsianSchoolTimer.extendSeconds).not.toHaveBeenCalled();
  expect(window.AsianSchoolTimer.syncDeadline.mock.calls.every(([end]) => end === startMs + 3300000)).toBe(true);
});
it('snapshot cache/pending hoặc khác lượt không thay đổi đồng hồ', () => {
  renderHook(() => useProctorCommands(state()));
  act(() => callback(snap(900), { fromServer: false }));
  act(() => callback({ ...snap(900), startedAt: { seconds: startMs / 1000 + 1 } }, { fromServer: true }));
  act(() => callback({ ...snap(900), examCode: '102' }, { fromServer: true }));
  expect(window.AsianSchoolTimer.syncDeadline).not.toHaveBeenCalled();
});
it('ôn tập giữ cách cộng phút theo lệnh giám thị', () => {
  commands.push({ cmdId: 'practice-extra', command: 'extend_time', createdAt: Date.now(), payload: { minutes: 5 } });
  renderHook(() => useProctorCommands(state('practice')));
  expect(window.AsianSchoolTimer.extendSeconds).toHaveBeenCalledOnce();
  expect(window.AsianSchoolTimer.extendSeconds).toHaveBeenCalledWith(300);
  expect(window.AsianSchoolTimer.syncDeadline).not.toHaveBeenCalled();
});

it('snapshot đến trước command hay sau reload đều dùng cùng hạn, không gia hạn thêm lần nữa', () => {
  const s = state();
  s.officialTimingRef.current.extraTimeSeconds = 600;
  commands.push({ cmdId: 'before-snapshot', command: 'extend_time', createdAt: Date.now(), payload: { minutes: 5 } });
  renderHook(() => useProctorCommands(s));
  act(() => callback(snap(600), { fromServer: true }));
  expect(window.AsianSchoolTimer.extendSeconds).not.toHaveBeenCalled();
  expect(window.AsianSchoolTimer.syncDeadline).toHaveBeenLastCalledWith(startMs + 3300000);
});
