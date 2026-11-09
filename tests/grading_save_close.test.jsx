import {afterEach,expect,it,vi} from 'vitest';
import {createGradingActions} from '../src/admin/actions/gradingActions.js';
afterEach(()=>{delete window.AsianSchoolStorage;});
function setup(result){
 const rows=[{id:'fake-sub',isGraded:true}];
 window.AsianSchoolStorage={gradeEssaySubmission:vi.fn(()=>result),getSubmissions:()=>rows,getPracticeSubmissions:()=>[]};
 const s={gradingSubmission:{id:'fake-sub'},tempEssayScores:{1:0.75},tempFeedback:'Câu 1: Em chưa nêu nguồn.',setGradingSubmission:vi.fn(),setSubmissions:vi.fn(),setPracticeSubs:vi.fn(),setGradingSuccessAlert:vi.fn(),showToast:vi.fn(),showDialog:vi.fn()};
 return {s,actions:createGradingActions(s),rows};
}
it('closes the grading modal after a successful save, refreshes rows and confirms outside the modal',()=>{
 const {s,actions,rows}=setup({success:true,submission:{id:'fake-sub',isGraded:true}});
 actions.handleSaveGrading();
 expect(window.AsianSchoolStorage.gradeEssaySubmission).toHaveBeenCalledWith('fake-sub',{1:0.75},'Câu 1: Em chưa nêu nguồn.');
 expect(s.setSubmissions).toHaveBeenCalledWith(rows);
 expect(s.setPracticeSubs).toHaveBeenCalledWith([]);
 expect(s.setGradingSubmission).toHaveBeenCalledWith(null);
 expect(s.showToast).toHaveBeenCalledWith(expect.stringMatching(/Đã lưu điểm/),'success',expect.any(String));
 expect(s.showDialog).not.toHaveBeenCalled();
});
it('keeps the modal and edited values when a save fails and does not announce success',()=>{
 const {s,actions}=setup({success:false,error:'Điểm phải theo bước 0,25.'});
 actions.handleSaveGrading();
 expect(s.setGradingSubmission).not.toHaveBeenCalled();
 expect(s.setSubmissions).not.toHaveBeenCalled();
 expect(s.showToast).not.toHaveBeenCalled();
 expect(s.showDialog).toHaveBeenCalledWith('Lỗi Chấm Điểm','Điểm phải theo bước 0,25.','error');
});
