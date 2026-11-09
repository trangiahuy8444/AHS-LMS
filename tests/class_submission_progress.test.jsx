import {expect,it} from 'vitest';
import {classSubmissionProgress} from '../src/admin/live/classAttendance.js';
const roster=[{studentId:'000123',canvasUserId:'456'},{studentId:'000789'}];
const row=(studentId,extra={})=>({studentId,studentClass:'9/21',grade:9,mode:'exam',...extra});
it('counts submitted pupils from stored submissions even with no live session, deduplicating retakes and aliases',()=>{
 expect(classSubmissionProgress([row('123'),row('456'),row('000123'),row('789',{studentClass:'9/25'}),row('789',{mode:'practice'})],'9/21',roster)).toEqual({total:2,submitted:1,missing:1,unmatched:0});
});
it('keeps the class size independent from submitted rows and exposes records outside the roster',()=>{
 expect(classSubmissionProgress([row('123'),row('789'),row('999')],'9/21',roster)).toEqual({total:2,submitted:2,missing:0,unmatched:1});
 expect(classSubmissionProgress([],'9/21',roster)).toEqual({total:2,submitted:0,missing:2,unmatched:0});
 expect(classSubmissionProgress([row('999')],'9/21',[])).toEqual({total:null,submitted:1,missing:null,unmatched:0});
});
it('separates practice from official submissions and rejects mismatched grade',()=>{
 expect(classSubmissionProgress([row('123'),row('789',{mode:'practice'}),row('789',{grade:8})],'9/21',roster,'practice').submitted).toBe(1);
 expect(classSubmissionProgress([row('123'),row('789',{grade:8})],'9/21',roster).submitted).toBe(1);
});
