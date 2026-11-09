import React from 'react';
import { StudentLanguageProvider } from './StudentLanguage.jsx';
import { StudentContext } from './StudentContext.js';
import { useStudentController } from './hooks/useStudentController.js';
import LockScreen from './components/LockScreen.jsx';
import ViolationWarningModal from './components/ViolationWarningModal.jsx';
import SubmitConfirmModal from './components/SubmitConfirmModal.jsx';
import ProctorNoticeModal from './components/ProctorNoticeModal.jsx';
import StudentHeader from './components/StudentHeader.jsx';
import NoticeDialog from './components/NoticeDialog.jsx';
import EntryScreen from './screens/EntryScreen.jsx';
import ExamScreen from './screens/ExamScreen.jsx';
import ResultScreen from './screens/ResultScreen.jsx';
import LocalSandboxBanner from '../shared/components/LocalSandboxBanner.jsx';

function App() {
  const student = useStudentController();

  return (
    <StudentLanguageProvider><StudentContext.Provider value={student}>
      <div className={`${student.examState === 'in_progress' ? 'student-workspace' : student.examState === 'submitted' ? 'student-workspace student-result-workspace' : 'min-h-screen'} bg-slate-100 text-slate-900`}>
      <LocalSandboxBanner />
      
        {/* MÀN HÌNH PHONG TỎA KHÓA BÀI THI KHI VI PHẠM 3 LẦN HOẶC GIÁM THỊ KHÓA */}
        <LockScreen />

        {/* MODAL CẢNH BÁO VI PHẠM (CHỐNG GIAN LẬN TOÀN MÀN HÌNH) */}
        <ViolationWarningModal />

        {/* MODAL XÁC NHẬN NỘP BÀI THI */}
        <SubmitConfirmModal />

        {/* MODAL THÔNG BÁO TỪ GIÁO VIÊN / LỆNH GIÁM THỊ PHÒNG THI */}
        <ProctorNoticeModal />

        {/* HEADER CHÍNH — NỀN TRẮNG SÁNG, LOGO TO RÕ, ĐỘ TƯƠNG PHẢN CAO, RESPONSIVE ĐA THIẾT BỊ */}
        <StudentHeader />

        {/* NỘI DUNG CHÍNH */}
        <main className={['in_progress','submitted'].includes(student.examState) ? 'student-workspace-main ahs-page-frame' : 'ahs-page-frame px-4 py-6 sm:py-8'}>
        
          {/* 1. MÀN HÌNH CHỌN CHẾ ĐỘ & ĐĂNG KÝ VÀO PHÒNG LÀM BÀI */}
          <EntryScreen />

          {/* 2 & 3. MÀN HÌNH LÀM BÀI 1 CÂU / LẦN (NỀN TRẮNG SÁNG, TƯƠNG PHẢN CAO, ĐẸP MẮT) */}
          <ExamScreen />

          {/* 4. MÀN HÌNH KẾT QUẢ BÀI LÀM (CHUẨN TƯƠNG PHẢN, CHỤP ẢNH TÊN CHUẨN, MỞ ĐÁP ÁN TỰ LUẬN) */}
          <ResultScreen />

        </main>

        {/* MODAL THÔNG BÁO TĨNH (KHÔNG NHẢY GIẬT, THAY THẾ ALERT) */}
        <NoticeDialog />
      </div>
    </StudentContext.Provider></StudentLanguageProvider>
  );
}

export default App;
