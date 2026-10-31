import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { AdminContext } from '../src/admin/AdminContext.js';
import SubmissionsTab from '../src/admin/tabs/SubmissionsTab.jsx';
afterEach(cleanup);
const start = 1793260800;
const row = (id, patch = {}) => ({ id, fullName: id, mode: 'exam', grade: 8, studentClass: '8/19', studentId: '999999', mcqPoints: 4.25, finalScore: 6.25, essayTotal: 2, isGraded: true,
  startedAt: { seconds: start }, serverSubmittedAt: { seconds: start + 2702 }, durationMinutes: 45, extraTimeSeconds: 0, submittedAt: '2000-01-01T00:00:00Z', ...patch });
it('bảng bài nộp hiển thị nộp muộn theo server, nhận diện gia hạn và không đổi điểm', () => {
  const state = { filterGrade: 'all', filterClass: 'all', filterMode: 'all', filterGraded: 'all', searchQuery: '', fileInputRef: { current: null },
    setFilterGrade: vi.fn(), setFilterClass: vi.fn(), setFilterMode: vi.fn(), setFilterGraded: vi.fn(), setSearchQuery: vi.fn(),
    filteredSubmissions: [row('Giả Muộn'), row('Giả Gia Hạn', { extraTimeSeconds: 300 }), row('Giả Cũ', { durationMinutes: undefined })] };
  render(<AdminContext.Provider value={state}><SubmissionsTab /></AdminContext.Provider>);
  const lateRow = within(screen.getByText('Giả Muộn').closest('tr'));
  expect(lateRow.getByText('Nộp muộn +2 giây')).toBeTruthy();
  expect(lateRow.getByText('6.25')).toBeTruthy();
  expect(within(screen.getByText('Giả Gia Hạn').closest('tr')).getByText('Đúng hạn')).toBeTruthy();
  const oldRow = within(screen.getByText('Giả Cũ').closest('tr'));
  expect(oldRow.queryByText(/Nộp muộn/)).toBeNull();
  expect(oldRow.getByText('Chưa đủ dữ liệu thời gian')).toBeTruthy();
});
