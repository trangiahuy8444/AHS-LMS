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
    if (!live) {
      showDialog('Không Tìm Thấy Phiên', 'Không còn phiên làm bài này trên bảng giám sát (có thể học sinh đã tải lại trang). Thầy chọn lại thẻ mới nhất của học sinh.', 'warning');
      return false;
    }
    if (live.mode !== 'exam' || !live.studentId || !window.AsianSchoolCloud) return true;
    try {
      await window.AsianSchoolCloud.setAttemptLock({ grade: live.grade, studentId: live.studentId, locked });
      return true;
    } catch (e) {
      showDialog('Chưa Ghi Được Lên Máy Chủ', `Không cập nhật được trạng thái khóa của lượt thi: ${e.message}`, 'error');
      return false;
    }
  };

  const extendSessionTime = async (live, minutes) => {
    if (live.mode === 'exam') {
      if (!window.AsianSchoolCloud?.extendExamTime || !live.studentId) {
        throw new Error('Chưa kết nối được lượt thi trên máy chủ.');
      }
      // Lượt chính thức chỉ nhận giờ qua snapshot máy chủ, không phát thêm lệnh cộng giờ.
      return window.AsianSchoolCloud.extendExamTime({ grade: live.grade, studentId: live.studentId, minutes });
    }
    window.AsianSchoolStorage.sendProctorCommand(live.sessionId, 'extend_time', { minutes });
    return { applied: true };
  };

  const handleExtendTime = (sessionId, studentName, minutes = 5) => {
    showDialog(
      'Gia Hạn Thời Gian Làm Bài ⏱️',
      `Xác nhận GIA HẠN THÊM ${minutes} PHÚT làm bài cho học sinh ${studentName}?`,
      'info',
      async () => {
        const live = window.AsianSchoolStorage.getLiveSessions().find(x => x.sessionId === sessionId);
        if (!live) {
          showDialog('Không Tìm Thấy Phiên', 'Thầy chọn lại phiên làm bài mới nhất trên bảng giám sát.', 'warning');
          return;
        }
        try {
          const result = await extendSessionTime(live, minutes);
          if (!result.applied) {
            showDialog('Không Gia Hạn Lượt Đã Nộp', 'Lượt thi này đã nộp bài trên máy chủ nên không được cộng thêm giờ.', 'warning');
            return;
          }
          showToast(`Đã gia hạn thêm ${minutes} phút cho ${studentName}!`, 'success', 'Gia Hạn Thành Công ⏱️');
        } catch (e) {
          showDialog('Chưa Gia Hạn Được', `Không cập nhật được giờ làm bài: ${e.message}`, 'error');
        }
      }
    );
  };

  const handleExtendTimeAll = (minutes = 5) => {
    showDialog(
      'Gia Hạn Toàn Bộ Phòng Thi ⏱️',
      `Xác nhận GIA HẠN THÊM ${minutes} PHÚT làm bài cho TOÀN BỘ PHÒNG THI ĐANG ONLINE?`,
      'warning',
      async () => {
        const targets = new Map();
        let skipped = 0;
        window.AsianSchoolStorage.getLiveSessions().forEach(live => {
          if (live.status === 'submitted') { skipped++; return; }
          const normalize = window.AsianSchoolNormalize?.normalizeLmsCode;
          const id = normalize ? normalize(live.studentId) : String(live.studentId || '').normalize('NFKC').replace(/\D/g, '');
          const key = live.mode === 'exam' ? `exam:${Number(live.grade)}:${id}` : `practice:${live.sessionId}`;
          if (!targets.has(key)) targets.set(key, live);
        });
        let applied = 0;
        const failures = [];
        for (const live of targets.values()) {
          try {
            const result = await extendSessionTime(live, minutes);
            if (result.applied) applied++;
            else skipped++;
          } catch (e) {
            failures.push(`Khối ${live.grade} / LMS ${live.studentId || '?'}: ${e.message}`);
          }
        }
        if (failures.length) {
          showDialog('Gia Hạn Chưa Hoàn Tất',
            `Đã gia hạn ${applied} lượt/phiên; bỏ qua ${skipped} phiên đã nộp.\nKhông cập nhật được ${failures.length} lượt:\n${failures.join('\n')}`, 'warning');
        } else if (applied) {
          showToast(`Đã gia hạn thêm ${minutes} phút cho ${applied} lượt/phiên; bỏ qua ${skipped} phiên đã nộp.`, 'success', 'Gia Hạn Toàn Phòng ⏱️');
        } else {
          showDialog('Không Có Lượt Cần Gia Hạn', 'Không tìm thấy phiên đang làm bài để cộng giờ.', 'info');
        }
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
        if (!(await setServerLock(sessionId, true))) return;
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
        const live = window.AsianSchoolStorage.getLiveSessions().find(x => x.sessionId === sessionId);
        const studentId = live ? live.studentId : null;
        const grade = live ? live.grade : null;
        const mode = live ? live.mode : null;

        if (!(await setServerLock(sessionId, false))) return;

        // Gửi lệnh mở khóa trực tiếp qua proctor commands (cả sessionId và studentId để bao phủ khi tải lại trang)
        window.AsianSchoolStorage.sendProctorCommand(sessionId, 'unlock_session', { sessionId, studentId, grade });
        if (studentId) {
          window.AsianSchoolStorage.sendProctorCommand('all', 'unlock_session', { sessionId, studentId, grade });
        }

        // Cập nhật live_sessions để mở khóa trên giao diện và đặt lại số vi phạm dưới ngưỡng khóa
        window.AsianSchoolStorage.updateLiveSession({
          sessionId,
          status: mode === 'practice' ? 'practicing' : 'in_progress',
          isLocked: false,
          violations: Math.min(live?.violations || 0, 2)
        });

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
