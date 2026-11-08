import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import EntryScreen from '../src/student/screens/EntryScreen.jsx';
import ExamScreen from '../src/student/screens/ExamScreen.jsx';
vi.mock('../src/student/questions/QuestionSidebar.jsx', () => ({ default: () => null }));
vi.mock('../src/student/components/TeacherReminderBanner.jsx', () => ({ default: () => null }));
vi.mock('../src/student/components/CalculatorWidget.jsx', () => ({ default: () => null }));
afterEach(cleanup);
function state(mode, config, examState = 'entry') {
  return {grade: 9, mode, config, examState, fullName:'', studentClass:'9/19',studentId:'', classAccessMode:'both_open', examPasswordInput:'',
    activeQuestionIdx:0, examItems:[], practiceItems:[], assignedCode:'101', timeLeftStr:'59:32', formatElapsed:()=>'00:28'};
}
for (const mode of ['exam', 'practice']) {
  it(`${mode} uses the same editable guidance before and during work and reflects live changes`, () => {
    const config = {examDurationMinutes:60, studentGuidance:{ [mode]:{title:'Hướng dẫn riêng của giáo viên', body:'Nội dung đã duyệt.\nGiơ tay khi cần giúp đỡ.'}}};
    const ui = (examState, cfg) => <StudentContext.Provider value={state(mode,cfg,examState)}>{examState === 'entry' ? <EntryScreen/> : <ExamScreen/>}</StudentContext.Provider>;
    const view = render(ui('entry',config));
    const before = screen.getByRole('region',{name:'Hướng dẫn làm bài'}).textContent;
    expect(before).toContain('Hướng dẫn riêng của giáo viên');
    expect(before).toContain('Nội dung đã duyệt.');
    if (mode === 'exam') expect(before).toContain('60 phút');
    view.rerender(ui('in_progress',config));
    expect(screen.getByRole('region',{name:'Hướng dẫn làm bài'}).textContent).toBe(before);
    expect(screen.queryByText(/Vi phạm đến lần thứ 3/)).toBeNull();
    const updated = {...config,studentGuidance:{[mode]:{title:'Thông báo mới',body:'Chỉ dẫn mới từ giáo viên.'}}};
    view.rerender(ui('in_progress',updated));
    expect(within(screen.getByRole('region',{name:'Hướng dẫn làm bài'})).getByText('Chỉ dẫn mới từ giáo viên.')).toBeTruthy();
    view.rerender(ui('entry',updated));
    expect(within(screen.getByRole('region',{name:'Hướng dẫn làm bài'})).getByText('Chỉ dẫn mới từ giáo viên.')).toBeTruthy();
    expect(screen.queryByText(/Vi phạm sẽ nhận/)).toBeNull();
  });
}
it('exam defaults match at entry and during work, with a fallback duration when configuration is absent', () => {
  const ui = stage => <StudentContext.Provider value={state('exam',{},stage)}>{stage === 'entry' ? <EntryScreen/> : <ExamScreen/>}</StudentContext.Provider>;
  const view = render(ui('entry'));
  const before = screen.getByRole('region',{name:'Hướng dẫn làm bài'}).textContent;
  expect(before).toContain('45 phút');
  view.rerender(ui('in_progress'));
  expect(screen.getByRole('region',{name:'Hướng dẫn làm bài'}).textContent).toBe(before);
  expect(screen.queryByText(/THÔNG TIN LƯỢT THI/)).toBeNull();
});
