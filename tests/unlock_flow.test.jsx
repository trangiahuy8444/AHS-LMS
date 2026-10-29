// @vitest-environment jsdom
// Luồng khóa / mở khóa bài làm (hook thật useProctorCommands + màn hình khóa thật).
// - Bài thi chính thức: chỉ mở khi exam_attempts.locked chuyển true -> false trên máy chủ (giáo viên mở).
//   Lệnh "unlock_session" trong localStorage (có thể bị giả mạo) bị bỏ qua.
// - Ôn tập: mở khóa bằng lệnh giám thị như trước.
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import { useProctorCommands } from '../src/student/hooks/useProctorCommands.js';
import LockScreen from '../src/student/components/LockScreen.jsx';

let commands;
let attemptCb;
const liveUpdates = [];

beforeEach(() => {
  vi.useFakeTimers();
  commands = [];
  attemptCb = null;
  liveUpdates.length = 0;
  window.AsianSchoolStorage = {
    getPendingProctorCommands: (sid) => commands.filter(c => (c.targetSessionId === sid || c.targetSessionId === 'all') && !c.consumed),
    consumeProctorCommand: (id) => { const c = commands.find(x => x.cmdId === id); if (c) c.consumed = true; },
    updateLiveSession: (d) => liveUpdates.push(d)
  };
  window.AsianSchoolAntiCheat = { resetViolations: vi.fn(), requestFullscreen: vi.fn(() => Promise.resolve()) };
  window.AsianSchoolCloud = {
    watchAttempt: vi.fn((args, cb) => { attemptCb = cb; return () => { attemptCb = null; }; }),
    loadExam: vi.fn(() => Promise.resolve({ code: '101', mcqQuestions: [] }))
  };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete window.AsianSchoolStorage;
  delete window.AsianSchoolAntiCheat;
  delete window.AsianSchoolCloud;
});

// Khung tối thiểu giống useStudentController: state + Object.assign(s, useProctorCommands(s))
function Harness({ mode = 'exam', initialExam = { code: '101' }, onState }) {
  const [isSessionLocked, setIsSessionLocked] = useState(true);
  const [isProctorUnlocked, setIsProctorUnlocked] = useState(false);
  const [lockReason, setLockReason] = useState('violation_3_times');
  const [violations, setViolations] = useState(3);
  const [officialExam, setOfficialExam] = useState(initialExam);
  const [broadcastNotice, setBroadcastNotice] = useState(null);
  const s = {
    grade: 9, mode, examState: 'in_progress', setExamState: () => {}, fullName: 'HS', studentClass: '9/20',
    studentId: 'HS01', sessionId: 'sess-1', assignedCode: '101', setActiveQuestionIdx: () => {},
    setPracticeAnswers: () => {}, violations, setViolations, setBroadcastNotice, setScoreResult: () => {},
    showDialog: () => {}, setIsSessionLocked, setIsProctorUnlocked, setLockReason, config: {},
    setPracticeSet: () => {}, handleSubmitExam: () => {}, setOfficialExam,
    isSessionLocked, isProctorUnlocked, lockReason
  };
  Object.assign(s, useProctorCommands(s));
  onState({ isSessionLocked, isProctorUnlocked, violations, officialExam, broadcastNotice });
  return <StudentContext.Provider value={s}><LockScreen /></StudentContext.Provider>;
}

const tick = (ms) => act(async () => { vi.advanceTimersByTime(ms); });

describe('Bài thi chính thức: khóa trên máy chủ', () => {
  it('lệnh mở khóa giả trong localStorage không mở được bài', async () => {
    let state;
    render(<Harness onState={x => { state = x; }} />);
    commands.push({ cmdId: 'gia', targetSessionId: 'all', command: 'unlock_session', payload: {} });
    await tick(5200);
    expect(state.isProctorUnlocked).toBe(false);
    expect(screen.getByText(/ĐANG CHỜ GIÁO VIÊN DUYỆT MỞ KHÓA/)).toBeTruthy();
  });

  it('chỉ mở khi máy chủ chuyển khóa -> mở; bấm nút thì làm tiếp, không ghi đè số vi phạm', async () => {
    let state;
    render(<Harness onState={x => { state = x; }} />);
    expect(window.AsianSchoolCloud.watchAttempt).toHaveBeenCalledWith({ grade: 9, studentId: 'HS01' }, expect.any(Function));
    // Ảnh chụp đầu tiên chưa khóa (chưa có chuyển tiếp) thì không mở
    await act(async () => { attemptCb({ locked: false, examCode: '101' }); });
    expect(state.isProctorUnlocked).toBe(false);
    await act(async () => { attemptCb({ locked: true, examCode: '101', violations: 3 }); });
    expect(state.isProctorUnlocked).toBe(false);
    await act(async () => { attemptCb({ locked: false, examCode: '101', violations: 3 }); });
    expect(state.isProctorUnlocked).toBe(true);
    expect(state.officialExam).toEqual({ code: '101' }, 'đã có đề thì giữ nguyên');

    await act(async () => { fireEvent.click(screen.getByText(/VÀO LẠI TOÀN MÀN HÌNH/)); });
    expect(state.isSessionLocked).toBe(false);
    expect(window.AsianSchoolAntiCheat.resetViolations).toHaveBeenCalled();
    const last = liveUpdates.at(-1);
    expect(last).toMatchObject({ sessionId: 'sess-1', isLocked: false, status: 'in_progress' });
    expect('violations' in last).toBe(false);
  });

  it('giáo viên khóa trên máy chủ thì màn hình khóa hiện lại', async () => {
    let state;
    render(<Harness onState={x => { state = x; }} />);
    await act(async () => { attemptCb({ locked: true, examCode: '101' }); });
    await act(async () => { attemptCb({ locked: false, examCode: '101' }); });
    await act(async () => { fireEvent.click(screen.getByText(/VÀO LẠI TOÀN MÀN HÌNH/)); });
    expect(state.isSessionLocked).toBe(false);
    await act(async () => { attemptCb({ locked: true, lockReason: 'proctor_lock', examCode: '101' }); });
    expect(state.isSessionLocked).toBe(true);
    expect(state.isProctorUnlocked).toBe(false);
  });

  it('vào lại khi đang bị khóa (chưa có đề): tải đề sau khi được mở khóa', async () => {
    let state;
    render(<Harness initialExam={null} onState={x => { state = x; }} />);
    await act(async () => { attemptCb({ locked: true, examCode: '103' }); });
    expect(window.AsianSchoolCloud.loadExam).not.toHaveBeenCalled();
    await act(async () => { attemptCb({ locked: false, examCode: '103' }); });
    expect(window.AsianSchoolCloud.loadExam).toHaveBeenCalledWith({ grade: 9, examCode: '103' });
    expect(state.officialExam).toEqual({ code: '101', mcqQuestions: [] });
  });
});

describe('Ôn tập: mở khóa bằng lệnh giám thị', () => {
  it('nhận lệnh mở khóa của đúng phiên thì hiện nút vào lại', async () => {
    let state;
    render(<Harness mode="practice" onState={x => { state = x; }} />);
    expect(window.AsianSchoolCloud.watchAttempt).not.toHaveBeenCalled();
    commands.push({ cmdId: 'c1', targetSessionId: 'sess-1', command: 'unlock_session', payload: {} });
    await tick(2600);
    expect(state.isProctorUnlocked).toBe(true);
    await act(async () => { fireEvent.click(screen.getByText(/VÀO LẠI TOÀN MÀN HÌNH/)); });
    expect(state.isSessionLocked).toBe(false);
    expect(state.violations).toBe(0);
  });

  it('lệnh của phiên khác không mở khóa', async () => {
    let state;
    render(<Harness mode="practice" onState={x => { state = x; }} />);
    commands.push({ cmdId: 'c2', targetSessionId: 'sess-khac', command: 'unlock_session', payload: {} });
    await tick(5200);
    expect(state.isProctorUnlocked).toBe(false);
  });
});
