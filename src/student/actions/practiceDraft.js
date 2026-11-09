import { answersOnly } from './examDraft.js';
function keyFor({grade,studentClass,studentId}) {
  return [8,9,10].includes(grade)&&studentClass&&studentId ? 'ahs_practice_draft_v1:'+JSON.stringify([grade,studentClass,String(studentId)]) : null;
}
export function readPracticeDraft(identity,storage) {
  try {
    const key=keyFor(identity),draft=key?JSON.parse((storage||localStorage).getItem(key)||'null'):null;
    if(!draft||draft.version!==1||!Number.isFinite(draft.startedAtMs)||!draft.practiceSet)return null;
    if(!['mcqQuestions','tfQuestions','essayQuestions'].every(name=>Array.isArray(draft.practiceSet[name])))return null;
    return {...draft,answers:answersOnly(draft.answers)};
  } catch {return null;}
}
export function savePracticeDraft(identity,draft,storage) {
  try {
    const key=keyFor(identity);if(!key)return false;
    const set=draft.practiceSet||{};
    (storage||localStorage).setItem(key,JSON.stringify({version:1,startedAtMs:draft.startedAtMs,durationMinutes:draft.durationMinutes||0,
      activeQuestionIdx:draft.activeQuestionIdx||0,violations:draft.violations||0,answers:answersOnly(draft.answers),
      practiceSet:{mcqQuestions:set.mcqQuestions||[],tfQuestions:set.tfQuestions||[],essayQuestions:set.essayQuestions||[]}}));
    return true;
  } catch {return false;}
}
export function clearPracticeDraft(identity,storage) {try{const key=keyFor(identity);if(key)(storage||localStorage).removeItem(key);}catch{/* không cản nộp */}}
