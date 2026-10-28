import { useState, useEffect, useMemo, useRef } from 'react';
import { createProctorActions } from '../actions/proctorActions.js';
import { createClassAccessActions } from '../actions/classAccessActions.js';
import { createGradingActions } from '../actions/gradingActions.js';
import { createExportActions } from '../actions/exportActions.js';
import { createExamBankActions } from '../actions/examBankActions.js';
import { createSettingsActions } from '../actions/settingsActions.js';

// State, đồng bộ dữ liệu và hàm xử lý của Cổng Quản Trị. Mỗi nhóm hàm xử lý nằm trong src/admin/actions/.
export function useAdminController() {
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

  const s = {
    isAuthenticated,
    setIsAuthenticated,
    authReady,
    setAuthReady,
    teacherEmail,
    setTeacherEmail,
    loginError,
    setLoginError,
    activeTab,
    setActiveTab,
    liveSessions,
    setLiveSessions,
    liveFilter,
    setLiveFilter,
    submissions,
    setSubmissions,
    config,
    setConfig,
    auditLogs,
    setAuditLogs,
    filterGrade,
    setFilterGrade,
    filterClass,
    setFilterClass,
    filterMode,
    setFilterMode,
    filterGraded,
    setFilterGraded,
    searchQuery,
    setSearchQuery,
    gradingSubmission,
    setGradingSubmission,
    tempEssayScores,
    setTempEssayScores,
    tempFeedback,
    setTempFeedback,
    gradingSuccessAlert,
    setGradingSuccessAlert,
    showBroadcastModal,
    setShowBroadcastModal,
    broadcastTarget,
    setBroadcastTarget,
    broadcastMsgInput,
    setBroadcastMsgInput,
    individualMsgTarget,
    setIndividualMsgTarget,
    answerGrade,
    setAnswerGrade,
    answerType,
    setAnswerType,
    printClass,
    setPrintClass,
    printType,
    setPrintType,
    practiceSubs,
    setPracticeSubs,
    ALL_CLASSES_BY_GRADE,
    cloudStatus,
    setCloudStatus,
    newExamPassword,
    setNewExamPassword,
    examBankStatus,
    setExamBankStatus,
    setExamBankVersion,
    maxExamAttempts,
    setMaxExamAttempts,
    attemptGrade,
    setAttemptGrade,
    attemptLms,
    setAttemptLms,
    attemptStatus,
    setAttemptStatus,
    configSavedNotice,
    setConfigSavedNotice,
    examDurationMinutes,
    setExamDurationMinutes,
    practiceDurationMinutes,
    setPracticeDurationMinutes,
    shuffleQuestions,
    setShuffleQuestions,
    shuffleOptions,
    setShuffleOptions,
    requireAllQuestionsAnswered,
    setRequireAllQuestionsAnswered,
    googleDriveUrl,
    setGoogleDriveUrl,
    googleDriveToken,
    setGoogleDriveToken,
    isSyncingDrive,
    setIsSyncingDrive,
    driveSyncNotice,
    setDriveSyncNotice,
    isTestingDrive,
    setIsTestingDrive,
    driveTestMessage,
    setDriveTestMessage,
    showAppsScriptGuide,
    setShowAppsScriptGuide,
    hasDownloadedBackup,
    setHasDownloadedBackup,
    retentionSummary,
    fileInputRef,
    adminToast,
    setAdminToast,
    adminDialog,
    setAdminDialog,
    toastTimerRef,
    showToast,
    showDialog,
  };
  const { handleExtendTime, handleExtendTimeAll, handleForceSubmit, handleLockSession, handleUnlockSession, handleSendBroadcast } = createProctorActions(s);
  const { handleSetClassMode, handleQuickStartExam, handleCloseAllExams, handleRemoveCandidate, handleClearClassSessions, handleCleanStaleSessions, handleDeleteSubmission } = createClassAccessActions(s);
  const { openGradingModal, handleSaveGrading } = createGradingActions(s);
  const { handleExportCSV, handleExportJSON, handleImportJSON, handleClearAllData } = createExportActions(s);
  const { handleUploadExamBank, attemptDocRef, describeAttempt, handleLookupAttempt, handleGrantAttempt, handleSaveMaxAttempts, handleToggleExamBankLock, handleToggleExamCode } = createExamBankActions(s);
  const { handleSaveExamConfig, handleSaveGoogleDriveUrl, handleTestGoogleDrive, handleSyncAllGoogleDrive, handlePurgeExamData } = createSettingsActions(s);

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

  return {
    ...s,
    handleLogin,
    handleLogout,
    handleExtendTime,
    handleExtendTimeAll,
    handleForceSubmit,
    handleLockSession,
    handleUnlockSession,
    handleSendBroadcast,
    handleSetClassMode,
    handleQuickStartExam,
    handleCloseAllExams,
    handleRemoveCandidate,
    handleClearClassSessions,
    handleCleanStaleSessions,
    handleDeleteSubmission,
    openGradingModal,
    handleSaveGrading,
    handleExportCSV,
    handleExportJSON,
    handleImportJSON,
    handleClearAllData,
    handleUploadExamBank,
    attemptDocRef,
    describeAttempt,
    handleLookupAttempt,
    handleGrantAttempt,
    handleSaveMaxAttempts,
    handleToggleExamBankLock,
    handleToggleExamCode,
    handleSaveExamConfig,
    handleSaveGoogleDriveUrl,
    handleTestGoogleDrive,
    handleSyncAllGoogleDrive,
    handlePurgeExamData,
    filteredSubmissions,
    currentAnswerData,
    analyticsData
  };
}
