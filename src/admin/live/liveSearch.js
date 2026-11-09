const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim();
export const isLiveSessionLocked = session => session.isLocked === true || session.status === 'locked';
export function filterLiveSessions(sessions, {query = '', studentClass = 'all', status = 'all'} = {}) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const codeQuery = normalize(query).replace(/[^a-z0-9]/g, '');
  return (sessions || []).filter(session => {
    if (studentClass !== 'all' && session.studentClass !== studentClass) return false;
    if (status === 'locked' && !isLiveSessionLocked(session)) return false;
    if (status === 'violations' && !isLiveSessionLocked(session) && Number(session.violations || 0) === 0) return false;
    const name = normalize(session.fullName), code = normalize(session.studentId).replace(/[^a-z0-9]/g, '');
    return !words.length || words.every(word => name.includes(word)) || (!!codeQuery && code.includes(codeQuery));
  }).sort((a,b) => Number(isLiveSessionLocked(b)) - Number(isLiveSessionLocked(a)));
}
