import React, { useState, useEffect } from 'react';
import { useStudent } from '../StudentContext.js';
import McqQuestion from '../questions/McqQuestion.jsx';
import TrueFalseQuestion from '../questions/TrueFalseQuestion.jsx';
import EssayQuestion from '../questions/EssayQuestion.jsx';
import QuestionSidebar from '../questions/QuestionSidebar.jsx';
import StudentGuidance from '../components/StudentGuidance.jsx';
import StudentIdentity from '../components/StudentIdentity.jsx';
import TeacherReminderBanner from '../components/TeacherReminderBanner.jsx';
import CalculatorWidget from '../components/CalculatorWidget.jsx';

// 2 & 3. MÀN HÌNH LÀM BÀI 1 CÂU / LẦN (NỀN TRẮNG SÁNG, TƯƠNG PHẢN CAO, ĐẸP MẮT)
export default function ExamScreen() {
  const { grade, mode, examState, activeQuestionIdx, setActiveQuestionIdx,
    practiceItems, examItems, config,
    isSessionLocked, isCalculatorOpen, setIsCalculatorOpen } = useStudent();

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!(examState === 'in_progress')) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    
      {/* CỘT CHÍNH (3 CỘT): HIỂN THỊ DUY NHẤT 1 CÂU HỎI TẠI MỖI THỜI ĐIỂM */}
      <div className="lg:col-span-3 space-y-5">
      
        <StudentIdentity />

        {/* Banner Hướng Dẫn / Kỷ Luật Phòng Thi */}
        {!isSessionLocked && <TeacherReminderBanner />}
        <StudentGuidance mode={mode} config={config} />
        {/* BANNER DỰ PHÒNG NGOẠI TUYẾN KHI MẤT MẠNG INTERNET */}
        {!isOnline && (
          <div className="border-2 border-amber-400 bg-amber-50 rounded-2xl p-3.5 text-amber-950 text-xs font-bold flex items-center space-x-2.5 shadow-sm animate-pulse">
            <span className="text-xl shrink-0">📡</span>
            <div className="leading-relaxed">
              <span className="font-black uppercase text-amber-900">CHẾ ĐỘ NGOẠI TUYẾN DỰ PHÒNG:</span> Mạng Internet phòng máy đang tạm gián đoạn. Bài làm của em đang được tự động lưu trữ an toàn từng câu trên máy tính này. Em hãy yên tâm tiếp tục làm bài bình thường!
            </div>
          </div>
        )}

        {/* Vùng hiển thị câu hỏi hiện tại */}
        {(() => {
          const activeList = mode === 'practice' ? practiceItems : examItems;
          const currentItem = activeList[activeQuestionIdx] || activeList[0];
          if (!currentItem) {
            return (
              <div className="bg-white border-2 border-slate-200 p-8 rounded-2xl text-center space-y-3">
                <div className="animate-spin text-3xl inline-block">🔄</div>
                <p className="text-slate-600 font-bold text-sm">Đang tải bộ câu hỏi, vui lòng chờ trong giây lát...</p>
              </div>
            );
          }
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
                    {currentItem.points ? `${currentItem.points.toFixed(2).replace('.', ',')} điểm` : 'Tự luận · không tính điểm'}
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
                        disabled
                        className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-sm cursor-not-allowed flex items-center space-x-2"
                      >
                        <span>Đã đến câu cuối</span>
                        <span>✓</span>
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

      {/* MÁY TÍNH CẦM TAY TRỰC TIẾP TRÊN PHẦN MỀM (CHO PHÉP TÍNH TOÁN DUNG LƯỢNG MÔN TIN) */}
      <CalculatorWidget />

      {/* NÚT NỔI MỞ MÁY TÍNH BỎ TÚI KHI ĐANG ĐÓNG (DÀNH CHO KHỐI 10 HOẶC KHI LÀM TỰ LUẬN) */}
      {!isCalculatorOpen && (grade === 10 || (mode === 'practice' ? practiceItems : examItems)[activeQuestionIdx]?.type?.includes('essay')) && (
        <button
          type="button"
          onClick={() => setIsCalculatorOpen(true)}
          className="fixed bottom-5 right-5 z-30 px-3.5 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xl flex items-center space-x-2 border-2 border-white transition transform hover:scale-105 active:scale-95"
          title="Mở máy tính cầm tay để tính toán dung lượng, đơn vị đo"
        >
          <span className="text-base">🧮</span>
          <span className="font-black">Máy tính</span>
          <span className="text-[10px] bg-blue-900/80 px-1.5 py-0.5 rounded font-black">
            {grade === 10 ? 'Tin 10' : 'Hỗ trợ'}
          </span>
        </button>
      )}

    </div>
  );
}
