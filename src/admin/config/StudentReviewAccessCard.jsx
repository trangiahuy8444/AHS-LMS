import React from 'react';
import { useAdmin } from '../AdminContext.js';

// CẤU HÌNH QUYỀN XEM LẠI BÀI THI & CHỐT ĐIỂM CHÍNH THỨC
export default function StudentReviewAccessCard() {
  const { allowStudentReviewOfficialExam, setAllowStudentReviewOfficialExam, setConfig,
    showToast } = useAdmin();

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
        ? 'Đã MỞ quyền cho học sinh xem lại bài thi và đối soát chốt điểm!'
        : 'Đã KHÓA quyền xem lại bài thi. Chi tiết bài làm đang được bảo mật tuyệt đối.',
      'success',
      newValue ? 'Mở Xem Lại Bài Thi 🔓' : 'Khóa Xem Lại Bài Thi 🔒'
    );
  };

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
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
          {allowStudentReviewOfficialExam ? 'Đang Mở Xem Lại' : 'Đang Khóa Xem Lại'}
        </span>
      </div>

      <p className="text-xs text-slate-600 font-medium leading-relaxed">
        Quy chế bảo mật khảo thí Asian School: Trong suốt ca thi, chi tiết câu hỏi và đáp án được bảo mật tuyệt đối (học sinh chỉ thấy điểm trắc nghiệm sau khi nộp). Sau khi toàn bộ ca thi hoàn tất, Thầy kích hoạt nút mở dưới đây để học sinh đối soát và bấm xác nhận chốt điểm.
      </p>

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
                ? 'HỌC SINH ĐƯỢC PHÉP XEM LẠI BÀI THI & CHỐT ĐIỂM'
                : 'ĐANG BẢO MẬT ĐỀ THI (HỌC SINH CHỈ THẤY ĐIỂM TRẮC NGHIỆM)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {allowStudentReviewOfficialExam
              ? 'Học sinh có thể mở xem lại câu hỏi, lựa chọn đã làm và bấm "Xác nhận điểm số chính xác".'
              : 'Nội dung câu hỏi và bài làm bị ẩn trên màn hình kết quả của học sinh.'}
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
          <span>{allowStudentReviewOfficialExam ? '🔒 Khóa Lại Ngay' : '🔓 Mở Cho Học Sinh Xem Lại'}</span>
        </button>
      </div>
    </div>
  );
}
