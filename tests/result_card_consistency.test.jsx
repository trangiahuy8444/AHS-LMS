import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import ResultCard from '../src/student/result/ResultCard.jsx';
afterEach(cleanup);
const submitted = { examCode: '101', submittedAt: '2026-11-08T23:00:00Z', durationFormatted: '1 phút', violations: 0 };
function card(grade, result) {
  return <StudentContext.Provider value={{ grade, mode: 'exam', fullName: 'Học sinh thử', studentClass: `${grade}/19`, studentId: 'TEST', scoreResult: result }}><ResultCard /></StudentContext.Provider>;
}
for (const grade of [8, 9, 10]) {
  it(`khối ${grade}: giữ xác nhận nộp bài khi chấm xong trắc nghiệm và chốt điểm`, () => {
    const view = render(card(grade, submitted));
    expect(screen.getByRole('heading', { name: 'ĐÃ NỘP BÀI THÀNH CÔNG' })).toBeTruthy();
    expect(screen.getByText('Đang chấm trắc nghiệm')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
    view.rerender(card(grade, { ...submitted, mcqPoints: 0, correctMcq: 0 }));
    expect(screen.getByRole('heading', { name: 'ĐÃ NỘP BÀI THÀNH CÔNG' })).toBeTruthy();
    expect(screen.queryByText('Đang chấm trắc nghiệm')).toBeNull();
    expect(screen.getByText('0')).toBeTruthy();
    view.rerender(card(grade, { ...submitted, mcqPoints: 0, essayTotal: 0, finalScore: 0, isGraded: true }));
    expect(screen.getByRole('heading', { name: 'ĐÃ NỘP BÀI THÀNH CÔNG' })).toBeTruthy();
    expect(screen.getByText('ĐIỂM CHÍNH THỨC')).toBeTruthy();
    expect(screen.queryByText(/đạt yêu cầu/)).toBeNull();
  });
}
