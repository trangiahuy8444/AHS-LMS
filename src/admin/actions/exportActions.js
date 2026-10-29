// Xuất CSV, sao lưu và hợp nhất dữ liệu
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createExportActions(s) {
  const { setLiveSessions, submissions, setSubmissions, setPracticeSubs, setHasDownloadedBackup, showToast,
    showDialog } = s;

  // --- XUẤT CSV & SAO LƯU ---

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      showDialog('Chưa Có Bài Nộp', 'Chưa có bài nộp nào trong hệ thống để xuất tệp CSV.', 'warning');
      return;
    }
    const csvContent = window.AsianSchoolStorage.exportSubmissionsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BangDiem_TinHoc_AsianSchool_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setHasDownloadedBackup(true);
    showToast('Đã tải xuống tệp bảng điểm CSV thành công!', 'success', 'Xuất File CSV');
  };

  const handleExportJSON = () => {
    const jsonContent = window.AsianSchoolStorage.exportSubmissionsJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AsianSchool_Submissions_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setHasDownloadedBackup(true);
    showToast('Đã tải xuống tệp sao lưu JSON thành công!', 'success', 'Sao Lưu JSON');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = window.AsianSchoolStorage.importSubmissionsJSON(event.target.result);
      if (res.success) {
        setSubmissions(window.AsianSchoolStorage.getSubmissions());
        showDialog('✅ Hợp Nhất Dữ Liệu Thành Công', `Đã thêm mới ${res.added} bài nộp vào hệ thống.\nTổng số bài hiện tại: ${res.count} bài.`, 'success');
      } else {
        showDialog('❌ Lỗi Khi Nhập Tệp', res.error, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllData = () => {
    showDialog(
      'CẢNH BÁO NGUY HIỂM: XÓA TRẮNG DỮ LIỆU',
      'Thầy có chắc chắn muốn XÓA TOÀN BỘ dữ liệu bài thi chính thức, kết quả ôn tập đề cương và phiên giám sát không? Hành động này sẽ xóa sạch dữ liệu trên máy tính này và KHÔNG THỂ HOÀN TÁC!',
      'error',
      () => {
        localStorage.removeItem('asian_school_submissions_v1');
        localStorage.removeItem('asian_school_live_sessions_v1');
        localStorage.removeItem('asian_school_practice_subs_v1');
        setSubmissions([]);
        setLiveSessions([]);
        if (setPracticeSubs) setPracticeSubs([]);
        if (window.AsianSchoolStorage) {
          window.AsianSchoolStorage.notify(window.AsianSchoolStorage.submissionListeners, []);
          window.AsianSchoolStorage.notify(window.AsianSchoolStorage.liveListeners, []);
          window.AsianSchoolStorage.notify(window.AsianSchoolStorage.practiceSubmissionListeners, []);
        }
        showToast('Đã xóa trắng toàn bộ dữ liệu bài làm và kết quả ôn tập trên máy.', 'warning', 'Xóa Dữ Liệu');
      }
    );
  };

  return { handleExportCSV, handleExportJSON, handleImportJSON, handleClearAllData };
}
