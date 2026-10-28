import React from 'react';
import { useAdmin } from '../AdminContext.js';

// MODAL PHÁT THÔNG BÁO KHẨN / NHẮN TIN GIÁM THỊ
export default function BroadcastModal() {
  const { showBroadcastModal, setShowBroadcastModal, broadcastTarget, setBroadcastTarget,
    broadcastMsgInput, setBroadcastMsgInput, individualMsgTarget, setIndividualMsgTarget,
    handleSendBroadcast } = useAdmin();

  if (!(showBroadcastModal)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm text-blue-950 uppercase flex items-center space-x-2">
            <span>📢</span>
            <span>{broadcastTarget === 'all' ? 'PHÁT THÔNG BÁO TOÀN PHÒNG THI' : 'GỬI TIN NHẮN TỚI THÍ SINH'}</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              setShowBroadcastModal(false);
              setIndividualMsgTarget(null);
              setBroadcastTarget('all');
            }}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        {individualMsgTarget && (
          <p className="text-xs text-slate-600 font-medium">
            Gửi riêng tới: <strong className="text-blue-950 font-bold">{individualMsgTarget.fullName}</strong> (Lớp {individualMsgTarget.studentClass})
          </p>
        )}

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nội dung thông báo:</label>
            <textarea
              rows={4}
              value={broadcastMsgInput}
              onChange={e => setBroadcastMsgInput(e.target.value)}
              placeholder="Gõ thông báo khẩn gửi tới máy học sinh..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              autoFocus
            ></textarea>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="text-slate-500 font-medium">Mẫu nhanh:</span>
            {[
              'Còn 10 phút, các em kiểm tra kỹ lại bài!',
              'Còn 5 phút nữa sẽ hết giờ làm bài!',
              'Chú ý không mở tab khác, vi phạm 3 lần bài sẽ bị khóa!'
            ].map((m, mIdx) => (
              <button
                key={mIdx}
                type="button"
                onClick={() => setBroadcastMsgInput(m)}
                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-medium"
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowBroadcastModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow"
            >
              Phát Thông Báo Ngay 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
