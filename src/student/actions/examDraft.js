// Bản nháp chỉ giữ bài làm học sinh, theo từng tab và đúng lượt máy chủ đã xác nhận.
const DRAFT_PREFIX = 'ahs_exam_draft_v1:';
const RECOVERY_PREFIX = 'ahs_exam_recovery_v1:';
const emptyAnswers = () => ({ mcq: {}, tf: {}, essay: {} });

function recoveryKey(identity) {
  if (!identity) return null;
  const grade = Number(identity.grade);
  const studentClass = String(identity.studentClass || '').trim();
  const studentId = String(identity.studentId || '').trim();
  const examCode = String(identity.examCode || '').trim();
  if (![8, 9, 10].includes(grade) || !studentClass || !/^\d+$/.test(studentId)) return null;
  return RECOVERY_PREFIX + [grade, studentClass, studentId, examCode].join(':');
}

export function createExamDraftIdentity({ grade, studentClass, studentId, examCode, startedAtMs, uid = '', attemptId = '' }) {
  if (![8, 9, 10].includes(grade) || !studentClass || !/^\d+$/.test(String(studentId || ''))
    || !/^\d{3}$/.test(String(examCode || '')) || !Number.isFinite(startedAtMs) || startedAtMs <= 0) return null;
  return { grade, studentClass: String(studentClass), studentId: String(studentId), examCode: String(examCode), startedAtMs, uid: String(uid), attemptId: String(attemptId || '') };
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
    const filteredAnswers = answersOnly(answers);
    const value=JSON.stringify({version:1,identity:createExamDraftIdentity(identity),answers:filteredAnswers,activeQuestionIdx});
    if(storage){storage.setItem(key,value);return true;}
    let durable=false;
    try{localStorage.setItem(key,value);durable=true;}catch{/* còn bản lưu theo tab nếu trình duyệt chặn lưu bền */}
    try{sessionStorage.setItem(key,value);}catch{/* không làm hỏng phần nhập bài */}

    // Lưu bản sao cứu hộ theo học sinh để giữ nguyên bài làm khi bị tắt máy, lỗi kỹ thuật hoặc đổi uid
    const rKey = recoveryKey(identity);
    if (rKey) {
      try {
        const hasContent = Object.keys(filteredAnswers.mcq).length > 0 || Object.keys(filteredAnswers.tf).length > 0 || Object.keys(filteredAnswers.essay).length > 0;
        if (hasContent) {
          const recVal = JSON.stringify({
            version: 1,
            grade: Number(identity.grade),
            studentClass: String(identity.studentClass),
            studentId: String(identity.studentId),
            examCode: String(identity.examCode || ''),
            answers: filteredAnswers,
            activeQuestionIdx: Number.isSafeInteger(activeQuestionIdx) && activeQuestionIdx >= 0 ? activeQuestionIdx : 0,
            savedAt: Date.now()
          });
          localStorage.setItem(rKey, recVal);
        }
      } catch { /* không cản trở luồng lưu chính */ }
    }

    // ĐỒNG BỘ BẢN NHÁP CỨU HỘ LÊN CLOUD FIRESTORE:
    // Cứu hộ 100% bài làm khi máy bị shutdown, cúp điện, hoặc máy phòng lab đóng băng Deep Freeze!
    if (typeof window !== 'undefined' && window.AsianSchoolCloud && typeof window.AsianSchoolCloud.saveExamDraftToCloud === 'function') {
      window.AsianSchoolCloud.saveExamDraftToCloud({
        attemptId: identity.attemptId,
        grade: identity.grade,
        studentClass: identity.studentClass,
        studentId: identity.studentId,
        draftAnswers: filteredAnswers,
        activeQuestionIdx
      });
    }

    return durable;
  } catch { return false; }
}
export function clearExamDraft(identity, storage) {
  try {
    const key=draftKey(identity);
    const rKey=recoveryKey(identity);
    for(const source of storage?[storage]:[localStorage,sessionStorage]) {
      try {
        if (key) source.removeItem(key);
        if (rKey) source.removeItem(rKey);
      } catch { /* bộ nhớ bị chặn */ }
    }
  } catch { /* không cản nộp đã xác nhận */ }
}

// Tìm bản nháp cứu hộ của học sinh khi bị lỗi kỹ thuật, tắt máy hoặc vào lại bài thi
export function findRecoverableExamDraft({ grade, studentClass, studentId, examCode }) {
  if (![8, 9, 10].includes(Number(grade)) || !studentClass || !studentId) return null;
  const cleanId = String(studentId).trim();
  const targetCode = String(examCode || '').trim();
  const rKey = RECOVERY_PREFIX + [Number(grade), String(studentClass).trim(), cleanId, targetCode].join(':');
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(rKey) : null;
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.answers) {
      const filtered = answersOnly(data.answers);
      const hasContent = Object.keys(filtered.mcq).length > 0 || Object.keys(filtered.tf).length > 0 || Object.keys(filtered.essay).length > 0;
      if (hasContent) {
        return {
          answers: filtered,
          activeQuestionIdx: Number.isSafeInteger(data.activeQuestionIdx) && data.activeQuestionIdx >= 0 ? data.activeQuestionIdx : 0,
          savedAt: data.savedAt
        };
      }
    }
  } catch { /* ignore parse error */ }
  return null;
}
