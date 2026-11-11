import { exportStudentSubmissionHtml } from '../../shared/exportSubmissionHtml.js';

// Xuất CSV, sao lưu và hợp nhất dữ liệu
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createExportActions(s) {
  const { setLiveSessions, submissions, setSubmissions, setPracticeSubs, setPracticeAttempts, setHasDownloadedBackup, showToast,
    showDialog } = s;

  // --- XUẤT CSV & SAO LƯU ---

  const handleExportStudentHtml = async (sub, options = {}) => {
    if (!sub) return;
    try {
      const res = await exportStudentSubmissionHtml(sub, options);
      if (res && showToast) {
        showToast(
          `Đã xuất file HTML bài làm của học sinh ${res.canonicalName} (${res.fileName})`,
          'success',
          'Xuất File HTML Chốt Điểm'
        );
      }
    } catch (err) {
      if (showDialog) {
        showDialog('Lỗi Xuất File HTML', err.message || 'Không thể xuất file HTML cho bài làm này.', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    const storage = window.AsianSchoolStorage;
    const practice = storage.getPracticeSubmissions?.() || s.practiceSubs || [];
    const attempts = storage.getPracticeAttempts?.();
    if (submissions.length === 0 && practice.length === 0 && (!Array.isArray(attempts) || attempts.length === 0)) {
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
    showToast('Đã tải xuống tệp bảng điểm CSV thành công!', 'success', 'Xuất File CSV');
  };

  const handleExportJSON = () => {
    let jsonContent;
    try {
      jsonContent = window.AsianSchoolStorage.exportSubmissionsJSON();
      const data = JSON.parse(jsonContent);
      const count = Array.isArray(data) ? data.length : ['submissions', 'practiceSubmissions', 'practiceAttempts'].reduce((sum, key) => sum + (Array.isArray(data?.[key]) ? data[key].length : 0), 0);
      if (!count) {
        showDialog('Chưa Có Bài Nộp', 'Chưa có dữ liệu bài thi hoặc ôn tập để sao lưu.', 'warning');
        return;
      }
    } catch (error) {
      showDialog('Chưa Sao Lưu Được', error.message || 'Không đọc được dữ liệu sao lưu.', 'error');
      return;
    }
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
        if (setPracticeSubs) setPracticeSubs(window.AsianSchoolStorage.getPracticeSubmissions());
        if (setPracticeAttempts && window.AsianSchoolStorage.getPracticeAttempts) setPracticeAttempts(window.AsianSchoolStorage.getPracticeAttempts());
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
      'Thầy có chắc chắn muốn XÓA TOÀN BỘ dữ liệu bài thi chính thức, kết quả ôn tập đề cương, các lượt thi đã dùng (exam_attempts) và phiên giám sát không? Hành động này sẽ xóa sạch toàn bộ dữ liệu trên cả máy tính này và Cloud Firestore (tất cả học sinh sẽ được làm lại bài từ đầu với 0 lượt đã dùng), KHÔNG THỂ HOÀN TÁC!',
      'error',
      async () => {
        try {
          if (window.AsianSchoolStorage && typeof window.AsianSchoolStorage.clearAllData === 'function') {
            await window.AsianSchoolStorage.clearAllData();
          } else {
            localStorage.removeItem('asian_school_submissions_v1');
            localStorage.removeItem('asian_school_live_sessions_v1');
            localStorage.removeItem('asian_school_practice_subs_v1');
            if (window.AsianSchoolStorage) {
              window.AsianSchoolStorage.notify(window.AsianSchoolStorage.submissionListeners, []);
              window.AsianSchoolStorage.notify(window.AsianSchoolStorage.liveListeners, []);
              window.AsianSchoolStorage.notify(window.AsianSchoolStorage.practiceSubmissionListeners, []);
            }
          }
          setSubmissions([]);
          setLiveSessions([]);
          if (setPracticeSubs) setPracticeSubs([]);
          if (setPracticeAttempts) setPracticeAttempts([]);
          showToast('Đã xóa trắng toàn bộ dữ liệu bài làm, lượt thi và giám sát trên máy và Cloud Firestore.', 'success', 'Xóa Dữ Liệu');
        } catch (err) {
          showDialog('Lỗi Xóa Dữ Liệu', err.message || 'Không thể xóa dữ liệu.', 'error');
        }
      }
    );
  };

  return { handleExportCSV, handleExportJSON, handleImportJSON, handleClearAllData, handleExportStudentHtml };
}
