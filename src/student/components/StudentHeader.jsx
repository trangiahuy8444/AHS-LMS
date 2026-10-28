import React from 'react';
import { useStudent } from '../StudentContext.js';

// HEADER CHÍNH — NỀN TRẮNG SÁNG, LOGO TO RÕ, ĐỘ TƯƠNG PHẢN CAO, RESPONSIVE ĐA THIẾT BỊ
export default function StudentHeader() {
  const { mode, examState, timeLeftStr, violations, elapsedSeconds, formatElapsed, config } = useStudent();

  return (
    <header className="border-b bg-white border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
          <img
            src={window.ASIAN_SCHOOL_LOGO_BASE64 || "../assets/logo_asian_school.png"}
            alt="Logo Trường Quốc Tế Á Châu"
            className="h-9 sm:h-12 md:h-14 w-auto object-contain drop-shadow-sm shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="min-w-0 truncate">
            <h1 className="font-black text-xs sm:text-sm md:text-base text-blue-950 leading-tight uppercase truncate">
              TRƯỜNG QUỐC TẾ Á CHÂU
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wide hidden sm:block truncate">
              Bộ Môn Tin Học — Cổng Ôn Tập & Kiểm Tra Giữa HK1 (2026 - 2027)
            </p>
          </div>
        </div>

        {examState === 'in_progress' && (
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {mode === 'exam' ? (
              <div className="flex items-center space-x-1 sm:space-x-2 bg-red-50 border-2 border-red-500 text-red-700 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl font-mono-code font-black text-xs sm:text-sm shadow-sm">
                <span className="text-sm">⏱️</span>
                <span className="hidden xs:inline sm:inline text-[11px] font-sans font-bold text-red-600">Còn:</span>
                <span>{timeLeftStr}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-emerald-50 border-2 border-emerald-400 text-emerald-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold shadow-sm">
                <span>⏱️</span>
                <span className="hidden sm:inline font-bold">Thời gian:</span>
                <span className="font-mono-code font-black text-emerald-900">
                  {config.practiceDurationMinutes > 0 ? timeLeftStr : formatElapsed(elapsedSeconds)}
                </span>
              </div>
            )}

            {violations > 0 && (
              <div className="bg-amber-100 border border-amber-300 text-amber-900 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center space-x-1">
                <span>⚠️</span>
                <span className="hidden sm:inline">Vi phạm:</span>
                <span>{violations}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
