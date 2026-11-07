import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';
import { getStudentGuidance } from '../../shared/studentGuidance.js';

export default function GuidanceConfigCard() {
  const { config, setConfig } = useAdmin();
  const [mode, setMode] = useState('practice');
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const value = drafts[mode] || getStudentGuidance(config, mode);
  const edit = (field, text) => {
    setDrafts(current => ({ ...current, [mode]: { ...value, [field]: text } }));
    setNotice(null);
  };
  const save = async () => {
    const guidance = { title: value.title.trim(), body: value.body.trim() };
    if (!guidance.title || !guidance.body) {
      setNotice({ error: true, text: 'Điền đủ tiêu đề và nội dung hướng dẫn.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      if (!window.firebaseDb) throw new Error('Chưa kết nối máy chủ.');
      await window.firebaseDb.collection('exam_config').doc('global_config').set({ studentGuidance: { [mode]: guidance } }, { merge: true });
      setConfig(current => ({ ...current, studentGuidance: { ...current.studentGuidance, [mode]: guidance } }));
      setDrafts(current => { const next = { ...current }; delete next[mode]; return next; });
      setNotice({ error: false, text: 'Đã lưu hướng dẫn. Nội dung được cập nhật cho học sinh đang làm bài.' });
    } catch {
      setNotice({ error: true, text: 'Chưa lưu được hướng dẫn. Thầy kiểm tra kết nối rồi thử lại.' });
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <h3 className="text-lg font-bold text-blue-950">Hướng dẫn hiển thị trong bài làm</h3>
      <label className="block text-sm font-semibold">Chế độ làm bài
        <select value={mode} onChange={event => { setMode(event.target.value); setNotice(null); }} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base">
          <option value="practice">Ôn tập đề cương</option><option value="exam">Thi chính thức</option>
        </select>
      </label>
      <label className="block text-sm font-semibold">Tiêu đề hướng dẫn
        <input value={value.title} onChange={event => edit('title', event.target.value)} maxLength={140} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base" />
      </label>
      <label className="block text-sm font-semibold">Nội dung hướng dẫn
        <textarea value={value.body} onChange={event => edit('body', event.target.value)} rows={6} maxLength={4000} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base leading-relaxed" />
      </label>
      <p className="text-sm text-slate-600">Mỗi dòng là một ý hướng dẫn. Học sinh thấy nội dung này khi vào bài và trong màn hình làm bài.</p>
      <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu hướng dẫn'}</button>
      {notice && <p role={notice.error ? 'alert' : 'status'} className={`text-sm ${notice.error ? 'text-red-700' : 'text-emerald-700'}`}>{notice.text}</p>}
    </section>
  );
}
