import React from 'react';

function downloadWebhookLog() {
  let entries = [];
  try { entries = JSON.parse(localStorage.getItem('ahs_local_sandbox_webhook_log') || '[]'); } catch { /* nhật ký trống */ }
  const url = URL.createObjectURL(new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Nhat_ky_Google_Sheets_mo_phong.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function LocalSandboxBanner() {
  const runtime = window.AsianSchoolRuntime;
  const isWeb = runtime?.mode === 'web-sandbox';
  if (!isWeb && runtime?.mode !== 'local-sandbox') return null;
  const teacherUrl = isWeb ? 'https://ahs-lms-sandbox.web.app/admin/' : 'http://localhost:5188/AHS-LMS/admin/';
  const studentUrl = isWeb ? 'https://ahs-lms-sandbox.firebaseapp.com/test/' : 'http://127.0.0.1:5188/AHS-LMS/test/';
  return (
    <aside aria-label={isWeb ? 'Hệ thống thử trên web' : 'Hệ thống thử cục bộ'} className="relative z-50 border-b-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-slate-900 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="text-base">{isWeb ? 'HỆ THỐNG THỬ TRÊN WEB' : 'HỆ THỐNG THỬ TRÊN MÁY'}</strong>
          <p>Dữ liệu giả, tách khỏi học sinh thật. AI và đồng bộ Google Sheets cũ chỉ mô phỏng. Drive tự động, nếu đã cài, lưu vào kho thử riêng.</p>
          {isWeb
            ? <p>Bài làm, giám sát và cấu hình thử được đồng bộ giữa các máy trong hệ thống thử riêng. Nhật ký Sheets mô phỏng chỉ lưu trên thiết bị này.</p>
            : <p>Mật khẩu phòng thử: <strong>sandbox-local</strong>. Dữ liệu thử được lưu riêng trên máy cho lần chạy sau.</p>}
        </div>
        <nav aria-label="Cổng chạy thử" className="flex flex-wrap items-center gap-3 font-semibold text-blue-800">
          <a className="underline" href={teacherUrl} target="_blank" rel="noreferrer">Cổng giáo viên thử</a>
          <a className="underline" href={studentUrl} target="_blank" rel="noreferrer">Cổng học sinh thử</a>
          <button type="button" className="rounded-lg border border-blue-300 bg-white px-3 py-2" onClick={downloadWebhookLog}>Tải nhật ký Sheets mô phỏng trên thiết bị này</button>
        </nav>
      </div>
    </aside>
  );
}
