import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,act} from '@testing-library/react';
import {AdminContext} from '../src/admin/AdminContext.js';
import EssayGradingModal from '../src/admin/components/EssayGradingModal.jsx';
import SubmissionsTab from '../src/admin/tabs/SubmissionsTab.jsx';
import ClassGradingStatusBar from '../src/admin/components/ClassGradingStatusBar.jsx';
import {resolveFullExamForSubmission,exportStudentSubmissionHtml} from '../src/shared/exportSubmissionHtml.js';
const essays=[1,2,3].map(num=>({num,context:`Recovered fixture essay ${num}`,subItems:[{letter:'a',text:`Saved subpart ${num}`}],rubric:'Synthetic rubric',points:1}));
const recovered={id:'assessment-fixture',mode:'exam',grade:8,studentClass:'8/21',studentId:'990001',fullName:'Học Sinh Giả',examCode:'RECOVERY821',isGraded:false,mcqPoints:6,score:6,finalScore:6,answers:{mcq:{5:0},tf:{},essay:{1:'Synthetic answer',2:'Second answer',3:'Third answer'}},recoveryAssessment:{kind:'practice-821-20261111',essayQuestions:essays,mcqScore:6,missingMcqOrder:true,sourcePracticeId:'source-fixture'},aiEssayProposal:{essayScores:{1:.75,2:1,3:.5},teacherFeedback:'Synthetic proposal feedback',pending:true}};
let context,get;
beforeEach(()=>{
 get=vi.fn(()=>Promise.resolve({exists:false}));window.firebaseDb={collection:()=>({doc:()=>({get})})};
 window.EXAM_DATA_G8={officialExams:{101:{mcqQuestions:[{num:5,question:'Unrelated official bank101',options:['Wrongly inferred option'],correctAnswer:0}],essayQuestions:[{num:1,question:'Wrong official essay',points:1}]}}};
 context={gradingSubmission:recovered,setGradingSubmission:vi.fn(),tempEssayScores:recovered.aiEssayProposal.essayScores,setTempEssayScores:vi.fn(),tempFeedback:recovered.aiEssayProposal.teacherFeedback,setTempFeedback:vi.fn(),isGeminiGrading:false,setIsGeminiGrading:vi.fn(),aiSuggestions:{},setAiSuggestions:vi.fn(),showDialog:vi.fn(),handleSaveGrading:vi.fn(()=>Promise.resolve()),handleAdminConfirmScore:vi.fn()};
 URL.createObjectURL=vi.fn(()=> 'blob:fixture');URL.revokeObjectURL=vi.fn();vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();delete window.firebaseDb;delete window.EXAM_DATA_G8;});
it('reviews recovered assessments using stored essays and a safe raw-MCQ iframe, never official bank101 or inferred options',()=>{
 render(<AdminContext.Provider value={context}><EssayGradingModal/></AdminContext.Provider>);
 expect(screen.queryByText('Wrong official essay')).toBeNull();expect(screen.queryByText('Unrelated official bank101')).toBeNull();
 expect(screen.getByText('Recovered fixture essay 1')).toBeTruthy();expect(screen.getByText('Saved subpart 1')).toBeTruthy();
 expect(screen.getByText('Chưa chấm tự luận')).toBeTruthy();expect(screen.queryByText(/Chỉ khi bấm Duyệt và lưu điểm/)).toBeNull();
 const frame=screen.getByTitle('Bài làm phục hồi và lựa chọn gốc');expect(frame.getAttribute('sandbox')).toBe('');expect(frame.getAttribute('srcdoc')).not.toContain('Wrongly inferred option');
 expect(get).not.toHaveBeenCalled();expect(screen.queryByRole('button',{name:/Xác nhận thay HS/})).toBeNull();
});
it('manual grade edits still require save and wait for acknowledgement',async()=>{
 let finish;context.handleSaveGrading=vi.fn(()=>new Promise(resolve=>{finish=resolve;}));
 render(<AdminContext.Provider value={context}><EssayGradingModal/></AdminContext.Provider>);
 const save=screen.getByRole('button',{name:/LƯU ĐIỂM CHẤM & CẬP NHẬT TỔNG ĐIỂM/});expect(context.handleSaveGrading).not.toHaveBeenCalled();
 fireEvent.click(save);expect(context.handleSaveGrading).toHaveBeenCalledTimes(1);expect(save.disabled).toBe(true);
 await act(async()=>finish());expect(save.disabled).toBe(false);
});
it('resolves recovered exam export from its metadata without reading any bank',async()=>{
 const exam=await resolveFullExamForSubmission(recovered);expect(exam.essayQuestions).toHaveLength(3);expect(exam.mcqQuestions).toEqual([]);
 await exportStudentSubmissionHtml(recovered);expect(get).not.toHaveBeenCalled();
});
it('hides all teacher confirmation, reset and delete actions on recovered pending or approved rows',()=>{
 const props={config:{},filterGrade:'8',filterClass:'8/21',filterMode:'exam',filterGraded:'all',searchQuery:'',filteredSubmissions:[recovered],submissions:[recovered],practiceSubs:[],handleAdminConfirmScore:vi.fn(),handleAdminConfirmBatchScores:vi.fn()};
 const view=render(<AdminContext.Provider value={props}><SubmissionsTab/></AdminContext.Provider>);
 expect(screen.queryByTitle('Reset lượt thi để học sinh này có thể vào làm bài lại từ đầu')).toBeNull();expect(screen.queryByTitle('Xóa bài nộp & mở lại lượt thi cho học sinh này')).toBeNull();
 expect(screen.queryByRole('button',{name:/Xác nhận thay/})).toBeNull();
 const approved={...recovered,isGraded:true,teacherApprovedAt:'2026-11-11T10:00:00Z'};
 view.rerender(<AdminContext.Provider value={{...props,filteredSubmissions:[approved],submissions:[approved]}}><SubmissionsTab/></AdminContext.Provider>);
 expect(screen.queryByRole('button',{name:/Xác nhận thay/})).toBeNull();expect(screen.getByText('Chờ học sinh xác nhận')).toBeTruthy();expect(screen.queryByTitle('Reset lượt thi để học sinh này có thể vào làm bài lại từ đầu')).toBeNull();
});
it('offers the same Gemini batch grading workflow for recovered classes',()=>{
 render(<AdminContext.Provider value={{submissions:[recovered],filterClass:'8/21',filterGrade:'8',batchGradingState:{isRunning:false},handleStartBatchGrading:vi.fn()}}><ClassGradingStatusBar/></AdminContext.Provider>);
 expect(screen.getByText(/Trợ lý Gemini/)).toBeTruthy();expect(screen.getByText(/Đã chấm:/)).toBeTruthy();expect(screen.queryByText(/ĐÃ CHẤM XONG 100%/)).toBeNull();expect(screen.getByRole('button',{name:/Chấm Nhanh Cả Lớp 8\/21/})).toBeTruthy();
});

it('keeps teacher confirmation for ordinary exams while excluding every recovered assessment from bulk confirmation',()=>{
 const approved={...recovered,isGraded:true,teacherApprovedAt:'2026-11-11T10:00:00Z'};
 const normal={...approved,id:'ordinary-fixture',examCode:'101',studentId:'990002',recoveryAssessment:undefined};
 const confirm=vi.fn(),batch=vi.fn();
 render(<AdminContext.Provider value={{config:{},filterGrade:'8',filterClass:'8/21',filterMode:'exam',filterGraded:'all',searchQuery:'',filteredSubmissions:[approved,normal],submissions:[approved,normal],practiceSubs:[],handleAdminConfirmScore:confirm,handleAdminConfirmBatchScores:batch}}><SubmissionsTab/></AdminContext.Provider>);
 const buttons=screen.getAllByRole('button',{name:/Xác nhận thay$/});expect(buttons).toHaveLength(1);fireEvent.click(buttons[0]);expect(confirm).toHaveBeenCalledWith(normal);
 fireEvent.click(screen.getByRole('button',{name:/Xác nhận thay tất cả/}));expect(batch.mock.calls[0][0]).toEqual([normal]);
});
it('does not offer teacher score confirmation in an approved recovered assessment modal',()=>{
 render(<AdminContext.Provider value={{...context,gradingSubmission:{...recovered,isGraded:true,teacherApprovedAt:'2026-11-11T10:00:00Z'}}}><EssayGradingModal/></AdminContext.Provider>);
 expect(screen.queryByRole('button',{name:/Xác nhận thay HS/})).toBeNull();
});
it('shows teacher-only proposal review notes and per-part rubric reasons before approval',()=>{
 context.gradingSubmission={...recovered,aiEssayProposal:{...recovered.aiEssayProposal,reviewNotes:['Cần kiểm tra cách tính hai giấy tờ cùng nhóm.'],rubricBreakdown:{1:{parts:[{label:'a',score:.25,maxScore:.5,reason:'Nêu được một ưu điểm.'}]}}}};
 render(<AdminContext.Provider value={context}><EssayGradingModal/></AdminContext.Provider>);
 expect(screen.getByText('Cần kiểm tra cách tính hai giấy tờ cùng nhóm.')).toBeTruthy();expect(screen.getByText(/Nêu được một ưu điểm/)).toBeTruthy();
});
