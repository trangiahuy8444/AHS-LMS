/**
 * firebase-config.js
 * Cấu hình và đồng bộ dữ liệu đám mây Google Firebase Firestore cho Asian School LMS
 * Đồng bộ thời gian thực: Submissions, Live Sessions, Proctor Commands
 */

(function () {
  // Firebase configuration được cung cấp cho dự án ahs-lms
  const runtime = window.AsianSchoolRuntime;
  const isLocalSandbox = runtime?.mode === 'local-sandbox';
  const isWebSandbox = runtime?.mode === 'web-sandbox';
  const isSandbox = isLocalSandbox || isWebSandbox;
  if (['ahs-lms-sandbox.web.app','ahs-lms-sandbox.firebaseapp.com'].includes(window.location.hostname) && !isWebSandbox) {
    throw new Error('Website thử nhận nhầm bản dựng; không được kết nối hệ thống học sinh.');
  }
  if (isWebSandbox && (runtime.projectId !== 'ahs-lms-sandbox' || runtime.firebaseConfig?.projectId !== 'ahs-lms-sandbox' || runtime.firebaseConfig?.authDomain !== 'ahs-lms-sandbox.firebaseapp.com' || !['ahs-lms-sandbox.web.app','ahs-lms-sandbox.firebaseapp.com'].includes(window.location.hostname) || window.location.protocol !== 'https:')) {
    throw new Error('Bản thử trên web không được kết nối hệ thống học sinh.');
  }
  if (isLocalSandbox && (runtime.projectId !== 'demo-ahs-local' || runtime.host !== '127.0.0.1' || runtime.authPort !== 9098 || runtime.firestorePort !== 8188 || !['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.port !== '5188')) {
    throw new Error('Cấu hình hệ thống thử không hợp lệ; đã dừng để bảo vệ dữ liệu thật.');
  }
  const firebaseConfig = isLocalSandbox ? {
    apiKey: 'local-sandbox-not-a-real-key', authDomain: 'localhost', projectId: 'demo-ahs-local', appId: 'demo-ahs-local'
  } : isWebSandbox ? runtime.firebaseConfig : {
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

      if (isSandbox && app.options?.projectId !== firebaseConfig.projectId) throw new Error('Không được dùng Firebase thật trong hệ thống thử.');
      if (isLocalSandbox) {
        if (app.options?.projectId !== 'demo-ahs-local') throw new Error('Không được dùng Firebase thật trong hệ thống thử.');
        firebase.auth().useEmulator('http://127.0.0.1:9098', { disableWarnings: true });
      }

      if (typeof firebase.firestore === 'function') {
        db = firebase.firestore();
        if (isLocalSandbox) db.useEmulator('127.0.0.1', 8188);
        // Cho phép lưu cache offline trên trình duyệt
        try {
          if (!isLocalSandbox) db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
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

      console.log(isWebSandbox ? '🧪 Hệ thống thử trên web: ahs-lms-sandbox' : isLocalSandbox ? '🧪 Hệ thống thử cục bộ: demo-ahs-local' : '✅ [Firebase] Khởi tạo thành công kết nối Cloud Firestore (Project: ahs-lms)');
    } catch (err) {
      if (isSandbox) throw err; // Không dùng tiếp app thật hoặc lùi sang kết nối khác.
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
            if (!snapshot) return;

            const cloudList = [];
            const cloudIdSet = new Set();
            if (!snapshot.empty) {
              snapshot.forEach((doc) => {
                const item = { id: doc.id, ...doc.data() };
                cloudList.push(item);
                cloudIdSet.add(doc.id);
              });
            }

            // Hợp nhất vào LocalStorage của AsianSchoolStorage
            const currentLocal = storage.getSubmissions();
            const localMap = new Map();
            let changed = false;

            // Xóa khỏi local các bài thi chính thức đã bị xóa trên Cloud Firestore
            currentLocal.forEach((sub) => {
              if (sub.id) {
                const isExam = sub.mode === 'exam' || !sub.mode;
                if (isExam && !cloudIdSet.has(sub.id)) {
                  changed = true;
                  return; // Không giữ lại bản ghi đã bị xóa trên Cloud Firestore
                }
                localMap.set(sub.id, sub);
              }
            });

            cloudList.forEach((cloudItem) => {
              const local = localMap.get(cloudItem.id);
              // Cùng id nhưng khác giờ nộp trên server: giáo viên đã xóa lượt cũ, đây là bài nộp mới -> thay bản trên máy
              const isNewSubmission = local && cloudItem.serverSubmittedAt
                && toMillis(cloudItem.serverSubmittedAt) !== toMillis(local.serverSubmittedAt);
              if (!local || isNewSubmission) {
                localMap.set(cloudItem.id, cloudItem);
                changed = true;
              } else {
                // Cập nhật nếu cloud có trạng thái chấm mới hơn
                if ((cloudItem.isGraded && !local.isGraded) || (cloudItem.autoGradedAt && !local.autoGradedAt)) {
                  localMap.set(cloudItem.id, { ...local, ...cloudItem });
                  changed = true;
                } else if (cloudItem.gradedAt && local.gradedAt && cloudItem.gradedAt > local.gradedAt) {
                  localMap.set(cloudItem.id, { ...local, ...cloudItem });
                  changed = true;
                }
              }
            });

            if (changed || (snapshot.empty && currentLocal.length > 0)) {
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
            const cloudSessionIds = new Set();
            const now = Date.now();
            if (!snapshot.empty) {
              snapshot.forEach((doc) => {
                const data = doc.data();
                // Lọc các phiên còn ping trong vòng 90 phút
                if ((now - (data.lastPing || 0)) < 90 * 60 * 1000) {
                  cloudSessions.push({ sessionId: doc.id, ...data });
                  cloudSessionIds.add(doc.id);
                }
              });
            }

            const currentSessions = storage.getLiveSessions();
            const sMap = new Map();
            // Chỉ giữ lại các phiên còn tồn tại trên Cloud Firestore
            currentSessions.forEach((s) => {
              if (s.sessionId && cloudSessionIds.has(s.sessionId)) {
                sMap.set(s.sessionId, s);
              }
            });
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

    // 3. Đồng bộ Proctor Commands (lệnh giám thị: cộng giờ, thu bài, thông báo).
    // Học sinh chỉ đọc lệnh gửi cho uid của mình hoặc cả phòng (firestore.rules kiểm tra targetUid).
    try {
      const uid = auth && auth.currentUser ? auth.currentUser.uid : null;
      const cmdQuery = isStudentPortal
        ? db.collection('proctor_commands').where('targetUid', 'in', [uid || '-', 'all'])
        : db.collection('proctor_commands');
      cmdQuery.onSnapshot(
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
          if (window[key]) {
            window[key].officialExams = byGrade[g];
          } else {
            window[key] = { officialExams: byGrade[g] };
          }
        });
        latestExamBank = byGrade;
        window.AsianSchoolLatestExamBank = byGrade;
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
  const allowedTeacherEmails = isWebSandbox ? ['admin@ahs-lms-sandbox.invalid'] : TEACHER_EMAILS;
  const auth = (app && typeof firebase.auth === 'function') ? firebase.auth() : null;
  const authListeners = [];
  let authState = { user: null, isTeacher: false, ready: false };

  function setAuthState(next) {
    authState = next;
    authListeners.forEach((cb) => { try { cb(authState); } catch (e) { /* bỏ qua */ } });
  }

  // --- PHÒNG THI CHÍNH THỨC (gói Spark: không có Cloud Functions, firestore.rules kiểm tra mọi bước) ---

  // Phải trùng normalizeLmsCode (src/core/normalize.js): "hs-2026 01" và "HS202601" là cùng một học sinh
  function lmsKey(studentId) {
    if (window.AsianSchoolNormalize) return window.AsianSchoolNormalize.normalizeLmsCode(studentId);
    return String(studentId || '').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 30);
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
  function pickExamCode(cfg, grade, studentClass, selectedCode) {
    const codes = (cfg.activeCodes || {})[String(grade)];
    const active = Array.isArray(codes) ? codes.filter(code => typeof code === 'string') : [];
    const mode = cfg.codeAllocationMode || 'class_assigned';
    if (mode === 'student_choice') return typeof selectedCode === 'string' && active.includes(selectedCode) ? selectedCode : null;
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

  function classKey(studentClass) {
    return String(studentClass || '').trim().replace(/[^a-zA-Z0-9]/g, '_');
  }

  function attemptIdFor(grade, studentClass, studentId) {
    const g = Number(grade);
    const key = lmsKey(studentId);
    const ck = classKey(studentClass);
    return ck ? `g${g}_${ck}_${key}` : `g${g}_${key}`;
  }

  function legacyAttemptIdFor(grade, studentId) {
    return `g${Number(grade)}_${lmsKey(studentId)}`;
  }

  function archiveWrite(batch, collection, id, routing) {
    window.AsianSchoolDriveArchive?.addArchiveWrite(batch, collection, id, routing);
  }

  function persistArchived(ref, collection, id, value, routing, replace = false) {
    if (!window.AsianSchoolDriveArchive) return replace ? ref.set(value) : ref.update(value);
    const batch = db.batch();
    if (replace) batch.set(ref, value);
    else batch.update(ref, value);
    archiveWrite(batch, collection, id || ref.id, routing || value);
    return batch.commit();
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
      throw new Error(`Lớp ${data.studentClass} hiện chưa được mở ca thi chính thức (đang ở chế độ ${classMode === 'practice_only' ? 'Ôn tập đề cương' : 'Tạm khóa'}). Thầy/Cô giám thị cần bấm "Bật Thi" cho Lớp ${data.studentClass} trong Bảng điều phối ca thi trên trang Quản Trị.`);
    }

    const scopedAttemptId = attemptIdFor(grade, data.studentClass, key);
    const legacyAttemptId = legacyAttemptIdFor(grade, key);
    let attemptId = scopedAttemptId;
    let attemptRef = db.collection('exam_attempts').doc(attemptId);
    // Mật khẩu em nhập chỉ để rules đối chiếu với mật khẩu phòng thi; không ai đọc lại được
    await db.collection('exam_keys').doc(uid).set({
      password: String(data.password || '').trim().toLowerCase(),
      at: FieldValue.serverTimestamp()
    });

    const readAttempt = (ref) => ref.get({ source: 'server' })
      .then((snap) => (snap.exists ? snap.data() : null))
      .catch(() => null);
    const denied = new Error('Không vào được phòng thi: mật khẩu chưa đúng, lớp chưa mở ca thi hoặc mã đề chưa được bật. Em báo Thầy/Cô giám thị.');

    let attempt = await readAttempt(attemptRef);
    // Nếu chưa có lượt mới theo lớp, kiểm tra lượt cũ theo mã LMS nhưng chỉ nhận nếu trùng đúng lớp
    if (!attempt && scopedAttemptId !== legacyAttemptId) {
      const legacyRef = db.collection('exam_attempts').doc(legacyAttemptId);
      const legacyAttempt = await readAttempt(legacyRef);
      if (legacyAttempt && legacyAttempt.studentClass === data.studentClass) {
        attemptId = legacyAttemptId;
        attemptRef = legacyRef;
        attempt = legacyAttempt;
      }
    }

    // UID mới chưa đọc được lượt ở máy cũ. Nhận lại lượt trước khi đòi mã cho lượt MỚI;
    // rules vẫn kiểm mật khẩu và ca thi, chỉ thay uid/deviceChanges, không đổi mã hay số lượt.
    if (!attempt && cfg.codeAllocationMode === 'student_choice') {
      try {
        await persistArchived(attemptRef, 'exam_attempts', attemptId, { uid, deviceChanges: FieldValue.increment(1) }, { grade, studentClass: data.studentClass });
        attempt = await readAttempt(attemptRef);
      } catch (e) { /* Không có lượt hoặc chưa được phép nhận lại: tiếp tục kiểm lượt mới bên dưới. */ }
      if (!attempt && scopedAttemptId !== legacyAttemptId) {
        try {
          const legacyRef = db.collection('exam_attempts').doc(legacyAttemptId);
          await persistArchived(legacyRef, 'exam_attempts', legacyAttemptId, { uid, deviceChanges: FieldValue.increment(1) }, { grade, studentClass: data.studentClass });
          const legacyAttempt = await readAttempt(legacyRef);
          if (legacyAttempt && legacyAttempt.studentClass === data.studentClass) {
            attemptId = legacyAttemptId;
            attemptRef = legacyRef;
            attempt = legacyAttempt;
          }
        } catch (e) { /* bỏ qua */ }
      }
    }
    if (!attempt) {
      const code = pickExamCode(cfg, grade, data.studentClass, data.examCode);
      if (!code) throw new Error(cfg.codeAllocationMode === 'student_choice'
        ? 'Em hãy chọn một mã đề đang được bật của đúng khối trước khi bắt đầu lượt thi mới.'
        : `Chưa có mã đề đang bật cho Lớp ${data.studentClass}. Em báo Thầy/Cô giám thị.`);
      try {
        await persistArchived(attemptRef, 'exam_attempts', attemptId, {
          grade,
          studentId: key,
          studentClass: data.studentClass,
          fullName: String(data.fullName || '').trim().slice(0, 80),
          uid,
          examCode: code,
          attemptsUsed: 1,
          submitted: false,
          startedAt: FieldValue.serverTimestamp(),
          deviceChanges: 0,
          durationMinutes: cfg.examDurationMinutes || 45,
          extraTimeSeconds: 0
        }, { grade, studentClass: data.studentClass }, true);
      } catch (createErr) {
        console.warn('[startExam] Lượt thi mới không tạo được, thử nhận lại lượt từ máy khác:', createErr?.message || createErr);
        // Mã LMS này đã có lượt thi từ máy khác: nhận lại lượt bằng mật khẩu phòng thi
        try {
          await persistArchived(attemptRef, 'exam_attempts', attemptId, { uid, deviceChanges: FieldValue.increment(1) }, { grade, studentClass: data.studentClass });
        } catch (takeoverErr) {
          console.warn('[startExam] Nhận lại lượt thất bại:', takeoverErr?.message || takeoverErr);
          const isPerm = (createErr && createErr.code === 'permission-denied') || (takeoverErr && takeoverErr.code === 'permission-denied');
          if (isPerm) {
            throw new Error('Mật khẩu phòng thi chưa chính xác hoặc Thầy/Cô chưa mở ca thi cho lớp này. Em kiểm tra lại mật khẩu do Thầy/Cô giám thị cung cấp.');
          }
          throw denied;
        }
      }
      attempt = await readAttempt(attemptRef);
      if (!attempt) throw denied;
    }

    if (attempt.submitted && attempt.locked) {
      throw new Error('Lượt thi đang bị khóa. Em chờ Thầy/Cô giám thị mở khóa trước khi làm lại.');
    }

    if (attempt.submitted) {
      const allowed = Number.isInteger(attempt.allowedAttempts) ? attempt.allowedAttempts : (cfg.maxExamAttempts || 1);
      if (attempt.attemptsUsed >= allowed) {
        throw new Error(`Mã LMS ${key} đã dùng hết ${allowed} lượt làm bài thi chính thức. Nếu cần thi lại, em báo Thầy/Cô.`);
      }
      const code = pickExamCode(cfg, grade, attempt.studentClass, data.examCode);
      if (!code) throw new Error(cfg.codeAllocationMode === 'student_choice'
        ? 'Em hãy chọn một mã đề đang được bật của đúng khối trước khi bắt đầu lượt thi mới.'
        : `Chưa có mã đề đang bật cho Lớp ${attempt.studentClass}. Em báo Thầy/Cô giám thị.`);
      try {
        await persistArchived(attemptRef, 'exam_attempts', attemptId, {
          attemptsUsed: FieldValue.increment(1),
          submitted: false,
          startedAt: FieldValue.serverTimestamp(),
          examCode: code,
          submittedAt: FieldValue.delete(),
          violations: 0,
          extraTimeSeconds: 0,
          durationMinutes: cfg.examDurationMinutes || 45,
          locked: false,
          lockCount: 0,
          lockReason: FieldValue.delete()
        }, attempt);
      } catch (e) {
        throw denied;
      }
      attempt = await readAttempt(attemptRef);
      if (!attempt) throw denied;
    }

    const examDocId = `g${grade}_${attempt.examCode}`;
    await db.collection('exam_sessions').doc(uid).set({ attemptId, examDocId });
    const baseDurationSeconds = (attempt.durationMinutes || cfg.examDurationMinutes || 45) * 60;
    const extraTimeSeconds = Number.isSafeInteger(attempt.extraTimeSeconds) && attempt.extraTimeSeconds >= 0 ? attempt.extraTimeSeconds : 0;
    const startedAtMs = toMillis(attempt.startedAt) || Date.now();
    const base = {
      attemptId,
      examCode: attempt.examCode,
      baseDurationSeconds,
      extraTimeSeconds,
      durationMinutes: (baseDurationSeconds + extraTimeSeconds) / 60,
      startedAtMs,
      deadlineMs: startedAtMs + (baseDurationSeconds + extraTimeSeconds) * 1000,
      violations: attempt.violations || 0
    };
    // Tải lại trang khi đang bị khóa: vẫn khóa, chưa được đọc đề cho tới khi giáo viên mở khóa
    if (attempt.locked) {
      return { ...base, exam: null, locked: true, lockReason: attempt.lockReason || 'violation_3_times' };
    }
    const exam = await loadExam({ grade, examCode: attempt.examCode });
    return { ...base, exam, locked: false };
  }

  async function loadExam({ grade, examCode }) {
    try {
      const examSnap = await db.collection('exam_public').doc(`g${Number(grade)}_${examCode}`).get({ source: 'server' });
      if (examSnap.exists && examSnap.data()?.exam) return examSnap.data().exam;
    } catch (e) {
      console.warn('[loadExam] Không đọc được exam_public từ máy chủ:', e.message);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(`asian_school_exam_cache_g${grade}_${examCode}`)
          || localStorage.getItem(`asian_school_exam_cache_g${grade}_101`);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* ignore */ }
    }
    throw new Error(`Không tìm thấy mã đề ${examCode} Khối ${grade}. Em báo Thầy/Cô giám thị.`);
  }

  function attemptRefFor(grade, studentClass, studentId) {
    if (typeof grade === 'object' && grade !== null) {
      const opts = grade;
      return attemptRefFor(opts.grade, opts.studentClass, opts.studentId);
    }
    const g = Number(grade);
    const key = lmsKey(studentId);
    const ck = classKey(studentClass);
    return ck ? db.collection('exam_attempts').doc(`g${g}_${ck}_${key}`) : db.collection('exam_attempts').doc(`g${g}_${key}`);
  }

  async function resolveAttemptDocRef(grade, studentClass, studentId) {
    if (typeof grade === 'object' && grade !== null) {
      const opts = grade;
      return resolveAttemptDocRef(opts.grade, opts.studentClass, opts.studentId);
    }
    const g = Number(grade);
    const key = lmsKey(studentId);
    const scopedRef = attemptRefFor(g, studentClass, key);
    if (!studentClass) return scopedRef;
    try {
      const snap = await scopedRef.get();
      if (snap.exists) return scopedRef;
    } catch (e) { /* ignore */ }
    const legacyRef = db.collection('exam_attempts').doc(legacyAttemptIdFor(g, key));
    try {
      const legacySnap = await legacyRef.get();
      if (legacySnap.exists && legacySnap.data().studentClass === studentClass) {
        return legacyRef;
      }
    } catch (e) { /* ignore */ }
    return scopedRef;
  }

  // Ghi vi phạm lên lượt thi: số vi phạm chỉ tăng; lock = true khi đủ 3 lần (rules không cho học sinh tự mở khóa)
  function reportViolation({ grade, studentClass, studentId, lock }) {
    if (!db || !auth || !auth.currentUser) return Promise.resolve(false);
    const FieldValue = firebase.firestore.FieldValue;
    const update = { violations: FieldValue.increment(1) };
    if (lock) {
      update.locked = true;
      update.lockCount = FieldValue.increment(1);
    }
    return resolveAttemptDocRef(grade, studentClass, studentId)
      .then(ref => persistArchived(ref, 'exam_attempts', ref.id, update, { grade, studentClass }))
      .then(() => true)
      .catch((e) => { console.warn('[Firestore] Ghi vi phạm thất bại:', e.message); return false; });
  }

  // Theo dõi lượt thi của chính mình: trạng thái khóa do máy chủ quyết định
  function watchAttempt(opts, cb) {
    if (!db) return () => {};
    if (opts?.attemptId) {
      return db.collection('exam_attempts').doc(opts.attemptId).onSnapshot({ includeMetadataChanges: true },
        (snap) => { if (snap.exists) cb(snap.data(), { fromServer: !snap.metadata.hasPendingWrites && !snap.metadata.fromCache }); },
        (e) => console.warn('[Firestore] Theo dõi lượt thi thất bại:', e.message)
      );
    }
    const g = Number(opts?.grade);
    const key = lmsKey(opts?.studentId);
    const ck = classKey(opts?.studentClass);
    if (ck) {
      return db.collection('exam_attempts').doc(`g${g}_${ck}_${key}`).onSnapshot({ includeMetadataChanges: true },
        (snap) => { if (snap.exists) cb(snap.data(), { fromServer: !snap.metadata.hasPendingWrites && !snap.metadata.fromCache }); },
        (e) => console.warn('[Firestore] Theo dõi lượt thi thất bại:', e.message)
      );
    }
    const uid = auth?.currentUser?.uid;
    if (uid && typeof db.collection === 'function') {
      let unsubAttempt = null;
      let isUnsub = false;
      const unsubSession = db.collection('exam_sessions').doc(uid).onSnapshot(sSnap => {
        if (isUnsub) return;
        const targetId = sSnap?.exists ? sSnap.data().attemptId : `g${g}_${key}`;
        if (unsubAttempt) unsubAttempt();
        unsubAttempt = db.collection('exam_attempts').doc(targetId).onSnapshot({ includeMetadataChanges: true },
          (snap) => { if (snap.exists) cb(snap.data(), { fromServer: !snap.metadata.hasPendingWrites && !snap.metadata.fromCache }); },
          (e) => console.warn('[Firestore] Theo dõi lượt thi thất bại:', e.message)
        );
      }, () => {
        if (!unsubAttempt && !isUnsub) {
          unsubAttempt = db.collection('exam_attempts').doc(`g${g}_${key}`).onSnapshot({ includeMetadataChanges: true },
            (snap) => { if (snap.exists) cb(snap.data(), { fromServer: !snap.metadata.hasPendingWrites && !snap.metadata.fromCache }); }
          );
        }
      });
      return () => {
        isUnsub = true;
        if (unsubSession) unsubSession();
        if (unsubAttempt) unsubAttempt();
      };
    }
    return db.collection('exam_attempts').doc(`g${g}_${key}`).onSnapshot({ includeMetadataChanges: true },
      (snap) => { if (snap.exists) cb(snap.data(), { fromServer: !snap.metadata.hasPendingWrites && !snap.metadata.fromCache }); },
      (e) => console.warn('[Firestore] Theo dõi lượt thi thất bại:', e.message)
    );
  }

  // Giáo viên khóa / mở khóa lượt thi (chỉ isTeacher() được đặt locked = false)
  async function setAttemptLock({ grade, studentClass, studentId, locked }) {
    const FieldValue = firebase.firestore.FieldValue;
    const ref = await resolveAttemptDocRef(grade, studentClass, studentId);
    return persistArchived(ref, 'exam_attempts', ref.id, locked
      ? { locked: true, lockReason: 'proctor_lock', lockCount: FieldValue.increment(1) }
      : { locked: false, lockReason: FieldValue.delete() }, { grade, studentClass });
  }

  // Giáo viên gia hạn trên lượt thi, không phụ thuộc một tab/session cụ thể.
  // Transaction đọc trạng thái mới nhất nên ca đã nộp không được cộng giờ và hai giám thị không ghi đè nhau.
  function reminderTargetMatches(data, target) {
    return Number(data.grade) === Number(target.grade)
      && data.studentClass === target.studentClass && data.studentId === target.studentId
      && data.mode === target.mode;
  }

  function reminderForRun(data, target, runId) {
    const reminder = data.teacherReminder;
    return reminder && reminderTargetMatches(reminder, target) && reminder.runId === runId
      && Number.isSafeInteger(reminder.count) && reminder.count > 0 ? reminder : null;
  }

  // Ghi nhắc nhở riêng của giáo viên. Event id giữ nguyên khi gửi lại sau lỗi mạng.
  async function recordTeacherReminder(target) {
    await waitForUser();
    const message = String(target.message || '').trim();
    if (!message || message.length > 1000 || !/^[A-Za-z0-9_-]{1,100}$/.test(target.requestId || '')) {
      throw new Error('Nội dung nhắc nhở hoặc mã gửi chưa hợp lệ.');
    }
    const liveRef = db.collection('live_sessions').doc(target.sessionId);
    const eventRef = db.collection('proctor_commands').doc('reminder-' + target.requestId);
    const stateRef = db.collection('proctor_commands').doc('reminder-state-' + target.sessionId);
    const attemptRef = target.mode === 'exam'
      ? await resolveAttemptDocRef(target.grade, target.studentClass, target.studentId) : null;
    return db.runTransaction(async transaction => {
      const previousEvent = await transaction.get(eventRef);
      if (previousEvent.exists) {
        const event = previousEvent.data();
        if (event.targetSessionId !== target.sessionId || !reminderTargetMatches(event.payload.reminder, target)) {
          throw new Error('Mã gửi không khớp phiên học sinh.');
        }
        return event.payload.reminder;
      }
      const liveSnap = await transaction.get(liveRef);
      if (!liveSnap.exists) throw new Error('Phiên học sinh đã kết thúc.');
      const live = liveSnap.data();
      if (!reminderTargetMatches(live, target) || live.uid !== target.uid || !live.uid
        || !['in_progress', 'practicing', 'locked'].includes(live.status)) {
        throw new Error('Phiên học sinh đã thay đổi. Thầy chọn lại thẻ đang làm bài.');
      }
      let data = live;
      let runId = 'practice:' + target.sessionId;
      if (attemptRef) {
        const attemptSnap = await transaction.get(attemptRef);
        if (!attemptSnap.exists) throw new Error('Không tìm thấy lượt thi.');
        data = attemptSnap.data();
        if (data.submitted || data.uid !== live.uid || data.studentClass !== live.studentClass
          || data.studentId !== live.studentId || Number(data.grade) !== Number(live.grade)) {
          throw new Error('Lượt thi đã thay đổi hoặc đã nộp. Thầy kiểm tra lại thẻ học sinh.');
        }
        runId = 'exam:' + toMillis(data.startedAt);
      } else {
        const state = await transaction.get(stateRef);
        data = state.exists ? { teacherReminder: state.data().payload.reminder } : {};
      }
      const previous = reminderForRun(data, target, runId);
      const reminder = {
        id: target.requestId, runId, count: (previous?.count || 0) + 1, message,
        grade: Number(target.grade), studentClass: target.studentClass,
        studentId: target.studentId, mode: target.mode, createdAt: Date.now()
      };
      if (attemptRef) {
        transaction.update(attemptRef, { teacherReminder: reminder });
        archiveWrite(transaction, 'exam_attempts', attemptRef.id, { grade: target.grade, studentClass: target.studentClass });
      } else {
        transaction.set(stateRef, {
          cmdId: 'reminder-state-' + target.sessionId, targetSessionId: target.sessionId,
          targetUid: live.uid, command: 'teacher_reminder_state', payload: { reminder },
          createdAt: reminder.createdAt, consumedBy: []
        });
        archiveWrite(transaction, 'proctor_commands', 'reminder-state-' + target.sessionId, { payload: { reminder } });
      }
      transaction.update(liveRef, { teacherReminder: reminder });
      transaction.set(eventRef, {
        cmdId: 'reminder-' + target.requestId, targetSessionId: target.sessionId,
        targetUid: live.uid, command: 'teacher_reminder', payload: { reminder },
        createdAt: reminder.createdAt, consumedBy: []
      });
      archiveWrite(transaction, 'proctor_commands', 'reminder-' + target.requestId, { payload: { reminder } });
      return reminder;
    });
  }

  function watchTeacherReminder(target, callback) {
    if (!db) return () => {};
    if (target.mode === 'exam') {
      let unsubscribe = null;
      let cancelled = false;
      resolveAttemptDocRef(target.grade, target.studentClass, target.studentId).then(ref => {
        if (cancelled) return;
        unsubscribe = ref.onSnapshot({ includeMetadataChanges: true }, snapshot => {
          if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
          const data = snapshot.exists ? snapshot.data() : null;
          callback(data ? reminderForRun(data, target, 'exam:' + toMillis(data.startedAt)) : null);
        }, error => console.warn('[Firestore] Chưa đọc được nhắc nhở:', error.code));
      }).catch(error => console.warn('[Firestore] Chưa tìm được lượt nhắc nhở:', error.code));
      return () => { cancelled = true; unsubscribe?.(); };
    }
    const uid = target.uid || auth?.currentUser?.uid;
    if (!uid) return () => {};
    // Trạng thái ôn tập do giáo viên ghi trong collection lệnh, học sinh chỉ đọc được của mình.
    return db.collection('proctor_commands').where('targetUid', '==', uid).onSnapshot({ includeMetadataChanges: true }, snapshot => {
      if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
      let reminder = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.command === 'teacher_reminder_state' && data.targetSessionId === target.sessionId) {
          reminder = reminderForRun({ teacherReminder: data.payload?.reminder }, target, 'practice:' + target.sessionId);
        }
      });
      callback(reminder);
    }, error => console.warn('[Firestore] Chưa đọc được nhắc nhở:', error.code));
  }

  async function extendExamTime({ grade, studentClass, studentId, minutes }) {
    await waitForUser();
    const extra = Number(minutes) * 60;
    if (![8, 9, 10].includes(Number(grade)) || !lmsKey(studentId) || !Number.isSafeInteger(extra) || extra <= 0) {
      throw new Error('Khối, mã LMS hoặc số phút gia hạn chưa hợp lệ.');
    }
    const ref = await resolveAttemptDocRef(grade, studentClass, studentId);
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('Không tìm thấy lượt thi để gia hạn.');
      const attempt = snap.data();
      if (attempt.submitted) return { applied: false, reason: 'submitted' };
      const oldExtra = attempt.extraTimeSeconds === undefined ? 0 : attempt.extraTimeSeconds;
      if (!Number.isSafeInteger(oldExtra) || oldExtra < 0 || !Number.isSafeInteger(oldExtra + extra)) {
        throw new Error('Dữ liệu giờ gia hạn trên máy chủ chưa hợp lệ.');
      }
      const extraTimeSeconds = oldExtra + extra;
      tx.update(ref, { extraTimeSeconds });
      archiveWrite(tx, 'exam_attempts', ref.id, attempt);
      return { applied: true, extraTimeSeconds };
    });
  }

  async function submitExam(data) {
    const user = await waitForUser();
    const grade = Number(data.grade);
    const key = lmsKey(data.studentId);
    const scopedId = attemptIdFor(grade, data.studentClass, key);
    const legacyId = legacyAttemptIdFor(grade, key);
    let attemptId = scopedId;
    let attemptRef = db.collection('exam_attempts').doc(attemptId);
    let snap;
    try {
      snap = await attemptRef.get({ source: 'server' });
    } catch (e) {
      // Bỏ qua lỗi lúc đầu nếu do scoped chưa có hoặc quyền
    }
    // Nếu chưa thấy scoped attempt hoặc không tồn tại, kiểm tra legacy
    if ((!snap || !snap.exists) && scopedId !== legacyId) {
      try {
        const legacyRef = db.collection('exam_attempts').doc(legacyId);
        const legacySnap = await legacyRef.get({ source: 'server' });
        if (legacySnap.exists && (!data.studentClass || legacySnap.data().studentClass === data.studentClass)) {
          attemptId = legacyId;
          attemptRef = legacyRef;
          snap = legacySnap;
        }
      } catch (e) {
        // Bỏ qua lỗi đọc legacy
      }
    }
    if (!snap) {
      try {
        snap = await attemptRef.get({ source: 'server' });
      } catch (e) {
        throw new Error('Lượt làm bài này đang mở trên thiết bị khác. Em báo giám thị.');
      }
    }
    // Cache/pending write không phải bằng chứng máy chủ đã nhận bài (đặc biệt sau timeout).
    if (snap.metadata && (snap.metadata.fromCache || snap.metadata.hasPendingWrites)) {
      throw new Error('Máy chủ chưa xác nhận lượt thi. Em giữ nguyên trang và thử nộp lại khi có mạng.');
    }
    if (!snap.exists) throw new Error('Không tìm thấy lượt làm bài. Em báo giám thị.');
    const a = snap.data();
    // Mốc thời gian để giáo viên đối soát nộp muộn lấy từ lượt thi, không từ đồng hồ học sinh.
    // Lượt cũ thiếu thời lượng được giữ null, không suy từ cấu hình hiện tại để kết luận nộp muộn.
    const durationMinutes = a.durationMinutes === undefined ? null : a.durationMinutes;
    const extraTimeSeconds = a.extraTimeSeconds === undefined ? 0 : a.extraTimeSeconds;
    if ((durationMinutes !== null && (typeof durationMinutes !== 'number' || !Number.isFinite(durationMinutes) || durationMinutes <= 0))
      || !Number.isSafeInteger(extraTimeSeconds) || extraTimeSeconds < 0) {
      throw new Error('Thời lượng lượt thi trên máy chủ chưa hợp lệ. Em báo giám thị.');
    }
    const subId = `${attemptId}_${a.attemptsUsed}`;
    // Bỏ giá trị undefined (Firestore không nhận) và tách khỏi state React
    const answers = JSON.parse(JSON.stringify(data.answers || { mcq: {}, tf: {}, essay: {} }));
    // Số vi phạm là số máy chủ đã ghi trên lượt thi (rules bắt bài nộp khớp với exam_attempts.violations)
    const violations = Number.isInteger(a.violations) ? a.violations : 0;
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
        durationMinutes,
        extraTimeSeconds,
        submittedAt,
        serverSubmittedAt: FieldValue.serverTimestamp(),
        isGraded: false,
        essayScores: {},
        essayTotal: 0,
        teacherFeedback: ''
      });
      archiveWrite(batch, 'exam_attempts', attemptId, { grade, studentClass: a.studentClass });
      archiveWrite(batch, 'submissions', subId, { grade, studentClass: a.studentClass });
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

  function watchSubmission(opts, cb) {
    const subId = typeof opts === 'string' ? opts : opts?.submissionId;
    if (!db || !subId || typeof db.collection !== 'function') return () => {};
    return db.collection('submissions').doc(subId).onSnapshot({ includeMetadataChanges: true },
      (snap) => {
        if (snap.exists) cb(snap.data(), { fromServer: !snap.metadata.hasPendingWrites && !snap.metadata.fromCache });
      },
      (e) => console.warn('[Firestore] Theo dõi bài nộp thất bại:', e.message)
    );
  }

  async function confirmSubmissionScore(opts) {
    const subId = typeof opts === 'string' ? opts : opts?.submissionId;
    if (!db || !subId) return false;
    await waitForUser();
    const FieldValue = firebase.firestore.FieldValue;
    const ref = db.collection('submissions').doc(subId);
    if (window.AsianSchoolDriveArchive) {
      const source = await ref.get({ source: 'server' });
      if (!source.exists) throw new Error('Không tìm thấy bài nộp để xác nhận.');
      await persistArchived(ref, 'submissions', subId, {
        scoreConfirmed: true, scoreConfirmedAt: FieldValue.serverTimestamp()
      }, source.data());
    } else {
      await ref.update({ scoreConfirmed: true, scoreConfirmedAt: FieldValue.serverTimestamp() });
    }
    return true;
  }

  async function lookupSubmissionForReview(data) {
    await waitForUser();
    const grade = Number(data.grade);
    const key = lmsKey(data.studentId);
    if (![8, 9, 10].includes(grade) || !key) {
      throw new Error('Khối hoặc Mã LMS chưa hợp lệ. Em vui lòng kiểm tra lại.');
    }

    const cfgSnap = await db.collection('exam_config').doc('global_config').get();
    const cfg = cfgSnap.exists ? cfgSnap.data() : {};
    const isReviewAllowed = cfg.allowStudentReviewOfficialExam
      || (data.studentClass && cfg.classReviewControl && cfg.classReviewControl[data.studentClass] === true);
    if (!isReviewAllowed) {
      const classInfo = data.studentClass ? ` cho Lớp ${data.studentClass}` : '';
      throw new Error(`Chức năng xem lại bài làm và chốt điểm${classInfo} hiện chưa được mở. Em vui lòng chờ Thầy Trần Gia Huy thông báo sau khi hoàn tất chấm bài nhé!`);
    }

    const scopedId = attemptIdFor(grade, data.studentClass, key);
    const legacyId = legacyAttemptIdFor(grade, key);
    let subDoc = null;
    let subId = null;

    // 1. Danh sách các candidate submission ID khả dĩ (ưu tiên lớp hiện tại, gạch ngang, legacy)
    const candidateIds = [
      `${scopedId}_1`,
      `${scopedId}_2`,
      `g${grade}_${String(data.studentClass || '').replace(/[^a-zA-Z0-9]/g, '-')}_${key}_1`,
      `g${grade}_${String(data.studentClass || '').replace(/[^a-zA-Z0-9]/g, '-')}_${key}_2`,
      `${legacyId}_1`,
      `${legacyId}_2`
    ];

    // Thêm các lớp thường gặp trong khối nếu học sinh chọn nhầm lớp
    const commonClasses = grade === 8
      ? ['8/19', '8/20', '8/21', '8/22', '8/23', '8/24', '8/25']
      : (grade === 9
          ? ['9/15', '9/16', '9/17', '9/18', '9/19', '9/20']
          : ['10/11', '10/12', '10/13', '10/14', '10/15', '10/16']);

    for (const c of commonClasses) {
      if (c !== data.studentClass) {
        candidateIds.push(`${attemptIdFor(grade, c, key)}_1`);
      }
    }

    for (const candId of candidateIds) {
      try {
        const snap = await db.collection('submissions').doc(candId).get();
        if (snap.exists) {
          const d = snap.data();
          subDoc = d;
          subId = candId;
          break;
        }
      } catch (e) { /* bỏ qua lỗi permission hoặc không tồn tại */ }
    }

    // 2. Nếu chưa thấy trong submissions, kiểm tra exam_attempts để lấy thông tin lượt thi gốc
    if (!subDoc) {
      const candAttemptIds = [
        scopedId,
        `g${grade}_${String(data.studentClass || '').replace(/[^a-zA-Z0-9]/g, '-')}_${key}`,
        legacyId
      ];
      for (const c of commonClasses) {
        candAttemptIds.push(attemptIdFor(grade, c, key));
      }

      for (const attId of candAttemptIds) {
        try {
          const aSnap = await db.collection('exam_attempts').doc(attId).get();
          if (aSnap.exists) {
            const att = aSnap.data();
            const attClass = att.studentClass || data.studentClass;
            const extraCandSubIds = [
              `${attemptIdFor(grade, attClass, key)}_${att.attemptsUsed || 1}`,
              `${attId}_${att.attemptsUsed || 1}`,
              `${attId}_1`,
              `${attId}_2`
            ];
            for (const sId of extraCandSubIds) {
              try {
                const subSnap = await db.collection('submissions').doc(sId).get();
                if (subSnap.exists) {
                  subDoc = subSnap.data();
                  subId = sId;
                  break;
                }
              } catch (e) {}
            }
            if (subDoc) break;

            // Nếu attempt có submitted = true nhưng bản ghi submissions chưa có hoặc bị chặn quyền:
            // Phục hồi an toàn từ attempt để học sinh vào được trang chốt điểm mà không bị lỗi chặn
            if (att.submitted) {
              subDoc = {
                id: `${attId}_${att.attemptsUsed || 1}`,
                attemptId: attId,
                grade: Number(att.grade) || grade,
                studentClass: att.studentClass || data.studentClass,
                studentId: att.studentId || key,
                fullName: att.fullName || data.fullName || 'Học sinh',
                examCode: att.examCode || '101',
                attemptNumber: att.attemptsUsed || 1,
                violations: att.violations || 0,
                durationFormatted: att.durationMinutes ? `${att.durationMinutes} phút` : '45 phút',
                submittedAt: att.submittedAt ? (typeof att.submittedAt.toDate === 'function' ? att.submittedAt.toDate().toISOString() : String(att.submittedAt)) : new Date().toISOString(),
                isGraded: false,
                mcqPoints: 0,
                finalScore: 0,
                essayScores: {},
                essayTotal: 0,
                teacherFeedback: '',
                scoreConfirmed: false,
                answers: { mcq: {}, tf: {}, essay: {} }
              };
              subId = subDoc.id;
              break;
            }
          }
        } catch (e) {}
      }
    }

    // 3. Nếu vẫn chưa thấy, query theo studentId trong submissions (nếu rules cho phép)
    if (!subDoc) {
      try {
        const querySnap = await db.collection('submissions')
          .where('grade', '==', grade)
          .where('studentId', '==', key)
          .get();
        if (!querySnap.empty) {
          const matchDoc = querySnap.docs.find(d => {
            const dataDoc = d.data();
            return !data.studentClass || dataDoc.studentClass === data.studentClass;
          }) || querySnap.docs[0];
          if (matchDoc) {
            subDoc = matchDoc.data();
            subId = matchDoc.id;
          }
        }
      } catch (e) { /* bỏ qua lỗi query */ }
    }

    if (!subDoc) {
      throw new Error(`Không tìm thấy bài thi chính thức của Mã LMS ${key} thuộc Lớp ${data.studentClass || 'đã chọn'}. Em vui lòng kiểm tra lại đúng Khối, Lớp và Mã LMS.`);
    }

    let examData = null;
    if (subDoc.examCode) {
      const examDocId = `g${grade}_${subDoc.examCode}`;
      // 1. Thử đọc từ exam_bank để có đầy đủ câu hỏi, đáp án và rubric tự luận
      try {
        const bankSnap = await db.collection('exam_bank').doc(examDocId).get();
        if (bankSnap.exists) {
          const bData = bankSnap.data();
          examData = bData.exam || bData;
        }
      } catch (e) {
        /* Bỏ qua nếu rules chưa cho phép đọc exam_bank */
      }

      // 2. Fallback đọc từ exam_public
      if (!examData) {
        try {
          const examSnap = await db.collection('exam_public').doc(examDocId).get();
          if (examSnap.exists) {
            const pData = examSnap.data();
            examData = pData.exam || pData;
          }
        } catch (e) {
          console.warn('[Firestore] Không tải được exam_public:', e.message);
        }
      }

      // 3. Fallback bộ nhớ AsianSchoolLatestExamBank
      if (!examData && typeof window !== 'undefined' && window.AsianSchoolLatestExamBank?.[grade]) {
        examData = window.AsianSchoolLatestExamBank[grade][subDoc.examCode] || window.AsianSchoolLatestExamBank[grade]['101'];
      }

      // 4. Fallback bộ nhớ cục bộ window.EXAM_DATA_G{N}
      if (!examData && typeof window !== 'undefined') {
        const localObj = window['EXAM_DATA_G' + grade];
        if (localObj?.officialExams?.[subDoc.examCode]) {
          examData = localObj.officialExams[subDoc.examCode];
        }
      }

      // 5. Fallback bộ nhớ cache thiết bị (đã nhận đề khi bắt đầu làm bài)
      if (!examData && typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = localStorage.getItem(`asian_school_exam_cache_g${grade}_${subDoc.examCode}`)
            || localStorage.getItem(`asian_school_exam_cache_g${grade}_101`);
          if (raw) examData = JSON.parse(raw);
        } catch (e) { /* ignore */ }
      }

      // Phục hồi đáp án đúng vào examData nếu examData lấy từ exam_public (bị strip đáp án)
      if (examData && subDoc) {
        const mcqs = examData.mcqQuestions || examData.part1_mcq || [];
        mcqs.forEach(q => {
          if (q.correctAnswer === undefined && subDoc.mcqResults?.[q.num]?.correctAnswer !== undefined) {
            q.correctAnswer = subDoc.mcqResults[q.num].correctAnswer;
          }
        });
        const tfs = examData.part2_tf || [];
        tfs.forEach(tf => {
          (tf.subQuestions || []).forEach(sub => {
            const cr = subDoc.tfResults?.[tf.num]?.subResults?.[sub.letter]?.correctAnswer;
            if (sub.correctAnswer === undefined && cr !== undefined) {
              sub.correctAnswer = cr;
            }
          });
        });
      }
    }

    // 5. Dự phòng an toàn tuyệt đối: nếu chưa tải được đề từ Firestore, tự động tái tạo bộ khung câu hỏi từ bài làm
    // đảm bảo học sinh luôn nhìn thấy 100% bài làm của mình từ trắc nghiệm đến tự luận, không bao giờ bị trắng màn hình.
    if (!examData && subDoc) {
      examData = {
        code: subDoc.examCode || '101',
        totalPoints: 10,
        grade,
        title: `Bài thi Tin học Khối ${grade} (Mã đề: ${subDoc.examCode || '101'})`
      };
      const answers = subDoc.answers || {};
      const mcqKeys = Object.keys(answers.mcq || subDoc.mcqResults || {}).map(Number).sort((a, b) => a - b);
      const synthesizedMcq = (mcqKeys.length > 0 ? mcqKeys : Array.from({ length: grade === 10 ? 24 : 28 }, (_, i) => i + 1)).map(num => ({
        num,
        question: `Câu hỏi trắc nghiệm ${num}`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: subDoc.mcqResults?.[num]?.correctAnswer,
        points: 0.25,
        pointsText: '0.25 điểm'
      }));

      if (grade === 10) {
        examData.part1_mcq = synthesizedMcq;
        const tfKeys = Object.keys(answers.tf || subDoc.tfResults || {}).map(Number).sort((a, b) => a - b);
        examData.part2_tf = (tfKeys.length > 0 ? tfKeys : [1, 2, 3, 4]).map(num => ({
          num,
          context: `Câu hỏi Đúng / Sai ${num}`,
          points: 1,
          subQuestions: ['a', 'b', 'c', 'd'].map(letter => ({
            letter,
            text: `Nhận định ${letter}`,
            correctAnswer: subDoc.tfResults?.[num]?.subResults?.[letter]?.correctAnswer
          }))
        }));
        const essayKeys = Object.keys(answers.essay || subDoc.essayScores || {}).map(Number).sort((a, b) => a - b);
        examData.part3_essay = (essayKeys.length > 0 ? essayKeys : [1, 2]).map(num => ({
          num,
          question: `Câu hỏi tự luận ${num}`,
          points: 0.75,
          pointsText: '0.75 điểm',
          modelAnswer: 'Xem thang điểm và nhận xét chi tiết của Thầy bên dưới.'
        }));
      } else {
        examData.mcqQuestions = synthesizedMcq;
        const essayKeys = Object.keys(answers.essay || subDoc.essayScores || {}).map(Number).sort((a, b) => a - b);
        examData.essayQuestions = (essayKeys.length > 0 ? essayKeys : [1, 2]).map(num => ({
          num,
          question: `Câu hỏi tự luận ${num}`,
          points: 1.0,
          pointsText: '1.0 điểm',
          modelAnswer: 'Xem thang điểm và nhận xét chi tiết của Thầy bên dưới.'
        }));
      }
    }

    return {
      submission: subDoc,
      exam: examData,
      subId
    };
  }

  if (typeof window !== 'undefined') {
    window.firebaseApp = app;
    window.firebaseDb = db;
    window.firebaseAnalytics = analytics;
    window.AsianSchoolCloudSyncStatus = syncStatus;

    async function signInWebSandbox(credentials = {}) {
      if (!isWebSandbox || !auth) throw new Error('Không phải hệ thống thử trên web.');
      if (String(credentials.username || '').trim().toLowerCase() !== 'admin' || !credentials.password) {
        throw new Error('Nhập tài khoản và mật khẩu của hệ thống thử.');
      }
      const bytes = new TextEncoder().encode('ahs-lms-sandbox:' + String(credentials.password));
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const password = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      return auth.signInWithEmailAndPassword('admin@ahs-lms-sandbox.invalid', password);
    }

    window.AsianSchoolAuth = {
      getState: () => authState,
      onChange(cb) {
        authListeners.push(cb);
        if (authState.ready) cb(authState);
        return () => { const i = authListeners.indexOf(cb); if (i >= 0) authListeners.splice(i, 1); };
      },
      signInSandbox: signInWebSandbox,
      signInTeacher(credentials) {
        if (isWebSandbox) return signInWebSandbox(credentials);
        if (!auth) return Promise.reject(new Error('Chưa nạp Firebase Auth.'));
        if (isLocalSandbox) {
          // Danh tính giả chỉ Auth Emulator chấp nhận; vẫn áp dụng firestore.rules gốc.
          const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
          const idToken = encode({ alg: 'none', typ: 'JWT' }) + '.' + encode({
            sub: 'ahs-local-teacher', email: TEACHER_EMAILS[0], email_verified: true,
            name: 'Giao Vien Thu', aud: 'demo-ahs-local', iss: 'https://accounts.google.com',
            iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600
          }) + '.';
          return auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(idToken));
        }
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

    window.AsianSchoolCloud = { recordTeacherReminder, watchTeacherReminder, startExam, submitExam, loadExam, reportViolation, watchAttempt, setAttemptLock, extendExamTime, watchSubmission, confirmSubmissionScore, lookupSubmissionForReview };

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
        if (!user && isStudentPortal && !isWebSandbox) {
          auth.signInAnonymously().catch((err) => {
            console.warn('[Firebase Auth] Đăng nhập ẩn danh thất bại:', err.message);
            updateStatus({ lastError: err.message });
          });
          return;
        }
        let isTeacher = false;
        if (user && !user.isAnonymous) {
          isTeacher = user.emailVerified && allowedTeacherEmails.includes(String(user.email || '').toLowerCase());
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
