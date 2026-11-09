import React, { useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import { StudentLanguageProvider } from '../src/student/StudentLanguage.jsx';
import StudentHeader from '../src/student/components/StudentHeader.jsx';
import ExamScreen from '../src/student/screens/ExamScreen.jsx';
vi.mock('../src/student/components/CalculatorWidget.jsx',()=>({default:()=>null}));
beforeEach(()=>localStorage.removeItem('ahs_student_ui_language'));
afterEach(()=>{cleanup();localStorage.removeItem('ahs_student_ui_language');});
function Harness(){
 const [examAnswers,setExamAnswers]=useState({mcq:{},tf:{},essay:{}}),[activeQuestionIdx,setActiveQuestionIdx]=useState(0);
 const items=[{type:'exam_mcq',label:'Câu 1',section:'Phần I',points:1,data:{num:1,question:'Câu hỏi gốc tiếng Việt',options:['A gốc','B gốc'],translations:{en:{question:'Original English question',options:['Original A','Original B']}}}},{type:'exam_tf',label:'Câu 2',section:'Phần II',points:1,data:{num:2,context:'Tình huống gốc tiếng Việt',subQuestions:[{letter:'a',text:'Mệnh đề gốc'}]}}];
 const state={mode:'exam',grade:9,examState:'in_progress',config:{preventEarlySubmission:false},fullName:'Học Sinh Thử',studentId:'TEST',studentClass:'9/21',examItems:items,practiceItems:[],assignedCode:'101',timeLeftStr:'40:00',formatElapsed:()=> '05:00',examAnswers,setExamAnswers,activeQuestionIdx,setActiveQuestionIdx};
 return <StudentLanguageProvider><StudentContext.Provider value={state}><StudentHeader/><ExamScreen/><output data-testid="answers">{JSON.stringify(examAnswers)}</output></StudentContext.Provider></StudentLanguageProvider>;
}
it('switches the interface and question while preserving answers and the active question',()=>{
 render(<Harness/>);
 fireEvent.click(screen.getByRole('button',{name:/A gốc/}));
 const saved=screen.getByTestId('answers').textContent;
 fireEvent.click(screen.getByRole('button',{name:'EN',exact:true}));
 expect(screen.getByText('Original English question')).toBeTruthy();
 expect(screen.queryByText('Câu hỏi gốc tiếng Việt')).toBeNull();
 expect(screen.getByTestId('answers').textContent).toBe(saved);
 fireEvent.click(screen.getByRole('button',{name:/Next/}));
 fireEvent.click(screen.getByRole('button',{name:/FALSE/}));
 expect(JSON.parse(screen.getByTestId('answers').textContent).tf).toEqual({2:{a:false}});
 fireEvent.click(screen.getByRole('button',{name:'VI',exact:true}));
 expect(screen.getByText('Câu 2',{exact:true})).toBeTruthy();
 expect(screen.getByRole('button',{name:/✕ SAI/})).toBeTruthy();
 expect(JSON.parse(screen.getByTestId('answers').textContent).mcq).toEqual({1:0});
 expect(localStorage.getItem('ahs_student_ui_language')).toBe('vi');
});
