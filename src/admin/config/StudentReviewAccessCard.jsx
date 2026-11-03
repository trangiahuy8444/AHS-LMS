import React from 'react';
import { useAdmin } from '../AdminContext.js';

// CẤU HÌNH QUYỀN XEM LẠI BÀI THI & CHỐT ĐIỂM CHÍNH THỨC
export default function StudentReviewAccessCard() {
  const {
    config,
    allowStudentReviewOfficialExam,
    setAllowStudentReviewOfficialExam,
    setConfig,
    showToast,
    ALL_CLASSES_BY_GRADE,
    handleSetClassReviewMode,
    handleSetGradeReviewMode
  } = useAdmin();

  const handleToggle = (newValue) => {
    setAllowStudentReviewOfficialExam(newValue);
    if (window.AsianSchoolStorage) {
      const updated = window.AsianSchoolStorage.saveConfig({
        allowStudentReviewOfficialExam: newValue
      });
      setConfig(updated);
    }
    showToast(
      newValue
        ? 'Đã MỞ quyền cho học sinh toàn trường xem lại bài thi và đối soát chốt điểm!'
        : 'Đã KHÓA quyền xem lại bài thi toàn trường.',
      'success',
      newValue ? 'Mở Xem Lại Bài Thi 🔓' : 'Khóa Xem Lại Bài Thi 🔒'
    );
  };

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
          <span>{allowStudentReviewOfficialExam ? '🔓' : '🔒'}</span>
          <span>QUYỀN XEM LẠI BÀI THI CHÍNH THỨC & CHỐT ĐIỂM</span>
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          allowStudentReviewOfficialExam
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          {allowStudentReviewOfficialExam ? 'Đang Mở Toàn Trường' : 'Quản Lý Theo Lớp'}
        </span>
      </div>

      <p className="text-xs text-slate-600 font-medium leading-relaxed">
        Quy chế bảo mật khảo thí Asian School: Trong suốt ca thi, chi tiết câu hỏi và đáp án được bảo mật tuyệt đối (học sinh chỉ thấy điểm trắc nghiệm sau khi nộp). Thầy có thể mở chốt điểm cho <strong>từng lớp riêng biệt</strong> ngay khi chấm xong bài tự luận của lớp đó mà không ảnh hưởng tới các lớp khác.
      </p>

      {/* CÔNG TẮC CHỦ TOÀN TRƯỜNG */}
      <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
        allowStudentReviewOfficialExam
          ? 'bg-emerald-50/80 border-emerald-300'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{allowStudentReviewOfficialExam ? '🟢' : '⚪'}</span>
            <span className="text-xs font-black text-slate-900 uppercase">
              {allowStudentReviewOfficialExam
                ? 'ĐANG MỞ CHỐT ĐIỂM CHO TOÀN BỘ CÁC LỚP TRÊN HỆ THỐNG'
                : 'MỞ CHỐT ĐIỂM RIÊNG TỪNG LỚP (KHUYẾN NGHỊ)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {allowStudentReviewOfficialExam
              ? 'Tất cả học sinh mọi khối lớp đều có thể vào xem chi tiết bài làm và bấm xác nhận điểm.'
              : 'Chỉ các lớp được Thầy bật nút "Mở Chốt Điểm" bên dưới mới được phép xem bài làm.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleToggle(!allowStudentReviewOfficialExam)}
          className={`shrink-0 px-5 py-2.5 rounded-xl font-black text-xs transition shadow-sm flex items-center space-x-1.5 ${
            allowStudentReviewOfficialExam
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              : 'bg-[#0267B1] hover:bg-[#025694] text-white shadow-blue-700/20'
          }`}
        >
          <span>{allowStudentReviewOfficialExam ? '🔒 Khóa Toàn Bộ Trường' : '🔓 Mở Tất Cả Các Lớp'}</span>
        </button>
      </div>

      {/* PHÂN QUYỀN CHỐT ĐIỂM THEO TỪNG LỚP HỌC */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-wider flex items-center space-x-1.5">
            <span>📋</span>
            <span>Mở Chức Năng Xác Định Điểm Theo Từng Lớp:</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            (Bấm vào từng lớp để Bật/Tắt độc lập)
          </span>
        </div>

        <div className="space-y-2.5">
          {[8, 9, 10].map(g => (
            <div key={g} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center justify-between sm:justify-start space-x-2 w-32 shrink-0">
                <span className="font-black text-xs text-blue-900 uppercase">Khối {g}:</span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => handleSetGradeReviewMode(g, true)}
                    className="px-1.5 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-[10px] font-black text-indigo-800 transition"
                  >
                    + Mở
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetGradeReviewMode(g, false)}
                    className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 transition"
                  >
                    Khóa
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {(ALL_CLASSES_BY_GRADE?.[g] || []).map(cls => {
                  const isClassOpen = Boolean(allowStudentReviewOfficialExam || config?.classReviewControl?.[cls]);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleSetClassReviewMode(cls, !isClassOpen)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                        isClassOpen
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-400/40'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                      title={isClassOpen ? `Lớp ${cls}: Đang mở chốt điểm. Bấm để khóa lại.` : `Lớp ${cls}: Đang khóa. Bấm để mở chốt điểm.`}
                    >
                      <span className="font-mono-code">{cls}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        isClassOpen ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {isClassOpen ? '✓ Đang Mở' : 'Khóa'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
