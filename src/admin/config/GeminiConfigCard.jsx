import React, { useState } from 'react';
import { useAdmin } from '../AdminContext.js';
import {
  AVAILABLE_GEMINI_MODELS,
  getFallbackChain
} from '../../core/gemini-grading-service.js';

// CẤU HÌNH TRỢ LÝ CHẤM TỰ LUẬN BẰNG GEMINI AI & ĐIỀU PHỐI MÔ HÌNH LINH HOẠT
export default function GeminiConfigCard() {
  const {
    geminiApiKey,
    setGeminiApiKey,
    geminiModel,
    setGeminiModel,
    geminiAutoFallback,
    setGeminiAutoFallback,
    handleSaveGeminiConfig,
    handleTestGeminiConnection,
    isTestingGemini,
    geminiTestNotice,
    geminiSavedNotice
  } = useAdmin();

  const [showKey, setShowKey] = useState(false);

  const activeModelMeta = AVAILABLE_GEMINI_MODELS.find(m => m.id === geminiModel) || AVAILABLE_GEMINI_MODELS[0];
  const fallbackChain = getFallbackChain(geminiModel);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm text-purple-950 uppercase tracking-wider flex items-center space-x-2">
          <span>✨</span>
          <span>TRỢ LÝ CHẤM BÀI TỰ LUẬN GEMINI AI (ĐIỀU PHỐI MÔ HÌNH LINH HOẠT)</span>
        </h3>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
          100% Theo Barem Asian School
        </span>
      </div>

      <p className="text-xs text-slate-500 font-medium leading-relaxed">
        Sử dụng hệ thống mô hình thế hệ mới của Google để hỗ trợ giáo viên chấm bài tự luận.
        Trang bị cơ chế <strong>tự động chuyển mô hình dự phòng (Auto Fallback)</strong> khi một mô hình chạm ngưỡng giới hạn (Rate Limit 429) hoặc quá tải, đảm bảo quá trình chấm không bị gián đoạn.
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

      {/* MỤC 1: API KEY */}
      <div className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
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

        {/* MỤC 2: CHỌN MÔ HÌNH CHÍNH & TỰ ĐỘNG DỰ PHÒNG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Mô Hình AI Chính (Primary Model):
              </label>
              <a
                href="https://aistudio.google.com/docs/models?hl=vi"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center space-x-0.5"
                title="Xem bảng so sánh mô hình chính thức tại Google AI Studio"
              >
                <span>Tài liệu mô hình</span>
                <span>↗</span>
              </a>
            </div>

            <select
              value={geminiModel}
              onChange={e => setGeminiModel(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
            >
              {AVAILABLE_GEMINI_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.badge} ({m.speed})
                </option>
              ))}
            </select>

            {/* Chi tiết về mô hình đang chọn */}
            <div className="mt-2.5 p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-900">{activeModelMeta.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200 text-purple-800 rounded">
                  {activeModelMeta.limits}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                {activeModelMeta.desc}
              </p>
            </div>
          </div>

          {/* CHẾ ĐỘ AUTO-FALLBACK */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Điều Phối Mô Hình Dự Phòng:
              </label>
            </div>

            <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border-2 border-slate-200 cursor-pointer hover:border-purple-300 transition select-none">
              <input
                type="checkbox"
                checked={geminiAutoFallback}
                onChange={e => setGeminiAutoFallback(e.target.checked)}
                className="mt-0.5 rounded text-purple-600 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 block">
                  Tự động chuyển mô hình dự phòng khi gặp lỗi (Khuyến nghị)
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-relaxed block mt-0.5">
                  Khi mô hình chính bị nghẽn (HTTP 429) hoặc tạm thời không khả dụng (503), hệ thống tự động gọi sang mô hình kế tiếp theo chuỗi ưu tiên mà không làm dừng bài chấm.
                </span>
              </div>
            </label>

            {/* Chuỗi dự phòng trực quan */}
            {geminiAutoFallback && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
                <div className="text-[11px] font-bold text-indigo-900 uppercase">
                  Chuỗi ưu tiên chuyển đổi (Fallback Chain):
                </div>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  {fallbackChain.map((mId, idx) => (
                    <React.Fragment key={mId}>
                      <span className={`px-2 py-0.5 rounded-lg border font-bold ${
                        idx === 0
                          ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}>
                        {idx === 0 ? `Chính: ${mId}` : `Dự phòng ${idx}: ${mId}`}
                      </span>
                      {idx < fallbackChain.length - 1 && (
                        <span className="text-indigo-400 font-black">➔</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BẢO MẬT & LƯU Ý */}
        <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-200 text-[11px] text-purple-950 flex items-center space-x-2.5">
          <span className="text-xl">🛡️</span>
          <div>
            <strong>Nguyên tắc Sư phạm & An toàn:</strong> Dù bất kỳ mô hình nào trong chuỗi được sử dụng, hệ thống đều áp dụng chung một cấu trúc Barem chuẩn Asian School 100%. Giáo viên luôn có toàn quyền kiểm tra, xem lại bài chấm và chỉnh sửa thủ công trước khi chốt điểm.
          </div>
        </div>
      </div>
    </div>
  );
}