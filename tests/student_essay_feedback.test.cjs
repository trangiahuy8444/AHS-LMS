const test=require('node:test');const assert=require('node:assert/strict');
const response=payload=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(payload)}]}}]})});
const input={submission:{grade:9,answers:{essay:{1:'Bài làm giả'}}},essayQuestions:[{num:1,points:1,question:'Câu hỏi giả',modelAnswer:'Barem giả'}],apiKey:'fake-key',model:'fake-primary'};
test('full-mark answers add no student feedback, including after model fallback',async()=>{
 const previous=global.fetch;let calls=0;
 global.fetch=async()=>++calls===1?{ok:false,status:429,json:async()=>({error:{message:'fake quota'}})}:response({score:1,feedback:'Học sinh trả lời đầy đủ, chính xác.',breakdown:[{item:'Ý a',points:0.5,maxPoints:0.5,reason:'Đúng'},{item:'Ý b',points:0.5,maxPoints:0.5,reason:'Đúng'}]});
 try{const {gradeSubmissionWithGemini}=await import('../src/core/gemini-grading-service.js');const result=await gradeSubmissionWithGemini(input);assert.equal(result.essayScores[1],1);assert.equal(result.teacherFeedback,'');assert.equal(result.usedModels.length,1);}finally{global.fetch=previous;}
});
test('partial answers report only the unmet criterion and keep model names out of the comment',async()=>{
 const previous=global.fetch;
 global.fetch=async()=>response({score:0.5,feedback:'Ý a rất tốt. [Dự phòng: gemini-3.1-flash-lite] Ý b thiếu nguồn.',breakdown:[{item:'Ý a',points:0.5,maxPoints:0.5,reason:'Trả lời đầy đủ.'},{item:'Ý b',points:0,maxPoints:0.5,reason:'Chưa nêu nguồn đáng tin cậy.'}]});
 try{const {gradeSubmissionWithGemini}=await import('../src/core/gemini-grading-service.js');const result=await gradeSubmissionWithGemini({...input,autoFallback:false});assert.match(result.teacherFeedback,/Ý b: Chưa nêu nguồn đáng tin cậy/);assert.doesNotMatch(result.teacherFeedback,/rất tốt|Trả lời đầy đủ|Dự phòng|gemini-/);}finally{global.fetch=previous;}
});

test('invalid AI decimals fail the grading result and do not turn into saved zero scores',async()=>{
 const previous=global.fetch;
 global.fetch=async()=>response({score:0.88,breakdown:[{item:'Ý a',points:0.5,maxPoints:0.5},{item:'Ý b',points:0.38,maxPoints:0.5}],feedback:'Không được dùng.'});
 try{const {gradeSubmissionWithGemini}=await import('../src/core/gemini-grading-service.js');const result=await gradeSubmissionWithGemini({...input,autoFallback:false});assert.equal(result.success,false);assert.equal(result.essayScores[1],undefined);assert.match(result.error,/barem/);assert.equal(result.teacherFeedback,'');}finally{global.fetch=previous;}
});
