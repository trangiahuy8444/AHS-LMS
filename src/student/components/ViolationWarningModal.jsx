import React from 'react';
import { useStudent } from '../StudentContext.js';

// MODAL CẢNH BÁO VI PHẠM (CHỐNG GIAN LẬN TOÀN MÀN HÌNH)
export default function ViolationWarningModal() {
  const { violations, showWarningModal, warningMessage, isSessionLocked, handleDismissWarning } = useStudent();

  if (!(showWarningModal && !isSessionLocked)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center border-4 border-red-500">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-black text-red-600 mb-2">CẢNH BÁO VI PHẠM BẢO MẬT!</h3>
        <p className="text-sm font-semibold text-slate-700 mb-4 leading-relaxed">
          {warningMessage || 'Bạn vừa thoát khỏi chế độ toàn màn hình hoặc chuyển sang ứng dụng khác!'}
        </p>
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl mb-5">
          Tổng số lần vi phạm đã ghi nhận: {violations} lần
        </div>
        <button
          type="button"
          onClick={handleDismissWarning}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-red-600/30 uppercase tracking-wider"
        >
          Tôi Đã Hiểu & Quay Lại Toàn Màn Hình
        </button>
      </div>
    </div>
  );
}
