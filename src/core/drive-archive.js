/** Durable reference-only Drive outbox. Source and job share a Firestore commit. */
(function (root) {
  const SOURCES = ['submissions', 'exam_attempts', 'proctor_commands', 'exam_bank', 'practice_results'];
  function enabled() { return root.AsianSchoolRuntime?.mode !== 'local-sandbox'; }
  function route(collection, id, data) {
    if (!SOURCES.includes(collection) || !/^[A-Za-z0-9_.:-]{1,250}$/.test(id || '')) throw new Error('archive_source_invalid');
    const reminder = data?.payload?.reminder;
    const grade = Number(data?.grade ?? reminder?.grade ?? (collection === 'proctor_commands' && data?.targetSessionId === 'all' ? 0 : NaN));
    const studentClass = collection === 'exam_bank' ? '_DE_CHUNG' : String(data?.studentClass || reminder?.studentClass || (collection === 'proctor_commands' && data?.targetSessionId === 'all' ? 'all' : '')).trim();
    if (collection === 'exam_bank') {
      if (![8, 9, 10].includes(grade)) throw new Error('archive_grade_invalid');
    } else if (!(collection === 'proctor_commands' && grade === 0 && studentClass === 'all')) {
      if (![8, 9, 10].includes(grade) || !new RegExp('^' + grade + '/[0-9]{1,3}$').test(studentClass)) throw new Error('archive_class_invalid');
    }
    return { grade, studentClass };
  }
  function addArchiveWrite(batch, collection, id, data) {
    if (!enabled()) return false;
    const routing = route(collection, id, data);
    const fields = root.firebase?.firestore?.FieldValue || (typeof firebase !== 'undefined' && firebase.firestore?.FieldValue);
    if (!root.firebaseDb || !fields || !batch?.set) throw new Error('archive_firestore_unavailable');
    batch.set(root.firebaseDb.collection('drive_archive_jobs').doc(collection + '_' + id), {
      sourceCollection: collection, sourceId: id, ...routing,
      revision: fields.increment(1), pending: true, requestedAt: fields.serverTimestamp()
    }, { merge: true });
    return true;
  }
  async function writeCanonical(collection, id, data, options, routeData) {
    // Validate before adding even the canonical write; never commit half a pair.
    if (enabled()) route(collection, id, routeData || data);
    const batch = root.firebaseDb.batch();
    const ref = root.firebaseDb.collection(collection).doc(id);
    if (options) batch.set(ref, data, options);
    else batch.set(ref, data);
    addArchiveWrite(batch, collection, id, routeData || data);
    return batch.commit();
  }
  const api = { SOURCES, enabled, route, addArchiveWrite, writeCanonical };
  root.AsianSchoolDriveArchive = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
