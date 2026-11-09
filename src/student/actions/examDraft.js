// Bản nháp chỉ giữ bài làm học sinh, theo từng tab và đúng lượt máy chủ đã xác nhận.
const DRAFT_PREFIX = 'ahs_exam_draft_v1:';
const emptyAnswers = () => ({ mcq: {}, tf: {}, essay: {} });

export function createExamDraftIdentity({ grade, studentClass, studentId, examCode, startedAtMs, uid = '' }) {
  if (![8, 9, 10].includes(grade) || !studentClass || !/^\d+$/.test(String(studentId || ''))
    || !/^\d{3}$/.test(String(examCode || '')) || !Number.isFinite(startedAtMs) || startedAtMs <= 0) return null;
  return { grade, studentClass: String(studentClass), studentId: String(studentId), examCode: String(examCode), startedAtMs, uid: String(uid) };
}
function draftKey(identity) {
  if (!identity) return null;
  const valid = createExamDraftIdentity(identity);
  return valid ? DRAFT_PREFIX + JSON.stringify([valid.grade, valid.studentClass, valid.studentId, valid.examCode, valid.startedAtMs, valid.uid]) : null;
}
export function answersOnly(answers) {
  const out = emptyAnswers();
  const entries = value => value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value) : [];
  for (const [num, answer] of entries(answers?.mcq)) {
    if (/^[1-9]\d*$/.test(num) && Number.isInteger(answer) && answer >= 0 && answer <= 3) out.mcq[num] = answer;
  }
  for (const [num, subs] of entries(answers?.tf)) {
    if (!/^[1-9]\d*$/.test(num)) continue;
    const selected = {};
    for (const [letter, answer] of entries(subs)) {
      if (/^[a-d]$/.test(letter) && typeof answer === 'boolean') selected[letter] = answer;
    }
    out.tf[num] = selected;
  }
  for (const [num, answer] of entries(answers?.essay)) {
    if (/^[1-9]\d*$/.test(num) && typeof answer === 'string') out.essay[num] = answer;
  }
  return out;
}
function readDraftRecord(identity, storage) {
  const key = draftKey(identity);
  if (!key) return null;
  const stores = storage ? [storage] : [localStorage, sessionStorage];
  for (const source of stores) {
    try {
      const draft=JSON.parse(source.getItem(key)||'null');
      if(draft?.version===1 && draftKey(draft.identity)===key) return draft;
    } catch { /* thử bản lưu tương thích tiếp theo */ }
  }
  return null;
}
export function readExamDraft(identity, storage) {
  try { const draft=readDraftRecord(identity,storage);return draft ? answersOnly(draft.answers) : null; } catch { return null; }
}
export function readExamDraftPosition(identity, storage) {
  try { const position=readDraftRecord(identity,storage)?.activeQuestionIdx;return Number.isSafeInteger(position)&&position>=0?position:0; } catch { return 0; }
}
export function saveExamDraft(identity, answers, storage, activeQuestionIdx = 0) {
  try {
    const key=draftKey(identity);if(!key)return false;
    const value=JSON.stringify({version:1,identity:createExamDraftIdentity(identity),answers:answersOnly(answers),activeQuestionIdx});
    if(storage){storage.setItem(key,value);return true;}
    let durable=false;
    try{localStorage.setItem(key,value);durable=true;}catch{/* còn bản lưu theo tab nếu trình duyệt chặn lưu bền */}
    try{sessionStorage.setItem(key,value);}catch{/* không làm hỏng phần nhập bài */}
    return durable;
  } catch { return false; }
}
export function clearExamDraft(identity, storage) {
  try {
    const key=draftKey(identity);if(!key)return;
    for(const source of storage?[storage]:[localStorage,sessionStorage])try{source.removeItem(key);}catch{/* bộ nhớ bị chặn */}
  } catch { /* không cản nộp đã xác nhận */ }
}
