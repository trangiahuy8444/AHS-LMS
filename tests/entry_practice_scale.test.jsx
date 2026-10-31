import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import EntryScreen from '../src/student/screens/EntryScreen.jsx';
afterEach(cleanup);
it.each([[8, '7'], [9, '7'], [10, '7.75']])('màn hình vào ôn tập khối %s nêu đúng thang điểm %s và tự luận không tính điểm', (grade, scale) => {
  const value = { grade, mode: 'practice', examState: 'entry', fullName: '', studentClass: grade === 10 ? '10/14' : `${grade}/19`, studentId: '',
    classAccessMode: 'practice_only', examPasswordInput: '', showExamPassword: false, isContactingServer: false,
    setGrade: vi.fn(), setMode: vi.fn(), setFullName: vi.fn(), setStudentClass: vi.fn(), setStudentId: vi.fn(),
    setExamPasswordInput: vi.fn(), setShowExamPassword: vi.fn(), showDialog: vi.fn(), handleStart: vi.fn() };
  render(<StudentContext.Provider value={value}><EntryScreen /></StudentContext.Provider>);
  const practiceButton = screen.getByText('ÔN TẬP ĐỀ CƯƠNG', { exact: true }).closest('button');
  expect(practiceButton.textContent).toContain(`tính điểm thang ${scale})`);
  expect(practiceButton.textContent).toContain('Tự luận để tự luyện (không tính điểm)');
  expect(practiceButton.textContent).not.toContain('thang 10');
});
