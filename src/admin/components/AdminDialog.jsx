import React from 'react';
import { useAdmin } from '../AdminContext.js';

// DIALOG XÁC NHẬN / THÔNG BÁO TĨNH (GIỮA MÀN HÌNH, KHÔNG GIẬT NẢY)
export default function AdminDialog() {
  const { adminDialog, setAdminDialog } = useAdmin();

  if (!(adminDialog)) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2.5 rounded-2xl text-lg font-black shrink-0 ${
            adminDialog.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            adminDialog.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
            adminDialog.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {adminDialog.type === 'success' ? '✓' :
             adminDialog.type === 'error' ? '✕' :
             adminDialog.type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-black text-blue-950 text-base leading-tight">
              {adminDialog.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed font-medium">
              {adminDialog.message}
            </p>
          </div>
        </div>
        <div className="pt-2 flex justify-end space-x-2">
          {adminDialog.onConfirm ? (
            <>
              <button
                type="button"
                onClick={() => setAdminDialog(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = adminDialog.onConfirm;
                  setAdminDialog(null);
                  if (fn) fn();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow transition"
              >
                Xác nhận
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setAdminDialog(null)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow transition"
            >
              ĐÃ HIỂU
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
