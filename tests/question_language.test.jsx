import { expect, it } from 'vitest';
import { hasEnglishQuestion, questionForLanguage } from '../src/shared/questionLanguage.js';
it('translates display text while retaining original IDs, answer keys and statement letters',()=>{
 const q={num:3,context:'Ngữ cảnh',subQuestions:[{letter:'a',text:'Ý a',correctAnswer:false}],translations:{en:{context:'Context',subQuestions:[{letter:'a',text:'Statement a',correctAnswer:true}],correctAnswer:9,num:999}}};
 const result=questionForLanguage(q,'en');
 expect(result.context).toBe('Context');expect(result.num).toBe(3);expect(result.subQuestions[0]).toEqual({letter:'a',text:'Statement a',correctAnswer:false});
 expect(questionForLanguage(q,'vi')).toBe(q);expect(q.context).toBe('Ngữ cảnh');
});
it('does not mix languages or replace options when a translation is incomplete',()=>{
 const q={question:'Câu gốc',options:['A','B'],translations:{en:{question:'Question',options:['A']}}};
 expect(hasEnglishQuestion(q)).toBe(false);expect(questionForLanguage(q,'en')).toBe(q);
});
