import React from 'react';
import { useStudent } from '../StudentContext.js';
import ResultCard from '../result/ResultCard.jsx';
import AnswerReview from '../result/AnswerReview.jsx';

// 4. MÀN HÌNH KẾT QUẢ BÀI LÀM (CHUẨN TƯƠNG PHẢN, CHỤP ẢNH TÊN CHUẨN, MỞ ĐÁP ÁN TỰ LUẬN)
export default function ResultScreen() {
  const { mode, examState, scoreResult, isCapturing, handleCaptureScreenshot, handleRestartPractice } = useStudent();

  if (!(examState === 'submitted' && scoreResult)) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
    
      {/* THẺ KẾT QUẢ BÀI LÀM — ĐƯỢC THIẾT KẾ ĐỂ CHỤP ẢNH NỘP LÊN LMS */}
      <ResultCard />

      {/* CÁC NÚT THAO TÁC: CHỤP ẢNH NỘP LMS & LÀM LẠI */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCaptureScreenshot}
          disabled={isCapturing}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
        >
          <span>📸</span>
          <span>{isCapturing ? 'Đang tạo ảnh...' : 'CHỤP MÀN HÌNH KẾT QUẢ (NỘP LÊN LMS)'}</span>
        </button>

        {mode === 'practice' ? (
          <button
            type="button"
            onClick={handleRestartPractice}
            className="px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-2xl transition shadow-md"
          >
            Làm Lại Bài Ôn Tập 🔄
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-2xl transition shadow-md"
          >
            Hoàn Tất Bài Thi 🔒
          </button>
        )}
      </div>

      {/* PHẦN ĐÁNH GIÁ ĐÚNG/SAI & MỞ ĐÁP ÁN TỰ LUẬN CHO HỌC SINH */}
      <AnswerReview />

    </div>
  );
}
