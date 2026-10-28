import React, { useState, useEffect, useMemo, useRef } from 'react';

function AdminApp() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navigation: 6 Core Tabs
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'submissions' | 'answers' | 'analytics' | 'print' | 'config'
  
  // Data state
  const [liveSessions, setLiveSessions] = useState([]);
  const [liveFilter, setLiveFilter] = useState('all'); // 'all' | 'exam' | 'practice'
  const [submissions, setSubmissions] = useState([]);
  const [config, setConfig] = useState(window.AsianSchoolStorage.getConfig());
  const [auditLogs, setAuditLogs] = useState([]);

  // Submissions filtering & grading
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [filterGraded, setFilterGraded] = useState('all'); // 'all' | 'graded' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Grading modal state
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [tempEssayScores, setTempEssayScores] = useState({});
  const [tempFeedback, setTempFeedback] = useState('');
  const [gradingSuccessAlert, setGradingSuccessAlert] = useState(false);

  // Proctor Broadcast & Messaging Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('all'); // 'all' or sessionId
  const [broadcastMsgInput, setBroadcastMsgInput] = useState('');
  const [individualMsgTarget, setIndividualMsgTarget] = useState(null);

  // Master Answer Key Tab State
  const [answerGrade, setAnswerGrade] = useState(8);
  const [answerType, setAnswerType] = useState('practice'); // 'practice' | '101' | '102' | '103' | '104'

  // Print Gradebook Tab State
  const [printClass, setPrintClass] = useState('8/19');
  const [printType, setPrintType] = useState('exam'); // 'exam' | 'practice'
  const [practiceSubs, setPracticeSubs] = useState([]);

  // Danh sách lớp theo khối
  const ALL_CLASSES_BY_GRADE = {
    8: ['8/19', '8/20', '8/21', '8/22', '8/23'],
    9: ['9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26'],
    10: ['10/14', '10/15', '10/16']
  };

  // Cloud Sync State
  const [cloudStatus, setCloudStatus] = useState(window.AsianSchoolCloudSyncStatus || { connected: false });

  // Config Tab States
  const [newExamPassword, setNewExamPassword] = useState(config.examPassword || '');
  const [examBankStatus, setExamBankStatus] = useState('');
  const [, setExamBankVersion] = useState(0);
  const [maxExamAttempts, setMaxExamAttempts] = useState(config.maxExamAttempts || 1);
  const [attemptGrade, setAttemptGrade] = useState('9');
  const [attemptLms, setAttemptLms] = useState('');
  const [attemptStatus, setAttemptStatus] = useState('');
  const [configSavedNotice, setConfigSavedNotice] = useState('');

  // Thời gian làm bài & Xáo trộn đề
  const [examDurationMinutes, setExamDurationMinutes] = useState(config.examDurationMinutes || 45);
  const [practiceDurationMinutes, setPracticeDurationMinutes] = useState(config.practiceDurationMinutes || 0);
  const [shuffleQuestions, setShuffleQuestions] = useState(config.shuffleQuestions !== false);
  const [shuffleOptions, setShuffleOptions] = useState(config.shuffleOptions !== false);
  const [requireAllQuestionsAnswered, setRequireAllQuestionsAnswered] = useState(config.requireAllQuestionsAnswered || false);

  // Google Drive & Retention States
  const [googleDriveUrl, setGoogleDriveUrl] = useState(config.googleDriveWebhookUrl || '');
  const [googleDriveToken, setGoogleDriveToken] = useState(config.googleDriveWebhookToken || '');
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveSyncNotice, setDriveSyncNotice] = useState('');
  const [isTestingDrive, setIsTestingDrive] = useState(false);
  const [driveTestMessage, setDriveTestMessage] = useState(null);
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState(false);
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);
  const retentionSummary = useMemo(() => {
    if (typeof window !== 'undefined' && window.AsianSchoolStorage && window.AsianSchoolStorage.getExamRetentionSummary) {
      return window.AsianSchoolStorage.getExamRetentionSummary();
    }
    return { totalCount: 0, daysActive: 0, retentionDays: 21, isNearExpiry: false, isExpired: false };
  }, [submissions, config]);

  const fileInputRef = useRef(null);

  // Toast & Dialog Tĩnh (Không nhảy giật, thay thế hoàn toàn alert/confirm)
  const [adminToast, setAdminToast] = useState(null);
  const [adminDialog, setAdminDialog] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'success', title = '') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setAdminToast({ message, type, title });
    toastTimerRef.current = setTimeout(() => {
      setAdminToast(null);
    }, 4000);
  };

  const showDialog = (title, message, type = 'info', onConfirm = null) => {
    setAdminDialog({ title, message, type, onConfirm });
  };

  // Auth Check
  useEffect(() => {
    // Chỉ tài khoản Firebase Auth có custom claim teacher mới vào được bảng điều khiển
    const unsubAuth = window.AsianSchoolAuth
      ? window.AsianSchoolAuth.onChange((state) => {
          setAuthReady(true);
          setIsAuthenticated(!!state.isTeacher);
          setTeacherEmail(state.user && !state.user.isAnonymous ? (state.user.email || '') : '');
          if (state.user && !state.user.isAnonymous && !state.isTeacher) {
            setLoginError(`Tài khoản ${state.user.email || ''} không có quyền quản trị. Thầy đăng xuất và chọn đúng tài khoản Google giáo viên.`);
          }
        })
      : (() => { setAuthReady(true); setLoginError('Chưa kết nối được Firebase Auth.'); return () => {}; })();

    const onCloudSync = (e) => setCloudStatus(e.detail || { connected: false });
    // exam_bank thay đổi -> vẽ lại các tab Đáp án, Chấm tự luận, Kho mã đề
    const onExamBank = () => setExamBankVersion(v => v + 1);
    window.addEventListener('asian-school-cloud-sync', onCloudSync);
    window.addEventListener('asian-school-exam-bank', onExamBank);
    return () => {
      unsubAuth();
      window.removeEventListener('asian-school-cloud-sync', onCloudSync);
      window.removeEventListener('asian-school-exam-bank', onExamBank);
    };
  }, []);

  // Realtime Data Sync
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshData = () => {
      setLiveSessions(window.AsianSchoolStorage.getLiveSessions());
      setSubmissions(window.AsianSchoolStorage.getSubmissions());
      if (window.AsianSchoolStorage.getPracticeSubmissions) {
        setPracticeSubs(window.AsianSchoolStorage.getPracticeSubmissions());
      }
      setConfig(window.AsianSchoolStorage.getConfig());
      setAuditLogs(window.AsianSchoolStorage.getAuditLogs());
    };

    refreshData();

    const unsubLive = window.AsianSchoolStorage.onLiveChange(() => setLiveSessions(window.AsianSchoolStorage.getLiveSessions()));
    const unsubSub = window.AsianSchoolStorage.onSubmissionsChange(() => setSubmissions(window.AsianSchoolStorage.getSubmissions()));
    const unsubCfg = window.AsianSchoolStorage.onConfigChange(() => setConfig(window.AsianSchoolStorage.getConfig()));
    const unsubPrac = window.AsianSchoolStorage.onPracticeSubmissionChange
      ? window.AsianSchoolStorage.onPracticeSubmissionChange(() => setPracticeSubs(window.AsianSchoolStorage.getPracticeSubmissions()))
      : () => {};

    const interval = setInterval(refreshData, 3500);

    return () => {
      unsubLive();
      unsubSub();
      unsubCfg();
      unsubPrac();
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await window.AsianSchoolAuth.signInTeacher();
    } catch (err) {
      setLoginError('Đăng nhập Google chưa thành công: ' + (err.message || err.code));
    }
  };

  const handleLogout = () => {
    // Tải lại trang để gỡ toàn bộ listener Firestore của phiên giáo viên
    window.AsianSchoolAuth.signOut().finally(() => window.location.reload());
  };

  // --- CÁC HÀNH ĐỘNG GIÁM THỊ (PROCTOR ACTIONS) ---

  const handleExtendTime = (sessionId, studentName, minutes = 5) => {
    showDialog(
      'Gia Hạn Thời Gian Làm Bài ⏱️',
      `Xác nhận GIA HẠN THÊM ${minutes} PHÚT làm bài cho học sinh ${studentName}?`,
      'info',
      () => {
        window.AsianSchoolStorage.sendProctorCommand(sessionId, 'extend_time', { minutes });
        showToast(`Đã gửi lệnh gia hạn thêm ${minutes} phút cho ${studentName}!`, 'success', 'Gia Hạn Thành Công ⏱️');
      }
    );
  };

  const handleExtendTimeAll = (minutes = 5) => {
    showDialog(
      'Gia Hạn Toàn Bộ Phòng Thi ⏱️',
      `Xác nhận GIA HẠN THÊM ${minutes} PHÚT làm bài cho TOÀN BỘ PHÒNG THI ĐANG ONLINE?`,
      'warning',
      () => {
        window.AsianSchoolStorage.sendProctorCommand('all', 'extend_time', { minutes });
        showToast(`Đã gửi lệnh gia hạn thêm ${minutes} phút cho toàn bộ phòng thi!`, 'success', 'Gia Hạn Toàn Phòng ⏱️');
      }
    );
  };

  const handleForceSubmit = (sessionId, studentName) => {
    showDialog(
      'Cưỡng Chế Thu Bài Thi 🛑',
      `CẢNH BÁO: Thầy có chắc chắn muốn CƯỠNG CHẾ THU BÀI của thí sinh ${studentName} ngay bây giờ không? Màn hình của thí sinh sẽ lập tức nộp bài và khóa lại.`,
      'warning',
      () => {
        window.AsianSchoolStorage.sendProctorCommand(sessionId, 'force_submit', { reason: 'Giáo viên thu bài cưỡng chế' });
        showToast(`Đã gửi lệnh thu bài cưỡng chế tới máy thí sinh ${studentName}!`, 'warning', 'Lệnh Thu Bài 🛑');
      }
    );
  };

  const handleLockSession = (sessionId, studentName) => {
    showDialog(
      'Khóa Bài Thi Thí Sinh 🔒',
      `Xác nhận KHÓA BÀI THI của thí sinh ${studentName}? Màn hình của học sinh sẽ bị phong tỏa ngay lập tức.`,
      'warning',
      () => {
        window.AsianSchoolStorage.sendProctorCommand(sessionId, 'lock_session', { reason: 'Giáo viên chủ động khóa bài' });
        window.AsianSchoolStorage.updateLiveSession({ sessionId, status: 'locked', isLocked: true });
        showToast(`Đã gửi lệnh khóa bài thi thí sinh ${studentName}!`, 'warning', 'Khóa Bài Thi 🔒');
      }
    );
  };

  const handleUnlockSession = (sessionId, studentName) => {
    showDialog(
      'Mở Khóa Bài Thi 🔓',
      `Xác nhận MỞ KHÓA BÀI THI cho thí sinh ${studentName}? Thí sinh sẽ được tiếp tục làm bài.`,
      'info',
      () => {
        window.AsianSchoolStorage.sendProctorCommand(sessionId, 'unlock_session', {});
        window.AsianSchoolStorage.updateLiveSession({ sessionId, status: 'in_progress', isLocked: false });
        showToast(`Đã gửi lệnh mở khóa bài thi cho thí sinh ${studentName}!`, 'success', 'Mở Khóa Thành Công 🔓');
      }
    );
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsgInput.trim()) return;
    window.AsianSchoolStorage.sendProctorCommand(broadcastTarget, 'broadcast_message', { message: broadcastMsgInput.trim() });
    showToast(`Đã phát thông báo thành công tới ${broadcastTarget === 'all' ? 'Toàn bộ phòng thi' : 'Học sinh'}!`, 'success', 'Phát Thông Báo 📢');
    setBroadcastMsgInput('');
    setShowBroadcastModal(false);
  };

  // --- ĐIỀU PHỐI CA THI THEO TỪNG LỚP HỌC (CLASS ACCESS CONTROL) ---

  const handleSetClassMode = (cls, newMode) => {
    window.AsianSchoolStorage.setClassAccessMode(cls, newMode);
    setConfig(window.AsianSchoolStorage.getConfig());
  };

  const handleQuickStartExam = (cls) => {
    if (confirm(`Kích hoạt ca thi chính thức 45 phút cho Lớp ${cls}?\n\nChỉ học sinh Lớp ${cls} mới được vào thi; các lớp còn lại vẫn ở chế độ Ôn tập đề cương.`)) {
      window.AsianSchoolStorage.setQuickExamClass(cls);
      setConfig(window.AsianSchoolStorage.getConfig());
    }
  };

  const handleCloseAllExams = () => {
    showDialog(
      'Đóng Toàn Bộ Ca Thi',
      'Chuyển toàn bộ các lớp về chế độ ÔN TẬP ĐỀ CƯƠNG?',
      'warning',
      () => {
        window.AsianSchoolStorage.closeAllExamSessions();
        setConfig(window.AsianSchoolStorage.getConfig());
        showToast('Đã đóng tất cả ca thi! Toàn trường về chế độ ôn tập.', 'success', 'Điều Phối Lớp');
      }
    );
  };

  const handleRemoveCandidate = (sessionId, studentName) => {
    showDialog(
      'Xóa Thí Sinh Khỏi Phòng Thi 🗑️',
      `Xác nhận XÓA thí sinh ${studentName} khỏi danh sách giám sát trực tuyến?`,
      'warning',
      () => {
        window.AsianSchoolStorage.removeLiveSession(sessionId);
        setLiveSessions(window.AsianSchoolStorage.getLiveSessions());
        showToast(`Đã xóa thí sinh ${studentName} khỏi danh sách trực tuyến!`, 'success', 'Xóa Thí Sinh');
      }
    );
  };

  const handleClearClassSessions = (cls) => {
    showDialog(
      `Dọn Dẹp Thí Sinh Lớp ${cls} 🗑️`,
      `Thầy có chắc chắn muốn XÓA TOÀN BỘ thí sinh của Lớp ${cls} khỏi phòng thi trực tuyến để chuẩn bị cho ca thi kế tiếp không?`,
      'warning',
      () => {
        const res = window.AsianSchoolStorage.clearLiveSessionsByClass(cls);
        setLiveSessions(window.AsianSchoolStorage.getLiveSessions());
        showToast(`Đã dọn dẹp ${res.count} thí sinh của Lớp ${cls}!`, 'success', `Lớp ${cls}`);
      }
    );
  };

  const handleCleanStaleSessions = () => {
    showDialog(
      'Dọn Dẹp Thí Sinh Đã Nộp / Hết Ca 🧹',
      'Hệ thống sẽ xóa khỏi danh sách giám sát tất cả thí sinh đã nộp bài thành công hoặc không gửi tín hiệu quá 15 phút. Thầy có muốn tiếp tục?',
      'info',
      () => {
        const res = window.AsianSchoolStorage.cleanStaleLiveSessions(15);
        setLiveSessions(window.AsianSchoolStorage.getLiveSessions());
        showToast(`Đã dọn dẹp ${res.count} thí sinh không còn hoạt động!`, 'success', 'Dọn Dẹp Tự Động');
      }
    );
  };

  const handleDeleteSubmission = (subId, studentName, examCode) => {
    showDialog(
      'Xác Nhận Xóa Bài Nộp 🗑️',
      `CẢNH BÁO: Thầy có chắc chắn muốn XÓA bài nộp của học sinh ${studentName} (${examCode}) không? Dữ liệu này sẽ bị xóa khỏi hệ thống.`,
      'error',
      () => {
        const res = window.AsianSchoolStorage.deleteSubmission(subId);
        if (res.success) {
          setSubmissions(window.AsianSchoolStorage.getSubmissions());
          showToast(`Đã xóa bài nộp của ${studentName}!`, 'success', 'Xóa Bài Nộp');
        } else {
          showDialog('Lỗi Xóa Bài Nộp', res.error, 'error');
        }
      }
    );
  };

  // --- CHẤM ĐIỂM TỰ LUẬN ---

  const openGradingModal = (sub) => {
    setGradingSubmission(sub);
    setTempEssayScores(sub.essayScores || {});
    setTempFeedback(sub.teacherFeedback || '');
    setGradingSuccessAlert(false);
  };

  const handleSaveGrading = () => {
    if (!gradingSubmission) return;
    const res = window.AsianSchoolStorage.gradeEssaySubmission(gradingSubmission.id, tempEssayScores, tempFeedback);
    if (res.success) {
      setGradingSubmission(res.submission);
      setSubmissions(window.AsianSchoolStorage.getSubmissions());
      setGradingSuccessAlert(true);
      setTimeout(() => setGradingSuccessAlert(false), 2500);
    } else {
      showDialog('Lỗi Chấm Điểm', res.error, 'error');
    }
  };

  // --- XUẤT CSV & SAO LƯU ---

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      showDialog('Chưa Có Bài Nộp', 'Chưa có bài nộp nào trong hệ thống để xuất tệp CSV.', 'warning');
      return;
    }
    const csvContent = window.AsianSchoolStorage.exportSubmissionsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BangDiem_TinHoc_AsianSchool_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setHasDownloadedBackup(true);
    showToast('Đã tải xuống tệp bảng điểm CSV thành công!', 'success', 'Xuất File CSV');
  };

  const handleExportJSON = () => {
    const jsonContent = window.AsianSchoolStorage.exportSubmissionsJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AsianSchool_Submissions_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setHasDownloadedBackup(true);
    showToast('Đã tải xuống tệp sao lưu JSON thành công!', 'success', 'Sao Lưu JSON');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = window.AsianSchoolStorage.importSubmissionsJSON(event.target.result);
      if (res.success) {
        setSubmissions(window.AsianSchoolStorage.getSubmissions());
        showDialog('✅ Hợp Nhất Dữ Liệu Thành Công', `Đã thêm mới ${res.added} bài nộp vào hệ thống.\nTổng số bài hiện tại: ${res.count} bài.`, 'success');
      } else {
        showDialog('❌ Lỗi Khi Nhập Tệp', res.error, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllData = () => {
    showDialog(
      'CẢNH BÁO NGUY HIỂM: XÓA TRẮNG DỮ LIỆU',
      'Thầy có chắc chắn muốn XÓA TOÀN BỘ dữ liệu bài thi và lịch sử làm bài không? Hành động này sẽ xóa sạch dữ liệu trên máy tính này và KHÔNG THỂ HOÀN TÁC!',
      'error',
      () => {
        localStorage.removeItem('asian_school_submissions_v1');
        localStorage.removeItem('asian_school_live_sessions_v1');
        setSubmissions([]);
        setLiveSessions([]);
        showToast('Đã xóa trắng toàn bộ dữ liệu bài làm trên máy.', 'warning', 'Xóa Dữ Liệu');
      }
    );
  };

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
    const key = String(attemptLms || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
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

  // --- CẤU HÌNH THỜI GIAN & TRỘN ĐỀ THI HANDLER ---

  const handleSaveExamConfig = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const updated = window.AsianSchoolStorage.saveConfig({
      examDurationMinutes: parseInt(examDurationMinutes, 10) || 45,
      practiceDurationMinutes: parseInt(practiceDurationMinutes, 10) || 0,
      shuffleQuestions: !!shuffleQuestions,
      shuffleOptions: !!shuffleOptions,
      requireAllQuestionsAnswered: !!requireAllQuestionsAnswered
    });
    setConfig(updated);
    setConfigSavedNotice('Đã lưu cấu hình thời gian, quy chế và chế độ trộn đề thành công!');
    setTimeout(() => setConfigSavedNotice(''), 3000);
  };

  // --- GOOGLE DRIVE & VÒNG ĐỜI KỲ THI HANDLERS ---

  const handleSaveGoogleDriveUrl = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    window.AsianSchoolStorage.saveConfig({
      googleDriveWebhookUrl: googleDriveUrl.trim(),
      googleDriveWebhookToken: googleDriveToken.trim()
    });
    setConfig(window.AsianSchoolStorage.getConfig());
    setConfigSavedNotice('Đã lưu cấu hình Google Drive Webhook thành công!');
    setTimeout(() => setConfigSavedNotice(''), 3000);
  };

  const handleTestGoogleDrive = async () => {
    if (!googleDriveUrl.trim()) {
      showDialog('Thiếu URL Webhook', 'Vui lòng dán URL Webhook Google Drive trước khi bấm kiểm tra!', 'warning');
      return;
    }
    setIsTestingDrive(true);
    setDriveTestMessage({ success: null, text: 'Đang gửi gói tin kiểm tra tới Webhook...' });
    const res = await window.AsianSchoolStorage.testGoogleDriveConnection(googleDriveUrl.trim(), googleDriveToken.trim());
    setIsTestingDrive(false);
    if (res.success) {
      setDriveTestMessage({
        success: true,
        text: res.message || 'Đã kết nối thành công! Vui lòng mở Google Sheets để kiểm tra dòng dữ liệu mẫu vừa được thêm.'
      });
    } else {
      setDriveTestMessage({
        success: false,
        text: res.error || 'Lỗi kết nối Webhook! Hãy kiểm tra lại xem bản triển khai Web App đã chọn "Anyone" chưa.'
      });
    }
    setTimeout(() => setDriveTestMessage(null), 12000);
  };

  const handleSyncAllGoogleDrive = async () => {
    if (!googleDriveUrl.trim()) {
      showDialog('Thiếu URL Webhook', 'Vui lòng nhập URL Webhook Google Drive trước khi thực hiện đồng bộ!', 'warning');
      return;
    }
    setIsSyncingDrive(true);
    setDriveSyncNotice('Đang kết nối và sao lưu toàn bộ dữ liệu kỳ thi lên Google Drive...');
    const res = await window.AsianSchoolStorage.syncAllToGoogleDrive();
    setIsSyncingDrive(false);
    if (res.success) {
      setDriveSyncNotice(`✅ ĐÃ SAO LƯU THÀNH CÔNG ${res.count} BÀI THI LÊN GOOGLE DRIVE!`);
      setHasDownloadedBackup(true);
    } else {
      setDriveSyncNotice(`⚠️ Lỗi đồng bộ: ${res.error}`);
    }
    setTimeout(() => setDriveSyncNotice(''), 6000);
  };

  const handlePurgeExamData = () => {
    showDialog(
      'Xác Nhận Dọn Dẹp Kỳ Thi Cũ 🗑️',
      'Hành động này sẽ dọn dẹp các bài thi cũ sau 2-3 tuần để chuẩn bị cho đợt thi mới.\n\nKhuyến nghị: Thầy đã tải bản sao lưu (CSV/JSON) hoặc đồng bộ lên Google Drive trước khi dọn dẹp.\n\nThầy có chắc chắn muốn dọn dẹp dữ liệu cũ ngay bây giờ không?',
      'warning',
      () => {
        const res = window.AsianSchoolStorage.purgeOldExamSubmissions({ purgeAll: true });
        setSubmissions(window.AsianSchoolStorage.getSubmissions());
        showDialog('✅ Đã Dọn Dẹp Kỳ Thi Thành Công', `Đã xóa an toàn ${res.deletedCount} bài thi cũ.\nHệ thống đã sẵn sàng cho đợt thi mới!`, 'success');
      }
    );
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (filterGrade !== 'all' && s.grade !== parseInt(filterGrade)) return false;
      if (filterClass !== 'all' && s.studentClass !== filterClass) return false;
      if (filterMode !== 'all' && s.mode !== filterMode) return false;
      if (filterGraded === 'graded' && !s.isGraded) return false;
      if (filterGraded === 'pending' && (s.isGraded || s.mode !== 'exam')) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (s.fullName || '').toLowerCase().includes(q);
        const matchLms = (s.studentId || '').toLowerCase().includes(q);
        if (!matchName && !matchLms) return false;
      }
      return true;
    });
  }, [submissions, filterGrade, filterClass, filterMode, filterGraded, searchQuery]);

  // Dữ liệu cho Master Answer Key
  const currentAnswerData = answerGrade === 8
    ? window.EXAM_DATA_G8
    : (answerGrade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);

  // Thống kê phân tích (Analytics)
  const analyticsData = useMemo(() => {
    const examSubs = submissions.filter(s => s.mode === 'exam');
    const scores = examSubs.map(s => s.finalScore !== undefined ? s.finalScore : (s.score !== undefined ? s.score : s.mcqPoints || 0));
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
    const max = scores.length > 0 ? Math.max(...scores).toFixed(1) : 0;
    const min = scores.length > 0 ? Math.min(...scores).toFixed(1) : 0;

    // Phổ điểm
    const distribution = {
      gioi: scores.filter(sc => sc >= 8.0).length,
      kha: scores.filter(sc => sc >= 6.5 && sc < 8.0).length,
      trungBinh: scores.filter(sc => sc >= 5.0 && sc < 6.5).length,
      chuaDat: scores.filter(sc => sc < 5.0).length
    };

    // Item Analysis: Thống kê các câu trắc nghiệm sai nhiều nhất từ bài thi
    const mcqMistakeMap = {};
    examSubs.forEach(sub => {
      if (sub.answers?.mcq && sub.examCode) {
        const gradeObj = sub.grade === 8 ? window.EXAM_DATA_G8 : (sub.grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
        const examObj = gradeObj?.officialExams?.[sub.examCode];
        const qList = sub.grade === 10 ? examObj?.part1_mcq : examObj?.mcqQuestions;
        if (qList) {
          qList.forEach(q => {
            const userAns = sub.answers.mcq[q.num];
            if (userAns !== undefined && userAns !== q.correctAnswer) {
              const key = `K${sub.grade}_C${q.num}_${q.question.slice(0, 45)}...`;
              mcqMistakeMap[key] = (mcqMistakeMap[key] || 0) + 1;
            }
          });
        }
      }
    });

    const topMistakes = Object.entries(mcqMistakeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([qText, count]) => ({ qText, count }));

    return {
      totalExams: examSubs.length,
      avg,
      max,
      min,
      passRate: examSubs.length > 0 ? (((distribution.gioi + distribution.kha + distribution.trungBinh) / examSubs.length) * 100).toFixed(1) : 0,
      distribution,
      topMistakes
    };
  }, [submissions]);

  // Màn hình đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-slate-900">
          <div className="text-center space-y-3">
            <img
              src={window.ASIAN_SCHOOL_LOGO_BASE64 || "../assets/logo_asian_school.png"}
              alt="Asian School"
              className="h-16 mx-auto object-contain"
            />
            <h1 className="text-lg font-black tracking-tight text-blue-950 uppercase">
              TRƯỜNG QUỐC TẾ Á CHÂU
            </h1>
            <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
              CỔNG QUẢN TRỊ KHẢO THÍ — THẦY TRẦN GIA HUY
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-xs text-slate-600 text-center">
              Đăng nhập bằng tài khoản Google giáo viên đã được cấp quyền quản trị.
            </p>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={!authReady}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-blue-600/30 uppercase tracking-wider"
            >
              Đăng Nhập Bằng Google
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <a href="../index.html" className="text-xs text-slate-500 hover:text-blue-700 font-semibold transition">
              ← Về Cổng Khảo Thí Học Sinh
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      
      {/* HEADER CHÍNH CHUẨN ASIAN SCHOOL */}
      <header className="bg-[#1e3a8a] text-white shadow-md sticky top-0 z-40 border-b-2 border-amber-400 no-print">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-2xl shadow-sm">
              <img
                src={window.ASIAN_SCHOOL_LOGO_BASE64 || "../assets/logo_asian_school.png"}
                alt="Logo Asian School"
                className="h-11 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${cloudStatus?.connected ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-blue-900/60 text-blue-200 border border-blue-700'}`} title={cloudStatus?.connected ? 'Đang đồng bộ thời gian thực với Cloud Firestore (ahs-lms)' : 'Đang chạy lưu trữ cục bộ LocalStorage'}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cloudStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`}></span>
                  <span>{cloudStatus?.connected ? 'Firebase Cloud' : 'Offline Mode'}</span>
                </span>
                <h1 className="font-black text-sm sm:text-base text-white tracking-wide uppercase">
                  HỆ THỐNG ĐIỀU HÀNH KHẢO THÍ & CHẤM ĐIỂM
                </h1>
              </div>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                TRƯỜNG QUỐC TẾ Á CHÂU • GIÁO VIÊN: <span className="text-white">THẦY TRẦN GIA HUY</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowBroadcastModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow flex items-center space-x-1.5"
            >
              <span>📢</span>
              <span className="hidden sm:inline">Phát Thông Báo Khẩn</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-white text-xs font-bold border border-blue-700 transition"
            >
              Đăng Xuất 🚪
            </button>
          </div>
        </div>

        {/* THANH ĐIỀU HƯỚNG 6 TABS */}
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 overflow-x-auto border-t border-blue-900/80">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'live'
                ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <span>📡</span>
            <span>Giám Sát & Lệnh Giám Thị</span>
            {liveSessions.filter(s => s.status === 'in_progress').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'submissions'
                ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <span>📋</span>
            <span>CSDL & Chấm Tự Luận</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-900 text-[10px] text-amber-300 font-mono">
              {submissions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('answers')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'answers'
                ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <span>🔑</span>
            <span>Tra Cứu Đáp Án Master</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'analytics'
                ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <span>📊</span>
            <span>Phân Tích Phổ Điểm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('print')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'print'
                ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <span>🖨️</span>
            <span>In Bảng Điểm A4 Asian School</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
            }`}
          >
            <span>⚙️</span>
            <span>Cấu Hình & Bảo Mật</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full no-print">
        
        {/* TAB 1: GIÁM SÁT TRỰC TIẾP & ĐIỀU KHIỂN GIÁM THỊ */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
              <div>
                <h2 className="text-base font-black text-blue-950 flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>PHÒNG THI TRỰC TUYẾN THỜI GIAN THỰC</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Giám thị toàn diện: Theo dõi đồng hồ, phát hiện gian lận và can thiệp kịp thời (gia hạn, mở khóa, thu bài).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCleanStaleSessions}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5 shadow-sm"
                  title="Xóa thí sinh đã nộp bài hoặc mất kết nối quá 15 phút"
                >
                  <span>🧹</span>
                  <span>Dọn Thí Sinh Hết Ca (&gt; 15p)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExtendTimeAll(5)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow"
                >
                  <span>⏱️</span>
                  <span>Cộng +5 Phút Toàn Phòng</span>
                </button>
                <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
                  Đang làm bài: {liveSessions.filter(s => s.status === 'in_progress').length} em
                </span>
              </div>
            </div>

            {/* BẢNG ĐIỀU PHỐI CA THI THEO LỚP HỌC (CLASS ACCESS CONTROL MATRIX) */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🎛️</span>
                  <div>
                    <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider">
                      ĐIỀU PHỐI CA THI THEO TỪNG LỚP HỌC
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Bật/Tắt độc lập: Lớp nào đến giờ thi thì mở ca thi chính thức; các lớp khác vẫn tự do ôn tập 24/7.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseAllExams}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center space-x-1"
                >
                  <span>🔄</span>
                  <span>Đóng Toàn Bộ Ca Thi (Về Ôn Tập)</span>
                </button>
              </div>
              <div className="space-y-3">
                {[8, 9, 10].map(g => (
                  <div key={g} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-black text-xs text-blue-900 uppercase w-20 shrink-0">Khối {g}:</span>
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {(ALL_CLASSES_BY_GRADE[g] || []).map(cls => {
                        const accessMode = (config.classAccessControl && config.classAccessControl[cls]) || config.defaultClassMode || 'practice_only';
                        const isExam = accessMode === 'exam_only';
                        const isBoth = accessMode === 'both_open';
                        const isClosed = accessMode === 'closed';
                        return (
                          <div
                            key={cls}
                            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center space-x-2 transition shadow-sm ${
                              isExam
                                ? 'bg-red-50 border-red-400 text-red-800 ring-1 ring-red-400/50'
                                : (isBoth
                                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                                    : (isClosed
                                        ? 'bg-slate-100 border-slate-300 text-slate-400'
                                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'))
                            }`}
                          >
                            <span className="font-extrabold font-mono-code">{cls}</span>
                            <span className="text-[10px] font-bold">
                              {isExam ? '🔴 Đang Thi' : (isBoth ? '🟡 Cả 2' : (isClosed ? '⚫ Khóa' : '🟢 Ôn Tập'))}
                            </span>
                            {isExam ? (
                              <button
                                type="button"
                                onClick={() => handleSetClassMode(cls, 'practice_only')}
                                className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 transition"
                              >
                                Tắt Thi
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickStartExam(cls)}
                                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-[10px] font-black text-white transition shadow"
                              >
                                Bật Thi
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BỘ LỌC CHẾ ĐỘ GIÁM SÁT TRỰC TIẾP */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              <button
                type="button"
                onClick={() => setLiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  liveFilter === 'all'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm'
                }`}
              >
                <span>Tất Cả Thí Sinh</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono-code font-bold">
                  {liveSessions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLiveFilter('exam')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  liveFilter === 'exam'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm'
                }`}
              >
                <span>📝 Đang Thi Chính Thức</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono-code font-bold">
                  {liveSessions.filter(s => s.mode === 'exam').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLiveFilter('practice')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  liveFilter === 'practice'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm'
                }`}
              >
                <span>📖 Đang Ôn Tập Đề Cương</span>
                <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono-code font-bold">
                  {liveSessions.filter(s => s.mode === 'practice').length}
                </span>
              </button>
            </div>

            <div className="space-y-6">
              {(() => {
                const filteredLive = liveSessions.filter(s => {
                  if (liveFilter === 'exam') return s.mode === 'exam';
                  if (liveFilter === 'practice') return s.mode === 'practice';
                  return true;
                });

                if (filteredLive.length === 0) {
                  return (
                    <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border-2 border-slate-200">
                      {liveFilter === 'all'
                        ? 'Hiện tại chưa có học sinh nào đang mở cổng làm bài.'
                        : (liveFilter === 'exam' ? 'Hiện không có học sinh nào đang thi chính thức.' : 'Hiện không có học sinh nào đang trong ca ôn tập đề cương.')}
                    </div>
                  );
                }

                // Phân nhóm theo Lớp học
                const classGroups = {};
                filteredLive.forEach(session => {
                  const cls = session.studentClass || 'Chưa rõ';
                  if (!classGroups[cls]) classGroups[cls] = [];
                  classGroups[cls].push(session);
                });

                return Object.keys(classGroups).sort().map(cls => {
                  const sessionsInClass = classGroups[cls];
                  const lockedCount = sessionsInClass.filter(s => s.status === 'locked' || s.isLocked || (s.violations >= 3)).length;
                  const examCount = sessionsInClass.filter(s => s.mode === 'exam').length;
                  const practiceCount = sessionsInClass.filter(s => s.mode === 'practice').length;

                  return (
                    <div key={cls} className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <span className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 border border-blue-200 font-black text-sm flex items-center justify-center">
                            {cls}
                          </span>
                          <div>
                            <h3 className="font-black text-base text-blue-950 uppercase">
                              LỚP {cls}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              Sĩ số trực tuyến: <strong className="text-blue-900 font-bold">{sessionsInClass.length} học sinh</strong>
                              {' '}• Đang thi: <span className="font-bold text-red-600">{examCount}</span>
                              {' '}• Ôn tập: <span className="font-bold text-purple-600">{practiceCount}</span>
                              {lockedCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px] border border-red-300">
                                  🚨 {lockedCount} em bị khóa
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleClearClassSessions(cls)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition flex items-center space-x-1"
                            title={`Dọn dẹp toàn bộ thí sinh Lớp ${cls} khi chuyển sang ca thi lớp mới`}
                          >
                            <span>🗑️</span>
                            <span>Xóa Lớp Này</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              sessionsInClass.forEach(s => window.AsianSchoolStorage.sendProctorCommand(s.sessionId, 'extend_time', { minutes: 5 }));
                              showToast(`Đã gia hạn +5 phút cho toàn bộ học sinh Lớp ${cls}!`, 'success', `Lớp ${cls}`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition flex items-center space-x-1"
                          >
                            <span>⏱️</span>
                            <span>+5p Cả Lớp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBroadcastTarget('all');
                              setBroadcastMsgInput(`Thông báo riêng tới Lớp ${cls}: `);
                              setShowBroadcastModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center space-x-1"
                          >
                            <span>📢</span>
                            <span>Nhắn Cả Lớp</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sessionsInClass.map(session => {
                          const isLocked = session.status === 'locked' || session.isLocked || (session.violations >= 3);
                          const isPractice = session.mode === 'practice';
                          return (
                            <div
                              key={session.sessionId}
                              className={`p-4 rounded-2xl border-2 transition shadow-sm space-y-3 ${
                                isLocked
                                  ? 'bg-red-50 border-red-400 ring-2 ring-red-400/50'
                                  : (session.violations > 0
                                      ? 'bg-amber-50/60 border-amber-300'
                                      : (isPractice ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'))
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-black text-sm text-slate-900">{session.fullName || 'Chưa nhập tên'}</h4>
                                    {isPractice && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                        ÔN TẬP
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Lớp <strong className="text-slate-800">{session.studentClass}</strong> • Khối {session.grade} {session.studentId && `• Mã LMS: ${session.studentId}`}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                  isLocked
                                    ? 'bg-red-600 text-white'
                                    : (session.status === 'submitted'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                        : (isPractice
                                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'))
                                }`}>
                                  {isLocked
                                    ? '🚨 BỊ KHÓA'
                                    : (session.status === 'submitted'
                                        ? 'Đã nộp bài'
                                        : (isPractice ? '📖 Ôn tập' : '📝 Đang thi'))}
                                </span>
                              </div>

                              {isLocked && (
                                <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-xs text-red-900 space-y-1">
                                  <div className="font-black flex items-center justify-between">
                                    <span>⚠️ BỊ KHÓA TOÀN MÀN HÌNH</span>
                                    {session.violations >= 3 && <span className="text-red-700 font-extrabold bg-red-200 px-1 rounded">-5đ</span>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleUnlockSession(session.sessionId, session.fullName)}
                                    className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow transition flex items-center justify-center space-x-1"
                                  >
                                    <span>🔓</span>
                                    <span>XÁC NHẬN MỞ KHÓA</span>
                                  </button>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-slate-500 text-[10px] block">Mã đề:</span>
                                  <strong className="text-slate-900 font-mono-code text-xs">{session.examCode || 'Đề cương'}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px] block">Thời gian:</span>
                                  <strong className="text-amber-700 font-mono-code text-xs">{session.timeLeft || '—'}</strong>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <span className={session.violations > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                                  Vi phạm: <strong className="text-xs">{session.violations || 0}</strong> lần {session.violations >= 3 && <span className="text-red-600 font-extrabold">(-5đ)</span>}
                                </span>
                                {session.status === 'submitted' && (
                                  <span className="text-emerald-700 font-black text-xs">
                                    Điểm: {session.score !== undefined ? session.score : session.mcqPoints}đ
                                  </span>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleExtendTime(session.sessionId, session.fullName, 5)}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition text-center"
                                >
                                  ⏱️ +5 Phút
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIndividualMsgTarget(session);
                                    setBroadcastTarget(session.sessionId);
                                    setShowBroadcastModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition text-center"
                                >
                                  ✉️ Nhắn
                                </button>

                                {isLocked ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUnlockSession(session.sessionId, session.fullName)}
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition text-center"
                                  >
                                    🔓 Mở Khóa
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleLockSession(session.sessionId, session.fullName)}
                                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition text-center"
                                  >
                                    🔒 Khóa
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleForceSubmit(session.sessionId, session.fullName)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition text-center"
                                >
                                  🛑 Thu Bài
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveCandidate(session.sessionId, session.fullName)}
                                  className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition text-center col-span-2 font-bold flex items-center justify-center space-x-1"
                                >
                                  <span>🗑️</span>
                                  <span>Xóa Thí Sinh</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: CƠ SỞ DỮ LIỆU & CHẤM ĐIỂM TỰ LUẬN */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            
            {/* THANH BỘ LỌC NÂNG CAO */}
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Khối Lớp:</label>
                  <select
                    value={filterGrade}
                    onChange={e => setFilterGrade(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="all">Tất cả Khối (8, 9, 10)</option>
                    <option value="8">Khối 8</option>
                    <option value="9">Khối 9</option>
                    <option value="10">Khối 10</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Lớp Học:</label>
                  <select
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="all">Tất cả các lớp</option>
                    {['8/19', '8/20', '8/21', '8/22', '8/23', '9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26', '10/14', '10/15', '10/16'].map(c => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Chế Độ:</label>
                  <select
                    value={filterMode}
                    onChange={e => setFilterMode(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="all">Tất cả bài làm</option>
                    <option value="exam">Chỉ bài Thi Giữa HK1</option>
                    <option value="practice">Chỉ bài Ôn tập Đề cương</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Trạng Thái Chấm:</label>
                  <select
                    value={filterGraded}
                    onChange={e => setFilterGraded(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ chấm tự luận ⏳</option>
                    <option value="graded">Đã chấm xong ✓</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tìm Kiếm:</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Họ tên hoặc Mã LMS..."
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* THANH CÔNG CỤ XUẤT NHẬP */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">
                  Tìm thấy: <strong className="text-blue-950 font-bold">{filteredSubmissions.length}</strong> bài nộp
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1"
                  >
                    <span>📥</span>
                    <span>Xuất File Excel (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1"
                  >
                    <span>💾</span>
                    <span>Sao Lưu JSON</span>
                  </button>

                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer flex items-center space-x-1">
                    <span>📂</span>
                    <span>Nhập JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      ref={fileInputRef}
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleClearAllData}
                    className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
                  >
                    Xóa Dữ Liệu
                  </button>
                </div>
              </div>
            </div>

            {/* BẢNG CƠ SỞ DỮ LIỆU BÀI THI */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">STT</th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4">Lớp</th>
                      <th className="py-3 px-4">Mã LMS</th>
                      <th className="py-3 px-4">Chế Độ</th>
                      <th className="py-3 px-4">Mã Đề</th>
                      <th className="py-3 px-4 text-center">Thời Gian Làm</th>
                      <th className="py-3 px-4 text-center">Điểm TN</th>
                      <th className="py-3 px-4 text-center">Tự Luận</th>
                      <th className="py-3 px-4 text-center">Tổng Điểm</th>
                      <th className="py-3 px-4 text-center">Trạng Thái</th>
                      <th className="py-3 px-4 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="py-12 text-center text-slate-500 font-medium">
                          Chưa có bài nộp nào phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub, idx) => {
                        const autoScore = sub.mcqPoints !== undefined ? sub.mcqPoints : (sub.score !== undefined ? sub.score : 0);
                        const finalScore = sub.finalScore !== undefined ? sub.finalScore : autoScore;
                        const hasPenalty = sub.penaltyPoints > 0 || sub.violations >= 3;
                        return (
                          <tr key={sub.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-mono-code text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{sub.fullName}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-blue-50 font-bold text-blue-900 border border-blue-200">
                                Lớp {sub.studentClass}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono-code text-blue-700 font-bold">{sub.studentId || '—'}</td>
                            <td className="py-3 px-4">
                              {sub.mode === 'exam' ? (
                                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
                                  Thi Giữa HK1
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                  Ôn Tập Đề Cương
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono-code font-bold text-slate-800">
                              {sub.examCode || '—'}
                            </td>
                            <td className="py-3 px-4 text-center font-mono-code text-slate-600">
                              {sub.durationFormatted || '45 phút'}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-slate-800">
                              {autoScore}đ
                            </td>
                            <td className="py-3 px-4 text-center font-bold">
                              {sub.isGraded ? (
                                <span className="text-indigo-600 font-bold">+{sub.essayTotal}đ</span>
                              ) : (
                                <span className="text-slate-400 italic">Chưa chấm</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-base font-black text-emerald-600">
                                {finalScore}
                              </span>
                              <span className="text-[11px] text-slate-400"> / 10đ</span>
                              {hasPenalty && (
                                <div className="text-[10px] text-red-600 font-extrabold">
                                  -5đ vi phạm
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {sub.isGraded ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                  Đã chấm ✓
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                  Chờ chấm ⏳
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => openGradingModal(sub)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"
                                >
                                  <span>✍️</span>
                                  <span>Chấm</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubmission(sub.id, sub.fullName, sub.examCode || 'Bài thi')}
                                  title="Xóa bài nộp này khỏi hệ thống"
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRA CỨU ĐÁP ÁN MASTER (GỒM CẢ 4 PHƯƠNG ÁN A,B,C,D & RUBRIC) */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Khối lớp:</span>
                {[8, 9, 10].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setAnswerGrade(g)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition ${
                      answerGrade === g
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Khối {g}
                  </button>
                ))}

                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-4">Bộ đề:</span>
                <select
                  value={answerType}
                  onChange={e => setAnswerType(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="practice">Đề Cương Ôn Tập (Đầy Đủ)</option>
                  <option value="101">Đề Thi Chính Thức — Mã Đề 101</option>
                  <option value="102">Đề Thi Chính Thức — Mã Đề 102</option>
                  <option value="103">Đề Thi Chính Thức — Mã Đề 103</option>
                  <option value="104">Đề Thi Chính Thức — Mã Đề 104</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
              >
                <span>🖨️</span>
                <span>In Đáp Án</span>
              </button>
            </div>

            {/* BẢNG ĐÁP ÁN MASTER */}
            {(() => {
              const isPractice = answerType === 'practice';
              let mcqList = [];
              let tfList = [];
              let essayList = [];

              if (isPractice) {
                mcqList = currentAnswerData?.practiceQuestions || [];
                tfList = currentAnswerData?.practiceTfQuestions || [];
                essayList = currentAnswerData?.practiceEssayQuestions || [];
              } else {
                const exam = currentAnswerData?.officialExams?.[answerType];
                if (answerGrade === 8 || answerGrade === 9) {
                  mcqList = exam?.mcqQuestions || [];
                  essayList = exam?.essayQuestions || [];
                } else {
                  mcqList = exam?.part1_mcq || [];
                  tfList = exam?.part2_tf || [];
                  essayList = exam?.part3_essay || [];
                }
              }

              const letterMap = ['A', 'B', 'C', 'D'];

              return (
                <div className="space-y-6">
                  
                  {/* BẢNG MA TRẬN NHANH */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider">
                        PHẦN I: MA TRẬN ĐÁP ÁN TRẮC NGHIỆM ({mcqList.length} CÂU)
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">Tin Học {answerGrade} — {isPractice ? 'Đề Cương' : `Mã Đề ${answerType}`}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                      {mcqList.map((q, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                          <span className="text-[11px] text-slate-500 block font-semibold">Câu {idx + 1}</span>
                          <strong className="text-base font-black text-emerald-600 font-mono-code">
                            {letterMap[q.correctAnswer]}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CHI TIẾT TỪNG CÂU VỚI ĐỦ 4 PHƯƠNG ÁN A, B, C, D */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3">
                      CHI TIẾT TỪNG CÂU HỎI TRẮC NGHIỆM VỚI 4 PHƯƠNG ÁN A, B, C, D
                    </h3>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {mcqList.map((q, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-900 uppercase">
                              Câu {idx + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                              Đáp án đúng: {letterMap[q.correctAnswer]}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 text-sm leading-relaxed">
                            {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((optText, optIdx) => {
                              const isCorrect = optIdx === q.correctAnswer;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
                                    isCorrect
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400/50'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {letterMap[optIdx]}
                                  </span>
                                  <span className="leading-snug">{optText}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ĐÁP ÁN ĐÚNG / SAI (KHỐI 10) */}
                  {tfList.length > 0 && (
                    <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
                      <h3 className="font-black text-sm text-purple-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                        PHẦN II: ĐÁP ÁN ĐÚNG / SAI ({tfList.length} CÂU)
                      </h3>

                      <div className="space-y-4">
                        {tfList.map((tf, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                            <span className="font-bold text-purple-900 uppercase">Câu {tf.num} (Đúng / Sai)</span>
                            <p className="text-slate-800 font-medium whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200">
                              {tf.context}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {tf.subQuestions.map(sub => (
                                <div key={sub.letter} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                                  <span className="text-slate-700"><strong>{sub.letter})</strong> {sub.text}</span>
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                    sub.correctAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {sub.correctAnswer ? 'ĐÚNG' : 'SAI'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HƯỚNG DẪN TRẢ LỜI & RUBRIC TỰ LUẬN */}
                  {essayList.length > 0 && (
                    <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
                      <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3">
                        PHẦN TỰ LUẬN & THANG ĐIỂM RUBRIC CHUẨN ASIAN SCHOOL
                      </h3>

                      <div className="space-y-5">
                        {essayList.map((eq, idx) => (
                          <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-sm text-blue-900 uppercase">
                                Câu {eq.num} (Tự luận) {eq.pointsText && `— ${eq.pointsText}`}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-200">
                                Rubric LMS
                              </span>
                            </div>
                            <p className="text-slate-800 font-medium whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
                              {eq.context || eq.question}
                            </p>
                            {eq.subItems && eq.subItems.length > 0 && (
                              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                                <span className="font-bold text-blue-900 text-[11px] block uppercase">
                                  Danh sách câu hỏi con:
                                </span>
                                {eq.subItems.map(item => (
                                  <div key={item.letter} className="flex items-start space-x-2 text-slate-700">
                                    <span className="font-black text-blue-700 shrink-0">Ý {item.letter})</span>
                                    <span className="leading-relaxed">{item.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                              <span className="font-black text-emerald-800 uppercase text-[11px] block">
                                ✓ Hướng Dẫn Trả Lời & Biểu Điểm:
                              </span>
                              <p className="text-emerald-900 whitespace-pre-line leading-relaxed font-sans">
                                {eq.modelAnswer || 'Chưa cập nhật hướng dẫn trả lời cho câu này.'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 4: PHÂN TÍCH KHẢO THÍ & PHỔ ĐIỂM (ITEM ANALYSIS) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* THỐNG KÊ TỔNG QUAN KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
                <span className="text-xs text-slate-500 font-bold uppercase">Tổng Lượt Bài Thi</span>
                <p className="text-3xl font-black text-blue-950 mt-1">{analyticsData.totalExams}</p>
                <span className="text-[11px] text-blue-700 font-semibold">Bài kiểm tra chính thức</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
                <span className="text-xs text-slate-500 font-bold uppercase">Điểm Trung Bình</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">{analyticsData.avg}đ</p>
                <span className="text-[11px] text-slate-500">Thang điểm 10.0</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
                <span className="text-xs text-slate-500 font-bold uppercase">Điểm Cao Nhất</span>
                <p className="text-3xl font-black text-amber-600 mt-1">{analyticsData.max}đ</p>
                <span className="text-[11px] text-slate-500">Thủ khoa phòng thi</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
                <span className="text-xs text-slate-500 font-bold uppercase">Điểm Thấp Nhất</span>
                <p className="text-3xl font-black text-rose-600 mt-1">{analyticsData.min}đ</p>
                <span className="text-[11px] text-slate-500">Cần kèm cặp thêm</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
                <span className="text-xs text-slate-500 font-bold uppercase">Tỷ Lệ Đạt (&ge; 5.0đ)</span>
                <p className="text-3xl font-black text-blue-700 mt-1">{analyticsData.passRate}%</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Đạt chuẩn chuyên môn</span>
              </div>
            </div>

            {/* BIỂU ĐỒ PHỔ ĐIỂM THEO 4 MỨC XẾP LOẠI */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-5">
              <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span>📈</span>
                <span>PHỔ ĐIỂM VÀ TỶ LỆ PHÂN LOẠI HỌC SINH</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-800">Giỏi (8.0 - 10.0đ)</span>
                    <span className="font-mono-code font-black text-emerald-700">{analyticsData.distribution.gioi} em</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.gioi / analyticsData.totalExams) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-800">Khá (6.5 - 7.9đ)</span>
                    <span className="font-mono-code font-black text-blue-700">{analyticsData.distribution.kha} em</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.kha / analyticsData.totalExams) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-800">Trung Bình (5.0 - 6.4đ)</span>
                    <span className="font-mono-code font-black text-amber-700">{analyticsData.distribution.trungBinh} em</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.trungBinh / analyticsData.totalExams) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-rose-800">Chưa Đạt (&lt; 5.0đ)</span>
                    <span className="font-mono-code font-black text-rose-700">{analyticsData.distribution.chuaDat} em</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.chuaDat / analyticsData.totalExams) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ITEM ANALYSIS: CÂU TRẮC NGHIỆM HỌC SINH SAI NHIỀU NHẤT */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span>⚠️</span>
                <span>PHÂN TÍCH ITEM: TOP CÂU HỎI TRẮC NGHIỆM HỌC SINH LÀM SAI NHIỀU NHẤT</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Giúp Thầy Trần Gia Huy phát hiện lỗ hổng kiến thức để giảng dạy củng cố hoặc chữa bài trọng tâm trên lớp.
              </p>

              <div className="space-y-2.5 pt-2">
                {analyticsData.topMistakes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">Chưa có đủ dữ liệu câu hỏi sai để thống kê.</p>
                ) : (
                  analyticsData.topMistakes.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800">{item.qText}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 shrink-0">
                        {item.count} lượt sai
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: IN BẢNG ĐIỂM CHUẨN A4 ASIAN SCHOOL */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">Mẫu Bảng Điểm:</span>
                  <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPrintType('exam')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        printType === 'exam'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📝 Thi Chính Thức
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintType('practice')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        printType === 'practice'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📖 Ôn Tập Đề Cương
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">Chọn Lớp Để In:</span>
                  <select
                    value={printClass}
                    onChange={e => setPrintClass(e.target.value)}
                    className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-600"
                  >
                    {['8/19', '8/20', '8/21', '8/22', '8/23', '9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26', '10/14', '10/15', '10/16'].map(c => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-2"
              >
                <span>🖨️</span>
                <span>Xác Nhận In Bảng Điểm A4 Ngang</span>
              </button>
            </div>

            {/* BẢN XEM TRƯỚC BẢNG ĐIỂM (PREVIEW) */}
            <div className="bg-white text-slate-900 rounded-3xl p-8 border border-slate-300 shadow-2xl space-y-6 font-sans">
              
              {/* TIÊU ĐỀ TRƯỜNG ASIAN SCHOOL */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <p className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                    TRƯỜNG TIỂU HỌC, THCS & THPT QUỐC TẾ Á CHÂU
                  </p>
                  <p className="font-extrabold text-sm text-blue-900 uppercase">
                    BỘ MÔN TIN HỌC — NĂM HỌC 2026 - 2027
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600 italic">Áp dụng mẫu khảo thí Asian School</p>
                  <p className="text-xs font-bold text-slate-900">LỚP HỌC: {printClass}</p>
                </div>
              </div>

              {printType === 'exam' ? (
                <>
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">
                      BẢNG TỔNG HỢP ĐIỂM KIỂM TRA ĐÁNH GIÁ GIỮA HỌC KỲ 1
                    </h2>
                    <p className="text-xs font-semibold text-slate-700">
                      Thời lượng làm bài: 45 phút • Lớp học: {printClass} • Giáo viên phụ trách: Thầy Trần Gia Huy
                    </p>
                  </div>

                  {/* BẢNG ĐIỂM THI CHÍNH THỨC */}
                  <table className="w-full text-left text-xs border border-slate-400">
                    <thead className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center w-12">STT</th>
                        <th className="py-2.5 px-3 border-r border-slate-400">Mã LMS</th>
                        <th className="py-2.5 px-3 border-r border-slate-400">Họ và Tên Học Sinh</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Mã Đề</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Thời Gian Làm</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Điểm TN</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Điểm TL</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Tổng Điểm</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Xếp Loại</th>
                        <th className="py-2.5 px-3">Lời Phê / Ghi Chú Của Giáo Viên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {submissions.filter(s => s.studentClass === printClass).length === 0 ? (
                        <tr>
                          <td colSpan="10" className="py-8 text-center text-slate-500 italic">
                            Chưa có dữ liệu bài nộp nào của Lớp {printClass}.
                          </td>
                        </tr>
                      ) : (
                        submissions.filter(s => s.studentClass === printClass).map((sub, idx) => {
                          const autoScore = sub.mcqPoints !== undefined ? sub.mcqPoints : (sub.score !== undefined ? sub.score : 0);
                          const essayScore = sub.isGraded ? (sub.essayTotal || 0) : 0;
                          const finalScore = sub.finalScore !== undefined ? sub.finalScore : (autoScore + essayScore);
                          let ranking = 'Chưa đạt';
                          if (finalScore >= 8.0) ranking = 'Giỏi';
                          else if (finalScore >= 6.5) ranking = 'Khá';
                          else if (finalScore >= 5.0) ranking = 'Trung bình';

                          return (
                            <tr key={idx} className="text-slate-900">
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code">{idx + 1}</td>
                              <td className="py-2 px-3 border-r border-slate-300 font-mono-code font-bold text-blue-900">{sub.studentId || '—'}</td>
                              <td className="py-2 px-3 border-r border-slate-300 font-bold">{sub.fullName}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code">{sub.examCode || '101'}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code">{sub.durationFormatted || '45 phút'}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center">{autoScore}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center">{sub.isGraded ? essayScore : '—'}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-black text-sm text-red-600">{finalScore}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-semibold">{ranking}</td>
                              <td className="py-2 px-3 text-slate-700 italic">
                                {(sub.penaltyPoints > 0 || sub.violations >= 3) ? `[Vi phạm 3 lần: -5đ] ${sub.teacherFeedback || ''}` : (sub.teacherFeedback || '')}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* KHỐI KÝ TÊN */}
                  <div className="pt-8 flex justify-between items-end text-xs text-slate-800">
                    <div>
                      <p>Số lượng bài đã chấm: <strong>{submissions.filter(s => s.studentClass === printClass && s.isGraded).length}</strong> bài</p>
                    </div>
                    <div className="text-center space-y-12">
                      <p className="italic">Thành phố Hồ Chí Minh, ngày ...... tháng ...... năm 2026</p>
                      <p className="font-black uppercase text-sm">
                        GIÁO VIÊN BỘ MÔN TIN HỌC<br/><br/><br/>
                        <span className="text-blue-950 font-bold">Thầy Trần Gia Huy</span>
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">
                      BẢNG TỔNG HỢP KẾT QUẢ ÔN TẬP ĐỀ CƯƠNG TIN HỌC
                    </h2>
                    <p className="text-xs font-semibold text-slate-700">
                      Đánh giá số lần rèn luyện & điểm số ôn tập đề cương • Lớp {printClass} • Giáo viên phụ trách: Thầy Trần Gia Huy
                    </p>
                  </div>

                  {/* BẢNG ĐIỂM ÔN TẬP ĐỀ CƯƠNG */}
                  <table className="w-full text-left text-xs border border-slate-400">
                    <thead className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center w-12">STT</th>
                        <th className="py-2.5 px-3 border-r border-slate-400">Mã LMS</th>
                        <th className="py-2.5 px-3 border-r border-slate-400">Họ và Tên Học Sinh</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Số Lần Làm</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Thời Gian Làm</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Điểm Đạt (/10)</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Đúng/Tổng</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Thời Điểm Nộp</th>
                        <th className="py-2.5 px-3 border-r border-slate-400 text-center">Đánh Giá (≥ 6.0)</th>
                        <th className="py-2.5 px-3">Ghi Chú Tiến Độ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {practiceSubs.filter(s => s.studentClass === printClass).length === 0 ? (
                        <tr>
                          <td colSpan="10" className="py-8 text-center text-slate-500 italic">
                            Chưa có dữ liệu bài làm ôn tập đề cương nào của Lớp {printClass}.
                          </td>
                        </tr>
                      ) : (
                        practiceSubs.filter(s => s.studentClass === printClass).map((sub, idx) => {
                          const pts = sub.finalScore !== undefined ? sub.finalScore : (sub.score !== undefined ? sub.score : 0);
                          const isPass = pts >= 6.0;
                          return (
                            <tr key={idx} className="text-slate-900">
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code">{idx + 1}</td>
                              <td className="py-2 px-3 border-r border-slate-300 font-mono-code font-bold text-blue-900">{sub.studentId || '—'}</td>
                              <td className="py-2 px-3 border-r border-slate-300 font-bold">{sub.fullName}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code font-bold text-amber-900">
                                Lần {sub.attemptNumber || 1}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code">{sub.durationFormatted || 'N/A'}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-black text-sm text-red-600">{pts}</td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code text-slate-700">
                                {sub.correctCount !== undefined ? `${sub.correctCount}/${sub.totalQuestions || 25}` : '—'}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code text-[11px] text-slate-600">
                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">
                                {isPass ? (
                                  <span className="text-emerald-700 font-black">✓ Đạt yêu cầu</span>
                                ) : (
                                  <span className="text-amber-700 font-semibold">Cần rèn thêm</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-700 italic">
                                {sub.attemptNumber >= 5 && isPass ? 'Đủ điều kiện dự thi GK1' : `Đã hoàn thành lần ${sub.attemptNumber || 1}`}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* KHỐI KÝ TÊN */}
                  <div className="pt-8 flex justify-between items-end text-xs text-slate-800">
                    <div>
                      <p>Tổng số lượt nộp ôn tập: <strong>{practiceSubs.filter(s => s.studentClass === printClass).length}</strong> lượt</p>
                      <p>Số lượt đạt chuẩn (≥ 6.0đ): <strong>{practiceSubs.filter(s => s.studentClass === printClass && (s.finalScore >= 6.0 || s.score >= 6.0)).length}</strong> lượt</p>
                    </div>
                    <div className="text-center space-y-12">
                      <p className="italic">Thành phố Hồ Chí Minh, ngày ...... tháng ...... năm 2026</p>
                      <p className="font-black uppercase text-sm">
                        GIÁO VIÊN BỘ MÔN TIN HỌC<br/><br/><br/>
                        <span className="text-blue-950 font-bold">Thầy Trần Gia Huy</span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CẤU HÌNH & BẢO MẬT ADMIN */}
        {activeTab === 'config' && (
          <div className="space-y-6 max-w-4xl">
            
            {configSavedNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <span>✓</span>
                <span>{configSavedNotice}</span>
              </div>
            )}

            {/* 1. CẤU HÌNH THỜI GIAN & CHẾ ĐỘ TRỘN ĐỀ THI */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
                  <span>🎛️</span>
                  <span>CẤU HÌNH THỜI GIAN & CHẾ ĐỘ TRỘN ĐỀ</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                  Thời Gian Thực
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Tùy chỉnh thời gian làm bài kiểm tra chính thức, thời gian ôn tập đề cương và bật/tắt xáo trộn câu hỏi, phương án.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Thời gian thi chính thức */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    ⏱️ Thời Gian Thi Chính Thức:
                  </label>
                  <select
                    value={examDurationMinutes}
                    onChange={e => setExamDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 font-bold focus:outline-none focus:border-blue-600"
                  >
                    <option value={15}>15 phút (Kiểm tra 15p)</option>
                    <option value={30}>30 phút (Kiểm tra ngắn)</option>
                    <option value={45}>45 phút (Chuẩn Giữa HK / Cuối HK)</option>
                    <option value={60}>60 phút (Kiểm tra tăng cường)</option>
                    <option value={90}>90 phút (Học kỳ chuẩn)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 italic">
                    Đồng hồ thí sinh sẽ tự động đếm ngược theo số phút này.
                  </p>
                </div>

                {/* Thời gian ôn tập đề cương */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    📖 Thời Gian Ôn Tập Đề Cương:
                  </label>
                  <select
                    value={practiceDurationMinutes}
                    onChange={e => setPracticeDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-emerald-800 font-bold focus:outline-none focus:border-blue-600"
                  >
                    <option value={0}>Không giới hạn (Tự do rèn luyện 24/7)</option>
                    <option value={15}>15 phút</option>
                    <option value={30}>30 phút</option>
                    <option value={45}>45 phút</option>
                  </select>
                  <p className="text-[11px] text-slate-500 italic">
                    Mặc định không giới hạn để học sinh tự do ôn tập.
                  </p>
                </div>

                {/* Trộn thứ tự câu hỏi */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">🔀 Trộn Đề (Xáo Trộn Câu Hỏi)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Xáo trộn vị trí các câu hỏi khi mở đề</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={e => setShuffleQuestions(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Trộn phương án A/B/C/D */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">🔠 Trộn Đáp Án (A, B, C, D)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Đổi ngẫu nhiên vị trí các lựa chọn</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={e => setShuffleOptions(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Bắt buộc trả lời tất cả các câu hỏi (Không được bỏ trống khi nộp) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">✅ Quy Chế: Bắt Buộc Làm Hết 100% Câu Hỏi</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Không cho phép học sinh nộp bài khi còn câu hỏi hoặc phần tự luận bị bỏ trống</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireAllQuestionsAnswered}
                      onChange={e => setRequireAllQuestionsAnswered(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveExamConfig}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <span>💾</span>
                  <span>Lưu Cấu Hình Thi & Trộn Đề</span>
                </button>
              </div>
            </div>

            {/* 2. MẬT KHẨU PHÒNG THI */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span>🔒</span>
                <span>MẬT KHẨU PHÒNG THI CHÍNH THỨC</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Học sinh phải nhập đúng mật khẩu này mới được phép bắt đầu làm bài thi chính thức 45 phút.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={newExamPassword}
                  onChange={e => setNewExamPassword(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono-code font-bold text-amber-700 w-64 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    window.AsianSchoolStorage.setExamPassword(newExamPassword);
                    setConfig(window.AsianSchoolStorage.getConfig());
                    setConfigSavedNotice('Đã lưu mật khẩu phòng thi mới!');
                    setTimeout(() => setConfigSavedNotice(''), 3000);
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Lưu Mật Khẩu Thi
                </button>
              </div>
            </div>

            {/* 2. TÀI KHOẢN GIÁO VIÊN & KHO MÃ ĐỀ CHÍNH THỨC */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span>🛡️</span>
                <span>TÀI KHOẢN GIÁO VIÊN & KHO MÃ ĐỀ CHÍNH THỨC</span>
              </h3>
              <p className="text-xs text-slate-600">
                Đang đăng nhập: <strong>{teacherEmail}</strong>
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Đăng Xuất
              </button>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Mã đề kèm đáp án chỉ lưu trên Firestore (exam_bank), không nằm trong mã nguồn công khai.
                  Chọn tệp JSON dạng {'{ "grade": 9, "officialExams": { "101": {...} } }'}, ví dụ tệp do scripts/tach_ma_de_chinh_thuc.cjs tạo ra.
                </p>
                <button
                  type="button"
                  onClick={handleToggleExamBankLock}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition ${config.examBankLocked ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-600 hover:bg-slate-700'}`}
                >
                  {config.examBankLocked ? '🔒 Kho đề đang khóa — bấm để mở khóa' : '🔓 Khóa kho đề (giữ nguyên mã đề)'}
                </button>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleUploadExamBank}
                  disabled={!!config.examBankLocked}
                  className="block disabled:opacity-40 text-xs text-slate-700 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white file:font-bold"
                />
                {examBankStatus && (
                  <pre className="text-xs whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-xl p-3">{examBankStatus}</pre>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[8, 9, 10].map(g => {
                    const exams = (window['EXAM_DATA_G' + g] && window['EXAM_DATA_G' + g].officialExams) || {};
                    return (
                      <div key={g} className="border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                        <div className="font-bold text-blue-950">Khối {g}</div>
                        {Object.keys(exams).length === 0 && <div className="text-slate-400 italic">Chưa có mã đề</div>}
                        {Object.keys(exams).sort().map(code => (
                          <label key={code} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={exams[code].active !== false}
                              onChange={e => handleToggleExamCode(g, code, e.target.checked)}
                            />
                            <span>Mã {code} {exams[code].active === false ? '(đang tắt)' : ''}</span>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LƯỢT THI CHÍNH THỨC THEO MÃ LMS */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span>🎫</span>
                <span>LƯỢT LÀM BÀI THI CHÍNH THỨC THEO MÃ LMS</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Máy chủ đếm lượt theo mã LMS, nên đổi máy hay xóa trình duyệt cũng không được thêm lượt. Vi phạm 3 lần: bài bị khóa chờ giám thị mở khóa, khi nộp trừ 5 điểm.
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số lượt tối đa mỗi mã LMS:</label>
                  <input
                    type="number" min="1" max="10"
                    value={maxExamAttempts}
                    onChange={e => setMaxExamAttempts(e.target.value)}
                    className="w-24 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button type="button" onClick={handleSaveMaxAttempts} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition">
                  Lưu
                </button>
              </div>
              <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4">
                <select
                  value={attemptGrade}
                  onChange={e => setAttemptGrade(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                >
                  <option value="8">Khối 8</option>
                  <option value="9">Khối 9</option>
                  <option value="10">Khối 10</option>
                </select>
                <input
                  type="text"
                  value={attemptLms}
                  onChange={e => setAttemptLms(e.target.value)}
                  placeholder="Mã LMS học sinh"
                  className="w-44 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button type="button" onClick={handleLookupAttempt} className="px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition">
                  Tra cứu
                </button>
                <button type="button" onClick={handleGrantAttempt} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition">
                  Cấp thêm 1 lượt
                </button>
              </div>
              {attemptStatus && (
                <p className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">{attemptStatus}</p>
              )}
            </div>

            {/* 3. KẾT NỐI GOOGLE DRIVE & GOOGLE SHEETS */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
                  <span>☁️</span>
                  <span>KẾT NỐI GOOGLE DRIVE & GOOGLE SHEETS (LƯU TRỮ VĨNH VIỄN)</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  100% Miễn Phí
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Tự động đồng bộ từng dòng điểm vào Google Sheets và lưu trữ tệp sao lưu kỳ thi lên Google Drive cá nhân của Thầy mà không lo mất dữ liệu.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Webhook Google Apps Script (Triển khai từ Google Drive):
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={googleDriveUrl}
                      onChange={e => setGoogleDriveUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-emerald-800 font-mono-code focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGoogleDriveUrl}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition shrink-0"
                    >
                      Lưu Cấu Hình
                    </button>
                    <button
                      type="button"
                      onClick={handleTestGoogleDrive}
                      disabled={isTestingDrive}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow transition shrink-0 flex items-center space-x-1.5"
                    >
                      <span>{isTestingDrive ? '⏳ Đang Kiểm Tra...' : '🧪 Kiểm Tra Kết Nối Ngay'}</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Mã Token Xác Thực (Tùy chọn - nếu Apps Script của Thầy có dùng WEBHOOK_TOKEN):
                    </label>
                    <input
                      type="text"
                      value={googleDriveToken}
                      onChange={e => setGoogleDriveToken(e.target.value)}
                      placeholder="Nhập mã Token nếu có, hoặc để trống nếu script không dùng token..."
                      className="w-full sm:w-80 bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2 text-xs text-amber-800 font-mono-code focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {driveTestMessage && (
                  <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                    driveTestMessage.success === true
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : (driveTestMessage.success === false
                          ? 'bg-red-50 border-red-300 text-red-800'
                          : 'bg-blue-50 border-blue-300 text-blue-800')
                  }`}>
                    <span>{driveTestMessage.success === true ? '✅' : (driveTestMessage.success === false ? '❌' : 'ℹ️')}</span>
                    <span>{driveTestMessage.text}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSyncAllGoogleDrive}
                    disabled={isSyncingDrive}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <span>🚀</span>
                    <span>{isSyncingDrive ? 'Đang Sao Lưu Lên Drive...' : 'Đồng Bộ Toàn Bộ Dữ Liệu Lên Google Drive Ngay'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAppsScriptGuide(!showAppsScriptGuide)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
                  >
                    {showAppsScriptGuide ? 'Ẩn Hướng Dẫn Google Script ✕' : 'Xem Hướng Dẫn & Mã Script Google Drive (Mới Nhất) 📖'}
                  </button>
                </div>

                {driveSyncNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl">
                    {driveSyncNotice}
                  </div>
                )}

                {showAppsScriptGuide && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-blue-950 text-sm flex items-center space-x-2">
                        <span>⚡</span>
                        <span>HƯỚNG DẪN THIẾT LẬP GOOGLE APPS SCRIPT (TỰ ĐỘNG PHỤC HỒI 2026)</span>
                      </h4>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-mono font-bold">Bản tự tạo Sheet & Folder</span>
                    </div>

                    <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                      <li>Mở Google Drive của Thầy, tạo 1 file Google Sheets mới (đặt tên: <strong className="text-slate-900">AHS_BangDiem_2026</strong>).</li>
                      <li>Chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</li>
                      <li>Xóa hết mã cũ trong trình soạn thảo và dán toàn bộ đoạn mã bên dưới vào.</li>
                      <li>
                        <strong className="text-amber-700">Cực kỳ quan trọng:</strong> Ở thanh công cụ trên cùng, tại ô chọn hàm thực thi, chọn hàm <code className="bg-slate-200 px-1.5 py-0.5 rounded text-emerald-800 font-mono">initSheet</code> rồi bấm nút <strong>Chạy (Run)</strong>.
                        <div className="text-[11px] text-slate-500 pl-4 pt-1">
                          &bull; Google sẽ hiện cửa sổ yêu cầu cấp quyền truy cập &rarr; Chọn tài khoản Google của Thầy &rarr; Bấm <em>Nâng cao (Advanced)</em> &rarr; Bấm <em>Đi tới dự án (Không an toàn)</em> &rarr; Bấm <em>Cho phép (Allow)</em>.
                        </div>
                      </li>
                      <li>
                        Bấm nút <strong>Triển khai (Deploy)</strong> &rarr; <strong>Quản lý bản triển khai mới (New deployment)</strong>:
                        <div className="text-[11px] text-slate-500 pl-4 pt-1 space-y-1">
                          <div>&bull; Bấm biểu tượng bánh răng ⚙️ &rarr; Chọn loại: <strong>Ứng dụng web (Web app)</strong>.</div>
                          <div>&bull; <strong>Thực thi dưới quyền (Execute as):</strong> Chọn <strong>Tôi (trangiahuy8444@gmail.com)</strong>.</div>
                          <div>&bull; <strong>Ai có quyền truy cập (Who has access):</strong> Chọn <strong className="text-amber-700">Bất kỳ ai (Anyone)</strong> <em>(Bắt buộc để hệ thống gửi dữ liệu)</em>.</div>
                          <div>&bull; Bấm <strong>Triển khai</strong> &rarr; Sao chép đường dẫn Web App (có đuôi kết thúc bằng <code className="bg-slate-200 px-1 text-emerald-800 font-mono">/exec</code>).</div>
                        </div>
                      </li>
                      <li>Dán đường link vừa sao chép vào ô <strong>"URL Webhook"</strong> ở trên &rarr; Bấm <strong>"Lưu URL"</strong> &rarr; Bấm <strong>"🧪 Kiểm Tra Kết Nối Ngay"</strong> để kiểm chứng!</li>
                    </ol>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Mã nguồn Google Apps Script (Bấm vào để chọn tất cả):</span>
                        <span className="text-emerald-700 font-mono text-[10px] font-bold">Tự động tạo Sheet & Tiêu đề cột chuẩn</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-300 font-mono-code text-[11px] text-slate-800 overflow-x-auto select-all max-h-96">
                        {`/**
 * ASIAN SCHOOL LMS - GOOGLE APPS SCRIPT WEBHOOK (BẢN TỰ ĐỘNG PHỤC HỒI 2026)
 * Tự động tạo Google Sheet, tiêu đề cột, thư mục lưu trữ và hỗ trợ kiểm tra kết nối
 */

function initSheet() {
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getActiveSheet();
  setupSheetHeaders(sheet);
  Logger.log("Đã khởi tạo thành công: " + ss.getUrl());
}

function getOrCreateSpreadsheet() {
  var ss;
  try {
ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
ss = null;
  }
  if (!ss) {
var files = DriveApp.getFilesByName("AHS_BangDiem_2026");
if (files.hasNext()) {
  ss = SpreadsheetApp.open(files.next());
} else {
  ss = SpreadsheetApp.create("AHS_BangDiem_2026");
}
  }
  return ss;
}

function setupSheetHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
var headers = [
  "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", 
  "Điểm TN", "Điểm TL", "Tổng Điểm", "Vi Phạm", 
  "Thời Gian Làm", "Thời Điểm Nộp"
];
sheet.appendRow(headers);
sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  try {
var data = JSON.parse(e.postData.contents);
var ss = getOrCreateSpreadsheet();
var sheet = ss.getActiveSheet();
setupSheetHeaders(sheet);

// 1. Lệnh kiểm tra kết nối từ Admin
if (data.action === 'test_connection') {
  var t = data.testRow || {};
  sheet.appendRow([
    t.studentId || "TEST_LMS",
    t.fullName || "Kiểm Tra Kết Nối",
    t.grade || "10",
    t.studentClass || "10/14",
    t.examCode || "101",
    t.mcqPoints || 7.0,
    t.essayTotal || 3.0,
    t.finalScore || 10.0,
    t.violations || 0,
    t.durationFormatted || "00:01",
    t.submittedAt || new Date().toISOString()
  ]);
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Kết nối thành công!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. Đồng bộ từng dòng khi học sinh nộp bài thi
if (data.action === 'sync_row' && data.submission) {
  var s = data.submission;
  sheet.appendRow([
    s.studentId || s.studentCode || "",
    s.fullName || "",
    s.grade || "",
    s.studentClass || "",
    s.examCode || "",
    s.mcqPoints !== undefined ? s.mcqPoints : (s.score || 0),
    s.essayTotal || 0,
    s.finalScore !== undefined ? s.finalScore : (s.score || 0),
    s.violations || 0,
    s.durationFormatted || "45 phút",
    s.submittedAt || new Date().toISOString()
  ]);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 3. Sao lưu toàn bộ kỳ thi thành tệp JSON vào Google Drive
if (data.action === 'backup_file') {
  var folders = DriveApp.getFoldersByName("AHS-LMS-Archive");
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("AHS-LMS-Archive");
  var fileName = "Backup_AHS_" + Utilities.formatDate(new Date(), "GMT+7", "yyyy_MM_dd_HHmm") + ".json";
  folder.createFile(fileName, data.jsonContent);
  return ContentService.createTextOutput(JSON.stringify({ success: true, file: fileName }))
    .setMimeType(ContentService.MimeType.JSON);
}

return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Hành động không xác định" }))
  .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
  .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. QUẢN LÝ VÒNG ĐỜI KỲ THI & DỌN DẸP DỮ LIỆU AN TOÀN (2–3 TUẦN) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
                  <span>🗄️</span>
                  <span>QUẢN LÝ VÒNG ĐỜI KỲ THI & DỌN DẸP DỮ LIỆU (2-3 TUẦN)</span>
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  retentionSummary.isExpired
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : (retentionSummary.isNearExpiry
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-blue-100 text-blue-900 border-blue-200')
                }`}>
                  {retentionSummary.daysActive} ngày lưu trữ
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Theo quy chuẩn lưu trữ của bộ môn: Dữ liệu bài thi chính thức được lưu trữ an toàn trong 2–3 tuần (tối đa 21 ngày) để phục vụ chấm tự luận và vào điểm. Sau đó có thể dọn dẹp để chuẩn bị cho đợt thi mới.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">Tổng bài thi chính thức:</span>
                  <p className="text-lg font-black text-blue-950 mt-0.5">{retentionSummary.totalCount} bài</p>
                </div>
                <div>
                  <span className="text-slate-500">Thời gian đã lưu:</span>
                  <p className="text-lg font-black text-amber-700 mt-0.5">{retentionSummary.daysActive} / {retentionSummary.retentionDays || 21} ngày</p>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái vòng đời:</span>
                  <p className={`text-xs font-black mt-1.5 ${retentionSummary.isExpired ? 'text-red-700' : (retentionSummary.isNearExpiry ? 'text-amber-700' : 'text-emerald-700')}`}>
                    {retentionSummary.isExpired ? '⚠️ Đã quá 3 tuần (Nên dọn dẹp)' : (retentionSummary.isNearExpiry ? '🟡 Sắp hết hạn 3 tuần' : '🟢 Đang trong hạn lưu trữ')}
                  </p>
                </div>
              </div>

              {/* Quy trình an toàn 2 bước */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  QUY TRÌNH DỌN DẸP AN TOÀN 2 BƯỚC:
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleExportCSV();
                      handleExportJSON();
                      setHasDownloadedBackup(true);
                      showToast('Tệp Excel CSV và tệp sao lưu JSON đã được lưu vào máy tính của Thầy. Thầy có thể an tâm dọn dẹp nếu muốn!', 'success', 'Sao Lưu Hoàn Tất 📥');
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <span>📥</span>
                    <span>1. Tải Bản Sao Lưu Về Máy (CSV + JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePurgeExamData}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <span>🗑️</span>
                    <span>2. Dọn Dẹp Kỳ Thi Cũ (Xóa Dữ Liệu Sau 2-3 Tuần)</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Lưu ý: Khi dọn dẹp, toàn bộ bài thi cũ sẽ được làm sạch trên Firestore và web. Bản sao lưu trên Google Drive hoặc tệp tải về máy sẽ giữ trọn vẹn dữ liệu vĩnh viễn.
                </p>
              </div>
            </div>

            {/* 5. NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span>📝</span>
                <span>NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT LOG)</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 text-xs">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-400 italic py-2">Chưa ghi nhận hoạt động nào.</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                      <div>
                        <span className="font-bold text-blue-900">{log.action}</span>
                        <p className="text-slate-700 mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono-code shrink-0 ml-3">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL CHẤM ĐIỂM TỰ LUẬN TRỰC TIẾP */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl text-slate-900">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                  GIAO DIỆN CHẤM BÀI TỰ LUẬN
                </span>
                <h2 className="text-xl font-black text-blue-950 mt-1">
                  {gradingSubmission.fullName} — Lớp {gradingSubmission.studentClass}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mã LMS: <strong className="text-blue-700 font-mono-code">{gradingSubmission.studentId || 'Chưa nhập'}</strong> • Mã đề: <strong className="text-amber-700 font-mono-code">{gradingSubmission.examCode || '101'}</strong> • Chế độ: {gradingSubmission.mode === 'exam' ? 'Thi Giữa HK1' : 'Ôn tập'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Tóm tắt điểm số & thời gian làm bài */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-center">
              <div>
                <span className="text-slate-500 font-medium">Thời Gian Làm Bài:</span>
                <p className="text-base sm:text-lg font-black text-amber-700 mt-1">
                  {gradingSubmission.durationFormatted || '45 phút'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Điểm TN / Đ-S:</span>
                <p className="text-xl font-black text-blue-900 mt-1">
                  {gradingSubmission.mcqPoints !== undefined ? gradingSubmission.mcqPoints : (gradingSubmission.score || 0)}đ
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Điểm Tự Luận:</span>
                <p className="text-xl font-black text-indigo-700 mt-1">
                  +{(Object.values(tempEssayScores).reduce((a, b) => a + (parseFloat(b) || 0), 0)).toFixed(2)}đ
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">TỔNG ĐIỂM (THANG 10):</span>
                {(() => {
                  const auto = gradingSubmission.mcqPoints !== undefined ? parseFloat(gradingSubmission.mcqPoints) : (parseFloat(gradingSubmission.score) || 0);
                  const essay = Object.values(tempEssayScores).reduce((a, b) => a + (parseFloat(b) || 0), 0);
                  const pen = gradingSubmission.penaltyPoints || (gradingSubmission.violations >= 3 ? 5 : 0);
                  const calc = Math.max(0, Math.min(10, Math.round((auto + essay - pen) * 100) / 100));
                  return (
                    <p className="text-xl font-black text-emerald-600 mt-1">
                      {calc} / 10đ {pen > 0 && <span className="text-red-600 text-xs">(-{pen}đ)</span>}
                    </p>
                  );
                })()}
              </div>
            </div>

            {gradingSuccessAlert && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center">
                ✓ ĐÃ LƯU ĐIỂM VÀ LỜI NHẬN XÉT CỦA GIÁO VIÊN THÀNH CÔNG!
              </div>
            )}

            {/* DANH SÁCH CÂU HỎI TỰ LUẬN ĐỂ CHẤM */}
            <div className="space-y-6">
              {(() => {
                const gradeObj = gradingSubmission.grade === 8 ? window.EXAM_DATA_G8 : (gradingSubmission.grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
                let essayQuestions = [];
                if (gradingSubmission.mode === 'practice') {
                  essayQuestions = gradeObj?.practiceEssayQuestions || [];
                } else {
                  const examObj = gradeObj?.officialExams?.[gradingSubmission.examCode || '101'];
                  essayQuestions = gradingSubmission.grade === 10 ? (examObj?.part3_essay || []) : (examObj?.essayQuestions || []);
                }

                if (essayQuestions.length === 0) {
                  return <p className="text-xs text-slate-400 italic">Không có câu tự luận trong bài làm này.</p>;
                }

                return essayQuestions.map((q) => {
                  const studentText = gradingSubmission.answers?.essay?.[q.num] || '';
                  const currentScore = tempEssayScores[q.num] !== undefined ? tempEssayScores[q.num] : '';

                  return (
                    <div key={q.num} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-black text-sm text-blue-900 uppercase">
                          Câu {q.num} (Tự luận) {q.pointsText && `— ${q.pointsText}`}
                        </span>
                        <span className="text-slate-500">
                          Đã gõ: <strong className="text-slate-900">{studentText.length}</strong> ký tự
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cột Trái: Đề bài & Rubric chuẩn */}
                        <div className="space-y-2">
                          <span className="font-bold text-slate-700 block uppercase text-[10px]">Đề bài:</span>
                          <p className="p-3 bg-white rounded-xl text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200">
                            {q.context || q.question}
                          </p>
                          {q.subItems && q.subItems.length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                              <span className="font-bold text-blue-900 text-[10px] block uppercase">
                                Các câu hỏi con cần trả lời:
                              </span>
                              {q.subItems.map(item => (
                                <div key={item.letter} className="flex items-start space-x-2 text-slate-700">
                                  <span className="font-black text-blue-700 shrink-0">Ý {item.letter})</span>
                                  <span className="leading-relaxed">{item.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <span className="font-bold text-emerald-800 block uppercase text-[10px] pt-1">Rubric Hướng Dẫn Chấm:</span>
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed whitespace-pre-line text-[11px]">
                            {q.modelAnswer || 'Chưa cập nhật hướng dẫn.'}
                          </div>
                        </div>

                        {/* Cột Phải: Bài làm của học sinh & Ô nhập điểm */}
                        <div className="space-y-2">
                          <span className="font-bold text-blue-900 block uppercase text-[10px]">Bài Làm Của Học Sinh:</span>
                          <div className="p-3.5 bg-white rounded-xl text-slate-800 font-sans text-xs leading-relaxed whitespace-pre-line border border-slate-200 min-h-[120px]">
                            {studentText || <span className="text-slate-400 italic">Học sinh bỏ trống không làm câu này.</span>}
                          </div>

                          {/* Ô Nhập Điểm & Phím Chấm Nhanh */}
                          <div className="pt-2 bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="font-black text-slate-900 uppercase text-[11px]">Điểm Cho Câu {q.num}:</label>
                              <input
                                type="number"
                                step="0.25"
                                min="0"
                                max="1.0"
                                value={currentScore}
                                onChange={e => setTempEssayScores(prev => ({ ...prev, [q.num]: e.target.value }))}
                                placeholder="0 - 1.0"
                                className="w-24 bg-white border-2 border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono-code font-bold text-emerald-700 focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div className="flex items-center space-x-1.5 pt-1">
                              <span className="text-[10px] text-slate-500">Chấm nhanh:</span>
                              {[0, 0.25, 0.5, 0.75, 1.0].map(pt => (
                                <button
                                  key={pt}
                                  type="button"
                                  onClick={() => setTempEssayScores(prev => ({ ...prev, [q.num]: pt }))}
                                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition"
                                >
                                  {pt}đ
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* LỜI NHẬN XÉT CỦA GIÁO VIÊN */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-black text-amber-800 uppercase">
                Lời Nhận Xét / Lời Phê Của Giáo Viên:
              </label>
              <textarea
                rows={3}
                value={tempFeedback}
                onChange={e => setTempFeedback(e.target.value)}
                placeholder="Gõ nhận xét cho học sinh (ví dụ: Nêu đúng định nghĩa, trình bày sạch đẹp, cần bổ sung ví dụ thực tế)..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              ></textarea>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="text-slate-500">Mẫu nhận xét nhanh:</span>
                {[
                  'Nêu đúng lý thuyết, trình bày tốt.',
                  'Lập luận chặt chẽ, đạt điểm tối đa.',
                  'Cần giải thích rõ hơn phần ví dụ thực tế.',
                  'Chưa hoàn thiện đầy đủ các ý tự luận.'
                ].map((snippet, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setTempFeedback(prev => prev ? `${prev} ${snippet}` : snippet)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                  >
                    + {snippet}
                  </button>
                ))}
              </div>
            </div>

            {/* Nút lưu */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
              >
                Đóng Hộp Thoại
              </button>

              <button
                type="button"
                onClick={handleSaveGrading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
              >
                <span>💾</span>
                <span>LƯU ĐIỂM CHẤM & CẬP NHẬT TỔNG ĐIỂM</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PHÁT THÔNG BÁO KHẨN / NHẮN TIN GIÁM THỊ */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-blue-950 uppercase flex items-center space-x-2">
                <span>📢</span>
                <span>{broadcastTarget === 'all' ? 'PHÁT THÔNG BÁO TOÀN PHÒNG THI' : 'GỬI TIN NHẮN TỚI THÍ SINH'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowBroadcastModal(false);
                  setIndividualMsgTarget(null);
                  setBroadcastTarget('all');
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {individualMsgTarget && (
              <p className="text-xs text-slate-600 font-medium">
                Gửi riêng tới: <strong className="text-blue-950 font-bold">{individualMsgTarget.fullName}</strong> (Lớp {individualMsgTarget.studentClass})
              </p>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nội dung thông báo:</label>
                <textarea
                  rows={4}
                  value={broadcastMsgInput}
                  onChange={e => setBroadcastMsgInput(e.target.value)}
                  placeholder="Gõ thông báo khẩn gửi tới máy học sinh..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  autoFocus
                ></textarea>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="text-slate-500 font-medium">Mẫu nhanh:</span>
                {[
                  'Còn 10 phút, các em kiểm tra kỹ lại bài!',
                  'Còn 5 phút nữa sẽ hết giờ làm bài!',
                  'Chú ý không mở tab khác, tránh bị trừ điểm!'
                ].map((m, mIdx) => (
                  <button
                    key={mIdx}
                    type="button"
                    onClick={() => setBroadcastMsgInput(m)}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-medium"
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow"
                >
                  Phát Thông Báo Ngay 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO TĨNH (GÓC PHẢI TRÊN, KHÔNG NHẢY GIẬT) */}
      {adminToast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-white text-slate-900 rounded-2xl border-2 border-slate-200 shadow-2xl p-4 flex items-start space-x-3">
          <div className={`p-2 rounded-xl text-base font-black shrink-0 ${
            adminToast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            adminToast.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
            adminToast.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {adminToast.type === 'success' ? '✓' :
             adminToast.type === 'error' ? '✕' :
             adminToast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="flex-1 min-w-0">
            {adminToast.title && (
              <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide">
                {adminToast.title}
              </h4>
            )}
            <p className="text-xs text-slate-600 font-medium whitespace-pre-line mt-0.5">
              {adminToast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdminToast(null)}
            className="text-slate-400 hover:text-slate-600 text-base font-bold ml-1"
          >
            ×
          </button>
        </div>
      )}

      {/* DIALOG XÁC NHẬN / THÔNG BÁO TĨNH (GIỮA MÀN HÌNH, KHÔNG GIẬT NẢY) */}
      {adminDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2.5 rounded-2xl text-lg font-black shrink-0 ${
                adminDialog.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                adminDialog.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                adminDialog.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {adminDialog.type === 'success' ? '✓' :
                 adminDialog.type === 'error' ? '✕' :
                 adminDialog.type === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-black text-blue-950 text-base leading-tight">
                  {adminDialog.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                  {adminDialog.message}
                </p>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              {adminDialog.onConfirm ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAdminDialog(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fn = adminDialog.onConfirm;
                      setAdminDialog(null);
                      if (fn) fn();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow transition"
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdminDialog(null)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow transition"
                >
                  ĐÃ HIỂU
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminApp;
