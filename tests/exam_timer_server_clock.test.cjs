const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function timer(skew){let monotonic=0,wall=1700000000000+skew;const events=[];const context={module:{exports:{}},Date:class extends Date{static now(){return wall}},performance:{now:()=>monotonic},setInterval:()=>1,clearInterval(){},console};vm.runInNewContext(fs.readFileSync('src/core/exam-timer.js','utf8'),context);return {timer:context.module.exports,events,advance:ms=>{monotonic+=ms},changeWall:ms=>{wall+=ms}};}
test('server deadlines agree across five-minute clock errors and do not jump when a device clock changes',()=>{
 for(const skew of [-300000,0,300000]){const h=timer(skew),base=1700000000000;
 h.timer.start({startedAtMs:base-60000,serverNowMs:base,deadlineMs:base+44*60000,onTick:(sec,fmt,meta)=>h.events.push({sec,meta})});
 assert.equal(h.timer.remainingSeconds,44*60);assert.equal(h.events.at(-1).meta.elapsedSeconds,60);
 h.changeWall(600000);h.timer.tick();assert.equal(h.timer.remainingSeconds,44*60);
 h.advance(120000);h.timer.tick();assert.equal(h.timer.remainingSeconds,42*60);
 h.timer.syncDeadline(base+49*60000);assert.equal(h.timer.remainingSeconds,47*60);
 h.timer.syncDeadline(base+49*60000);assert.equal(h.timer.remainingSeconds,47*60);
 h.timer.stop();}
});
test('an expired restored deadline times out only once and cannot regain time by reload',()=>{
 const h=timer(300000);let timeouts=0;h.timer.start({startedAtMs:1700000000000-46*60000,serverNowMs:1700000000000,deadlineMs:1700000000000-60000,onTimeout:()=>timeouts++});
 assert.equal(h.timer.remainingSeconds,0);h.timer.tick();assert.equal(timeouts,1);h.timer.stop();
});
