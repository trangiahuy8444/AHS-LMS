import React from 'react';
import { useAdmin } from '../AdminContext.js';
import { feedbackIcon, feedbackBadgeClass } from '../../shared/components/feedback.js';

// TOAST THÔNG BÁO TĨNH (GÓC PHẢI TRÊN, KHÔNG NHẢY GIẬT)
export default function AdminToast() {
  const { adminToast, setAdminToast } = useAdmin();

  if (!(adminToast)) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-white text-slate-900 rounded-2xl border-2 border-slate-200 shadow-2xl p-4 flex items-start space-x-3">
      <div className={`p-2 rounded-xl text-base font-black shrink-0 ${feedbackBadgeClass(adminToast.type)}`}>
        {feedbackIcon(adminToast.type)}
      </div>
      <div className="flex-1 min-w-0">
        {adminToast.title && (
          <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide">
            {adminToast.title}
          </h4>
        )}
        <p className="text-xs text-slate-600 font-medium whitespace-pre-line mt-0.5">
          {adminToast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setAdminToast(null)}
        className="text-slate-400 hover:text-slate-600 text-base font-bold ml-1"
      >
        ×
      </button>
    </div>
  );
}
