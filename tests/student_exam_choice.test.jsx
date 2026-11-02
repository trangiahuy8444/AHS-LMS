import React from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StudentContext } from '../src/student/StudentContext.js';
import EntryScreen from '../src/student/screens/EntryScreen.jsx';
import { useStudentController } from '../src/student/hooks/useStudentController.js';

vi.mock('../src/student/hooks/useProctorCommands.js', () => ({ useProctorCommands: () => ({}) }));
vi.mock('../src/student/hooks/useBlockDevtools.js', () => ({ useBlockDevtools: () => {} }));
let config;
let listeners;
function entry(patch = {}) {
  return {
    grade: 8, mode: 'exam', examState: 'entry', fullName: '', studentClass: '8/19', studentId: '',
    classAccessMode: 'both_open', examPasswordInput: '', showExamPassword: false, isContactingServer: false,
    selectedExamCode: '', config,
    setGrade: vi.fn(), setMode: vi.fn(), setFullName: vi.fn(), setStudentClass: vi.fn(), setStudentId: vi.fn(),
    setExamPasswordInput: vi.fn(), setShowExamPassword: vi.fn(), setSelectedExamCode: vi.fn(),
    showDialog: vi.fn(), handleStart: vi.fn(), ...patch
  };
}
function renderEntry(value) {
  return render(<StudentContext.Provider value={value}><EntryScreen /></StudentContext.Provider>);
}
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear();
  config = { codeAllocationMode: 'student_choice', activeCodes: { 8: ['102', '102', 104, null, ''], 9: ['103'] } };
  listeners = new Set();
  window.AsianSchoolStorage = {
    getConfig: () => config, getClassAccessMode: () => 'both_open',
    onConfigChange: cb => { listeners.add(cb); return () => listeners.delete(cb); },
    generatePracticeSet: () => ({ mcqQuestions: [], tfQuestions: [], essayQuestions: [] })
  };
  window.AsianSchoolCloud = { startExam: vi.fn().mockRejectedValue(new Error('Dừng thử nghiệm sau lời gọi máy chủ')) };
  window.AsianSchoolAntiCheat = { requestFullscreen: vi.fn().mockResolvedValue(undefined) };
  window.AsianSchoolAuth = { uid: () => 'fake-owner' };
});
afterEach(cleanup);

it('chỉ hiện mã đang bật của đúng khối, loại trùng và dữ liệu sai kiểu; không tự chọn mã đầu', () => {
  const value = entry();
  const view = renderEntry(value);
  const select = screen.getByRole('combobox', { name: /Mã đề thi/ });
  expect(Array.from(select.options, o => o.value)).toEqual(['', '102']);
  expect(select.value).toBe('');
  expect(within(select).getByRole('option', { name: 'Chọn mã đề' })).toBeTruthy();
  fireEvent.change(select, { target: { value: '102' } });
  expect(value.setSelectedExamCode).toHaveBeenCalledWith('102');
  view.rerender(<StudentContext.Provider value={entry({ grade: 9 })}><EntryScreen /></StudentContext.Provider>);
  expect(Array.from(screen.getByRole('combobox', { name: /Mã đề thi/ }).options, o => o.value)).toEqual(['', '103']);
});
it('khóa lựa chọn khi đang liên hệ máy chủ và giải thích lượt đang làm giữ mã đã nhận', () => {
  renderEntry(entry({ isContactingServer: true }));
  expect(screen.getByRole('combobox', { name: /Mã đề thi/ }).disabled).toBe(true);
  expect(screen.getByText(/lượt đang làm.*giữ.*mã/i)).toBeTruthy();
});
it.each([
  { mode: 'practice' },
  { config: { codeAllocationMode: 'class_assigned' } },
  { config: { codeAllocationMode: 'random' } },
  { config: { codeAllocationMode: 'fixed' } }
])('ẩn ô chọn mã ngoài chế độ học sinh tự chọn thi chính thức: %j', patch => {
  renderEntry(entry(patch));
  expect(screen.queryByRole('combobox', { name: /Mã đề thi/ })).toBeNull();
});
it.each([{}, { activeCodes: { 8: '101' } }])('không tự tạo danh sách khi chưa có mã bật hợp lệ: %j', patch => {
  renderEntry(entry({ config: { codeAllocationMode: 'student_choice', ...patch } }));
  expect(Array.from(screen.getByRole('combobox', { name: /Mã đề thi/ }).options, o => o.value)).toEqual(['']);
  expect(screen.getByText(/chưa có mã đề.*bật/i)).toBeTruthy();
});

async function prepareStart(hook) {
  act(() => {
    hook.result.current.setMode('exam');
    hook.result.current.setFullName('Học Sinh Giả');
    hook.result.current.setStudentId('999999');
    hook.result.current.setExamPasswordInput('fake-room');
  });
}
it('truyền mã học sinh chọn cho máy chủ nhưng vẫn cho máy chủ xử lý resume khi mã trống', async () => {
  const hook = renderHook(() => useStudentController());
  await prepareStart(hook);
  expect(hook.result.current.selectedExamCode).toBe('');
  act(() => hook.result.current.setSelectedExamCode('102'));
  await act(async () => hook.result.current.handleStart());
  expect(window.AsianSchoolCloud.startExam).toHaveBeenLastCalledWith(expect.objectContaining({ examCode: '102' }));
  act(() => hook.result.current.setSelectedExamCode(''));
  await act(async () => hook.result.current.handleStart());
  expect(window.AsianSchoolCloud.startExam).toHaveBeenLastCalledWith(expect.objectContaining({ examCode: '' }));
});
it('đổi khối xóa mã không thuộc khối mới trước khi gửi yêu cầu vào thi', async () => {
  const hook = renderHook(() => useStudentController());
  await prepareStart(hook);
  act(() => hook.result.current.setSelectedExamCode('102'));
  act(() => hook.result.current.setGrade(9));
  expect(hook.result.current.selectedExamCode).toBe('');
  await act(async () => hook.result.current.handleStart());
  expect(window.AsianSchoolCloud.startExam).toHaveBeenLastCalledWith(expect.objectContaining({ grade: 9, examCode: '' }));
});
it('mã bị tắt trong cấu hình trực tiếp bị xóa; mã vẫn bật được giữ lại', () => {
  const hook = renderHook(() => useStudentController());
  act(() => hook.result.current.setSelectedExamCode('102'));
  act(() => { config = { ...config, activeCodes: { 8: ['102', '103'] } }; listeners.forEach(cb => cb(config)); });
  expect(hook.result.current.selectedExamCode).toBe('102');
  act(() => { config = { ...config, activeCodes: { 8: ['103'] } }; listeners.forEach(cb => cb(config)); });
  expect(hook.result.current.selectedExamCode).toBe('');
});
