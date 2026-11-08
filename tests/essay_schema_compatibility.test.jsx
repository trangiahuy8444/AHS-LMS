import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import EssayQuestion from '../src/student/questions/EssayQuestion.jsx';
afterEach(cleanup);
for (const field of ['question', 'context']) {
  it(`renders approved native essay stem from ${field} without losing subitems`, () => {
    const value = { mode: 'exam', examAnswers: { essay: {} }, practiceAnswers: { essay: {} }, setExamAnswers: vi.fn(), setPracticeAnswers: vi.fn() };
    render(<StudentContext.Provider value={value}><EssayQuestion currentItem={{type:'exam_essay',data:{num:1,[field]:'Tình huống tự luận giả đã duyệt',subItems:[{letter:'a',text:'Yêu cầu giả thứ nhất'}]}}}/></StudentContext.Provider>);
    expect(screen.getByText('Tình huống tự luận giả đã duyệt')).toBeTruthy();
    expect(screen.getByText('Yêu cầu giả thứ nhất')).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });
}

for (const mode of ['exam', 'practice']) {
  it(`separates inline essay requirements in ${mode} without changing their text`, () => {
    const value = { mode, examAnswers: { essay: {} }, practiceAnswers: { essay: {} }, setExamAnswers: vi.fn(), setPracticeAnswers: vi.fn() };
    render(<StudentContext.Provider value={value}><EssayQuestion currentItem={{type: mode === 'exam' ? 'exam_essay' : 'essay', data: {num: 1, question: 'Tình huống giả. a) Yêu cầu thứ nhất (0,5 điểm). b) Yêu cầu thứ hai (ví dụ: nguồn tin). (0,5 điểm)'}}}/></StudentContext.Provider>);
    expect(screen.getByText('Tình huống giả.')).toBeTruthy();
    expect(screen.getByText('a)')).toBeTruthy();
    expect(screen.getByText('Yêu cầu thứ nhất (0,5 điểm).')).toBeTruthy();
    expect(screen.getByText('Yêu cầu thứ hai (ví dụ: nguồn tin). (0,5 điểm)')).toBeTruthy();
  });
}
