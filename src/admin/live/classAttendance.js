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
