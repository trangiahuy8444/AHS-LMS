import React from 'react';
import { useAdmin } from '../AdminContext.js';

// MODAL CHẤM ĐIỂM TỰ LUẬN TRỰC TIẾP
export default function EssayGradingModal() {
  const { gradingSubmission, setGradingSubmission, tempEssayScores, setTempEssayScores,
    tempFeedback, setTempFeedback, gradingSuccessAlert, handleSaveGrading } = useAdmin();

  if (!(gradingSubmission)) return null;

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
              const pen = 0; // Không tự trừ điểm vi phạm (giáo viên ghi nhận riêng)
              const calc = Math.max(0, Math.min(10, Math.round((auto + essay - pen) * 100) / 100));
              return (
                <p className="text-xl font-black text-emerald-600 mt-1">
                  {calc} / 10đ {pen > 0 && <span className="text-red-600 text-xs">(-{pen}đ)</span>}
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

        {/* DANH SÁCH CÂU HỎI TỰ LUẬN ĐỂ CHẤM */}
        <div className="space-y-6">
          {(() => {
            const gradeObj = gradingSubmission.grade === 8 ? window.EXAM_DATA_G8 : (gradingSubmission.grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
            let essayQuestions = [];
            if (gradingSubmission.mode === 'practice') {
              essayQuestions = gradeObj?.practiceEssayQuestions || [];
            } else {
              const examObj = gradeObj?.officialExams?.[gradingSubmission.examCode || '101'];
              essayQuestions = gradingSubmission.grade === 10 ? (examObj?.part3_essay || []) : (examObj?.essayQuestions || []);
            }

            if (essayQuestions.length === 0) {
              return <p className="text-xs text-slate-400 italic">Không có câu tự luận trong bài làm này.</p>;
            }

            return essayQuestions.map((q) => {
              const studentText = gradingSubmission.answers?.essay?.[q.num] || '';
              const currentScore = tempEssayScores[q.num] !== undefined ? tempEssayScores[q.num] : '';

              return (
                <div key={q.num} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-sm text-blue-900 uppercase">
                      Câu {q.num} (Tự luận) {q.pointsText && `— ${q.pointsText}`}
                    </span>
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
                    
                      <span className="font-bold text-emerald-800 block uppercase text-[10px] pt-1">Rubric Hướng Dẫn Chấm:</span>
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed whitespace-pre-line text-[11px]">
                        {q.modelAnswer || 'Chưa cập nhật hướng dẫn.'}
                      </div>
                    </div>

                    {/* Cột Phải: Bài làm của học sinh & Ô nhập điểm */}
                    <div className="space-y-2">
                      <span className="font-bold text-blue-900 block uppercase text-[10px]">Bài Làm Của Học Sinh:</span>
                      <div className="p-3.5 bg-white rounded-xl text-slate-800 font-sans text-xs leading-relaxed whitespace-pre-line border border-slate-200 min-h-[120px]">
                        {studentText || <span className="text-slate-400 italic">Học sinh bỏ trống không làm câu này.</span>}
                      </div>

                      {/* Ô Nhập Điểm & Phím Chấm Nhanh */}
                      <div className="pt-2 bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-900 uppercase text-[11px]">Điểm Cho Câu {q.num}:</label>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="1.0"
                            value={currentScore}
                            onChange={e => setTempEssayScores(prev => ({ ...prev, [q.num]: e.target.value }))}
                            placeholder="0 - 1.0"
                            className="w-24 bg-white border-2 border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono-code font-bold text-emerald-700 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div className="flex items-center space-x-1.5 pt-1">
                          <span className="text-[10px] text-slate-500">Chấm nhanh:</span>
                          {[0, 0.25, 0.5, 0.75, 1.0].map(pt => (
                            <button
                              key={pt}
                              type="button"
                              onClick={() => setTempEssayScores(prev => ({ ...prev, [q.num]: pt }))}
                              className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition"
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
            });
          })()}
        </div>

        {/* LỜI NHẬN XÉT CỦA GIÁO VIÊN */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-black text-amber-800 uppercase">
            Lời Nhận Xét / Lời Phê Của Giáo Viên:
          </label>
          <textarea
            rows={3}
            value={tempFeedback}
            onChange={e => setTempFeedback(e.target.value)}
            placeholder="Gõ nhận xét cho học sinh (ví dụ: Nêu đúng định nghĩa, trình bày sạch đẹp, cần bổ sung ví dụ thực tế)..."
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

        {/* Nút lưu */}
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
