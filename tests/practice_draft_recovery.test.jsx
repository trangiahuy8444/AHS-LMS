import {expect,it} from 'vitest';
import {savePracticeDraft,readPracticeDraft,clearPracticeDraft} from '../src/student/actions/practiceDraft.js';
it('restores the exact practice set, answers, position and start time after restarting the browser',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const identity={grade:9,studentClass:'9/21',studentId:'999999'};
 const draft={startedAtMs:1700000000000,durationMinutes:30,activeQuestionIdx:4,practiceSet:{mcqQuestions:[{id:7,options:['A','B'],correctAnswer:1}],tfQuestions:[],essayQuestions:[]},answers:{mcq:{7:1},tf:{},essay:{1:'Bài tự luận giả'}}};
 expect(savePracticeDraft(identity,draft,storage)).toBe(true);
 expect(readPracticeDraft(identity,storage)).toMatchObject(draft);
 expect(readPracticeDraft({...identity,studentId:'888888'},storage)).toBeNull();
 clearPracticeDraft(identity,storage);expect(readPracticeDraft(identity,storage)).toBeNull();
});
