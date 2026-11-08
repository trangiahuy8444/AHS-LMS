const test = require('node:test');
const assert = require('node:assert/strict');
const { assertSandboxTarget, buildSeedDocuments, seedSandbox, toFields, fromFields } = require('../scripts/local-sandbox/seed.cjs');
const { validateConfig, createShutdown } = require('../scripts/local-sandbox/start.cjs');
const { validateExam } = require('../src/core/exam-package.js');

test('sandbox seeding rejects every non-local or non-demo destination', () => {
  assert.doesNotThrow(() => assertSandboxTarget({projectId:'demo-ahs-local', firestoreOrigin:'http://127.0.0.1:8188', authOrigin:'http://127.0.0.1:9098'}));
  for (const patch of [{projectId:'ahs-lms'}, {firestoreOrigin:'https://firestore.googleapis.com'}, {firestoreOrigin:'http://127.0.0.1:8080'}, {authOrigin:'http://localhost:9098'}, {firestoreOrigin:'http://127.0.0.1:8188/other'}]) {
    assert.throws(() => assertSandboxTarget({projectId:'demo-ahs-local', firestoreOrigin:'http://127.0.0.1:8188', authOrigin:'http://127.0.0.1:9098', ...patch}));
  }
});

test('seed has 12 valid fake exams, answer-stripped public copies and separate secrets', () => {
  const docs = buildSeedDocuments();
  const bank = Object.entries(docs).filter(([name]) => name.startsWith('exam_bank/'));
  assert.equal(bank.length,12);
  for (const [name, value] of bank) {
    assert.deepEqual(validateExam(value.exam), [], name);
    const pub = docs[name.replace('exam_bank/', 'exam_public/')];
    assert.ok(pub);
    assert.doesNotMatch(JSON.stringify(pub), /correctAnswer|modelAnswer|rubric|explanation/);
  }
  assert.equal(docs['exam_config/global_config'].defaultClassMode, 'both_open');
  assert.equal(docs['exam_config/global_config'].maxExamAttempts, 5);
  assert.equal(docs['exam_config/global_config'].minExamMinutes, 0);
  assert.ok(!('examPassword' in docs['exam_config/global_config']));
});

test('Firestore encoding round trips nested seed fields', () => {
  const source = {a:[1, true, 'text', null], b:{x:2.25}};
  assert.deepEqual(fromFields(toFields(source)), source);
});

test('existing bootstrap never resets teacher configuration, exams, or attempt progress', async () => {
  const requests = [];
  const fakeFetch = async (url, opts = {}) => {
    requests.push([url, opts.method || 'GET']);
    return {ok:true, status:200, json:async () => ({fields:{ready:{booleanValue:true}}})};
  };
  const result = await seedSandbox({fetchImpl:fakeFetch});
  assert.equal(result.created,false);
  assert.equal(requests.length,1);
  assert.equal(requests[0][1],'GET');
});

test('local config cannot bind Firebase emulators off loopback or another project', () => {
  const config = require('../firebase.sandbox.json');
  assert.doesNotThrow(() => validateConfig(config));
  assert.throws(() => validateConfig({...config, emulators:{...config.emulators, firestore:{host:'0.0.0.0',port:8188}}}));
});

test('initial seed only creates absent documents atomically on fixed emulator hosts', async () => {
  const requests = [];
  const fakeFetch = async (url, opts = {}) => {
    requests.push([url, opts]);
    if (opts.method === 'POST') return {ok:true,status:200,json:async()=>({})};
    if (url.endsWith('/exam_config/global_config')) return {ok:true,status:200,json:async()=>({fields:{}})};
    return {ok:false,status:404,json:async()=>({})};
  };
  const result = await seedSandbox({fetchImpl:fakeFetch});
  assert.equal(result.created,true);
  for (const [url] of requests) assert.ok(url.startsWith('http://127.0.0.1:8188/') || url.startsWith('http://127.0.0.1:9098/'));
  const commit = requests.find(([url]) => url.endsWith('/documents:commit'));
  const writes = JSON.parse(commit[1].body).writes;
  assert.equal(writes.length,26); // room + 24 exams + marker; preserve existing config.
  assert.ok(writes.every(write => write.currentDocument.exists === false));
  assert.ok(writes.every(write => !write.update.name.endsWith('/exam_config/global_config')));
  assert.ok(requests.every(([,opts]) => !['DELETE','PATCH'].includes(opts.method)));
});

test('shutdown signals each isolated process group once and waits for its normal exit', () => {
  const groups = [], statuses = [];
  const children = [{pid:1201,exitCode:null},{pid:1202,exitCode:null},{pid:1203,exitCode:0}];
  const shutdown = createShutdown(children, (pid, signal) => groups.push([pid,signal]), code => statuses.push(code));
  shutdown.stop(0);
  shutdown.stop(1);
  assert.deepEqual(groups,[[-1201,'SIGINT'],[-1202,'SIGINT']]);
  assert.deepEqual(statuses,[0]);
  assert.equal(shutdown.isClosing(),true);
});
