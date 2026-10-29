import React from 'react';
import { useAdmin } from '../AdminContext.js';

// 1. CẤU HÌNH THỜI GIAN & CHẾ ĐỘ TRỘN ĐỀ THI
export default function ExamTimingCard() {
  const { examPeriod, setExamPeriod, examDurationMinutes, setExamDurationMinutes, practiceDurationMinutes,
    setPracticeDurationMinutes, shuffleQuestions, setShuffleQuestions, shuffleOptions,
    setShuffleOptions, requireAllQuestionsAnswered, setRequireAllQuestionsAnswered,
    lockOnExamViolation, setLockOnExamViolation, lockOnPracticeViolation, setLockOnPracticeViolation,
    handleSaveExamConfig } = useAdmin();

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
          <span>🎛️</span>
          <span>CẤU HÌNH THỜI GIAN, ĐỢT THI & CHẾ ĐỘ TRỘN ĐỀ</span>
        </h3>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
          Thời Gian Thực
        </span>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        Tùy chỉnh đợt kiểm tra đánh giá (Giữa HK1 / Cuối HK1), thời gian làm bài, thời gian ôn tập và quy chế phòng thi.
      </p>

      {/* Chọn đợt thi Giữa HK1 vs Cuối HK1 */}
      <div className="p-4 bg-blue-50/70 border-2 border-blue-200/80 rounded-2xl space-y-2">
        <label className="block text-xs font-black text-blue-950 uppercase tracking-wider">
          📅 Đợt Kiểm Tra Đánh Giá Chính Thức:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setExamPeriod('midterm')}
            className={`p-3 rounded-xl border-2 text-left font-bold text-xs transition flex items-center space-x-3 ${
              examPeriod === 'midterm'
                ? 'bg-blue-600 border-blue-700 text-white shadow'
                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
            }`}
          >
            <span className="text-xl">📝</span>
            <div>
              <div className="font-black">Kiểm Tra Giữa Học Kỳ 1</div>
              <div className={`text-[10px] ${examPeriod === 'midterm' ? 'text-blue-100' : 'text-slate-400'}`}>
                Mã đợt: GK1 • Bảng điểm: BANG_DIEM_THI_GK1
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setExamPeriod('final')}
            className={`p-3 rounded-xl border-2 text-left font-bold text-xs transition flex items-center space-x-3 ${
              examPeriod === 'final'
                ? 'bg-indigo-600 border-indigo-700 text-white shadow'
                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
            }`}
          >
            <span className="text-xl">🎓</span>
            <div>
              <div className="font-black">Kiểm Tra Cuối Học Kỳ 1</div>
              <div className={`text-[10px] ${examPeriod === 'final' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Mã đợt: CK1 • Bảng điểm: BANG_DIEM_THI_CK1
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Thời gian thi chính thức */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            ⏱️ Thời Gian Thi Chính Thức:
          </label>
          <select
            value={examDurationMinutes}
            onChange={e => setExamDurationMinutes(Number(e.target.value))}
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 font-bold focus:outline-none focus:border-blue-600"
          >
            <option value={15}>15 phút (Kiểm tra 15p)</option>
            <option value={30}>30 phút (Kiểm tra ngắn)</option>
            <option value={45}>45 phút (Chuẩn Giữa HK / Cuối HK)</option>
            <option value={60}>60 phút (Kiểm tra tăng cường)</option>
            <option value={90}>90 phút (Học kỳ chuẩn)</option>
          </select>
          <p className="text-[11px] text-slate-500 italic">
            Đồng hồ thí sinh sẽ tự động đếm ngược theo số phút này.
          </p>
        </div>

        {/* Thời gian ôn tập đề cương */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            📖 Thời Gian Ôn Tập Đề Cương:
          </label>
          <select
            value={practiceDurationMinutes}
            onChange={e => setPracticeDurationMinutes(Number(e.target.value))}
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-emerald-800 font-bold focus:outline-none focus:border-blue-600"
          >
            <option value={0}>Không giới hạn (Tự do rèn luyện 24/7)</option>
            <option value={15}>15 phút</option>
            <option value={30}>30 phút</option>
            <option value={45}>45 phút</option>
          </select>
          <p className="text-[11px] text-slate-500 italic">
            Mặc định không giới hạn để học sinh tự do ôn tập.
          </p>
        </div>

        {/* Trộn thứ tự câu hỏi */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">🔀 Trộn Đề (Xáo Trộn Câu Hỏi)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Xáo trộn vị trí các câu hỏi khi mở đề</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={e => setShuffleQuestions(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Trộn phương án A/B/C/D */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">🔠 Trộn Đáp Án (A, B, C, D)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Đổi ngẫu nhiên vị trí các lựa chọn</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={e => setShuffleOptions(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Bắt buộc trả lời tất cả các câu hỏi (Không được bỏ trống khi nộp) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between sm:col-span-2">
          <div>
            <span className="text-xs font-bold text-slate-900 block">✅ Quy Chế: Bắt Buộc Làm Hết 100% Câu Hỏi</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Không cho phép học sinh nộp bài khi còn câu hỏi hoặc phần tự luận bị bỏ trống</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={requireAllQuestionsAnswered}
              onChange={e => setRequireAllQuestionsAnswered(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Khóa màn hình khi vi phạm (Thi chính thức) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">🔒 Khóa Vi Phạm (Thi Chính Thức)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Tự động phong tỏa màn hình sau 3 lần vi phạm chuyển tab / thoát toàn màn hình (Mặc định: BẬT)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={lockOnExamViolation}
              onChange={e => setLockOnExamViolation(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Khóa màn hình khi vi phạm (Ôn tập đề cương) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">📖 Khóa Vi Phạm (Ôn Tập Đề Cương)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Mặc định TẮT (chỉ cảnh báo nhắc nhở, không khóa màn hình để học sinh tự do rèn luyện)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={lockOnPracticeViolation}
              onChange={e => setLockOnPracticeViolation(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={handleSaveExamConfig}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <span>💾</span>
          <span>Lưu Cấu Hình Thi & Trộn Đề</span>
        </button>
      </div>
    </div>
  );
}
