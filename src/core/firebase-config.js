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
              // Cùng id nhưng khác giờ nộp trên server: giáo viên đã xóa lượt cũ, đây là bài nộp mới -> thay bản trên máy
              const isNewSubmission = local && cloudItem.serverSubmittedAt
                && toMillis(cloudItem.serverSubmittedAt) !== toMillis(local.serverSubmittedAt);
              if (!local || isNewSubmission) {
                localMap.set(cloudItem.id, cloudItem);
                hasNewOrUpdated = true;
              } else {
                // Cập nhật nếu cloud có trạng thái chấm mới hơn
                if ((cloudItem.isGraded && !local.isGraded) || (cloudItem.autoGradedAt && !local.autoGradedAt)) {
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

  // 5. Kho mã đề kèm đáp án & mật khẩu phòng thi (CHỈ GIÁO VIÊN, xem firestore.rules)
  // Nạp vào window.EXAM_DATA_G{8,9,10}.officialExams trong bộ nhớ để các tab Đáp án / Chấm tự luận dùng như cũ
  let latestExamBank = null;

  function attachTeacherListeners() {
    const storage = window.AsianSchoolStorage;
    // Bài thi mới nộp: trang quản trị chấm trắc nghiệm ngay khi có đủ exam_bank
    if (storage) {
      storage.onSubmissionsChange(() => {
        if (latestExamBank) storage.autoGradeExamSubmissions(latestExamBank);
      });
    }
    db.collection('exam_bank').onSnapshot(
      (snapshot) => {
        const byGrade = { 8: {}, 9: {}, 10: {} };
        snapshot.forEach((doc) => {
          const d = doc.data();
          if (byGrade[d.grade] && d.exam) byGrade[d.grade][d.code] = { ...d.exam, active: d.active !== false };
        });
        [8, 9, 10].forEach((g) => {
          const key = 'EXAM_DATA_G' + g;
          if (window[key]) window[key].officialExams = byGrade[g];
        });
        latestExamBank = byGrade;
        // Danh sách mã đề đang bật (công khai) để rules kiểm tra mã đề học sinh nhận
        const activeCodes = {};
        [8, 9, 10].forEach((g) => {
          activeCodes[String(g)] = Object.keys(byGrade[g]).filter((c) => byGrade[g][c].active).sort();
        });
        if (storage && JSON.stringify(storage.getConfig().activeCodes || {}) !== JSON.stringify(activeCodes)) {
          storage.saveConfig({ activeCodes });
        }
        if (storage) storage.autoGradeExamSubmissions(latestExamBank);
        window.dispatchEvent(new CustomEvent('asian-school-exam-bank', { detail: byGrade }));
      },
      (error) => console.warn('[Firestore] Lắng nghe exam_bank thất bại:', error.message)
    );
    db.collection('exam_secrets').doc('room').onSnapshot(
      (doc) => {
        if (!doc || !doc.exists || !storage) return;
        const merged = { ...storage.getConfig(), examPassword: doc.data().examPassword || '' };
        localStorage.setItem('asian_school_exam_config_v1', JSON.stringify(merged));
        storage.notify(storage.configListeners, merged);
      },
      (error) => console.warn('[Firestore] Lắng nghe exam_secrets thất bại:', error.message)
    );

    // URL/token webhook Google Drive: chỉ giáo viên giữ (học sinh không còn gửi thẳng lên Sheets)
    db.collection('exam_secrets').doc('drive').onSnapshot(
      (doc) => {
        if (!doc || !doc.exists || !storage) return;
        const d = doc.data();
        const merged = {
          ...storage.getConfig(),
          googleDriveWebhookUrl: d.googleDriveWebhookUrl || '',
          googleDriveWebhookToken: d.googleDriveWebhookToken || ''
        };
        localStorage.setItem('asian_school_exam_config_v1', JSON.stringify(merged));
        storage.notify(storage.configListeners, merged);
      },
      (error) => console.warn('[Firestore] Lắng nghe exam_secrets/drive thất bại:', error.message)
    );
    migrateDriveSecret();

    // Hàng chờ điểm ôn tập: trang quản trị đẩy lên Google Sheets rồi xóa
    db.collection('practice_results').onSnapshot(
      (snapshot) => {
        if (!storage) return;
        const rows = [];
        snapshot.forEach((doc) => rows.push({ ...doc.data(), id: doc.id }));
        storage.processPracticeQueue(rows, (id) => db.collection('practice_results').doc(id).delete());
      },
      (error) => console.warn('[Firestore] Lắng nghe practice_results thất bại:', error.message)
    );
  }

  // Bản cũ lưu URL/token webhook trong exam_config công khai: chuyển sang exam_secrets/drive rồi xóa khỏi exam_config
  async function migrateDriveSecret() {
    try {
      const cfgRef = db.collection('exam_config').doc('global_config');
      const snap = await cfgRef.get();
      const d = snap.exists ? snap.data() : {};
      if (d.googleDriveWebhookUrl === undefined && d.googleDriveWebhookToken === undefined) return;
      const secretRef = db.collection('exam_secrets').doc('drive');
      const secret = await secretRef.get();
      if (!secret.exists || !secret.data().googleDriveWebhookUrl) {
        await secretRef.set({
          googleDriveWebhookUrl: d.googleDriveWebhookUrl || '',
          googleDriveWebhookToken: d.googleDriveWebhookToken || ''
        }, { merge: true });
      }
      const FieldValue = firebase.firestore.FieldValue;
      await cfgRef.update({ googleDriveWebhookUrl: FieldValue.delete(), googleDriveWebhookToken: FieldValue.delete() });
      console.log('[Firebase] Đã chuyển URL/token webhook sang exam_secrets/drive.');
    } catch (e) {
      console.warn('[Firebase] Chuyển URL/token webhook thất bại:', e.message);
    }
  }

  // Xác thực: học sinh đăng nhập ẩn danh; giáo viên đăng nhập Google.
  // Danh sách này phải khớp hàm isTeacher() trong firestore.rules (rules mới là nơi chặn thật).
  const TEACHER_EMAILS = ['trangiahuy8444@gmail.com'];
  const auth = (app && typeof firebase.auth === 'function') ? firebase.auth() : null;
  const authListeners = [];
  let authState = { user: null, isTeacher: false, ready: false };

  function setAuthState(next) {
    authState = next;
    authListeners.forEach((cb) => { try { cb(authState); } catch (e) { /* bỏ qua */ } });
  }

  // --- PHÒNG THI CHÍNH THỨC (gói Spark: không có Cloud Functions, firestore.rules kiểm tra mọi bước) ---

  function lmsKey(studentId) {
    return String(studentId || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);
  }

  function waitForUser() {
    if (!auth || !db) return Promise.reject(new Error('Chưa kết nối được Firebase. Em kiểm tra mạng rồi tải lại trang.'));
    if (auth.currentUser) return Promise.resolve(auth.currentUser);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsub();
        reject(new Error('Chưa đăng nhập được phiên làm bài. Em kiểm tra mạng rồi tải lại trang.'));
      }, 15000);
      const unsub = auth.onAuthStateChanged((user) => {
        if (!user) return;
        clearTimeout(timer);
        unsub();
        resolve(user);
      });
    });
  }

  // Firestore giữ lệnh ghi khi mất mạng và tự gửi lại; ở đây chỉ báo cho học sinh nếu chờ quá lâu
  function withTimeout(promise, ms, message) {
    return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))]);
  }

  // Phải khớp hàm codeAllowed trong firestore.rules
  function pickExamCode(cfg, grade, studentClass) {
    const active = (cfg.activeCodes || {})[String(grade)] || [];
    const mode = cfg.codeAllocationMode || 'class_assigned';
    if (mode === 'random') return active[Math.floor(Math.random() * active.length)] || null;
    const code = mode === 'fixed' ? cfg.fixedCode : (cfg.classMapping || {})[studentClass];
    return active.includes(code) ? code : null;
  }

  function toMillis(t) {
    if (!t) return null;
    if (typeof t.toMillis === 'function') return t.toMillis();
    return typeof t.seconds === 'number' ? t.seconds * 1000 : null;
  }

  function formatDuration(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins} phút ${secs < 10 ? '0' : ''}${secs} giây`;
  }

  async function startExam(data) {
    const user = await waitForUser();
    const uid = user.uid;
    const grade = Number(data.grade);
    const key = lmsKey(data.studentId);
    if (![8, 9, 10].includes(grade) || !key) throw new Error('Khối hoặc mã LMS chưa hợp lệ.');
    const FieldValue = firebase.firestore.FieldValue;

    const cfgSnap = await db.collection('exam_config').doc('global_config').get();
    const cfg = cfgSnap.exists ? cfgSnap.data() : {};
    const classMode = (cfg.classAccessControl || {})[data.studentClass] || cfg.defaultClassMode || 'practice_only';
    if (!['exam_only', 'both_open'].includes(classMode)) {
      throw new Error(`Lớp ${data.studentClass} chưa được mở ca thi chính thức.`);
    }

    const attemptId = `g${grade}_${key}`;
    const attemptRef = db.collection('exam_attempts').doc(attemptId);
    // Mật khẩu em nhập chỉ để rules đối chiếu với mật khẩu phòng thi; không ai đọc lại được
    await db.collection('exam_keys').doc(uid).set({
      password: String(data.password || '').trim().toLowerCase(),
      at: FieldValue.serverTimestamp()
    });

    const readOwnAttempt = () => attemptRef.get({ source: 'server' })
      .then((snap) => (snap.exists ? snap.data() : null))
      .catch(() => null);
    const denied = new Error('Không vào được phòng thi: mật khẩu chưa đúng, lớp chưa mở ca thi hoặc mã đề chưa được bật. Em báo Thầy/Cô giám thị.');

    let attempt = await readOwnAttempt();
    if (!attempt) {
      const code = pickExamCode(cfg, grade, data.studentClass);
      if (!code) throw new Error(`Chưa có mã đề đang bật cho Lớp ${data.studentClass}. Em báo Thầy/Cô giám thị.`);
      try {
        await attemptRef.set({
          grade,
          studentId: key,
          studentClass: data.studentClass,
          fullName: String(data.fullName || '').trim().slice(0, 80),
          uid,
          examCode: code,
          attemptsUsed: 1,
          submitted: false,
          startedAt: FieldValue.serverTimestamp(),
          deviceChanges: 0
        });
      } catch (createErr) {
        // Mã LMS này đã có lượt thi từ máy khác: nhận lại lượt bằng mật khẩu phòng thi
        try {
          await attemptRef.update({ uid, deviceChanges: FieldValue.increment(1) });
        } catch (takeoverErr) {
          throw denied;
        }
      }
      attempt = await readOwnAttempt();
      if (!attempt) throw denied;
    }

    if (attempt.submitted) {
      const allowed = Number.isInteger(attempt.allowedAttempts) ? attempt.allowedAttempts : (cfg.maxExamAttempts || 1);
      if (attempt.attemptsUsed >= allowed) {
        throw new Error(`Mã LMS ${key} đã dùng hết ${allowed} lượt làm bài thi chính thức. Nếu cần thi lại, em báo Thầy/Cô.`);
      }
      const code = pickExamCode(cfg, grade, attempt.studentClass);
      if (!code) throw new Error(`Chưa có mã đề đang bật cho Lớp ${attempt.studentClass}. Em báo Thầy/Cô giám thị.`);
      try {
        await attemptRef.update({
          attemptsUsed: FieldValue.increment(1),
          submitted: false,
          startedAt: FieldValue.serverTimestamp(),
          examCode: code,
          submittedAt: FieldValue.delete()
        });
      } catch (e) {
        throw denied;
      }
      attempt = await readOwnAttempt();
      if (!attempt) throw denied;
    }

    const examDocId = `g${grade}_${attempt.examCode}`;
    await db.collection('exam_sessions').doc(uid).set({ attemptId, examDocId });
    const examSnap = await db.collection('exam_public').doc(examDocId).get({ source: 'server' });
    if (!examSnap.exists) throw new Error(`Không tìm thấy mã đề ${attempt.examCode} Khối ${grade}. Em báo Thầy/Cô giám thị.`);
    return {
      examCode: attempt.examCode,
      exam: examSnap.data().exam,
      durationMinutes: cfg.examDurationMinutes || 45,
      startedAtMs: toMillis(attempt.startedAt) || Date.now()
    };
  }

  async function submitExam(data) {
    const user = await waitForUser();
    const grade = Number(data.grade);
    const attemptId = `g${grade}_${lmsKey(data.studentId)}`;
    const attemptRef = db.collection('exam_attempts').doc(attemptId);
    let snap;
    try {
      snap = await attemptRef.get();
    } catch (e) {
      throw new Error('Lượt làm bài này đang mở trên thiết bị khác. Em báo giám thị.');
    }
    if (!snap.exists) throw new Error('Không tìm thấy lượt làm bài. Em báo giám thị.');
    const a = snap.data();
    const subId = `${attemptId}_${a.attemptsUsed}`;
    // Bỏ giá trị undefined (Firestore không nhận) và tách khỏi state React
    const answers = JSON.parse(JSON.stringify(data.answers || { mcq: {}, tf: {}, essay: {} }));
    const violations = Math.max(0, Math.min(99, parseInt(data.violations, 10) || 0));
    const submittedAt = new Date().toISOString();

    if (!a.submitted) {
      const FieldValue = firebase.firestore.FieldValue;
      const batch = db.batch();
      batch.update(attemptRef, { submitted: true, submittedAt: FieldValue.serverTimestamp() });
      batch.set(db.collection('submissions').doc(subId), {
        id: subId,
        uid: user.uid,
        attemptId,
        sessionId: String(data.sessionId || ''),
        fullName: a.fullName,
        studentClass: a.studentClass,
        studentId: a.studentId,
        grade,
        mode: 'exam',
        examCode: a.examCode,
        attemptNumber: a.attemptsUsed,
        deviceChanges: a.deviceChanges || 0,
        answers,
        violations,
        startedAt: a.startedAt,
        submittedAt,
        serverSubmittedAt: FieldValue.serverTimestamp(),
        isGraded: false,
        essayScores: {},
        essayTotal: 0,
        teacherFeedback: ''
      });
      await withTimeout(batch.commit(), 20000,
        'Mạng chậm, bài chưa gửi xong. Em giữ nguyên trang này, kiểm tra mạng rồi bấm nộp lại.');
    }

    const startMs = toMillis(a.startedAt);
    const durationSeconds = startMs ? Math.max(0, Math.round((Date.now() - startMs) / 1000)) : 0;
    return {
      mode: 'exam',
      pendingGrading: true,
      submissionId: subId,
      examCode: a.examCode,
      violations,
      penaltyPoints: 0,
      essayAnswered: Object.keys(answers.essay || {}).length,
      durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      submittedAt
    };
  }

  if (typeof window !== 'undefined') {
    window.firebaseApp = app;
    window.firebaseDb = db;
    window.firebaseAnalytics = analytics;
    window.AsianSchoolCloudSyncStatus = syncStatus;

    window.AsianSchoolAuth = {
      getState: () => authState,
      onChange(cb) {
        authListeners.push(cb);
        if (authState.ready) cb(authState);
        return () => { const i = authListeners.indexOf(cb); if (i >= 0) authListeners.splice(i, 1); };
      },
      signInTeacher() {
        if (!auth) return Promise.reject(new Error('Chưa nạp Firebase Auth.'));
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        return auth.signInWithPopup(provider);
      },
      signOut() {
        return auth ? auth.signOut() : Promise.resolve();
      },
      uid() {
        return auth && auth.currentUser ? auth.currentUser.uid : null;
      }
    };

    window.AsianSchoolCloud = { startExam, submitExam };

    const pathname = (window.location && window.location.pathname) || '';
    const isStudentPortal = pathname.includes('/test');
    let listenersAttached = false;
    let teacherListenersAttached = false;

    const onReady = (fn) => {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
      else setTimeout(fn, 0);
    };

    if (auth) {
      auth.onAuthStateChanged(async (user) => {
        if (!user && isStudentPortal) {
          auth.signInAnonymously().catch((err) => {
            console.warn('[Firebase Auth] Đăng nhập ẩn danh thất bại:', err.message);
            updateStatus({ lastError: err.message });
          });
          return;
        }
        let isTeacher = false;
        if (user && !user.isAnonymous) {
          isTeacher = user.emailVerified && TEACHER_EMAILS.includes(String(user.email || '').toLowerCase());
        }
        setAuthState({ user, isTeacher, ready: true });
        // Trang học sinh: gắn listener khi đã có phiên ẩn danh. Trang quản trị: chỉ khi là giáo viên.
        if (user && !listenersAttached && (isStudentPortal || isTeacher)) {
          listenersAttached = true;
          onReady(attachCloudListeners);
        }
        if (isTeacher && !teacherListenersAttached && !isStudentPortal) {
          teacherListenersAttached = true;
          onReady(attachTeacherListeners);
        }
      });
    } else {
      setAuthState({ user: null, isTeacher: false, ready: true });
    }
  }
})();
