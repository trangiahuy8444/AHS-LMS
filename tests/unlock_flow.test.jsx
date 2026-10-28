// @vitest-environment jsdom
// Luồng mở khóa bài làm: vi phạm 3 lần bị khóa -> giám thị gửi lệnh mở khóa -> học sinh bấm "VÀO LẠI TOÀN MÀN HÌNH".
// Dùng hook thật useProctorCommands + màn hình khóa thật (lỗi 29/10/2026: nút không làm gì vì hook không trả hàm).
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import { useProctorCommands } from '../src/student/hooks/useProctorCommands.js';
import LockScreen from '../src/student/components/LockScreen.jsx';

let commands;
const liveUpdates = [];

beforeEach(() => {
  vi.useFakeTimers();
  commands = [];
  liveUpdates.length = 0;
  window.AsianSchoolStorage = {
    getPendingProctorCommands: (sid) => commands.filter(c => c.targetSessionId === sid && !c.consumed),
    consumeProctorCommand: (id) => { const c = commands.find(x => x.cmdId === id); if (c) c.consumed = true; },
    updateLiveSession: (d) => liveUpdates.push(d)
  };
  window.AsianSchoolAntiCheat = { resetViolations: vi.fn(), requestFullscreen: vi.fn(() => Promise.resolve()) };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete window.AsianSchoolStorage;
  delete window.AsianSchoolAntiCheat;
});

// Khung tối thiểu giống useStudentController: state + Object.assign(s, useProctorCommands(s))
function Harness({ onState }) {
  const [isSessionLocked, setIsSessionLocked] = useState(true);
  const [isProctorUnlocked, setIsProctorUnlocked] = useState(false);
  const [lockReason, setLockReason] = useState('violation_3_times');
  const [violations, setViolations] = useState(3);
  const [broadcastNotice, setBroadcastNotice] = useState(null);
  const s = {
    grade: 9, mode: 'exam', examState: 'in_progress', setExamState: () => {}, fullName: 'HS', studentClass: '9/20',
    studentId: 'HS01', sessionId: 'sess-1', assignedCode: '101', setActiveQuestionIdx: () => {},
    setPracticeAnswers: () => {}, violations, setViolations, setBroadcastNotice, setScoreResult: () => {},
    showDialog: () => {}, setIsSessionLocked, setIsProctorUnlocked, setLockReason, config: {},
    setPracticeSet: () => {}, handleSubmitExam: () => {}, isSessionLocked, isProctorUnlocked, lockReason
  };
  Object.assign(s, useProctorCommands(s));
  onState({ isSessionLocked, isProctorUnlocked, violations, broadcastNotice });
  return <StudentContext.Provider value={s}><LockScreen /></StudentContext.Provider>;
}

describe('Mở khóa bài làm cho học sinh', () => {
  it('hook cung cấp hàm cho nút "VÀO LẠI TOÀN MÀN HÌNH" và "Làm lại bài ôn tập"', () => {
    let state;
    render(<Harness onState={x => { state = x; }} />);
    expect(state.isSessionLocked).toBe(true);
    expect(screen.getByText(/ĐANG CHỜ GIÁO VIÊN DUYỆT MỞ KHÓA/)).toBeTruthy();
    expect(screen.queryByText(/VÀO LẠI TOÀN MÀN HÌNH/)).toBeNull();
  });

  it('nhận lệnh mở khóa rồi bấm nút thì bài được mở lại, đếm vi phạm lại từ 0', async () => {
    let state;
    render(<Harness onState={x => { state = x; }} />);
    commands.push({ cmdId: 'c1', targetSessionId: 'sess-1', command: 'unlock_session', payload: {} });
    await act(async () => { vi.advanceTimersByTime(2600); });
    expect(state.isProctorUnlocked).toBe(true);
    expect(commands[0].consumed).toBe(true);

    await act(async () => { fireEvent.click(screen.getByText(/VÀO LẠI TOÀN MÀN HÌNH/)); });
    expect(state.isSessionLocked).toBe(false);
    expect(state.violations).toBe(0);
    expect(window.AsianSchoolAntiCheat.resetViolations).toHaveBeenCalled();
    expect(window.AsianSchoolAntiCheat.requestFullscreen).toHaveBeenCalled();
    expect(liveUpdates.at(-1)).toMatchObject({ sessionId: 'sess-1', isLocked: false, status: 'in_progress' });
    expect(screen.queryByText(/BÀI THI BỊ TẠM THỜI KHÓA/)).toBeNull();
  });

  it('lệnh của học sinh khác không mở khóa bài này', async () => {
    let state;
    render(<Harness onState={x => { state = x; }} />);
    commands.push({ cmdId: 'c2', targetSessionId: 'sess-khac', command: 'unlock_session', payload: {} });
    await act(async () => { vi.advanceTimersByTime(5200); });
    expect(state.isProctorUnlocked).toBe(false);
    expect(state.isSessionLocked).toBe(true);
  });
});
