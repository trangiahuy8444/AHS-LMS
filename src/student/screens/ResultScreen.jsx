import React, { useState } from 'react';
import { useStudent } from '../StudentContext.js';
import ResultCard from '../result/ResultCard.jsx';
import AnswerReview from '../result/AnswerReview.jsx';

// 4. MÀN HÌNH KẾT QUẢ BÀI LÀM (CHUẨN TƯƠNG PHẢN, CHỤP ẢNH TÊN CHUẨN, MỞ ĐÁP ÁN TỰ LUẬN)
export default function ResultScreen() {
  const { mode, examState, scoreResult, isCapturing, handleCaptureScreenshot, handleRestartPractice,
    config, studentClass } = useStudent();
  const [showExamReview, setShowExamReview] = useState(false);

  const isReviewAllowed = Boolean(
    config?.allowStudentReviewOfficialExam ||
    (studentClass && config?.classReviewControl && config.classReviewControl[studentClass] === true) ||
    scoreResult?.isOfficialReview
  );

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
          ) : scoreResult?.isOfficialReview ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="px-5 sm:px-6 py-3 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center space-x-1.5"
            >
              <span>↩️</span>
              <span>Về Trang Đăng Nhập</span>
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
        {mode === 'practice' ? (
          <AnswerReview />
        ) : isReviewAllowed ? (
          (showExamReview || scoreResult?.isOfficialReview) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-sm">
                <span className="text-xs font-black text-blue-950 uppercase flex items-center space-x-1.5">
                  <span>📖</span>
                  <span>ĐANG XEM CHI TIẾT BÀI THI & ĐỐI SOÁT CHỐT ĐIỂM</span>
                </span>
                {scoreResult?.isOfficialReview ? (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    Phòng khảo thí trực tuyến
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowExamReview(false)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
                  >
                    Thu Gọn ✕
                  </button>
                )}
              </div>
              <AnswerReview />
            </div>
          ) : (
            <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center text-3xl">
                🔓
              </div>
              <h3 className="text-base sm:text-lg font-black text-blue-950 uppercase">
                Giáo Viên Đã Mở Quyền Xem Lại Bài Thi {studentClass ? `(Lớp ${studentClass})` : ''}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-medium">
                Thầy đã mở chức năng đối soát bài làm. Em hãy mở xem lại toàn bộ câu hỏi và đáp án để chốt điểm số chính xác của mình.
              </p>
              <button
                type="button"
                onClick={() => setShowExamReview(true)}
                className="px-6 py-3.5 bg-[#0267B1] hover:bg-[#025694] active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-700/30 transition inline-flex items-center space-x-2"
              >
                <span>🔍</span>
                <span>Xem Chi Tiết Bài Làm & Chốt Điểm</span>
              </button>
            </div>
          )
        ) : (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl mx-auto flex items-center justify-center text-3xl">
              🔒
            </div>
            <h3 className="text-base sm:text-lg font-black text-blue-950 uppercase">
              Chi Tiết Bài Thi Đang Được Bảo Mật
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-medium">
              Chi tiết bài thi và đáp án đang được giáo viên bảo mật trong suốt ca thi. Sau khi toàn bộ ca thi hoàn tất, Thầy sẽ mở chức năng để em xem lại bài làm và đối soát chốt điểm.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-4 py-2 rounded-xl">
              <span>⏳</span>
              <span>Trạng thái: Chờ Thầy mở quyền xem lại bài thi {studentClass ? `(Lớp ${studentClass})` : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
