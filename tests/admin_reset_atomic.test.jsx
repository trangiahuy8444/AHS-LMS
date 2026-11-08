import { afterEach, expect, it, vi } from 'vitest';
import { createExamBankActions } from '../src/admin/actions/examBankActions.js';
afterEach(()=>{delete window.AsianSchoolDriveArchive;});
function harness({reject=false, entries}={}) {
  const records = new Map(Object.entries(entries || {
    g8_8_1_999999:{grade:8,studentClass:'8/1',studentId:'999999'},
    g8_999999:{grade:8,studentClass:'8/1',studentId:'999999'},
    g8_8_2_999999:{grade:8,studentClass:'8/2',studentId:'999999'}
  }));
  const targets=[];const individualDeletes=[];
  const ref=id=>({id,path:'exam_attempts/'+id,get:async()=>({exists:records.has(id),data:()=>records.get(id)}),delete:async()=>{individualDeletes.push(id);if(reject)throw new Error('archive_pending');records.delete(id);}});
  const commit=vi.fn(async()=>{if(reject)throw new Error('archive_pending');targets.forEach(r=>records.delete(r.id));});
  window.firebaseDb={collection:()=>({doc:ref}),batch:()=>({delete:r=>targets.push(r),commit})};
  window.AsianSchoolStorage={logAudit:vi.fn()};
  const statuses=[];
  const actions=createExamBankActions({config:{},attemptGrade:8,attemptClass:'8/1',attemptLms:'999999',setAttemptStatus:s=>statuses.push(s)});
  return {actions,records,targets,individualDeletes,commit,statuses};
}
it('permission rejection preserves both attempt documents and never reports successful reset',async()=>{
  const h=harness({reject:true});await h.actions.handleResetAttempt();
  expect(h.records.has('g8_8_1_999999')).toBe(true);expect(h.records.has('g8_999999')).toBe(true);
  expect(h.statuses.some(s=>s.startsWith('✅'))).toBe(false);
  expect(h.statuses.join()).toContain('archive_pending');
  expect(window.AsianSchoolStorage.logAudit).not.toHaveBeenCalled();
  expect(h.individualDeletes).toEqual([]);
});
it('one successful batch removes both existing matching forms and preserves another class',async()=>{
  const h=harness();await h.actions.handleResetAttempt();
  expect(h.commit).toHaveBeenCalledOnce();
  expect(h.targets.map(r=>r.id).sort()).toEqual(['g8_8_1_999999','g8_999999']);
  expect([...h.records.keys()]).toEqual(['g8_8_2_999999']);
  expect(h.individualDeletes).toEqual([]);
  expect(h.statuses.some(s=>s.startsWith('✅'))).toBe(true);
});
it('does not delete a missing legacy id or a legacy record belonging to another class',async()=>{
  for(const entries of [
    {g8_8_1_999999:{grade:8,studentClass:'8/1',studentId:'999999'}},
    {g8_8_1_999999:{grade:8,studentClass:'8/1',studentId:'999999'},g8_999999:{grade:8,studentClass:'8/2',studentId:'999999'}}
  ]) {
    const h=harness({entries});await h.actions.handleResetAttempt();
    expect(h.targets.map(r=>r.id)).toEqual(['g8_8_1_999999']);
  }
});
