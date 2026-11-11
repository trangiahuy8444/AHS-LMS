// Lịch sử ôn tập là từng lượt; bảng điểm cao nhất vẫn dùng kho tổng hợp riêng.
export function submissionRows(submissions = [], practiceSubmissions = [], practiceAttempts = []) {
  const rows = new Map();
  const key = row => `${row.mode || 'exam'}:${row.id || row._queueId || JSON.stringify([row.grade, row.studentClass, row.studentId, row.submittedAt])}`;
  for (const row of [...practiceAttempts, ...submissions, ...practiceSubmissions]) {
    if (!row) continue;
    const rowKey = key(row);
    if (!rows.has(rowKey)) rows.set(rowKey, row);
  }
  return [...rows.values()];
}
