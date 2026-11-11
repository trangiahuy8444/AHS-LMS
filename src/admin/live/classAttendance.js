// Một học sinh có thể mở nhiều phiên; chỉ trạng thái mới nhất quyết định đang làm bài.
// Nếu thí sinh đã nộp bài (có trong submissions) thì không tính là đang làm bài/đang thi.
export function classAttendance(sessions, studentClass, roster, now = Date.now(), submissions = [], timeoutMs = 180000) {
  const latest = new Map();
  const normalize = value => String(value || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanClass = s => String(s || '').trim().replace(/^lớp\s+/i, '').replace(/\s+/g, '');
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

  // Tập hợp các thí sinh đã nộp bài trong CSDL — tách riêng theo chế độ (thi / ôn tập):
  // đã nộp bài ôn tập KHÔNG có nghĩa là đã nộp bài thi chính thức.
  const modeOf = value => (value === 'practice' ? 'practice' : 'exam');
  const submittedKeys = new Set();
  (submissions || []).forEach(sub => {
    if (cleanClass(sub.studentClass) !== cleanClass(studentClass)) return;
    const m = modeOf(sub.mode);
    if (sub.sessionId) submittedKeys.add(`${m}#${sub.sessionId}`);
    const subLms = normalize(sub.studentId);
    if (subLms) {
      submittedKeys.add(`${m}#${subLms}`);
      if (/^\d+$/.test(subLms)) submittedKeys.add(`${m}#${subLms.replace(/^0+/, '')}`);
      const rk = aliases.get(subLms) || (/^\d+$/.test(subLms) ? aliases.get(subLms.replace(/^0+/, '')) : null);
      if (rk) submittedKeys.add(`${m}#${rk}`);
    }
  });

  for (const session of sessions) {
    if (cleanClass(session.studentClass) !== cleanClass(studentClass)) continue;
    const cleanName = String(session.fullName || '').trim().toLowerCase();
    const id = normalize(session.studentId || session.sessionId);
    const rosterKey = aliases.get(id) || (/^\d+$/.test(id) ? aliases.get(id.replace(/^0+/, '')) : null);
    const baseKey = rosterKey
      ? (cleanName ? `${rosterKey}|${cleanName}` : rosterKey)
      : (cleanName ? `${id}|${cleanName}` : (id || session.sessionId));
    // Gộp theo từng chế độ để phiên ôn tập cũ không che mất phiên thi đang diễn ra
    const key = `${modeOf(session.mode)}#${baseKey}`;
    if (!latest.has(key) || Number(session.lastPing) > Number(latest.get(key).lastPing)) latest.set(key, session);
  }

  const active = [...latest.values()].filter(session => {
    // Nếu phiên đã đánh dấu submitted hoặc đã có bài nộp CÙNG CHẾ ĐỘ trong CSDL -> Không tính là đang làm
    if (session.status === 'submitted') return false;
    const m = modeOf(session.mode);
    if (session.sessionId && submittedKeys.has(`${m}#${session.sessionId}`)) return false;
    const lms = normalize(session.studentId);
    if (lms) {
      if (submittedKeys.has(`${m}#${lms}`)) return false;
      if (/^\d+$/.test(lms) && submittedKeys.has(`${m}#${lms.replace(/^0+/, '')}`)) return false;
      const rk = aliases.get(lms) || (/^\d+$/.test(lms) ? aliases.get(lms.replace(/^0+/, '')) : null);
      if (rk && submittedKeys.has(`${m}#${rk}`)) return false;
    }

    return ['in_progress', 'practicing', 'locked'].includes(session.status) &&
      Number(session.lastPing) > 0 && now - Number(session.lastPing) <= timeoutMs;
  });

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
