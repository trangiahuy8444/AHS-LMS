const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const fixture=(extra={})=>({id:'fake-recovery-821',uid:'fake-owner',mode:'exam',grade:8,studentClass:'8/21',studentId:'999999',fullName:'Hoc Sinh Gia',examCode:'RECOVERY821',mcqPoints:6.5,score:6.5,finalScore:6.5,essayTotal:0,essayScores:{},isGraded:false,scoreConfirmed:false,gradeRevision:0,answers:{mcq:{1:0},tf:{},essay:{1:'Answer1',2:'Answer2',3:'Answer3'}},recoveryAssessment:{kind:'practice-821-20261111',mcqScore:6.5,sourcePracticeId:'fake-practice',missingMcqOrder:true,essayQuestions:[1,2,3].map(num=>({num,points:1,question:'Synthetic question '+num,modelAnswer:'Synthetic rubric'}))},...extra});
function harness(input=fixture()){
 const values=new Map([['asian_school_submissions_v1',JSON.stringify([input])]]);let server=structuredClone(input),fail=false,delay=null,graded=0,writes=0;
 const localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const window={addEventListener(){},AsianSchoolExamPackage:{gradeExam(){graded++;return {mcqPoints:0,maxMcqPoints:7,tfPoints:0};}},AsianSchoolExamTiming:{getSubmissionTiming:()=>({known:false})},firebaseDb:{collection:name=>({doc:id=>({path:name+'/'+id})}),runTransaction:async fn=>{const staged=[];const tx={get:async()=>({exists:true,data:()=>structuredClone(server)}),set:(_ref,patch)=>staged.push(patch)};const result=await fn(tx);if(delay)await delay;if(fail)throw Error('fake-server-rejected');for(const p of staged){server={...server,...p};writes++;}return result;}}};
 const ctx={window,self:window,localStorage,console,Date,Math,Map,Set,JSON,require,setTimeout,clearTimeout};vm.runInNewContext(fs.readFileSync('src/core/storage-service.js','utf8'),ctx);const storage=window.AsianSchoolStorage;storage.getConfig=()=>({});storage.syncRowToGoogleDrive=()=>Promise.resolve({success:true});
 return{storage,values,window,getServer:()=>server,setServer:v=>{server=v;},setFail:v=>{fail=v;},setDelay:v=>{delay=v;},graded:()=>graded,writes:()=>writes};
}
const scores={1:1,2:0.75,3:0.5};
test('recovered auto-grader always skips MCQ even without autoGradedAt',()=>{
 const h=harness();h.storage.autoGradeExamSubmissions({8:{RECOVERY821:{mcqQuestions:[]}}});assert.equal(h.graded(),0);assert.equal(h.storage.getSubmissions()[0].mcqPoints,6.5);
});
test('AI stores a proposal only; manual approval adds 3 essay scores to immutable /7 MCQ',async()=>{
 const h=harness();const p=await h.storage.saveRecoveredEssayProposal('fake-recovery-821',{success:true,essayScores:scores,essayTotal:2.25,teacherFeedback:'Synthetic issue'});assert.equal(p.success,true);
 let sub=h.storage.getSubmissions()[0];assert.equal(sub.isGraded,false);assert.equal(sub.finalScore,6.5);assert.deepEqual(sub.essayScores,{});assert.equal(sub.aiEssayProposal.pending,true);assert.equal(sub.aiEssayProposal.baseGradeRevision,0);
 const approved=await h.storage.gradeEssaySubmission(sub.id,scores,'Teacher-approved feedback');assert.equal(approved.success,true);sub=h.storage.getSubmissions()[0];assert.equal(sub.mcqPoints,6.5);assert.equal(sub.essayTotal,2.25);assert.equal(sub.finalScore,8.75);assert.equal(sub.gradeRevision,1);assert.equal(sub.isGraded,true);assert.ok(sub.teacherApprovedAt);assert.equal(sub.aiEssayProposal,null);
});
test('recovered grading waits for server ack and never changes local grade on failed save',async()=>{
 const h=harness();let finish;h.setDelay(new Promise(resolve=>{finish=resolve;}));let settled=false;const pending=h.storage.gradeEssaySubmission('fake-recovery-821',scores,'Feedback').then(r=>{settled=true;return r;});await new Promise(resolve=>setImmediate(resolve));assert.equal(settled,false);assert.equal(h.storage.getSubmissions()[0].isGraded,false);finish();assert.equal((await pending).success,true);
 const failed=harness();failed.setFail(true);const before=failed.values.get('asian_school_submissions_v1');assert.equal((await failed.storage.gradeEssaySubmission('fake-recovery-821',scores,'Feedback')).success,false);assert.equal(failed.values.get('asian_school_submissions_v1'),before);
});
test('rejects missing, extra, fractional or oversized essay scores and changed MCQ provenance',async()=>{
 for(const bad of [{1:1,2:1},{1:1,2:1,3:1,4:0},{1:0.88,2:1,3:1},{1:1.25,2:1,3:1}]){const h=harness();assert.equal((await h.storage.gradeEssaySubmission('fake-recovery-821',bad,'')).success,false);assert.equal(h.writes(),0);}
 const h=harness(fixture({mcqPoints:7}));assert.equal((await h.storage.gradeEssaySubmission('fake-recovery-821',scores,'')).success,false);assert.equal(h.writes(),0);
 const stale=harness();stale.setServer(fixture({recoveryAssessment:{...fixture().recoveryAssessment,sourcePracticeId:'different-source'}}));assert.equal((await stale.storage.gradeEssaySubmission('fake-recovery-821',scores,'')).success,false);assert.equal(stale.writes(),0);
});
test('new approved grade clears confirmation metadata and rejects stale revision or AI after approval',async()=>{
 const h=harness(fixture({isGraded:true,teacherApprovedAt:'2026-11-11T00:00:00Z',gradeRevision:2,scoreConfirmed:true,scoreConfirmedAt:'2026-11-11T00:01:00Z',confirmedByAdmin:true,scoreConfirmedRevision:2}));
 assert.equal((await h.storage.saveRecoveredEssayProposal('fake-recovery-821',{success:true,essayScores:scores,essayTotal:2.25})).success,false);
 assert.equal((await h.storage.gradeEssaySubmission('fake-recovery-821',scores,'Teacher edit')).success,true);const sub=h.storage.getSubmissions()[0];assert.equal(sub.gradeRevision,3);assert.equal(sub.scoreConfirmed,false);assert.equal(sub.scoreConfirmedAt,null);assert.equal(sub.confirmedByAdmin,false);assert.equal(sub.scoreConfirmedRevision,null);
 const stale=harness();stale.setServer(fixture({gradeRevision:1,isGraded:true,teacherApprovedAt:'2026-11-11T00:00:00Z'}));assert.equal((await stale.storage.gradeEssaySubmission('fake-recovery-821',scores,'')).success,false);assert.equal(stale.writes(),0);
});
test('recovery cannot be confirmed individually or in batch until teacher-approved',()=>{
 const h=harness();const before=h.values.get('asian_school_submissions_v1');assert.equal(h.storage.confirmScore('fake-recovery-821',{confirmedByAdmin:true}).success,false);assert.equal(h.storage.confirmBatchScoresByAdmin(['fake-recovery-821']).count,0);assert.equal(h.values.get('asian_school_submissions_v1'),before);
});
test('approval removes private AI proposal from both server source and local student-readable copy',async()=>{
 const h=harness();await h.storage.saveRecoveredEssayProposal('fake-recovery-821',{success:true,essayScores:scores,essayTotal:2.25,teacherFeedback:'Private unreviewed proposal',usedModels:['private-model-identity']});
 const result=await h.storage.gradeEssaySubmission('fake-recovery-821',{1:0.5,2:0.5,3:0.5},'Teacher reviewed feedback');assert.equal(result.success,true);
 for(const source of [h.getServer(),h.storage.getSubmissions()[0]]){assert.equal(source.aiEssayProposal,null);const text=JSON.stringify(source);assert(!text.includes('Private unreviewed proposal'));assert(!text.includes('private-model-identity'));assert.deepEqual(JSON.parse(JSON.stringify(source.essayScores)),{1:0.5,2:0.5,3:0.5});assert.equal(source.teacherFeedback,'Teacher reviewed feedback');}
});
