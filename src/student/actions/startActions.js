// Bắt đầu phiên ôn tập / vào phòng thi: toàn màn hình, kiểm tra ca thi, chống gian lận, đồng hồ
// s: state và hàm của cổng học sinh (xem hooks/useStudentController.js)
export function createStartActions(s) {
  const { grade, mode, setExamState, fullName, studentClass, studentId, sessionId, setSessionId,
    setAssignedCode, setOfficialExam, setIsContactingServer, submittingExamRef,
    setActiveQuestionIdx, examPasswordInput, setPracticeAnswers, setTimeLeftStr, setSecondsLeft,
    violations, setViolations, setShowWarningModal, setWarningMessage, showDialog,
    setIsSessionLocked, setIsProctorUnlocked, lockReason, setLockReason, setExamStartTime,
    setElapsedSeconds, config, setPracticeSet, handleSubmitPractice, handleSubmitExam } = s;

  // Bắt đầu làm bài
  const handleStart = async () => {
    if (!fullName.trim()) {
      showDialog('Yêu Cầu Nhập Họ Tên', 'Vui lòng nhập đầy đủ Họ và tên học sinh trước khi bắt đầu!', 'warning');
      return;
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

    const sid = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

    // Bài thi chính thức: firestore.rules kiểm tra mật khẩu phòng thi, lớp đang mở ca thi, lượt thi theo mã LMS;
    // học sinh chỉ nhận đề không kèm đáp án
    let serverStart = null;
    if (mode === 'exam') {
      if (!examPasswordInput.trim()) {
        showDialog('Yêu Cầu Mật Khẩu', '⚠️ VUI LÒNG NHẬP MẬT KHẨU PHÒNG THI!\n\nMật khẩu do Thầy/Cô giám thị cung cấp trước giờ làm bài.', 'warning');
        return;
      }
      setIsContactingServer(true);
      try {
        serverStart = await window.AsianSchoolCloud.startExam({
          grade, studentClass, fullName, studentId, sessionId: sid, password: examPasswordInput
        });
      } catch (err) {
        setIsContactingServer(false);
        showDialog('Chưa Vào Được Phòng Thi', `❌ ${err.message || 'Không kết nối được máy chủ.'}\n\nNếu em chắc chắn đã nhập đúng mật khẩu, hãy báo Thầy/Cô giám thị.`, 'error');
        return;
      }
      setIsContactingServer(false);
      // Lượt đang bị khóa (tải lại trang khi bị khóa): chưa có đề, chờ giáo viên mở khóa trên máy chủ
      setOfficialExam(serverStart.exam || null);
      submittingExamRef.current = false;
    }

    // Nếu là ôn tập: Luôn bốc ngẫu nhiên một bộ đề mới (28 câu THCS hoặc 19 câu + 3 câu Đ/S THPT)
    if (mode === 'practice') {
      const currentData = grade === 8 ? window.EXAM_DATA_G8 : (grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
      if (typeof window !== 'undefined' && window.AsianSchoolStorage && window.AsianSchoolStorage.generatePracticeSet) {
        setPracticeSet(window.AsianSchoolStorage.generatePracticeSet(grade, currentData, config));
      }
      setPracticeAnswers({ mcq: {}, tf: {}, essay: {} });
    }

    setSessionId(sid);
    setActiveQuestionIdx(0);
    const resumeLocked = !!(serverStart && serverStart.locked);
    setIsSessionLocked(resumeLocked);
    setIsProctorUnlocked(false);
    setLockReason(resumeLocked ? serverStart.lockReason : null);
    setViolations(0);
    // Tổng vi phạm của lượt (không đặt lại khi mở khóa); bài thi chính thức lấy số chuẩn trên exam_attempts
    let totalViolations = serverStart ? (serverStart.violations || 0) : 0;
    setExamStartTime(serverStart ? new Date(serverStart.startedAtMs) : new Date());
    setElapsedSeconds(0);

    // Xác định mã đề
    const code = serverStart ? serverStart.examCode : window.AsianSchoolStorage.determineExamCode(grade, studentClass);
    setAssignedCode(code);

    // Bật chống gian lận
    window.AsianSchoolAntiCheat.start({
      mode,
      onViolation: (v) => {
        setViolations(v.count);
        totalViolations += 1;
        if (mode === 'exam' && window.AsianSchoolCloud && window.AsianSchoolCloud.reportViolation) {
          window.AsianSchoolCloud.reportViolation({ grade, studentId, lock: v.count >= 3 });
        }
        if (v.count >= 3) {
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
          setWarningMessage(`Cảnh báo vi phạm lần ${v.count}/3: Em vừa rời khỏi giao diện làm bài hoặc thoát toàn màn hình! Nếu vi phạm đến lần thứ 3, hệ thống sẽ KHÓA BÀI THI và giám thị ghi nhận vi phạm!`);
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

    // Cấu hình thời gian làm bài từ Admin
    const examDur = serverStart ? serverStart.durationMinutes : (config.examDurationMinutes || 45);
    // Tải lại trang giữa giờ: đồng hồ tính tiếp từ giờ bắt đầu máy chủ ghi nhận
    const examRemainingMin = serverStart
      ? Math.max(1 / 60, examDur - (Date.now() - serverStart.startedAtMs) / 60000)
      : examDur;
    const practiceDur = config.practiceDurationMinutes || 0;

    // Nếu là chế độ Thi: Kích hoạt đồng hồ đếm ngược theo thời gian do Admin thiết lập
    if (mode === 'exam') {
      window.AsianSchoolTimer.start({
        durationMinutes: examRemainingMin,
        onTick: (sec, fmt) => {
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
          showDialog('Hết Giờ Làm Bài', `⏰ Đã hết thời gian làm bài ${examDur} phút! Hệ thống đang tự động thu bài của bạn.`, 'info', () => {
            handleSubmitExam(true);
          });
          handleSubmitExam(true);
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
        timeLeft: `${examDur}:00`
      });
    } else {
      // Chế độ Ôn tập đề cương: Vẫn cho phép giáo viên giám sát từ xa theo thời gian thực
      if (practiceDur > 0) {
        window.AsianSchoolTimer.start({
          durationMinutes: practiceDur,
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
            showDialog('Hết Giờ Ôn Tập', `⏰ Đã hết thời gian ôn tập ${practiceDur} phút! Hệ thống đang tự động nộp bài ôn tập của bạn.`, 'info', () => {
              handleSubmitPractice();
            });
            handleSubmitPractice();
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
        violations: 0,
        status: 'practicing',
        timeLeft: practiceDur > 0 ? `${practiceDur}:00` : 'Tự do'
      });
    }

    setExamState('in_progress');
  };

  return { handleStart };
}
