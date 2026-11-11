import {expect,it} from 'vitest';
import {submissionRows} from '../src/admin/practiceSubmissions.js';
const attempt={id:'recovered-fixture',mode:'practice',grade:8,studentClass:'8/21',studentId:'990001',submittedAt:'2026-11-11T08:20:00.000Z',finalScore:6,answers:{mcq:{1:0,2:1},tf:{},essay:{1:'Synthetic response'}}};
const fallback={...attempt,id:'legacy-fixture'};
it('suppresses a legacy summary with a different ID when strong identity, timestamp, score and answers match a recovered history attempt',()=>{
 const reordered={...fallback,answers:{essay:{1:'Synthetic response'},tf:{},mcq:{2:1,1:0}}};
 expect(submissionRows([], [reordered], [attempt])).toEqual([attempt]);
 expect(submissionRows([reordered], [], [attempt])).toEqual([attempt]);
});
it('keeps independent full history attempts even with identical identity, timestamp, score and answers',()=>{
 const second={...attempt,id:'independent-fixture'};
 expect(submissionRows([],[],[attempt,second])).toEqual([attempt,second]);
});
it('preserves legacy fallbacks if any strong identity, timestamp or score differs',()=>{
 for(const change of [{grade:9},{studentClass:'8/22'},{studentId:'990002'},{submittedAt:'2026-11-11T08:21:00.000Z'},{finalScore:5}]){
  const other={...fallback,...change};
  expect(submissionRows([],[other],[attempt])).toEqual([attempt,other]);
 }
});
it('preserves a fallback when both rows have different answer content',()=>{
 const other={...fallback,answers:{...attempt.answers,mcq:{1:1,2:1}}};
 expect(submissionRows([],[other],[attempt])).toEqual([attempt,other]);
});
it('matches summary-only records without answers but never merges when a strong field is absent',()=>{
 const {answers:_,...summary}=fallback;
 expect(submissionRows([],[summary],[attempt])).toEqual([attempt]);
 for(const field of ['grade','studentClass','studentId','submittedAt','finalScore']){
  const incomplete={...fallback};delete incomplete[field];
  expect(submissionRows([],[incomplete],[attempt])).toEqual([attempt,incomplete]);
 }
});
it('does not suppress official exam rows that happen to have the same identity and timestamp as a practice attempt',()=>{
 const exam={...fallback,mode:'exam'};
 expect(submissionRows([exam],[],[attempt])).toEqual([attempt,exam]);
});
it('keeps a legacy fallback with answers when matching history only contains a summary',()=>{
 const {answers:_,...summaryAttempt}=attempt;
 expect(submissionRows([],[fallback],[summaryAttempt])).toEqual([summaryAttempt,fallback]);
});
