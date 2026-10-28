import React from 'react';
import { useAdmin } from '../AdminContext.js';

// 2. TÀI KHOẢN GIÁO VIÊN & KHO MÃ ĐỀ CHÍNH THỨC
export default function ExamBankCard() {
  const { teacherEmail, config, examBankStatus, handleLogout, handleUploadExamBank,
    handleToggleExamBankLock, handleToggleExamCode } = useAdmin();

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
        <span>🛡️</span>
        <span>TÀI KHOẢN GIÁO VIÊN & KHO MÃ ĐỀ CHÍNH THỨC</span>
      </h3>
      <p className="text-xs text-slate-600">
        Đang đăng nhập: <strong>{teacherEmail}</strong>
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition"
      >
        Đăng Xuất
      </button>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <p className="text-xs text-slate-500 font-medium">
          Mã đề kèm đáp án chỉ lưu trên Firestore (exam_bank), không nằm trong mã nguồn công khai.
          Chọn tệp JSON dạng {'{ "grade": 9, "officialExams": { "101": {...} } }'}, ví dụ tệp do scripts/tach_ma_de_chinh_thuc.cjs tạo ra.
        </p>
        <button
          type="button"
          onClick={handleToggleExamBankLock}
          className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition ${config.examBankLocked ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          {config.examBankLocked ? '🔒 Kho đề đang khóa — bấm để mở khóa' : '🔓 Khóa kho đề (giữ nguyên mã đề)'}
        </button>
        <input
          type="file"
          accept="application/json,.json"
          onChange={handleUploadExamBank}
          disabled={!!config.examBankLocked}
          className="block disabled:opacity-40 text-xs text-slate-700 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white file:font-bold"
        />
        {examBankStatus && (
          <pre className="text-xs whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-xl p-3">{examBankStatus}</pre>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[8, 9, 10].map(g => {
            const exams = (window['EXAM_DATA_G' + g] && window['EXAM_DATA_G' + g].officialExams) || {};
            return (
              <div key={g} className="border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                <div className="font-bold text-blue-950">Khối {g}</div>
                {Object.keys(exams).length === 0 && <div className="text-slate-400 italic">Chưa có mã đề</div>}
                {Object.keys(exams).sort().map(code => (
                  <label key={code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exams[code].active !== false}
                      onChange={e => handleToggleExamCode(g, code, e.target.checked)}
                    />
                    <span>Mã {code} {exams[code].active === false ? '(đang tắt)' : ''}</span>
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
