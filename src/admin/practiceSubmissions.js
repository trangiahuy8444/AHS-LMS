function sameJsonValue(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => Object.prototype.hasOwnProperty.call(right, key) && sameJsonValue(left[key], right[key]));
}
function samePracticeAttempt(summary, attempt) {
  if (summary.mode !== 'practice' || attempt.mode !== 'practice') return false;
  const grade = value => (typeof value === 'number' || typeof value === 'string') && [8, 9, 10].includes(Number(value)) ? Number(value) : null;
  const score = row => row.finalScore ?? row.score ?? row.mcqPoints;
  if (grade(summary.grade) === null || grade(summary.grade) !== grade(attempt.grade)) return false;
  for (const field of ['studentClass', 'studentId', 'submittedAt']) {
    if (typeof summary[field] !== 'string' || !summary[field].trim() || summary[field] !== attempt[field]) return false;
  }
  if (!Number.isFinite(score(summary)) || score(summary) !== score(attempt)) return false;
  return !summary.answers || (!!attempt.answers && sameJsonValue(summary.answers, attempt.answers));
}

// Lịch sử ôn tập là từng lượt; chỉ bỏ bản tổng hợp cũ khi khớp chắc chắn một lượt đã có.
export function submissionRows(submissions = [], practiceSubmissions = [], practiceAttempts = []) {
  const rows = new Map();
  const key = row => `${row.mode || 'exam'}:${row.id || row._queueId || JSON.stringify([row.grade, row.studentClass, row.studentId, row.submittedAt])}`;
  for (const row of practiceAttempts) {
    if (row && !rows.has(key(row))) rows.set(key(row), row);
  }
  for (const row of [...submissions, ...practiceSubmissions]) {
    if (!row || practiceAttempts.some(attempt => attempt && samePracticeAttempt(row, attempt))) continue;
    const rowKey = key(row);
    if (!rows.has(rowKey)) rows.set(rowKey, row);
  }
  return [...rows.values()];
}
