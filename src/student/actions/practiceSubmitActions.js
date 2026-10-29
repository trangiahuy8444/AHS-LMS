import { clearPracticeLock } from './startActions.js';

// Nộp bài ôn tập đề cương: tự chấm và lưu bảng điểm ôn tập
// s: state và hàm của cổng học sinh (xem hooks/useStudentController.js)
export function createPracticeSubmitActions(s) {
  const { grade, mode, setExamState, fullName, studentClass, studentId, sessionId,
    setShowSubmitModal, practiceAnswers, totalViolations, setScoreResult, showDialog, examStartTime,
    config, practiceQuestions, practiceTfQuestions, practiceEssayQuestions } = s;

  // Nộp bài ôn tập
  // isForced: giám thị thu bài hoặc hết giờ thì nộp luôn, bỏ qua yêu cầu làm hết câu
  const handleSubmitPractice = (isForced = false) => {
    setShowSubmitModal(false);
    if (!isForced && config.requireAllQuestionsAnswered) {
      const missing = [];
      practiceQuestions.forEach((q, idx) => {
        if (practiceAnswers.mcq[q.id] === undefined) {
          missing.push(`Câu ${idx + 1} (Trắc nghiệm)`);
        }
      });
      if (grade === 10) {
        practiceTfQuestions.forEach((tf, idx) => {
          const userSub = practiceAnswers.tf[tf.num] || {};
          const unans = (tf.subQuestions || []).filter(sub => userSub[sub.letter] === undefined);
          if (unans.length > 0) {
            missing.push(`Câu ${idx + 1} Đ/S (ý ${unans.map(s => s.letter).join(', ')})`);
          }
        });
      }
      practiceEssayQuestions.forEach((es, idx) => {
        const text = (practiceAnswers.essay[es.num] || '').trim();
        if (!text) {
          missing.push(`Câu ${idx + 1} (Tự luận)`);
        }
      });

      if (missing.length > 0) {
        showDialog(
          'Chưa Hoàn Thành Tất Cả Câu Hỏi',
          `⚠️ Thầy Cô yêu cầu em phải làm hết 100% câu hỏi trước khi nộp bài!\n\nHiện em còn ${missing.length} phần chưa hoàn thành:\n• ${missing.slice(0, 8).join('\n• ')}${missing.length > 8 ? `\n... và còn ${missing.length - 8} câu nữa` : ''}\n\nEm vui lòng hoàn thành đầy đủ nhé!`,
          'warning'
        );
        return;
      }
    }

    // Phiên ôn tập kết thúc: lần ôn tập sau không bắt đầu trong trạng thái khóa
    clearPracticeLock();
    window.AsianSchoolAntiCheat.setSubmitting(true);
    window.AsianSchoolAntiCheat.stop();
    window.AsianSchoolAntiCheat.exitFullscreen();

    let correctMcq = 0;
    practiceQuestions.forEach(q => {
      if (practiceAnswers.mcq[q.id] === q.correctAnswer) {
        correctMcq++;
      }
    });

    let correctTfSub = 0;
    let totalTfSub = 0;
    let tfPoints = 0;
    if (grade === 10) {
      practiceTfQuestions.forEach(tf => {
        const userSub = practiceAnswers.tf[tf.num] || {};
        let subCorrect = 0;
        tf.subQuestions.forEach(sub => {
          totalTfSub++;
          if (userSub[sub.letter] === sub.correctAnswer) {
            correctTfSub++;
            subCorrect++;
          }
        });
        // Điểm Đúng/Sai theo chuẩn Bộ GD: 1 ý = 0.1đ, 2 ý = 0.25đ, 3 ý = 0.5đ, 4 ý = 1.0đ
        if (subCorrect === 1) tfPoints += 0.1;
        else if (subCorrect === 2) tfPoints += 0.25;
        else if (subCorrect === 3) tfPoints += 0.5;
        else if (subCorrect === 4) tfPoints += 1.0;
      });
    }

    const totalMcq = practiceQuestions.length;
    let score = 0;
    let mcqPoints = Math.round(correctMcq * 0.25 * 100) / 100;
    tfPoints = Math.round(tfPoints * 100) / 100;

    if (grade === 10) {
      // THPT: 19 câu MCQ (4.75đ) + 3 câu Đúng/Sai (3.0đ) = 7.75 điểm tự động tối đa
      const autoTotal = Math.round((mcqPoints + tfPoints) * 100) / 100;
      score = (autoTotal > 0) ? Math.min(10, Math.round(((autoTotal / 7.75) * 10) * 100) / 100).toFixed(2) : '0.00';
    } else {
      // THCS: 28 câu MCQ (7.0đ), quy đổi sang thang 10
      score = totalMcq > 0 ? ((correctMcq / totalMcq) * 10).toFixed(2) : '0.00';
    }

    const durationSec = examStartTime ? Math.round((Date.now() - examStartTime) / 1000) : 0;
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const durationFormatted = `${mins} phút ${secs < 10 ? '0' : ''}${secs} giây`;

    const result = {
      mode: 'practice',
      correctCount: correctMcq,
      totalQuestions: totalMcq,
      correctTfSub,
      totalTfSub,
      tfPoints,
      mcqPoints,
      score: parseFloat(score),
      essayAnswered: Object.keys(practiceAnswers.essay).length,
      violations: totalViolations,
      durationSeconds: durationSec,
      durationFormatted,
      submittedAt: new Date().toISOString()
    };

    // Lưu vào phiên tạm theo Mã LMS (không lưu vĩnh viễn vào CSDL)
    const savedPracticeDoc = window.AsianSchoolStorage.saveSubmission({
      sessionId,
      fullName,
      studentClass,
      studentId,
      grade,
      mode: 'practice',
      score: parseFloat(score),
      correctCount: correctMcq,
      totalQuestions: totalMcq,
      violations: totalViolations,
      durationSeconds: durationSec,
      durationFormatted,
      answers: practiceAnswers
    });

    result.attemptNumber = savedPracticeDoc?.attemptNumber || 1;
    setScoreResult(result);
    setExamState('submitted');

    // Báo trạng thái hoàn thành phiên ôn tập lên bảng giám sát giáo viên
    window.AsianSchoolStorage.updateLiveSession({
      sessionId,
      fullName,
      studentClass,
      studentId,
      grade,
      mode: 'practice',
      examCode: 'DE_CUONG',
      violations: totalViolations,
      status: 'submitted',
      score: parseFloat(score)
    });
  };

  return { handleSubmitPractice };
}
