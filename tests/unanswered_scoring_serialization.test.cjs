const {test}=require('node:test');
const assert=require('node:assert/strict');
const {gradeExam}=require('../src/core/exam-package.js');
const exam={part1_mcq:[{num:1,points:0.25,correctAnswer:0},{num:2,points:0.25,correctAnswer:1}],part2_tf:[{num:1,points:1,subQuestions:[{letter:'a',correctAnswer:false},{letter:'b',correctAnswer:true},{letter:'c',correctAnswer:false},{letter:'d',correctAnswer:true}]}]};
function assertFirestoreSafe(value){
 assert.notEqual(value,undefined,'scoring data sent to Firestore must not contain undefined');
 if(value&&typeof value==='object')for(const item of Object.values(value))assertFirestoreSafe(item);
}
test('unanswered objective items produce Firestore-safe results and keep false/zero answers',()=>{
 const result=gradeExam(exam,{mcq:{1:0},tf:{1:{a:false}}});
 assertFirestoreSafe(result);
 assert.equal(result.mcqResults[1].userChoice,0);assert.equal(result.mcqResults[2].userChoice,null);
 assert.equal(result.tfResults[1].subResults.a.userChoice,false);assert.equal(result.tfResults[1].subResults.b.userChoice,null);
 assert.equal(result.mcqPoints,0.35);
});
