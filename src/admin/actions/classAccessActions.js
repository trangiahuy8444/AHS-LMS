// Điều phối ca thi theo từng lớp
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createClassAccessActions(s) {
  const { setLiveSessions, setSubmissions, setPracticeSubs, setConfig, showToast, showDialog } = s;

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
    const displayName = (studentName && studentName !== 'undefined') ? studentName : (examCode || 'học sinh');
    showDialog(
      'Xác Nhận Xóa Bài Nộp 🗑️',
      `CẢNH BÁO: Thầy có chắc chắn muốn XÓA bài nộp của ${displayName} (${examCode || 'Bài thi'}) không? Dữ liệu này sẽ bị xóa khỏi hệ thống.`,
      'error',
      () => {
        const res = window.AsianSchoolStorage.deleteSubmission(subId);
        if (res.success) {
          setSubmissions(window.AsianSchoolStorage.getSubmissions());
          showToast(`Đã xóa bài nộp của ${displayName}!`, 'success', 'Xóa Bài Nộp');
        } else {
          showDialog('Lỗi Xóa Bài Nộp', res.error, 'error');
        }
      }
    );
  };

  const handleClearPracticeClass = (cls) => {
    showDialog(
      `Xóa Bảng Điểm Ôn Tập Lớp ${cls} 🗑️`,
      `Thầy có chắc chắn muốn XÓA TOÀN BỘ kết quả ôn tập đề cương của Lớp ${cls} không?\n\n(Hành động này giúp làm sạch bảng điểm cho đợt ôn tập mới của lớp, không ảnh hưởng đến các lớp khác).`,
      'warning',
      () => {
        if (window.AsianSchoolStorage && window.AsianSchoolStorage.clearPracticeSubmissionsByClass) {
          window.AsianSchoolStorage.clearPracticeSubmissionsByClass(cls);
          if (setPracticeSubs) setPracticeSubs(window.AsianSchoolStorage.getPracticeSubmissions());
          showToast(`Đã xóa toàn bộ kết quả ôn tập của Lớp ${cls}!`, 'success', `Lớp ${cls}`);
        }
      }
    );
  };

  const handleDeletePracticeSubmission = (subId, studentName) => {
    const displayName = (studentName && studentName !== 'undefined') ? studentName : 'lượt ôn tập này';
    showDialog(
      'Xác Nhận Xóa Lượt Ôn Tập 🗑️',
      `Thầy có chắc chắn muốn xóa lượt nộp ôn tập của ${displayName} không?`,
      'error',
      () => {
        if (window.AsianSchoolStorage && window.AsianSchoolStorage.deletePracticeSubmission) {
          window.AsianSchoolStorage.deletePracticeSubmission(subId);
          if (setPracticeSubs) setPracticeSubs(window.AsianSchoolStorage.getPracticeSubmissions());
          showToast(`Đã xóa lượt ôn tập của ${displayName}!`, 'success', 'Xóa Lượt Ôn Tập');
        }
      }
    );
  };

  return {
    handleSetClassMode,
    handleQuickStartExam,
    handleCloseAllExams,
    handleRemoveCandidate,
    handleClearClassSessions,
    handleCleanStaleSessions,
    handleDeleteSubmission,
    handleClearPracticeClass,
    handleDeletePracticeSubmission
  };
}
