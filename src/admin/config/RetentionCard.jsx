import React from 'react';
import { useAdmin } from '../AdminContext.js';

// 4. QUẢN LÝ VÒNG ĐỜI KỲ THI & DỌN DẸP DỮ LIỆU AN TOÀN (2–3 TUẦN)
export default function RetentionCard() {
  const { setHasDownloadedBackup, retentionSummary, showToast, handleExportCSV, handleExportJSON,
    handlePurgeExamData } = useAdmin();

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
          <span>🗄️</span>
          <span>QUẢN LÝ VÒNG ĐỜI KỲ THI & DỌN DẸP DỮ LIỆU (2-3 TUẦN)</span>
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          retentionSummary.isExpired
            ? 'bg-red-100 text-red-800 border-red-300'
            : (retentionSummary.isNearExpiry
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-blue-100 text-blue-900 border-blue-200')
        }`}>
          {retentionSummary.daysActive} ngày lưu trữ
        </span>
      </div>

      <p className="text-xs text-slate-500 font-medium">
        Theo quy chuẩn lưu trữ của bộ môn: Dữ liệu bài thi chính thức được lưu trữ an toàn trong 2–3 tuần (tối đa 21 ngày) để phục vụ chấm tự luận và vào điểm. Sau đó có thể dọn dẹp để chuẩn bị cho đợt thi mới.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500">Tổng bài thi chính thức:</span>
          <p className="text-lg font-black text-blue-950 mt-0.5">{retentionSummary.totalCount} bài</p>
        </div>
        <div>
          <span className="text-slate-500">Thời gian đã lưu:</span>
          <p className="text-lg font-black text-amber-700 mt-0.5">{retentionSummary.daysActive} / {retentionSummary.retentionDays || 21} ngày</p>
        </div>
        <div>
          <span className="text-slate-500">Trạng thái vòng đời:</span>
          <p className={`text-xs font-black mt-1.5 ${retentionSummary.isExpired ? 'text-red-700' : (retentionSummary.isNearExpiry ? 'text-amber-700' : 'text-emerald-700')}`}>
            {retentionSummary.isExpired ? '⚠️ Đã quá 3 tuần (Nên dọn dẹp)' : (retentionSummary.isNearExpiry ? '🟡 Sắp hết hạn 3 tuần' : '🟢 Đang trong hạn lưu trữ')}
          </p>
        </div>
      </div>

      {/* Quy trình an toàn 2 bước */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
          QUY TRÌNH DỌN DẸP AN TOÀN 2 BƯỚC:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              handleExportCSV();
              handleExportJSON();
              setHasDownloadedBackup(true);
              showToast('Tệp Excel CSV và tệp sao lưu JSON đã được lưu vào máy tính của Thầy. Thầy có thể an tâm dọn dẹp nếu muốn!', 'success', 'Sao Lưu Hoàn Tất 📥');
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>📥</span>
            <span>1. Tải Bản Sao Lưu Về Máy (CSV + JSON)</span>
          </button>

          <button
            type="button"
            onClick={handlePurgeExamData}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>🗑️</span>
            <span>2. Dọn Dẹp Kỳ Thi Cũ (Xóa Dữ Liệu Sau 2-3 Tuần)</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          * Lưu ý: Khi dọn dẹp, toàn bộ bài thi cũ sẽ được làm sạch trên Firestore và web. Bản sao lưu trên Google Drive hoặc tệp tải về máy sẽ giữ trọn vẹn dữ liệu vĩnh viễn.
        </p>
      </div>
    </div>
  );
}
