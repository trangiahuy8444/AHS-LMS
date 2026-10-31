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
function answersOnly(answers) {
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
export function readExamDraft(identity, storage) {
  try {
    const key = draftKey(identity);
    if (!key) return null;
    const draft = JSON.parse((storage || sessionStorage).getItem(key) || 'null');
    if (!draft || draft.version !== 1 || draftKey(draft.identity) !== key) return null;
    return answersOnly(draft.answers);
  } catch { return null; }
}
export function saveExamDraft(identity, answers, storage) {
  try {
    const key = draftKey(identity);
    if (!key) return false;
    (storage || sessionStorage).setItem(key, JSON.stringify({ version: 1, identity: createExamDraftIdentity(identity), answers: answersOnly(answers) }));
    return true;
  } catch { return false; }
}
export function clearExamDraft(identity, storage) {
  try {
    const key = draftKey(identity);
    if (key) (storage || sessionStorage).removeItem(key);
  } catch { /* bộ nhớ bị chặn: không cản trạng thái nộp đã xác nhận */ }
}
