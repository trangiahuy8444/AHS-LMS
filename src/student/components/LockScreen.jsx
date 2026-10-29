import React from 'react';
import { useStudent } from '../StudentContext.js';

// MÀN HÌNH PHONG TỎA KHÓA BÀI THI KHI VI PHẠM 3 LẦN HOẶC GIÁM THỊ KHÓA
export default function LockScreen() {
  const { isSessionLocked, isProctorUnlocked, lockReason, handleStudentResumeFromLock, examState } = useStudent();

  // Chỉ khóa khi đang làm bài (đã nộp / bị thu bài thì hiện trang kết quả)
  if (!(isSessionLocked && examState === 'in_progress')) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-slate-900 border-4 border-red-600 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/20">
          🚨
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider">
            {lockReason === 'violation_3_times' ? 'Biên Bản Vi Phạm 3 Lần' : 'Lệnh Khóa Phòng Thi'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            BÀI THI BỊ TẠM THỜI KHÓA
          </h2>
        </div>
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-left space-y-2.5 text-xs text-red-200 leading-relaxed">
          {lockReason === 'violation_3_times' ? (
            <>
              <p className="font-bold text-red-100 flex items-center space-x-1">
                <span>⚠️</span>
                <span>Học sinh đã vi phạm quy chế an toàn bài thi 3 lần (chuyển tab / rời toàn màn hình).</span>
              </p>
              <p className="text-amber-300 font-extrabold text-sm border-t border-b border-red-800/80 py-2">
                ⚖️ HỆ THỐNG ĐÃ GHI NHẬN VI PHẠM, GIÁM THỊ SẼ XỬ LÝ THEO QUY CHẾ
              </p>
              <p>
                Bài làm của em hiện đang bị KHÓA. Em vui lòng <strong>giữ nguyên màn hình này</strong> và <strong>báo trực tiếp với Giám thị (Thầy Trần Gia Huy)</strong> để được kiểm tra và xác nhận mở khóa bài thi.
              </p>
            </>
          ) : (
            <p>
              Giám thị (Thầy Trần Gia Huy) đã tạm dừng và khóa bài thi của em. Vui lòng báo Giám thị tại phòng thi để được mở khóa.
            </p>
          )}
        </div>
        <div className="pt-2 space-y-3">
          {isProctorUnlocked ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl text-center space-y-1">
                <p className="text-emerald-300 font-black text-sm uppercase">
                  ✅ THẦY TRẦN GIA HUY ĐÃ DUYỆT MỞ KHÓA BÀI THI!
                </p>
                <p className="text-xs text-slate-200 font-medium">
                  Em hãy bấm nút dưới đây để đưa trình duyệt về chế độ <strong>Toàn Màn Hình</strong> và tiếp tục làm bài.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStudentResumeFromLock}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/40 uppercase tracking-wider transition flex items-center justify-center space-x-2 ring-4 ring-emerald-400/40"
              >
                <span>🔓</span>
                <span>BẤM VÀO ĐÂY ĐỂ VÀO LẠI TOÀN MÀN HÌNH</span>
              </button>
              <p className="text-[11px] text-slate-400 italic text-center">
                Hệ thống sẽ ngay lập tức khôi phục toàn màn hình và mở lại bài làm cho em.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl text-center space-y-2">
              <div className="inline-flex items-center space-x-2 text-amber-300 font-extrabold text-xs uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>ĐANG CHỜ GIÁO VIÊN DUYỆT MỞ KHÓA TỪ XA...</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Bài thi đang bị khóa bảo vệ. Thí sinh <strong>không thể tự mở khóa</strong>. Em hãy giữ nguyên màn hình và báo Thầy Trần Gia Huy tại phòng thi để được kiểm tra.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
