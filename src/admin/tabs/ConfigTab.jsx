import React from 'react';
import { useAdmin } from '../AdminContext.js';
import ExamTimingCard from '../config/ExamTimingCard.jsx';
import StudentReviewAccessCard from '../config/StudentReviewAccessCard.jsx';
import ExamAllocationCard from '../config/ExamAllocationCard.jsx';
import GuidanceConfigCard from '../config/GuidanceConfigCard.jsx';
import RoomPasswordCard from '../config/RoomPasswordCard.jsx';
import ExamBankCard from '../config/ExamBankCard.jsx';
import AttemptsCard from '../config/AttemptsCard.jsx';
import GeminiConfigCard from '../config/GeminiConfigCard.jsx';
import DriveSyncCard from '../config/DriveSyncCard.jsx';
import RetentionCard from '../config/RetentionCard.jsx';
import AuditLogCard from '../config/AuditLogCard.jsx';

export default function ConfigTab() {
  const { configSavedNotice } = useAdmin();

  return (
    <div className="space-y-3 max-w-5xl">
      
      {configSavedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <span>✓</span>
          <span>{configSavedNotice}</span>
        </div>
      )}

      <h2 className="text-lg font-bold text-blue-950">Cấu hình hệ thống</h2>
      {[
        ['Thi & ôn tập', <><ExamTimingCard /><RoomPasswordCard /><AttemptsCard /></>],
        ['Hướng dẫn & quyền xem bài', <><GuidanceConfigCard /><StudentReviewAccessCard /></>],
        ['Kho đề & phân mã', <><ExamAllocationCard /><ExamBankCard /></>],
        ['Chấm AI & lưu trữ', <><GeminiConfigCard /><DriveSyncCard /></>],
        ['Dọn dữ liệu & nhật ký', <><RetentionCard /><AuditLogCard /></>]
      ].map(([title, content], index) => (
        <details key={title} open={index === 0} className="rounded-xl border border-slate-200 bg-white group">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-blue-950">{title}</summary>
          <div className="p-3 pt-0 space-y-4">{content}</div>
        </details>
      ))}

    </div>
  );
}
