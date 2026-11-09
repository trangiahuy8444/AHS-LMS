import React from 'react';
import { useAdmin } from '../AdminContext.js';
import { getStudentsByClass } from '../../core/roster-data.js';
import { classSubmissionProgress } from './classAttendance.js';

// BẢNG ĐIỀU PHỐI CA THI & CHỐT ĐIỂM THEO LỚP HỌC (CLASS ACCESS CONTROL MATRIX)
export default function ClassAccessPanel() {
  const {
    config,
    ALL_CLASSES_BY_GRADE,
    submissions,
    handleSetClassMode,
    handleQuickStartExam,
    handleCloseAllExams,
    handleSetClassReviewMode,
    handleSetGradeReviewMode,
    handleSetAllClassReviewMode
  } = useAdmin();

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🎛️</span>
          <div>
            <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider">
              ĐIỀU PHỐI CA THI & CHỐT ĐIỂM THEO TỪNG LỚP HỌC
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Bật/Tắt độc lập: Lớp nào thi thì mở ca thi; lớp nào Thầy chấm xong thì mở chức năng xem bài & chốt điểm cho học sinh lớp đó.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCloseAllExams}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center space-x-1"
          >
            <span>🔄</span>
            <span>Đóng Ca Thi (Về Ôn Tập)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetAllClassReviewMode(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 transition flex items-center space-x-1"
          >
            <span>📋</span>
            <span>Mở Chốt Điểm Tất Cả Lớp</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetAllClassReviewMode(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold border border-slate-300 transition flex items-center space-x-1"
          >
            <span>🔒</span>
            <span>Khóa Chốt Điểm</span>
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {[8, 9, 10].map(g => (
          <div key={g} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-2 w-32 shrink-0">
              <span className="font-black text-xs text-blue-900 uppercase">Khối {g}:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => handleSetGradeReviewMode(g, true)}
                  className="px-1.5 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-[10px] font-black text-indigo-800 transition"
                  title={`Mở chốt điểm cho tất cả các lớp Khối ${g}`}
                >
                  + Mở K{g}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetGradeReviewMode(g, false)}
                  className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 transition"
                  title={`Khóa chốt điểm cho Khối ${g}`}
                >
                  Khóa
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {(ALL_CLASSES_BY_GRADE[g] || []).map(cls => {
                const accessMode = (config.classAccessControl && config.classAccessControl[cls]) || config.defaultClassMode || 'practice_only';
                const isExam = accessMode === 'exam_only';
                const isBoth = accessMode === 'both_open';
                const isClosed = accessMode === 'closed';
                const isReviewOpen = Boolean(config.allowStudentReviewOfficialExam || (config.classReviewControl && config.classReviewControl[cls]));
                const roster = getStudentsByClass(cls);
                const progress = classSubmissionProgress(submissions || [], cls, roster, 'exam');
                const isExamFinished = isExam && progress.submitted > 0 && progress.total !== null && progress.submitted >= progress.total;

                return (
                  <div
                    key={cls}
                    className={`px-3 py-2 rounded-xl border text-xs flex flex-wrap items-center gap-1.5 transition shadow-sm ${
                      isExamFinished
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : (isExam
                            ? 'bg-red-50 border-red-400 text-red-800 ring-1 ring-red-400/50'
                            : (isBoth
                                ? 'bg-amber-50 border-amber-400 text-amber-800'
                                : (isClosed
                                    ? 'bg-slate-100 border-slate-300 text-slate-400'
                                    : 'bg-white border-slate-200 text-slate-800')))
                    }`}
                  >
                    <span className="font-black font-mono-code text-slate-900">{cls}</span>
                    {isExamFinished ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                        ✅ Đã thi xong ({progress.submitted}/{progress.total})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600">
                        {isExam ? `🔴 Thi ${progress.submitted > 0 ? `(${progress.submitted}/${progress.total ?? '—'})` : ''}` : (isBoth ? '🟡 Cả 2' : (isClosed ? '⚫ Khóa' : '🟢 Ôn'))}
                      </span>
                    )}
                    {isExam ? (
                      <button
                        type="button"
                        onClick={() => handleSetClassMode(cls, 'practice_only')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          isExamFinished
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                        title={isExamFinished ? 'Cả lớp đã nộp bài, chuyển về ôn tập' : 'Tắt ca thi'}
                      >
                        {isExamFinished ? 'Đóng Thi (Về Ôn)' : 'Tắt Thi'}
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

                    {/* Nút bật/tắt chức năng xác định điểm theo lớp */}
                    <button
                      type="button"
                      onClick={() => handleSetClassReviewMode(cls, !isReviewOpen)}
                      className={`px-2 py-0.5 rounded text-[10px] font-black transition flex items-center space-x-1 ${
                        isReviewOpen
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                      title={isReviewOpen ? `Bấm để KHÓA xem bài Lớp ${cls}` : `Bấm để MỞ xem bài & chốt điểm cho Lớp ${cls}`}
                    >
                      <span>{isReviewOpen ? '📋 Chốt Điểm: MỞ' : '📋 Mở Chốt Điểm'}</span>
                    </button>
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
