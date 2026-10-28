import React from 'react';
import { useStudent } from '../StudentContext.js';
import McqQuestion from '../questions/McqQuestion.jsx';
import TrueFalseQuestion from '../questions/TrueFalseQuestion.jsx';
import EssayQuestion from '../questions/EssayQuestion.jsx';
import QuestionSidebar from '../questions/QuestionSidebar.jsx';

// 2 & 3. MÀN HÌNH LÀM BÀI 1 CÂU / LẦN (NỀN TRẮNG SÁNG, TƯƠNG PHẢN CAO, ĐẸP MẮT)
export default function ExamScreen() {
  const { grade, mode, examState, assignedCode, activeQuestionIdx, setActiveQuestionIdx,
    setShowSubmitModal, timeLeftStr, practiceItems, examItems } = useStudent();

  if (!(examState === 'in_progress')) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    
      {/* CỘT CHÍNH (3 CỘT): HIỂN THỊ DUY NHẤT 1 CÂU HỎI TẠI MỖI THỜI ĐIỂM */}
      <div className="lg:col-span-3 space-y-5">
      
        {/* Banner Hướng Dẫn / Kỷ Luật Phòng Thi */}
        {mode === 'practice' ? (
          <div className="border-2 border-blue-400 bg-blue-50/80 rounded-2xl p-4 text-blue-950 flex items-start space-x-3 shadow-sm">
            <span className="text-xl">📖</span>
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-blue-900 uppercase tracking-wide">
                  HƯỚNG DẪN ÔN TẬP ĐỀ CƯƠNG — TIN HỌC {grade}
                </span>
                <span className="text-blue-800 font-bold bg-blue-100 px-2.5 py-0.5 rounded-lg">Tài liệu SGK: Được phép</span>
              </div>
              <p className="text-slate-700 font-medium">Học sinh cần làm đạt từ <strong>6.0 điểm trở lên ít nhất 5 lần</strong> để đủ điều kiện kiểm tra giữa kỳ.</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-red-500 bg-red-50/80 rounded-2xl p-4 text-red-950 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-red-200 pb-1.5">
              <span className="font-black text-xs uppercase tracking-wider text-red-800 flex items-center space-x-1.5">
                <span>⚠️</span>
                <span>KỶ LUẬT PHÒNG THI CHÍNH THỨC — MÃ ĐỀ: {assignedCode}</span>
              </span>
              <span className="font-mono-code text-xs text-red-700 font-black bg-red-100 px-2.5 py-0.5 rounded-lg">⏱ Thời gian còn: {timeLeftStr}</span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              🚫 <strong>Cấm gian lận:</strong> Không chuyển tab/rời toàn màn hình. Vi phạm từ 3 lần sẽ bị trừ 5 điểm hoặc nhận 0 điểm theo quy chế LMS.
            </p>
          </div>
        )}

        {/* Vùng hiển thị câu hỏi hiện tại */}
        {(() => {
          const activeList = mode === 'practice' ? practiceItems : examItems;
          const currentItem = activeList[activeQuestionIdx] || activeList[0];
          if (!currentItem) return null;
          const progressPct = ((activeQuestionIdx + 1) / activeList.length) * 100;

          return (
            <div className="space-y-4">
            
              {/* Thanh thông tin câu hỏi + Tiến trình */}
              <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-700 text-white font-black text-sm tracking-wide shadow-sm">
                    {currentItem.label}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {currentItem.section}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-amber-900 font-black bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg">
                    {currentItem.points ? `${currentItem.points.toFixed(2).replace('.', ',')} điểm` : 'Tự luận'}
                  </span>
                  <span className="text-xs text-slate-600 font-mono-code font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {activeQuestionIdx + 1} / {activeList.length} câu
                  </span>
                </div>
              </div>

              {/* Thanh Progress Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>

              {/* KHỐI NỘI DUNG CÂU HỎI CHÍNH (NỀN TRẮNG SÁNG, CHỮ ĐẬM RÕ) */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md min-h-[420px] flex flex-col justify-between">
              
                {/* PHẦN 1: NỘI DUNG ĐỀ BÀI */}
                <div className="space-y-5">
                  {/* 1. Trắc nghiệm nhiều lựa chọn (MCQ) */}
                  <McqQuestion currentItem={currentItem} />

                  {/* 2. Trắc nghiệm Đúng / Sai (Khối 10) */}
                  <TrueFalseQuestion currentItem={currentItem} />

                  {/* 3. Tự luận (Essay) */}
                  <EssayQuestion currentItem={currentItem} />
                </div>

                {/* PHẦN 2: THANH NÚT ĐIỀU HƯỚNG CÂU TRƯỚC / TIẾP THEO / NỘP BÀI */}
                <div className="pt-6 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={activeQuestionIdx === 0}
                    onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
                    className={`px-5 py-3 rounded-2xl font-bold text-sm transition flex items-center space-x-2 ${
                      activeQuestionIdx === 0
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 shadow-sm'
                    }`}
                  >
                    <span>←</span>
                    <span>Câu trước</span>
                  </button>

                  {/* Nút định vị nhanh Bảng câu hỏi trên điện thoại/máy tính bảng */}
                  <button
                    type="button"
                    onClick={() => {
                      const sidebarEl = document.getElementById('question-palette-sidebar');
                      if (sidebarEl) sidebarEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="lg:hidden px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center space-x-1 shadow-sm"
                  >
                    <span>📋</span>
                    <span>Câu {activeQuestionIdx + 1}/{activeList.length}</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    {activeQuestionIdx < activeList.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveQuestionIdx(prev => Math.min(activeList.length - 1, prev + 1))}
                        className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm transition shadow-lg shadow-blue-700/30 flex items-center space-x-2"
                      >
                        <span>Câu tiếp theo</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className={`px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg flex items-center space-x-2 uppercase tracking-wider ${
                          mode === 'practice'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                        }`}
                      >
                        <span>✓ Nộp bài ngay</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </div>

      {/* CỘT PHẢI (1 CỘT): SIDEBAR DANH SÁCH CÂU HỎI & NỘP BÀI (TRẮNG SÁNG, NỔI BẬT) */}
      <QuestionSidebar />

    </div>
  );
}
