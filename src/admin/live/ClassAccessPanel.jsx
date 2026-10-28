import React from 'react';
import { useAdmin } from '../AdminContext.js';

// BẢNG ĐIỀU PHỐI CA THI THEO LỚP HỌC (CLASS ACCESS CONTROL MATRIX)
export default function ClassAccessPanel() {
  const { config, ALL_CLASSES_BY_GRADE, handleSetClassMode, handleQuickStartExam,
    handleCloseAllExams } = useAdmin();

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🎛️</span>
          <div>
            <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider">
              ĐIỀU PHỐI CA THI THEO TỪNG LỚP HỌC
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Bật/Tắt độc lập: Lớp nào đến giờ thi thì mở ca thi chính thức; các lớp khác vẫn tự do ôn tập 24/7.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCloseAllExams}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center space-x-1"
        >
          <span>🔄</span>
          <span>Đóng Toàn Bộ Ca Thi (Về Ôn Tập)</span>
        </button>
      </div>
      <div className="space-y-3">
        {[8, 9, 10].map(g => (
          <div key={g} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-black text-xs text-blue-900 uppercase w-20 shrink-0">Khối {g}:</span>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {(ALL_CLASSES_BY_GRADE[g] || []).map(cls => {
                const accessMode = (config.classAccessControl && config.classAccessControl[cls]) || config.defaultClassMode || 'practice_only';
                const isExam = accessMode === 'exam_only';
                const isBoth = accessMode === 'both_open';
                const isClosed = accessMode === 'closed';
                return (
                  <div
                    key={cls}
                    className={`px-3 py-1.5 rounded-xl border text-xs flex items-center space-x-2 transition shadow-sm ${
                      isExam
                        ? 'bg-red-50 border-red-400 text-red-800 ring-1 ring-red-400/50'
                        : (isBoth
                            ? 'bg-amber-50 border-amber-400 text-amber-800'
                            : (isClosed
                                ? 'bg-slate-100 border-slate-300 text-slate-400'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-800'))
                    }`}
                  >
                    <span className="font-extrabold font-mono-code">{cls}</span>
                    <span className="text-[10px] font-bold">
                      {isExam ? '🔴 Đang Thi' : (isBoth ? '🟡 Cả 2' : (isClosed ? '⚫ Khóa' : '🟢 Ôn Tập'))}
                    </span>
                    {isExam ? (
                      <button
                        type="button"
                        onClick={() => handleSetClassMode(cls, 'practice_only')}
                        className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 transition"
                      >
                        Tắt Thi
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickStartExam(cls)}
                        className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-[10px] font-black text-white transition shadow"
                      >
                        Bật Thi
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
