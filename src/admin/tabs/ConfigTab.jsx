import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAdmin } from '../AdminContext.js';
import ExamTimingCard from '../config/ExamTimingCard.jsx';
import RoomPasswordCard from '../config/RoomPasswordCard.jsx';
import ExamBankCard from '../config/ExamBankCard.jsx';
import AttemptsCard from '../config/AttemptsCard.jsx';
import DriveSyncCard from '../config/DriveSyncCard.jsx';
import RetentionCard from '../config/RetentionCard.jsx';
import AuditLogCard from '../config/AuditLogCard.jsx';

export default function ConfigTab() {
  const { config, configSavedNotice } = useAdmin();

  return (
    <div className="space-y-6 max-w-4xl">
      
      {configSavedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <span>✓</span>
          <span>{configSavedNotice}</span>
        </div>
      )}

      {/* 1. CẤU HÌNH THỜI GIAN & CHẾ ĐỘ TRỘN ĐỀ THI */}
      <ExamTimingCard />

      {/* 2. MẬT KHẨU PHÒNG THI */}
      <RoomPasswordCard />

      {/* 2. TÀI KHOẢN GIÁO VIÊN & KHO MÃ ĐỀ CHÍNH THỨC */}
      <ExamBankCard />

      {/* LƯỢT THI CHÍNH THỨC THEO MÃ LMS */}
      <AttemptsCard />

      {/* 3. KẾT NỐI GOOGLE DRIVE & GOOGLE SHEETS */}
      <DriveSyncCard />

      {/* 4. QUẢN LÝ VÒNG ĐỜI KỲ THI & DỌN DẸP DỮ LIỆU AN TOÀN (2–3 TUẦN) */}
      <RetentionCard />

      {/* 5. NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG) */}
      <AuditLogCard />

    </div>
  );
}
