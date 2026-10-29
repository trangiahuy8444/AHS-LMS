// Kho mã đề chính thức và lượt thi theo mã LMS
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createExamBankActions(s) {
  const { teacherEmail, config, setConfig, setExamBankStatus, maxExamAttempts, setMaxExamAttempts,
    attemptGrade, attemptLms, setAttemptStatus } = s;

  // Tải mã đề chính thức (JSON kèm đáp án) lên exam_bank. Học sinh không đọc được collection này.
  const handleUploadExamBank = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (config.examBankLocked) {
      setExamBankStatus('🔒 Kho đề đang khóa. Mở khóa trước khi tải mã đề mới.');
      return;
    }
    try {
      const pkg = JSON.parse(await file.text());
      const grade = Number(pkg.grade);
      const exams = pkg.officialExams || {};
      if (![8, 9, 10].includes(grade)) throw new Error('Tệp phải có "grade" là 8, 9 hoặc 10.');
      const codes = Object.keys(exams);
      if (!codes.length) throw new Error('Tệp không có "officialExams".');
      const problems = [];
      codes.forEach(code => {
        window.AsianSchoolExamPackage.validateExam(exams[code]).forEach(msg => problems.push(`Mã ${code}: ${msg}`));
      });
      if (problems.length) throw new Error(problems.slice(0, 6).join('\n'));
      const batch = window.firebaseDb.batch();
      codes.forEach(code => {
        batch.set(window.firebaseDb.collection('exam_bank').doc(`g${grade}_${code}`), {
          grade, code, active: true, exam: exams[code],
          uploadedAt: new Date().toISOString(), uploadedBy: teacherEmail
        });
        // Bản đã bỏ đáp án cho học sinh (firestore.rules chỉ cho đọc đúng mã đề của lượt đang làm)
        batch.set(window.firebaseDb.collection('exam_public').doc(`g${grade}_${code}`), {
          grade, code, active: true, exam: window.AsianSchoolExamPackage.stripAnswers(exams[code])
        });
      });
      await batch.commit();
      window.AsianSchoolStorage.logAudit('Tải mã đề lên exam_bank', `Khối ${grade}: ${codes.join(', ')}`);
      setExamBankStatus(`✅ Đã tải ${codes.length} mã đề Khối ${grade}: ${codes.join(', ')}`);
    } catch (err) {
      setExamBankStatus('❌ ' + err.message);
    }
  };

  // Lượt thi chính thức theo mã LMS (exam_attempts/g<khối>_<MÃ LMS>, học sinh tạo khi vào phòng thi, firestore.rules kiểm tra)
  const attemptDocRef = () => {
    const key = window.AsianSchoolNormalize ? window.AsianSchoolNormalize.normalizeLmsCode(attemptLms)
      : String(attemptLms || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return key ? window.firebaseDb.collection('exam_attempts').doc(`g${attemptGrade}_${key}`) : null;
  };

  const describeAttempt = (d) => {
    const allowed = Number.isInteger(d.allowedAttempts) ? d.allowedAttempts : (config.maxExamAttempts || 1);
    const cur = d.current || {};
    const state = cur.submitted ? 'đã nộp' : 'đang làm dở';
    return `${d.fullName || ''} (${d.studentClass || ''}) - mã LMS ${d.studentId}: đã dùng ${d.attemptsUsed || 0}/${allowed} lượt; lượt gần nhất mã đề ${cur.examCode || '?'}, ${state}${cur.deviceChanges ? `, đổi thiết bị ${cur.deviceChanges} lần` : ''}.`;
  };

  const handleLookupAttempt = async () => {
    const ref = attemptDocRef();
    if (!ref) return setAttemptStatus('Nhập mã LMS.');
    const snap = await ref.get();
    setAttemptStatus(snap.exists ? describeAttempt(snap.data()) : 'Mã LMS này chưa vào phòng thi lần nào.');
  };

  const handleGrantAttempt = async () => {
    const ref = attemptDocRef();
    if (!ref) return setAttemptStatus('Nhập mã LMS.');
    try {
      const updated = await window.firebaseDb.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('Mã LMS này chưa vào phòng thi lần nào, chưa cần cấp thêm lượt.');
        const d = snap.data();
        const allowed = Number.isInteger(d.allowedAttempts) ? d.allowedAttempts : (config.maxExamAttempts || 1);
        if (d.current && !d.current.submitted) throw new Error('Học sinh đang làm dở lượt hiện tại; chờ nộp bài rồi mới cấp thêm lượt.');
        tx.update(ref, { allowedAttempts: Math.max(allowed, d.attemptsUsed || 0) + 1 });
        return { ...d, allowedAttempts: Math.max(allowed, d.attemptsUsed || 0) + 1 };
      });
      window.AsianSchoolStorage.logAudit('Cấp thêm lượt thi', `Khối ${attemptGrade} - Mã LMS ${updated.studentId}: ${updated.allowedAttempts} lượt`);
      setAttemptStatus('✅ Đã cấp thêm 1 lượt. ' + describeAttempt(updated));
    } catch (err) {
      setAttemptStatus('❌ ' + err.message);
    }
  };

  const handleSaveMaxAttempts = () => {
    const n = Math.max(1, Math.min(10, parseInt(maxExamAttempts, 10) || 1));
    setMaxExamAttempts(n);
    setConfig(window.AsianSchoolStorage.saveConfig({ maxExamAttempts: n }));
    window.AsianSchoolStorage.logAudit('Đổi số lượt thi tối đa', `${n} lượt/mã LMS`);
    setAttemptStatus(`✅ Mỗi mã LMS được làm bài thi chính thức tối đa ${n} lượt.`);
  };

  const handleToggleExamBankLock = () => {
    const locked = !config.examBankLocked;
    setConfig(window.AsianSchoolStorage.saveConfig({ examBankLocked: locked }));
    window.AsianSchoolStorage.logAudit(locked ? 'Khóa kho đề' : 'Mở khóa kho đề', locked ? 'Giữ nguyên nội dung mã đề' : 'Cho phép tải mã đề mới');
    setExamBankStatus(locked ? '🔒 Đã khóa kho đề: không thể tải đè, sửa hay xóa mã đề.' : '🔓 Đã mở khóa kho đề.');
  };

  const handleToggleExamCode = async (grade, code, active) => {
    const batch = window.firebaseDb.batch();
    batch.set(window.firebaseDb.collection('exam_bank').doc(`g${grade}_${code}`), { active }, { merge: true });
    batch.set(window.firebaseDb.collection('exam_public').doc(`g${grade}_${code}`), { active }, { merge: true });
    await batch.commit();
    window.AsianSchoolStorage.logAudit(active ? 'Bật mã đề' : 'Tắt mã đề', `Khối ${grade} - Mã ${code}`);
  };

  return { handleUploadExamBank, attemptDocRef, describeAttempt, handleLookupAttempt, handleGrantAttempt, handleSaveMaxAttempts, handleToggleExamBankLock, handleToggleExamCode };
}
