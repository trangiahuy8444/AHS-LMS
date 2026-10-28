import React from 'react';
import { useAdmin } from '../AdminContext.js';

// 5. NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG)
export default function AuditLogCard() {
  const { auditLogs } = useAdmin();

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
        <span>📝</span>
        <span>NHẬT KÝ THAO TÁC HỆ THỐNG (AUDIT LOG)</span>
      </h3>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 text-xs">
        {auditLogs.length === 0 ? (
          <p className="text-slate-400 italic py-2">Chưa ghi nhận hoạt động nào.</p>
        ) : (
          auditLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <span className="font-bold text-blue-900">{log.action}</span>
                <p className="text-slate-700 mt-0.5">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono-code shrink-0 ml-3">
                {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
