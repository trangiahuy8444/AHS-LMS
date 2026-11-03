import React from 'react';
import { useStudent } from '../StudentContext.js';

// THẺ KẾT QUẢ BÀI LÀM — ĐƯỢC THIẾT KẾ ĐỂ CHỤP ẢNH NỘP LÊN LMS
export default function ResultCard() {
  const { grade, mode, fullName, studentClass, studentId, scoreResult } = useStudent();
  const maxScore = scoreResult?.maxScore !== undefined ? scoreResult.maxScore : (grade === 10 ? 7.75 : 7);

  return (
    <div
      id="result-capture-card"
      className="bg-white text-slate-900 rounded-3xl shadow-xl border-2 border-slate-200 p-6 sm:p-8 space-y-5"
    >
      {/* Header Thẻ Kết Quả */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <img
            src={window.ASIAN_SCHOOL_LOGO_BASE64 || "../assets/logo_asian_school.png"}
            alt="Logo Asian School"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h3 className="font-black text-xs sm:text-sm text-blue-950 leading-tight uppercase">
              TRƯỜNG QUỐC TẾ Á CHÂU (ASIAN SCHOOL)
            </h3>
            <p className="text-[11px] text-slate-600 font-bold">
              BỘ MÔN TIN HỌC — XÁC NHẬN KẾT QUẢ BÀI LÀM TRỰC TUYẾN
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300 shadow-sm inline-block">
            {mode === 'practice' ? `ÔN TẬP ĐỀ CƯƠNG — LẦN ${scoreResult.attemptNumber || 1}` : 'THI GIỮA HK1'}
          </span>
        </div>
      </div>

      {/* Thông tin học sinh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-xs">
        <div>
          <p className="text-slate-500 font-semibold">Họ và tên:</p>
          <p className="font-black text-slate-900 text-sm truncate">{fullName}</p>
        </div>
        <div>
          <p className="text-slate-500 font-semibold">Lớp học:</p>
          <p className="font-black text-slate-900 text-sm">Lớp {studentClass}</p>
        </div>
        <div>
          <p className="text-slate-500 font-semibold">Mã LMS:</p>
          <p className="font-black text-blue-800 text-sm font-mono-code">{studentId || 'Chưa nhập'}</p>
        </div>
        <div>
          <p className="text-slate-500 font-semibold">{mode === 'practice' ? 'Số lần làm bài:' : 'Mã Đề Thi:'}</p>
          <p className={`font-black text-sm font-mono-code ${mode === 'practice' ? 'text-amber-800 font-black' : 'text-slate-900'}`}>
            {mode === 'practice' ? `LẦN THỨ ${scoreResult.attemptNumber || 1}` : (scoreResult.examCode || 'Đề cương')}
          </p>
        </div>
      </div>

      {/* Khối Điểm Số Nổi Bật (High Contrast, Padding Đáy Đầy Đủ Chống Che Chữ Khi Chụp) */}
      <div className="text-center py-6 px-4 bg-blue-50/80 rounded-3xl border-2 border-blue-200 shadow-sm space-y-3 pb-8">
        <p className="text-xs text-blue-900 font-black uppercase tracking-widest">
          {mode === 'practice'
            ? 'ĐIỂM ĐẠT ĐƯỢC'
            : (scoreResult.isGraded ? 'BÀI THI CHÍNH THỨC — TỔNG KẾT ĐIỂM SỐ' : 'BÀI THI CHÍNH THỨC — ĐIỂM TRẮC NGHIỆM')}
        </p>
        {mode === 'practice' ? (
          <div className="text-5xl sm:text-6xl font-black text-red-600 my-1">
            {scoreResult.score}
            <span className="text-xl text-slate-600 font-bold"> / {maxScore}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {scoreResult.isGraded ? (
              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-black text-blue-900 my-1">
                  {scoreResult.finalScore !== undefined ? scoreResult.finalScore : scoreResult.score}
                  <span className="text-xl text-slate-600 font-bold"> / 10.0 đ</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-700">
                  <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full border border-blue-300">
                    Trắc nghiệm: {scoreResult.mcqPoints !== undefined ? scoreResult.mcqPoints : (scoreResult.score || 0)} đ
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-900 rounded-full border border-indigo-300">
                    Tự luận (Thầy chấm): {scoreResult.essayTotal || 0} đ
                  </span>
                </div>
              </div>
            ) : scoreResult.mcqPoints !== undefined ? (
              <div className="text-4xl sm:text-5xl font-black text-blue-900 my-1">
                {scoreResult.mcqPoints}
                <span className="text-xl text-slate-600 font-bold"> / {grade === 10 ? 7.75 : 7.0} đ</span>
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 my-1">✅ ĐÃ NỘP BÀI THÀNH CÔNG</div>
            )}
            {scoreResult.scoreConfirmed && (
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-100 border border-emerald-400 rounded-full text-emerald-800 text-xs font-black shadow-sm mt-1">
                <span>✓</span>
                <span>ĐÃ XÁC NHẬN CHỐT ĐIỂM</span>
              </div>
            )}
          </div>
        )}
        <div className="space-y-2">
          <p className="text-xs text-slate-700 font-bold">
            {mode === 'practice'
              ? `Làm đúng ${scoreResult.correctCount} / ${scoreResult.totalQuestions} câu trắc nghiệm • Tự luận không tính điểm (thang điểm trắc nghiệm: ${maxScore}đ) • Thời gian làm: ${scoreResult.durationFormatted || 'N/A'}`
              : `Thời gian làm bài: ${scoreResult.durationFormatted || '45 phút'} • Nộp lúc: ${new Date(scoreResult.submittedAt).toLocaleTimeString('vi-VN')} • Số lần vi phạm: ${scoreResult.violations} lần`
            }
          </p>
          {mode === 'exam' && scoreResult.correctMcq !== undefined && (
            <p className="text-xs text-emerald-700 font-bold">
              ✓ Số câu trắc nghiệm đúng: {scoreResult.correctMcq} câu
            </p>
          )}
          {mode === 'practice' && (
            <div className="pt-2">
              <div className="inline-block px-6 py-2.5 bg-amber-100 border-2 border-amber-500 rounded-2xl text-amber-950 text-sm sm:text-base font-black shadow-md">
                🎯 SỐ LẦN ĐÃ LÀM: LẦN THỨ {scoreResult.attemptNumber || 1}
              </div>
            </div>
          )}
          {scoreResult.violations >= 3 && (
            <div className="mt-2 inline-block px-4 py-1.5 bg-red-100 border-2 border-red-500 rounded-xl text-red-800 text-xs font-black shadow-sm">
              🚨 Vi phạm 3 lần: bài đã bị khóa, giám thị ghi nhận và xử lý theo quy chế
            </div>
          )}

          {mode === 'exam' && (
            scoreResult.isGraded ? (
              <div className="mt-3 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs text-emerald-950 font-semibold space-y-1.5 text-left">
                <div className="flex items-center space-x-1.5 font-black text-emerald-950 text-xs uppercase">
                  <span>👨‍🏫</span>
                  <span>NHẬN XÉT & LỜI PHÊ CỦA THẦY TRẦN GIA HUY:</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 font-bold leading-relaxed italic bg-white/80 p-3 rounded-xl border border-emerald-200">
                  "{scoreResult.teacherFeedback?.trim() || 'Thầy ghi nhận bài làm tốt, đạt yêu cầu!'}"
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Tổng điểm chính thức: <strong>{scoreResult.finalScore} / 10.0 điểm</strong> (Trắc nghiệm: {scoreResult.mcqPoints}đ + Tự luận: {scoreResult.essayTotal}đ).
                </p>
              </div>
            ) : (
              <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 font-semibold space-y-1 text-left">
                <div className="flex items-center space-x-1.5 font-black text-amber-950 text-xs">
                  <span>📝</span>
                  <span>BÀI LÀM ĐÃ ĐƯỢC GHI NHẬN, ĐANG CHỜ GIÁO VIÊN CHẤM TỰ LUẬN</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Mã đề {scoreResult.examCode}. Thầy Trần Gia Huy đang chấm phần tự luận và sẽ công bố điểm 10 chính thức trên LMS.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer Thẻ */}
      <div className="pt-2 border-t-2 border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
        <span>Hệ thống kiểm tra trực tuyến Tin học Asian School</span>
        <span>Xác nhận: Giáo viên bộ môn Thầy Trần Gia Huy</span>
      </div>
    </div>
  );
}
