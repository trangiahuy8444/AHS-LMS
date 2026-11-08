const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../scripts/drive-archive/ArchiveEngine.js');
const config = {projectId:'ahs-lms-sandbox',schoolYear:'2026-2027',period:'GK1',rootFolderId:'fake-root-folder-id'};
const job = {name:'projects/ahs-lms-sandbox/databases/(default)/documents/drive_archive_jobs/submissions_fake-1',updateTime:'2026-11-08T12:00:00.000001Z',data:{sourceCollection:'submissions',sourceId:'fake-1',grade:9,studentClass:'9/20',revision:2,pending:true}};
const source = {updateTime:'2026-11-08T12:00:00.000002Z',data:{grade:9,studentClass:'9/20',studentId:'990001',fullName:'Học Sinh Giả',answers:{mcq:{1:0},tf:{1:{a:true,b:false}},essay:{1:'Bài tự luận giả.'}},essayScores:{1:0.5},teacherFeedback:'Nhận xét giả.',violations:3,teacherReminder:{message:'Nhắc nhở giả',count:2},startedAt:'2026-11-08T11:00:00Z',serverSubmittedAt:'2026-11-08T11:45:00Z',durationMinutes:45,extraTimeSeconds:300,finalScore:7.5,examPassword:'must-not-leak',nested:{accessToken:'must-not-leak',keep:'value'}}};
function fixture(overrides={}) {
  const calls=[];
  const adapter={listPending:()=>[job],readSource:()=>source,writeArchive:envelope=>{calls.push(['write',envelope]);return{folderId:'folder-id',jsonFileId:'file-id',spreadsheetId:'sheet-id'};},acknowledge:(j,receipt)=>{calls.push(['ack',j,receipt]);return true;},saveCursor:name=>calls.push(['cursor',name]),...overrides};
  return{calls,adapter};
}
test('full exam archive keeps answers, grading, timing, violations and reminders under its class',()=>{
 const envelope=Engine.buildEnvelope(config,job,source,'2026-11-08T12:01:00Z');
 assert.deepEqual(envelope.data.answers,source.data.answers);
 assert.deepEqual(envelope.data.essayScores,{1:0.5});
 assert.equal(envelope.data.teacherFeedback,'Nhận xét giả.');
 assert.equal(envelope.data.teacherReminder.count,2);
 assert.equal(envelope.data.extraTimeSeconds,300);
 assert.deepEqual(envelope.folderSegments,['Thu_Nghiem','2026-2027','GK1','Khoi_9','Lop_9_20']);
 assert.ok(!JSON.stringify(envelope).includes('must-not-leak'));
 assert.equal(source.data.examPassword,'must-not-leak');
});
test('worker writes JSON and sheet before ack and uses exact original revision snapshot',async()=>{
 const{adapter,calls}=fixture();
 const result=await Engine.runBatch(config,adapter);
 assert.equal(result.archived,1);
 assert.deepEqual(calls.map(c=>c[0]),['write','ack','cursor']);
 assert.equal(calls[1][1].updateTime,job.updateTime);
 assert.equal(calls[1][1].data.revision,2);
});
test('failed Drive write leaves work unacknowledged and moves cursor so a poison job cannot starve others',async()=>{
 const{adapter,calls}=fixture({writeArchive:()=>{throw{code:'drive_unavailable'};}});
 const result=await Engine.runBatch(config,adapter);
 assert.equal(result.failed,1);
 assert.ok(!calls.some(c=>c[0]==='ack'));
 assert.equal(calls.at(-1)[0],'cursor');
 assert.ok(!JSON.stringify(result).includes('990001'));
});
test('concurrent source amendment leaves pending revision for another pass',async()=>{
 const{adapter}=fixture({acknowledge:()=>false});
 const result=await Engine.runBatch(config,adapter);
 assert.equal(result.conflicts,1);
 assert.equal(result.archived,0);
});
test('secret collections, wrong projects and class mismatch are rejected before archive writes',async()=>{
 assert.throws(()=>Engine.buildEnvelope(config,{...job,data:{...job.data,sourceCollection:'exam_secrets'}},source));
 assert.throws(()=>Engine.buildEnvelope({...config,projectId:'unrecognized-project'},job,source));
 assert.throws(()=>Engine.buildEnvelope(config,job,{...source,data:{...source.data,studentClass:'8/19'}}));
 const{adapter,calls}=fixture({listPending:()=>[{...job,data:{...job.data,sourceCollection:'exam_keys'}}]});
 const result=await Engine.runBatch(config,adapter);
 assert.equal(result.failed,1);
 assert.ok(!calls.some(c=>c[0]==='write'));
});
test('summary text cannot execute a spreadsheet formula',()=>{
 assert.equal(Engine.safeCell('=IMPORTXML("fake")'),"'=IMPORTXML(\"fake\")");
 assert.equal(Engine.safeCell('  +SUM(1,2)'),"'  +SUM(1,2)");
 assert.equal(Engine.safeCell(7.5),7.5);
});
test('time budget stops before another job without acknowledging skipped records',async()=>{
 let n=0;
 const{adapter,calls}=fixture({listPending:()=>[job,{...job,name:job.name+'2'}]});
 const result=await Engine.runBatch(config,adapter,{now:()=>++n===1?0:300000,budgetMs:240000});
 assert.equal(result.archived,0);
 assert.equal(calls.length,0);
 assert.equal(result.budgetReached,true);
});

test('oversized teacher comments are shortened only in Sheet cells, with full JSON unchanged',()=>{
 const long='x'.repeat(60000);
 const envelope=Engine.buildEnvelope(config,job,{...source,data:{...source.data,teacherFeedback:long}});
 assert.equal(envelope.data.teacherFeedback.length,60000);
 assert.ok(Engine.safeCell(long).length<=49000);
 assert.match(Engine.safeCell(long),/JSON/);
});

const fs=require('node:fs');
const vm=require('node:vm');
function gasContext(status=200,responseBody={writeResults:[]}) {
 const requests=[];
 const context=vm.createContext({AHSArchiveEngine:Engine,ScriptApp:{getOAuthToken:()=> 'fake-not-real-token'},UrlFetchApp:{fetch:(url,options)=>{requests.push([url,options]);return{getResponseCode:()=>status,getContentText:()=>JSON.stringify(responseBody)};}}});
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../scripts/drive-archive/Code.gs'),'utf8'),context);
 return{context,requests};
}
test('Apps Script acknowledgment patches receipt fields with the original job updateTime precondition',()=>{
 const{context,requests}=gasContext();
 assert.equal(context.ahsAcknowledge(config,job,{folderId:'folder',jsonFileId:'json',spreadsheetId:'sheet'}),true);
 const[url,options]=requests[0];
 assert.equal(url,'https://firestore.googleapis.com/v1/projects/ahs-lms-sandbox/databases/(default)/documents:commit');
 const write=JSON.parse(options.payload).writes[0];
 assert.deepEqual(write.currentDocument,{updateTime:job.updateTime});
 assert.equal(write.update.fields.archivedRevision.integerValue,'2');
 assert.equal(write.update.fields.pending.booleanValue,false);
 assert.ok(!write.updateMask.fieldPaths.includes('sourceCollection'));
 assert.ok(!write.updateMask.fieldPaths.includes('revision'));
});
test('Apps Script recognizes a failed revision precondition without leaking server response content',()=>{
 const{context}=gasContext(400,{error:{status:'FAILED_PRECONDITION',message:'private answer must not escape'}});
 assert.equal(context.ahsAcknowledge(config,job,{jsonFileId:'json',spreadsheetId:'sheet'}),false);
});
test('pending query rotates after a failed job using a document-name cursor',()=>{
 const{context}=gasContext();
 const query=context.ahsPendingQuery(job.name,25).structuredQuery;
 assert.equal(query.limit,25);
 assert.equal(query.where.fieldFilter.field.fieldPath,'pending');
 assert.equal(query.startAt.before,false);
 assert.equal(query.startAt.values[0].referenceValue,job.name);
});
test('Apps Script upsert updates an existing source id rather than appending a duplicate on regrade',()=>{
 const{context}=gasContext();
 const writes=[];
 const sheet={getLastRow:()=>4,getRange:(...range)=>({createTextFinder:value=>({matchEntireCell:flag=>({findNext:()=>({getRow:()=>2})})}),setValues:values=>writes.push([range,values])})};
 context.ahsUpsertRow(sheet,['submissions/fake-1',7.5]);
 assert.deepEqual(JSON.parse(JSON.stringify(writes)),[[[2,1,1,2],[['submissions/fake-1',7.5]]]]);
});
test('Firestore adapters preserve false, zero, timestamps and large integers safely',()=>{
 const{context}=gasContext();
 const decoded=context.ahsDecodeFields({zero:{integerValue:'0'},no:{booleanValue:false},stamp:{timestampValue:'2026-11-08T12:00:00.123456Z'},large:{integerValue:'9007199254740993'},nested:{arrayValue:{values:[{mapValue:{fields:{text:{stringValue:'essay'}}}}]}}});
 assert.equal(decoded.zero,0);
 assert.equal(decoded.no,false);
 assert.equal(decoded.large,'9007199254740993');
 assert.equal(decoded.stamp,'2026-11-08T12:00:00.123456Z');
 assert.equal(decoded.nested[0].text,'essay');
});

test('worker refuses publicly shared destinations instead of leaking new exam data',()=>{
 const{context}=gasContext();
 context.DriveApp={Access:{PRIVATE:'PRIVATE'}};
 assert.throws(()=>context.ahsAssertPrivate({getSharingAccess:()=> 'ANYONE'}));
 assert.doesNotThrow(()=>context.ahsAssertPrivate({getSharingAccess:()=> 'PRIVATE'}));
});
test('install bundle includes private worker, engine and explicit OAuth manifest without a public endpoint',()=>{
 const{projectFiles}=require('../scripts/drive-archive/build-bundle.cjs');
 const files=projectFiles();
 assert.deepEqual(files.map(file=>file.name),['ArchiveEngine','Code','appsscript']);
 assert.ok(!files[1].source.includes('function doPost'));
 assert.ok(!files[1].source.includes('function doGet'));
 const scopes=JSON.parse(files[2].source).oauthScopes;
 assert.ok(scopes.includes('https://www.googleapis.com/auth/datastore'));
 assert.ok(scopes.includes('https://www.googleapis.com/auth/script.scriptapp'));
 assert.throws(()=>projectFiles({projectId:'other-project'}));
});

test('archive bundle accepts a validated pre-created private root folder id',()=>{
 const{projectFiles}=require('../scripts/drive-archive/build-bundle.cjs');
 const files=projectFiles({rootFolderId:'fake-private-folder-id'});
 assert.match(files[1].source,/"rootFolderId":"fake-private-folder-id"/);
 assert.throws(()=>projectFiles({rootFolderId:'../../other'}));
});

test('installer reuses the configured private folder instead of creating a duplicate root',()=>{
 const{context}=gasContext();
 const properties=new Map();
 const calls=[];
 const folder={getId:()=> 'fake-precreated-root-id',getSharingAccess:()=> 'PRIVATE'};
 context.AHS_ARCHIVE_SETTINGS={projectId:'ahs-lms-sandbox',schoolYear:'2026-2027',period:'GK1',rootFolderId:'fake-precreated-root-id'};
 context.PropertiesService={getScriptProperties:()=>({getProperty:key=>properties.get(key)||null,setProperty:(key,value)=>properties.set(key,value)})};
 context.DriveApp={Access:{PRIVATE:'PRIVATE'},Permission:{NONE:'NONE'},getFolderById:id=>{calls.push(['existing',id]);return folder;},createFolder:()=>{throw new Error('must not create a duplicate');}};
 context.ScriptApp={getOAuthToken:()=> 'fake-not-real-token',getProjectTriggers:()=>[],newTrigger:name=>({timeBased:()=>({everyMinutes:minutes=>({create:()=>calls.push(['trigger',name,minutes])})})})};
 context.runDriveArchive=()=>calls.push(['run']);
 context.installDriveArchive();
 assert.deepEqual(calls,[['existing','fake-precreated-root-id'],['trigger','runDriveArchive',5],['run']]);
 const stored=JSON.parse(properties.get('AHS_ARCHIVE_CONFIG_V1'));
 assert.equal(stored.rootFolderId,'fake-precreated-root-id');
});

test('installer enables automatic archiving by patching only driveArchiveEnabled after infrastructure is ready',()=>{
 const{context,requests}=gasContext(200,{fields:{otherSetting:{stringValue:'keep'}}});
 context.ahsEnableArchive(config);
 assert.equal(requests[0][1].method,'get');
 const patch=JSON.parse(requests[1][1].payload).writes[0];
 assert.deepEqual(patch.updateMask.fieldPaths,['driveArchiveEnabled']);
 assert.deepEqual(patch.currentDocument,{exists:true});
 assert.equal(patch.update.fields.driveArchiveEnabled.booleanValue,true);
 assert.equal(Object.keys(patch.update.fields).length,1);
});
test('installer does not rewrite configuration when automatic archiving is already enabled',()=>{
 const{context,requests}=gasContext(200,{fields:{driveArchiveEnabled:{booleanValue:true}}});
 context.ahsEnableArchive(config);
 assert.equal(requests.length,1);
});

test('multi-project bundle installs both isolated configs with one trigger and preserves per-project cursors',()=>{
 const{projectFiles}=require('../scripts/drive-archive/build-bundle.cjs');
 const files=projectFiles({projects:['ahs-lms','ahs-lms-sandbox'],rootFolderId:'fake-shared-private-root'});
 const properties=new Map([
  ['AHS_ARCHIVE_CURSOR_V1:ahs-lms','keep-prod-cursor'],
  ['AHS_ARCHIVE_CURSOR_V1:ahs-lms-sandbox','keep-trial-cursor'],
  ['AHS_ARCHIVE_BACKFILL_V1:ahs-lms',JSON.stringify({collectionIndex:2,afterName:'keep-prod',complete:false})],
  ['AHS_ARCHIVE_BACKFILL_V1:ahs-lms-sandbox',JSON.stringify({collectionIndex:3,afterName:'keep-trial',complete:false})]
 ]);
 const calls=[],requests=[];
 const context=vm.createContext({AHSArchiveEngine:Engine,UrlFetchApp:{fetch:(url,options)=>{assert.ok(calls.some(call=>call[0]==='trigger'));requests.push([url,options]);return{getResponseCode:()=>200,getContentText:()=>JSON.stringify({fields:{}})};}},PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties.get(key)||null,setProperty:(key,value)=>properties.set(key,value)})},DriveApp:{Access:{PRIVATE:'PRIVATE'},getFolderById:id=>({getId:()=>id,getSharingAccess:()=> 'PRIVATE'}),createFolder:()=>{throw new Error('duplicate root');}},ScriptApp:{getOAuthToken:()=> 'fake-not-real-token',getProjectTriggers:()=>[],newTrigger:name=>({timeBased:()=>({everyMinutes:minutes=>({create:()=>calls.push(['trigger',name,minutes])})})})}});
 vm.runInContext(files.find(file=>file.name==='Code').source,context);
 context.runDriveArchive=()=>calls.push(['run']);
 context.installDriveArchive();
 for(const project of ['ahs-lms','ahs-lms-sandbox']) {
  const stored=JSON.parse(properties.get('AHS_ARCHIVE_CONFIG_V1:'+project));
  assert.equal(stored.projectId,project);
  assert.equal(stored.rootFolderId,'fake-shared-private-root');
 }
 assert.equal(properties.get('AHS_ARCHIVE_CURSOR_V1:ahs-lms'),'keep-prod-cursor');
 assert.equal(properties.get('AHS_ARCHIVE_CURSOR_V1:ahs-lms-sandbox'),'keep-trial-cursor');
 assert.equal(JSON.parse(properties.get('AHS_ARCHIVE_BACKFILL_V1:ahs-lms')).afterName,'keep-prod');
 assert.equal(JSON.parse(properties.get('AHS_ARCHIVE_BACKFILL_V1:ahs-lms-sandbox')).afterName,'keep-trial');
 assert.deepEqual(calls,[['trigger','runDriveArchive',5],['run']]);
 const writes=requests.filter(([,options])=>options.method==='post');
 assert.equal(writes.length,2);
 assert.ok(writes.every(([,options])=>JSON.parse(options.payload).writes[0].update.fields.driveArchiveEnabled.booleanValue===true));
 assert.ok(writes.every(([,options])=>!Object.hasOwn(JSON.parse(options.payload).writes[0].update.fields,'driveArchiveProtectDeletes')));
});
test('multi-project dispatcher budgets a single trigger run across both projects and never enables deletion by default',()=>{
 const{projectFiles}=require('../scripts/drive-archive/build-bundle.cjs');
 const files=projectFiles({projects:['ahs-lms','ahs-lms-sandbox'],rootFolderId:'fake-shared-private-root'});
 const context=vm.createContext({AHSArchiveEngine:Engine});
 vm.runInContext(files.find(file=>file.name==='Code').source,context);
 const runs=[];
 context.runDriveArchiveForProject=()=>runs.push({project:context.AHS_ARCHIVE_SETTINGS.projectId,budget:context.AHS_ARCHIVE_SETTINGS.runBudgetMs,key:context.AHS_ARCHIVE_CONFIG_KEY,protection:context.AHS_ARCHIVE_SETTINGS.activateDeletionProtection});
 context.runDriveArchive();
 assert.deepEqual(runs.map(run=>run.project),['ahs-lms','ahs-lms-sandbox']);
 assert.ok(runs[0].budget<=105000);
 assert.ok(runs[1].budget<=210000);
 assert.ok(runs.every(run=>run.protection===false));
 assert.notEqual(runs[0].key,runs[1].key);
});

test('worker installation enables automatic archiving but preserves existing deletion protection by default',()=>{
 const{context,requests}=gasContext(200,{fields:{driveArchiveProtectDeletes:{booleanValue:true}}});
 context.ahsEnableArchive(config,false);
 const fields=JSON.parse(requests[1][1].payload).writes[0].update.fields;
 assert.equal(fields.driveArchiveEnabled.booleanValue,true);
 assert.ok(!Object.hasOwn(fields,'driveArchiveProtectDeletes'));
});
test('explicit deletion protection activation sets its own field even if automatic archiving is already enabled',()=>{
 const{context,requests}=gasContext(200,{fields:{driveArchiveEnabled:{booleanValue:true}}});
 context.ahsEnableArchive(config,true);
 assert.equal(requests.length,2);
 const patch=JSON.parse(requests[1][1].payload).writes[0];
 assert.equal(patch.update.fields.driveArchiveProtectDeletes.booleanValue,true);
 assert.deepEqual(patch.updateMask.fieldPaths,['driveArchiveProtectDeletes']);
 assert.ok(!Object.hasOwn(patch.update.fields,'driveArchiveEnabled'));
});
