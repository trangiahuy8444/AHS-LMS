import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AdminContext } from '../src/admin/AdminContext.js';
import { StudentContext } from '../src/student/StudentContext.js';
import AnswersTab from '../src/admin/tabs/AnswersTab.jsx';
import AnswerReview from '../src/student/result/AnswerReview.jsx';
afterEach(cleanup);
const question = { num: 1, question: 'Tình huống giả. a) Nêu nguyên nhân. (0,5 điểm) b) Đề xuất giải pháp. (0,5 điểm)' };
for (const alias of ['rubric', 'answerGuide']) {
  it(`admin shows inline essay requirements and ${alias} guidance`, () => {
    render(<AdminContext.Provider value={{ answerGrade: 9, answerType: 'practice', currentAnswerData: {practiceEssayQuestions: [{...question, [alias]: 'Hướng dẫn giả đã duyệt'}]} }}><AnswersTab /></AdminContext.Provider>);
    expect(screen.getByText('Tình huống giả.')).toBeTruthy();
    expect(screen.getByText('Nêu nguyên nhân. (0,5 điểm)')).toBeTruthy();
    expect(screen.getByText('Đề xuất giải pháp. (0,5 điểm)')).toBeTruthy();
    expect(screen.getByText('Hướng dẫn giả đã duyệt')).toBeTruthy();
  });
}
it('practice answer review uses the same separated essay requirements', () => {
  render(<StudentContext.Provider value={{grade: 9, mode: 'practice', practiceAnswers: {mcq:{},tf:{},essay:{1:'Bài làm giả'}}, practiceQuestions: [], practiceTfQuestions: [], practiceEssayQuestions:[question]}}><AnswerReview /></StudentContext.Provider>);
  expect(screen.getByText('Tình huống giả.')).toBeTruthy();
  expect(screen.getByText('Nêu nguyên nhân. (0,5 điểm)')).toBeTruthy();
  expect(screen.getByText('Bài làm giả')).toBeTruthy();
});
