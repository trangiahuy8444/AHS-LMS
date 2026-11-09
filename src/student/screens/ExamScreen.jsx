import { hasEnglishQuestion } from '../../shared/questionLanguage.js';
import { useStudentLanguage } from '../StudentLanguage.jsx';
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
  const { t, language } = useStudentLanguage();
  const { grade, mode, examState, activeQuestionIdx, setActiveQuestionIdx,
    practiceItems, examItems, config,
    isSessionLocked, draftSaveFailed, setIsCalculatorOpen } = useStudent();

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
    <div className="exam-workspace-grid">
    
      {/* CỘT CHÍNH (3 CỘT): HIỂN THỊ DUY NHẤT 1 CÂU HỎI TẠI MỖI THỜI ĐIỂM */}
      <div className="exam-main-column">
      
        <StudentIdentity />
        {draftSaveFailed && <p role="alert" className="text-xs font-bold text-red-700">Chưa lưu được bản nháp trên máy. Em giữ trang đang mở và báo giáo viên kiểm tra bộ nhớ trình duyệt.</p>}

        {/* Banner Hướng Dẫn / Kỷ Luật Phòng Thi */}
        {!isSessionLocked && <TeacherReminderBanner />}
        <StudentGuidance mode={mode} config={config} compact />
        {/* BANNER DỰ PHÒNG NGOẠI TUYẾN KHI MẤT MẠNG INTERNET */}
        {!isOnline && (
          <p role="status" className="exam-offline-notice rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
            {t('Mất kết nối · Bài làm được giữ trên máy này. Em có thể tiếp tục làm bài.')}
          </p>
        )}

        {language === 'en' && !hasEnglishQuestion((mode === 'practice' ? practiceItems : examItems)[activeQuestionIdx]?.data) && (
          <p role="status" className="text-xs text-amber-800">This question has no English version yet. The Vietnamese original is shown.</p>
        )}
        {/* Vùng hiển thị câu hỏi hiện tại */}
        {(() => {
          const activeList = mode === 'practice' ? practiceItems : examItems;
          const currentItem = activeList[activeQuestionIdx] || activeList[0];
          if (!currentItem) {
            return (
              <div className="bg-white border-2 border-slate-200 p-8 rounded-2xl text-center space-y-3">
                <div className="animate-spin text-3xl inline-block">🔄</div>
                <p className="text-slate-600 font-bold text-sm">{t('Đang tải bộ câu hỏi, vui lòng chờ trong giây lát...')}</p>
              </div>
            );
          }
          const progressPct = ((activeQuestionIdx + 1) / activeList.length) * 100;

          return (
            <div className="exam-question-stage">
            
              {/* Thanh thông tin câu hỏi + Tiến trình */}
              <div className="exam-question-meta bg-white border border-slate-200 px-3 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-700 text-white font-black text-sm tracking-wide shadow-sm">
                    {language === 'en' ? currentItem.label.replace(/^Câu /, 'Question ') : currentItem.label}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {language === 'en' ? t(currentItem.type.includes('essay') ? 'Tự luận' : currentItem.type.includes('tf') ? 'Đúng / Sai' : 'Trắc nghiệm') : currentItem.section}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  {grade === 10 && !currentItem.type?.includes('essay') && (
                    <button type="button" onClick={() => setIsCalculatorOpen(value => !value)} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-900">{t('Máy tính')}</button>
                  )}
                  <span className="text-xs text-amber-900 font-black bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg">
                    {currentItem.points ? `${currentItem.points.toFixed(2).replace('.', language === 'en' ? '.' : ',')} ${t('điểm')}` : t('Tự luận · không tính điểm')}
                  </span>
                  <span className="text-xs text-slate-600 font-mono-code font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {activeQuestionIdx + 1} / {activeList.length} {t('câu')}
                  </span>
                </div>
              </div>

              {/* Thanh Progress Bar */}
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden border border-slate-300">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>

              {/* KHỐI NỘI DUNG CÂU HỎI CHÍNH (NỀN TRẮNG SÁNG, CHỮ ĐẬM RÕ) */}
              <div className="exam-question-card">
              
                {/* PHẦN 1: NỘI DUNG ĐỀ BÀI */}
                <div className="exam-question-content">
                  {/* 1. Trắc nghiệm nhiều lựa chọn (MCQ) */}
                  <McqQuestion currentItem={currentItem} />

                  {/* 2. Trắc nghiệm Đúng / Sai (Khối 10) */}
                  <TrueFalseQuestion currentItem={currentItem} />

                  {/* 3. Tự luận (Essay) */}
                  <EssayQuestion currentItem={currentItem} />
                </div>

                {/* PHẦN 2: THANH NÚT ĐIỀU HƯỚNG CÂU TRƯỚC / TIẾP THEO / NỘP BÀI */}
                <div className="exam-question-navigation flex flex-wrap items-center justify-between gap-2">
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
                    <span>{t('Câu trước')}</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    {activeQuestionIdx < activeList.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveQuestionIdx(prev => Math.min(activeList.length - 1, prev + 1))}
                        className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm transition shadow-lg shadow-blue-700/30 flex items-center space-x-2"
                      >
                        <span>{t('Câu tiếp theo')}</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-sm cursor-not-allowed flex items-center space-x-2"
                      >
                        <span>{t('Đã đến câu cuối')}</span>
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


    </div>
  );
}
