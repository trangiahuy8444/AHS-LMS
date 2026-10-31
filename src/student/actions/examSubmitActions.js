import { clearExamDraft, saveExamDraft } from './examDraft.js';

// Nộp bài thi chính thức: gửi bài làm, trang quản trị chấm
// s: state và hàm của cổng học sinh (xem hooks/useStudentController.js)
export function createExamSubmitActions(s) {
  const { grade, mode, setExamState, fullName, studentClass, studentId, sessionId, assignedCode,
    setIsContactingServer, submittingExamRef, setShowSubmitModal, examAnswers, violations,
    setScoreResult, showDialog, config, currentOfficialExam, examDraftSession, setExamDraftSession } = s;

  // Nộp bài thi chính thức
  const handleSubmitExam = async (isForced = false) => {
    setShowSubmitModal(false);
    // Hết giờ có thể gọi nộp bài 2 lần (hộp thoại + gọi trực tiếp): chỉ gửi 1 lần
    if (submittingExamRef.current) return;

    if (!isForced && config.requireAllQuestionsAnswered) {
      const missing = [];
      if (grade === 8 || grade === 9) {
        const qs = currentOfficialExam?.mcqQuestions || [];
        qs.forEach(q => {
          if (examAnswers.mcq[q.num] === undefined) {
            missing.push(`Câu ${q.num} (Trắc nghiệm)`);
          }
        });
        const es = currentOfficialExam?.essayQuestions || currentOfficialExam?.part3_essay || [];
        es.forEach(q => {
          const text = (examAnswers.essay[q.num] || '').trim();
          if (!text) {
            missing.push(`Câu ${q.num} (Tự luận)`);
          }
        });
      } else if (grade === 10) {
        const p1 = currentOfficialExam?.part1_mcq || [];
        p1.forEach(q => {
          if (examAnswers.mcq[q.num] === undefined) {
            missing.push(`Câu ${q.num} (Phần I)`);
          }
        });
        const p2 = currentOfficialExam?.part2_tf || [];
        p2.forEach(q => {
          const userSub = examAnswers.tf[q.num] || {};
          const unans = (q.subQuestions || []).filter(sub => userSub[sub.letter] === undefined);
          if (unans.length > 0) {
            missing.push(`Câu ${q.num} (Đúng/Sai: ý ${unans.map(s => s.letter).join(', ')})`);
          }
        });
        const es = currentOfficialExam?.essayQuestions || currentOfficialExam?.part3_essay || [];
        es.forEach(q => {
          const text = (examAnswers.essay[q.num] || '').trim();
          if (!text) {
            missing.push(`Câu ${q.num} (Tự luận)`);
          }
        });
      }

      if (missing.length > 0) {
        showDialog(
          'Chưa Hoàn Thành Tất Cả Câu Hỏi',
          `⚠️ Thầy Cô yêu cầu em phải làm hết 100% câu hỏi trước khi nộp bài thi!\n\nHiện em còn ${missing.length} phần chưa hoàn thành:\n• ${missing.slice(0, 8).join('\n• ')}${missing.length > 8 ? `\n... và còn ${missing.length - 8} câu nữa` : ''}\n\nEm vui lòng kiểm tra và hoàn thành trước khi nộp nhé!`,
          'warning'
        );
        return;
      }
    }

    submittingExamRef.current = true;
    window.AsianSchoolTimer.stop();
    window.AsianSchoolAntiCheat.setSubmitting(true);
    window.AsianSchoolAntiCheat.stop();
    window.AsianSchoolAntiCheat.exitFullscreen();

    // Lưu ngay trước khi gửi, kể cả khi effect lưu nháp chưa kịp chạy.
    saveExamDraft(examDraftSession?.identity, examAnswers);

    // Bản sao bài làm trên máy, phòng khi mất mạng lúc nộp
    try {
      localStorage.setItem('asian_school_pending_exam_v1', JSON.stringify({
        grade, sessionId, fullName, studentClass, studentId, examCode: assignedCode, draftIdentity: examDraftSession?.identity, violations, answers: examAnswers, savedAt: new Date().toISOString()
      }));
    } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ }

    // Chỉ gửi bài làm; trang quản trị của giáo viên chấm trắc nghiệm (+ Đúng/Sai Khối 10) và tự luận
    let finalResult;
    setIsContactingServer(true);
    try {
      finalResult = await window.AsianSchoolCloud.submitExam({ grade, studentId, sessionId, answers: examAnswers, violations });
    } catch (err) {
      setIsContactingServer(false);
      submittingExamRef.current = false;
      showDialog(
        'Chưa Nộp Được Bài',
        `⚠️ ${err.message || 'Mất kết nối tới máy chủ.'}\n\nBài làm của em vẫn được giữ trên máy. Em kiểm tra mạng rồi bấm "Đồng ý" để nộp lại, hoặc báo Thầy/Cô giám thị.`,
        'error',
        () => handleSubmitExam(true)
      );
      return;
    }
    setIsContactingServer(false);
    clearExamDraft(examDraftSession?.identity);
    if (setExamDraftSession) setExamDraftSession(null);
    try { localStorage.removeItem('asian_school_pending_exam_v1'); } catch (e) { /* bỏ qua */ }

    setScoreResult(finalResult);
    setExamState('submitted');

    window.AsianSchoolStorage.updateLiveSession({
      sessionId,
      fullName,
      studentClass,
      studentId,
      grade,
      mode: 'exam',
      examCode: assignedCode,
      violations,
      status: 'submitted',
      pendingGrading: true
    });
  };

  return { handleSubmitExam };
}
