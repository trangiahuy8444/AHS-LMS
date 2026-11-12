import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,renderHook,screen} from '@testing-library/react';
import {StudentContext} from '../src/student/StudentContext.js';
import AnswerReview from '../src/student/result/AnswerReview.jsx';
import ResultCard from '../src/student/result/ResultCard.jsx';
import {createStartActions} from '../src/student/actions/startActions.js';
import {useStudentController} from '../src/student/hooks/useStudentController.js';
vi.mock('../src/student/hooks/useProctorCommands.js',()=>({useProctorCommands:()=>({})}));
vi.mock('../src/student/hooks/useBlockDevtools.js',()=>({useBlockDevtools:()=>{}}));
const fixture=(patch={})=>({id:'fake-recovery',submissionId:'fake-recovery',grade:8,studentClass:'8/21',studentId:'990001',mode:'exam',examCode:'RECOVERY821',mcqPoints:6,finalScore:6,maxScore:10,isGraded:false,gradeRevision:0,answers:{mcq:{5:2},tf:{},essay:{1:'Original saved response'}},recoveryAssessment:{kind:'practice-821-20261111',mcqScore:6,missingMcqOrder:true,essayQuestions:[{num:1,context:'Stored essay context',subItems:[{letter:'a',text:'Stored task'}],points:1}]},...patch});
const value=(patch={})=>({grade:8,mode:'exam',studentClass:'8/21',studentId:'990001',fullName:'Synthetic Student',scoreResult:fixture(),config:{classReviewControl:{'8/21':true}},examAnswers:{mcq:{},tf:{},essay:{}},practiceAnswers:{mcq:{},tf:{},essay:{}},practiceQuestions:[],practiceTfQuestions:[],practiceEssayQuestions:[],currentOfficialExam:{code:'101',mcqQuestions:[{num:5,question:'WRONG101',options:['wrong']}]},handleConfirmScore:vi.fn(),...patch});
beforeEach(()=>{localStorage.clear();sessionStorage.clear();window.AsianSchoolStorage={getConfig:()=>({classReviewControl:{'8/21':true}}),getClassAccessMode:()=> 'practice_only',onConfigChange:()=>()=>{},generatePracticeSet:()=>({mcqQuestions:[],tfQuestions:[],essayQuestions:[]}),confirmScore:vi.fn()};window.AsianSchoolAuth={uid:()=> 'fake-owner'};window.AsianSchoolCloud={};});
afterEach(()=>{cleanup();delete window.AsianSchoolCloud;});
it('approved recovered student review renders saved data without exam101 mapping',()=>{
 render(<StudentContext.Provider value={value({scoreResult:fixture({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1})})}><AnswerReview/></StudentContext.Provider>);
 const frame=screen.getByTitle('Bài đánh giá phục hồi');expect(frame.getAttribute('sandbox')).toBe('');expect(frame.getAttribute('srcdoc')).toContain('Original saved response');expect(frame.getAttribute('srcdoc')).not.toContain('WRONG101');expect(screen.getByRole('button',{name:/XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC/})).toBeTruthy();
});
it('recovered student can confirm only a teacher-approved result with this class open',()=>{
 const approved=fixture({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1,essayTotal:2,finalScore:8});const handle=vi.fn();const view=render(<StudentContext.Provider value={value({scoreResult:approved,handleConfirmScore:handle})}><AnswerReview/></StudentContext.Provider>);
 fireEvent.click(screen.getByRole('button',{name:/XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC/}));expect(handle).toHaveBeenCalledOnce();
 view.rerender(<StudentContext.Provider value={value({scoreResult:approved,config:{classReviewControl:{'8/21':false}}})}><AnswerReview/></StudentContext.Provider>);expect(screen.queryByRole('button',{name:/XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC/})).toBeNull();
});
it('result card labels the recovered assessment and keeps pending AI suggestions out of the official grade',()=>{
 render(<StudentContext.Provider value={value({scoreResult:fixture({aiEssayProposal:{essayScores:{1:1,2:1,3:1}}})})}><ResultCard/></StudentContext.Provider>);
 expect(screen.getByText('BÀI ĐÁNH GIÁ PHỤC HỒI')).toBeTruthy();expect(screen.getByText(/CHỜ THẦY DUYỆT/)).toBeTruthy();expect(screen.queryByText('ĐIỂM CHÍNH THỨC')).toBeNull();
});
it('does not mark a recovered score confirmed when the server rejects confirmation',async()=>{
 window.AsianSchoolCloud.confirmSubmissionScore=vi.fn().mockRejectedValue(Error('fake-offline'));
 const hook=renderHook(()=>useStudentController());act(()=>hook.result.current.setScoreResult(fixture({isGraded:true,teacherApprovedAt:'approved',gradeRevision:2})));
 act(()=>hook.result.current.handleConfirmScore());const dialog=hook.result.current.customDialog;await act(async()=>dialog.onConfirm());
 expect(window.AsianSchoolCloud.confirmSubmissionScore).toHaveBeenCalledWith(expect.objectContaining({expectedGradeRevision:2}));expect(hook.result.current.scoreResult.scoreConfirmed).not.toBe(true);expect(window.AsianSchoolStorage.confirmScore).not.toHaveBeenCalled();expect(hook.result.current.customDialog.type).toBe('error');
});

it('review lookup carries recovery provenance and grade revision without using cached exam101',async()=>{
 const sub=fixture({isGraded:true,teacherApprovedAt:'approved',gradeRevision:3});
 window.AsianSchoolCloud.lookupSubmissionForReview=vi.fn().mockResolvedValue({submission:sub,exam:null,subId:sub.id});
 localStorage.setItem('asian_school_exam_cache_g8_101',JSON.stringify({code:'101',mcqQuestions:[{num:5,question:'WRONG101'}]}));
 const state={grade:8,studentClass:'8/21',studentId:'990001',fullName:'Synthetic Student',config:{classReviewControl:{'8/21':true}},setIsContactingServer:vi.fn(),setOfficialExam:vi.fn(),setExamAnswers:vi.fn(),setScoreResult:vi.fn(),setExamState:vi.fn(),showDialog:vi.fn()};
 await createStartActions(state).handleReviewLookup();
 expect(state.showDialog).not.toHaveBeenCalled();expect(state.setOfficialExam).toHaveBeenCalledWith(expect.objectContaining({code:'RECOVERY821',mcqQuestions:[]}));expect(state.setScoreResult).toHaveBeenCalledWith(expect.objectContaining({maxScore:10,gradeRevision:3,teacherApprovedAt:'approved',recoveryAssessment:sub.recoveryAssessment}));
});

it('does not open cached recovered content after cloud denies lookup',async()=>{
 window.AsianSchoolCloud.lookupSubmissionForReview=vi.fn().mockRejectedValue(Error('fake-denied'));
 window.AsianSchoolStorage.lookupLocalSubmission=vi.fn().mockReturnValue(fixture({isGraded:true,teacherApprovedAt:'old',gradeRevision:1}));
 const state={grade:8,studentClass:'8/21',studentId:'990001',fullName:'Synthetic Student',config:{classReviewControl:{'8/21':true}},setIsContactingServer:vi.fn(),setOfficialExam:vi.fn(),setExamAnswers:vi.fn(),setScoreResult:vi.fn(),setExamState:vi.fn(),showDialog:vi.fn()};
 await createStartActions(state).handleReviewLookup();
 expect(state.setScoreResult).not.toHaveBeenCalled();expect(state.setOfficialExam).not.toHaveBeenCalled();expect(state.showDialog).toHaveBeenCalledWith('Tra Cứu Bài Thi',expect.any(String),'error');
});

it('does not render recovered essay data or an AI proposal before teacher approval',()=>{
 const pending=fixture({aiEssayProposal:{essayScores:{1:1},teacherFeedback:'PRIVATE_PROPOSAL'}});
 render(<StudentContext.Provider value={value({scoreResult:pending})}><AnswerReview/></StudentContext.Provider>);
 expect(screen.queryByTitle('Bài đánh giá phục hồi')).toBeNull();expect(screen.queryByText('PRIVATE_PROPOSAL')).toBeNull();expect(screen.queryByText('Original saved response')).toBeNull();
 expect(screen.getByText(/chờ thầy/i)).toBeTruthy();
});

it('pending recovered student view reveals neither original data nor private AI proposals before teacher approval',()=>{
 render(<StudentContext.Provider value={value({scoreResult:fixture({aiEssayProposal:{teacherFeedback:'Private AI feedback',essayScores:{1:1,2:1,3:1}}})})}><AnswerReview/></StudentContext.Provider>);
 expect(screen.queryByTitle('Bài đánh giá phục hồi')).toBeNull();
 expect(screen.queryByText(/Original saved response|Private AI feedback/)).toBeNull();
 expect(screen.queryByRole('button',{name:/XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC/})).toBeNull();
 expect(screen.getByText(/đang chờ thầy kiểm tra/)).toBeTruthy();
});
