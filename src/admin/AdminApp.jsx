import React from 'react';
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

function AdminApp() {
  const admin = useAdminController();
  const { activeTab, setActiveTab, liveSessions, submissions, config, setShowBroadcastModal,
    cloudStatus, handleLogout, isAuthenticated } = admin;

  if (!isAuthenticated) {
    return (
      <AdminContext.Provider value={admin}>
        <LoginScreen />
      </AdminContext.Provider>
    );
  }

  return (
    <AdminContext.Provider value={admin}>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      
        {/* HEADER CHÍNH CHUẨN ASIAN SCHOOL */}
        <header className="bg-[#1e3a8a] text-white shadow-md sticky top-0 z-40 border-b-2 border-amber-400 no-print">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded-2xl shadow-sm">
                <img
                  src={window.ASIAN_SCHOOL_LOGO_BASE64 || "../assets/logo_asian_school.png"}
                  alt="Logo Asian School"
                  className="h-11 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${cloudStatus?.connected ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-blue-900/60 text-blue-200 border border-blue-700'}`} title={cloudStatus?.connected ? 'Đang đồng bộ thời gian thực với Cloud Firestore (ahs-lms)' : 'Đang chạy lưu trữ cục bộ LocalStorage'}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cloudStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span>{cloudStatus?.connected ? 'Firebase Cloud' : 'Offline Mode'}</span>
                  </span>
                  <h1 className="font-black text-sm sm:text-base text-white tracking-wide uppercase">
                    HỆ THỐNG ĐIỀU HÀNH KHẢO THÍ & CHẤM ĐIỂM
                  </h1>
                </div>
                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  TRƯỜNG QUỐC TẾ Á CHÂU • GIÁO VIÊN: <span className="text-white">THẦY TRẦN GIA HUY</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow flex items-center space-x-1.5"
              >
                <span>📢</span>
                <span className="hidden sm:inline">Phát Thông Báo Khẩn</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-white text-xs font-bold border border-blue-700 transition"
              >
                Đăng Xuất 🚪
              </button>
            </div>
          </div>

          {/* THANH ĐIỀU HƯỚNG 6 TABS */}
          <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 overflow-x-auto border-t border-blue-900/80">
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'live'
                  ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
            >
              <span>📡</span>
              <span>Giám Sát & Lệnh Giám Thị</span>
              {liveSessions.filter(s => s.status === 'in_progress').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'submissions'
                  ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
            >
              <span>📋</span>
              <span>CSDL & Chấm Tự Luận</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-900 text-[10px] text-amber-300 font-mono">
                {submissions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('answers')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'answers'
                  ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
            >
              <span>🔑</span>
              <span>Tra Cứu Đáp Án Master</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'analytics'
                  ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
            >
              <span>📊</span>
              <span>Phân Tích Phổ Điểm</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('print')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'print'
                  ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
            >
              <span>🖨️</span>
              <span>In Bảng Điểm A4 Asian School</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-4 transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'config'
                  ? 'border-amber-400 text-amber-300 bg-blue-950/90 font-black'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-800/50'
              }`}
            >
              <span>⚙️</span>
              <span>Cấu Hình & Bảo Mật</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full no-print">
        
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
