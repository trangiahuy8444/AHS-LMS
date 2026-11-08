const {test,before,after,beforeEach} = require('node:test');
const fs = require('node:fs');
const {initializeTestEnvironment,assertSucceeds,assertFails} = require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp,increment} = require('node:module').createRequire(require.resolve('@firebase/rules-unit-testing'))('firebase/firestore');
let env,sandbox;
const teacherEmail='trangiahuy8444@gmail.com';
const fakeEmail='admin@ahs-lms-sandbox.invalid';
const teacher=(e=env,email=teacherEmail,verified=true)=>e.authenticatedContext('teacher',{email,email_verified:verified}).firestore();
const student=()=>env.authenticatedContext('owner').firestore();
function job(extra={}) {return {sourceCollection:'submissions',sourceId:'fake-source',grade:9,studentClass:'9/19',revision:increment(1),pending:true,requestedAt:serverTimestamp(),...extra};}
before(async()=>{
  if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080') throw new Error('Requires local Firestore emulator');
  env=await initializeTestEnvironment({projectId:'demo-ahs-archive',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firestore.rules','utf8')}});
  sandbox=await initializeTestEnvironment({projectId:'demo-ahs-archive-sandbox',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firestore.web-sandbox.rules','utf8')}});
});
after(async()=>{if(env)await env.cleanup();if(sandbox)await sandbox.cleanup();});
beforeEach(async()=>{
  await env.clearFirestore();await sandbox.clearFirestore();
  for(const e of [env,sandbox]) await e.withSecurityRulesDisabled(async ctx=>{
    const d=ctx.firestore();
    await setDoc(doc(d,'exam_config/global_config'),{allowStudentReviewOfficialExam:false});
    await setDoc(doc(d,'submissions/fake-source'),{uid:'owner',grade:9,studentClass:'9/19',finalScore:7});
    await setDoc(doc(d,'exam_bank/fake'),{grade:9,exam:{fake:true}});
  });
});
test('owner can enqueue matching canonical source; other owner and unauthenticated are denied',async()=>{
  await assertSucceeds(setDoc(doc(student(),'drive_archive_jobs/submissions_fake-source'),job()));
  await assertFails(setDoc(doc(env.authenticatedContext('other').firestore(),'drive_archive_jobs/submissions_fake-source'),job(),{merge:true}));
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(),'drive_archive_jobs/submissions_fake-source'),job()));
});
test('source and job can be created atomically and mismatching class denies the entire commit',async()=>{
  const db=teacher();let batch=writeBatch(db);
  batch.set(doc(db,'exam_bank/new-fake'),{grade:8,exam:{fake:true}});
  batch.set(doc(db,'drive_archive_jobs/exam_bank_new-fake'),job({sourceCollection:'exam_bank',sourceId:'new-fake',grade:8,studentClass:'_DE_CHUNG'}));
  await assertSucceeds(batch.commit());
  batch=writeBatch(db);batch.update(doc(db,'submissions/fake-source'),{finalScore:8});
  batch.set(doc(db,'drive_archive_jobs/submissions_fake-source'),job({studentClass:'8/19'}));
  await assertFails(batch.commit());
  const source=await getDoc(doc(db,'submissions/fake-source'));if(source.data().finalScore!==7)throw new Error('Nonatomic source change');
});
test('invalid job ids, unsupported sources, timestamps and revisions are rejected',async()=>{
  const d=student();
  for(const patch of [{grade:8},{sourceId:'missing'},{sourceCollection:'exam_secrets'},{revision:4},{requestedAt:new Date(0)}])
    await assertFails(setDoc(doc(d,'drive_archive_jobs/submissions_fake-source'),job(patch)));
  await assertFails(setDoc(doc(d,'drive_archive_jobs/wrong-id'),job()));
});
test('workers retain exclusive acknowledgement; retries increment revision while preserving receipt',async()=>{
  await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),'drive_archive_jobs/submissions_fake-source'),{...job(),revision:1,pending:false,archivedRevision:1,driveFileId:'receipt-private'}));
  await assertFails(updateDoc(doc(student(),'drive_archive_jobs/submissions_fake-source'),{...job(),archivedRevision:2}));
  await assertFails(setDoc(doc(teacher(),'drive_archive_jobs/submissions_fake-source'),{...job(),driveFileId:'forged'},{merge:true}));
  await assertSucceeds(setDoc(doc(student(),'drive_archive_jobs/submissions_fake-source'),job(),{merge:true}));
  const receipt=(await getDoc(doc(teacher(),'drive_archive_jobs/submissions_fake-source'))).data();
  if(receipt.revision!==2||receipt.archivedRevision!==1||receipt.driveFileId!=='receipt-private'||!receipt.pending)throw new Error('Receipt not preserved');
});
test('archive pointers and worker status are teacher-readable and never client-writable acknowledgements',async()=>{
  await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),'drive_archive_status/worker'),{rootFolderId:'private'}));
  await assertFails(getDoc(doc(student(),'drive_archive_status/worker')));
  await assertSucceeds(getDoc(doc(teacher(),'drive_archive_status/worker')));
  await assertFails(setDoc(doc(teacher(),'drive_archive_status/worker'),{lastSuccessAt:serverTimestamp()}));
  await assertFails(getDoc(doc(student(),'drive_archive_jobs/submissions_fake-source')));
});
test('sandbox grants only verified fake teacher alias and never production staff email',async()=>{
  await assertSucceeds(getDoc(doc(teacher(sandbox,fakeEmail),'exam_bank/fake')));
  await assertFails(getDoc(doc(teacher(sandbox,teacherEmail),'exam_bank/fake')));
  await assertFails(getDoc(doc(teacher(sandbox,fakeEmail,false),'exam_bank/fake')));
  await assertFails(getDoc(doc(teacher(env,fakeEmail),'exam_bank/fake')));
});

test('archive protection permits legacy deletion while disabled and requires current worker receipt when enabled',async()=>{
  const d=teacher();
  await setDoc(doc(d,'exam_config/global_config'),{driveArchiveEnabled:true,driveArchiveProtectDeletes:false});
  await assertSucceeds(deleteDoc(doc(d,'submissions/fake-source')));
  await env.withSecurityRulesDisabled(async ctx=>{
    const admin=ctx.firestore();
    await setDoc(doc(admin,'submissions/fake-source'),{uid:'owner',grade:9,studentClass:'9/19'});
    await setDoc(doc(admin,'exam_config/global_config'),{driveArchiveEnabled:true,driveArchiveProtectDeletes:true});
  });
  await assertFails(deleteDoc(doc(d,'submissions/fake-source')));
  for(const receipt of [{revision:2,archivedRevision:1,pending:true},{revision:2,archivedRevision:1,pending:false}]) {
    await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),'drive_archive_jobs/submissions_fake-source'),receipt));
    await assertFails(deleteDoc(doc(d,'submissions/fake-source')));
  }
  await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),'drive_archive_jobs/submissions_fake-source'),{revision:2,archivedRevision:2,pending:false}));
  await assertSucceeds(deleteDoc(doc(d,'submissions/fake-source')));
});
