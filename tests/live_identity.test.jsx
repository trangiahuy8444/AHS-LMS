import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AdminContext } from '../src/admin/AdminContext.js';
import LiveSessionList from '../src/admin/live/LiveSessionList.jsx';

const session = { sessionId: 'fake-live', studentId: '999999', fullName: 'Học Sinh Giả', studentClass: '8/19', grade: 8,
  mode: 'practice', status: 'practicing', lastPing: 123, violations: 0 };
const past = { id: 'fake-past', studentId: '999999', fullName: 'Học Sinh Giả', studentClass: '8/19', grade: 8,
  mode: 'exam', examCode: '104', isGraded: true, finalScore: 6.25 };
function showHistory(sub, practice = false, live = session) {
  const state = { liveSessions: [live], liveFilter: 'all', submissions: practice ? [] : [sub], practiceSubs: practice ? [sub] : [],
    setShowBroadcastModal: vi.fn(), setBroadcastTarget: vi.fn(), setBroadcastMsgInput: vi.fn(), setIndividualMsgTarget: vi.fn(),
    showToast: vi.fn(), handleExtendTime: vi.fn(), handleForceSubmit: vi.fn(), handleLockSession: vi.fn(), handleUnlockSession: vi.fn(),
    handleRemoveCandidate: vi.fn(), handleClearClassSessions: vi.fn() };
  render(<AdminContext.Provider value={state}><LiveSessionList /></AdminContext.Provider>);
}
afterEach(() => { cleanup(); delete window.AsianSchoolNormalize; });
it.each([
  ['khác lớp', { studentClass: '8/20' }],
  ['khác họ tên', { fullName: 'Học Sinh Khác' }],
  ['khác khối', { grade: 9 }],
  ['khác mã LMS dù cùng tên/lớp', { studentId: '888888' }],
  ['thiếu khối', { grade: undefined }],
  ['thiếu tên', { fullName: '' }],
  ['thiếu mã LMS', { studentId: '' }],
  ['thiếu lớp', { studentClass: '' }]
])('không ghép lịch sử bài thi %s vào thẻ học sinh hiện tại', (_, patch) => {
  showHistory({ ...past, ...patch });
  expect(screen.queryByText('Thi (104):')).toBeNull();
  expect(screen.getByText(/Chưa có lượt nộp bài trước đó/)).toBeTruthy();
});
it('không ghép lịch sử ôn tập cùng mã LMS nhưng khác lớp hoặc tên', () => {
  showHistory({ ...past, mode: 'practice', fullName: 'Học Sinh Khác', studentClass: '8/20', finalScore: 6.25 }, true);
  expect(screen.queryByText('6.25 / 7đ')).toBeNull();
  expect(screen.getByText(/Chưa có lượt nộp bài trước đó/)).toBeTruthy();
});
it('hiện lịch sử khi đủ khối, lớp, LMS, tên sau chuẩn hóa khoảng trắng/Unicode/hoa thường', () => {
  showHistory({ ...past, grade: '8', studentClass: ' 8/19 ', studentId: 'HS-999 999', fullName: '  HỌC   SINH GIẢ  '.normalize('NFD') });
  expect(screen.getByText('Thi (104):')).toBeTruthy();
  expect(screen.getByText('6.25đ')).toBeTruthy();
});
it('khi thiếu định danh trên phiên hiện tại thì không suy đoán lịch sử theo tên và lớp', () => {
  showHistory(past, false, { ...session, studentId: '' });
  expect(screen.queryByText('Thi (104):')).toBeNull();
});
it('vẫn giữ nguyên quy tắc gộp thẻ khối + LMS + tên, chọn phiên mới nhất', () => {
  const newer = { ...session, sessionId: 'fake-newer', lastPing: 124, timeLeft: '09:59' };
  const state = { liveSessions: [session, newer], liveFilter: 'all', submissions: [], practiceSubs: [] };
  render(<AdminContext.Provider value={state}><LiveSessionList /></AdminContext.Provider>);
  expect(screen.getAllByText('Học Sinh Giả')).toHaveLength(1);
  expect(screen.getByText('09:59')).toBeTruthy();
});
