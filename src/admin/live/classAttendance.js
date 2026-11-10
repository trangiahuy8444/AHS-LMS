// Một học sinh có thể mở nhiều phiên; chỉ trạng thái mới nhất quyết định đang làm bài.
// Nếu thí sinh đã nộp bài (có trong submissions) thì không tính là đang làm bài/đang thi.
export function classAttendance(sessions, studentClass, roster, now = Date.now(), submissions = [], timeoutMs = 180000) {
  const latest = new Map();
  const normalize = value => String(value || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanClass = s => String(s || '').trim().replace(/^lớp\s+/i, '');
  const aliases = new Map();
  for (const [index, student] of (roster || []).entries()) {
    for (const field of ['studentId','lmsCode','loginId','sisId','canvasUserId','legacyId']) {
      const value = normalize(student[field]);
      if (value) {
        aliases.set(value, 'roster-' + index);
        if (/^\d+$/.test(value)) aliases.set(value.replace(/^0+/, ''), 'roster-' + index);
      }
    }
  }

  // Tập hợp các thí sinh đã nộp bài trong CSDL
  const submittedKeys = new Set();
  (submissions || []).forEach(sub => {
    if (cleanClass(sub.studentClass) !== cleanClass(studentClass)) return;
    if (sub.sessionId) submittedKeys.add(sub.sessionId);
    const subLms = normalize(sub.studentId);
    if (subLms) {
      submittedKeys.add(subLms);
      if (aliases.has(subLms)) submittedKeys.add(aliases.get(subLms));
    }
  });

  for (const session of sessions) {
    if (cleanClass(session.studentClass) !== cleanClass(studentClass)) continue;
    const cleanName = String(session.fullName || '').trim().toLowerCase();
    const id = normalize(session.studentId || session.sessionId);
    const rosterKey = aliases.get(id) || (/^\d+$/.test(id) ? aliases.get(id.replace(/^0+/, '')) : null);
    const key = rosterKey
      ? (cleanName ? `${rosterKey}|${cleanName}` : rosterKey)
      : (cleanName ? `${id}|${cleanName}` : (id || session.sessionId));
    if (!latest.has(key) || Number(session.lastPing) > Number(latest.get(key).lastPing)) latest.set(key, session);
  }

  const active = [...latest.entries()].filter(([key, session]) => {
    // Nếu phiên đã đánh dấu submitted hoặc đã có trong CSDL nộp bài -> Không tính là đang làm
    if (session.status === 'submitted') return false;
    if (submittedKeys.has(key) || (session.sessionId && submittedKeys.has(session.sessionId))) return false;
    const lms = normalize(session.studentId);
    if (lms && submittedKeys.has(lms)) return false;

    return ['in_progress', 'practicing', 'locked'].includes(session.status) &&
      Number(session.lastPing) > 0 && now - Number(session.lastPing) <= timeoutMs;
  }).map(([, session]) => session);

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
    for (const field of ['studentId', 'lmsCode', 'loginId', 'sisId', 'canvasUserId', 'legacyId']) {
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
