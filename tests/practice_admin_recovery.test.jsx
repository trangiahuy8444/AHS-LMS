import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useAdminController } from '../src/admin/hooks/useAdminController.js';
import { AdminContext } from '../src/admin/AdminContext.js';
import SubmissionsTab from '../src/admin/tabs/SubmissionsTab.jsx';
import { createExportActions } from '../src/admin/actions/exportActions.js';
import { generateSubmissionReviewHtml, exportStudentSubmissionHtml } from '../src/shared/exportSubmissionHtml.js';
vi.mock('../src/admin/components/ClassGradingStatusBar.jsx', () => ({ default: () => null }));
const fixture = { id:'practice-fixture',mode:'practice',grade:8,studentClass:'8/21',studentId:'999000',fullName:'Học Sinh Giả',score:6,finalScore:6,maxScore:7,isGraded:true,submittedAt:'2026-11-11T08:20:00Z',answers:{mcq:{5:0},tf:{},essay:{1:'<script>fictional answer</script>'}} };
let storage;
beforeEach(() => {
 storage={getConfig:()=>({}),getLiveSessions:()=>[],getSubmissions:()=>[],getPracticeSubmissions:()=>[fixture],getPracticeAttempts:()=>[],getAuditLogs:()=>[],onLiveChange:()=>()=>{},onSubmissionsChange:()=>()=>{},onConfigChange:()=>()=>{},onPracticeSubmissionChange:()=>()=>{},onPracticeAttemptChange:()=>()=>{}};
 window.AsianSchoolStorage=storage;
 window.AsianSchoolAuth={onChange:callback=>{callback({ready:true,isTeacher:true,user:{email:'fixture@example.test'}});return ()=>{};}};
 window.EXAM_DATA_G8={practiceQuestions:[{id:5,question:'Current bank must not be used',options:['WRONG MAPPING','other'],correctAnswer:0}]};
 URL.createObjectURL=vi.fn(()=> 'blob:fixture');URL.revokeObjectURL=vi.fn();
 vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();delete window.EXAM_DATA_G8;});
it('shows practice-only submissions in controller filters, preserving attempts instead of replacing with the best summary',()=>{
 const first={...fixture,id:'first'},last={...fixture,id:'last',finalScore:1};
 storage.getPracticeSubmissions=()=>[{...first,_queueId:'last'}];
 storage.getPracticeAttempts=()=>[first,last];
 const {result}=renderHook(()=>useAdminController());
 act(()=>{result.current.setFilterClass('8/21');result.current.setFilterMode('practice');});
 expect(result.current.filteredSubmissions.map(s=>s.id)).toEqual(['first','last']);
 act(()=>result.current.setFilterGraded('pending'));
 expect(result.current.filteredSubmissions).toEqual([]);
});
it('keeps a legacy best-summary row when no per-attempt data is available and deduplicates duplicated source rows',()=>{
 storage.getSubmissions=()=>[fixture];
 const {result}=renderHook(()=>useAdminController());
 expect(result.current.filteredSubmissions.map(s=>s.id)).toEqual(['practice-fixture']);
});
it('exports when only practice exists and refuses to mark an empty JSON as a backup',()=>{
 storage.exportSubmissionsCSV=()=> 'STT,Chế độ\n1,practice';
 storage.exportSubmissionsJSON=()=> JSON.stringify({format:'ahs-submissions-backup',version:2,submissions:[],practiceSubmissions:[fixture],practiceAttempts:[]});
 const saved=vi.fn(),dialog=vi.fn();
 const actions=createExportActions({submissions:[],practiceSubs:[fixture],setHasDownloadedBackup:saved,showDialog:dialog,showToast:vi.fn()});
 actions.handleExportCSV();expect(dialog).not.toHaveBeenCalled();expect(saved).not.toHaveBeenCalled();
 actions.handleExportJSON();expect(saved).toHaveBeenCalledWith(true);
 saved.mockClear();storage.exportSubmissionsJSON=()=>JSON.stringify({format:'ahs-submissions-backup',version:2,submissions:[],practiceSubmissions:[],practiceAttempts:[]});
 actions.handleExportJSON();expect(saved).not.toHaveBeenCalled();expect(dialog).toHaveBeenCalled();
});
it('does not infer legacy practice option text or per-question correctness from the current bank',()=>{
 const html=generateSubmissionReviewHtml(fixture);
 expect(html).not.toContain('WRONG MAPPING');
 expect(html).toContain('Chưa có bộ câu hỏi của lượt làm');
 expect(html).toContain('Chỉ số lựa chọn đã lưu: 0');
 expect(html).toContain('&lt;script&gt;fictional answer&lt;/script&gt;');
 expect(html).not.toContain('LÀM ĐÚNG');
});
it('uses only the captured question set for a practice attempt and never fetches an official exam to export it',async()=>{
 const sub={...fixture,practiceSet:{mcqQuestions:[{id:5,question:'Captured question',options:['Captured option','another'],correctAnswer:1}],tfQuestions:[],essayQuestions:[{num:1,question:'Captured essay'}]}};
 const html=generateSubmissionReviewHtml(sub);
 expect(html).toContain('Captured option');expect(html).toContain('Captured essay');expect(html).not.toContain('WRONG MAPPING');
 const get=vi.fn();window.firebaseDb={collection:()=>({doc:()=>({get})})};
 await exportStudentSubmissionHtml(sub);
 expect(get).not.toHaveBeenCalled();delete window.firebaseDb;
});
it('practice rows have read-only review instead of official grading, reset and delete actions',()=>{
 render(<AdminContext.Provider value={{config:{},filterGrade:'8',filterClass:'8/21',filterMode:'practice',filterGraded:'all',searchQuery:'',filteredSubmissions:[fixture],submissions:[],practiceSubs:[fixture]}}><SubmissionsTab/></AdminContext.Provider>);
 expect(screen.queryByRole('button',{name:'Xem & Chấm'})).toBeNull();
 expect(screen.queryByTitle('Reset lượt thi để học sinh này có thể vào làm bài lại từ đầu')).toBeNull();
 expect(screen.queryByTitle('Xóa bài nộp & mở lại lượt thi cho học sinh này')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:/Xem bài ôn tập/}));
 expect(screen.getByRole('dialog',{name:'Bài ôn tập đã lưu'})).toBeTruthy();
 expect(screen.getByTitle('Chi tiết bài ôn tập').getAttribute('sandbox')).toBe('');
});

it('renders captured essay context and lettered subparts using the production practice schema',()=>{
 const html=generateSubmissionReviewHtml({...fixture,practiceSet:{mcqQuestions:[],tfQuestions:[],essayQuestions:[{num:1,context:'Captured context <safe>',subItems:[{letter:'a',text:'Explain safe storage'},{letter:'b',text:'Discuss <privacy>'}]}]}});
 expect(html).toContain('Captured context &lt;safe&gt;');expect(html).toContain('a)');expect(html).toContain('Explain safe storage');expect(html).toContain('Discuss &lt;privacy&gt;');
});
it('does not crash the controller or practice review for malformed nested cloud questions and text',()=>{
 const malformed={...fixture,practiceSet:{mcqQuestions:[null,3,{id:5,question:{bad:'text'},options:[{bad:'option'}],correctAnswer:1}],tfQuestions:[null,{num:1,context:{bad:'text'},subQuestions:[null,{letter:'a',text:{bad:'text'}}]}],essayQuestions:[null,{num:1,context:{bad:'text'},subItems:[null,{letter:'a',text:{bad:'text'}}]}]},answers:{mcq:{5:0},tf:{1:{a:true}},essay:{1:'Preserved answer'}}};
 storage.getPracticeSubmissions=()=>[malformed];
 const {result}=renderHook(()=>useAdminController());
 expect(result.current.filteredSubmissions).toHaveLength(1);
 expect(()=>generateSubmissionReviewHtml(malformed)).not.toThrow();
 const html=generateSubmissionReviewHtml(malformed);expect(html).toContain('Preserved answer');expect(html).not.toContain('[object Object]');
});
it('ignores nonprimitive cloud question IDs before using them as answer map keys',()=>{
 const invalidId={toString:null,valueOf:null};
 storage.getPracticeSubmissions=()=>[{...fixture,practiceSet:{mcqQuestions:[{id:invalidId,num:invalidId,question:'Synthetic question',options:['one'],correctAnswer:0}]}}];
 expect(()=>renderHook(()=>useAdminController())).not.toThrow();
 const html=generateSubmissionReviewHtml({...fixture,practiceSet:{mcqQuestions:[{id:invalidId,question:'Invalid identity must not be mapped',options:['Misleading choice']}]}});
 expect(html).not.toContain('Misleading choice');
});
