import React from 'react';
import { useStudent } from '../StudentContext.js';
import ResultCard from '../result/ResultCard.jsx';
import AnswerReview from '../result/AnswerReview.jsx';

// 4. MÀN HÌNH KẾT QUẢ BÀI LÀM (CHUẨN TƯƠNG PHẢN, CHỤP ẢNH TÊN CHUẨN, MỞ ĐÁP ÁN TỰ LUẬN)
export default function ResultScreen() {
  const { mode, examState, scoreResult, isCapturing, handleCaptureScreenshot, handleRestartPractice } = useStudent();

  if (!(examState === 'submitted' && scoreResult)) return null;

  // Cụm nút thao tác dùng chung
  const renderActionButtons = (isTop = false) => (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 ${
        isTop
          ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-3.5 sm:p-4 rounded-3xl border-2 border-blue-200 shadow-sm'
          : 'pt-2'
      }`}
    >
      <button
        type="button"
        onClick={handleCaptureScreenshot}
        disabled={isCapturing}
        className="px-5 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
      >
        <span>📸</span>
        <span>{isCapturing ? 'Đang tạo ảnh...' : 'CHỤP MÀN HÌNH KẾT QUẢ (NỘP LÊN LMS)'}</span>
      </button>

      {mode === 'practice' ? (
        <button
          type="button"
          onClick={handleRestartPractice}
          className="px-5 sm:px-6 py-3 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center space-x-1.5"
        >
          <span>🔄</span>
          <span>Làm Lại Bài Ôn Tập</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 sm:px-6 py-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center space-x-1.5"
        >
          <span>🔒</span>
          <span>Hoàn Tất Bài Thi</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-28">
      {/* Bố cục 2 cột: Cột kết quả & Cột xem lại đáp án */}
      <div className="grid grid-cols-1 xl:grid-cols-[620px_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-4">
          {/* NÚT THAO TÁC Ở TRÊN CÙNG ĐỂ KHÔNG BAO GIỜ BỊ CHE TRÊN MỌI MÀN HÌNH */}
          {renderActionButtons(true)}

          {/* THẺ KẾT QUẢ BÀI LÀM — ĐƯỢC THIẾT KẾ ĐỂ CHỤP ẢNH NỘP LÊN LMS */}
          <ResultCard />

          {/* NÚT THAO TÁC Ở DƯỚI THẺ */}
          {renderActionButtons(false)}
        </div>

        {/* PHẦN ĐÁNH GIÁ ĐÚNG/SAI & MỞ ĐÁP ÁN TỰ LUẬN CHO HỌC SINH */}
        <div className="min-w-0">
          <AnswerReview />
        </div>
      </div>

      {/* THANH THAO TÁC NỔI GHIM ĐÁY MÀN HÌNH (FLOATING BOTTOM BAR) — CHỐNG CHE TUYỆT ĐỐI KHI CUỘN */}
      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl border-2 border-slate-300 flex items-center gap-2 sm:gap-3 max-w-[95vw]">
        <button
          type="button"
          onClick={handleCaptureScreenshot}
          disabled={isCapturing}
          className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 whitespace-nowrap"
        >
          <span>📸</span>
          <span>{isCapturing ? 'Đang chụp...' : 'Chụp Ảnh Nộp LMS'}</span>
        </button>

        {mode === 'practice' ? (
          <button
            type="button"
            onClick={handleRestartPractice}
            className="px-3.5 sm:px-4 py-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap flex items-center space-x-1"
          >
            <span>🔄</span>
            <span>Làm Lại Đề Cương</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3.5 sm:px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap flex items-center space-x-1"
          >
            <span>🔒</span>
            <span>Hoàn Tất</span>
          </button>
        )}
      </div>
    </div>
  );
}
