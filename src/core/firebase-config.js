/**
 * firebase-config.js
 * Cấu hình và đồng bộ dữ liệu đám mây Google Firebase Firestore cho Asian School LMS
 * Đồng bộ thời gian thực: Submissions, Live Sessions, Proctor Commands
 */

(function () {
  // Firebase configuration được cung cấp cho dự án ahs-lms
  const firebaseConfig = {
    apiKey: "AIzaSyDCP1lUNYeiJbZuUfOwe-as7Eg13xIAzF8",
    authDomain: "ahs-lms.firebaseapp.com",
    projectId: "ahs-lms",
    storageBucket: "ahs-lms.firebasestorage.app",
    messagingSenderId: "616832470304",
    appId: "1:616832470304:web:ca3845c4de591a275e1b45",
    measurementId: "G-PY852P1S42"
  };

  let app = null;
  let db = null;
  let analytics = null;
  let syncStatus = {
    connected: false,
    firestoreReady: false,
    lastError: null,
    lastSyncAt: null
  };

  function updateStatus(updates) {
    syncStatus = { ...syncStatus, ...updates };
    if (typeof window !== 'undefined') {
      window.AsianSchoolCloudSyncStatus = syncStatus;
      window.dispatchEvent(new CustomEvent('asian-school-cloud-sync', { detail: syncStatus }));
    }
  }

  // Khởi tạo Firebase nếu thư viện SDK compat đã tải
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
      } else {
        app = firebase.app();
      }

      if (typeof firebase.firestore === 'function') {
        db = firebase.firestore();
        // Cho phép lưu cache offline trên trình duyệt
        try {
          db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('[Firebase] Đa tab đang mở, persistence kích hoạt tab đầu tiên.');
            } else if (err.code === 'unimplemented') {
              console.warn('[Firebase] Trình duyệt không hỗ trợ IndexedDB persistence.');
            }
          });
        } catch (e) {
          // ignore persistence errors on unsupported contexts
        }
      }

      if (typeof firebase.analytics === 'function') {
        try {
          analytics = firebase.analytics();
        } catch (e) {
          console.warn('[Firebase Analytics] Lưu ý:', e.message);
        }
      }

      updateStatus({
        connected: true,
        firestoreReady: !!db,
        lastError: null
      });

      console.log('✅ [Firebase] Khởi tạo thành công kết nối Cloud Firestore (Project: ahs-lms)');
    } catch (err) {
      console.warn('⚠️ [Firebase] Khởi tạo không thành công:', err.message);
      updateStatus({
        connected: false,
        firestoreReady: false,
        lastError: err.message
      });
    }
  } else {
    console.warn('ℹ️ [Firebase] SDK chưa được nạp qua CDN. Hệ thống chuyển sang chế độ LocalStorage cục bộ.');
    updateStatus({
      connected: false,
      firestoreReady: false,
      lastError: 'SDK not loaded'
    });
  }

  // Kết nối lắng nghe dữ liệu hai chiều giữa Firestore và AsianSchoolStorage
  function attachCloudListeners() {
    if (!db || typeof window === 'undefined' || !window.AsianSchoolStorage) return;

    const storage = window.AsianSchoolStorage;
    const pathname = (window.location && window.location.pathname) || '';
    const isStudentPortal = pathname.includes('/test');

    // 1. Đồng bộ Submissions từ Firestore (CHỈ DÀNH CHO ADMIN)
    // Học sinh TUYỆT ĐỐI KHÔNG lắng nghe để bảo mật dữ liệu bài thi và tránh quá tải đọc quota Firestore
    if (!isStudentPortal) {
      try {
        db.collection('submissions').onSnapshot(
          (snapshot) => {
            if (!snapshot || snapshot.empty) return;
            const cloudList = [];
            snapshot.forEach((doc) => {
              cloudList.push({ id: doc.id, ...doc.data() });
            });

            // Hợp nhất vào LocalStorage của AsianSchoolStorage
            const currentLocal = storage.getSubmissions();
            const localMap = new Map();
            currentLocal.forEach((sub) => { if (sub.id) localMap.set(sub.id, sub); });

            let hasNewOrUpdated = false;
            cloudList.forEach((cloudItem) => {
              const local = localMap.get(cloudItem.id);
              if (!local) {
                localMap.set(cloudItem.id, cloudItem);
                hasNewOrUpdated = true;
              } else {
                // Cập nhật nếu cloud có trạng thái chấm mới hơn
                if (cloudItem.isGraded && !local.isGraded) {
                  localMap.set(cloudItem.id, { ...local, ...cloudItem });
                  hasNewOrUpdated = true;
                } else if (cloudItem.gradedAt && local.gradedAt && cloudItem.gradedAt > local.gradedAt) {
                  localMap.set(cloudItem.id, { ...local, ...cloudItem });
                  hasNewOrUpdated = true;
                }
              }
            });

            if (hasNewOrUpdated) {
              const merged = Array.from(localMap.values()).sort(
                (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
              );
              localStorage.setItem('asian_school_submissions_v1', JSON.stringify(merged));
              storage.notify(storage.submissionListeners, merged);
            }

            updateStatus({ lastSyncAt: new Date().toISOString() });
          },
          (error) => {
            console.warn('[Firestore] Lắng nghe Submissions thất bại:', error.message);
            updateStatus({ lastError: error.message });
          }
        );
      } catch (e) {
        console.warn('[Firestore] Error attaching submissions listener:', e);
      }
    }

    // 2. Đồng bộ Live Sessions từ Firestore (CHỈ DÀNH CHO ADMIN)
    // Học sinh không cần xem phiên của bạn khác -> Tiết kiệm 99.9% lưu lượng và lượt đọc
    if (!isStudentPortal) {
      try {
        db.collection('live_sessions').onSnapshot(
          (snapshot) => {
            if (!snapshot) return;
            const cloudSessions = [];
            const now = Date.now();
            snapshot.forEach((doc) => {
              const data = doc.data();
              // Lọc các phiên còn ping trong vòng 90 phút
              if ((now - (data.lastPing || 0)) < 90 * 60 * 1000) {
                cloudSessions.push({ sessionId: doc.id, ...data });
              }
            });

            const currentSessions = storage.getLiveSessions();
            const sMap = new Map();
            currentSessions.forEach((s) => { if (s.sessionId) sMap.set(s.sessionId, s); });
            cloudSessions.forEach((s) => { sMap.set(s.sessionId, s); });

            const mergedSessions = Array.from(sMap.values());
            localStorage.setItem('asian_school_live_sessions_v1', JSON.stringify(mergedSessions));
            storage.notify(storage.liveListeners, mergedSessions);
          },
          (error) => {
            console.warn('[Firestore] Lắng nghe Live Sessions thất bại:', error.message);
          }
        );
      } catch (e) {
        console.warn('[Firestore] Error attaching live_sessions listener:', e);
      }
    }
      console.warn('[Firestore] Error attaching live_sessions listener:', e);
    }

    // 3. Đồng bộ Proctor Commands (lệnh giám thị: cộng giờ, thu bài, mở khóa)
    try {
      db.collection('proctor_commands').onSnapshot(
        (snapshot) => {
          if (!snapshot) return;
          const cloudCmds = [];
          snapshot.forEach((doc) => {
            cloudCmds.push({ cmdId: doc.id, ...doc.data() });
          });

          const currentCmds = storage.getProctorCommandsRaw();
          const cMap = new Map();
          currentCmds.forEach((c) => { if (c.cmdId) cMap.set(c.cmdId, c); });
          cloudCmds.forEach((c) => { cMap.set(c.cmdId, c); });

          const mergedCmds = Array.from(cMap.values()).slice(-50);
          localStorage.setItem('asian_school_proctor_commands_v1', JSON.stringify(mergedCmds));
          storage.notify(storage.cmdListeners, mergedCmds);
        },
        (error) => {
          console.warn('[Firestore] Lắng nghe Proctor Commands thất bại:', error.message);
        }
      );
    } catch (e) {
      console.warn('[Firestore] Error attaching proctor_commands listener:', e);
    }

    // 4. Đồng bộ Cấu hình Điều phối Lớp học & Phòng thi (exam_config)
    try {
      db.collection('exam_config').doc('global_config').onSnapshot(
        (doc) => {
          if (!doc || !doc.exists) return;
          const cloudConfig = doc.data();
          const currentConfig = storage.getConfig();
          const merged = { ...currentConfig, ...cloudConfig };
          localStorage.setItem('asian_school_exam_config_v1', JSON.stringify(merged));
          storage.notify(storage.configListeners, merged);
        },
        (error) => {
          console.warn('[Firestore] Lắng nghe exam_config thất bại:', error.message);
        }
      );
    } catch (e) {
      console.warn('[Firestore] Error attaching exam_config listener:', e);
    }
  }

  // Tự động gắn kết khi DOM và AsianSchoolStorage sẵn sàng
  if (typeof window !== 'undefined') {
    window.firebaseApp = app;
    window.firebaseDb = db;
    window.firebaseAnalytics = analytics;
    window.AsianSchoolCloudSyncStatus = syncStatus;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachCloudListeners);
    } else {
      setTimeout(attachCloudListeners, 500);
    }
  }
})();
