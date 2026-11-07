import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import StudentGuidance from '../src/student/components/StudentGuidance.jsx';
import GuidanceConfigCard from '../src/admin/config/GuidanceConfigCard.jsx';
import { AdminContext } from '../src/admin/AdminContext.js';
afterEach(cleanup);
it('shows the supplied LMS guidance during work, and reflects live text changes as plain text', () => {
  const view = render(<StudentGuidance mode="practice" config={{}} />);
  expect(screen.getByText(/HƯỚNG DẪN VÀ ĐIỀU KIỆN HOÀN THÀNH/)).toBeTruthy();
  expect(screen.getByText(/6.0 điểm trở lên ít nhất 5 lần/)).toBeTruthy();
  view.rerender(<StudentGuidance mode="practice" config={{ studentGuidance: { practice: { title: 'Hướng dẫn mới', body: '<img src=x onerror=alert(1)>\nHoàn thành 3 lần.' } } }} />);
  expect(screen.getByText(/Hướng dẫn mới/)).toBeTruthy();
  expect(screen.getByText(/Hoàn thành 3 lần/)).toBeTruthy();
  expect(document.querySelector('img')).toBeNull();
});
it('uses different default guidance for official exams', () => {
  render(<StudentGuidance mode="exam" config={{}} />);
  expect(screen.queryByText(/6.0 điểm trở lên ít nhất 5 lần/)).toBeNull();
  expect(screen.getByText(/HƯỚNG DẪN LÀM BÀI THI/)).toBeTruthy();
});
it('saves only the edited mode after server acknowledgement and retains the other mode', async () => {
  let finish;
  const set = vi.fn(() => new Promise(resolve => { finish = resolve; }));
  window.firebaseDb = { collection: vi.fn(() => ({ doc: () => ({ set }) })) };
  const setConfig = vi.fn();
  render(<AdminContext.Provider value={{ config: { studentGuidance: { exam: { title: 'Thi', body: 'Nội quy riêng' } } }, setConfig }}><GuidanceConfigCard /></AdminContext.Provider>);
  fireEvent.change(screen.getByLabelText('Nội dung hướng dẫn'), { target: { value: 'Hoàn thành 3 lần.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu hướng dẫn' }));
  expect(setConfig).not.toHaveBeenCalled();
  await act(async () => finish());
  expect(set.mock.calls[0][0].studentGuidance.practice.body).toBe('Hoàn thành 3 lần.');
  expect(set.mock.calls[0][0].studentGuidance.exam).toBeUndefined();
  expect(set.mock.calls[0][1]).toEqual({ merge: true });
  expect(screen.getByRole('status').textContent).toMatch(/Đã lưu/);
});
