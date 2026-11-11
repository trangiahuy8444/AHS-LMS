import { sanitizeStudentFeedback, essayIssueFeedback, setEssayQuestionFeedback } from '../../shared/studentFeedback.js';
import { isValidEssayScore } from '../../shared/essayGradingPolicy.js';
import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';
import { essayPresentation } from '../../shared/essayPresentation.js';
import { gradeSingleEssayWithGemini, getEssayQuestionsForSubmission, getGeminiApiKey } from '../../core/gemini-grading-service.js';

// MODAL XEM TOÀN BỘ BÀI THI & CHẤM ĐIỂM TỰ LUẬN TÍCH HỢP GEMINI AI (DUYỆT THỦ CÔNG)
export default function EssayGradingModal() {
  const {
    gradingSubmission,
    setGradingSubmission,
    tempEssayScores,
    setTempEssayScores,
    tempFeedback,
    setTempFeedback,
    gradingSuccessAlert,
    handleSaveGrading,
    geminiApiKey,
    geminiModel,
    isGeminiGrading,
    setIsGeminiGrading,
    aiSuggestions,
    setAiSuggestions,
    showDialog,
    handleAdminConfirmScore
  } = useAdmin();

  // Chế độ xem: 'all' (Toàn bộ bài làm từ TN đến TL), 'essay' (Chỉ tự luận & chấm), 'mcq' (Chỉ trắc nghiệm & Đúng/Sai)
  const [viewMode, setViewMode] = useState('all');

  // Trạng thái đang gọi AI cho từng câu cụ thể: { [qNum]: boolean }
  const [loadingQuestions, setLoadingQuestions] = useState({});
  const [singleProgress, setSingleProgress] = useState({ current: 0, total: 0 });
  const [cloudExam, setCloudExam] = useState(null);

  const subGrade = Number(gradingSubmission?.grade || (gradingSubmission?.studentClass ? String(gradingSubmission.studentClass).split('/')[0] : 8)) || 8;
  const subCode = String(gradingSubmission?.examCode || '101').trim();

  // Nạp kho đề đầy đủ để hiển thị nội dung câu hỏi và đáp án đối chiếu
  const memoryExam = (typeof window !== 'undefined' && window.AsianSchoolLatestExamBank?.[subGrade]?.[subCode])
    || (typeof window !== 'undefined' && window['EXAM_DATA_G' + subGrade]?.officialExams?.[subCode])
    || (typeof window !== 'undefined' && window.AsianSchoolLatestExamBank?.[subGrade]?.['101'])
    || (typeof window !== 'undefined' && window['EXAM_DATA_G' + subGrade]?.officialExams?.['101'])
    || null;

  const fullExam = memoryExam || cloudExam;

  // Tự động tải từ Firestore (exam_bank hoặc exam_public) nếu fullExam chưa có sẵn trong bộ nhớ
  React.useEffect(() => {
    if (!gradingSubmission || memoryExam) return;
    if (typeof window !== 'undefined' && window.firebaseDb) {
      const docId = `g${subGrade}_${subCode}`;
      window.firebaseDb.collection('exam_bank').doc(docId).get()
        .then(snap => {
          if (snap.exists && snap.data()?.exam) {
            setCloudExam(snap.data().exam);
          } else {
            return window.firebaseDb.collection('exam_public').doc(docId).get().then(pSnap => {
              if (pSnap.exists && pSnap.data()?.exam) setCloudExam(pSnap.data().exam);
            });
          }
        })
        .catch(err => console.warn('[EssayGradingModal] Đọc đề từ Firestore:', err.message));
    }
  }, [gradingSubmission, subGrade, subCode, memoryExam]);

  if (!gradingSubmission) return null;

  // Danh sách câu hỏi tự luận
  const essayQuestions = getEssayQuestionsForSubmission(gradingSubmission);

  // Danh sách câu hỏi trắc nghiệm
  const rawMcq = subGrade === 10
    ? (fullExam?.part1_mcq || fullExam?.mcqQuestions || [])
    : (fullExam?.mcqQuestions || fullExam?.part1_mcq || []);

  const mcqList = rawMcq.length > 0 ? rawMcq : (
    Object.keys({ ...(gradingSubmission.mcqResults || {}), ...(gradingSubmission.answers?.mcq || {}) })
      .map(Number)
      .sort((a, b) => a - b)
      .map(num => ({
        num,
        question: `Câu hỏi trắc nghiệm ${num}`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        points: 0.25,
        pointsText: '0.25 điểm'
      }))
  );

  // Danh sách câu hỏi Đúng / Sai (Khối 10)
  const rawTf = fullExam?.part2_tf || [];
  const tfList = rawTf.length > 0 ? rawTf : (
    subGrade === 10 ? (
      Object.keys({ ...(gradingSubmission.tfResults || {}), ...(gradingSubmission.answers?.tf || {}) })
        .map(Number)
        .sort((a, b) => a - b)
        .map(num => ({
          num,
          context: `Câu hỏi Đúng / Sai ${num}`,
          points: 1,
          subQuestions: ['a', 'b', 'c', 'd'].map(l => ({ letter: l, text: `Nhận định ${l}` }))
        }))
    ) : []
  );

  // Chấm điểm 1 câu cụ thể bằng Gemini AI
  const handleGradeSingleWithAI = async (q) => {
    const activeKey = (geminiApiKey || getGeminiApiKey() || (typeof window !== 'undefined' && window.localStorage?.getItem('ahs_gemini_api_key')) || '').trim();
    if (!activeKey) {
      showDialog(
        'Chưa Cấu Hình Gemini API Key 🔑',
        'Thầy vui lòng mở Tab "Cấu Hình & Bảo Mật" -> mục "TRỢ LÝ CHẤM BÀI TỰ LUẬN GEMINI AI" để nhập mã khóa API trước khi chấm nhé!',
        'warning'
      );
      return;
    }

    const qNum = q.num !== undefined ? q.num : 1;
    const studentText = gradingSubmission.answers?.essay?.[qNum] ?? gradingSubmission.answers?.essay?.[String(qNum)] ?? '';
    const qPoints = Math.round((Number(q.points) || parseFloat(String(q.pointsText || '').replace(/[^\d.,]/g, '').replace(',', '.')) || (Number(gradingSubmission.grade) === 10 ? 0.75 : 1.0)) * 100) / 100;

    setLoadingQuestions(prev => ({ ...prev, [qNum]: true }));

    const res = await gradeSingleEssayWithGemini({
      question: q.context || q.question || q.text || '',
      subItems: q.subItems || q.subQuestions || [],
      studentAnswer: studentText,
      modelAnswer: q.modelAnswer || q.rubric || q.answerGuide || '',
      maxPoints: qPoints,
      apiKey: activeKey,
      model: geminiModel
    });

    setLoadingQuestions(prev => ({ ...prev, [qNum]: false }));

    if (res.success) {
      setAiSuggestions(prev => ({ ...prev, [qNum]: res }));
    } else {
      showDialog('Lỗi Chấm Điểm Gemini ⚠️', res.error, 'error');
    }
  };

  // Chấm điểm toàn bộ các câu tự luận trong bài bằng Gemini AI
  const handleGradeAllWithAI = async () => {
    const activeKey = (geminiApiKey || getGeminiApiKey() || (typeof window !== 'undefined' && window.localStorage?.getItem('ahs_gemini_api_key')) || '').trim();
    if (!activeKey) {
      showDialog(
        'Chưa Cấu Hình Gemini API Key 🔑',
        'Thầy vui lòng mở Tab "Cấu Hình & Bảo Mật" -> mục "TRỢ LÝ CHẤM BÀI TỰ LUẬN GEMINI AI" để nhập mã khóa API trước khi chấm nhé!',
        'warning'
      );
      return;
    }

    if (!essayQuestions || essayQuestions.length === 0) {
      showDialog('Không Có Câu Tự Luận', 'Bài làm này không tìm thấy danh sách câu hỏi tự luận để chấm.', 'info');
      return;
    }

    setIsGeminiGrading(true);
    setSingleProgress({ current: 0, total: essayQuestions.length });
    const newSuggestions = {};
    const failures = [];

    for (let i = 0; i < essayQuestions.length; i++) {
      const q = essayQuestions[i];
      const qNum = q.num !== undefined ? q.num : (i + 1);
      setSingleProgress({ current: i + 1, total: essayQuestions.length });
      const studentText = gradingSubmission.answers?.essay?.[qNum] ?? gradingSubmission.answers?.essay?.[String(qNum)] ?? '';
      const qPoints = Math.round((Number(q.points) || parseFloat(String(q.pointsText || '').replace(/[^\d.,]/g, '').replace(',', '.')) || (Number(gradingSubmission.grade) === 10 ? 0.75 : 1.0)) * 100) / 100;

      setLoadingQuestions(prev => ({ ...prev, [qNum]: true }));

      const res = await gradeSingleEssayWithGemini({
        question: q.context || q.question || q.text || '',
        subItems: q.subItems || q.subQuestions || [],
        studentAnswer: studentText,
        modelAnswer: q.modelAnswer || q.rubric || q.answerGuide || '',
        maxPoints: qPoints,
        apiKey: activeKey,
        model: geminiModel
      });

      setLoadingQuestions(prev => ({ ...prev, [qNum]: false }));

      if (res.success) {
        newSuggestions[qNum] = res;
      } else failures.push(`Câu ${qNum}: ${res.error}`);
    }

    setAiSuggestions(newSuggestions);
    setIsGeminiGrading(false);
    if (failures.length) showDialog('Chưa chấm hợp lệ đủ các câu',failures.join('\n'),'warning');
  };

  // Duyệt & Áp dụng điểm của AI cho 1 câu
  const handleApplyAIScore = (qNum) => {
    const sug = aiSuggestions[qNum];
    if (!sug) return;

    setTempEssayScores(prev => ({ ...prev, [qNum]: sug.score }));

    const q = essayQuestions.find(question=>String(question.num)===String(qNum));
    const max = Number(sug.maxScore ?? q?.points ?? (subGrade === 10 ? 0.75 : 1));
    setTempFeedback(prev => setEssayQuestionFeedback(prev,qNum,sug,max));
  };

  // Duyệt & Áp dụng điểm của AI cho TOÀN BỘ các câu đã có đề xuất
  const handleApplyAllAIScores = () => {
    const newScores = { ...tempEssayScores };
    let feedback = tempFeedback;

    essayQuestions.forEach(q => {
      const sug = aiSuggestions[q.num];
      if (sug) {
        newScores[q.num] = sug.score;
        feedback = setEssayQuestionFeedback(feedback,q.num,sug,Number(sug.maxScore ?? q.points ?? (subGrade === 10 ? 0.75 : 1)));
      }
    });

    setTempEssayScores(newScores);
    setTempFeedback(feedback);
  };

  const totalAiSuggested = Object.keys(aiSuggestions).length;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-5 max-h-[94vh] overflow-y-auto shadow-2xl text-slate-900">
      
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                XEM BÀI LÀM & CHẤM ĐIỂM
              </span>
              {gradingSubmission.scoreConfirmed ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ Học sinh đã chốt điểm
                </span>
              ) : (
                <div className="inline-flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    ⏳ Chưa chốt điểm
                  </span>
                  {gradingSubmission.mode === 'exam' && handleAdminConfirmScore && (
                    <button
                      type="button"
                      onClick={() => handleAdminConfirmScore(gradingSubmission)}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      ✓ Xác nhận thay HS
                    </button>
                  )}
                </div>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-blue-950 mt-1">
              {gradingSubmission.fullName} — Lớp {gradingSubmission.studentClass}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã LMS: <strong className="text-blue-700 font-mono-code">{gradingSubmission.studentId || 'Chưa nhập'}</strong> • Mã đề: <strong className="text-amber-700 font-mono-code">{gradingSubmission.examCode || '101'}</strong> • Chế độ: {gradingSubmission.mode === 'exam' ? 'Thi Giữa HK1' : 'Ôn tập'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGradingSubmission(null)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Tóm tắt điểm số & thời gian làm bài */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-center">
          <div>
            <span className="text-slate-500 font-medium">Thời Gian Làm Bài:</span>
            <p className="text-base sm:text-lg font-black text-amber-700 mt-0.5">
              {gradingSubmission.durationFormatted || '45 phút'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Điểm TN / Đ-S:</span>
            <p className="text-lg sm:text-xl font-black text-blue-900 mt-0.5">
              {gradingSubmission.mcqPoints !== undefined ? gradingSubmission.mcqPoints : (gradingSubmission.score || 0)}đ
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Điểm Tự Luận:</span>
            <p className="text-lg sm:text-xl font-black text-indigo-700 mt-0.5">
              +{(Object.values(tempEssayScores).reduce((a, b) => a + (parseFloat(b) || 0), 0)).toFixed(2)}đ
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">TỔNG ĐIỂM (THANG 10):</span>
            {(() => {
              const auto = gradingSubmission.mcqPoints !== undefined ? parseFloat(gradingSubmission.mcqPoints) : (parseFloat(gradingSubmission.score) || 0);
              const essay = Object.values(tempEssayScores).reduce((a, b) => a + (parseFloat(b) || 0), 0);
              const calc = Math.max(0, Math.min(10, Math.round((auto + essay) * 100) / 100));
              return (
                <p className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">
                  {calc} / 10đ
                </p>
              );
            })()}
          </div>
        </div>

        {/* THANH ĐIỀU HƯỚNG CHẾ ĐỘ XEM BÀI LÀM */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>📋</span>
              <span>Toàn Bộ Bài Làm (Từ TN Đến Tự Luận)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('essay')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
                viewMode === 'essay'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>✍️</span>
              <span>Chỉ Chấm Tự Luận ({essayQuestions.length} câu)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mcq')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
                viewMode === 'mcq'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>📝</span>
              <span>Chỉ Xem Trắc Nghiệm & Đúng/Sai</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            {gradingSubmission.examCode ? `Mã Đề: ${gradingSubmission.examCode}` : ''}
          </span>
        </div>

        {gradingSuccessAlert && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center">
            ✓ ĐÃ LƯU ĐIỂM VÀ LỜI NHẬN XÉT CỦA GIÁO VIÊN THÀNH CÔNG!
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN I: TRẮC NGHIỆM (HIỂN THỊ KHI viewMode !== 'essay') */}
        {/* ======================================================== */}
        {(viewMode === 'all' || viewMode === 'mcq') && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <h3 className="font-black text-sm text-blue-950 flex items-center space-x-2 uppercase">
                <span>📝</span>
                <span>PHẦN I: CHI TIẾT CÂU HỎI TRẮC NGHIỆM ({mcqList.length} CÂU)</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Điểm TN: <strong className="text-blue-900">{gradingSubmission.mcqPoints !== undefined ? gradingSubmission.mcqPoints : (gradingSubmission.score || 0)}đ</strong>
              </span>
            </div>

            <div className="space-y-3">
              {mcqList.map((q, idx) => {
                const userChoice = gradingSubmission.answers?.mcq?.[q.num] !== undefined
                  ? gradingSubmission.answers.mcq[q.num]
                  : (gradingSubmission.answers?.mcq?.[String(q.num)] !== undefined
                      ? gradingSubmission.answers.mcq[String(q.num)]
                      : gradingSubmission.mcqResults?.[q.num]?.userChoice);
                const isAnswered = userChoice !== undefined && userChoice !== null;
                const userLetter = isAnswered ? letters[userChoice] : null;
                const mcqRes = gradingSubmission.mcqResults?.[q.num] || gradingSubmission.mcqResults?.[String(q.num)];
                const hasKey = q.correctAnswer !== undefined || mcqRes !== undefined;
                const correctAnsIdx = mcqRes?.correctAnswer !== undefined ? mcqRes.correctAnswer : q.correctAnswer;
                const isCorrect = mcqRes ? mcqRes.isCorrect : (hasKey && isAnswered && userChoice === correctAnsIdx);
                const ptsEarned = isCorrect ? (mcqRes?.pointsEarned || q.points || 0.25) : 0;

                return (
                  <div
                    key={q.num || idx}
                    className={`p-4 rounded-2xl border-2 text-xs space-y-2.5 transition ${
                      hasKey
                        ? (isCorrect
                            ? 'bg-emerald-50/30 border-emerald-300 text-slate-900'
                            : 'bg-rose-50/30 border-rose-300 text-slate-900')
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-700 uppercase flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono-code font-bold">
                          Câu {q.num || (idx + 1)}
                        </span>
                        {q.pointsText && <span className="text-slate-400 font-normal">({q.pointsText})</span>}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          !isAnswered
                            ? 'bg-slate-200 text-slate-700'
                            : hasKey
                              ? (isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300')
                              : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {!isAnswered
                          ? '— Chưa làm (0đ)'
                          : hasKey
                            ? (isCorrect ? `✓ ĐÚNG (+${ptsEarned}đ)` : `✗ SAI (0đ) • Học sinh chọn ${userLetter}`)
                            : `Đã chọn: ${userLetter}`}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(q.options || []).map((optText, optIdx) => {
                        const letter = letters[optIdx];
                        const isUserSelected = isAnswered && userChoice === optIdx;
                        const isCorrectOption = hasKey && correctAnsIdx === optIdx;

                        let optStyle = 'bg-white border-slate-200 text-slate-800';
                        let badgeText = null;

                        if (isUserSelected && isCorrectOption) {
                          optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500/30';
                          badgeText = '✓ Đúng';
                        } else if (isUserSelected && !isCorrectOption) {
                          optStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-500/20';
                          badgeText = '✗ Đã chọn';
                        } else if (!isUserSelected && isCorrectOption) {
                          optStyle = 'bg-emerald-50/70 border-emerald-400 text-emerald-900 font-bold border-dashed';
                          badgeText = '✓ Đáp án đúng';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-start space-x-2 transition ${optStyle}`}
                          >
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 border mt-0.5 ${
                              isUserSelected
                                ? (isCorrectOption ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600')
                                : (isCorrectOption ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-700 border-slate-300')
                            }`}>
                              {letter}
                            </span>
                            <span className="flex-1 leading-snug">{optText}</span>
                            {badgeText && (
                              <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded bg-white/80 border">
                                {badgeText}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN II: ĐÚNG / SAI (KHỐI 10, KHI viewMode !== 'essay') */}
        {/* ======================================================== */}
        {(viewMode === 'all' || viewMode === 'mcq') && subGrade === 10 && tfList.length > 0 && (
          <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between border-b border-purple-200 pb-2">
              <h3 className="font-black text-sm text-purple-950 flex items-center space-x-2 uppercase">
                <span>⚖️</span>
                <span>PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI ({tfList.length} CÂU)</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Mỗi ý đúng: +0.25đ • Tối đa 1.0đ/câu
              </span>
            </div>

            <div className="space-y-3">
              {tfList.map((tf) => (
                <div key={tf.num} className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-2.5 text-xs">
                  <span className="font-black text-purple-900 uppercase">
                    Câu {tf.num} (Đúng / Sai)
                  </span>
                  <p className="font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                    {tf.context}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {(tf.subQuestions || []).map(sub => {
                      const userVal = gradingSubmission.answers?.tf?.[tf.num]?.[sub.letter]
                        ?? gradingSubmission.answers?.tf?.[String(tf.num)]?.[sub.letter]
                        ?? gradingSubmission.tfResults?.[tf.num]?.subResults?.[sub.letter]?.userChoice;
                      const isAns = userVal !== undefined && userVal !== null;
                      const tfRes = gradingSubmission.tfResults?.[tf.num]?.subResults?.[sub.letter]
                        || gradingSubmission.tfResults?.[String(tf.num)]?.subResults?.[sub.letter];
                      const hasSubKey = sub.correctAnswer !== undefined || tfRes !== undefined;
                      const correctSubVal = tfRes?.correctAnswer !== undefined ? tfRes.correctAnswer : sub.correctAnswer;
                      const isSubCorrect = tfRes ? tfRes.isCorrect : (hasSubKey && userVal === correctSubVal);

                      return (
                        <div
                          key={sub.letter}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                            !isAns
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : hasSubKey
                                ? (isSubCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-rose-50 border-rose-300 text-rose-950 font-bold')
                                : 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                          }`}
                        >
                          <span><strong>{sub.letter})</strong> {sub.text}</span>
                          <div className="shrink-0 flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                              !isAns
                                ? 'bg-slate-200 text-slate-700'
                                : hasSubKey
                                  ? (isSubCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')
                                  : 'bg-blue-600 text-white'
                            }`}>
                              {isAns ? (userVal ? 'Chọn: ĐÚNG' : 'Chọn: SAI') : 'Chưa làm'}
                            </span>
                            {isAns && hasSubKey && (
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                isSubCorrect ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}>
                                {isSubCorrect ? '✓ Đúng (+0.25đ)' : `✕ Sai (Đáp án: ${correctSubVal ? 'ĐÚNG' : 'SAI'})`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHẦN III: TỰ LUẬN (KHI viewMode !== 'mcq') */}
        {/* ======================================================== */}
        {(viewMode === 'all' || viewMode === 'essay') && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
              <h3 className="font-black text-sm text-indigo-950 flex items-center space-x-2 uppercase">
                <span>📖</span>
                <span>PHẦN III: BÀI LÀM TỰ LUẬN & CHẤM ĐIỂM ({essayQuestions.length} CÂU)</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Thang điểm: <strong>{subGrade === 10 ? '2.25 điểm' : '3.0 điểm'}</strong>
              </span>
            </div>

            {/* THANH CÔNG CỤ TRỢ LÝ CHẤM BÀI GEMINI AI */}
            <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-purple-950 uppercase tracking-wide">
                      TRỢ LÝ CHẤM BÀI GEMINI AI (100% THEO BAREM)
                    </span>
                    <span className="text-[10px] bg-purple-200 text-purple-900 font-black px-2 py-0.5 rounded-full">
                      Duyệt thủ công
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    AI phân tích câu trả lời đối chiếu với barem chuẩn. Thầy kiểm tra lại và duyệt trước khi lưu.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {totalAiSuggested > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyAllAIScores}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                    title="Áp dụng toàn bộ điểm đề xuất của Gemini cho các câu"
                  >
                    <span>✓</span>
                    <span>Duyệt Áp Dụng Cả {totalAiSuggested} Câu</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleGradeAllWithAI}
                  disabled={isGeminiGrading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isGeminiGrading ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Đang phân tích {essayQuestions.length} câu...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Chấm Toàn Bộ {essayQuestions.length} Câu Bằng AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* THANH TRẠNG THÁI TIẾN ĐỘ CHẤM TỪNG CÂU */}
            {isGeminiGrading && (
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center text-xs font-bold text-purple-900">
                  <span className="flex items-center space-x-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                    <span>Đang đối soát barem câu {singleProgress.current} / {singleProgress.total}...</span>
                  </span>
                  <span className="font-mono font-black text-purple-700">
                    {singleProgress.total > 0 ? Math.round((singleProgress.current / singleProgress.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-purple-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${singleProgress.total > 0 ? (singleProgress.current / singleProgress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* DANH SÁCH CÂU HỎI TỰ LUẬN ĐỂ CHẤM */}
            <div className="space-y-4">
              {essayQuestions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Không có câu tự luận trong bài làm này.</p>
              ) : (
                essayQuestions.map((q, idx) => {
                  const { stem, subItems } = essayPresentation(q);
                  const qNum = q.num !== undefined ? q.num : (idx + 1);
                  const studentText = gradingSubmission.answers?.essay?.[qNum] ?? gradingSubmission.answers?.essay?.[String(qNum)] ?? '';
                  const currentScore = tempEssayScores[qNum] !== undefined ? tempEssayScores[qNum] : '';
                  const aiSug = aiSuggestions[qNum];
                  const isLoadingThis = loadingQuestions[qNum];
                  const qPoints = Math.round((Number(q.points) || parseFloat(String(q.pointsText || '').replace(/[^\d.,]/g, '').replace(',', '.')) || (Number(gradingSubmission.grade) === 10 ? 0.75 : 1.0)) * 100) / 100;

                  return (
                    <div key={qNum} className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-sm text-blue-900 uppercase">
                            Câu {qNum} (Tự luận) {q.pointsText ? `— ${q.pointsText}` : `— ${qPoints} điểm`}
                          </span>
                          {aiSug && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                              🤖 AI Đề xuất: {aiSug.score}/{aiSug.maxScore}đ
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500">
                          Đã gõ: <strong className="text-slate-900">{studentText.length}</strong> ký tự
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* Cột Trái: Đề bài & Rubric chuẩn */}
                        <div className="space-y-2">
                          <span className="font-bold text-slate-700 block uppercase text-[10px]">Đề bài:</span>
                          <p className="p-3 bg-white rounded-xl text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200">
                            {stem}
                          </p>
                          {subItems.length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                              <span className="font-bold text-blue-900 text-[10px] block uppercase">
                                Các câu hỏi con cần trả lời:
                              </span>
                              {subItems.map(item => (
                                <div key={item.letter} className="flex items-start space-x-2 text-slate-700">
                                  <span className="font-black text-blue-700 shrink-0">Ý {item.letter})</span>
                                  <span className="leading-relaxed">{item.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        
                          <span className="font-bold text-emerald-800 block uppercase text-[10px] pt-1">
                            Barem & Hướng Dẫn Chấm Chuẩn Của Trường (100% Bám Sát):
                          </span>
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed whitespace-pre-line text-[11px]">
                            {q.modelAnswer || q.rubric || q.answerGuide || 'Chưa cập nhật hướng dẫn.'}
                          </div>
                        </div>

                        {/* Cột Phải: Bài làm của học sinh & Ô nhập điểm */}
                        <div className="space-y-3">
                          <div>
                            <span className="font-bold text-blue-900 block uppercase text-[10px] mb-1">Bài Làm Của Học Sinh:</span>
                            <div className="p-3.5 bg-white rounded-xl text-slate-800 font-sans text-xs leading-relaxed whitespace-pre-line border border-slate-200 min-h-[110px]">
                              {studentText || <span className="text-slate-400 italic">Học sinh bỏ trống không làm câu này.</span>}
                            </div>
                          </div>

                          {/* KHỐI ĐỀ XUẤT CỦA GEMINI AI CHO CÂU NÀY (NẾU CÓ) */}
                          {aiSug ? (
                            <div className="p-3 bg-purple-50/90 border-2 border-purple-300 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between border-b border-purple-200 pb-1.5">
                                <span className="font-black text-purple-950 flex items-center space-x-1.5">
                                  <span>🤖</span>
                                  <span>KẾT QUẢ PHÂN TÍCH THEO BAREM:</span>
                                </span>
                                <span className="font-mono-code font-black text-purple-900 text-sm bg-purple-200 px-2 py-0.5 rounded-lg">
                                  {aiSug.score} / {aiSug.maxScore}đ
                                </span>
                              </div>

                              {/* Chi tiết từng ý theo barem */}
                              {aiSug.breakdown && aiSug.breakdown.length > 0 && (
                                <div className="space-y-1 text-[11px]">
                                  {aiSug.breakdown.map((b, bIdx) => (
                                    <div key={bIdx} className="p-1.5 bg-white rounded-lg border border-purple-100 flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <strong className="text-purple-900">{b.item}:</strong>{' '}
                                        <span className="text-slate-700">{b.reason}</span>
                                      </div>
                                      <span className={`shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                        b.points > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                      }`}>
                                        +{b.points}đ
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Lời nhận xét sư phạm gợi ý */}
                              {essayIssueFeedback(aiSug,qPoints) && (
                                <p className="text-[11px] text-slate-600 italic">
                                  💡 <strong>Gợi ý nhận xét:</strong> "{essayIssueFeedback(aiSug,qPoints)}"
                                </p>
                              )}

                              <div className="pt-1 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => handleGradeSingleWithAI(q)}
                                  disabled={isLoadingThis}
                                  className="text-[11px] text-purple-700 hover:text-purple-900 font-bold hover:underline"
                                >
                                  🔄 Chấm lại câu này
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleApplyAIScore(q.num)}
                                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-[11px] rounded-lg shadow transition flex items-center space-x-1"
                                >
                                  <span>✓</span>
                                  <span>Duyệt Điểm Này ({aiSug.score}đ)</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                              <span className="text-[11px] text-slate-500 font-medium">Chưa có đề xuất từ AI cho câu này</span>
                              <button
                                type="button"
                                onClick={() => handleGradeSingleWithAI(q)}
                                disabled={isLoadingThis}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition flex items-center space-x-1 disabled:opacity-50"
                              >
                                {isLoadingThis ? (
                                  <>
                                    <span className="animate-spin text-xs">⏳</span>
                                    <span>Đang chấm...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>✨</span>
                                    <span>Gemini Chấm Câu Này</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Ô Nhập Điểm & Phím Chấm Nhanh (Giáo viên toàn quyền sửa điểm) */}
                          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="font-black text-slate-900 uppercase text-[11px]">
                                Điểm Chính Thức Câu {qNum} (Thầy phê duyệt):
                              </label>
                              <input
                                type="number"
                                step="0.25"
                                min="0"
                                max={qPoints}
                                value={currentScore}
                                aria-invalid={!isValidEssayScore(currentScore,qPoints)}
                                onChange={e => setTempEssayScores(prev => ({ ...prev, [qNum]: e.target.value }))}
                                placeholder={`0 - ${qPoints}`}
                                className="w-24 bg-white border-2 border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono-code font-bold text-emerald-700 focus:outline-none focus:border-blue-600"
                              />
                            </div>

                            {!isValidEssayScore(currentScore,qPoints) && <p role="alert" className="text-xs text-red-700">Điểm phải theo bước 0,25 và không vượt {qPoints} điểm. Thầy chọn lại mức hợp lệ; hệ thống không tự làm tròn.</p>}
                            <div className="flex items-center space-x-1.5 pt-1">
                              <span className="text-[10px] text-slate-500">Chấm nhanh:</span>
                              {Array.from({length:Math.floor(qPoints*4)+1},(_,index)=>index/4).map(pt => (
                                <button
                                  key={pt}
                                  type="button"
                                  onClick={() => setTempEssayScores(prev => ({ ...prev, [qNum]: pt }))}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                    Number(currentScore) === pt
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                      : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {pt}đ
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* LỜI NHẬN XÉT CỦA GIÁO VIÊN */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-black text-amber-800 uppercase">
            Lời Nhận Xét / Lời Phê Của Giáo Viên (Gửi Cho Học Sinh):
          </label>
          <textarea
            rows={3}
            value={sanitizeStudentFeedback(tempFeedback)}
            onChange={e => setTempFeedback(e.target.value)}
            placeholder="Gõ nhận xét cho học sinh hoặc áp dụng từ gợi ý của Gemini..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          ></textarea>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="text-slate-500">Mẫu nhận xét nhanh:</span>
            {[
              'Nêu đúng lý thuyết, trình bày tốt.',
              'Lập luận chặt chẽ, đạt điểm tối đa.',
              'Cần giải thích rõ hơn phần ví dụ thực tế.',
              'Chưa hoàn thiện đầy đủ các ý tự luận.'
            ].map((snippet, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => setTempFeedback(prev => prev ? `${prev} ${snippet}` : snippet)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              >
                + {snippet}
              </button>
            ))}
          </div>
        </div>

        {/* Nút lưu & Duyệt kết quả */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setGradingSubmission(null)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
          >
            Đóng Hộp Thoại
          </button>

          <button
            type="button"
            onClick={handleSaveGrading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>💾</span>
            <span>LƯU ĐIỂM CHẤM & CẬP NHẬT TỔNG ĐIỂM</span>
          </button>
        </div>

      </div>
    </div>
  );
}