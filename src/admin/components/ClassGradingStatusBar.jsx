import { isRecoveredAssessment } from '../../shared/recoveredAssessment.js';
import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';

export default function ClassGradingStatusBar() {
  const {
    submissions,
    filterClass,
    filterGrade,
    geminiApiKey,
    batchGradingState,
    handleStartBatchGrading,
    handleCancelBatchGrading,
    showDialog
  } = useAdmin();

  const [onlyPending, setOnlyPending] = useState(true);

  // Lọc danh sách bài thi chính thức trong phạm vi lớp / khối đang chọn
  const examSubmissions = (submissions || []).filter(sub => {
    if (sub.mode !== 'exam') return false;
    if (filterClass !== 'all' && sub.studentClass !== filterClass) return false;
    if (filterGrade !== 'all' && Number(sub.grade || (sub.studentClass ? sub.studentClass.split('/')[0] : 0)) !== Number(filterGrade)) return false;
    return true;
  });

  const totalSubs = examSubmissions.length;
  const recoveredRows = examSubmissions.filter(isRecoveredAssessment);
  const recoveryClass = filterClass === '8/21' && recoveredRows.length > 0;
  const proposalCount = recoveredRows.filter(row => row.aiEssayProposal).length;
  const gradedSubs = examSubmissions.filter(s => Boolean(s.isGraded) && (!isRecoveredAssessment(s) || Boolean(s.teacherApprovedAt))).length;
  const pendingSubs = totalSubs - gradedSubs;
  const progressPercent = totalSubs > 0 ? Math.round((gradedSubs / totalSubs) * 100) : 100;

  const isRunning = Boolean(batchGradingState?.isRunning);

  const onStartBatch = () => {
    if (filterClass === 'all') {
      showDialog(
        'Chọn Lớp Để Chấm Nhanh 📋',
        'Thầy vui lòng chọn một lớp cụ thể trong bộ lọc "Lớp Học" (ví dụ: Lớp 8/19, 8/20...) trước khi bấm Chấm Nhanh nhé!',
        'warning'
      );
      return;
    }
    handleStartBatchGrading(filterClass, onlyPending);
  };

  return (
    <div className="space-y-3">
      {/* 1. THANH TIẾN ĐỘ CHẤM TỔNG QUAN THEO LỚP */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 rounded-3xl border-2 border-indigo-800/40 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black uppercase tracking-wide text-indigo-100">
                  Tiến Độ Chấm Tự Luận {filterClass !== 'all' ? `Lớp ${filterClass}` : 'Các Lớp'}
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  totalSubs === 0
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : pendingSubs === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {totalSubs === 0 ? 'Chưa có bài thi' : (pendingSubs === 0 ? (recoveryClass ? '✓ THẦY ĐÃ DUYỆT ĐỦ' : '✓ ĐÃ CHẤM XONG 100%') : `⏳ CÒN ${pendingSubs} BÀI ${recoveryClass ? 'CHỜ THẦY DUYỆT' : 'CHỜ CHẤM'}`)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                {recoveryClass ? `AI đã đề xuất: ${proposalCount} bài. Thầy kiểm tra và duyệt từng bài trước khi công nhận điểm.` : 'Trợ lý Gemini chấm điểm theo barem hướng dẫn Asian School'}
              </p>
            </div>
          </div>

          {/* CÁC NÚT THAO TÁC CHẤM NHANH */}
          <div className="flex flex-wrap items-center gap-2">
            {filterClass !== 'all' && (
              <label className="flex items-center space-x-1.5 text-xs text-indigo-200 bg-slate-800/60 hover:bg-slate-800 px-3 py-2 rounded-xl border border-indigo-700/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyPending}
                  onChange={e => setOnlyPending(e.target.checked)}
                  disabled={isRunning}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span className="font-semibold text-[11px]">{recoveryClass ? 'Chỉ bài chờ thầy duyệt' : 'Chỉ bài chưa chấm'}</span>
              </label>
            )}

            <button
              type="button"
              onClick={onStartBatch}
              disabled={isRunning || (filterClass !== 'all' && onlyPending && pendingSubs === 0)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition shadow flex items-center space-x-2 ${
                isRunning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : filterClass === 'all'
                  ? 'bg-indigo-700 hover:bg-indigo-600 text-white'
                  : (onlyPending && pendingSubs === 0)
                  ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-500/30'
              }`}
            >
              <span>{isRunning ? '⏳' : '⚡'}</span>
              <span>
                {isRunning
                  ? (recoveryClass ? 'Đang tạo đề xuất AI...' : 'Đang Chấm Cả Lớp...')
                  : filterClass === 'all'
                  ? '⚡ Chấm Nhanh (Chọn Lớp)'
                  : (onlyPending && pendingSubs === 0)
                  ? (recoveryClass ? '✓ Thầy đã duyệt đủ' : '✓ Lớp Đã Chấm Xong')
                  : (recoveryClass ? `Tạo đề xuất AI lớp ${filterClass} (${onlyPending ? pendingSubs : totalSubs} bài)` : `⚡ Chấm Nhanh Cả Lớp ${filterClass} (${onlyPending ? pendingSubs : totalSubs} bài)`)}
              </span>
            </button>
          </div>
        </div>

        {/* THANH TRẠNG THÁI TIẾN ĐỘ TRỰC QUAN */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300">
              {recoveryClass ? 'Thầy đã duyệt:' : 'Đã chấm:'} <strong className="text-white">{gradedSubs}</strong> / <strong className="text-white">{totalSubs}</strong> bài nộp
            </span>
            <span className="font-mono text-emerald-400 font-black">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-slate-800/90 rounded-full h-3.5 p-0.5 border border-indigo-800/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 to-teal-300 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. THANH TIẾN TRÌNH TRỰC TIẾP KHI ĐANG CHẤM NHANH (LIVE BATCH PROGRESS) */}
      {isRunning && (
        <div className="p-4 bg-indigo-950 border-2 border-indigo-400/80 rounded-3xl shadow-xl text-white space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              <h4 className="font-black text-xs uppercase tracking-wide text-indigo-100">
                {recoveryClass ? 'Đang tạo đề xuất Gemini AI — chưa công nhận điểm' : 'Đang Tự Động Chấm Điểm Gemini AI'} — Lớp {batchGradingState.targetClass}
              </h4>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-200">
                Bài {batchGradingState.currentIndex + 1} / {batchGradingState.totalCount} ({batchGradingState.percent}%)
              </span>
              <button
                type="button"
                onClick={handleCancelBatchGrading}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-xl transition shadow"
              >
                🛑 Dừng Quá Trình
              </button>
            </div>
          </div>

          {/* Chi tiết học sinh đang được chấm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-indigo-900/40 p-3 rounded-2xl border border-indigo-800/50">
            <div>
              <div className="text-[11px] text-indigo-300 font-bold uppercase">Học sinh đang chấm:</div>
              <div className="text-sm font-black text-white mt-0.5">
                {batchGradingState.currentStudentName}
                {batchGradingState.currentStudentId && (
                  <span className="ml-2 font-mono text-xs text-indigo-300 font-normal">
                    (Mã LMS: {batchGradingState.currentStudentId})
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-indigo-300 font-bold uppercase">Tiến trình câu hỏi:</div>
              <div className="text-sm font-black text-emerald-300 mt-0.5">
                {batchGradingState.totalQuestionsInSub > 0
                  ? `Đang đối soát barem Câu ${batchGradingState.currentQuestionIndex}/${batchGradingState.totalQuestionsInSub}...`
                  : 'Đang chuẩn bị đề bài...'}
              </div>
            </div>
          </div>

          {/* Thanh phần trăm động */}
          <div className="space-y-1">
            <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-indigo-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${batchGradingState.percent}%` }}
              />
            </div>
          </div>

          {/* Thống kê nhanh */}
          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold">
              {recoveryClass ? '✓ Đã tạo đề xuất:' : '✓ Hoàn tất:'} {batchGradingState.completedCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 font-bold">
              ⚪ Bỏ trống: {batchGradingState.skippedBlankCount}
            </span>
            {batchGradingState.errorCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-900/60 text-rose-300 border border-rose-700/60 font-bold">
                ⚠️ Lỗi: {batchGradingState.errorCount}
              </span>
            )}
          </div>

          {/* Nhật ký live các học sinh vừa chấm */}
          {Array.isArray(batchGradingState.logs) && batchGradingState.logs.length > 0 && (
            <div className="mt-2 bg-slate-950/80 p-2.5 rounded-xl border border-indigo-900/80 max-h-28 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
              {batchGradingState.logs.slice(0, 5).map((log, lIdx) => (
                <div key={lIdx} className="leading-tight text-slate-200">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}