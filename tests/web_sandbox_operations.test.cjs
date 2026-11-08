const test = require('node:test');
const assert = require('node:assert/strict');
const {assertWebSandboxTarget,seedWebSandbox,buildWebSeedDocuments} = require('../scripts/web-sandbox/seed.cjs');
const {validateDeployment,deployArguments} = require('../scripts/web-sandbox/deploy.cjs');
const config = require('../firebase.web-sandbox.json');

test('web sandbox only accepts the dedicated sandbox Firebase project and exact Firestore origin', () => {
  assert.doesNotThrow(()=>assertWebSandboxTarget({projectId:'ahs-lms-sandbox',origin:'https://firestore.googleapis.com'}));
  for(const target of [{projectId:'ahs-lms',origin:'https://firestore.googleapis.com'},{projectId:'ahs-lms-sandbox',origin:'https://firestore.googleapis.com.evil.test'},{projectId:'demo-ahs-local',origin:'http://127.0.0.1:8188'}]) assert.throws(()=>assertWebSandboxTarget(target));
});
test('cloud fake seed generates a fresh room secret only in private room document', () => {
  const a=buildWebSeedDocuments(),b=buildWebSeedDocuments();
  const secret=a['exam_secrets/room'].examPassword;
  assert.match(secret,/^[0-9a-f]{48}$/);
  assert.notEqual(secret,b['exam_secrets/room'].examPassword);
  assert.equal(Object.keys(a).filter(name=>name.startsWith('exam_bank/')).length,12);
  const rest={...a};delete rest['exam_secrets/room'];
  assert.ok(!JSON.stringify(rest).includes(secret));
  assert.ok(!JSON.stringify(a).includes('sandbox-local'));
});
test('existing web bootstrap means seed performs no write and does not change room password', async () => {
  const requests=[];
  const result=await seedWebSandbox({getToken:async()=>'fake-not-real-token',fetchImpl:async(url,opts)=>{requests.push([url,opts]);return{ok:true,status:200};}});
  assert.equal(result.created,false);
  assert.equal(requests.length,1);
  assert.equal(requests[0][1].method,'GET');
});
test('first web seed preserves existing config and uses create-only atomic writes', async () => {
  const requests=[];
  const result=await seedWebSandbox({getToken:async()=>'fake-not-real-token',fetchImpl:async(url,opts)=>{
    requests.push([url,opts]);
    if(opts.method==='POST')return{ok:true,status:200};
    return{ok:url.endsWith('/exam_config/global_config'),status:url.endsWith('/exam_config/global_config')?200:404};
  }});
  assert.equal(result.created,true);
  const [url,opts]=requests.find(([url])=>url.endsWith('/documents:commit'));
  assert.ok(url.includes('/projects/ahs-lms-sandbox/'));
  const writes=JSON.parse(opts.body).writes;
  assert.ok(writes.every(write=>write.currentDocument.exists===false));
  assert.ok(!writes.some(write=>write.update.name.endsWith('/exam_config/global_config')));
  assert.ok(!JSON.stringify(result).includes('fake-not-real-token'));
  assert.ok(!JSON.stringify(result).includes('examPassword'));
});
test('deploy refuses production target, wrong hosting folder, or unmarked builds', () => {
  const marker={mode:'sandbox-web',projectId:'ahs-lms-sandbox'};
  assert.doesNotThrow(()=>validateDeployment({projectId:'ahs-lms-sandbox',config,marker}));
  assert.throws(()=>validateDeployment({projectId:'ahs-lms',config,marker}));
  assert.throws(()=>validateDeployment({projectId:'ahs-lms-sandbox',config:{...config,hosting:{...config.hosting,public:'dist'}},marker}));
  assert.throws(()=>validateDeployment({projectId:'ahs-lms-sandbox',config,marker:{mode:'production',projectId:'ahs-lms'}}));
  assert.throws(()=>validateDeployment({projectId:'ahs-lms-sandbox',config,marker:null}));
  const args=deployArguments('/repo/firebase.web-sandbox.json');
  assert.deepEqual(args,['deploy','--project','ahs-lms-sandbox','--config','/repo/firebase.web-sandbox.json','--only','hosting,firestore:rules','--non-interactive']);
});

test('unsafe cloud target is rejected before asking for credentials or making requests', async () => {
  let credentialCalls=0,requestCalls=0;
  await assert.rejects(()=>seedWebSandbox({projectId:'ahs-lms',getToken:async()=>{credentialCalls++;return 'fake';},fetchImpl:async()=>{requestCalls++;}}));
  assert.equal(credentialCalls,0);
  assert.equal(requestCalls,0);
});

test('trial deployment explicitly requires its own rules and refuses production rules',()=>{
 const marker={mode:'sandbox-web',projectId:'ahs-lms-sandbox'};
 assert.equal(config.firestore.rules,'firestore.web-sandbox.rules');
 assert.throws(()=>validateDeployment({projectId:'ahs-lms-sandbox',config:{...config,firestore:{rules:'firestore.rules'}},marker}));
});
test('shared trial account uses project-bound password transformation and create-only password setup',async()=>{
 const {provisionTrialAccount,firebaseTrialPassword,TRIAL_EMAIL}=require('../scripts/web-sandbox/trial-account.cjs');
 const calls=[];
 const authClient={app:{options:{projectId:'ahs-lms-sandbox'}},getUserByEmail:async email=>{calls.push(['get',email]);throw{code:'auth/user-not-found'};},createUser:async data=>{calls.push(['create',data]);return{uid:'fake-trial-uid'};}};
 const result=await provisionTrialAccount({authClient});
 assert.equal(result.created,true);
 assert.equal(calls[1][1].email,TRIAL_EMAIL);
 assert.equal(TRIAL_EMAIL,'admin@ahs-lms-sandbox.invalid');
 assert.equal(calls[1][1].emailVerified,true);
 assert.equal(calls[1][1].password,firebaseTrialPassword('admin'));
 assert.match(calls[1][1].password,/^[0-9a-f]{64}$/);
 assert.ok(!JSON.stringify(result).includes(calls[1][1].password));
 calls.length=0;
 authClient.getUserByEmail=async()=>({uid:'fake-trial-uid',emailVerified:true});
 await provisionTrialAccount({authClient});
 assert.equal(calls.length,0);
});
test('trial account provisioning refuses production before obtaining an auth client',async()=>{
 const {provisionTrialAccount}=require('../scripts/web-sandbox/trial-account.cjs');
 let requested=false;
 await assert.rejects(()=>provisionTrialAccount({projectId:'ahs-lms',getAuthClient:async()=>{requested=true;}}));
 assert.equal(requested,false);
});
