const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
test('one loss of focus creates one violation across blur, tab visibility and fullscreen events',()=>{
 let now=1000;const events=[];const document={hidden:true,fullscreenElement:null,addEventListener(){},removeEventListener(){}};
 const window={addEventListener(){},removeEventListener(){}};const context={window,document,module:{exports:{}},performance:{now:()=>now},console};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/core/anti-cheat.js'),'utf8'),context);
 const ac=context.module.exports;ac.start({onViolation:v=>events.push(v)});
 ac.handleBlur();ac.handleVisibilityChange();ac.handleFullscreenChange();assert.equal(events.length,1);
 now+=1500;ac.handleBlur();assert.equal(events.length,2);
 now+=1500;ac.handleFullscreenChange();assert.equal(events.length,3);
 ac.setLocked(true);now+=1500;ac.handleBlur();assert.equal(events.length,3);
 ac.stop();
});
