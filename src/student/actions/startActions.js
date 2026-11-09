import { readPracticeDraft } from './practiceDraft.js';
import { createExamDraftIdentity, readExamDraft, readExamDraftPosition, findRecoverableExamDraft, saveExamDraft } from './examDraft.js';
import { getStudentsByClass, verifyStudentLms } from '../../core/roster-data.js';

const PRACTICE_LOCK_KEY = 'asian_school_practice_lock_v1';

// Khóa ôn tập lưu trên máy theo mã LMS + khối (hết hạn sau 3 giờ); bài thi chính thức dùng exam_attempts.locked
export function readPracticeLock(grade, studentId) {
  try {
    const d = JSON.parse(localStorage.getItem(PRACTICE_LOCK_KEY) || 'null');
    if (!d || d.grade !== grade || d.studentId !== String(studentId || '').trim() || Date.now() - d.at > 3 * 3600 * 1000) return null;
    return d;
  } catch (e) { return null; }
}

export function savePracticeLock(grade, studentId, totalViolations) {
  try {
    localStorage.setItem(PRACTICE_LOCK_KEY, JSON.stringify({ grade, studentId: String(studentId || '').trim(), totalViolations, at: Date.now() }));
  } catch (e) { /* bộ nhớ bị chặn */ }
}

export function clearPracticeLock() {
  try { localStorage.removeItem(PRACTICE_LOCK_KEY); } catch (e) { /* bỏ qua */ }
}

// Bắt đầu phiên ôn tập / vào phòng thi: toàn màn hình, kiểm tra ca thi, chống gian lận, đồng hồ
// s: state và hàm của cổng học sinh (xem hooks/useStudentController.js)
export function createStartActions(s) {
  const { grade, mode, setExamState, fullName, studentClass, studentId, sessionId, setSessionId,
    setAssignedCode, selectedExamCode, setOfficialExam, setIsContactingServer, submittingExamRef, setExamAnswers, setExamDraftSession, officialTimingRef,
    setActiveQuestionIdx, examPasswordInput, setPracticeAnswers, setScoreResult, setTimeLeftStr, setSecondsLeft,
    violations, setViolations, setTotalViolations, setShowWarningModal, setWarningMessage, showDialog,
    isSessionLockedRef, setIsSessionLocked, setIsProctorUnlocked, lockReason, setLockReason, setExamStartTime,
    setElapsedSeconds, config, setPracticeSet, handleSubmitPractice, handleSubmitExam } = s;

  // Bắt đầu làm bài
  const handleStart = async () => {
    // Chưa có lượt được máy chủ xác nhận: không cho effect ghi state cũ vào draft.
    if (setExamDraftSession) setExamDraftSession(null);
    if (officialTimingRef) officialTimingRef.current = null;
    // Reset kết quả cũ nếu có
    if (setScoreResult) setScoreResult(null);
    // Chuẩn hóa họ tên và mã LMS (bỏ "-", khoảng trắng; viết hoa) để giáo viên đối chiếu dễ; dùng cho cả phiên
    const N = window.AsianSchoolNormalize;
    const fullName = N ? N.normalizeStudentName(s.fullName) : String(s.fullName || '').trim();
    const studentId = N ? N.normalizeLmsCode(s.studentId) : String(s.studentId || '').trim();
    if (s.setFullName) s.setFullName(fullName);
    if (s.setStudentId) s.setStudentId(studentId);
    if (!fullName.trim()) {
      showDialog('Yêu Cầu Nhập Họ Tên', 'Vui lòng nhập đầy đủ Họ và tên học sinh trước khi bắt đầu!', 'warning');
      return;
    }
    if (!studentId) {
      showDialog('Yêu Cầu Nhập Mã LMS', 'Vui lòng nhập Mã LMS của em (chỉ gồm các chữ số) trước khi bắt đầu!', 'warning');
      return;
    }

    // Xác thực 2 lớp danh tính học sinh nếu thuộc danh sách lớp đã số hóa (chống bạn khác thi hộ)
    const classRoster = getStudentsByClass(studentClass);
    const matched = classRoster.find(st => st.fullName === fullName);
    if (matched && !verifyStudentLms(matched, studentId)) {
      // NẾU HỌC SINH ĐÃ XÁC NHẬN MÃ KHẨN CẤP (DO DỮ LIỆU NHÀ TRƯỜNG SAI SÓT HOẶC MÃ MỚI ĐỔI)
      if (!s.isEmergencyLmsOverride) {
        const nextCount = (s.lmsErrorCount || 0) + 1;
        if (s.setLmsErrorCount) s.setLmsErrorCount(nextCount);
        if (s.setShowLmsMismatch) s.setShowLmsMismatch(true);

        if (nextCount <= 1) {
          showDialog(
            'Mã LMS Không Đúng ⛔',
            `Mã LMS em vừa nhập không chính xác.\n\nEm vui lòng kiểm tra lại thẻ học sinh và nhập lại mã nhé!`,
            'warning'
          );
        } else {
          showDialog(
            'Xác Thực Danh Tính Thí Sinh ⛔',
            `Mã LMS vẫn chưa khớp với hồ sơ lưu của học sinh "${fullName}" (Lớp ${studentClass}).\n\nNếu danh sách trường bị sai sót hoặc em mới đổi mã, em vui lòng bấm nút "Em cam đoan đây là Mã LMS đúng" ở bên dưới ô nhập để được vào thi ngay nhé!`,
            'warning'
          );
        }
        return;
      }
    }

    // 1. KÍCH HOẠT CHẾ ĐỘ TOÀN MÀN HÌNH TỨC THÌ (INSTANT FULLSCREEN) TỪ CỬ CHỈ BẤM NÚT
    try {
      if (window.AsianSchoolAntiCheat && window.AsianSchoolAntiCheat.requestFullscreen) {
        await window.AsianSchoolAntiCheat.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen request rejected', e);
    }

    // Kiểm tra quyền truy cập ca thi của lớp
    const currentClassAccess = window.AsianSchoolStorage.getClassAccessMode(studentClass);
    if (mode === 'exam' && currentClassAccess === 'practice_only') {
      showDialog('Thông Báo Ca Thi', `🔒 Ca thi chính thức của Lớp ${studentClass} chưa bắt đầu!\n\nEm vui lòng chọn chế độ "ÔN TẬP ĐỀ CƯƠNG" để luyện tập nhé.`, 'info');
      return;
    }
    if (mode === 'practice' && currentClassAccess === 'exam_only') {
      showDialog('Ca Thi Đang Diễn Ra', `⚠️ Lớp ${studentClass} hiện đang trong ca kiểm tra chính thức 45 phút!\n\nEm vui lòng chọn chế độ "THI GIỮA HK1" để làm bài.`, 'warning');
      return;
    }
    if (currentClassAccess === 'closed') {
      showDialog('Cổng Làm Bài Tạm Đóng', `🔒 Cổng làm bài tạm thời đóng đối với Lớp ${studentClass}.\n\nVui lòng báo Giám thị Thầy Trần Gia Huy để được hỗ trợ.`, 'warning');
      return;
    }

    // Giữ phiên trong sessionStorage theo khối + chế độ để tải lại trang không tạo thêm thẻ mới,
    // đồng thời mỗi tab / mỗi học sinh mở riêng đều có mã phiên độc lập không ghi đè nhau.
    const tabSidKey = `ahs_sess_${grade}_${mode}`;
    let sid = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(tabSidKey)) || '';
    if (!sid) {
      const authUid = window.AsianSchoolAuth && window.AsianSchoolAuth.uid ? window.AsianSchoolAuth.uid() : null;
      sid = 'sess-' + (authUid ? authUid.slice(-6) + '-' : '') + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      if (typeof sessionStorage !== 'undefined') {
        try { sessionStorage.setItem(tabSidKey, sid); } catch (e) {}
      }
    }

    // Bài thi chính thức: firestore.rules kiểm tra mật khẩu phòng thi, lớp đang mở ca thi, lượt thi theo mã LMS;
    // học sinh chỉ nhận đề không kèm đáp án
    let serverStart = null;
    let restoredQuestionIdx = 0;
    let practiceResume = null;
    let practiceStartedAtMs = null;
    if (mode === 'exam') {
      if (!examPasswordInput.trim()) {
        showDialog('Yêu Cầu Mật Khẩu', '⚠️ VUI LÒNG NHẬP MẬT KHẨU PHÒNG THI!\n\nMật khẩu do Thầy/Cô giám thị cung cấp trước giờ làm bài.', 'warning');
        return;
      }
      setIsContactingServer(true);
      try {
        serverStart = await window.AsianSchoolCloud.startExam({
          grade, studentClass, fullName, studentId, sessionId: sid, password: examPasswordInput, examCode: selectedExamCode || ''
        });
      } catch (err) {
        setIsContactingServer(false);
        if (config?.allowStudentReviewOfficialExam && String(err.message || '').includes('đã dùng hết')) {
          showDialog(
            'Đã Hoàn Thành Bài Thi 📝',
            `Em đã hoàn thành bài thi chính thức này rồi!\n\nHiện Thầy Trần Gia Huy đã mở chức năng XEM LẠI BÀI THI & CHỐT ĐIỂM. Em có muốn xem lại bài làm và điểm số của mình ngay bây giờ không?`,
            'info',
            () => handleReviewLookup()
          );
          return;
        }
        showDialog('Chưa Vào Được Phòng Thi', `❌ ${err.message || 'Không kết nối được máy chủ.'}\n\nNếu em chắc chắn đã nhập đúng mật khẩu, hãy báo Thầy/Cô giám thị.`, 'error');
        return;
      }
      setIsContactingServer(false);
      if (serverStart.completed && serverStart.result) {
        window.AsianSchoolAntiCheat?.stop?.();
        window.AsianSchoolTimer?.stop?.();
        window.AsianSchoolAntiCheat?.exitFullscreen?.();
        setOfficialExam(null);
        if (setExamAnswers) setExamAnswers({ mcq: {}, tf: {}, essay: {} });
        if (setIsSessionLocked) setIsSessionLocked(false);
        if (setIsProctorUnlocked) setIsProctorUnlocked(false);
        if (setShowWarningModal) setShowWarningModal(false);
        setAssignedCode(serverStart.examCode);
        if (s.setFullName && serverStart.result.fullName) s.setFullName(serverStart.result.fullName);
        setScoreResult(serverStart.result);
        setExamState('submitted');
        return;
      }
      // Lượt đang bị khóa (tải lại trang khi bị khóa): chưa có đề, chờ giáo viên mở khóa trên máy chủ
      setOfficialExam(serverStart.exam || null);
      if (serverStart.exam && typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(`asian_school_exam_cache_g${grade}_${serverStart.examCode}`, JSON.stringify(serverStart.exam));
        } catch (e) { /* ignore storage error */ }
      }
      if (officialTimingRef) officialTimingRef.current = {
        startedAtMs: serverStart.startedAtMs,
        examCode: serverStart.examCode,
        baseDurationSeconds: serverStart.baseDurationSeconds || (serverStart.durationMinutes * 60 - (serverStart.extraTimeSeconds || 0)),
        extraTimeSeconds: serverStart.extraTimeSeconds || 0
      };
      const identity = createExamDraftIdentity({
        grade, studentClass, studentId, examCode: serverStart.examCode, startedAtMs: serverStart.startedAtMs,
        uid: window.AsianSchoolAuth?.uid?.() || '',
        attemptId: serverStart.attemptId
      });
      restoredQuestionIdx = Number.isSafeInteger(serverStart.activeQuestionIdx) && serverStart.activeQuestionIdx >= 0 ? serverStart.activeQuestionIdx : readExamDraftPosition(identity);
      let restoredAnswers = readExamDraft(identity) || serverStart.draftAnswers;

      // Cứu hộ bài làm khi học sinh bị lỗi kỹ thuật (tắt máy, máy đóng băng Deep Freeze, mở lại trình duyệt, đổi uid anonymous):
      if (!restoredAnswers || (!Object.keys(restoredAnswers.mcq || {}).length && !Object.keys(restoredAnswers.tf || {}).length && !Object.keys(restoredAnswers.essay || {}).length)) {
        const recovered = findRecoverableExamDraft({ grade, studentClass, studentId, examCode: serverStart.examCode, startedAtMs: serverStart.startedAtMs });
        if (recovered && recovered.answers) {
          restoredAnswers = recovered.answers;
          if (recovered.activeQuestionIdx !== undefined) {
            restoredQuestionIdx = recovered.activeQuestionIdx;
          }
          if (identity) {
            saveExamDraft(identity, restoredAnswers, undefined, restoredQuestionIdx);
          }
        }
      }
      if (!restoredAnswers) restoredAnswers = { mcq: {}, tf: {}, essay: {} };

      if (setExamAnswers) setExamAnswers(restoredAnswers);
      if (setActiveQuestionIdx && Number.isSafeInteger(restoredQuestionIdx)) setActiveQuestionIdx(restoredQuestionIdx);
      if (setExamDraftSession) setExamDraftSession(identity ? { identity, initialAnswers: restoredAnswers } : null);
      submittingExamRef.current = false;
    }

    if (mode === 'practice') {
      practiceResume = readPracticeDraft({grade,studentClass,studentId});
      practiceStartedAtMs = practiceResume?.startedAtMs || Date.now();
      const currentData=grade===8?window.EXAM_DATA_G8:grade===9?window.EXAM_DATA_G9:window.EXAM_DATA_G10;
      const selected=practiceResume?.practiceSet || window.AsianSchoolStorage.generatePracticeSet(grade,currentData,config);
      setPracticeSet(selected);
      setPracticeAnswers(practiceResume?.answers || {mcq:{},tf:{},essay:{}});
      restoredQuestionIdx=practiceResume?.activeQuestionIdx || 0;
      if(s.setPracticeDraftSession)s.setPracticeDraftSession({startedAtMs:practiceStartedAtMs || Date.now(),durationMinutes:practiceResume?.durationMinutes ?? config.practiceDurationMinutes ?? 0});
    }

    setSessionId(sid);
    setActiveQuestionIdx(restoredQuestionIdx);

    // Xác định cấu hình khóa màn hình vi phạm
    const shouldLock = mode === 'practice'
      ? Boolean(config && config.lockOnPracticeViolation)
      : (config?.lockOnExamViolation !== false);

    // Nếu là ôn tập mà chế độ mặc định không khóa vi phạm: dọn dẹp khóa cũ trên máy nếu có
    if (mode === 'practice' && !shouldLock) {
      clearPracticeLock();
    }

    // Ôn tập: khóa lưu trên máy (tải lại trang vẫn khóa, chờ giám thị); bài thi chính thức khóa trên máy chủ
    const practiceLock = (mode === 'practice' && shouldLock) ? readPracticeLock(grade, studentId) : null;
    const resumeLocked = !!(serverStart && serverStart.locked) || !!practiceLock;
    if (isSessionLockedRef) isSessionLockedRef.current = resumeLocked;
    setIsSessionLocked(resumeLocked);
    setIsProctorUnlocked(false);
    setLockReason(resumeLocked ? ((serverStart && serverStart.lockReason) || 'violation_3_times') : null);
    setViolations(0);
    // Tổng vi phạm của lượt (không đặt lại khi mở khóa); bài thi chính thức lấy số chuẩn trên exam_attempts
    let totalViolations = serverStart ? (serverStart.violations || 0) : (practiceLock ? practiceLock.totalViolations : (practiceResume?.violations || 0));
    setTotalViolations(totalViolations);
    setExamStartTime(new Date(serverStart?.startedAtMs || practiceStartedAtMs || Date.now()));
    setElapsedSeconds(Math.max(0, Math.floor(((serverStart?.serverNowMs || Date.now()) - (serverStart?.startedAtMs || practiceStartedAtMs || Date.now())) / 1000)));

    // Xác định mã đề
    const code = serverStart ? serverStart.examCode : window.AsianSchoolStorage.determineExamCode(grade, studentClass);
    setAssignedCode(code);

    // Bật chống gian lận
    window.AsianSchoolAntiCheat.start({
      mode,
      onViolation: (v) => {
        // NẾU BÀI ĐANG BỊ KHÓA: Tuyệt đối không ghi nhận thêm vi phạm khi đang ở màn hình khóa
        if (isSessionLockedRef?.current || (window.AsianSchoolAntiCheat && window.AsianSchoolAntiCheat.isLocked)) return;

        setViolations(v.count);
        totalViolations += 1;
        setTotalViolations(totalViolations);

        if (v.count >= 3 && shouldLock) {
          if (mode === 'practice') savePracticeLock(grade, studentId, totalViolations);
          if (mode === 'exam' && window.AsianSchoolCloud && window.AsianSchoolCloud.reportViolation) {
            window.AsianSchoolCloud.reportViolation({ grade, studentClass, studentId, lock: true });
          }
          // Khóa AntiCheat lại để không bắn thêm vi phạm khi đang ở màn hình khóa
          if (window.AsianSchoolAntiCheat && window.AsianSchoolAntiCheat.setLocked) {
            window.AsianSchoolAntiCheat.setLocked(true);
          }
          if (isSessionLockedRef) isSessionLockedRef.current = true;
          // Cảnh báo lần 1–2 không còn ý nghĩa khi đã khóa (tránh hiện lại sau khi mở khóa)
          setShowWarningModal(false);
          setIsSessionLocked(true);
          setIsProctorUnlocked(false);
          setLockReason('violation_3_times');
          window.AsianSchoolStorage.updateLiveSession({
            sessionId: sid,
            fullName,
            studentClass,
            studentId,
            grade,
            mode,
            examCode: code || (mode === 'practice' ? 'DE_CUONG' : '101'),
            violations: totalViolations,
            status: 'locked',
            isLocked: true,
            lockReason: 'violation_3_times',
            penaltyPoints: 0
          });
        } else {
          if (mode === 'exam' && window.AsianSchoolCloud && window.AsianSchoolCloud.reportViolation) {
            window.AsianSchoolCloud.reportViolation({ grade, studentClass, studentId, lock: false });
          }
          const warningMsg = `Em vừa rời giao diện làm bài hoặc thoát toàn màn hình. ${shouldLock
            ? `Vi phạm ${v.count}/3 lần trong đợt này; lần thứ 3 sẽ khóa bài.`
            : 'Lần này hệ thống chỉ ghi nhận, không khóa bài.'}`;
          setWarningMessage(warningMsg);
          setShowWarningModal(true);
          window.AsianSchoolStorage.updateLiveSession({
            sessionId: sid,
            fullName,
            studentClass,
            studentId,
            grade,
            mode,
            examCode: code || (mode === 'practice' ? 'DE_CUONG' : '101'),
            violations: totalViolations,
            status: mode === 'exam' ? 'in_progress' : 'practicing',
            isLocked: false
          });
        }
      }
    });

    if (resumeLocked && window.AsianSchoolAntiCheat && window.AsianSchoolAntiCheat.setLocked) {
      window.AsianSchoolAntiCheat.setLocked(true);
    }

    // Cấu hình thời gian làm bài từ Admin
    const examDur = serverStart ? serverStart.durationMinutes : (config.examDurationMinutes || 45);
    // Tải lại trang giữa giờ: đồng hồ tính tiếp từ giờ bắt đầu máy chủ ghi nhận
    const examRemainingMin = serverStart
      ? Math.max(1 / 60, ((serverStart.deadlineMs || (serverStart.startedAtMs + examDur * 60000)) - (serverStart.serverNowMs || Date.now())) / 60000)
      : examDur;
    const practiceDur = practiceResume?.durationMinutes ?? (config.practiceDurationMinutes || 0);

    let armingTimer = true;
    // Nếu là chế độ Thi: Kích hoạt đồng hồ đếm ngược theo thời gian do Admin thiết lập
    if (mode === 'exam') {
      window.AsianSchoolTimer.start({
        durationMinutes: examRemainingMin,
        deadlineMs: serverStart.deadlineMs || serverStart.startedAtMs + examDur * 60000,
        serverNowMs: serverStart.serverNowMs,
        startedAtMs: serverStart.startedAtMs,
        onTick: (sec, fmt, timing) => {
          if (timing) setElapsedSeconds(timing.elapsedSeconds);
          setSecondsLeft(sec);
          setTimeLeftStr(fmt);
          // Nhịp tim định kỳ 60 giây (tối ưu hóa hạn mức Firebase cho 26 học sinh)
          if (sec % 60 === 0) {
            window.AsianSchoolStorage.updateLiveSession({
              sessionId: sid,
              fullName,
              studentClass,
              studentId,
              grade,
              mode: 'exam',
              examCode: code,
              // Nhịp tim không ghi trạng thái khóa (tránh ghi đè 'locked'); số vi phạm là tổng hiện tại
              violations: totalViolations,
              timeLeft: fmt
            });
          }
        },
        onWarning: () => {
          showDialog('Cảnh Báo Thời Gian', '⚠️ Chú ý: Thời gian làm bài thi chỉ còn dưới 5 phút! Các em hãy kiểm tra lại toàn bộ bài làm.', 'warning');
        },
        onTimeout: () => {
          showDialog('Hết Giờ Làm Bài', `⏰ Đã hết thời gian làm bài ${examDur} phút! Hệ thống đang tự động thu bài của bạn.`, 'info');
          if (armingTimer) setTimeout(() => handleSubmitExam(true), 0);
          else handleSubmitExam(true);
        }
      });

      // Gửi phiên trực tiếp lên bảng giám sát giáo viên (Live Monitoring)
      window.AsianSchoolStorage.updateLiveSession({
        sessionId: sid,
        fullName,
        studentClass,
        studentId,
        grade,
        mode: 'exam',
        examCode: code,
        violations: totalViolations,
        status: resumeLocked ? 'locked' : 'in_progress',
        isLocked: resumeLocked,
        timeLeft: window.AsianSchoolTimer.formatTime ? window.AsianSchoolTimer.formatTime(window.AsianSchoolTimer.remainingSeconds) : `${examDur}:00`
      });
    } else {
      // Chế độ Ôn tập đề cương: Vẫn cho phép giáo viên giám sát từ xa theo thời gian thực
      if (practiceDur > 0) {
        window.AsianSchoolTimer.start({
          durationMinutes: practiceDur,
          startedAtMs: practiceStartedAtMs || Date.now(),
          deadlineMs: (practiceStartedAtMs || Date.now()) + practiceDur * 60000,
          onTick: (sec, fmt) => {
            setSecondsLeft(sec);
            setTimeLeftStr(fmt);
            if (sec % 60 === 0) {
              window.AsianSchoolStorage.updateLiveSession({
                sessionId: sid,
                fullName,
                studentClass,
                studentId,
                grade,
                mode: 'practice',
                examCode: 'DE_CUONG',
                violations: totalViolations,
                timeLeft: fmt
              });
            }
          },
          onWarning: () => {
            showDialog('Cảnh Báo Thời Gian', '⚠️ Chú ý: Thời gian ôn tập chỉ còn dưới 5 phút!', 'warning');
          },
          onTimeout: () => {
            // Chỉ nộp một lần (trước đây hộp thoại xác nhận còn nộp thêm lần nữa)
            showDialog('Hết Giờ Ôn Tập', `⏰ Đã hết thời gian ôn tập ${practiceDur} phút! Hệ thống đã tự động nộp bài ôn tập của em.`, 'info');
            if (armingTimer) setTimeout(() => handleSubmitPractice(true), 0);
            else handleSubmitPractice(true);
          }
        });
      }

      // Khởi tạo phiên giám sát ôn tập từ xa
      window.AsianSchoolStorage.updateLiveSession({
        sessionId: sid,
        fullName,
        studentClass,
        studentId,
        grade,
        mode: 'practice',
        examCode: 'DE_CUONG',
        violations: totalViolations,
        status: resumeLocked ? 'locked' : 'practicing',
        isLocked: resumeLocked,
        timeLeft: practiceDur > 0 ? `${practiceDur}:00` : 'Tự do'
      });
    }

    armingTimer = false;
    setExamState('in_progress');
  };

  // Tra cứu bài thi chính thức để xem lại bài làm và xác nhận chốt điểm (ví dụ: 1 tuần sau khi thi)
  const handleReviewLookup = async () => {
    const N = window.AsianSchoolNormalize;
    const studentId = N ? N.normalizeLmsCode(s.studentId) : String(s.studentId || '').trim();
    if (s.setStudentId) s.setStudentId(studentId);
    if (!studentId) {
      showDialog('Yêu Cầu Nhập Mã LMS', 'Vui lòng nhập Mã LMS của em (chỉ gồm các chữ số) để tra cứu bài thi!', 'warning');
      return;
    }

    const isClassAllowed = Boolean(
      config?.allowStudentReviewOfficialExam ||
      (studentClass && config?.classReviewControl && config.classReviewControl[studentClass] === true)
    );
    if (!isClassAllowed) {
      showDialog(
        `Lớp ${studentClass || ''} Chưa Mở Xem Bài ⏳`,
        `Thầy Trần Gia Huy hiện đang chấm bài tự luận cho Lớp ${studentClass || 'của em'}.\n\nSau khi Thầy hoàn tất chấm điểm sẽ mở chức năng để lớp mình đối soát và chốt điểm nhé!`,
        'info'
      );
      return;
    }

    setIsContactingServer(true);
    try {
      let result = null;
      if (window.AsianSchoolCloud && window.AsianSchoolCloud.lookupSubmissionForReview) {
        try {
          result = await window.AsianSchoolCloud.lookupSubmissionForReview({
            grade,
            studentClass,
            studentId,
            fullName: s.fullName
          });
        } catch (cloudErr) {
          console.warn('[ReviewLookup] Cloud lookup:', cloudErr.message);
        }
      }

      // Fallback tìm bài trong storage nếu máy chủ chưa trả về hoặc làm bài cục bộ
      if (!result && window.AsianSchoolStorage && window.AsianSchoolStorage.lookupLocalSubmission) {
        const local = window.AsianSchoolStorage.lookupLocalSubmission(grade, studentClass, studentId)
          || window.AsianSchoolStorage.lookupLocalSubmission(grade, null, studentId);
        if (local) {
          result = { submission: local, exam: null, subId: local.id };
        }
      }

      if (result && !result.exam && result.submission) {
        const sub = result.submission;
        let cached = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const raw = localStorage.getItem(`asian_school_exam_cache_g${grade}_${sub.examCode}`)
              || localStorage.getItem(`asian_school_exam_cache_g${grade}_101`);
            if (raw) cached = JSON.parse(raw);
          } catch (e) { /* ignore */ }
        }
        const examObj = window.AsianSchoolLatestExamBank?.[grade]?.[sub.examCode]
          || window['EXAM_DATA_G' + grade]?.officialExams?.[sub.examCode]
          || cached;
        if (examObj) result.exam = examObj;
      }

      if (!result || !result.submission) {
        throw new Error(`Không tìm thấy bài thi của Mã LMS ${studentId} (Lớp ${studentClass}). Em vui lòng kiểm tra lại đúng Khối, Lớp và Mã LMS nhé!`);
      }

      const sub = result.submission;
      setIsContactingServer(false);

      if (setOfficialExam) setOfficialExam(result.exam || null);
      if (setExamAnswers) setExamAnswers(sub.answers || { mcq: {}, tf: {}, essay: {} });
      if (s.setAssignedCode) s.setAssignedCode(sub.examCode || '101');
      if (s.setFullName && sub.fullName) s.setFullName(sub.fullName);
      if (s.setStudentClass && sub.studentClass) s.setStudentClass(sub.studentClass);

      const mcqPoints = sub.mcqPoints !== undefined
        ? sub.mcqPoints
        : (sub.finalScore !== undefined ? Math.max(0, sub.finalScore - (sub.essayTotal || 0)) : (sub.score || 0));

      const reviewScore = {
        mode: 'exam',
        isOfficialReview: true,
        submissionId: result.subId || sub.id,
        id: result.subId || sub.id,
        examCode: sub.examCode || '101',
        studentClass: sub.studentClass || studentClass,
        studentId: sub.studentId || studentId,
        fullName: sub.fullName || s.fullName,
        grade: sub.grade || grade,
        score: mcqPoints,
        mcqPoints,
        correctMcq: sub.correctMcq,
        mcqResults: sub.mcqResults || {},
        tfResults: sub.tfResults || {},
        essayScores: sub.essayScores || {},
        essayTotal: sub.essayTotal || 0,
        finalScore: sub.finalScore !== undefined ? sub.finalScore : mcqPoints,
        teacherFeedback: sub.teacherFeedback || '',
        isGraded: Boolean(sub.isGraded),
        scoreConfirmed: Boolean(sub.scoreConfirmed),
        scoreConfirmedAt: sub.scoreConfirmedAt || null,
        violations: sub.violations || 0,
        submittedAt: sub.submittedAt || new Date().toISOString(),
        durationFormatted: sub.durationFormatted || '45 phút',
        answers: sub.answers || { mcq: {}, tf: {}, essay: {} }
      };

      if (setScoreResult) setScoreResult(reviewScore);
      if (s.setMode) s.setMode('exam');
      if (setExamState) setExamState('submitted');
    } catch (err) {
      setIsContactingServer(false);
      showDialog('Tra Cứu Bài Thi', `⚠️ ${err.message || 'Không thể mở bài thi vào lúc này.'}`, 'error');
    }
  };

  return { handleStart, handleReviewLookup };
}
