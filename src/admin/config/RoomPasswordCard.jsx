import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';

// 2. MẬT KHẨU PHÒNG THI
export default function RoomPasswordCard() {
  const { config, setConfig } = useAdmin();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const password = draft ?? (config.examPassword || '');

  async function savePassword() {
    const value = password.trim();
    if (!value || value.toLowerCase().length > 100) {
      setNotice({ error: true, text: 'Nhập mật khẩu từ 1 đến 100 ký tự.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      if (!window.firebaseDb) throw new Error('Chưa kết nối máy chủ.');
      await window.firebaseDb.collection('exam_secrets').doc('room').set({ examPassword: value }, { merge: true });
      setConfig(current => ({ ...current, examPassword: value }));
      setDraft(null);
      setNotice({ error: false, text: 'Đã lưu mật khẩu phòng thi trên máy chủ.' });
    } catch {
      setNotice({ error: true, text: 'Chưa lưu được mật khẩu. Thầy kiểm tra kết nối và quyền đăng nhập rồi thử lại.' });
    } finally {
      setSaving(false);
    }
  }

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
          aria-label="Mật khẩu phòng thi"
          value={password}
          disabled={saving}
          onChange={e => { setDraft(e.target.value); setNotice(null); }}
          className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono-code font-bold text-amber-700 w-64 focus:outline-none focus:border-amber-500"
        />
        <button
          type="button"
          onClick={savePassword}
          disabled={saving}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          {saving ? 'Đang lưu…' : 'Lưu Mật Khẩu Thi'}
        </button>
      </div>
      {notice && (
        <p role={notice.error ? 'alert' : 'status'} className={notice.error ? 'text-sm text-red-700' : 'text-sm text-emerald-700'}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
