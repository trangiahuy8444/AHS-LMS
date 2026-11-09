import {expect,it} from 'vitest';
import {sanitizeStudentFeedback,setEssayQuestionFeedback} from '../src/shared/studentFeedback.js';
it('removes legacy model labels and full-mark generated comments, leaving the actual shortfall',()=>{
 const old='[Câu 1 (1/1đ) [Dự phòng: gemini-3.1-flash-lite]]: Trả lời đầy đủ.\n\n[Câu 2 (0.75/1đ)]: Ý b chưa nêu nguồn.';
 expect(sanitizeStudentFeedback(old)).toBe('[Câu 2 (0.75/1đ)]: Ý b chưa nêu nguồn.');
});
it('applying a corrected full-mark answer removes its old issue without deleting another question or a manual note',()=>{
 const old='Lưu ý chung của giáo viên.\n\nCâu 1: Thiếu ví dụ.\n\nCâu 2: Sai nguồn.';
 expect(setEssayQuestionFeedback(old,1,{score:1,feedback:'Rất tốt'},1)).toBe('Lưu ý chung của giáo viên.\n\nCâu 2: Sai nguồn.');
});

it('removes full-mark legacy comments without brackets and tolerates a missing closing bracket',()=>{
 const text='Câu 1 (1/1đ): Trả lời tốt.\n\n[Câu 2 (0.75/1đ): Thiếu nguồn.\n\nCâu 3 (1/1đ): Đúng.';
 expect(sanitizeStudentFeedback(text)).toBe('[Câu 2 (0.75/1đ): Thiếu nguồn.');
});

it('addresses the pupil as em and starts every question comment in a separate paragraph',()=>{
 expect(sanitizeStudentFeedback('Câu 1: Học sinh chưa nêu nguồn. Câu 3: Ý b của học sinh còn thiếu.')).toBe('Câu 1: Em chưa nêu nguồn.\n\nCâu 3: Ý b của em còn thiếu.');
});
