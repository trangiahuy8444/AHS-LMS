import React from 'react';
import { useStudent } from '../StudentContext.js';

// MODAL THÔNG BÁO TỪ GIÁO VIÊN / LỆNH GIÁM THỊ PHÒNG THI
export default function ProctorNoticeModal() {
  const { broadcastNotice, setBroadcastNotice } = useStudent();

  if (!(broadcastNotice)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border-4 border-blue-600 space-y-4 text-center">
        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md ${
          broadcastNotice.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {broadcastNotice.type === 'success' ? '⏱️' : '📢'}
        </div>
        <h3 className="text-xl font-black text-slate-900">
          {broadcastNotice.title}
        </h3>
        <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 whitespace-pre-line text-left">
          {broadcastNotice.message}
        </p>
        <button
          type="button"
          onClick={() => setBroadcastNotice(null)}
          className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-blue-700/30 uppercase tracking-wider"
        >
          Em Đã Hiểu & Tiếp Tục Làm Bài
        </button>
      </div>
    </div>
  );
}
