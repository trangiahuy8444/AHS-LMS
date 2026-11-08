const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const {createHash,webcrypto} = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname,'../src/core/firebase-config.js'),'utf8');
function boot(profile,existingProject,pathname='/admin/') {
  const local = profile === true;
  const web = profile === 'web';
  const calls = [];
  let authCallback;
  const auth = {useEmulator:(...args)=>calls.push(['auth',...args]),onAuthStateChanged:callback=>{authCallback=callback;},signInAnonymously:()=>{calls.push(['anonymous']);return Promise.resolve();},signInWithEmailAndPassword:(email,password)=>{calls.push(['password-signin',email,password]);return Promise.resolve();},signInWithPopup:()=>{calls.push(['google-popup']);return Promise.resolve();},signInWithCredential:credential=>{calls.push(['signin',credential]);return Promise.resolve();}};
  const db = {useEmulator:(...args)=>calls.push(['db',...args]),enablePersistence:()=>{calls.push(['persist']);return Promise.resolve();}};
  const firebase = {apps:existingProject?[{}]:[],app:()=>({options:{projectId:existingProject}}),initializeApp:options=>{calls.push(['init',options.projectId]);return {options};},auth:()=>auth,firestore:()=>db};
  firebase.auth.GoogleAuthProvider={credential:token=>token};
  const window = {dispatchEvent(){},location:{pathname,hostname:web?'ahs-lms-sandbox.firebaseapp.com':'localhost',port:web?'':'5188',protocol:web?'https:':'http:'},AsianSchoolRuntime:web?{mode:'web-sandbox',projectId:'ahs-lms-sandbox',firebaseConfig:{projectId:'ahs-lms-sandbox',authDomain:'ahs-lms-sandbox.firebaseapp.com'}}:local?{mode:'local-sandbox',projectId:'demo-ahs-local',host:'127.0.0.1',authPort:9098,firestorePort:8188}:null};
  const context = {window,firebase,CustomEvent:class{},console:{log(){},warn(){}},document:{readyState:'loading',addEventListener(){}},setTimeout,clearTimeout,btoa,TextEncoder,crypto:webcrypto};
  vm.runInNewContext(source,context);
  return {calls,window,authChanged:user=>authCallback(user)};
}
test('sandbox Firebase uses only demo project and connects emulators before listeners; no persistent cache',()=>{
  const {calls}=boot(true);
  assert.deepEqual(calls.map(c=>c[0]),['init','auth','db']);
  assert.equal(calls[0][1],'demo-ahs-local');assert.equal(calls[1][1],'http://127.0.0.1:9098');
  assert.equal(calls[2][1],'127.0.0.1');assert.equal(calls[2][2],8188);
});
test('normal profile retains production config and persistence without emulator calls',()=>{
  const {calls}=boot(false);assert.equal(calls[0][1],'ahs-lms');assert.deepEqual(calls.map(c=>c[0]),['init','persist']);
});
test('sandbox refuses pre-existing production Firebase app rather than exposing real auth',()=>{
  assert.throws(()=>boot(true,'ahs-lms'),/Firebase thật/);
});

test('local teacher login creates a valid emulator token without Google popup or Unicode encoding errors',async()=>{
  const {window,calls}=boot(true);
  await window.AsianSchoolAuth.signInTeacher();
  const token=calls.find(c=>c[0]==='signin')[1];
  const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));
  assert.equal(claims.sub,'ahs-local-teacher');assert.equal(claims.email_verified,true);assert.equal(claims.aud,'demo-ahs-local');
});

test('web trial shared login hashes the password and never uses Google or emulator auth',async()=>{
  const {calls,window}=boot('web');
  await window.AsianSchoolAuth.signInTeacher({username:'admin',password:'admin'});
  const login=calls.find(call=>call[0]==='password-signin');
  assert.equal(login[1],'admin@ahs-lms-sandbox.invalid');
  assert.equal(login[2],createHash('sha256').update('ahs-lms-sandbox:admin').digest('hex'));
  assert.ok(!calls.some(call=>['auth','db','signin','google-popup','anonymous'].includes(call[0])));
  assert.equal(calls[0][1],'ahs-lms-sandbox');
});
test('web student login uses shared credentials and never auto-signs anonymously',async()=>{
  const {calls,window,authChanged}=boot('web',null,'/test/');
  await authChanged(null);
  assert.equal(window.AsianSchoolAuth.getState().ready,true);
  assert.equal(window.AsianSchoolAuth.getState().user,null);
  assert.ok(!calls.some(call=>call[0]==='anonymous'));
  await window.AsianSchoolAuth.signInSandbox({username:'admin',password:'admin'});
  assert.ok(calls.some(call=>call[0]==='password-signin'));
  await authChanged({uid:'shared-trial',email:'admin@ahs-lms-sandbox.invalid',emailVerified:true,isAnonymous:false});
  assert.equal(window.AsianSchoolAuth.getState().isTeacher,true);
});
test('web shared login rejects a different username before sending credentials',async()=>{
  const {calls,window}=boot('web');
  await assert.rejects(()=>window.AsianSchoolAuth.signInSandbox({username:'other',password:'admin'}));
  assert.ok(!calls.some(call=>call[0]==='password-signin'));
});
