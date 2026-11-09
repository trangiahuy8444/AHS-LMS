import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StudentContext } from '../src/student/StudentContext.js';
import { AdminContext } from '../src/admin/AdminContext.js';
import TeacherReminderBanner from '../src/student/components/TeacherReminderBanner.jsx';
import TeacherReminderButton from '../src/admin/live/TeacherReminderButton.jsx';
let latest;
const target = { grade: 8, studentClass: '8/19', studentId: '999999', sessionId: 'fake-session', uid: 'fake-owner', mode: 'practice', fullName: 'Học Sinh Giả', status: 'practicing', violations: 2 };
beforeEach(() => {
  latest = null;
  window.AsianSchoolCloud = {
    watchTeacherReminder: vi.fn((_, callback) => { latest = callback; return () => {}; }),
    recordTeacherReminder: vi.fn().mockResolvedValue({ count: 1 })
  };
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
it('student sees a separate count and text, restored after reload', () => {
  const setViolations = vi.fn();
  const state = { ...target, examState: 'in_progress', setViolations };
  const renderBanner = () => render(<StudentContext.Provider value={state}><TeacherReminderBanner /></StudentContext.Provider>);
  const view = renderBanner();
  act(() => latest({ id: 'fake-reminder', count: 3, message: 'Em tập trung làm bài.' }));
  expect(screen.getByText(/Lần 3/)).toBeTruthy();
  expect(screen.getByText('Em tập trung làm bài.')).toBeTruthy();
  expect(setViolations).not.toHaveBeenCalled();
  view.unmount();
  renderBanner();
  act(() => latest({ id: 'fake-reminder', count: 3, message: 'Em tập trung làm bài.' }));
  expect(screen.getByText(/Lần 3/)).toBeTruthy();
});
it('reminder fades automatically, repeated snapshots do not replay it, and a new reminder appears', () => {
  vi.useFakeTimers();
  render(<StudentContext.Provider value={{ ...target, examState: 'in_progress' }}><TeacherReminderBanner /></StudentContext.Provider>);
  const message = { id: 'one', count: 1, message: 'Tập trung làm bài.', createdAt: Date.now() };
  act(() => latest(message));
  expect(screen.getByText(message.message)).toBeTruthy();
  expect(screen.queryByRole('alertdialog')).toBeNull();
  act(() => vi.advanceTimersByTime(3500));
  expect(screen.queryByText(message.message)).toBeNull();
  act(() => latest({ ...message }));
  expect(screen.queryByText(message.message)).toBeNull();
  act(() => latest({ ...message, id: 'two', count: 2, createdAt: Date.now() }));
  expect(screen.getByText(message.message)).toBeTruthy();
});
it('teacher waits for acknowledgement and a failed retry keeps the same request id', async () => {
  const showToast = vi.fn();
  window.AsianSchoolCloud.recordTeacherReminder.mockRejectedValueOnce(new Error('offline'));
  render(<AdminContext.Provider value={{ showToast }}><TeacherReminderButton session={target} /></AdminContext.Provider>);
  fireEvent.click(screen.getByRole('button', { name: 'Nhắc nhở học sinh' }));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gửi nhắc nhở' })));
  expect(screen.getByRole('alert').textContent).toBe('offline');
  expect(showToast).not.toHaveBeenCalled();
  const first = window.AsianSchoolCloud.recordTeacherReminder.mock.calls[0][0];
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gửi nhắc nhở' })));
  const retry = window.AsianSchoolCloud.recordTeacherReminder.mock.calls[1][0];
  expect(retry.requestId).toBe(first.requestId);
  expect(retry.studentClass).toBe('8/19');
  expect(showToast).toHaveBeenCalledOnce();
});
it('a locked pupil can read the teacher reminder on the lock screen', async () => {
  const { default: LockScreen } = await import('../src/student/components/LockScreen.jsx');
  render(<StudentContext.Provider value={{ ...target, examState: 'in_progress', isSessionLocked: true, isProctorUnlocked: false, lockReason: 'proctor_lock' }}><LockScreen /></StudentContext.Provider>);
  act(() => latest?.({ count: 2, message: 'Em giữ nguyên màn hình và báo giáo viên.' }));
  expect(screen.getByText('Em giữ nguyên màn hình và báo giáo viên.')).toBeTruthy();
  expect(screen.getByText(/BÀI THI BỊ TẠM THỜI KHÓA/)).toBeTruthy();
});

it('shows an urgent named warning for three seconds, then keeps the teacher reminder count without blocking work',()=>{
 vi.useFakeTimers();
 render(<StudentContext.Provider value={{...target,examState:'in_progress'}}><TeacherReminderBanner/></StudentContext.Provider>);
 const message={id:'strong-warning',count:2,message:'Em tập trung làm bài, không trao đổi.',createdAt:Date.now()};
 act(()=>latest(message));
 expect(screen.getByRole('alert').textContent).toContain('Học Sinh Giả');
 expect(screen.getByRole('alert').textContent).toContain('999999');
 expect(screen.getByText(/Nhắc nhở vi phạm của giáo viên/)).toBeTruthy();
 expect(screen.queryByRole('dialog')).toBeNull();
 act(()=>vi.advanceTimersByTime(2500));expect(screen.getByText(message.message)).toBeTruthy();
 act(()=>vi.advanceTimersByTime(1000));expect(screen.queryByRole('alert')).toBeNull();
 expect(screen.getByRole('status').textContent).toContain('Giáo viên đã nhắc');
 expect(screen.getByRole('status').textContent).toContain('2');
});
it('uses the calibrated exam clock so a fast device clock cannot hide a new reminder immediately',()=>{
 const previous=window.AsianSchoolTimer;
 const serverNow=Date.now()-300000;
 window.AsianSchoolTimer={clockAnchorMs:serverNow,now:()=>serverNow};
 try {
  render(<StudentContext.Provider value={{...target,examState:'in_progress'}}><TeacherReminderBanner/></StudentContext.Provider>);
  act(()=>latest({id:'clock-warning',count:1,message:'Em tập trung.',createdAt:serverNow}));
  expect(screen.getByRole('alert').textContent).toContain('Em tập trung.');
 } finally {window.AsianSchoolTimer=previous;}
});
