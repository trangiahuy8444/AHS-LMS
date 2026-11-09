import React, { useEffect, useRef } from 'react';
import { AdminContext } from './AdminContext.js';
import { useAdminController } from './hooks/useAdminController.js';
import LoginScreen from './LoginScreen.jsx';
import LiveTab from './tabs/LiveTab.jsx';
import SubmissionsTab from './tabs/SubmissionsTab.jsx';
import AnswersTab from './tabs/AnswersTab.jsx';
import AnalyticsTab from './tabs/AnalyticsTab.jsx';
import PrintTab from './tabs/PrintTab.jsx';
import ConfigTab from './tabs/ConfigTab.jsx';
import EssayGradingModal from './components/EssayGradingModal.jsx';
import BroadcastModal from './components/BroadcastModal.jsx';
import AdminToast from './components/AdminToast.jsx';
import AdminDialog from './components/AdminDialog.jsx';
import LocalSandboxBanner from '../shared/components/LocalSandboxBanner.jsx';
import LocalSandboxTab from './tabs/LocalSandboxTab.jsx';

function AdminApp() {
  const admin = useAdminController();
  const { activeTab, setActiveTab, liveSessions, submissions, setShowBroadcastModal,
    cloudStatus, handleLogout, isAuthenticated } = admin;

  const headerRef = useRef(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () => header.parentElement.style.setProperty('--admin-header-height', `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(header);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <AdminContext.Provider value={admin}>
        <LocalSandboxBanner />
        <LoginScreen />
      </AdminContext.Provider>
    );
  }

  return (
    <AdminContext.Provider value={admin}>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
        <LocalSandboxBanner />
      
        <header ref={headerRef} className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print">
          <div className="ahs-page-frame px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src={window.ASIAN_SCHOOL_LOGO_BASE64 || '../assets/logo_asian_school.png'} alt="Asian School" className="h-9 w-auto" />
              <div>
                <h1 className="font-bold text-blue-950 text-sm">AHS-LMS · Quản trị</h1>
                <p className={`text-xs ${cloudStatus?.connected ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {cloudStatus?.connected ? 'Đang đồng bộ' : 'Chưa kết nối máy chủ'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowBroadcastModal(true)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white">Gửi thông báo</button>
              <button type="button" onClick={handleLogout} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Đăng xuất</button>
            </div>
          </div>
          <nav aria-label="Chức năng quản trị" className="ahs-page-frame px-3 pb-2 grid grid-cols-4 lg:grid-cols-7 gap-1">
            {[
              ['live', 'Giám sát', liveSessions.filter(session => ['in_progress', 'practicing', 'locked'].includes(session.status)).length],
              ['submissions', 'Bài nộp & chấm', submissions.length],
              ['answers', 'Đáp án'], ['analytics', 'Thống kê'], ['print', 'In bảng điểm'],
              ['config', 'Cấu hình'], ['sandbox', 'Thử nghiệm']
            ].map(([tab, label, count]) => (
              <button key={tab} type="button" aria-current={activeTab === tab ? 'page' : undefined} onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-2 py-2 text-xs font-bold flex flex-wrap items-center justify-center gap-1 ${activeTab === tab ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {label}{count > 0 && <span className="rounded-full bg-black/10 px-1.5 text-[10px]">{count}</span>}
              </button>
            ))}
          </nav>
        </header>

        <main className="ahs-page-frame px-4 py-5 flex-1 print:max-w-none print:p-0 print:m-0">
        
          {/* TAB 1: GIÁM SÁT TRỰC TIẾP & ĐIỀU KHIỂN GIÁM THỊ */}
          {activeTab === 'live' && <LiveTab />}

          {/* TAB 2: CƠ SỞ DỮ LIỆU & CHẤM ĐIỂM TỰ LUẬN */}
          {activeTab === 'submissions' && <SubmissionsTab />}

          {/* TAB 3: TRA CỨU ĐÁP ÁN MASTER (GỒM CẢ 4 PHƯƠNG ÁN A,B,C,D & RUBRIC) */}
          {activeTab === 'answers' && <AnswersTab />}

          {/* TAB 4: PHÂN TÍCH KHẢO THÍ & PHỔ ĐIỂM (ITEM ANALYSIS) */}
          {activeTab === 'analytics' && <AnalyticsTab />}

          {/* TAB 5: IN BẢNG ĐIỂM CHUẨN A4 ASIAN SCHOOL */}
          {activeTab === 'print' && <PrintTab />}

          {/* TAB 6: CẤU HÌNH & BẢO MẬT ADMIN */}
          {activeTab === 'config' && <ConfigTab />}
          {activeTab === 'sandbox' && <LocalSandboxTab />}

        </main>

        {/* MODAL CHẤM ĐIỂM TỰ LUẬN TRỰC TIẾP */}
        <EssayGradingModal />

        {/* MODAL PHÁT THÔNG BÁO KHẨN / NHẮN TIN GIÁM THỊ */}
        <BroadcastModal />

        {/* TOAST THÔNG BÁO TĨNH (GÓC PHẢI TRÊN, KHÔNG NHẢY GIẬT) */}
        <AdminToast />

        {/* DIALOG XÁC NHẬN / THÔNG BÁO TĨNH (GIỮA MÀN HÌNH, KHÔNG GIẬT NẢY) */}
        <AdminDialog />

      </div>
    </AdminContext.Provider>
  );
}

export default AdminApp;
