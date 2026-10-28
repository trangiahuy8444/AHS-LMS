import React from 'react';
import { useAdmin } from '../AdminContext.js';

// LƯỢT THI CHÍNH THỨC THEO MÃ LMS
export default function AttemptsCard() {
  const { maxExamAttempts, setMaxExamAttempts, attemptGrade, setAttemptGrade, attemptLms,
    setAttemptLms, attemptStatus, handleLookupAttempt, handleGrantAttempt, handleSaveMaxAttempts } = useAdmin();

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
        <span>🎫</span>
        <span>LƯỢT LÀM BÀI THI CHÍNH THỨC THEO MÃ LMS</span>
      </h3>
      <p className="text-xs text-slate-500 font-medium">
        Máy chủ đếm lượt theo mã LMS, nên đổi máy hay xóa trình duyệt cũng không được thêm lượt. Vi phạm 3 lần: bài bị khóa chờ giám thị mở khóa. Hệ thống không tự trừ điểm; số lần vi phạm hiện ở bài nộp để thầy ghi nhận.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Số lượt tối đa mỗi mã LMS:</label>
          <input
            type="number" min="1" max="10"
            value={maxExamAttempts}
            onChange={e => setMaxExamAttempts(e.target.value)}
            className="w-24 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
        <button type="button" onClick={handleSaveMaxAttempts} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition">
          Lưu
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4">
        <select
          value={attemptGrade}
          onChange={e => setAttemptGrade(e.target.value)}
          className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
        >
          <option value="8">Khối 8</option>
          <option value="9">Khối 9</option>
          <option value="10">Khối 10</option>
        </select>
        <input
          type="text"
          value={attemptLms}
          onChange={e => setAttemptLms(e.target.value)}
          placeholder="Mã LMS học sinh"
          className="w-44 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
        />
        <button type="button" onClick={handleLookupAttempt} className="px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition">
          Tra cứu
        </button>
        <button type="button" onClick={handleGrantAttempt} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition">
          Cấp thêm 1 lượt
        </button>
      </div>
      {attemptStatus && (
        <p className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">{attemptStatus}</p>
      )}
    </div>
  );
}
