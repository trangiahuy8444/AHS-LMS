import { useEffect } from 'react';

// Lắng nghe lệnh giám thị thời gian thực: gia hạn giờ, thu bài, khóa/mở khóa, thông báo.
// Trả về hàm cho nút "VÀO LẠI TOÀN MÀN HÌNH" (sau khi giám thị mở khóa) và "Làm lại bài ôn tập".
export function useProctorCommands(s) {
  const { grade, mode, examState, setExamState, fullName, studentClass, studentId, sessionId,
    assignedCode, setActiveQuestionIdx, setPracticeAnswers, violations, setViolations,
    setBroadcastNotice, setScoreResult, showDialog, setIsSessionLocked, setIsProctorUnlocked,
    setLockReason, config, setPracticeSet, handleSubmitExam, setOfficialExam } = s;

  // Lắng nghe lệnh giám thị thời gian thực từ Admin (Gia hạn giờ, Thu bài, Thông báo)
  useEffect(() => {
    if (examState !== 'in_progress' || !sessionId) return;

    const checkCommands = () => {
      if (!window.AsianSchoolStorage) return;
      const pending = window.AsianSchoolStorage.getPendingProctorCommands(sessionId);
      pending.forEach(cmd => {
        if (cmd.command === 'extend_time') {
          const mins = cmd.payload?.minutes || 5;
          if (window.AsianSchoolTimer) {
            window.AsianSchoolTimer.extendSeconds(mins * 60);
          }
          setBroadcastNotice({
            type: 'success',
            title: 'Gia Hạn Thời Gian Làm Bài ⏱️',
            message: `Thầy Trần Gia Huy vừa cộng thêm ${mins} phút vào thời gian làm bài của em!`
          });
        } else if (cmd.command === 'force_submit') {
          showDialog('⏰ LỆNH THU BÀI TỪ GIÁM THỊ', 'Thầy/Cô giám thị đã kích hoạt lệnh thu bài thi của em ngay bây giờ!', 'warning');
          handleSubmitExam(true);
        } else if (cmd.command === 'broadcast_message') {
          setBroadcastNotice({
            type: 'info',
            title: 'Thông Báo Phòng Thi Từ Thầy Trần Gia Huy 📢',
            message: cmd.payload?.message || 'Các em chú ý thời gian làm bài!'
          });
        } else if (mode === 'exam' && (cmd.command === 'unlock_session' || cmd.command === 'lock_session')) {
          // Bài thi chính thức: khóa/mở khóa theo exam_attempts trên máy chủ (effect bên dưới), không tin lệnh trong trình duyệt
        } else if (cmd.command === 'unlock_session') {
          setIsProctorUnlocked(true);
          setBroadcastNotice({
            type: 'success',
            title: 'Giáo Viên Đã Xác Nhận Mở Khóa Bài Thi 🔓',
            message: 'Thầy Trần Gia Huy đã xác nhận mở khóa bài thi của em. Em hãy bấm nút "VÀO LẠI TOÀN MÀN HÌNH" trên màn hình để tiếp tục làm bài!'
          });
        } else if (cmd.command === 'lock_session') {
          setIsSessionLocked(true);
          setIsProctorUnlocked(false);
          setLockReason('proctor_lock');
        }
        window.AsianSchoolStorage.consumeProctorCommand(cmd.cmdId, sessionId);
      });
    };

    const interval = setInterval(checkCommands, 2500);
    checkCommands();
    return () => clearInterval(interval);
  }, [examState, sessionId]);

  // Bài thi chính thức: trạng thái khóa do máy chủ quyết định (exam_attempts.locked; chỉ giáo viên đặt lại false).
  // Chỉ mở khóa khi thấy máy chủ chuyển khóa -> mở, nên ghi lệnh giả vào localStorage hay tải lại trang không thoát được.
  useEffect(() => {
    if (mode !== 'exam' || examState !== 'in_progress' || !studentId) return;
    if (!window.AsianSchoolCloud || !window.AsianSchoolCloud.watchAttempt) return;
    let prevLocked;
    const unsub = window.AsianSchoolCloud.watchAttempt({ grade, studentId }, (a) => {
      const locked = a.locked === true;
      if (locked && prevLocked !== true) {
        setIsSessionLocked(true);
        setIsProctorUnlocked(false);
        setLockReason(r => r || a.lockReason || 'proctor_lock');
      } else if (!locked && prevLocked === true) {
        setIsProctorUnlocked(true);
        setBroadcastNotice({
          type: 'success',
          title: 'Giáo Viên Đã Xác Nhận Mở Khóa Bài Thi 🔓',
          message: 'Thầy Trần Gia Huy đã xác nhận mở khóa bài thi của em. Em hãy bấm nút "VÀO LẠI TOÀN MÀN HÌNH" trên màn hình để tiếp tục làm bài!'
        });
        // Vào lại khi đang bị khóa thì chưa có đề: tải đề sau khi được mở khóa (đã có đề thì giữ nguyên thứ tự câu)
        if (window.AsianSchoolCloud.loadExam && setOfficialExam) {
          window.AsianSchoolCloud.loadExam({ grade, examCode: a.examCode })
            .then(exam => setOfficialExam(prev => prev || exam))
            .catch(e => console.warn('Tải đề sau khi mở khóa thất bại:', e.message));
        }
      }
      prevLocked = locked;
    });
    return unsub;
  }, [mode, examState, grade, studentId]);

  const handleStudentResumeFromLock = async () => {
    setIsSessionLocked(false);
    setIsProctorUnlocked(false);
    setLockReason(null);
    setViolations(0);
    if (window.AsianSchoolAntiCheat) {
      window.AsianSchoolAntiCheat.resetViolations();
      await window.AsianSchoolAntiCheat.requestFullscreen().catch(() => {});
    }
    if (window.AsianSchoolStorage) {
      window.AsianSchoolStorage.updateLiveSession({
        sessionId,
        fullName,
        studentClass,
        studentId,
        grade,
        mode,
        examCode: assignedCode,
        // Không ghi violations: tổng số vi phạm giữ nguyên để giáo viên ghi nhận
        status: mode === 'exam' ? 'in_progress' : 'practicing',
        isLocked: false
      });
    }
  };

  const handleRestartPractice = () => {
    // Sinh một bộ câu hỏi ngẫu nhiên mới cho lần ôn tập kế tiếp
    const currentData = grade === 8 ? window.EXAM_DATA_G8 : (grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
    if (typeof window !== 'undefined' && window.AsianSchoolStorage && window.AsianSchoolStorage.generatePracticeSet) {
      setPracticeSet(window.AsianSchoolStorage.generatePracticeSet(grade, currentData, config));
    }
    setPracticeAnswers({ mcq: {}, tf: {}, essay: {} });
    setScoreResult(null);
    setViolations(0);
    setActiveQuestionIdx(0);
    setExamState('entry');
  };

  return { handleStudentResumeFromLock, handleRestartPractice };
}
