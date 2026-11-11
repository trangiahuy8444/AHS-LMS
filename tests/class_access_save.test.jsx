import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createClassAccessActions } from '../src/admin/actions/classAccessActions.js';

let server, setConfig, showToast, showDialog, txSet, db, localConfig, s;
beforeEach(() => {
  localStorage.clear();
  localConfig = { classAccessControl: { '8/99': 'practice_only', '9/99': 'practice_only' }, examDurationMinutes: 45 };
  server = { classAccessControl: { '8/99': 'practice_only', '9/99': 'exam_only' }, examDurationMinutes: 50 };
  txSet = vi.fn();
  db = { collection: vi.fn(name => ({ doc: vi.fn(id => ({ name, id })) })),
    runTransaction: vi.fn(async callback => callback({get:async () => ({exists:true,data:()=>server}),set:txSet})) };
  window.firebaseDb = db;
  window.AsianSchoolStorage = { getConfig:()=>localConfig, setQuickExamClass:vi.fn(), setClassAccessMode:vi.fn(), closeAllExamSessions:vi.fn(), notify:vi.fn(), configListeners:[], logAudit:vi.fn() };
  setConfig=vi.fn();showToast=vi.fn();showDialog=vi.fn();
  s={setConfig,showToast,showDialog};
  vi.stubGlobal('confirm',vi.fn(()=>true));
});
afterEach(() => { vi.unstubAllGlobals(); delete window.firebaseDb; delete window.AsianSchoolStorage; });
it('waits for the server before reflecting an open class and only writes access policy',async()=>{
  let release;
  db.runTransaction.mockImplementation(async callback=> {await new Promise(resolve=>{release=resolve;});return callback({get:async()=>({exists:true,data:()=>server}),set:txSet});});
  const pending=createClassAccessActions(s).handleSetClassMode('8/99','exam_only');
  expect(setConfig).not.toHaveBeenCalled();
  release();await pending;
  expect(txSet).toHaveBeenCalledWith(expect.anything(),{classAccessControl:{'8/99':'exam_only','9/99':'exam_only'}},{merge:true});
  expect(setConfig).toHaveBeenCalledWith(expect.objectContaining({classAccessControl:{'8/99':'exam_only','9/99':'exam_only'}}));
  expect(window.AsianSchoolStorage.setClassAccessMode).not.toHaveBeenCalled();
});
it('does not show success or alter local state when the server rejects opening',async()=>{
  db.runTransaction.mockRejectedValue(new Error('permission-denied'));
  await createClassAccessActions(s).handleQuickStartExam('8/99');
  expect(setConfig).not.toHaveBeenCalled();expect(showToast).not.toHaveBeenCalled();
  expect(showDialog).toHaveBeenCalledWith(expect.any(String),expect.stringContaining('permission-denied'),'error');
  expect(localStorage.getItem('asian_school_exam_config_v1')).toBeNull();
});
it('quick start preserves server settings while putting other known classes into practice',async()=>{
  await createClassAccessActions(s).handleQuickStartExam('8/99');
  expect(txSet).toHaveBeenCalledWith(expect.anything(),{classAccessControl:{'8/99':'exam_only','9/99':'practice_only'},defaultClassMode:'practice_only'},{merge:true});
  expect(showToast).toHaveBeenCalled();
});
it('rejects invalid modes and refuses an offline-only activation',async()=>{
  await createClassAccessActions(s).handleSetClassMode('8/99','invalid');expect(db.runTransaction).not.toHaveBeenCalled();
  delete window.firebaseDb;
  await createClassAccessActions(s).handleSetClassMode('8/99','exam_only');
  expect(setConfig).not.toHaveBeenCalled();expect(showDialog).toHaveBeenCalled();
});
it('closing all classes waits for acknowledgement and retains remote map entries',async()=>{
  const actions=createClassAccessActions(s);actions.handleCloseAllExams();
  const callback=showDialog.mock.calls[0][3];await callback();
  expect(txSet).toHaveBeenCalledWith(expect.anything(),{classAccessControl:{'8/99':'practice_only','9/99':'practice_only'},defaultClassMode:'practice_only'},{merge:true});
});
it('quick start closes the default access for classes absent from the explicit map',async()=>{
  server.defaultClassMode='both_open';
  await createClassAccessActions(s).handleQuickStartExam('8/99');
  expect(txSet.mock.calls[0][1].defaultClassMode).toBe('practice_only');
});
it('closing all classes also closes the default access policy',async()=>{
  server.defaultClassMode='exam_only';
  createClassAccessActions(s).handleCloseAllExams();await showDialog.mock.calls[0][3]();
  expect(txSet.mock.calls[0][1].defaultClassMode).toBe('practice_only');
});
