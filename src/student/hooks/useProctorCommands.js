import { useEffect, useRef } from 'react';
import { clearPracticeLock } from '../actions/startActions.js';

// Lắng nghe lệnh giám thị thời gian thực: gia hạn giờ, thu bài, khóa/mở khóa, thông báo.
// Trả về hàm cho nút "VÀO LẠI TOÀN MÀN HÌNH" (sau khi giám thị mở khóa) và "Làm lại bài ôn tập".
export function useProctorCommands(s) {
  const { grade, mode, examState, setExamState, fullName, studentClass, studentId, sessionId,
    assignedCode, setActiveQuestionIdx, setPracticeAnswers, violations, setViolations,
    setBroadcastNotice, setScoreResult, showDialog, setIsSessionLocked, setIsProctorUnlocked,
    setLockReason, config, setPracticeSet, setOfficialExam, isSessionLocked, setTotalViolations } = s;

  // Lệnh giám thị chạy trong setInterval: luôn gọi hàm của lần render mới nhất (bài làm mới nhất khi thu bài)
  const latest = useRef(s);
  latest.current = s;

  // Lắng nghe lệnh giám thị thời gian thực từ Admin (Gia hạn giờ, Thu bài, Thông báo)
  useEffect(() => {
    if (examState !== 'in_progress' || !sessionId) return;
    // Bỏ qua lệnh gửi trước khi mở phiên này (vd. "+5 phút cả phòng" cũ không cộng lại sau khi tải lại trang)
    const openedAt = Date.now() - 30 * 1000;

    const checkCommands = () => {
      if (!window.AsianSchoolStorage) return;
      const pending = window.AsianSchoolStorage.getPendingProctorCommands(sessionId);
      pending.forEach(cmd => {
        if ((cmd.createdAt || 0) < openedAt) {
          window.AsianSchoolStorage.consumeProctorCommand(cmd.cmdId, sessionId);
          return;
        }
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
          showDialog('⏰ LỆNH THU BÀI TỪ GIÁM THỊ', 'Thầy/Cô giám thị đã kích hoạt lệnh thu bài của em ngay bây giờ!', 'warning');
          if (latest.current.mode === 'practice') latest.current.handleSubmitPractice(true);
          else latest.current.handleSubmitExam(true);
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
          if (window.AsianSchoolAntiCheat) {
            if (window.AsianSchoolAntiCheat.setLocked) window.AsianSchoolAntiCheat.setLocked(true);
            window.AsianSchoolAntiCheat.resetViolations();
          }
          // Màn hình khóa tự chuyển sang "đã duyệt mở khóa" kèm nút vào lại (không mở thêm hộp thông báo đè lên nút)
        } else if (cmd.command === 'lock_session') {
          setIsSessionLocked(true);
          setIsProctorUnlocked(false);
          setLockReason('proctor_lock');
          if (window.AsianSchoolAntiCheat && window.AsianSchoolAntiCheat.setLocked) {
            window.AsianSchoolAntiCheat.setLocked(true);
          }
        }
        window.AsianSchoolStorage.consumeProctorCommand(cmd.cmdId, sessionId);
      });
    };

    const interval = setInterval(checkCommands, 2000);
    checkCommands();
    return () => clearInterval(interval);
  }, [examState, sessionId]);

  // Kênh dự phòng: Lắng nghe trạng thái live_sessions trực tiếp (từ Firestore và LocalStorage)
  // Khi giáo viên bấm Xác Nhận Mở Khóa trên bảng điều khiển proctor, học sinh nhận được ngay lập tức
  useEffect(() => {
    if (examState !== 'in_progress' || !sessionId) return;

    // 1. Lắng nghe qua AsianSchoolStorage listener
    let unsubStorage = null;
    if (window.AsianSchoolStorage && window.AsianSchoolStorage.onLiveSessionsChange) {
      unsubStorage = window.AsianSchoolStorage.onLiveSessionsChange((sessions) => {
        const my = (sessions || []).find(s => s.sessionId === sessionId);
        if (my && my.isLocked === false && latest.current.isSessionLocked) {
          setIsProctorUnlocked(true);
          if (window.AsianSchoolAntiCheat) {
            if (window.AsianSchoolAntiCheat.setLocked) window.AsianSchoolAntiCheat.setLocked(true);
            window.AsianSchoolAntiCheat.resetViolations();
          }
        }
      });
    }

    // 2. Lắng nghe qua Firestore document live_sessions/{sessionId}
    let unsubFirestore = null;
    if (typeof window !== 'undefined' && window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
      try {
        unsubFirestore = window.firebaseDb.collection('live_sessions').doc(sessionId).onSnapshot((doc) => {
          if (!doc || !doc.exists) return;
          const data = doc.data();
          if (data && data.isLocked === false && latest.current.isSessionLocked) {
            setIsProctorUnlocked(true);
            if (window.AsianSchoolAntiCheat) {
              if (window.AsianSchoolAntiCheat.setLocked) window.AsianSchoolAntiCheat.setLocked(true);
              window.AsianSchoolAntiCheat.resetViolations();
            }
          }
        }, (err) => {
          console.warn('[useProctorCommands] live_session snapshot error:', err.message);
        });
      } catch (e) { /* ignore */ }
    }

    return () => {
      if (unsubStorage) unsubStorage();
      if (unsubFirestore) unsubFirestore();
    };
  }, [examState, sessionId]);

  // Bài thi chính thức: trạng thái khóa do máy chủ quyết định (exam_attempts.locked; chỉ giáo viên đặt lại false).
  // Chỉ mở khóa khi thấy máy chủ chuyển khóa -> mở, nên ghi lệnh giả vào localStorage hay tải lại trang không thoát được.
  useEffect(() => {
    if (mode !== 'exam' || examState !== 'in_progress' || !studentId) return;
    if (!window.AsianSchoolCloud || !window.AsianSchoolCloud.watchAttempt) return;
    // Vào lại khi đang bị khóa: coi như đã thấy khóa, để nếu giáo viên mở khóa trước khi bắt đầu theo dõi
    // thì lần đọc đầu (locked = false) vẫn được tính là chuyển khóa -> mở
    let prevLocked = isSessionLocked ? true : undefined;
    const unsub = window.AsianSchoolCloud.watchAttempt({ grade, studentId }, (a, meta = { fromServer: true }) => {
      const locked = a.locked === true;
      // Chỉ tin trạng thái MỞ khi máy chủ đã xác nhận (không mở khóa dựa trên dữ liệu ghi tạm hay cache)
      if (!locked && !meta.fromServer) return;
      if (locked && prevLocked !== true) {
        setIsSessionLocked(true);
        setIsProctorUnlocked(false);
        setLockReason(r => r || a.lockReason || 'proctor_lock');
      } else if (!locked && prevLocked === true) {
        setIsProctorUnlocked(true);
        // Màn hình khóa tự chuyển sang "đã duyệt mở khóa" kèm nút vào lại (không mở thêm hộp thông báo đè lên nút)
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
    if (mode === 'practice') clearPracticeLock();
    setIsSessionLocked(false);
    setIsProctorUnlocked(false);
    setLockReason(null);
    setViolations(0);
    if (window.AsianSchoolAntiCheat) {
      window.AsianSchoolAntiCheat.resetViolations();
      await window.AsianSchoolAntiCheat.requestFullscreen().catch(() => {});
      // Trì hoãn bật lại giám sát chống gian lận để trình duyệt hoàn tất chuyển đổi toàn màn hình
      setTimeout(() => {
        if (window.AsianSchoolAntiCheat && window.AsianSchoolAntiCheat.setLocked) {
          window.AsianSchoolAntiCheat.setLocked(false);
        }
      }, 600);
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
    // Xóa khóa ôn tập cũ nếu có để lượt mới hoàn toàn sạch sẽ
    if (mode === 'practice') clearPracticeLock();
    if (setScoreResult) setScoreResult(null);

    // Kích hoạt lại lượt ôn tập mới đầy đủ: sinh bộ câu hỏi mới, hẹn giờ, bật chống gian lận và vào bài làm
    if (fullName && studentId && s.handleStart) {
      try {
        s.handleStart();
      } catch (err) {
        console.error('Lỗi khởi động lượt ôn tập mới:', err);
        setExamState('entry');
      }
    } else {
      setExamState('entry');
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { handleStudentResumeFromLock, handleRestartPractice };
}
