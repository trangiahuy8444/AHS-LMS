import React from 'react';
import { useAdmin } from './AdminContext.js';

export default function LoginScreen() {
  const { authReady, loginError, handleLogin } = useAdmin();
  const isLocalSandbox = window.AsianSchoolRuntime?.mode === 'local-sandbox';
  const isWebSandbox = window.AsianSchoolRuntime?.mode === 'web-sandbox';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-slate-900">
        <div className="text-center space-y-3">
          <img
            src={window.ASIAN_SCHOOL_LOGO_BASE64 || "../assets/logo_asian_school.png"}
            alt="Asian School"
            className="h-16 mx-auto object-contain"
          />
          <h1 className="text-lg font-black tracking-tight text-blue-950 uppercase">
            TRƯỜNG QUỐC TẾ Á CHÂU
          </h1>
          <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
            {isWebSandbox ? 'CỔNG QUẢN TRỊ HỆ THỐNG THỬ' : 'CỔNG QUẢN TRỊ KHẢO THÍ — THẦY TRẦN GIA HUY'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <p className="text-xs text-slate-600 text-center">
            {isLocalSandbox ? 'Dùng vai giáo viên giả trong hệ thống thử trên máy. Không đăng nhập Google thật.' : isWebSandbox ? 'Tài khoản dùng chung chỉ dành cho hệ thống thử. Dữ liệu và quyền truy cập tách khỏi hệ thống học sinh thật.' : 'Đăng nhập bằng tài khoản Google giáo viên đã được cấp quyền quản trị.'}
          </p>

          {isWebSandbox && (
            <div className="space-y-3 text-sm">
              <label className="block font-semibold text-slate-800" htmlFor="sandbox-username">
                Tài khoản thử
                <input id="sandbox-username" name="username" type="text" defaultValue="admin" autoComplete="username" required className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900" />
              </label>
              <label className="block font-semibold text-slate-800" htmlFor="sandbox-password">
                Mật khẩu thử
                <input id="sandbox-password" name="password" type="password" autoComplete="current-password" required className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900" />
              </label>
            </div>
          )}

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={!authReady}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-blue-600/30 uppercase tracking-wider"
          >
            {isLocalSandbox ? 'Vào vai giáo viên thử' : isWebSandbox ? 'Đăng nhập hệ thống thử' : 'Đăng Nhập Bằng Google'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <a href={isLocalSandbox ? "http://127.0.0.1:5188/AHS-LMS/test/" : isWebSandbox ? "https://ahs-lms-sandbox.firebaseapp.com/test/" : "../index.html"} className="text-xs text-slate-500 hover:text-blue-700 font-semibold transition">
            ← Về Cổng Khảo Thí Học Sinh
          </a>
        </div>
      </div>
    </div>
  );
}
