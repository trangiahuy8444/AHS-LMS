import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.mock('../src/core/gemini-grading-service.js',async importOriginal=>{
 const original=await importOriginal();return {...original,gradeSubmissionWithGemini:vi.fn(async()=>({success:true,essayScores:{1:1,2:0.75,3:0.5},essayTotal:2.25,teacherFeedback:'Synthetic issue'}))};
});
import {createGradingActions} from '../src/admin/actions/gradingActions.js';
import {getEssayQuestionsForSubmission,gradeSubmissionWithGemini} from '../src/core/gemini-grading-service.js';
const recovered=(patch={})=>({id:'fake-recovery',mode:'exam',grade:8,studentClass:'8/21',examCode:'RECOVERY821',fullName:'Fixture',studentId:'999999',isGraded:false,gradeRevision:0,scoreConfirmed:false,mcqPoints:6.5,finalScore:6.5,answers:{essay:{1:'A1',2:'A2',3:'A3'}},recoveryAssessment:{kind:'practice-821-20261111',mcqScore:6.5,sourcePracticeId:'fake-practice',missingMcqOrder:true,essayQuestions:[1,2,3].map(num=>({num,points:1,question:'Recovered synthetic '+num}))},...patch});
function setup(sub=recovered()){
 const state={gradingSubmission:sub,tempEssayScores:{1:1,2:0.75,3:0.5},tempFeedback:'Teacher feedback',setGradingSubmission:vi.fn(),setSubmissions:vi.fn(),setPracticeSubs:vi.fn(),setGradingSuccessAlert:vi.fn(),setTempEssayScores:vi.fn(),setTempFeedback:vi.fn(),setAiSuggestions:vi.fn(),showToast:vi.fn(),showDialog:vi.fn(),geminiApiKey:'fake-test-key',geminiModel:'fake-model',setBatchGradingState:vi.fn(),cancelBatchGradingRef:{current:false}};
 window.AsianSchoolStorage={getSubmissions:()=>[sub],getPracticeSubmissions:()=>[],gradeEssaySubmission:vi.fn(),saveRecoveredEssayProposal:vi.fn(async()=>({success:true,submission:sub}))};return {state,actions:createGradingActions(state)};
}
beforeEach(()=>vi.clearAllMocks());afterEach(()=>{delete window.AsianSchoolStorage;});
it('metadata essay routing does not fall back to official exam101 for recovery',()=>{
 const sub=recovered();expect(getEssayQuestionsForSubmission(sub,{8:{officialExams:{101:{essayQuestions:[{num:1,question:'Wrong'}]}}}})).toMatchObject(sub.recoveryAssessment.essayQuestions);
 expect(getEssayQuestionsForSubmission(recovered({recoveryAssessment:{...sub.recoveryAssessment,essayQuestions:[]}}),{8:{officialExams:{101:{essayQuestions:[{num:1,question:'Wrong'}]}}}})).toEqual([]);
});
it('opening unapproved AI proposal preloads suggestions for explicit teacher approval',()=>{
 const sub=recovered({aiEssayProposal:{essayScores:{1:1,2:0.75,3:0.5},teacherFeedback:'Synthetic proposal',pending:true,version:1,baseGradeRevision:0}});const {state,actions}=setup(sub);actions.openGradingModal(sub);expect(state.setTempEssayScores).toHaveBeenCalledWith(sub.aiEssayProposal.essayScores);expect(state.setTempFeedback).toHaveBeenCalledWith('Synthetic proposal');
});
it('recovered modal closes only after server acknowledgement; rejected save keeps it open',async()=>{
 const {state,actions}=setup();let resolve;window.AsianSchoolStorage.gradeEssaySubmission.mockImplementation(()=>new Promise(r=>{resolve=r;}));const pending=actions.handleSaveGrading();expect(state.setGradingSubmission).not.toHaveBeenCalled();resolve({success:true,submission:recovered({isGraded:true})});await pending;expect(state.setGradingSubmission).toHaveBeenCalledWith(null);expect(window.AsianSchoolStorage.gradeEssaySubmission).toHaveBeenCalledWith('fake-recovery',state.tempEssayScores,'Teacher feedback',{expectedGradeRevision:0,expectedProposalVersion:0});
 const fail=setup();window.AsianSchoolStorage.gradeEssaySubmission.mockRejectedValue(new Error('fake-server-failure'));await fail.actions.handleSaveGrading();expect(fail.state.setGradingSubmission).not.toHaveBeenCalled();expect(fail.state.showToast).not.toHaveBeenCalled();expect(fail.state.showDialog).toHaveBeenCalled();
});
it('batch Gemini saves final recovered scores directly and waits for server acknowledgement',async()=>{
 const pending=recovered({aiEssayProposal:{version:2,pending:true}}),approved=recovered({id:'fake-approved',isGraded:true,teacherApprovedAt:'2026-11-11T00:00:00Z'});
 const {state,actions}=setup(pending);window.AsianSchoolStorage.getSubmissions=()=>[pending,approved];
 let commit;window.AsianSchoolStorage.gradeEssaySubmission.mockImplementation(()=>new Promise(resolve=>{commit=resolve;}));
 const run=actions.handleStartBatchGrading('8/21');
 await vi.waitFor(()=>expect(commit).toBeTypeOf('function'));
 expect(state.showToast).not.toHaveBeenCalled();
 expect(window.AsianSchoolStorage.gradeEssaySubmission).toHaveBeenCalledWith(pending.id,{1:1,2:.75,3:.5},'Synthetic issue',{expectedGradeRevision:0,expectedProposalVersion:2});
 commit({success:true,submission:{...pending,isGraded:true,teacherApprovedAt:'synthetic-time',aiEssayProposal:null,essayTotal:2.25,finalScore:8.75}});await run;
 expect(gradeSubmissionWithGemini).toHaveBeenCalledTimes(1);expect(window.AsianSchoolStorage.saveRecoveredEssayProposal).not.toHaveBeenCalled();
 expect(state.showToast.mock.calls[0][0]).toContain('1/1');expect(state.showToast.mock.calls[0][0]).not.toContain('cần thầy');
});
it('explicit regrading includes graded recovery rows and guards their displayed revision',async()=>{
 const sub=recovered({isGraded:true,teacherApprovedAt:'synthetic-time',gradeRevision:3,scoreConfirmed:true});const {actions}=setup(sub);
 window.AsianSchoolStorage.gradeEssaySubmission.mockResolvedValue({success:true,submission:{...sub,essayTotal:2.25,finalScore:8.75}});
 await actions.handleStartBatchGrading('8/21',false);
 expect(window.AsianSchoolStorage.gradeEssaySubmission).toHaveBeenCalledWith(sub.id,{1:1,2:.75,3:.5},'Synthetic issue',{expectedGradeRevision:3,expectedProposalVersion:0});
});
it('server rejection is a failed batch item and leaves pending recovery data intact',async()=>{
 const sub=recovered();const before=JSON.stringify(sub);const {state,actions}=setup(sub);
 window.AsianSchoolStorage.gradeEssaySubmission.mockResolvedValue({success:false,error:'Synthetic conflict'});
 await actions.handleStartBatchGrading('8/21');
 expect(JSON.stringify(sub)).toBe(before);expect(state.showToast.mock.calls[0][0]).toContain('0/1');expect(state.showToast.mock.calls[0][1]).toBe('warning');
 const updates=state.setBatchGradingState.mock.calls.map(([f])=>typeof f==='function'?f({}):f);expect(updates.some(u=>u.errorCount===1&&u.completedCount===0)).toBe(true);
});
it('ordinary exam batch continues using the existing Gemini final-grade flow',async()=>{
 const sub=recovered({id:'ordinary',studentClass:'8/19',examCode:'101',recoveryAssessment:undefined});const {actions}=setup(sub);
 window.EXAM_DATA_G8={officialExams:{101:{essayQuestions:[{num:1,question:'Synthetic prompt',points:1}]}}};
 window.AsianSchoolStorage.gradeEssaySubmission.mockResolvedValue({success:true,submission:{...sub,essayTotal:2.25,finalScore:8.75}});
 await actions.handleStartBatchGrading('8/19');
 expect(window.AsianSchoolStorage.gradeEssaySubmission).toHaveBeenCalledWith(sub.id,{1:1,2:.75,3:.5},'Synthetic issue');delete window.EXAM_DATA_G8;
});
