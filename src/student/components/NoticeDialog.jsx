import React from 'react';
import { useStudent } from '../StudentContext.js';

// MODAL THÔNG BÁO TĨNH (KHÔNG NHẢY GIẬT, THAY THẾ ALERT)
export default function NoticeDialog() {
  const { customDialog, setCustomDialog } = useStudent();

  if (!(customDialog)) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2.5 rounded-2xl text-lg font-black shrink-0 ${
            customDialog.type === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
            customDialog.type === 'error' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
            customDialog.type === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
            'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {customDialog.type === 'success' ? '✓' :
             customDialog.type === 'error' ? '✕' :
             customDialog.type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-black text-slate-900 text-base leading-tight">
              {customDialog.title}
            </h3>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed font-medium">
              {customDialog.message}
            </p>
          </div>
        </div>
        <div className="pt-2 flex justify-end space-x-2">
          {customDialog.onConfirm ? (
            <>
              <button
                type="button"
                onClick={() => setCustomDialog(null)}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = customDialog.onConfirm;
                  setCustomDialog(null);
                  if (fn) fn();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md"
              >
                Xác nhận
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCustomDialog(null)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-md transition"
            >
              ĐÃ HIỂU
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
