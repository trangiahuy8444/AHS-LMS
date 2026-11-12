const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const id='g8_8_21_990001_1';
const recovered=(patch={})=>({id,grade:8,studentClass:'8/21',studentId:'990001',fullName:'Synthetic Student',mode:'exam',examCode:'RECOVERY821',mcqPoints:6,finalScore:6,isGraded:false,gradeRevision:0,answers:{mcq:{5:2},tf:{},essay:{1:'Original essay'}},recoveryAssessment:{kind:'practice-821-20261111',mcqScore:6,missingMcqOrder:true,essayQuestions:[{num:1,context:'Original essay prompt',points:1,subItems:[{letter:'a',text:'Explain'}]}]},...patch});
function harness(row=recovered(),config={classReviewControl:{'8/21':true}}){
 const store=new Map([['exam_config/global_config',config],['submissions/'+id,row]]),reads=[],updates=[];
 const snap=key=>({exists:store.has(key),data:()=>store.get(key),metadata:{fromCache:false,hasPendingWrites:false}});
 let failTx=false;const deniedServer=new Set();
 const db={enablePersistence:async()=>{},collection(name){return{doc(key){const p=name+'/'+key;return{path:p,async get(options){reads.push(p);if(options?.source === 'server' && deniedServer.has(p))throw Error('server denied cached recovery');return snap(p);},async update(v){updates.push({path:p,data:v});store.set(p,{...store.get(p),...v});}};},where(){return{where(){return{async get(){return{empty:true,docs:[]};}};}};}};},async runTransaction(fn){if(failTx)throw Error('fake offline');const queued=[];const value=await fn({get:ref=>ref.get(),update:(ref,v)=>queued.push({ref,v}),set(){}});for(const{ref,v}of queued)await ref.update(v);return value;}};
 const firestore=Object.assign(()=>db,{FieldValue:{serverTimestamp:()=> 'SERVER_TIME',increment:n=>n}});
 const window={location:{pathname:'/test/'},dispatchEvent(){},AsianSchoolNormalize:{normalizeLmsCode:v=>String(v||'').replace(/\D/g,''),normalizeStudentName:v=>String(v||'')},AsianSchoolLatestExamBank:{8:{101:{essayQuestions:[{num:1,question:'WRONG101'}]}}}};
 const auth={currentUser:{uid:'fake-owner'},onAuthStateChanged(){}};
 vm.runInNewContext(fs.readFileSync('src/core/firebase-config.js','utf8'),{window,document:{readyState:'loading',addEventListener(){}},CustomEvent:class{},console:{log(){},warn(){}},firebase:{apps:[{}],app:()=>({}),firestore,auth:()=>auth},setTimeout:(fn,ms)=>{const t=setTimeout(fn,ms);t.unref();return t;},clearTimeout});
 return{cloud:window.AsianSchoolCloud,reads,updates,store,setFail:v=>{failTx=v;},denyServer:path=>deniedServer.add(path)};
}
test('recovered review uses embedded essays and never fetches or falls back to exam101',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1}));const result=await h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'});
 assert.equal(result.submission.recoveryAssessment.kind,'practice-821-20261111');assert.equal(result.exam.essayQuestions[0].context,'Original essay prompt');assert.equal(result.exam.mcqQuestions.length,0);assert(!h.reads.some(p=>p.startsWith('exam_bank/')||p.startsWith('exam_public/')));
});
test('lookup rejects a stored record from a different class even when its document ID matches',async()=>{
 const h=harness(recovered({studentClass:'8/22'}));await assert.rejects(h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'}));
});
test('recovered confirmation rejects AI-only suggestions and closed class access',async()=>{
 const pending=harness();await assert.rejects(pending.cloud.confirmSubmissionScore({submissionId:id,expectedGradeRevision:0}));assert.equal(pending.updates.length,0);
 const closed=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1}),{allowStudentReviewOfficialExam:true,classReviewControl:{'8/21':false}});await assert.rejects(closed.cloud.confirmSubmissionScore({submissionId:id,expectedGradeRevision:1}));assert.equal(closed.updates.length,0);
});
test('recovered confirmation rejects a grade revision changed since the student opened the result',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:2}));await assert.rejects(h.cloud.confirmSubmissionScore({submissionId:id,expectedGradeRevision:1}));assert.equal(h.updates.length,0);
});
test('recovered confirmation commits only confirmation fields after approved current grade',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:2}));assert.equal(await h.cloud.confirmSubmissionScore({submissionId:id,expectedGradeRevision:2}),true);
 assert.equal(h.updates.length,1);assert.deepEqual(Object.keys(h.updates[0].data).sort(),['scoreConfirmed','scoreConfirmedAt']);assert.equal(h.updates[0].data.scoreConfirmed,true);
});
test('recovered confirmation reports a transaction failure instead of acknowledging success',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1}));h.setFail(true);await assert.rejects(h.cloud.confirmSubmissionScore({submissionId:id,expectedGradeRevision:1}),/offline/);assert.equal(h.updates.length,0);
});
test('recovered lookup requires the exact class gate even if global review is enabled',async()=>{
 const h=harness(recovered(),{allowStudentReviewOfficialExam:true,classReviewControl:{'8/21':false}});
 await assert.rejects(h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'}));
});

test('cached recovered submission cannot be opened when a server refetch is denied',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1}));h.denyServer('submissions/'+id);
 await assert.rejects(h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'}),/server|máy chủ/);
});
test('cached recovered class configuration cannot grant review when fresh configuration is unavailable',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1}));h.denyServer('exam_config/global_config');
 await assert.rejects(h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'}));
});

test('recovered lookup rejects a pending AI proposal even when a caller has teacher read access',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1,aiEssayProposal:{essayScores:{1:1}}}));
 await assert.rejects(h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'}));
});
test('recovered lookup rejects unapproved content even when readable from a teacher session',async()=>{
 const h=harness(recovered());await assert.rejects(h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'}));
});
test('dedicated recovery IDs do not consume or require normal exam-attempt submission IDs',async()=>{
 const h=harness(recovered({isGraded:true,teacherApprovedAt:'approved',gradeRevision:1}));const restored=h.store.get('submissions/'+id);h.store.delete('submissions/'+id);h.store.set('submissions/recovery821_990001',{...restored,id:'recovery821_990001'});
 const result=await h.cloud.lookupSubmissionForReview({grade:8,studentClass:'8/21',studentId:'990001'});
 assert.equal(result.subId,'recovery821_990001');assert(!h.reads.some(path=>path.startsWith('exam_attempts/')));
});
