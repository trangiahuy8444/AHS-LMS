import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';
import { gradeSingleEssayWithGemini } from '../../core/gemini-grading-service.js';

// MODAL CHẤM ĐIỂM TỰ LUẬN TRỰC TIẾP TÍCH HỢP GEMINI AI (DUYỆT THỦ CÔNG)
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
    showDialog
  } = useAdmin();

  // Trạng thái đang gọi AI cho từng câu cụ thể: { [qNum]: boolean }
  const [loadingQuestions, setLoadingQuestions] = useState({});
  const [singleProgress, setSingleProgress] = useState({ current: 0, total: 0 });

  if (!gradingSubmission) return null;

  // Lấy danh sách câu tự luận cho bài thi đang chấm
  const gradeObj = gradingSubmission.grade === 8
    ? window.EXAM_DATA_G8
    : (gradingSubmission.grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);

  let essayQuestions = [];
  if (gradingSubmission.mode === 'practice') {
    essayQuestions = gradeObj?.practiceEssayQuestions || [];
  } else {
    const examObj = gradeObj?.officialExams?.[gradingSubmission.examCode || '101'];
    essayQuestions = gradingSubmission.grade === 10 ? (examObj?.part3_essay || []) : (examObj?.essayQuestions || []);
  }

  // Chấm điểm 1 câu cụ thể bằng Gemini AI
  const handleGradeSingleWithAI = async (q) => {
    if (!geminiApiKey) {
      showDialog(
        'Chưa Cấu Hình Gemini API Key 🔑',
        'Thầy vui lòng mở Tab "Cấu Hình & Bảo Mật" -> mục "TRỢ LÝ CHẤM BÀI TỰ LUẬN GEMINI AI" để nhập mã khóa API trước khi chấm nhé!',
        'warning'
      );
      return;
    }

    const qNum = q.num;
    const studentText = gradingSubmission.answers?.essay?.[qNum] || '';
    setLoadingQuestions(prev => ({ ...prev, [qNum]: true }));

    const res = await gradeSingleEssayWithGemini({
      question: q.context || q.question,
      subItems: q.subItems,
      studentAnswer: studentText,
      modelAnswer: q.modelAnswer,
      maxPoints: q.points || 1.0,
      apiKey: geminiApiKey,
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
    if (!geminiApiKey) {
      showDialog(
        'Chưa Cấu Hình Gemini API Key 🔑',
        'Thầy vui lòng mở Tab "Cấu Hình & Bảo Mật" -> mục "TRỢ LÝ CHẤM BÀI TỰ LUẬN GEMINI AI" để nhập mã khóa API trước khi chấm nhé!',
        'warning'
      );
      return;
    }

    setIsGeminiGrading(true);
    setSingleProgress({ current: 0, total: essayQuestions.length });
    const newSuggestions = { ...aiSuggestions };

    for (let i = 0; i < essayQuestions.length; i++) {
      const q = essayQuestions[i];
      const qNum = q.num;
      setSingleProgress({ current: i + 1, total: essayQuestions.length });
      const studentText = gradingSubmission.answers?.essay?.[qNum] || '';
      setLoadingQuestions(prev => ({ ...prev, [qNum]: true }));

      const res = await gradeSingleEssayWithGemini({
        question: q.context || q.question,
        subItems: q.subItems,
        studentAnswer: studentText,
        modelAnswer: q.modelAnswer,
        maxPoints: q.points || 1.0,
        apiKey: geminiApiKey,
        model: geminiModel
      });

      setLoadingQuestions(prev => ({ ...prev, [qNum]: false }));

      if (res.success) {
        newSuggestions[qNum] = res;
      }
    }

    setAiSuggestions(newSuggestions);
    setIsGeminiGrading(false);
  };

  // Duyệt & Áp dụng điểm của AI cho 1 câu
  const handleApplyAIScore = (qNum) => {
    const sug = aiSuggestions[qNum];
    if (!sug) return;

    // Gán điểm vào ô điểm
    setTempEssayScores(prev => ({ ...prev, [qNum]: sug.score }));

    // Tự động chèn lời nhận xét nếu có
    if (sug.feedback) {
      setTempFeedback(prev => {
        const line = `Câu ${qNum}: ${sug.feedback}`;
        if (!prev) return line;
        if (prev.includes(`Câu ${qNum}:`)) {
          return prev.replace(new RegExp(`Câu ${qNum}:[^\\n]*`), line);
        }
        return `${prev}\n${line}`;
      });
    }
  };

  // Duyệt & Áp dụng điểm của AI cho TOÀN BỘ các câu đã có đề xuất
  const handleApplyAllAIScores = () => {
    const newScores = { ...tempEssayScores };
    const feedbackLines = [];

    essayQuestions.forEach(q => {
      const sug = aiSuggestions[q.num];
      if (sug) {
        newScores[q.num] = sug.score;
        if (sug.feedback) {
          feedbackLines.push(`Câu ${q.num}: ${sug.feedback}`);
        }
      }
    });

    setTempEssayScores(newScores);
    if (feedbackLines.length > 0) {
      setTempFeedback(feedbackLines.join('\n'));
    }
  };

  const totalAiSuggested = Object.keys(aiSuggestions).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl text-slate-900">
      
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
              GIAO DIỆN CHẤM BÀI TỰ LUẬN
            </span>
            <h2 className="text-xl font-black text-blue-950 mt-1">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-center">
          <div>
            <span className="text-slate-500 font-medium">Thời Gian Làm Bài:</span>
            <p className="text-base sm:text-lg font-black text-amber-700 mt-1">
              {gradingSubmission.durationFormatted || '45 phút'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Điểm TN / Đ-S:</span>
            <p className="text-xl font-black text-blue-900 mt-1">
              {gradingSubmission.mcqPoints !== undefined ? gradingSubmission.mcqPoints : (gradingSubmission.score || 0)}đ
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Điểm Tự Luận:</span>
            <p className="text-xl font-black text-indigo-700 mt-1">
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
                <p className="text-xl font-black text-emerald-600 mt-1">
                  {calc} / 10đ
                </p>
              );
            })()}
          </div>
        </div>

        {gradingSuccessAlert && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center">
            ✓ ĐÃ LƯU ĐIỂM VÀ LỜI NHẬN XÉT CỦA GIÁO VIÊN THÀNH CÔNG!
          </div>
        )}

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
        <div className="space-y-6">
          {essayQuestions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Không có câu tự luận trong bài làm này.</p>
          ) : (
            essayQuestions.map((q) => {
              const studentText = gradingSubmission.answers?.essay?.[q.num] || '';
              const currentScore = tempEssayScores[q.num] !== undefined ? tempEssayScores[q.num] : '';
              const aiSug = aiSuggestions[q.num];
              const isLoadingThis = loadingQuestions[q.num];

              return (
                <div key={q.num} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-sm text-blue-900 uppercase">
                        Câu {q.num} (Tự luận) {q.pointsText && `— ${q.pointsText}`}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cột Trái: Đề bài & Rubric chuẩn */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-700 block uppercase text-[10px]">Đề bài:</span>
                      <p className="p-3 bg-white rounded-xl text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200">
                        {q.context || q.question}
                      </p>
                      {q.subItems && q.subItems.length > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                          <span className="font-bold text-blue-900 text-[10px] block uppercase">
                            Các câu hỏi con cần trả lời:
                          </span>
                          {q.subItems.map(item => (
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
                        {q.modelAnswer || 'Chưa cập nhật hướng dẫn.'}
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
                          {aiSug.feedback && (
                            <p className="text-[11px] text-slate-600 italic">
                              💡 <strong>Gợi ý nhận xét:</strong> "{aiSug.feedback}"
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
                            Điểm Chính Thức Câu {q.num} (Thầy phê duyệt):
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max={q.points || 1.0}
                            value={currentScore}
                            onChange={e => setTempEssayScores(prev => ({ ...prev, [q.num]: e.target.value }))}
                            placeholder={`0 - ${q.points || 1.0}`}
                            className="w-24 bg-white border-2 border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono-code font-bold text-emerald-700 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="flex items-center space-x-1.5 pt-1">
                          <span className="text-[10px] text-slate-500">Chấm nhanh:</span>
                          {(q.points === 0.75 ? [0, 0.25, 0.5, 0.75] : [0, 0.25, 0.5, 0.75, 1.0]).map(pt => (
                            <button
                              key={pt}
                              type="button"
                              onClick={() => setTempEssayScores(prev => ({ ...prev, [q.num]: pt }))}
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

        {/* LỜI NHẬN XÉT CỦA GIÁO VIÊN */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-black text-amber-800 uppercase">
            Lời Nhận Xét / Lời Phê Của Giáo Viên (Gửi Cho Học Sinh):
          </label>
          <textarea
            rows={3}
            value={tempFeedback}
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
