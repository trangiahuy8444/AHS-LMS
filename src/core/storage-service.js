/**
 * storage-service.js
 * Quản lý lưu trữ dữ liệu bài thi, phiên trực tiếp, lệnh giám thị và cấu hình hệ thống
 * Hỗ trợ LocalStorage (offline/cục bộ) và Firebase Firestore (đồng bộ đám mây)
 */

(function () {
  const SUBMISSIONS_KEY = 'asian_school_submissions_v1';
  const PRACTICE_SUBMISSIONS_KEY = 'asian_school_practice_submissions_v1';
  const LIVE_KEY = 'asian_school_live_sessions_v1';
  const CONFIG_KEY = 'asian_school_exam_config_v1';
  const PROCTOR_CMD_KEY = 'asian_school_proctor_commands_v1';
  const AUDIT_LOG_KEY = 'asian_school_audit_log_v1';

  const DEFAULT_CONFIG = {
    // Chế độ phân bổ mã đề: 'random' | 'class_assigned' | 'fixed'
    codeAllocationMode: 'class_assigned',
    fixedCode: '101',
    // Phân công mã đề theo lớp mặc định cho Asian School:
    // Khối 8: 8/19 -> 101, 8/20 -> 102, 8/21 -> 103, 8/22 -> 104, 8/23 -> 101
    // Khối 9: 9/20 -> 101, 9/21 -> 102, 9/22 -> 103, 9/23 -> 104, 9/24 -> 101, 9/25 -> 102, 9/26 -> 103
    // Khối 10: 10/14 -> 101, 10/15 -> 102, 10/16 -> 103
    classMapping: {
      '8/19': '101', '8/20': '102', '8/21': '103', '8/22': '104', '8/23': '101',
      '9/20': '101', '9/21': '102', '9/22': '103', '9/23': '104', '9/24': '101', '9/25': '102', '9/26': '103',
      '10/14': '101', '10/15': '102', '10/16': '103'
    },
    examDurationMinutes: 45,
    practiceDurationMinutes: 0, // 0 = Không giới hạn thời gian (Tự do), hoặc 15, 30, 45 phút
    shuffleQuestions: true, // Bật/Tắt trộn thứ tự câu hỏi
    shuffleOptions: true, // Bật/Tắt xáo trộn vị trí 4 phương án A/B/C/D
    requireAllQuestionsAnswered: false, // Bật/Tắt bắt buộc làm hết tất cả câu hỏi (không được bỏ trống khi nộp)
    allowPracticeReview: true,
    allowExamReview: false, // Trong lúc thi không hiện đáp án ngay
    // Mật khẩu phòng thi lưu ở exam_secrets/room (chỉ giáo viên đọc), firestore.rules đối chiếu khi học sinh vào phòng thi.
    // Đăng nhập quản trị dùng Firebase Auth, không còn mật khẩu admin trong mã nguồn.
    examPassword: '',
    // Cách chấm câu Đúng/Sai Khối 10: 'coefficient' (1 ý 0,1 - 2 ý 0,25 - 3 ý 0,5 - 4 ý 1,0) | 'per_statement' (0,25đ mỗi ý)
    tfScoringPolicy: 'coefficient',
    // Số lượt làm bài thi chính thức tối đa cho mỗi mã LMS (giáo viên cấp thêm lượt cho từng học sinh trong tab Bài nộp)
    maxExamAttempts: 1,
    
    // Cấu hình Google Drive Webhook & Vòng đời lưu trữ (Retention)
    googleDriveWebhookUrl: '', // URL Web App Google Apps Script kết nối Google Drive / Sheets
    googleDriveWebhookToken: '', // Token bảo mật xác thực với Apps Script (Tùy chọn)
    retentionDays: 21, // Số ngày lưu trữ tối đa đề xuất trên web (2-3 tuần) trước khi dọn dẹp

    // Ma trận phân quyền truy cập theo từng lớp học:
    // 'practice_only' (chỉ được ôn tập) | 'exam_only' (đang thi chính thức) | 'both_open' (mở cả hai) | 'closed' (tạm khóa)
    defaultClassMode: 'practice_only',
    classAccessControl: {
      '8/19': 'practice_only',
      '8/20': 'practice_only',
      '8/21': 'practice_only',
      '8/22': 'practice_only',
      '8/23': 'practice_only',
      '9/20': 'practice_only',
      '9/21': 'practice_only',
      '9/22': 'practice_only',
      '9/23': 'practice_only',
      '9/24': 'practice_only',
      '9/25': 'practice_only',
      '9/26': 'practice_only',
      '10/14': 'practice_only',
      '10/15': 'practice_only',
      '10/16': 'practice_only'
    }
  };

  class StorageService {
    constructor() {
      this.submissionListeners = [];
      this.practiceSubmissionListeners = [];
      this.liveListeners = [];
      this.configListeners = [];
      this.cmdListeners = [];
      this.practiceSessionMap = new Map(); // Bộ nhớ phiên ôn tập tạm theo mã LMS (fallback khi không có sessionStorage)

      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key === SUBMISSIONS_KEY) this.notify(this.submissionListeners, this.getSubmissions());
          if (e.key === PRACTICE_SUBMISSIONS_KEY) this.notify(this.practiceSubmissionListeners, this.getPracticeSubmissions());
          if (e.key === LIVE_KEY) this.notify(this.liveListeners, this.getLiveSessions());
          if (e.key === CONFIG_KEY) this.notify(this.configListeners, this.getConfig());
          if (e.key === PROCTOR_CMD_KEY) this.notify(this.cmdListeners, this.getProctorCommandsRaw());
        });
      }
    }

    notify(listeners, data) {
      listeners.forEach(fn => {
        try { fn(data); } catch (e) { console.error('Listener err', e); }
      });
    }

    getClassesForGrade(grade) {
      const g = parseInt(grade, 10);
      if (g === 8) return ['8/19', '8/20', '8/21', '8/22', '8/23'];
      if (g === 9) return ['9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26'];
      if (g === 10) return ['10/14', '10/15', '10/16'];
      return [];
    }

    getConfig() {
      try {
        const raw = localStorage.getItem(CONFIG_KEY);
        if (!raw) {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
          return DEFAULT_CONFIG;
        }
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }

    saveConfig(newConfig) {
      const merged = { ...this.getConfig(), ...newConfig };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
      this.notify(this.configListeners, merged);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            // Không đẩy mật khẩu lên exam_config (học sinh đọc được); mật khẩu phòng thi đi vào exam_secrets/room
            const { examPassword, adminPasswordHash, ...publicConfig } = merged;
            const fieldValue = typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue;
            if (fieldValue) {
              // Xóa hẳn các trường mật khẩu cũ còn sót trên bản cấu hình công khai
              publicConfig.examPassword = fieldValue.delete();
              publicConfig.adminPasswordHash = fieldValue.delete();
            }
            window.firebaseDb.collection('exam_config').doc('global_config').set(publicConfig, { merge: true })
              .catch(e => console.warn('Firestore config save err', e));
            if (newConfig && newConfig.examPassword !== undefined) {
              window.firebaseDb.collection('exam_secrets').doc('room').set({ examPassword: newConfig.examPassword }, { merge: true })
                .catch(e => console.warn('Firestore secret save err', e));
            }
          }
        } catch (e) { /* local fallback */ }
      }

      return merged;
    }

    onConfigChange(cb) {
      this.configListeners.push(cb);
      return () => {
        this.configListeners = this.configListeners.filter(f => f !== cb);
      };
    }

    // --- THUẬT TOÁN XÁO TRỘN & NGẪU NHIÊN HÓA CÂU HỎI (RANDOM SAMPLING & SHUFFLE) ---

    sampleArray(arr, k) {
      if (!Array.isArray(arr) || arr.length === 0) return [];
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, Math.min(k, copy.length));
    }

    shuffleArray(arr) {
      if (!Array.isArray(arr)) return [];
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    shuffleQuestionOptions(q) {
      if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;
      const letters = ['A', 'B', 'C', 'D'];
      const indexed = q.options.map((opt, idx) => ({ opt, isCorrect: idx === q.correctAnswer }));
      const shuffled = this.shuffleArray(indexed);
      const newOptions = shuffled.map(item => item.opt);
      const newCorrectAnswer = shuffled.findIndex(item => item.isCorrect);
      return {
        ...q,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
        answerLetter: letters[newCorrectAnswer] || q.answerLetter
      };
    }

    generatePracticeSet(grade, examData, customConfig = null) {
      if (!examData) return { mcqQuestions: [], tfQuestions: [], essayQuestions: [] };
      const cfg = customConfig || this.getConfig();
      const doShuffleQuestions = cfg.shuffleQuestions !== false;
      const doShuffleOptions = cfg.shuffleOptions !== false;

      let rawMcq = examData.practiceQuestions || [];
      let rawTf = examData.practiceTfQuestions || [];
      let rawEssay = examData.practiceEssayQuestions || [];

      let sampledMcq = [];
      let sampledTf = [];
      let sampledEssay = [];

      if (parseInt(grade, 10) === 10) {
        // Khối THPT: 19 câu trắc nghiệm (ngẫu nhiên từ 25 câu) + 3 câu đúng sai (ngẫu nhiên từ 6 câu) + 3 câu tự luận (ngẫu nhiên từ 3 câu)
        sampledMcq = this.sampleArray(rawMcq, 19);
        sampledTf = this.sampleArray(rawTf, 3);
        sampledEssay = this.sampleArray(rawEssay, 3);
      } else {
        // Khối THCS (Khối 8, 9): 28 câu trắc nghiệm (ngẫu nhiên từ 35 câu) + 3 câu tự luận (ngẫu nhiên từ 3 câu)
        sampledMcq = this.sampleArray(rawMcq, 28);
        sampledTf = [];
        sampledEssay = this.sampleArray(rawEssay, 3);
      }

      // Xáo trộn phương án A/B/C/D nếu cấu hình bật
      if (doShuffleOptions) {
        sampledMcq = sampledMcq.map(q => this.shuffleQuestionOptions(q));
      }

      // Xáo trộn thứ tự các câu hỏi nếu cấu hình bật
      if (doShuffleQuestions) {
        sampledMcq = this.shuffleArray(sampledMcq);
        if (sampledTf.length > 0) sampledTf = this.shuffleArray(sampledTf);
        if (sampledEssay.length > 0) sampledEssay = this.shuffleArray(sampledEssay);
      }

      // Chuẩn hóa lại số thứ tự hiển thị tuần tự (1..N) cho học sinh dễ theo dõi
      const mcqQuestions = sampledMcq.map((q, idx) => ({
        ...q,
        displayNum: idx + 1
      }));

      const tfQuestions = sampledTf.map((tf, idx) => ({
        ...tf,
        displayNum: idx + 1
      }));

      const essayQuestions = sampledEssay.map((es, idx) => ({
        ...es,
        displayNum: idx + 1
      }));

      return { mcqQuestions, tfQuestions, essayQuestions };
    }

    // --- PHÂN QUYỀN TRUY CẬP THEO TỪNG LỚP HỌC (CLASS ACCESS CONTROL) ---

    getClassAccessMode(studentClass) {
      const cfg = this.getConfig();
      if (cfg.classAccessControl && cfg.classAccessControl[studentClass]) {
        return cfg.classAccessControl[studentClass];
      }
      return cfg.defaultClassMode || 'practice_only';
    }

    setClassAccessMode(studentClass, mode) {
      const cfg = this.getConfig();
      const currentMap = { ...(cfg.classAccessControl || DEFAULT_CONFIG.classAccessControl) };
      currentMap[studentClass] = mode;
      const res = this.saveConfig({ classAccessControl: currentMap });
      this.logAudit('Đổi quyền truy cập lớp', `Lớp ${studentClass} chuyển sang trạng thái: ${mode}`);
      return res;
    }

    setQuickExamClass(targetClass) {
      const cfg = this.getConfig();
      const currentMap = { ...(cfg.classAccessControl || DEFAULT_CONFIG.classAccessControl) };
      Object.keys(currentMap).forEach(cls => {
        currentMap[cls] = (cls === targetClass) ? 'exam_only' : 'practice_only';
      });
      currentMap[targetClass] = 'exam_only';
      const res = this.saveConfig({ classAccessControl: currentMap });
      this.logAudit('Kích hoạt ca thi nhanh', `Bật ca thi chính thức cho Lớp ${targetClass}`);
      return res;
    }

    closeAllExamSessions() {
      const cfg = this.getConfig();
      const currentMap = { ...(cfg.classAccessControl || DEFAULT_CONFIG.classAccessControl) };
      Object.keys(currentMap).forEach(cls => {
        currentMap[cls] = 'practice_only';
      });
      const res = this.saveConfig({ classAccessControl: currentMap });
      this.logAudit('Đóng tất cả ca thi', 'Chuyển toàn bộ các lớp về chế độ Ôn tập đề cương');
      return res;
    }

    checkExamPassword(inputPassword) {
      const cfg = this.getConfig();
      const expected = (cfg.examPassword || '').trim().toLowerCase();
      return !!expected && (inputPassword || '').trim().toLowerCase() === expected;
    }

    setExamPassword(newPassword) {
      const res = this.saveConfig({ examPassword: (newPassword || '').trim() });
      this.logAudit('Đổi mật khẩu phòng thi', 'Đã cập nhật mật khẩu phòng thi');
      return res;
    }

    // --- QUẢN LÝ BÀI NỘP & CHẤM ĐIỂM TỰ LUẬN ---

    // --- QUẢN LÝ PHIÊN ÔN TẬP THEO MÃ LMS (SESSION SCOPE - KHÔNG LƯU VĨNH VIỄN) ---

    getPracticeAttempts(studentId) {
      const key = (studentId || 'anon').trim().toUpperCase();
      if (typeof sessionStorage !== 'undefined') {
        const val = sessionStorage.getItem('ahs_practice_attempts_' + key);
        return val ? parseInt(val, 10) : 0;
      }
      return this.practiceSessionMap.get(key) || 0;
    }

    incrementPracticeAttempt(studentId) {
      const key = (studentId || 'anon').trim().toUpperCase();
      const current = this.getPracticeAttempts(key);
      const next = current + 1;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('ahs_practice_attempts_' + key, next.toString());
      }
      this.practiceSessionMap.set(key, next);
      return next;
    }

    resetPracticeSession(studentId) {
      const key = (studentId || 'anon').trim().toUpperCase();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('ahs_practice_attempts_' + key);
      }
      this.practiceSessionMap.delete(key);
    }

    // --- QUẢN LÝ BÀI NỘP ÔN TẬP ĐỀ CƯƠNG (TÁCH BIỆT VỚI BÀI THI CHÍNH THỨC) ---

    getPracticeSubmissions() {
      try {
        return JSON.parse(localStorage.getItem(PRACTICE_SUBMISSIONS_KEY) || '[]');
      } catch {
        return [];
      }
    }

    savePracticeSubmission(subDoc) {
      if (!subDoc) return null;
      const list = this.getPracticeSubmissions();
      list.unshift(subDoc);
      // Giới hạn lưu tối đa 500 bài ôn tập gần nhất để tối ưu bộ nhớ
      const trimmed = list.slice(0, 500);
      localStorage.setItem(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(trimmed));
      this.notify(this.practiceSubmissionListeners, trimmed);
      return subDoc;
    }

    deletePracticeSubmission(subId) {
      const list = this.getPracticeSubmissions();
      const filtered = list.filter(s => s.id !== subId);
      localStorage.setItem(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(filtered));
      this.notify(this.practiceSubmissionListeners, filtered);
      return { success: true, count: filtered.length };
    }

    clearPracticeSubmissionsByClass(studentClass) {
      const list = this.getPracticeSubmissions();
      const filtered = list.filter(s => s.studentClass !== studentClass);
      localStorage.setItem(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(filtered));
      this.notify(this.practiceSubmissionListeners, filtered);
      this.logAudit('Xóa bảng điểm ôn tập lớp', `Đã xóa kết quả ôn tập của Lớp ${studentClass}`);
      return { success: true, count: filtered.length };
    }

    onPracticeSubmissionChange(cb) {
      this.practiceSubmissionListeners.push(cb);
      return () => {
        this.practiceSubmissionListeners = this.practiceSubmissionListeners.filter(f => f !== cb);
      };
    }

    getSubmissions() {
      try {
        return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
      } catch {
        return [];
      }
    }

    deleteSubmission(subId) {
      const list = this.getSubmissions();
      const filtered = list.filter(s => s.id !== subId && s.sessionId !== subId);
      if (filtered.length === list.length) {
        return { success: false, error: 'Không tìm thấy bài nộp cần xóa: ' + subId };
      }
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
      this.notify(this.submissionListeners, filtered);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            window.firebaseDb.collection('submissions').doc(subId).delete().catch(e => console.warn('Firestore del err', e));
          }
        } catch (e) { /* ignore */ }
      }

      this.logAudit('Xóa bài nộp', `Đã xóa bài nộp ID: ${subId}`);
      return { success: true, count: filtered.length };
    }

    saveSubmission(subData) {
      const rawScore = subData.finalScore !== undefined ? subData.finalScore : (subData.score !== undefined ? subData.score : subData.mcqPoints);
      const penalty = subData.penaltyPoints !== undefined ? subData.penaltyPoints : (subData.violations >= 3 ? 5 : 0);
      let calculatedFinal = typeof rawScore === 'number' ? Math.max(0, Math.round((rawScore - penalty) * 100) / 100) : rawScore;

      // 1. NẾU LÀ ÔN TẬP ĐỀ CƯƠNG: Lưu trong kho ôn tập riêng (phục vụ in bảng điểm đề cương), tự động gửi Webhook Google Drive
      if (subData.mode === 'practice') {
        const studentKey = subData.studentId || subData.studentCode || 'HS_ON_TAP';
        const attemptNum = this.incrementPracticeAttempt(studentKey);
        const transientDoc = {
          id: 'practice-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          ...subData,
          attemptNumber: attemptNum,
          durationSeconds: subData.durationSeconds || 0,
          durationFormatted: subData.durationFormatted || (subData.durationTaken ? subData.durationTaken : '30 phút'),
          penaltyPoints: 0,
          submittedAt: new Date().toISOString(),
          isGraded: true,
          finalScore: calculatedFinal,
          isPracticeOnly: true
        };
        // Lưu vào kho kết quả ôn tập đề cương riêng biệt
        this.savePracticeSubmission(transientDoc);
        // Tự động lưu điểm ôn tập lên Google Drive Webhook
        this.syncRowToGoogleDrive(transientDoc);
        // Trả về bản ghi để học sinh xem kết quả và tải ảnh minh chứng
        return transientDoc;
      }

      // 2. NẾU LÀ BÀI THI CHÍNH THỨC: Lưu trữ phục vụ giáo viên chấm và vào điểm
      // LƯU Ý QUAN TRỌNG: Câu tự luận do GV chấm, nên khi học sinh nộp bài CHỈ ghi nhận Điểm Trắc Nghiệm (tối đa 7.0đ)
      const list = this.getSubmissions();
      const mcqPoints = subData.mcqPoints !== undefined ? subData.mcqPoints : (subData.score || 0);
      const mcqNet = Math.max(0, Math.round((mcqPoints - penalty) * 100) / 100);

      const newDoc = {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        ...subData,
        durationSeconds: subData.durationSeconds || 0,
        durationFormatted: subData.durationFormatted || (subData.durationTaken ? subData.durationTaken : '45 phút'),
        penaltyPoints: penalty,
        submittedAt: new Date().toISOString(),
        isGraded: false, // Bắt buộc false khi mới nộp, chờ GV chấm tự luận
        essayScores: {},
        essayTotal: 0,
        finalScore: mcqNet, // Chỉ là điểm trắc nghiệm sau trừ phạt
        teacherFeedback: ''
      };
      list.unshift(newDoc);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
      this.notify(this.submissionListeners, list);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            window.firebaseDb.collection('submissions').doc(newDoc.id).set(newDoc).catch(e => console.warn('Firestore sub err', e));
          } else {
            const { collection, addDoc } = window.firebaseFirestoreModule || {};
            if (collection && addDoc) {
              addDoc(collection(window.firebaseDb, 'submissions'), newDoc).catch(e => console.warn('Firestore err', e));
            }
          }
        } catch (e) { /* fallback local only */ }
      }

      // Tự động đồng bộ lên Google Sheets qua Webhook (nếu Thầy đã cấu hình)
      this.syncRowToGoogleDrive(newDoc);

      return newDoc;
    }

    gradeEssaySubmission(subId, essayScores, teacherFeedback) {
      const list = this.getSubmissions();
      const idx = list.findIndex(s => s.id === subId);
      if (idx === -1) {
        return { success: false, error: 'Không tìm thấy bài nộp với ID: ' + subId };
      }

      const sub = list[idx];
      let essayTotal = 0;
      Object.values(essayScores || {}).forEach(v => {
        const num = parseFloat(v);
        if (!isNaN(num)) essayTotal += num;
      });
      essayTotal = Math.round(essayTotal * 100) / 100;

      // Tính tổng điểm có tính đến điểm trừ vi phạm (nếu vi phạm 3 lần)
      let autoScore = sub.mcqPoints !== undefined ? parseFloat(sub.mcqPoints) : (parseFloat(sub.score) || 0);
      let penalty = sub.penaltyPoints !== undefined ? sub.penaltyPoints : (sub.violations >= 3 ? 5 : 0);
      let rawTotal = autoScore + essayTotal;
      let finalScore = Math.max(0, Math.min(10, Math.round((rawTotal - penalty) * 100) / 100));

      sub.essayScores = essayScores;
      sub.essayTotal = essayTotal;
      sub.penaltyPoints = penalty;
      sub.finalScore = finalScore;
      sub.teacherFeedback = (teacherFeedback || '').trim();
      sub.isGraded = true;
      sub.gradedAt = new Date().toISOString();

      list[idx] = sub;
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
      this.notify(this.submissionListeners, list);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            window.firebaseDb.collection('submissions').doc(subId).set({
              essayScores,
              essayTotal,
              finalScore,
              teacherFeedback: sub.teacherFeedback,
              isGraded: true,
              gradedAt: sub.gradedAt
            }, { merge: true }).catch(e => console.warn('Firestore grade sync err', e));
          }
        } catch (e) { /* fallback local */ }
      }

      this.logAudit('Chấm tự luận học sinh', `${sub.fullName} (${sub.studentClass}): Tự luận ${essayTotal}đ -> Tổng ${finalScore}đ`);

      return { success: true, submission: sub };
    }

    // Chấm tự động phần trắc nghiệm (+ Đúng/Sai Khối 10) cho bài thi chính thức học sinh vừa nộp.
    // Gói Spark không có máy chủ: học sinh chỉ gửi bài làm, trang quản trị (đã nạp exam_bank kèm đáp án) chấm.
    // examsByGrade: { 8: { '101': exam, ... }, 9: {...}, 10: {...} }. Trả về số bài vừa chấm.
    autoGradeExamSubmissions(examsByGrade) {
      const pkg = (typeof window !== 'undefined' && window.AsianSchoolExamPackage) || require('./exam-package.js');
      const toMillis = (t) => (t && typeof t.toMillis === 'function') ? t.toMillis() : (t && typeof t.seconds === 'number' ? t.seconds * 1000 : null);
      const cfg = this.getConfig();
      const list = this.getSubmissions();
      const graded = [];

      list.forEach((sub, idx) => {
        if (sub.mode !== 'exam' || sub.autoGradedAt || !sub.answers) return;
        const exam = ((examsByGrade || {})[sub.grade] || {})[sub.examCode];
        if (!exam) return;
        const r = pkg.gradeExam(exam, sub.answers, { tfScoringPolicy: cfg.tfScoringPolicy });
        const penalty = sub.violations >= 3 ? 5 : 0;
        const essayTotal = sub.isGraded ? (parseFloat(sub.essayTotal) || 0) : 0;
        const startMs = toMillis(sub.startedAt);
        const endMs = toMillis(sub.serverSubmittedAt);
        const durationSeconds = startMs && endMs ? Math.max(0, Math.round((endMs - startMs) / 1000)) : (sub.durationSeconds || 0);
        const mins = Math.floor(durationSeconds / 60);
        const secs = durationSeconds % 60;
        const update = {
          mcqPoints: r.mcqPoints,
          maxMcqPoints: r.maxMcqPoints,
          correctMcq: r.correctMcq,
          penaltyPoints: penalty,
          finalScore: Math.max(0, Math.min(10, Math.round((r.mcqPoints + essayTotal - penalty) * 100) / 100)),
          durationSeconds,
          durationFormatted: `${mins} phút ${secs < 10 ? '0' : ''}${secs} giây`,
          // Thời gian theo giờ máy chủ vượt thời lượng cấu hình (chưa tính phút giám thị cộng thêm)
          overtimeSeconds: Math.max(0, durationSeconds - (cfg.examDurationMinutes || 45) * 60),
          autoGradedAt: new Date().toISOString()
        };
        list[idx] = { ...sub, ...update };
        graded.push({ id: sub.id, update });
      });

      if (!graded.length) return 0;
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
      this.notify(this.submissionListeners, list);
      if (typeof window !== 'undefined' && window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
        graded.forEach(({ id, update }) => {
          window.firebaseDb.collection('submissions').doc(id).set(update, { merge: true })
            .catch(e => console.warn('Firestore auto-grade err', e));
        });
      }
      this.logAudit('Chấm tự động trắc nghiệm', `${graded.length} bài thi chính thức`);
      return graded.length;
    }

    onSubmissionsChange(cb) {
      this.submissionListeners.push(cb);
      return () => {
        this.submissionListeners = this.submissionListeners.filter(f => f !== cb);
      };
    }

    getSubmissionById(id) {
      const list = this.getSubmissions();
      return list.find(s => s.id === id) || null;
    }

    exportSubmissionsJSON() {
      const list = this.getSubmissions();
      return JSON.stringify(list, null, 2);
    }

    importSubmissionsJSON(jsonString) {
      try {
        const imported = JSON.parse(jsonString);
        if (!Array.isArray(imported)) throw new Error('Dữ liệu không phải mảng danh sách bài nộp');
        const current = this.getSubmissions();
        const map = new Map();
        current.forEach(item => { if (item.id) map.set(item.id, item); });
        let addedCount = 0;
        imported.forEach(item => {
          const key = item.id || (item.sessionId ? 'sub-' + item.sessionId : 'sub-' + Math.random());
          if (!map.has(key)) {
            map.set(key, { ...item, id: key });
            addedCount++;
          }
        });
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(merged));
        this.notify(this.submissionListeners, merged);
        this.logAudit('Hợp nhất CSDL JSON', `Thêm mới ${addedCount} bài, tổng cộng: ${merged.length} bài`);
        return { success: true, count: merged.length, added: addedCount };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    exportSubmissionsCSV() {
      const list = this.getSubmissions();
      const headers = [
        'STT',
        'Mã LMS',
        'Họ và Tên',
        'Lớp',
        'Khối',
        'Chế Độ',
        'Mã Đề',
        'Thời Gian Làm Bài',
        'Điểm TN / Đ-S (Tự động)',
        'Điểm Tự Luận (Chấm)',
        'Điểm Phạt Vi Phạm',
        'Tổng Điểm (Thang 10)',
        'Trạng Thái Chấm',
        'Lời Phê Của Giáo Viên',
        'Số Lần Vi Phạm',
        'Thời Gian Nộp'
      ];

      const rows = list.map((s, idx) => {
        const autoScore = s.mcqPoints !== undefined ? s.mcqPoints : (s.score !== undefined ? s.score : '');
        const essayScore = s.isGraded ? (s.essayTotal !== undefined ? s.essayTotal : 0) : 'Chưa chấm';
        const finalScore = s.finalScore !== undefined ? s.finalScore : (s.score !== undefined ? s.score : autoScore);
        const gradingStatus = s.isGraded ? 'Đã chấm xong' : (s.mode === 'exam' ? 'Chờ chấm tự luận' : 'Ôn tập');
        const penaltyText = (s.penaltyPoints || (s.violations >= 3 ? 5 : 0)) ? `-${s.penaltyPoints || 5}đ` : '0đ';

        return [
          idx + 1,
          `"${(s.studentId || s.studentCode || '').replace(/"/g, '""')}"`,
          `"${(s.fullName || '').replace(/"/g, '""')}"`,
          `"${(s.studentClass || '').replace(/"/g, '""')}"`,
          s.grade || '',
          s.mode === 'exam' ? 'Thi Giữa HK1' : 'Ôn Tập Đề Cương',
          `"${(s.examCode || '').replace(/"/g, '""')}"`,
          `"${(s.durationFormatted || '45 phút').replace(/"/g, '""')}"`,
          autoScore,
          typeof essayScore === 'number' ? essayScore : `"${essayScore}"`,
          `"${penaltyText}"`,
          finalScore,
          `"${gradingStatus}"`,
          `"${(s.teacherFeedback || '').replace(/"/g, '""')}"`,
          s.violations || 0,
          `"${new Date(s.submittedAt || Date.now()).toLocaleString('vi-VN')}"`
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      return csvContent;
    }

    // --- QUẢN LÝ VÒNG ĐỜI DỮ LIỆU BÀI THI & DỌN DẸP AN TOÀN (2-3 TUẦN) ---

    getExamRetentionSummary() {
      const all = this.getSubmissions();
      const examSubs = all.filter(s => s.mode === 'exam');
      if (examSubs.length === 0) {
        return {
          totalCount: 0,
          oldestDate: null,
          newestDate: null,
          daysActive: 0,
          retentionDays: (this.getConfig().retentionDays || 21),
          isNearExpiry: false,
          isExpired: false
        };
      }
      const timestamps = examSubs.map(s => new Date(s.submittedAt || Date.now()).getTime());
      const minTs = Math.min(...timestamps);
      const maxTs = Math.max(...timestamps);
      const daysActive = Math.max(0, Math.floor((Date.now() - minTs) / (1000 * 60 * 60 * 24)));
      const cfg = this.getConfig();
      const retentionDays = cfg.retentionDays || 21;

      return {
        totalCount: examSubs.length,
        oldestDate: new Date(minTs).toISOString(),
        newestDate: new Date(maxTs).toISOString(),
        daysActive,
        retentionDays,
        isNearExpiry: daysActive >= 14,
        isExpired: daysActive >= retentionDays
      };
    }

    purgeOldExamSubmissions(options = {}) {
      const { purgeAll = true, olderThanDays = 0 } = options;
      const all = this.getSubmissions();
      const now = Date.now();
      const msThreshold = olderThanDays * 24 * 60 * 60 * 1000;

      const toKeep = [];
      const toDelete = [];

      all.forEach(sub => {
        if (sub.mode !== 'exam') {
          toKeep.push(sub);
          return;
        }
        if (purgeAll) {
          toDelete.push(sub);
        } else if (olderThanDays > 0) {
          const subTs = new Date(sub.submittedAt || now).getTime();
          if ((now - subTs) > msThreshold) {
            toDelete.push(sub);
          } else {
            toKeep.push(sub);
          }
        } else {
          toKeep.push(sub);
        }
      });

      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(toKeep));
      this.notify(this.submissionListeners, toKeep);

      // Xóa đồng bộ trên Firestore nếu có kết nối
      if (typeof window !== 'undefined' && window.firebaseDb && toDelete.length > 0) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            toDelete.forEach(sub => {
              if (sub.id) {
                window.firebaseDb.collection('submissions').doc(sub.id).delete()
                  .catch(e => console.warn('Firestore purge delete error:', e));
              }
            });
          }
        } catch (e) { /* ignore */ }
      }

      this.logAudit('Dọn dẹp kỳ thi', `Đã dọn dẹp ${toDelete.length} bài thi cũ. Còn lại: ${toKeep.length} bài.`);
      return { success: true, deletedCount: toDelete.length, remainingCount: toKeep.length };
    }

    // --- KẾT NỐI GOOGLE DRIVE (WEBHOOK & APPS SCRIPT) ---

    async testGoogleDriveConnection(testUrl, testToken) {
      const cfg = this.getConfig();
      const url = (testUrl !== undefined ? testUrl : (cfg.googleDriveWebhookUrl || '')).trim();
      const token = (testToken !== undefined ? testToken : (cfg.googleDriveWebhookToken || '')).trim();
      if (!url || !url.startsWith('http')) {
        return { success: false, error: 'Vui lòng dán URL Webhook hợp lệ (kết thúc bằng /exec) trước khi kiểm tra!' };
      }
      try {
        const payload = {
          action: 'test_connection',
          token: token,
          timestamp: new Date().toISOString(),
          testRow: {
            studentId: 'TEST_LMS',
            fullName: 'Kiểm Tra Kết Nối Webhook',
            grade: '10',
            studentClass: '10/14',
            examCode: '101',
            mcqPoints: 7.0,
            essayTotal: 3.0,
            finalScore: 10.0,
            violations: 0,
            durationFormatted: '00:01',
            submittedAt: new Date().toISOString()
          }
        };

        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        this.logAudit('Kiểm tra Webhook', 'Đã gửi gói tin thử nghiệm test_connection lên Google Webhook');
        return {
          success: true,
          message: 'Đã phát tín hiệu kiểm tra thành công! Hãy mở file Google Sheets của Thầy: dòng điểm mẫu "Kiểm Tra Kết Nối Webhook" sẽ xuất hiện ngay.'
        };
      } catch (err) {
        return {
          success: false,
          error: 'Lỗi gửi yêu cầu tới Webhook: ' + (err.message || 'Không thể kết nối')
        };
      }
    }

    async syncRowToGoogleDrive(subDoc) {
      const cfg = this.getConfig();
      const url = (cfg.googleDriveWebhookUrl || '').trim();
      if (!url || !url.startsWith('http')) return { success: false, reason: 'no_webhook' };

      try {
        const isPractice = subDoc.mode === 'practice';
        const formattedSub = {
          studentId: subDoc.studentId || subDoc.studentCode || '',
          fullName: subDoc.fullName || 'Học sinh',
          grade: subDoc.grade || '',
          studentClass: subDoc.studentClass || '',
          examCode: subDoc.examCode || (isPractice ? `ÔN TẬP — LẦN ${subDoc.attemptNumber || 1}` : '101'),
          mcqPoints: subDoc.mcqPoints !== undefined ? subDoc.mcqPoints : (subDoc.score || 0),
          essayTotal: subDoc.essayTotal || 0,
          finalScore: subDoc.finalScore !== undefined ? subDoc.finalScore : (subDoc.score || 0),
          violations: subDoc.violations || 0,
          durationFormatted: subDoc.durationFormatted || '30 phút',
          submittedAt: subDoc.submittedAt || new Date().toISOString()
        };
        const payload = {
          action: 'sync_row',
          token: (cfg.googleDriveWebhookToken || '').trim(),
          submission: formattedSub,
          syncedAt: new Date().toISOString()
        };
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        return { success: true };
      } catch (err) {
        console.warn('Google Drive row sync warning:', err);
        return { success: false, error: err.message };
      }
    }

    async syncAllToGoogleDrive() {
      const cfg = this.getConfig();
      const url = (cfg.googleDriveWebhookUrl || '').trim();
      if (!url || !url.startsWith('http')) {
        return { success: false, error: 'Chưa cấu hình URL Webhook của Google Drive / Apps Script!' };
      }

      const all = this.getSubmissions();
      const examSubs = all.filter(s => s.mode === 'exam');

      try {
        const payload = {
          action: 'backup_file',
          token: (cfg.googleDriveWebhookToken || '').trim(),
          examCount: examSubs.length,
          jsonContent: JSON.stringify(all, null, 2),
          csvContent: this.exportSubmissionsCSV(),
          timestamp: new Date().toISOString()
        };

        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        this.logAudit('Đồng bộ Google Drive', `Đã phát lệnh sao lưu ${examSubs.length} bài thi lên Google Drive`);
        return { success: true, count: examSubs.length };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // --- QUẢN LÝ PHIÊN TRỰC TIẾP (LIVE SESSIONS) ---

    getLiveSessions() {
      try {
        const raw = JSON.parse(localStorage.getItem(LIVE_KEY) || '[]');
        const now = Date.now();
        return raw.filter(s => (now - (s.lastPing || 0)) < 90 * 60 * 1000);
      } catch {
        return [];
      }
    }

    updateLiveSession(sessionData) {
      if (!sessionData) return null;

      const list = this.getLiveSessions();
      const idx = list.findIndex(s => s.sessionId === sessionData.sessionId);
      const updated = {
        ...(idx >= 0 ? list[idx] : {}),
        ...sessionData,
        lastPing: Date.now()
      };
      // Gắn uid người tạo phiên (học sinh đăng nhập ẩn danh) để firestore.rules kiểm tra quyền sở hữu
      const authUid = typeof window !== 'undefined' && window.AsianSchoolAuth ? window.AsianSchoolAuth.uid() : null;
      if (!updated.uid && authUid) updated.uid = authUid;
      if (idx >= 0) {
        list[idx] = updated;
      } else {
        list.unshift(updated);
      }
      localStorage.setItem(LIVE_KEY, JSON.stringify(list));
      this.notify(this.liveListeners, list);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            window.firebaseDb.collection('live_sessions').doc(sessionData.sessionId).set(updated, { merge: true })
              .catch(e => console.warn('Firestore live err', e));
          } else {
            const { doc, setDoc } = window.firebaseFirestoreModule || {};
            if (doc && setDoc) {
              setDoc(doc(window.firebaseDb, 'live_sessions', sessionData.sessionId), updated, { merge: true })
                .catch(e => console.warn('Firestore live err', e));
            }
          }
        } catch (e) { /* local fallback */ }
      }
      return updated;
    }

    removeLiveSession(sessionId) {
      let list = this.getLiveSessions();
      list = list.filter(s => s.sessionId !== sessionId);
      localStorage.setItem(LIVE_KEY, JSON.stringify(list));
      this.notify(this.liveListeners, list);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            window.firebaseDb.collection('live_sessions').doc(sessionId).delete()
              .catch(e => console.warn('Firestore delete live err', e));
          } else {
            const { doc, deleteDoc } = window.firebaseFirestoreModule || {};
            if (doc && deleteDoc) {
              deleteDoc(doc(window.firebaseDb, 'live_sessions', sessionId))
                .catch(e => console.warn('Firestore delete live err', e));
            }
          }
        } catch (e) { /* local fallback */ }
      }
    }

    clearLiveSessionsByClass(studentClass) {
      let list = this.getLiveSessions();
      const targetSessions = list.filter(s => s.studentClass === studentClass);
      list = list.filter(s => s.studentClass !== studentClass);
      localStorage.setItem(LIVE_KEY, JSON.stringify(list));
      this.notify(this.liveListeners, list);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          targetSessions.forEach(s => {
            if (typeof window.firebaseDb.collection === 'function') {
              window.firebaseDb.collection('live_sessions').doc(s.sessionId).delete().catch(() => {});
            } else {
              const { doc, deleteDoc } = window.firebaseFirestoreModule || {};
              if (doc && deleteDoc) {
                deleteDoc(doc(window.firebaseDb, 'live_sessions', s.sessionId)).catch(() => {});
              }
            }
          });
        } catch (e) { /* ignore */ }
      }
      this.logAudit('Dọn dẹp thí sinh theo lớp', `Đã dọn dẹp ${targetSessions.length} thí sinh của Lớp ${studentClass}`);
      return { success: true, count: targetSessions.length };
    }

    cleanStaleLiveSessions(maxAgeMinutes = 15) {
      let list = this.getLiveSessions();
      const cutoff = Date.now() - (maxAgeMinutes * 60 * 1000);
      const staleOrDone = list.filter(s => s.status === 'submitted' || (s.lastPing && s.lastPing < cutoff));
      list = list.filter(s => s.status !== 'submitted' && (!s.lastPing || s.lastPing >= cutoff));
      localStorage.setItem(LIVE_KEY, JSON.stringify(list));
      this.notify(this.liveListeners, list);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          staleOrDone.forEach(s => {
            if (typeof window.firebaseDb.collection === 'function') {
              window.firebaseDb.collection('live_sessions').doc(s.sessionId).delete().catch(() => {});
            } else {
              const { doc, deleteDoc } = window.firebaseFirestoreModule || {};
              if (doc && deleteDoc) {
                deleteDoc(doc(window.firebaseDb, 'live_sessions', s.sessionId)).catch(() => {});
              }
            }
          });
        } catch (e) { /* ignore */ }
      }
      this.logAudit('Dọn dẹp thí sinh cũ', `Đã dọn ${staleOrDone.length} thí sinh đã nộp bài hoặc không hoạt động quá ${maxAgeMinutes} phút`);
      return { success: true, count: staleOrDone.length };
    }

    onLiveChange(cb) {
      this.liveListeners.push(cb);
      return () => {
        this.liveListeners = this.liveListeners.filter(f => f !== cb);
      };
    }

    // --- LỆNH GIÁM THỊ THỜI GIAN THỰC (PROCTOR COMMANDS) ---

    getProctorCommandsRaw() {
      try {
        return JSON.parse(localStorage.getItem(PROCTOR_CMD_KEY) || '[]');
      } catch {
        return [];
      }
    }

    sendProctorCommand(targetSessionId, command, payload = {}) {
      const list = this.getProctorCommandsRaw();
      const cmdObj = {
        cmdId: 'cmd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        targetSessionId, // 'all' hoặc sessionId cụ thể
        command, // 'extend_time' | 'force_submit' | 'unlock_session' | 'broadcast_message'
        payload,
        createdAt: Date.now(),
        consumedBy: []
      };
      list.push(cmdObj);
      // Giữ lại 50 lệnh gần nhất
      const trimmed = list.slice(-50);
      localStorage.setItem(PROCTOR_CMD_KEY, JSON.stringify(trimmed));
      this.notify(this.cmdListeners, trimmed);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            window.firebaseDb.collection('proctor_commands').doc(cmdObj.cmdId).set(cmdObj)
              .catch(e => console.warn('Firestore cmd err', e));
          }
        } catch (e) { /* local fallback */ }
      }

      this.logAudit(`Lệnh giám thị: ${command}`, `Mục tiêu: ${targetSessionId} | Tham số: ${JSON.stringify(payload)}`);
      return cmdObj;
    }

    getPendingProctorCommands(sessionId) {
      const list = this.getProctorCommandsRaw();
      const now = Date.now();
      // Lấy các lệnh chưa được sessionId tiêu thụ trong vòng 15 phút
      return list.filter(cmd => {
        if ((now - cmd.createdAt) > 15 * 60 * 1000) return false;
        if (cmd.consumedBy && cmd.consumedBy.includes(sessionId)) return false;
        return cmd.targetSessionId === 'all' || cmd.targetSessionId === sessionId;
      });
    }

    consumeProctorCommand(cmdId, sessionId) {
      const list = this.getProctorCommandsRaw();
      const item = list.find(c => c.cmdId === cmdId);
      if (item) {
        if (!item.consumedBy) item.consumedBy = [];
        if (!item.consumedBy.includes(sessionId)) item.consumedBy.push(sessionId);
        localStorage.setItem(PROCTOR_CMD_KEY, JSON.stringify(list));
      }
    }

    onProctorCommandsChange(cb) {
      this.cmdListeners.push(cb);
      return () => {
        this.cmdListeners = this.cmdListeners.filter(f => f !== cb);
      };
    }

    // --- NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG) ---

    logAudit(action, details) {
      try {
        const raw = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
        raw.unshift({
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          action,
          details
        });
        const trimmed = raw.slice(0, 100);
        localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmed));
      } catch (e) {
        console.warn('Audit err', e);
      }
    }

    getAuditLogs() {
      try {
        return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
      } catch {
        return [];
      }
    }

    // --- PHÂN BỔ MÃ ĐỀ ---

    determineExamCode(grade, studentClass) {
      const cfg = this.getConfig();
      if (cfg.codeAllocationMode === 'fixed') {
        return cfg.fixedCode || '101';
      }
      if (cfg.codeAllocationMode === 'class_assigned') {
        if (cfg.classMapping && cfg.classMapping[studentClass]) {
          return cfg.classMapping[studentClass];
        }
        const numMatch = studentClass.match(/\d+$/);
        const lastNum = numMatch ? parseInt(numMatch[0]) : 1;
        const codeNum = 101 + ((lastNum - 1) % 4);
        return String(codeNum);
      }
      const codes = ['101', '102', '103', '104'];
      return codes[Math.floor(Math.random() * codes.length)];
    }
  }

  const instance = new StorageService();
  if (typeof window !== 'undefined') {
    window.AsianSchoolStorage = instance;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
  }
})();
