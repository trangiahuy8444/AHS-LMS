import React from 'react';
import { useStudent } from '../StudentContext.js';

export default function ViolationWarningModal() {
  const { totalViolations, showWarningModal, warningMessage, isSessionLocked, handleDismissWarning, examState } = useStudent();
  if (!(showWarningModal && !isSessionLocked && examState === 'in_progress')) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
      <section role="alertdialog" aria-modal="true" aria-labelledby="violation-title" aria-describedby="violation-description" className="bg-white text-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto text-center border-2 border-red-500 space-y-4">
        <h3 id="violation-title" className="text-xl font-extrabold text-red-700">CẢNH BÁO VI PHẠM</h3>
        <p id="violation-description" className="text-sm text-slate-700 leading-relaxed">
          {warningMessage || 'Em vừa rời giao diện làm bài hoặc thoát toàn màn hình. Hãy quay lại để tiếp tục.'}
        </p>
        <p className="text-xs text-slate-600">Tổng vi phạm đã ghi nhận: <strong>{totalViolations} lần</strong></p>
        <button type="button" onClick={handleDismissWarning} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition focus-visible:ring-4 focus-visible:ring-red-300">
          QUAY LẠI TOÀN MÀN HÌNH
        </button>
      </section>
    </div>
  );
}
