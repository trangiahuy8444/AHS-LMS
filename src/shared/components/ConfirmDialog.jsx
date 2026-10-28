import React from 'react';
import { feedbackIcon, feedbackBadgeClass } from './feedback.js';

// Giữ nguyên giao diện riêng của từng cổng
const VARIANTS = {
  student: {
    overlay: 'bg-slate-900/60',
    panel: 'bg-white',
    tone: 'strong',
    title: 'text-slate-900',
    message: 'text-sm',
    cancel: 'border-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs',
    confirm: 'shadow-md',
    ok: 'shadow-md transition'
  },
  admin: {
    overlay: 'bg-slate-950/50',
    panel: 'bg-white text-slate-900',
    tone: 'soft',
    title: 'text-blue-950',
    message: 'text-xs sm:text-sm',
    cancel: 'border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition',
    confirm: 'shadow transition',
    ok: 'shadow transition'
  }
};

/**
 * Hộp thoại thông báo / xác nhận tĩnh thay cho alert() và confirm().
 * dialog: { title, message, type, onConfirm? }; có onConfirm thì hiện Hủy bỏ / Xác nhận, không thì ĐÃ HIỂU.
 */
export default function ConfirmDialog({ dialog, onClose, variant = 'admin' }) {
  if (!dialog) return null;
  const v = VARIANTS[variant] || VARIANTS.admin;

  return (
    <div className={`fixed inset-0 z-50 ${v.overlay} backdrop-blur-[2px] flex items-center justify-center p-4`}>
      <div className={`${v.panel} rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 p-6 space-y-4`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2.5 rounded-2xl text-lg font-black shrink-0 ${feedbackBadgeClass(dialog.type, v.tone)}`}>
            {feedbackIcon(dialog.type)}
          </div>
          <div className="space-y-1 flex-1">
            <h3 className={`font-black ${v.title} text-base leading-tight`}>
              {dialog.title}
            </h3>
            <p className={`${v.message} text-slate-600 whitespace-pre-line leading-relaxed font-medium`}>
              {dialog.message}
            </p>
          </div>
        </div>
        <div className="pt-2 flex justify-end space-x-2">
          {dialog.onConfirm ? (
            <>
              <button type="button" onClick={onClose} className={`px-4 py-2.5 rounded-xl ${v.cancel}`}>
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = dialog.onConfirm;
                  onClose();
                  if (fn) fn();
                }}
                className={`px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs ${v.confirm}`}
              >
                Xác nhận
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl ${v.ok}`}
            >
              ĐÃ HIỂU
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
