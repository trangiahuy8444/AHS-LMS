const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function harness(){
 const values=new Map();let writes=0,fail=false;
 const localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const window={AsianSchoolExamTiming:require('../src/core/exam-timing.js'),addEventListener(){},AsianSchoolAuth:{uid:()=> 'fake-owner'},firebaseDb:{collection:()=>({doc:()=>({set:async()=>{writes++;if(fail)throw Error('fake-offline');}})})}};
 const ctx={window,self:window,localStorage,console,Date,Math,Map,Set,JSON,require,setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync('src/core/normalize.js','utf8'),ctx);
 vm.runInNewContext(fs.readFileSync('src/core/storage-service.js','utf8'),ctx);
 const storage=window.AsianSchoolStorage;storage.getConfig=()=>({});
 return {storage,values,localStorage,window,writes:()=>writes,setFail:x=>fail=x};
}
const row=(id,score=7)=>({id,mode:'practice',studentId:'999999',fullName:'Hoc Sinh Gia',studentClass:'8/19',grade:8,score,finalScore:score,mcqPoints:score,maxScore:7,submittedAt:'2026-11-11T01:00:00Z',answers:{mcq:{1:1},tf:{},essay:{1:'Original response'}},practiceSet:{mcqQuestions:[{id:1,question:'Synthetic',options:['left','right'],correctAnswer:1}],tfQuestions:[],essayQuestions:[{num:1,question:'Synthetic essay'}]}});
test('a lower retake remains a full independent immutable attempt while gradebook keeps highest score',()=>{
 const {storage}=harness();const first=row('fake-a'),second=row('fake-b',4);storage.savePracticeSubmission(first);storage.savePracticeSubmission(second);
 first.answers.essay[1]='mutated';storage.savePracticeSubmission({...row('fake-a'),answers:{mcq:{},tf:{},essay:{}}});
 const attempts=storage.getPracticeAttempts();assert.equal(attempts.length,2);assert.equal(attempts.find(s=>s.id==='fake-a').answers.essay[1],'Original response');assert.equal(storage.getPracticeSubmissions()[0].finalScore,7);
});
test('cloud queue includes exact shuffled questions and answers and keeps failed row for retry',async()=>{
 const h=harness();h.setFail(true);h.storage.queuePracticeResult(row('fake-a'));await h.storage.flushPracticePending();assert.equal(h.storage.getPracticePending().length,1);
 const queued=h.storage.getPracticePending()[0];assert.equal(queued.answers.essay[1],'Original response');assert.equal(queued.practiceSet.mcqQuestions[0].options[1],'right');
 h.setFail(false);await h.storage.flushPracticePending();assert.equal(h.storage.getPracticePending().length,0);assert(h.writes()>=2);
});
test('full cloud rows survive successful Sheets sync without a verified full archive',async()=>{
 const h=harness();h.storage.getConfig=()=>({googleDriveWebhookUrl:'https://example.invalid'});h.storage.syncRowToGoogleDrive=async()=>({success:true});const deleted=[];
 await h.storage.processPracticeQueue([row('fake-a')],id=>deleted.push(id));assert.equal(deleted.length,0);assert.equal(h.storage.getPracticeAttempts().length,1);
});
test('v2 export/import includes practice-only data and rejects a malformed bundle before mutation',()=>{
 const h=harness();h.storage.savePracticeSubmission(row('fake-a'));const backup=h.storage.exportSubmissionsJSON();const parsed=JSON.parse(backup);assert.equal(parsed.version,2);assert.equal(parsed.practiceAttempts.length,1);
 const other=harness();assert.equal(other.storage.importSubmissionsJSON(backup).success,true);assert.equal(other.storage.getPracticeAttempts().length,1);assert.equal(other.storage.importSubmissionsJSON(backup).added,0);
 const before=other.storage.exportSubmissionsJSON();parsed.practiceAttempts.push({id:'bad'});assert.equal(other.storage.importSubmissionsJSON(JSON.stringify(parsed)).success,false);assert.equal(other.storage.exportSubmissionsJSON(),before);
 assert.match(h.storage.exportSubmissionsCSV(),/Ôn Tập Đề Cương/);
});
test('legacy arrays route practice into practice storage without merging it into official exams',()=>{
 const h=harness();assert.equal(h.storage.importSubmissionsJSON(JSON.stringify([row('fake-a')])).success,true);assert.equal(h.storage.getSubmissions().length,0);assert.equal(h.storage.getPracticeAttempts().length,1);
});
test('a pending submission arriving during another upload is drained in the same flush',async()=>{
 const h=harness();let finish;const sent=[];h.window.firebaseDb={collection:()=>({doc:id=>({set:async()=>{sent.push(id);if(id==='fake-a')await new Promise(resolve=>{finish=resolve;});}})})};
 h.storage.queuePracticeResult(row('fake-a'));h.storage.queuePracticeResult(row('fake-b'));finish();await h.storage.flushPracticePending();assert.equal(sent.join(','),'fake-a,fake-b');assert.equal(h.storage.getPracticePending().length,0);
});
test('legacy detail is enriched only when identity, time and answers prove the same attempt',()=>{
 const {storage}=harness();const old=row('fake-a');delete old.practiceSet;storage.savePracticeAttempt(old);storage.savePracticeAttempt({...row('fake-a'),submittedAt:'2026-11-11T02:00:00Z'});assert.equal(storage.getPracticeAttempts()[0].practiceSet,undefined);storage.savePracticeAttempt(row('fake-a'));assert.equal(storage.getPracticeAttempts()[0].practiceSet.mcqQuestions[0].options[1],'right');
});
test('invalid nested question or answer blocks an entire import',()=>{
 const h=harness();const payload={format:'ahs-submissions-backup',version:2,submissions:[],practiceSubmissions:[],practiceAttempts:[row('fake-a')]};payload.practiceAttempts[0].practiceSet.mcqQuestions=[null];assert.equal(h.storage.importSubmissionsJSON(JSON.stringify(payload)).success,false);assert.equal(h.storage.getPracticeAttempts().length,0);
 payload.practiceAttempts=[{...row('fake-b'),answers:{mcq:[],tf:{},essay:{}}}];assert.equal(h.storage.importSubmissionsJSON(JSON.stringify(payload)).success,false);
});
test('history-only v2 import creates one best gradebook summary and CSV row per student',()=>{
 const h=harness();const payload={format:'ahs-submissions-backup',version:2,submissions:[],practiceSubmissions:[],practiceAttempts:[row('fake-a',4),row('fake-b',7)]};
 assert.equal(h.storage.importSubmissionsJSON(JSON.stringify(payload)).success,true);assert.equal(h.storage.getPracticeSubmissions().length,1);assert.equal(h.storage.getPracticeSubmissions()[0].finalScore,7);assert.equal(h.storage.getPracticeAttempts().length,2);
 const csv=h.storage.exportSubmissionsCSV();assert.equal(csv.split('\r\n').length,2);assert.match(csv,/Ôn Tập Đề Cương/);
});
test('CSV deduplicates legacy, summary and detailed practice sources by student identity',()=>{
 const h=harness();h.localStorage.setItem('asian_school_submissions_v1',JSON.stringify([row('fake-legacy-a',4),row('fake-legacy-b',5)]));h.storage.savePracticeSubmission(row('fake-summary',6));h.storage.savePracticeAttempt(row('fake-detail',7));
 const csv=h.storage.exportSubmissionsCSV();const lines=csv.split('\r\n');assert.equal(lines.length,2);assert.equal((lines[1].match(/Hoc Sinh Gia/g)||[]).length,1);assert.match(lines[1],/,7,/);assert.match(lines[0],/Thang Điểm/);
});
