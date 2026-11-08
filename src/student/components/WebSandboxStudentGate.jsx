import React, { useEffect, useState } from 'react';
import LocalSandboxBanner from '../../shared/components/LocalSandboxBanner.jsx';

export default function WebSandboxStudentGate({children}) {
  const isWebSandbox = window.AsianSchoolRuntime?.mode === 'web-sandbox';
  const [authState,setAuthState] = useState(() => window.AsianSchoolAuth?.getState() || {});
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  useEffect(() => {
    if (!isWebSandbox) return;
    return window.AsianSchoolAuth?.onChange(setAuthState);
  },[isWebSandbox]);
  if (!isWebSandbox) return children;
  if (!authState.ready) return <><LocalSandboxBanner /><main className="min-h-screen bg-slate-100 p-6 flex items-center justify-center"><p role="status" className="text-slate-700 font-semibold">Đang kiểm tra phiên thử…</p></main></>;
  if (authState.user && authState.isTeacher) return children;
  const signIn = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);setError('');
    try { await window.AsianSchoolAuth.signInSandbox({username:String(form.get('username') || '').trim(),password:String(form.get('password') || '')}); }
    catch { setError('Chưa đăng nhập được bộ thử. Kiểm tra tài khoản, mật khẩu và kết nối mạng.'); }
    finally { setBusy(false); }
  };
  return <><LocalSandboxBanner /><main className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
    <form onSubmit={signIn} className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-md space-y-4">
      <h1 className="text-xl font-bold text-blue-900">Cổng học sinh thử</h1>
      <p>Đăng nhập tài khoản dùng chung của bộ thử, không dùng Google. Dữ liệu và điểm số ở đây đều là dữ liệu thử.</p>
      {authState.user && !authState.isTeacher && <p role="alert" className="text-amber-800">Phiên hiện tại không có quyền vào hệ thống thử. Đăng nhập bằng tài khoản thử đã được cấp.</p>}
      <label className="block font-semibold">Tài khoản thử<input name="username" defaultValue="admin" autoComplete="username" required className="block w-full rounded-xl border p-3 mt-1" /></label>
      <label className="block font-semibold">Mật khẩu thử<input name="password" type="password" autoComplete="current-password" required className="block w-full rounded-xl border p-3 mt-1" /></label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button disabled={busy || !authState.ready} className="w-full bg-blue-700 text-white rounded-xl p-3 font-bold disabled:opacity-50">{busy ? 'Đang đăng nhập…' : 'Vào cổng học sinh thử'}</button>
    </form>
  </main></>;
}
