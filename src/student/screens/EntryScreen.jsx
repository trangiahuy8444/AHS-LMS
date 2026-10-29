import React from 'react';
import { useStudent } from '../StudentContext.js';
import { CLASS_LISTS } from '../constants.js';

// 1. MÀN HÌNH CHỌN CHẾ ĐỘ & ĐĂNG KÝ VÀO PHÒNG LÀM BÀI
export default function EntryScreen() {
  const { grade, setGrade, mode, setMode, examState, fullName, setFullName, studentClass,
    setStudentClass, studentId, setStudentId, isContactingServer, examPasswordInput,
    setExamPasswordInput, showExamPassword, setShowExamPassword, showDialog, classAccessMode,
    handleStart } = useStudent();

  if (!(examState === 'entry')) return null;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 text-center">
        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-widest inline-block mb-2">
          CỔNG KHẢO THÍ HỌC SINH
        </span>
        <h2 className="text-xl sm:text-2xl font-black">XÁC THỰC THÔNG TIN HỌC SINH</h2>
        <p className="text-xs sm:text-sm text-blue-200 mt-1 font-medium">
          Bộ Môn Tin Học — Năm Học 2026 - 2027
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
      
        {/* Chọn Chế Độ: Ôn Tập hay Thi */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Chọn Mục Đích Làm Bài <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
              Lớp {studentClass}: {
                classAccessMode === 'exam_only' ? '🔴 Đang trong ca thi' :
                (classAccessMode === 'practice_only' ? '🟢 Đang mở ôn tập' :
                (classAccessMode === 'both_open' ? '🟡 Mở cả 2 chế độ' : '⚫ Đang đóng cổng'))
              }
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* NÚT ÔN TẬP ĐỀ CƯƠNG */}
            <button
              type="button"
              onClick={() => {
                if (classAccessMode === 'exam_only') {
                  showDialog('Lớp Đang Trong Ca Thi Chính Thức', `Lớp ${studentClass} hiện đang trong ca kiểm tra 45 phút! Chế độ ôn tập đang tạm đóng để các em tập trung làm bài thi.`, 'warning');
                  return;
                }
                setMode('practice');
              }}
              disabled={classAccessMode === 'closed'}
              className={`p-4 rounded-2xl border-2 text-left transition relative ${
                classAccessMode === 'exam_only'
                  ? 'opacity-40 border-slate-200 bg-slate-100 cursor-not-allowed'
                  : (mode === 'practice'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50')
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📖</span>
                <span className="font-bold text-sm text-blue-950">ÔN TẬP ĐỀ CƯƠNG</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                {grade === 10
                  ? 'Bộ đề ngẫu nhiên: 19 câu Trắc nghiệm + 3 câu Đúng/Sai (tính điểm thang 10) + 3 câu Tự luận để tự luyện (không tính điểm).'
                  : 'Bộ đề ngẫu nhiên: 28 câu Trắc nghiệm (tính điểm thang 10) + 3 câu Tự luận để tự luyện (không tính điểm).'
                }
              </p>
              {classAccessMode === 'exam_only' && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  ⚠️ Tạm đóng (Lớp đang thi)
                </span>
              )}
            </button>

            {/* NÚT THI GIỮA HK1 */}
            <button
              type="button"
              onClick={() => {
                if (classAccessMode === 'practice_only') {
                  showDialog('Ca Thi Chưa Bắt Đầu', `Ca thi chính thức của Lớp ${studentClass} chưa bắt đầu.\n\nEm vui lòng chọn "ÔN TẬP ĐỀ CƯƠNG" để luyện tập trước nhé!`, 'info');
                  return;
                }
                setMode('exam');
              }}
              disabled={classAccessMode === 'closed'}
              className={`p-4 rounded-2xl border-2 text-left transition relative ${
                classAccessMode === 'practice_only'
                  ? 'opacity-40 border-slate-200 bg-slate-100 cursor-not-allowed'
                  : (mode === 'exam'
                      ? 'border-red-600 bg-red-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50')
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📝</span>
                <span className="font-bold text-sm text-red-950">THI GIỮA HK1</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Kiểm tra chính thức 45 phút, cần mật khẩu phòng thi, bảo mật chống gian lận đa tầng.
              </p>
              {classAccessMode === 'practice_only' && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                  🔒 Chưa mở ca thi của lớp
                </span>
              )}
              {classAccessMode === 'exam_only' && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                  🔴 Ca thi đang diễn ra!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Chọn Khối */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Chọn Khối Lớp <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[8, 9, 10].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`py-3 rounded-2xl font-black text-sm border-2 transition ${
                  grade === g
                    ? 'border-blue-700 bg-blue-700 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                Khối {g}
              </button>
            ))}
          </div>
        </div>

        {/* Nhập Thông tin Học sinh */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Họ và tên học sinh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              onBlur={e => window.AsianSchoolNormalize && setFullName(window.AsianSchoolNormalize.normalizeStudentName(e.target.value))}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-class-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lớp học <span className="text-red-500">*</span>
              </label>
              <select
                id="student-class-select"
                value={studentClass}
                onChange={e => setStudentClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white text-slate-900"
              >
                {(CLASS_LISTS[grade] || []).map(cls => (
                  <option key={cls} value={cls}>Lớp {cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mã LMS (Học sinh - chỉ nhập số) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={studentId}
                onChange={e => {
                  const val = e.target.value;
                  // Tự động giữ lại số khi gõ
                  setStudentId(window.AsianSchoolNormalize ? window.AsianSchoolNormalize.normalizeLmsCode(val) : val.replace(/\D/g, ''));
                }}
                onBlur={e => window.AsianSchoolNormalize && setStudentId(window.AsianSchoolNormalize.normalizeLmsCode(e.target.value))}
                placeholder="Ví dụ: 123456 (chỉ nhập số)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold font-mono-code bg-white text-slate-900"
              />
            </div>
          </div>

          {/* MẬT KHẨU PHÒNG THI (KHI CHỌN CHẾ ĐỘ THI CHÍNH THỨC) */}
          {mode === 'exam' && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>🔒 Mật Khẩu Phòng Thi (Do Giám thị cấp) <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  type={showExamPassword ? 'text' : 'password'}
                  value={examPasswordInput}
                  onChange={e => setExamPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu phòng thi..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-semibold font-mono-code bg-red-50/40 text-slate-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowExamPassword(prev => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  {showExamPassword ? 'ẨN' : 'HIỆN'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KHUNG HƯỚNG DẪN THỰC TẾ TRÊN LMS ASIAN SCHOOL */}
        {mode === 'practice' ? (
          <div className="border-2 border-blue-400 bg-blue-50/70 rounded-2xl p-4 text-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📌</span>
              <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                HƯỚNG DẪN VÀ ĐIỀU KIỆN HOÀN THÀNH (LMS)
              </h4>
            </div>
            <div className="text-xs space-y-1.5 pl-7 text-slate-700 font-medium">
              <p>📖 <strong className="text-blue-900">Tài liệu cho phép:</strong> Chỉ được sử dụng <strong>Sách giáo khoa</strong> trong quá trình làm bài.</p>
              <p>🎯 <strong className="text-blue-900">Yêu cầu đạt:</strong> Học sinh cần hoàn thành bài làm đạt từ <strong>6.0 điểm trở lên</strong> ít nhất <strong>5 lần</strong>.</p>
              <p className="text-amber-800 font-bold pt-0.5">💡 Sau khi nộp bài, hệ thống sẽ mở hướng dẫn chấm Rubric phần Tự luận để học sinh đối chiếu bài làm.</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-red-400 bg-red-50/60 rounded-2xl p-4 text-slate-800 space-y-3">
            <div className="text-center pb-2 border-b border-red-200">
              <h4 className="text-sm font-black text-red-700 flex items-center justify-center space-x-1.5">
                <span>📝</span>
                <span>BÀI KIỂM TRA GIỮA HỌC KỲ 1</span>
              </h4>
              <p className="text-[11px] text-red-600 font-semibold mt-0.5">⏱ Thời gian làm bài: 45 Phút</p>
            </div>
            <div className="text-xs space-y-1.5 leading-relaxed text-slate-700 font-medium">
              <p className="font-extrabold text-red-900 uppercase">🎴 KỶ LUẬT & NỘI QUY PHÒNG THI</p>
              <ul className="space-y-1 pl-2">
                <li>• <strong className="text-red-700">❌ Không sử dụng tài liệu:</strong> Vi phạm sẽ nhận <strong className="text-red-700">0 điểm</strong>.</li>
                <li>• <strong className="text-red-700">🚫 Không chuyển TAB/Trình duyệt:</strong> Mỗi lần rời bài đều bị <strong className="text-red-700">ghi nhận vi phạm</strong>.</li>
                <li>• <strong className="text-amber-800">⚠️ Nhắc nhở nội quy:</strong> Bị nhắc nhở <strong>3 lần</strong> thì bài bị <strong className="text-red-700">khóa, chờ giám thị xử lý</strong>.</li>
              </ul>
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 mt-2 font-semibold">
                <strong>🔌 LƯU Ý AN TOÀN THIẾT BỊ:</strong> Không chạm vào thùng máy (CPU), dây nguồn hoặc dây mạng. Mọi sự cố cần giơ tay báo ngay cho Giám thị.
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={isContactingServer}
          className={`w-full py-4 disabled:opacity-60 text-white font-black rounded-2xl shadow-lg transition duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base uppercase tracking-wider ${
            mode === 'exam'
              ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
          }`}
        >
          <span>{isContactingServer ? 'ĐANG KẾT NỐI MÁY CHỦ...' : (mode === 'exam' ? 'BẮT ĐẦU VÀO PHÒNG THI' : 'BẮT ĐẦU ÔN TẬP ĐỀ CƯƠNG')}</span>
          <span>→</span>
        </button>
        <p className="text-[11px] text-slate-500 italic mt-2 text-center">
          🖥️ Hệ thống sẽ tự động chuyển sang chế độ <strong>Toàn Màn Hình</strong> ngay khi bấm bắt đầu làm bài.
        </p>
      </div>
    </div>
  );
}
