const test=require('node:test');const assert=require('node:assert/strict');
const storage=require('../src/core/storage-service.js');
test('shuffling choices keeps every English choice aligned with its original and correct answer',()=>{
 const q={id:1,question:'Câu hỏi giả',options:['Một','Hai','Ba','Bốn'],correctAnswer:2,translations:{en:{question:'Fake question',options:['One','Two','Three','Four']}}};
 const before=JSON.stringify(q);
 for(let run=0;run<30;run++){
  const result=storage.shuffleQuestionOptions(q);
  for(let i=0;i<4;i++)assert.equal(result.translations.en.options[i],q.translations.en.options[q.options.indexOf(result.options[i])]);
  assert.equal(result.options[result.correctAnswer],'Ba');assert.equal(result.translations.en.options[result.correctAnswer],'Three');
 }
 assert.equal(JSON.stringify(q),before);
});
