const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(mode = 'production') {
  const writes = [];
  const fieldValue = { increment:n=>({increment:n}), serverTimestamp:()=>({serverTimestamp:true}) };
  const batch = { set:(...args)=>writes.push(args), commit:async()=>{writes.push(['commit']);} };
  const context = {window:{AsianSchoolRuntime:{mode},firebaseDb:{collection:name=>({doc:id=>({path:name+'/'+id})}),batch:()=>batch}},firebase:{firestore:{FieldValue:fieldValue}}};
  vm.runInNewContext(fs.readFileSync('src/core/drive-archive.js','utf8'),context);
  return {archive:context.window.AsianSchoolDriveArchive,writes,batch};
}
test('one atomic commit persists canonical source and reference-only pending job',async()=>{
  const {archive,writes} = setup();
  await archive.writeCanonical('submissions','fake-source',{grade:9,studentClass:'9/19',uid:'fake',answers:{essay:'private source only'}});
  assert.equal(writes.length,3);
  assert.equal(writes[0][0].path,'submissions/fake-source');
  assert.equal(writes[1][0].path,'drive_archive_jobs/submissions_fake-source');
  const job = writes[1][1];
  assert.equal(job.grade,9);assert.equal(job.studentClass,'9/19');assert.equal(job.pending,true);
  assert.equal(job.revision.increment,1);assert.equal(job.requestedAt.serverTimestamp,true);
  assert.deepEqual(Object.keys(job).sort(),['sourceCollection','sourceId','grade','studentClass','revision','pending','requestedAt'].sort());
  assert.equal(writes[1][2].merge,true);
  assert.equal(writes[2][0],'commit');
});
test('transaction helper supports routing from full source on merge and never changes receipt fields',()=>{
  const {archive,writes,batch} = setup('web-sandbox');
  archive.addArchiveWrite(batch,'submissions','fake',{grade:8,studentClass:'8/19'});
  assert.equal(writes.length,1);
  assert.equal(writes[0][1].revision.increment,1);
  assert.equal(writes[0][1].archivedRevision,undefined);
  assert.equal(writes[0][1].driveFileId,undefined);
});
test('local emulator writes canonical source without remote archive jobs',async()=>{
  const {archive,writes} = setup('local-sandbox');
  await archive.writeCanonical('submissions','fake',{grade:8,studentClass:'8/19'});
  assert.equal(writes.length,2);assert.equal(writes[0][0].path,'submissions/fake');
});
test('routing handles teacher reminders, global commands and shared exam banks',()=>{
  const {archive,writes,batch} = setup();
  archive.addArchiveWrite(batch,'proctor_commands','reminder-fake',{payload:{reminder:{grade:10,studentClass:'10/14'}}});
  archive.addArchiveWrite(batch,'proctor_commands','broadcast-fake',{targetSessionId:'all'});
  archive.addArchiveWrite(batch,'exam_bank','g9_fake',{grade:9});
  assert.deepEqual(writes.map(w=>[w[1].grade,w[1].studentClass]),[[10,'10/14'],[0,'all'],[9,'_DE_CHUNG']]);
});
test('invalid source and incomplete routing fail before a canonical commit',async()=>{
  const {archive,writes} = setup();
  await assert.rejects(archive.writeCanonical('exam_secrets','fake',{grade:8,studentClass:'8/19'}),/archive_source_invalid/);
  await assert.rejects(archive.writeCanonical('submissions','fake',{grade:8}),/archive_class_invalid/);
  assert.equal(writes.length,0);
});
function storageSetup() {
  const writes=[];const values=new Map();
  const localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const batch={set:(...args)=>writes.push(args),commit:async()=>{writes.push(['commit']);}};
  const context={localStorage,console,Date,Math,Map,Set,JSON,require,setTimeout,window:{addEventListener:()=>{},firebaseDb:{batch:()=>batch,collection:name=>({doc:id=>({path:name+'/'+id})})},AsianSchoolAuth:{uid:()=> 'fake-owner'}},firebase:{firestore:{FieldValue:{increment:n=>({increment:n}),serverTimestamp:()=>({serverTimestamp:true})}}}};
  vm.runInNewContext(fs.readFileSync('src/core/drive-archive.js','utf8'),context);
  context.self=context.window;
  vm.runInNewContext(fs.readFileSync('src/core/normalize.js','utf8'),context);
  vm.runInNewContext(fs.readFileSync('src/core/storage-service.js','utf8'),context);
  return {storage:context.window.AsianSchoolStorage,writes,context};
}
test('storage essay grading commits grade update with archive routing from full source',()=>{
  const {storage,writes}=storageSetup();
  storage.getSubmissions=()=>[{id:'fake-sub',uid:'fake-owner',grade:9,studentClass:'9/19',mcqPoints:6,fullName:'Du lieu gia'}];
  storage.syncRowToGoogleDrive=()=>{};
  const result=storage.gradeEssaySubmission('fake-sub',{1:1},'Nhan xet gia');
  assert.equal(result.success,true);
  assert.equal(writes[0][0].path,'submissions/fake-sub');
  assert.equal(writes[0][1].essayTotal,1);
  assert.equal(writes[1][0].path,'drive_archive_jobs/submissions_fake-sub');
  assert.equal(writes[1][1].studentClass,'9/19');
  assert.equal(writes[2][0],'commit');
});
test('storage practice enqueue creates reference job atomically without copying row content',()=>{
  const {storage,writes}=storageSetup();
  assert.equal(storage.queuePracticeResult({id:'practice-fake',grade:8,studentClass:'8/19',studentId:'999999',fullName:'Du lieu gia',score:6}),true);
  assert.equal(writes[0][0].path,'practice_results/practice-fake');
  assert.equal(writes[1][0].path,'drive_archive_jobs/practice_results_practice-fake');
  assert.equal(writes[1][1].fullName,undefined);
  assert.equal(writes[2][0],'commit');
});
test('sandbox rules stay identical to production except for verified test teacher identity',()=>{
  const production=fs.readFileSync('firestore.rules','utf8');
  const sandbox=fs.readFileSync('firestore.web-sandbox.rules','utf8').split('\n').slice(1).join('\n');
  assert.equal(sandbox,production.replace("request.auth.token.email in ['trangiahuy8444@gmail.com']","request.auth.token.email in ['admin@ahs-lms-sandbox.invalid']"));
});
test('practice processing retains source until worker acknowledges its current revision',async()=>{
  for(const job of [null,{pending:true,revision:2,archivedRevision:1},{pending:false,revision:2,archivedRevision:1},{pending:false,revision:2,archivedRevision:2}]) {
    const {storage,context}=storageSetup();
    context.window.firebaseDb.collection=()=>({doc:()=>({get:async()=>({exists:!!job,data:()=>job})})});
    storage.getConfig=()=>({googleDriveWebhookUrl:'https://example.invalid/fake',driveArchiveEnabled:true});
    storage.getPracticeSubmissions=()=>[];storage.savePracticeSubmission=()=>{};
    storage.syncRowToGoogleDrive=async()=>({success:true});
    const deleted=[];
    await storage.processPracticeQueue([{id:'fake-practice',grade:8,studentClass:'8/19'}],id=>deleted.push(id));
    assert.equal(deleted.length,job?.pending===false&&job.archivedRevision===job.revision?1:0);
  }
});
test('later archive acknowledgement permits cleanup without resending successful webhook',async()=>{
  const {storage,context}=storageSetup();let pending=true,calls=0;
  context.window.firebaseDb.collection=()=>({doc:()=>({get:async()=>({exists:true,data:()=>({pending,revision:1,archivedRevision:pending?0:1})})})});
  storage.getConfig=()=>({googleDriveWebhookUrl:'https://example.invalid/fake',driveArchiveEnabled:true});
  storage.getPracticeSubmissions=()=>[];storage.savePracticeSubmission=()=>{};
  storage.syncRowToGoogleDrive=async()=>{calls++;return {success:true};};
  const deleted=[];const rows=[{id:'fake-practice'}];
  await storage.processPracticeQueue(rows,id=>deleted.push(id));
  assert.equal(deleted.length,0);pending=false;
  await storage.processPracticeQueue(rows,id=>deleted.push(id));
  assert.equal(deleted.length,1);assert.equal(calls,1);
});
test('synchronous cleanup and reset preserve local records while Drive protection is active',async()=>{
  const {storage,context,writes}=storageSetup();
  storage.getConfig=()=>({driveArchiveEnabled:false,driveArchiveProtectDeletes:true});
  context.localStorage.setItem('asian_school_submissions_v1',JSON.stringify([{id:'fake-sub',grade:9,studentClass:'9/19'}]));
  for(const action of [()=>storage.deleteSubmission('fake-sub'),()=>storage.purgeOldExamSubmissions(),()=>storage.clearAllData(),()=>storage.resetExamAttempt({attemptId:'fake-attempt'})]) {
    const result=await action();assert.equal(result.success,false);assert.match(result.error,/Drive/);
    assert.match(context.localStorage.getItem('asian_school_submissions_v1'),/fake-sub/);
  }
  assert.equal(writes.length,0);
});

test('enabling the worker alone does not activate destructive API protection during migration',()=>{
  const {storage,context}=storageSetup();
  storage.getConfig=()=>({driveArchiveEnabled:true,driveArchiveProtectDeletes:false});
  storage.syncRowToGoogleDrive=()=>{};
  context.localStorage.setItem('asian_school_submissions_v1',JSON.stringify([{id:'fake-sub',grade:9,studentClass:'9/19'}]));
  const expectSuccess=storage.deleteSubmission('fake-sub');
  assert.equal(expectSuccess.success,true);
});

test('invalid fractional essay score is rejected without changing or archiving the grade',()=>{
  const {storage,writes}=storageSetup();
  const submission={id:'fake-sub',grade:9,studentClass:'9/19',mcqPoints:6,essayScores:{1:0.5},teacherFeedback:'Nhận xét cũ'};
  storage.getSubmissions=()=>[submission];
  const before=JSON.stringify(submission);
  const result=storage.gradeEssaySubmission('fake-sub',{1:0.88},'Không được lưu');
  assert.equal(result.success,false);
  assert.equal(JSON.stringify(submission),before);
  assert.equal(writes.length,0);
});
