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

  // --- MỞ/KHÓA XEM LẠI BÀI THI & CHỐT ĐIỂM THEO LỚP ---

  const handleSetClassReviewMode = (cls, isAllowed) => {
    if (window.AsianSchoolStorage && window.AsianSchoolStorage.setClassReviewMode) {
      window.AsianSchoolStorage.setClassReviewMode(cls, isAllowed);
      setConfig(window.AsianSchoolStorage.getConfig());
      showToast(
        isAllowed
          ? `Đã MỞ quyền xem bài & chốt điểm cho học sinh Lớp ${cls}!`
          : `Đã KHÓA quyền xem bài của Lớp ${cls}.`,
        'success',
        isAllowed ? `Lớp ${cls} 🔓` : `Lớp ${cls} 🔒`
      );
    }
  };

  const handleSetGradeReviewMode = (grade, isAllowed, classesList) => {
    const list = classesList || (s.ALL_CLASSES_BY_GRADE && s.ALL_CLASSES_BY_GRADE[grade]) || [];
    if (window.AsianSchoolStorage && window.AsianSchoolStorage.setGradeReviewMode) {
      window.AsianSchoolStorage.setGradeReviewMode(grade, isAllowed, list);
      setConfig(window.AsianSchoolStorage.getConfig());
      showToast(
        isAllowed
          ? `Đã MỞ chốt điểm cho toàn bộ ${list.length} lớp Khối ${grade}!`
          : `Đã KHÓA chốt điểm cho Khối ${grade}.`,
        'success',
        `Khối ${grade}`
      );
    }
  };

  const handleSetAllClassReviewMode = (isAllowed, classesList) => {
    const list = classesList || Object.values(s.ALL_CLASSES_BY_GRADE || {}).flat();
    if (window.AsianSchoolStorage && window.AsianSchoolStorage.setAllClassesReviewMode) {
      window.AsianSchoolStorage.setAllClassesReviewMode(isAllowed, list);
      setConfig(window.AsianSchoolStorage.getConfig());
      showToast(
        isAllowed
          ? 'Đã MỞ chức năng xem bài & chốt điểm cho TOÀN BỘ CÁC LỚP!'
          : 'Đã KHÓA chức năng xem bài & chốt điểm cho toàn bộ các lớp.',
        'success',
        isAllowed ? 'Mở Chốt Điểm Toàn Trường 🔓' : 'Khóa Chốt Điểm Toàn Trường 🔒'
      );
    }
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
      'Xác Nhận Xóa Bài Nộp & Mở Lại Lượt Thi 🗑️',
      `CẢNH BÁO: Thầy có chắc chắn muốn XÓA bài nộp của ${displayName} (${examCode || 'Bài thi'}) không?\n\n• Bài nộp sẽ bị xóa khỏi danh sách.\n• Lượt thi đã dùng (exam_attempts) của học sinh sẽ được xóa sạch trên máy chủ (học sinh có thể đăng nhập làm lại bài mới).`,
      'error',
      async () => {
        try {
          const res = await window.AsianSchoolStorage.deleteSubmission(subId);
          if (res.success) {
            setSubmissions(window.AsianSchoolStorage.getSubmissions());
            if (setPracticeSubs && typeof window.AsianSchoolStorage.getPracticeSubmissions === 'function') {
              setPracticeSubs(window.AsianSchoolStorage.getPracticeSubmissions());
            }
            showToast(`Đã xóa bài nộp và mở lại lượt thi cho ${displayName}!`, 'success', 'Xóa Bài Nộp');
          } else {
            showDialog('Lỗi Xóa Bài Nộp', res.error, 'error');
          }
        } catch (err) {
          showDialog('Lỗi Xóa Bài Nộp', err.message || 'Đã xảy ra lỗi khi xóa bài nộp.', 'error');
        }
      }
    );
  };

  const handleResetStudentAttempt = (studentId, grade, studentClass, studentName) => {
    const displayName = studentName || studentId || 'học sinh';
    showDialog(
      'Reset Lượt Thi Cho Học Sinh 🔄',
      `Thầy có muốn RESET lượt thi cho học sinh ${displayName} (Lớp ${studentClass || ''} - Mã LMS: ${studentId}) không?\n\nSau khi reset, học sinh có thể đăng nhập vào phòng thi và làm bài lại từ đầu (0 lượt đã dùng).`,
      'warning',
      async () => {
        try {
          if (window.AsianSchoolStorage && window.AsianSchoolStorage.resetExamAttempt) {
            const res = await window.AsianSchoolStorage.resetExamAttempt({ grade, studentClass, studentId });
            if (res.success) {
              showToast(`Đã reset lượt thi cho ${displayName} (Mã LMS: ${studentId}) thành công!`, 'success', 'Reset Lượt Thi');
            } else {
              showDialog('Lỗi Reset Lượt Thi', res.error || 'Không thể reset lượt thi.', 'error');
            }
          }
        } catch (err) {
          showDialog('Lỗi Reset Lượt Thi', err.message || 'Đã xảy ra lỗi khi reset lượt thi.', 'error');
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
    handleResetStudentAttempt,
    handleClearPracticeClass,
    handleDeletePracticeSubmission,
    handleSetClassReviewMode,
    handleSetGradeReviewMode,
    handleSetAllClassReviewMode
  };
}
