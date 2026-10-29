// Lệnh giám thị: gia hạn, khóa/mở khóa, thu bài, phát thông báo
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createProctorActions(s) {
  const { setShowBroadcastModal, broadcastTarget, broadcastMsgInput, setBroadcastMsgInput,
    showToast, showDialog } = s;

  // --- CÁC HÀNH ĐỘNG GIÁM THỊ (PROCTOR ACTIONS) ---

  // Bài thi chính thức: trạng thái khóa nằm trên exam_attempts (máy chủ), học sinh không tự mở được.
  // Ôn tập: chỉ khóa trên trình duyệt qua lệnh giám thị như trước.
  const setServerLock = async (sessionId, locked) => {
    const live = window.AsianSchoolStorage.getLiveSessions().find(x => x.sessionId === sessionId);
    if (!live || live.mode !== 'exam' || !live.studentId || !window.AsianSchoolCloud) return true;
    try {
      await window.AsianSchoolCloud.setAttemptLock({ grade: live.grade, studentId: live.studentId, locked });
      return true;
    } catch (e) {
      showDialog('Chưa Ghi Được Lên Máy Chủ', `Không cập nhật được trạng thái khóa của lượt thi: ${e.message}`, 'error');
      return false;
    }
  };

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
      async () => {
        await setServerLock(sessionId, true);
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
      async () => {
        if (!(await setServerLock(sessionId, false))) return;
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

  return { handleExtendTime, handleExtendTimeAll, handleForceSubmit, handleLockSession, handleUnlockSession, handleSendBroadcast };
}
