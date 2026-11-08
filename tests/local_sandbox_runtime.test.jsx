import { describe, it, expect } from 'vitest';
import { createRuntimeEnvironment, prepareSandboxStorage } from '../src/shared/runtimeEnvironment.js';

describe('local sandbox runtime', () => {
  it('uses no sandbox override in normal mode, even with a query switch', () => {
    expect(createRuntimeEnvironment({sandbox:false, hostname:'trangiahuy8444.github.io',port:''})).toBeNull();
  });
  it('allows only the two isolated local portals on the reserved port', () => {
    for (const hostname of ['localhost','127.0.0.1']) {
      expect(createRuntimeEnvironment({sandbox:true,hostname,port:'5188',protocol:'http:',sessionId:'run1'})).toMatchObject({mode:'local-sandbox',projectId:'demo-ahs-local',firestorePort:8188,authPort:9098});
    }
    for (const [hostname,port,protocol] of [['example.com','5188','http:'],['127.0.0.1','5173','http:'],['localhost','5188','https:']]) {
      expect(() => createRuntimeEnvironment({sandbox:true,hostname,port,protocol,sessionId:'run1'})).toThrow();
    }
  });
  it('clears only old sandbox app caches once per launch; preserves reload drafts', () => {
    localStorage.clear();
    localStorage.setItem('ahs_exam_draft_x','old');localStorage.setItem('asian_school_exam_config_v1','old');localStorage.setItem('unrelated','keep');
    prepareSandboxStorage(localStorage,{mode:'local-sandbox',sessionId:'new'});
    expect(localStorage.getItem('ahs_exam_draft_x')).toBeNull();expect(localStorage.getItem('unrelated')).toBe('keep');
    localStorage.setItem('ahs_exam_draft_x','new answer');
    prepareSandboxStorage(localStorage,{mode:'local-sandbox',sessionId:'new'});
    expect(localStorage.getItem('ahs_exam_draft_x')).toBe('new answer');
    prepareSandboxStorage(localStorage,null);
    expect(localStorage.getItem('ahs_exam_draft_x')).toBe('new answer');
  });
});

it('refuses a normal production build served from a known trial host',()=>{
 for(const hostname of ['ahs-lms-sandbox.web.app','ahs-lms-sandbox.firebaseapp.com'])expect(()=>createRuntimeEnvironment({sandbox:false,hostname,port:'',protocol:'https:'})).toThrow();
});
