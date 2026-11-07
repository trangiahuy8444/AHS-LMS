import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';
import { useTeacherReminder } from '../../shared/useTeacherReminder.js';

function requestId() {
  return 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

export default function TeacherReminderButton({ session }) {
  const { showToast } = useAdmin();
  const reminder = useTeacherReminder(session);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('Em tập trung làm bài và thực hiện đúng hướng dẫn của giáo viên.');
  const [eventId, setEventId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const send = async event => {
    event.preventDefault();
    if (saving || !message.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (!window.AsianSchoolCloud?.recordTeacherReminder) throw new Error('Chưa kết nối máy chủ.');
      const result = await window.AsianSchoolCloud.recordTeacherReminder({
        sessionId: session.sessionId, grade: session.grade, studentClass: session.studentClass,
        studentId: session.studentId, uid: session.uid, mode: session.mode,
        message: message.trim(), requestId: eventId
      });
      showToast?.(`Đã ghi nhắc nhở lần ${result.count} cho ${session.fullName}.`, 'success', 'Nhắc nhở của giáo viên');
      setOpen(false);
    } catch (failure) {
      setError(failure.message || 'Chưa gửi được nhắc nhở. Thầy thử lại.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-2 border-t border-amber-200 pt-2">
      <p className="text-sm text-amber-900">Nhắc của GV <strong>{reminder?.count || 0}</strong> lần</p>
      <button type="button" disabled={session.status === 'submitted'} onClick={() => { setEventId(requestId()); setError(''); setOpen(true); }}
        className="w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900 disabled:opacity-40">Nhắc nhở học sinh</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={send} role="dialog" aria-modal="true" aria-label="Nhắc nhở học sinh" className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Nhắc nhở {session.fullName}</h3>
            <p className="text-sm text-slate-600">Lớp {session.studentClass} · Mã LMS {session.studentId}. Giáo viên ghi nhận và tự quyết định xử lý.</p>
            <label className="block text-sm font-semibold text-slate-900">Nội dung nhắc nhở
              <textarea autoFocus rows={4} maxLength={1000} value={message} disabled={saving}
                onChange={event => { setMessage(event.target.value); setEventId(requestId()); }} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base leading-relaxed" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" disabled={saving} onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm">Hủy</button>
              <button type="submit" disabled={saving || !message.trim()} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Đang gửi…' : 'Gửi nhắc nhở'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
