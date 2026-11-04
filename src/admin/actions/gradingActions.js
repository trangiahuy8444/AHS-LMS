import {
  getGeminiApiKey,
  getEssayQuestionsForSubmission,
  gradeSubmissionWithGemini
} from '../../core/gemini-grading-service.js';

// Chấm điểm tự luận
// s: state của Cổng Quản Trị (xem hooks/useAdminController.js)
export function createGradingActions(s) {
  const {
    setSubmissions,
    gradingSubmission,
    setGradingSubmission,
    tempEssayScores,
    setTempEssayScores,
    tempFeedback,
    setTempFeedback,
    setGradingSuccessAlert,
    showDialog,
    showToast,
    setAiSuggestions,
    geminiApiKey,
    geminiModel,
    batchGradingState,
    setBatchGradingState,
    cancelBatchGradingRef
  } = s;

  // --- CHẤM ĐIỂM TỰ LUẬN TỪNG BÀI ---

  const openGradingModal = (sub) => {
    setGradingSubmission(sub);
    setTempEssayScores(sub.essayScores || {});
    setTempFeedback(sub.teacherFeedback || '');
    if (setAiSuggestions) setAiSuggestions({});
    setGradingSuccessAlert(false);
  };

  const handleSaveGrading = () => {
    if (!gradingSubmission) return;
    const res = window.AsianSchoolStorage.gradeEssaySubmission(gradingSubmission.id, tempEssayScores, tempFeedback);
    if (res.success) {
      setGradingSubmission(res.submission);
      setSubmissions(window.AsianSchoolStorage.getSubmissions());
      if (setPracticeSubs && typeof window.AsianSchoolStorage.getPracticeSubmissions === 'function') {
        setPracticeSubs(window.AsianSchoolStorage.getPracticeSubmissions());
      }
      setGradingSuccessAlert(true);
      setTimeout(() => setGradingSuccessAlert(false), 2500);
    } else {
      showDialog('Lỗi Chấm Điểm', res.error, 'error');
    }
  };

  // --- CHẤM NHANH CẢ LỚP BẰNG GEMINI AI ---

  const handleStartBatchGrading = async (targetClass, onlyPending = true) => {
    if (!targetClass || targetClass === 'all') {
      showDialog(
        'Chọn Lớp Cụ Thể 📋',
        'Thầy vui lòng chọn một lớp cụ thể trong bộ lọc Lớp Học (ví dụ: Lớp 8/19, 8/20...) trước khi thực hiện chấm nhanh cả lớp nhé!',
        'warning'
      );
      return;
    }

    const key = (geminiApiKey || getGeminiApiKey() || (typeof window !== 'undefined' && window.localStorage?.getItem('ahs_gemini_api_key')) || '').trim();
    if (!key) {
      showDialog(
        'Chưa Cấu Hình Gemini API Key 🔑',
        'Thầy vui lòng mở Tab "Cấu Hình & Bảo Mật" -> mục "TRỢ LÝ CHẤM BÀI TỰ LUẬN GEMINI AI" để nhập mã khóa API trước khi chấm nhé!',
        'warning'
      );
      return;
    }

    const allSubs = window.AsianSchoolStorage.getSubmissions() || [];
    const classSubs = allSubs.filter(sub => String(sub.studentClass || '').trim() === String(targetClass || '').trim() && sub.mode === 'exam');
    const candidates = onlyPending ? classSubs.filter(sub => !sub.isGraded) : classSubs;

    if (candidates.length === 0) {
      showDialog(
        `Lớp ${targetClass} Đã Hoàn Tất ✓`,
        onlyPending
          ? `Tất cả bài thi của Lớp ${targetClass} đều đã được chấm tự luận xong. Không có bài nộp nào đang chờ chấm!`
          : `Không tìm thấy bài nộp nào của Lớp ${targetClass}!`,
        'info'
      );
      return;
    }

    if (cancelBatchGradingRef) cancelBatchGradingRef.current = false;

    if (setBatchGradingState) {
      setBatchGradingState({
        isRunning: true,
        targetClass,
        currentIndex: 0,
        totalCount: candidates.length,
        currentStudentName: candidates[0].fullName || candidates[0].studentId,
        currentStudentId: candidates[0].studentId || '',
        currentQuestionIndex: 0,
        totalQuestionsInSub: 0,
        percent: 0,
        completedCount: 0,
        skippedBlankCount: 0,
        errorCount: 0,
        logs: []
      });
    }

    let completed = 0;
    let skippedBlank = 0;
    let errors = 0;
    const activityLogs = [];

    for (let idx = 0; idx < candidates.length; idx++) {
      if (cancelBatchGradingRef && cancelBatchGradingRef.current) {
        activityLogs.unshift(`[${new Date().toLocaleTimeString('vi-VN')}] 🛑 Giáo viên đã bấm dừng quá trình chấm.`);
        break;
      }

      const sub = candidates[idx];
      const sName = sub.fullName || sub.studentId || `Học sinh #${idx + 1}`;
      const sId = sub.studentId || '';

      if (setBatchGradingState) {
        setBatchGradingState(prev => ({
          ...prev,
          currentIndex: idx,
          currentStudentName: sName,
          currentStudentId: sId,
          percent: Math.round((idx / candidates.length) * 100)
        }));
      }

      const essayQs = getEssayQuestionsForSubmission(sub);
      if (!essayQs || essayQs.length === 0) {
        activityLogs.unshift(`[${new Date().toLocaleTimeString('vi-VN')}] ℹ️ [${idx + 1}/${candidates.length}] ${sName}: Không tìm thấy câu tự luận.`);
        completed++;
        continue;
      }

      const hasAnyAnswer = essayQs.some(q => {
        const qNum = q.num !== undefined ? q.num : 1;
        const ans = sub.answers?.essay?.[qNum] ?? sub.answers?.essay?.[String(qNum)] ?? '';
        return Boolean(String(ans).trim());
      });
      if (!hasAnyAnswer) {
        skippedBlank++;
      }

      try {
        const gradeRes = await gradeSubmissionWithGemini({
          submission: sub,
          essayQuestions: essayQs,
          apiKey: key,
          model: geminiModel,
          autoFallback: true,
          onModelFallback: (fromM, toM, reason) => {
            const fallbackMsg = `🔄 [Dự phòng] Chuyển ${fromM} ➔ ${toM} (${reason.slice(0, 40)})`;
            activityLogs.unshift(`[${new Date().toLocaleTimeString('vi-VN')}] ${fallbackMsg}`);
            if (setBatchGradingState) {
              setBatchGradingState(prev => ({
                ...prev,
                logs: [...activityLogs.slice(0, 30)]
              }));
            }
          },
          onProgress: (qIdx, totalQ) => {
            if (setBatchGradingState) {
              setBatchGradingState(prev => ({
                ...prev,
                currentQuestionIndex: qIdx,
                totalQuestionsInSub: totalQ
              }));
            }
          }
        });

        const saveRes = window.AsianSchoolStorage.gradeEssaySubmission(
          sub.id,
          gradeRes.essayScores,
          gradeRes.teacherFeedback
        );

        if (saveRes.success) {
          completed++;
          const finalScore = saveRes.submission.finalScore;
          const essayScore = saveRes.submission.essayTotal;
          const logText = `✓ [${idx + 1}/${candidates.length}] ${sName}: Tự luận +${essayScore}đ -> Tổng ${finalScore}/10đ${!hasAnyAnswer ? ' (Bỏ trống)' : ''}`;
          activityLogs.unshift(`[${new Date().toLocaleTimeString('vi-VN')}] ${logText}`);
        } else {
          errors++;
          activityLogs.unshift(`[${new Date().toLocaleTimeString('vi-VN')}] ⚠️ [${idx + 1}/${candidates.length}] ${sName}: Lỗi lưu điểm (${saveRes.error})`);
        }
      } catch (err) {
        errors++;
        activityLogs.unshift(`[${new Date().toLocaleTimeString('vi-VN')}] ⚠️ [${idx + 1}/${candidates.length}] ${sName}: Lỗi AI (${err.message})`);
      }

      if (setBatchGradingState) {
        setBatchGradingState(prev => ({
          ...prev,
          completedCount: completed,
          skippedBlankCount: skippedBlank,
          errorCount: errors,
          percent: Math.round(((idx + 1) / candidates.length) * 100),
          logs: [...activityLogs.slice(0, 30)]
        }));
      }
    }

    setSubmissions(window.AsianSchoolStorage.getSubmissions());
    if (setBatchGradingState) {
      setBatchGradingState(prev => ({
        ...prev,
        isRunning: false,
        percent: 100
      }));
    }

    if (showToast) {
      showToast(`✓ Đã hoàn tất chấm tự luận cho ${completed}/${candidates.length} bài của Lớp ${targetClass}!`, 'success');
    }
  };

  const handleCancelBatchGrading = () => {
    if (cancelBatchGradingRef) {
      cancelBatchGradingRef.current = true;
    }
    if (setBatchGradingState) {
      setBatchGradingState(prev => ({
        ...prev,
        isRunning: false
      }));
    }
    if (showToast) {
      showToast('Đã dừng tiến trình chấm nhanh cả lớp.', 'info');
    }
  };

  return {
    openGradingModal,
    handleSaveGrading,
    handleStartBatchGrading,
    handleCancelBatchGrading
  };
}
