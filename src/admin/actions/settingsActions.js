// Cấu hình thời gian, trộn đề, Google Drive và vòng đời dữ liệu
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createSettingsActions(s) {
  const { setSubmissions, setConfig, setConfigSavedNotice, examDurationMinutes,
    practiceDurationMinutes, shuffleQuestions, shuffleOptions, requireAllQuestionsAnswered,
    lockOnExamViolation, lockOnPracticeViolation,
    googleDriveUrl, googleDriveToken, setIsSyncingDrive, setDriveSyncNotice, setIsTestingDrive,
    setDriveTestMessage, setHasDownloadedBackup, showDialog } = s;

  // --- CẤU HÌNH THỜI GIAN & TRỘN ĐỀ THI HANDLER ---

  const handleSaveExamConfig = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const updated = window.AsianSchoolStorage.saveConfig({
      examDurationMinutes: parseInt(examDurationMinutes, 10) || 45,
      practiceDurationMinutes: parseInt(practiceDurationMinutes, 10) || 0,
      shuffleQuestions: !!shuffleQuestions,
      shuffleOptions: !!shuffleOptions,
      requireAllQuestionsAnswered: !!requireAllQuestionsAnswered,
      lockOnExamViolation: lockOnExamViolation !== false,
      lockOnPracticeViolation: !!lockOnPracticeViolation
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
    showDialog(
      'Xác Nhận Dọn Dẹp Kỳ Thi Cũ 🗑️',
      'Hành động này sẽ dọn dẹp các bài thi cũ sau 2-3 tuần để chuẩn bị cho đợt thi mới.\n\nKhuyến nghị: Thầy đã tải bản sao lưu (CSV/JSON) hoặc đồng bộ lên Google Drive trước khi dọn dẹp.\n\nThầy có chắc chắn muốn dọn dẹp dữ liệu cũ ngay bây giờ không?',
      'warning',
      () => {
        const res = window.AsianSchoolStorage.purgeOldExamSubmissions({ purgeAll: true });
        setSubmissions(window.AsianSchoolStorage.getSubmissions());
        showDialog('✅ Đã Dọn Dẹp Kỳ Thi Thành Công', `Đã xóa an toàn ${res.deletedCount} bài thi cũ.\nHệ thống đã sẵn sàng cho đợt thi mới!`, 'success');
      }
    );
  };

  return { handleSaveExamConfig, handleSaveGoogleDriveUrl, handleTestGoogleDrive, handleSyncAllGoogleDrive, handlePurgeExamData };
}
