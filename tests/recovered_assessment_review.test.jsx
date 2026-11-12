import {it,expect} from 'vitest';
import {generatePracticeReviewHtml} from '../src/shared/practiceSubmissionHtml.js';
const essays=[1,2,3].map(num=>({num,id:num,points:1,context:`Saved essay context ${num}`,subItems:[{letter:'a',text:`Saved subpart ${num}`}],modelAnswer:'Synthetic rubric'}));
const fixture={id:'recovered-fixture',mode:'exam',grade:8,studentClass:'8/21',studentId:'990001',fullName:'Synthetic Student',examCode:'RECOVERY821',mcqPoints:6,finalScore:6,maxScore:10,isGraded:false,answers:{mcq:{5:2},tf:{},essay:{1:'Original answer one',2:'Original answer two',3:'Original answer three'}},recoveryAssessment:{kind:'practice-821-20261111',mcqScore:6,essayQuestions:essays,missingMcqOrder:true}};
it('renders recovered assessment with locked objective score and exact essay prompts instead of practice-only text',()=>{
 const html=generatePracticeReviewHtml(fixture,fixture.fullName);
 expect(html).toContain('Bài đánh giá phục hồi');expect(html).toContain('6 / 7');expect(html).not.toContain('Tự luận ôn tập không tính điểm');
 expect(html).toContain('Saved essay context 1');expect(html).toContain('Saved subpart 1');expect(html).toContain('Original answer three');expect(html).toContain('Chỉ số lựa chọn đã lưu: 2');expect(html).toContain('thứ tự phương án');
});
it('shows AI proposal as unapproved and does not turn it into final score',()=>{
 const sub={...fixture,aiEssayProposal:{essayScores:{1:0.5,2:0.75,3:1},essayTotal:2.25,teacherFeedback:'Proposal feedback',pending:true}};
 const before=JSON.stringify(sub),html=generatePracticeReviewHtml(sub,sub.fullName);
 expect(html).toContain('AI đề xuất');expect(html).toContain('chờ thầy duyệt');expect(html).toContain('0.75');expect(html).not.toContain('8.25 / 10');expect(JSON.stringify(sub)).toBe(before);
});
it('shows approved essay grades and saved total without changing original answers',()=>{
 const sub={...fixture,isGraded:true,teacherApprovedAt:'2026-11-11T10:00:00Z',essayScores:{1:1,2:0.5,3:0.75},essayTotal:2.25,finalScore:8.25,teacherFeedback:'Approved feedback'};
 const html=generatePracticeReviewHtml(sub,sub.fullName);expect(html).toContain('8.25 / 10');expect(html).toContain('Giáo viên đã duyệt');expect(html).toContain('Approved feedback');expect(html).toContain('Original answer two');
});
it('does not activate recovery presentation for a different class with a copied marker',()=>{
 const html=generatePracticeReviewHtml({...fixture,studentClass:'8/22'},fixture.fullName);expect(html).not.toContain('Bài đánh giá phục hồi');expect(html).toContain('Tự luận ôn tập không tính điểm');
});
