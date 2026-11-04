import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';

// CẤU HÌNH TRỢ LÝ CHẤM TỰ LUẬN BẰNG GEMINI AI
export default function GeminiConfigCard() {
  const {
    geminiApiKey,
    setGeminiApiKey,
    geminiModel,
    setGeminiModel,
    handleSaveGeminiConfig,
    handleTestGeminiConnection,
    isTestingGemini,
    geminiTestNotice,
    geminiSavedNotice
  } = useAdmin();

  const [showKey, setShowKey] = useState(false);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm text-purple-950 uppercase tracking-wider flex items-center space-x-2">
          <span>✨</span>
          <span>TRỢ LÝ CHẤM BÀI TỰ LUẬN GEMINI AI (DUYỆT THỦ CÔNG)</span>
        </h3>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
          100% Theo Barem
        </span>
      </div>

      <p className="text-xs text-slate-500 font-medium leading-relaxed">
        Sử dụng mô hình AI của Google để hỗ trợ giáo viên chấm bài tự luận bám sát barem hướng dẫn chấm. Mọi điểm số do AI đề xuất đều cần giáo viên kiểm tra và duyệt thủ công trước khi lưu chính thức.
      </p>

      {geminiSavedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
          <span>✓</span>
          <span>{geminiSavedNotice}</span>
        </div>
      )}

      {geminiTestNotice && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
          geminiTestNotice.success
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
            : 'bg-rose-50 border border-rose-300 text-rose-800'
        }`}>
          <span>{geminiTestNotice.success ? '✓' : '⚠️'}</span>
          <span>{geminiTestNotice.message}</span>
        </div>
      )}

      <div className="space-y-4 pt-1">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Google Gemini API Key:
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-purple-700 hover:text-purple-900 font-bold hover:underline flex items-center space-x-1"
            >
              <span>🔑 Lấy mã API miễn phí tại Google AI Studio</span>
              <span>↗</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={e => setGeminiApiKey(e.target.value)}
                placeholder="Dán mã khóa AIzaSy... vào đây"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-3.5 pr-14 py-2.5 text-xs text-purple-950 font-mono-code focus:outline-none focus:border-purple-600"
              />
              <button
                type="button"
                onClick={() => setShowKey(prev => !prev)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                {showKey ? 'ẨN' : 'HIỆN'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveGeminiConfig}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition shrink-0"
            >
              Lưu Cấu Hình
            </button>

            <button
              type="button"
              onClick={handleTestGeminiConnection}
              disabled={isTestingGemini}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition shrink-0 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {isTestingGemini ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Đang kết nối...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Kiểm Tra Kết Nối</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              2. Mô hình AI Khuyên Dùng:
            </label>
            <select
              value={geminiModel}
              onChange={e => {
                setGeminiModel(e.target.value);
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem('ahs_gemini_model', e.target.value);
                }
              }}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Khuyên dùng: Nhanh, chuẩn xác, tiết kiệm)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Tư duy chuyên sâu, phân tích chi tiết)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Dự phòng)</option>
            </select>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-[11px] text-purple-950 flex items-center space-x-2">
            <span className="text-lg">🛡️</span>
            <div>
              <strong>Bảo mật danh tính & Barem:</strong> Khóa API và dữ liệu chấm bài chỉ chạy trực tiếp trên máy giáo viên và gửi thẳng đến Google API qua SSL; học sinh không thể truy cập khóa này.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
