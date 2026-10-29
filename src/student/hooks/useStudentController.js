import { useState, useEffect, useRef, useMemo } from 'react';
import { useBlockDevtools } from './useBlockDevtools.js';
import { useProctorCommands } from './useProctorCommands.js';
import { CLASS_LISTS } from '../constants.js';

// State, đồng bộ cấu hình, chống gian lận và hàm xử lý của cổng học sinh (trước đây nằm chung trong App)
import { createPracticeSubmitActions } from '../actions/practiceSubmitActions.js';
import { createExamSubmitActions } from '../actions/examSubmitActions.js';
import { createStartActions } from '../actions/startActions.js';
import { createCaptureActions } from '../actions/captureActions.js';
export function useStudentController() {
  // Setup state
  const [grade, setGrade] = useState(() => {
    try {
      const v = typeof localStorage !== 'undefined' && localStorage.getItem('ahs_student_grade_v1');
      return v ? Number(v) : 8;
    } catch { return 8; }
  });
  const [mode, setMode] = useState('practice'); // 'practice' | 'exam'
  const [examState, setExamState] = useState('entry'); // 'entry' | 'in_progress' | 'submitted'
  
  // User info (Tự động ghi nhớ trong localStorage để học sinh không phải nhập lại)
  const [fullName, setFullName] = useState(() => {
    try { return (typeof localStorage !== 'undefined' && localStorage.getItem('ahs_student_fullname_v1')) || ''; } catch { return ''; }
  });
  const [studentClass, setStudentClass] = useState(() => {
    try { return (typeof localStorage !== 'undefined' && localStorage.getItem('ahs_student_class_v1')) || '8/19'; } catch { return '8/19'; }
  });
  const [studentId, setStudentId] = useState(() => {
    try { return (typeof localStorage !== 'undefined' && localStorage.getItem('ahs_student_lms_v1')) || ''; } catch { return ''; }
  });
  const [sessionId, setSessionId] = useState('');
  const [assignedCode, setAssignedCode] = useState('101');
  // Đề chính thức đã bỏ đáp án, đọc từ exam_public khi vào phòng thi (AsianSchoolCloud.startExam); không nằm trong data/*.js
  const [officialExam, setOfficialExam] = useState(null);
  const [isContactingServer, setIsContactingServer] = useState(false);
  const submittingExamRef = useRef(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Exam password state
  const [examPasswordInput, setExamPasswordInput] = useState('');
  const [showExamPassword, setShowExamPassword] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Answers state
  const [practiceAnswers, setPracticeAnswers] = useState({ mcq: {}, tf: {}, essay: {} });
  const [examAnswers, setExamAnswers] = useState({ mcq: {}, tf: {}, essay: {} });
  
  // Timer & Anti-cheat Modal State
  const [timeLeftStr, setTimeLeftStr] = useState('45:00');
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [violations, setViolations] = useState(0);
  // Tổng vi phạm của phiên/lượt: KHÔNG đặt lại khi giám thị mở khóa (giáo viên dùng để ghi sổ)
  const [totalViolations, setTotalViolations] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [broadcastNotice, setBroadcastNotice] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Hệ thống Thông Báo Nội Bộ Tĩnh (Thay thế alert, không hiệu ứng nhảy giật)
  const [customDialog, setCustomDialog] = useState(null); // { title, message, type: 'info'|'warning'|'error'|'success', onConfirm }
  const showDialog = (title, message, type = 'info', onConfirm = null) => {
    setCustomDialog({ title, message, type, onConfirm });
  };

  // Lock State & Time Tracking
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [isProctorUnlocked, setIsProctorUnlocked] = useState(false);
  const [lockReason, setLockReason] = useState(null); // 'violation_3_times' | 'proctor_lock'
  const [examStartTime, setExamStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showMobileQuestionDrawer, setShowMobileQuestionDrawer] = useState(false);

  // Định dạng giây trôi qua mm:ss
  const formatElapsed = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Bộ đếm thời gian làm bài thực tế
  useEffect(() => {
    if (examState !== 'in_progress') return;
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examState]);

  // Class Access Control State ('practice_only' | 'exam_only' | 'both_open' | 'closed')
  const [classAccessMode, setClassAccessMode] = useState(
    window.AsianSchoolStorage ? window.AsianSchoolStorage.getClassAccessMode(studentClass) : 'practice_only'
  );

  // Cấu hình thời gian làm bài & xáo trộn đề từ Admin
  const [config, setConfig] = useState(() => (
    (typeof window !== 'undefined' && window.AsianSchoolStorage)
      ? window.AsianSchoolStorage.getConfig()
      : {}
  ));

  // Lắng nghe cấu hình Admin thay đổi thời gian thực
  useEffect(() => {
    if (!window.AsianSchoolStorage) return;
    const unsub = window.AsianSchoolStorage.onConfigChange((newCfg) => {
      setConfig(newCfg);
    });
    return () => unsub();
  }, []);

  // Tự động lưu thông tin học sinh vào localStorage để không phải nhập lại
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        if (fullName) localStorage.setItem('ahs_student_fullname_v1', fullName);
        if (studentId) localStorage.setItem('ahs_student_lms_v1', studentId);
        if (studentClass) localStorage.setItem('ahs_student_class_v1', studentClass);
        if (grade) localStorage.setItem('ahs_student_grade_v1', String(grade));
      }
    } catch { /* ignore */ }
  }, [fullName, studentId, studentClass, grade]);


  // Cập nhật quyền truy cập khi đổi lớp hoặc cấu hình thay đổi thời gian thực từ Cloud
  useEffect(() => {
    if (!window.AsianSchoolStorage) return;
    const syncAccess = () => {
      const acc = window.AsianSchoolStorage.getClassAccessMode(studentClass);
      setClassAccessMode(acc);
      if (acc === 'exam_only') {
        setMode('exam');
      } else if (acc === 'practice_only') {
        setMode('practice');
      }
    };
    syncAccess();

    const unsub = window.AsianSchoolStorage.onConfigChange(() => {
      syncAccess();
    });
    return () => unsub();
  }, [studentClass]);

  // Data references
  const gradeData = grade === 8 ? window.EXAM_DATA_G8 : (grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
  
  // Bộ đề ngẫu nhiên cho Practice Mode:
  // THCS: 28 câu trắc nghiệm (ngẫu nhiên từ 35 câu) + 3 câu tự luận
  // THPT: 19 câu trắc nghiệm (ngẫu nhiên từ 25 câu) + 3 câu đúng/sai (ngẫu nhiên từ 6 câu) + 3 câu tự luận
  const [practiceSet, setPracticeSet] = useState(() => {
    const initialGradeData = grade === 8 ? window.EXAM_DATA_G8 : (grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
    const currentCfg = (typeof window !== 'undefined' && window.AsianSchoolStorage)
      ? window.AsianSchoolStorage.getConfig()
      : {};
    if (typeof window !== 'undefined' && window.AsianSchoolStorage && window.AsianSchoolStorage.generatePracticeSet) {
      return window.AsianSchoolStorage.generatePracticeSet(grade, initialGradeData, currentCfg);
    }
    return { mcqQuestions: [], tfQuestions: [], essayQuestions: [] };
  });

  const practiceQuestions = practiceSet.mcqQuestions || [];
  const practiceTfQuestions = practiceSet.tfQuestions || [];
  const practiceEssayQuestions = practiceSet.essayQuestions || [];
  const currentOfficialExam = officialExam;

  // Cập nhật lớp & đề cương khi đổi khối
  useEffect(() => {
    if (CLASS_LISTS[grade] && !CLASS_LISTS[grade].includes(studentClass)) {
      setStudentClass(CLASS_LISTS[grade][0]);
    }
    const currentData = grade === 8 ? window.EXAM_DATA_G8 : (grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
    if (typeof window !== 'undefined' && window.AsianSchoolStorage && window.AsianSchoolStorage.generatePracticeSet) {
      setPracticeSet(window.AsianSchoolStorage.generatePracticeSet(grade, currentData, config));
    }
    setPracticeAnswers({ mcq: {}, tf: {}, essay: {} });
  }, [grade]);

  // Danh sách câu hỏi thống nhất cho Practice Mode (1 câu mỗi lần)
  const practiceItems = useMemo(() => {
    const items = [];
    (practiceQuestions || []).forEach((q, idx) => {
      items.push({
        id: 'mcq-' + q.id,
        type: 'mcq',
        section: 'Phần I. Trắc nghiệm nhiều lựa chọn',
        label: 'Câu ' + (idx + 1),
        num: idx + 1,
        points: 0.25,
        data: q,
        isAnswered: practiceAnswers.mcq[q.id] !== undefined
      });
    });
    if (grade === 10) {
      (practiceTfQuestions || []).forEach((tf) => {
        const userSub = practiceAnswers.tf[tf.num] || {};
        const answeredCount = tf.subQuestions.filter(s => userSub[s.letter] !== undefined).length;
        items.push({
          id: 'tf-' + tf.num,
          type: 'tf',
          section: 'Phần II. Trắc nghiệm Đúng / Sai',
          label: 'Câu ' + tf.num,
          num: tf.num,
          points: 1.0,
          data: tf,
          isAnswered: answeredCount === tf.subQuestions.length,
          partialCount: answeredCount,
          totalSubs: tf.subQuestions.length
        });
      });
    }
    (practiceEssayQuestions || []).forEach((es) => {
      const text = (practiceAnswers.essay[es.num] || '').trim();
      items.push({
        id: 'essay-' + es.num,
        type: 'essay',
        section: grade === 10 ? 'Phần III. Tự luận & Tình huống' : 'Phần II. Tự luận & Tình huống',
        label: 'Câu ' + es.num,
        num: es.num,
        points: null,
        data: es,
        isAnswered: text.length > 0
      });
    });
    return items;
  }, [grade, practiceQuestions, practiceTfQuestions, practiceEssayQuestions, practiceAnswers]);

  // Danh sách câu hỏi thống nhất cho Exam Mode (1 câu mỗi lần)
  const examItems = useMemo(() => {
    if (!currentOfficialExam) return [];
    const items = [];
    if (grade === 8 || grade === 9) {
      (currentOfficialExam.mcqQuestions || []).forEach((q) => {
        items.push({
          id: 'exam-mcq-' + q.num,
          type: 'exam_mcq',
          section: 'Phần I. Trắc nghiệm nhiều lựa chọn (7,0 điểm)',
          label: 'Câu ' + q.num,
          num: q.num,
          points: 0.25,
          data: q,
          isAnswered: examAnswers.mcq[q.num] !== undefined
        });
      });
      (currentOfficialExam.essayQuestions || []).forEach((es) => {
        const text = (examAnswers.essay[es.num] || '').trim();
        items.push({
          id: 'exam-essay-' + es.num,
          type: 'exam_essay',
          section: 'Phần II. Tự luận (3,0 điểm)',
          label: 'Câu ' + es.num,
          num: es.num,
          points: 1.0,
          data: es,
          isAnswered: text.length > 0
        });
      });
    } else if (grade === 10) {
      (currentOfficialExam.part1_mcq || []).forEach((q) => {
        items.push({
          id: 'exam-mcq-' + q.num,
          type: 'exam_mcq',
          section: 'Phần I. Trắc nghiệm nhiều lựa chọn (4,75 điểm)',
          label: 'Câu ' + q.num,
          num: q.num,
          points: 0.25,
          data: q,
          isAnswered: examAnswers.mcq[q.num] !== undefined
        });
      });
      (currentOfficialExam.part2_tf || []).forEach((tf) => {
        const userSub = examAnswers.tf[tf.num] || {};
        const answeredCount = tf.subQuestions.filter(s => userSub[s.letter] !== undefined).length;
        items.push({
          id: 'exam-tf-' + tf.num,
          type: 'exam_tf',
          section: 'Phần II. Trắc nghiệm Đúng / Sai (3,0 điểm)',
          label: 'Câu ' + tf.num,
          num: tf.num,
          points: 1.0,
          data: tf,
          isAnswered: answeredCount === tf.subQuestions.length,
          partialCount: answeredCount,
          totalSubs: tf.subQuestions.length
        });
      });
      (currentOfficialExam.part3_essay || []).forEach((es) => {
        const text = (examAnswers.essay[es.num] || '').trim();
        items.push({
          id: 'exam-essay-' + es.num,
          type: 'exam_essay',
          section: 'Phần III. Tự luận (2,25 điểm)',
          label: 'Câu ' + es.num,
          num: es.num,
          points: 0.75,
          data: es,
          isAnswered: text.length > 0
        });
      });
    }
    return items;
  }, [grade, currentOfficialExam, examAnswers]);

  // Khi học sinh tắt cảnh báo vi phạm -> Tự động quay lại Toàn màn hình
  const handleDismissWarning = async () => {
    setShowWarningModal(false);
    try {
      await window.AsianSchoolAntiCheat.requestFullscreen();
    } catch (e) {
      console.warn('Cannot request fullscreen', e);
    }
  };

  const s = {
    grade,
    setGrade,
    mode,
    setMode,
    examState,
    setExamState,
    fullName,
    setFullName,
    studentClass,
    setStudentClass,
    studentId,
    setStudentId,
    sessionId,
    setSessionId,
    assignedCode,
    setAssignedCode,
    officialExam,
    setOfficialExam,
    isContactingServer,
    setIsContactingServer,
    submittingExamRef,
    activeQuestionIdx,
    setActiveQuestionIdx,
    examPasswordInput,
    setExamPasswordInput,
    showExamPassword,
    setShowExamPassword,
    showSubmitModal,
    setShowSubmitModal,
    practiceAnswers,
    setPracticeAnswers,
    examAnswers,
    setExamAnswers,
    timeLeftStr,
    setTimeLeftStr,
    secondsLeft,
    setSecondsLeft,
    violations,
    totalViolations,
    setTotalViolations,
    setViolations,
    showWarningModal,
    setShowWarningModal,
    warningMessage,
    setWarningMessage,
    broadcastNotice,
    setBroadcastNotice,
    scoreResult,
    setScoreResult,
    isCapturing,
    setIsCapturing,
    customDialog,
    setCustomDialog,
    showDialog,
    isSessionLocked,
    setIsSessionLocked,
    isProctorUnlocked,
    setIsProctorUnlocked,
    lockReason,
    setLockReason,
    examStartTime,
    setExamStartTime,
    elapsedSeconds,
    setElapsedSeconds,
    showMobileQuestionDrawer,
    setShowMobileQuestionDrawer,
    formatElapsed,
    classAccessMode,
    setClassAccessMode,
    config,
    setConfig,
    gradeData,
    practiceSet,
    setPracticeSet,
    practiceQuestions,
    practiceTfQuestions,
    practiceEssayQuestions,
    currentOfficialExam,
    practiceItems,
    examItems,
    handleDismissWarning,
  };
  Object.assign(s, createPracticeSubmitActions(s));
  const { handleSubmitPractice } = s;
  Object.assign(s, createExamSubmitActions(s));
  const { handleSubmitExam } = s;
  Object.assign(s, createStartActions(s));
  const { handleStart } = s;
  Object.assign(s, createCaptureActions(s));
  const { handleCaptureScreenshot } = s;

  useBlockDevtools();
  Object.assign(s, useProctorCommands(s));

  return {
    ...s
  };
}
