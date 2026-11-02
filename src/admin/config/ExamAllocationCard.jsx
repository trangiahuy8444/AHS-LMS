import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext.js';

const MODES = ['class_assigned', 'random', 'fixed', 'student_choice'];

export default function ExamAllocationCard() {
  const { config, setConfig } = useAdmin();
  const [mode, setMode] = useState(config.codeAllocationMode || 'class_assigned');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  useEffect(() => { setMode(config.codeAllocationMode || 'class_assigned'); }, [config.codeAllocationMode]);

  const save = async () => {
    if (!MODES.includes(mode) || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      if (!window.firebaseDb) throw new Error('Chưa kết nối được máy chủ.');
      // Chỉ ghi chính sách phân mã; không đẩy lại cấu hình cũ hoặc bí mật của phòng thi.
      await window.firebaseDb.collection('exam_config').doc('global_config').set({ codeAllocationMode: mode }, { merge: true });
      setConfig(prev => ({ ...prev, codeAllocationMode: mode }));
      setNotice({ error: false, text: 'Đã lưu cách phân mã đề trên máy chủ.' });
    } catch (error) {
      setNotice({ error: true, text: `Chưa lưu được cách phân mã đề: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="text-lg font-bold text-[#0267B1]">Phân mã đề thi</h3>
      <div>
        <label htmlFor="exam-allocation-mode" className="block text-sm font-semibold text-slate-900 mb-2">Cách phân mã đề</label>
        <select id="exam-allocation-mode" value={mode} onChange={event => { setMode(event.target.value); setNotice(null); }} disabled={saving}
          className="w-full rounded-xl border border-slate-300 px-3 py-3 text-base bg-white text-slate-900 focus:ring-2 focus:ring-[#0267B1] disabled:opacity-50">
          <option value="class_assigned">Theo phân công của lớp</option>
          <option value="random">Hệ thống chọn ngẫu nhiên</option>
          <option value="fixed">Mã cố định: {config.fixedCode || '101'}</option>
          <option value="student_choice">Học sinh tự chọn mã đề</option>
        </select>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">Khi cho phép tự chọn, học sinh chỉ chọn được mã đang bật của đúng khối. Lượt đang làm vẫn giữ mã đã nhận; lượt thi lại được cấp có thể chọn mã khác. Các điều kiện mật khẩu, ca thi và số lượt vẫn áp dụng.</p>
      <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-[#0267B1] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? 'Đang lưu…' : 'Lưu cách phân mã đề'}
      </button>
      {notice && <p role={notice.error ? 'alert' : 'status'} className={`text-sm font-medium ${notice.error ? 'text-red-700' : 'text-emerald-700'}`}>{notice.text}</p>}
    </section>
  );
}
