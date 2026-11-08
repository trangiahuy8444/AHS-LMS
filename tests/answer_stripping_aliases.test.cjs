const {test}=require('node:test');
const assert=require('node:assert/strict');
const {stripAnswers}=require('../src/core/exam-package.js');
test('public essays exclude every supported grading alias even in nested subitems without changing question content',()=>{
 const exam={code:'101',essayQuestions:[{num:1,points:1,context:'Tình huống giả',answerGuide:'Barem giả không được gửi học sinh',subItems:[{letter:'a',text:'Ý yêu cầu giả',modelAnswer:'Đáp án giả',rubric:'Barem giả',answerGuide:'Hướng dẫn giả',details:{correctAnswer:'A',explanation:'Giải thích giả',content:'Nội dung công khai'}}]}]};
 const before=JSON.stringify(exam);const result=stripAnswers(exam);
 assert.deepEqual(result,{code:'101',essayQuestions:[{num:1,points:1,context:'Tình huống giả',subItems:[{letter:'a',text:'Ý yêu cầu giả',details:{content:'Nội dung công khai'}}]}]});
 assert.equal(JSON.stringify(exam),before);
});
