import React from 'react';
import { useAdmin } from '../AdminContext.js';

// 2. MẬT KHẨU PHÒNG THI
export default function RoomPasswordCard() {
  const { setConfig, newExamPassword, setNewExamPassword, setConfigSavedNotice } = useAdmin();

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
        <span>🔒</span>
        <span>MẬT KHẨU PHÒNG THI CHÍNH THỨC</span>
      </h3>
      <p className="text-xs text-slate-500 font-medium">
        Học sinh phải nhập đúng mật khẩu này mới được phép bắt đầu làm bài thi chính thức 45 phút.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={newExamPassword}
          onChange={e => setNewExamPassword(e.target.value)}
          className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono-code font-bold text-amber-700 w-64 focus:outline-none focus:border-amber-500"
        />
        <button
          type="button"
          onClick={() => {
            window.AsianSchoolStorage.setExamPassword(newExamPassword);
            setConfig(window.AsianSchoolStorage.getConfig());
            setConfigSavedNotice('Đã lưu mật khẩu phòng thi mới!');
            setTimeout(() => setConfigSavedNotice(''), 3000);
          }}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          Lưu Mật Khẩu Thi
        </button>
      </div>
    </div>
  );
}
