const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function harness() {
  const values=new Map();let sends=0,pending=true;
  const localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const window={addEventListener(){},AsianSchoolDriveArchive:{enabled:()=>true},firebaseDb:{collection:()=>({doc:()=>({get:async()=>({exists:true,data:()=>({pending,revision:1,archivedRevision:pending?0:1})})})})}};
  const ctx={window,self:window,localStorage,console,Date,Math,Map,Set,JSON,require,setTimeout};
  vm.runInNewContext(fs.readFileSync('src/core/normalize.js','utf8'),ctx);
  function reload(config={}) {
    vm.runInNewContext(fs.readFileSync('src/core/storage-service.js','utf8'),ctx);
    const storage=window.AsianSchoolStorage;
    storage.getConfig=()=>config;
    storage.syncRowToGoogleDrive=async()=>{sends++;return {success:true};};
    return storage;
  }
  return {reload,localStorage,values,ack:()=>{pending=false;},sends:()=>sends};
}
const rows=[1,2,3].map(n=>({id:'fake-queue-'+n,grade:8,studentClass:'8/19',studentId:'999999',fullName:'Du Lieu Gia',score:n+3,attemptNumber:n,submittedAt:`2026-11-09T00:00:0${n}Z`}));
function assertAggregate(storage) {
  const aggregate=storage.getPracticeSubmissions();
  assert.equal(aggregate.length,1);assert.equal(aggregate[0].totalAttempts,3);assert.equal(aggregate[0].finalScore,6);
}
test('replaying all retained practice rows does not increase attempts, including across page reload',async()=>{
  const h=harness();let storage=h.reload();
  for(let i=0;i<4;i++){await storage.processPracticeQueue(rows);assertAggregate(storage);}
  storage=h.reload();
  for(let i=0;i<4;i++){await storage.processPracticeQueue(rows);assertAggregate(storage);}
});
test('current Drive acknowledgement cleans retained rows after reload without merging or sending webhook twice',async()=>{
  const h=harness(),config={googleDriveWebhookUrl:'https://example.invalid/fake',driveArchiveEnabled:true};
  let storage=h.reload(config);const deleted=[];
  await storage.processPracticeQueue(rows,id=>deleted.push(id));
  assert.equal(h.sends(),3);assert.equal(deleted.length,0);assertAggregate(storage);
  storage=h.reload(config);await storage.processPracticeQueue(rows,id=>deleted.push(id));
  assert.equal(h.sends(),3);assert.equal(deleted.length,0);assertAggregate(storage);
  h.ack();await storage.processPracticeQueue(rows,id=>deleted.push(id));
  assert.equal(h.sends(),3);assert.equal(deleted.length,3);assertAggregate(storage);
});
test('failed aggregate save is retried rather than recorded as processed',async()=>{
  const h=harness(),storage=h.reload();const save=storage.savePracticeSubmission.bind(storage);
  storage.savePracticeSubmission=()=>{throw new Error('local_write_failed');};
  await assert.rejects(storage.processPracticeQueue([rows[0]]),/local_write_failed/);
  storage.savePracticeSubmission=save;await storage.processPracticeQueue([rows[0]]);
  assert.equal(storage.getPracticeSubmissions()[0].totalAttempts,1);
});
test('ledger retention never forgets current source IDs beyond the recent-history cap',()=>{
  const h=harness(),storage=h.reload(),ledger=new Map();
  for(let n=0;n<2501;n++)ledger.set('active-'+n,{merged:true,webhook:false,at:n});
  for(let n=0;n<2501;n++)ledger.set('absent-'+n,{merged:true,webhook:true,at:n});
  const active=new Set([...ledger.keys()].filter(id=>id.startsWith('active-')));
  storage.savePracticeQueueLedger(ledger,active);
  const saved=storage.readPracticeQueueLedger();
  assert.equal(saved.size,4501);
  for(const id of active)assert.equal(saved.get(id).merged,true);
  assert.equal(saved.has('absent-0'),false);assert.equal(saved.has('absent-2500'),true);
});
test('overlapping snapshots share merge and webhook receipts without losing persisted IDs',async()=>{
  const h=harness(),config={googleDriveWebhookUrl:'https://example.invalid/fake',driveArchiveEnabled:true};
  let storage=h.reload(config);const finish=[];
  storage.syncRowToGoogleDrive=()=>new Promise(resolve=>finish.push(()=>resolve({success:true})));
  const first=storage.processPracticeQueue(rows);const second=storage.processPracticeQueue(rows);
  for(let n=0;n<10;n++){while(finish.length)finish.shift()();await new Promise(resolve=>setImmediate(resolve));}
  await Promise.all([first,second]);assertAggregate(storage);
  storage=h.reload(config);await storage.processPracticeQueue(rows);
  assertAggregate(storage);assert.equal(h.sends(),0);
});
