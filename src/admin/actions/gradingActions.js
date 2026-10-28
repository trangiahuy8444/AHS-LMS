// Chấm điểm tự luận
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createGradingActions(s) {
  const { setSubmissions, gradingSubmission, setGradingSubmission, tempEssayScores,
    setTempEssayScores, tempFeedback, setTempFeedback, setGradingSuccessAlert, showDialog } = s;

  // --- CHẤM ĐIỂM TỰ LUẬN ---

  const openGradingModal = (sub) => {
    setGradingSubmission(sub);
    setTempEssayScores(sub.essayScores || {});
    setTempFeedback(sub.teacherFeedback || '');
    setGradingSuccessAlert(false);
  };

  const handleSaveGrading = () => {
    if (!gradingSubmission) return;
    const res = window.AsianSchoolStorage.gradeEssaySubmission(gradingSubmission.id, tempEssayScores, tempFeedback);
    if (res.success) {
      setGradingSubmission(res.submission);
      setSubmissions(window.AsianSchoolStorage.getSubmissions());
      setGradingSuccessAlert(true);
      setTimeout(() => setGradingSuccessAlert(false), 2500);
    } else {
      showDialog('Lỗi Chấm Điểm', res.error, 'error');
    }
  };

  return { openGradingModal, handleSaveGrading };
}
