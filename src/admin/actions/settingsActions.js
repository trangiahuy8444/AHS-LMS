// Cấu hình thời gian, trộn đề, Google Drive và vòng đời dữ liệu
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createSettingsActions(s) {
  const { setSubmissions, setConfig, setConfigSavedNotice, examPeriod, examDurationMinutes,
    practiceDurationMinutes, shuffleQuestions, shuffleOptions, requireAllQuestionsAnswered,
    lockOnExamViolation, lockOnPracticeViolation, preventEarlySubmission, minExamMinutes,
    allowStudentReviewOfficialExam, reminderDurationSeconds,
    googleDriveUrl, googleDriveToken, setIsSyncingDrive, setDriveSyncNotice, setIsTestingDrive,
    setDriveTestMessage, setHasDownloadedBackup, showDialog } = s;

  // --- CẤU HÌNH THỜI GIAN & TRỘN ĐỀ THI HANDLER ---

  const handleSaveExamConfig = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const updated = window.AsianSchoolStorage.saveConfig({
      examPeriod: examPeriod || 'midterm',
      examDurationMinutes: parseInt(examDurationMinutes, 10) || 45,
      practiceDurationMinutes: parseInt(practiceDurationMinutes, 10) || 0,
      shuffleQuestions: !!shuffleQuestions,
      shuffleOptions: !!shuffleOptions,
      requireAllQuestionsAnswered: !!requireAllQuestionsAnswered,
      lockOnExamViolation: lockOnExamViolation !== false,
      lockOnPracticeViolation: !!lockOnPracticeViolation,
      preventEarlySubmission: preventEarlySubmission !== false,
      minExamMinutes: parseInt(minExamMinutes, 10) || 15,
      allowStudentReviewOfficialExam: !!allowStudentReviewOfficialExam,
      reminderDurationSeconds: parseInt(reminderDurationSeconds, 10) || 5
    });
    setConfig(updated);
    setConfigSavedNotice('Đã lưu cấu hình thời gian, quy chế và chế độ trộn đề thành công!');
    setTimeout(() => setConfigSavedNotice(''), 3000);
  };

  // --- GOOGLE DRIVE & VÒNG ĐỜI KỲ THI HANDLERS ---

  const handleSaveGoogleDriveUrl = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    window.AsianSchoolStorage.saveConfig({
      googleDriveWebhookUrl: googleDriveUrl.trim(),
      googleDriveWebhookToken: googleDriveToken.trim()
    });
    setConfig(window.AsianSchoolStorage.getConfig());
    setConfigSavedNotice('Đã lưu cấu hình Google Drive Webhook thành công!');
    setTimeout(() => setConfigSavedNotice(''), 3000);
  };

  const handleTestGoogleDrive = async () => {
    if (!googleDriveUrl.trim()) {
      showDialog('Thiếu URL Webhook', 'Vui lòng dán URL Webhook Google Drive trước khi bấm kiểm tra!', 'warning');
      return;
    }
    setIsTestingDrive(true);
    setDriveTestMessage({ success: null, text: 'Đang gửi gói tin kiểm tra tới Webhook...' });
    const res = await window.AsianSchoolStorage.testGoogleDriveConnection(googleDriveUrl.trim(), googleDriveToken.trim());
    setIsTestingDrive(false);
    if (res.success) {
      setDriveTestMessage({
        success: true,
        text: res.message || 'Đã kết nối thành công! Vui lòng mở Google Sheets để kiểm tra dòng dữ liệu mẫu vừa được thêm.'
      });
    } else {
      setDriveTestMessage({
        success: false,
        text: res.error || 'Lỗi kết nối Webhook! Hãy kiểm tra lại xem bản triển khai Web App đã chọn "Anyone" chưa.'
      });
    }
    setTimeout(() => setDriveTestMessage(null), 12000);
  };

  const handleSyncAllGoogleDrive = async () => {
    if (!googleDriveUrl.trim()) {
      showDialog('Thiếu URL Webhook', 'Vui lòng nhập URL Webhook Google Drive trước khi thực hiện đồng bộ!', 'warning');
      return;
    }
    setIsSyncingDrive(true);
    setDriveSyncNotice('Đang kết nối và sao lưu toàn bộ dữ liệu kỳ thi lên Google Drive...');
    const res = await window.AsianSchoolStorage.syncAllToGoogleDrive();
    setIsSyncingDrive(false);
    if (res.success) {
      setDriveSyncNotice(`✅ ĐÃ SAO LƯU THÀNH CÔNG ${res.count} BÀI THI LÊN GOOGLE DRIVE!`);
      setHasDownloadedBackup(true);
    } else {
      setDriveSyncNotice(`⚠️ Lỗi đồng bộ: ${res.error}`);
    }
    setTimeout(() => setDriveSyncNotice(''), 6000);
  };

  const handlePurgeExamData = () => {
    // 1. Tự động tải sao lưu CSV & JSON trước khi thực hiện bất kỳ thao tác nào
    if (s.handleExportCSV) s.handleExportCSV();
    if (s.handleExportJSON) s.handleExportJSON();
    setHasDownloadedBackup(true);

    const confirmationInput = typeof window !== 'undefined' && window.prompt
      ? window.prompt(
          '⚠️ CẢNH BÁO BẢO TOÀN DỮ LIỆU BÀI THI!\n\nHệ thống đã tự động tải 2 tệp sao lưu (CSV + JSON) về máy tính của Thầy.\nDữ liệu bài thi chính thức chỉ được xóa khi Thầy chủ động xác nhận.\n\nĐể xác nhận xóa toàn bộ bài thi, vui lòng gõ chính xác cụm từ:\nXAC NHAN XOA'
        )
      : 'XAC NHAN XOA';

    if (confirmationInput !== 'XAC NHAN XOA') {
      showDialog(
        'Đã Hủy Thao Tác 🛑',
        'Từ khóa xác nhận không chính xác. Dữ liệu bài thi của học sinh được bảo toàn vĩnh viễn và không bị xóa.',
        'info'
      );
      return;
    }

    const res = window.AsianSchoolStorage.purgeOldExamSubmissions({ purgeAll: true });
    setSubmissions(window.AsianSchoolStorage.getSubmissions());
    showDialog('✅ Đã Dọn Dẹp Kỳ Thi Thành Công', `Đã xóa an toàn ${res.deletedCount} bài thi cũ sau khi sao lưu đầy đủ.\nHệ thống đã sẵn sàng cho đợt thi mới!`, 'success');
  };

  return { handleSaveExamConfig, handleSaveGoogleDriveUrl, handleTestGoogleDrive, handleSyncAllGoogleDrive, handlePurgeExamData };
}
