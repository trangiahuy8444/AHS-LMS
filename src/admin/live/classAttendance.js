// Một học sinh có thể mở nhiều phiên; chỉ trạng thái mới nhất quyết định đang làm bài.
export function classAttendance(sessions, studentClass, roster, now = Date.now()) {
  const latest = new Map();
  const normalize = value => String(value || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const aliases = new Map();
  for (const [index, student] of (roster || []).entries()) {
    for (const field of ['studentId','lmsCode','loginId','sisId','canvasUserId']) {
      const value = normalize(student[field]);
      if (value) {
        aliases.set(value, 'roster-' + index);
        if (/^\d+$/.test(value)) aliases.set(value.replace(/^0+/, ''), 'roster-' + index);
      }
    }
  }
  for (const session of sessions) {
    if (session.studentClass !== studentClass) continue;
    const id = normalize(session.studentId || session.sessionId);
    const key = aliases.get(id) || (/^\d+$/.test(id) ? aliases.get(id.replace(/^0+/, '')) : null) || id;
    if (!latest.has(key) || Number(session.lastPing) > Number(latest.get(key).lastPing)) latest.set(key, session);
  }
  const active = [...latest.values()].filter(session =>
    ['in_progress', 'practicing', 'locked'].includes(session.status) &&
    Number(session.lastPing) > 0 && now - Number(session.lastPing) <= 180000
  );
  return {
    total: roster?.length || null,
    active: active.length,
    exam: active.filter(session => session.mode === 'exam').length,
    practice: active.filter(session => session.mode === 'practice').length,
    locked: active.filter(session => session.isLocked || session.status === 'locked').length
  };
}

// Sĩ số lấy từ danh sách lớp; đã nộp lấy từ bài lưu trong CSDL, không suy từ phiên trực tuyến.
export function classSubmissionProgress(submissions, studentClass, roster = [], mode = 'exam') {
  const normalize = value => String(value || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().replace(/^0+(?=\d)/, '');
  const aliases = new Map();
  roster.forEach((student, index) => {
    for (const field of ['studentId', 'lmsCode', 'loginId', 'sisId', 'canvasUserId']) {
      const id = normalize(student[field]);
      if (id) aliases.set(id, index);
    }
  });
  const submitted = new Set(), unmatched = new Set();
  const unmatchedRows = [];
  const total = roster.length || null;
  for (const row of submissions || []) {
    if (String(row.studentClass || '').trim() !== studentClass || row.mode !== mode) continue;
    if (row.grade != null && Number(row.grade) !== Number(studentClass.split('/')[0])) continue;
    const id = normalize(row.studentId);
    if (!id) continue;
    if (aliases.has(id)) {
      submitted.add(aliases.get(id));
    } else if (total === null) {
      submitted.add(id);
    } else {
      unmatched.add(id);
      unmatchedRows.push(row);
    }
  }
  const missingStudents = total === null ? [] : roster.filter((_, idx) => !submitted.has(idx));
  const res = { total, submitted: submitted.size, missing: total === null ? null : total - submitted.size, unmatched: unmatched.size };
  Object.defineProperties(res, {
    missingStudents: { value: missingStudents, enumerable: false, writable: true },
    unmatchedRows: { value: unmatchedRows, enumerable: false, writable: true }
  });
  return res;
}
