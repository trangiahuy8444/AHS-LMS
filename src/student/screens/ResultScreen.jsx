import React, { useState } from 'react';
import { useStudent } from '../StudentContext.js';
import { useStudentLanguage } from '../StudentLanguage.jsx';
import ResultCard from '../result/ResultCard.jsx';
import AnswerReview from '../result/AnswerReview.jsx';

// 4. MÀN HÌNH KẾT QUẢ BÀI LÀM (CHUẨN TƯƠNG PHẢN, CHỤP ẢNH TÊN CHUẨN, MỞ ĐÁP ÁN TỰ LUẬN)
export default function ResultScreen() {
  const { t, language } = useStudentLanguage();
  const { mode, examState, scoreResult, isCapturing, handleCaptureScreenshot, handleRestartPractice,
    config, studentClass, handleReviewLookup } = useStudent();
  const [showExamReview, setShowExamReview] = useState(false);
  const [activePane,setActivePane] = useState('summary');

  const canReview = Boolean(
    config?.allowStudentReviewOfficialExam ||
    (studentClass && config?.classReviewControl && config.classReviewControl[studentClass] === true) ||
    scoreResult?.isOfficialReview
  );

  const isReviewAllowed = canReview && !scoreResult?.receiptOnly;

  if (!(examState === 'submitted' && scoreResult)) return null;

  return (
    // Màn hình rộng: thẻ kết quả + nút ở cột trái (cố định trượt theo khi cuộn), xem lại bài làm ở cột phải
    <div className="result-workspace">
      <nav aria-label="Kết quả và bài làm" className="result-mobile-tabs">
        <button type="button" aria-pressed={activePane==='summary'} onClick={()=>setActivePane('summary')}>{t('Kết quả')}</button>
        <button type="button" aria-pressed={activePane==='review'} onClick={()=>setActivePane('review')}>{t('Bài làm')}</button>
      </nav>
      <div className="result-layout">
      <div className={`result-summary-pane ${activePane==='summary'?'active-pane':''}`}>
        {/* NÚT THAO TÁC ĐẶT TRÊN ĐẦU THẺ KẾT QUẢ — LUÔN NẰM TRONG TẦM MẮT VÀ KHÔNG BỊ CHE */}
        <div className="result-actions flex flex-wrap items-center justify-center gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-3.5 sm:p-4 rounded-3xl border-2 border-blue-200 shadow-sm">
          <button
            type="button"
            onClick={handleCaptureScreenshot}
            disabled={isCapturing}
            className="px-5 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
          >
            <span>{isCapturing ? t('Đang tạo ảnh...') : t('CHỤP MÀN HÌNH KẾT QUẢ (NỘP LÊN LMS)')}</span>
          </button>

          {mode === 'practice' ? (
            <button
              type="button"
              onClick={handleRestartPractice}
              className="px-5 sm:px-6 py-3 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center space-x-1.5"
            >
              <span>{t('Làm Lại Bài Ôn Tập')}</span>
            </button>
          ) : scoreResult?.isOfficialReview ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="px-5 sm:px-6 py-3 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center space-x-1.5"
            >
              <span>{t('Về Trang Đăng Nhập')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 sm:px-6 py-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center space-x-1.5"
            >
              <span>{t('Hoàn Tất Bài Thi')}</span>
            </button>
          )}
        </div>

        {/* THẺ KẾT QUẢ BÀI LÀM — ĐƯỢC THIẾT KẾ ĐỂ CHỤP ẢNH NỘP LÊN LMS */}
        <ResultCard />
      </div>

      {/* PHẦN ĐÁNH GIÁ ĐÚNG/SAI & MỞ ĐÁP ÁN TỰ LUẬN CHO HỌC SINH */}
      <div className={`result-review-pane ${activePane==='review'?'active-pane':''}`}>
        {mode === 'practice' ? (
          <AnswerReview />
        ) : scoreResult.receiptOnly && canReview ? (
          <div className="bg-white border border-blue-200 rounded-2xl p-6 space-y-3 text-center">
            <h3 className="font-bold text-blue-950">Bài làm đã được lưu</h3>
            <p className="text-sm text-slate-600">Em có thể chụp lại kết quả hoặc mở bài làm để đối soát khi giáo viên đã cho phép.</p>
            <button type="button" onClick={handleReviewLookup} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white">Xem bài & chốt điểm</button>
          </div>
        ) : isReviewAllowed ? (
          (showExamReview || scoreResult?.isOfficialReview) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-sm">
                <span className="text-xs font-black text-blue-950 uppercase flex items-center space-x-1.5">
                  <span>{t('ĐANG XEM CHI TIẾT BÀI THI & ĐỐI SOÁT CHỐT ĐIỂM')}</span>
                </span>
                {scoreResult?.isOfficialReview ? (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    {t('Phòng khảo thí trực tuyến')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowExamReview(false)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
                  >
                    {t('Thu Gọn')}
                  </button>
                )}
              </div>
              <AnswerReview />
            </div>
          ) : (
            <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-center">
              <h3 className="text-base sm:text-lg font-black text-blue-950 uppercase">
                {language === 'en' ? `Exam Review Opened ${studentClass ? `(Class ${studentClass})` : ''}` : `Giáo Viên Đã Mở Quyền Xem Lại Bài Thi ${studentClass ? `(Lớp ${studentClass})` : ''}`}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-medium">
                {language === 'en' ? 'Review access is open. You can check questions and answers to confirm your official score.' : 'Thầy đã mở chức năng đối soát bài làm. Em hãy mở xem lại toàn bộ câu hỏi và đáp án để chốt điểm số chính xác của mình.'}
              </p>
              <button
                type="button"
                onClick={() => setShowExamReview(true)}
                className="px-6 py-3.5 bg-[#0267B1] hover:bg-[#025694] active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-700/30 transition inline-flex items-center space-x-2"
              >
                <span>{language === 'en' ? 'Review Answers & Confirm Score' : 'Xem Chi Tiết Bài Làm & Chốt Điểm'}</span>
              </button>
            </div>
          )
        ) : (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-center">
            <h3 className="text-base sm:text-lg font-black text-blue-950 uppercase">
              Chi Tiết Bài Thi Đang Được Bảo Mật
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-medium">
              Chi tiết bài thi và đáp án đang được giáo viên bảo mật trong suốt ca thi. Sau khi toàn bộ ca thi hoàn tất, Thầy sẽ mở chức năng để em xem lại bài làm và đối soát chốt điểm.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-4 py-2 rounded-xl">
              <span>Trạng thái: Chờ Thầy mở quyền xem lại bài thi {studentClass ? `(Lớp ${studentClass})` : ''}</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
