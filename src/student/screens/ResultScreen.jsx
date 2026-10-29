import React from 'react';
import { useStudent } from '../StudentContext.js';
import ResultCard from '../result/ResultCard.jsx';
import AnswerReview from '../result/AnswerReview.jsx';

// 4. MÀN HÌNH KẾT QUẢ BÀI LÀM (CHUẨN TƯƠNG PHẢN, CHỤP ẢNH TÊN CHUẨN, MỞ ĐÁP ÁN TỰ LUẬN)
export default function ResultScreen() {
  const { mode, examState, scoreResult, isCapturing, handleCaptureScreenshot, handleRestartPractice } = useStudent();

  if (!(examState === 'submitted' && scoreResult)) return null;

  return (
    // Màn hình rộng: thẻ kết quả + nút ở cột trái (cố định trượt theo khi cuộn), xem lại bài làm ở cột phải
    <div className="grid grid-cols-1 xl:grid-cols-[620px_minmax(0,1fr)] gap-6 items-start">
      <div className="space-y-4 xl:sticky xl:top-24">
        {/* NÚT THAO TÁC ĐẶT TRÊN ĐẦU THẺ KẾT QUẢ — LUÔN NẰM TRONG TẦM MẮT VÀ KHÔNG BỊ CHE */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-3.5 sm:p-4 rounded-3xl border-2 border-blue-200 shadow-sm">
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

        {/* THẺ KẾT QUẢ BÀI LÀM — ĐƯỢC THIẾT KẾ ĐỂ CHỤP ẢNH NỘP LÊN LMS */}
        <ResultCard />
      </div>

      {/* PHẦN ĐÁNH GIÁ ĐÚNG/SAI & MỞ ĐÁP ÁN TỰ LUẬN CHO HỌC SINH */}
      <div className="min-w-0">
        <AnswerReview />
      </div>
    </div>
  );
}
