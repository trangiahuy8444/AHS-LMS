import {expect,it} from 'vitest';
import {createWebSandboxRuntime,validateWebSandboxFirebaseConfig} from '../src/shared/webSandboxEnvironment.js';
const config={projectId:'ahs-lms-sandbox',authDomain:'ahs-lms-sandbox.firebaseapp.com',apiKey:'fake-public-web-key',appId:'fake-app-id'};
it('web sandbox permits only its own HTTPS origins and immutable separate Firebase config',()=>{
 for(const hostname of ['ahs-lms-sandbox.web.app','ahs-lms-sandbox.firebaseapp.com']){
  const runtime=createWebSandboxRuntime({firebaseConfig:config,hostname,protocol:'https:'});
  expect(runtime.mode).toBe('web-sandbox');expect(runtime.projectId).toBe('ahs-lms-sandbox');expect(Object.isFrozen(runtime)).toBe(true);expect(Object.isFrozen(runtime.firebaseConfig)).toBe(true);
  expect(runtime.teacherUrl).toBe('https://ahs-lms-sandbox.web.app/admin/');expect(runtime.studentUrl).toBe('https://ahs-lms-sandbox.firebaseapp.com/test/');
 }
});
it('rejects production, missing config, unsupported auth domains and wrong host without fallback',()=>{
 for(const invalid of [undefined,{}, {...config,projectId:'ahs-lms'},{...config,authDomain:'ahs-lms.firebaseapp.com'}])expect(()=>validateWebSandboxFirebaseConfig(invalid)).toThrow();
 for(const [hostname,protocol] of [['trangiahuy8444.github.io','https:'],['ahs-lms-sandbox.web.app','http:'],['localhost','http:']])expect(()=>createWebSandboxRuntime({firebaseConfig:config,hostname,protocol})).toThrow();
});
