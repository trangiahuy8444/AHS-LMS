/**
 * storage-service.js
 * Quản lý lưu trữ dữ liệu bài thi, phiên trực tiếp, lệnh giám thị và cấu hình hệ thống
 * Hỗ trợ LocalStorage (offline/cục bộ) và Firebase Firestore (đồng bộ đám mây)
 */

(function () {
  function writeArchivedSource(collection, id, data, options, routing) {
    const archive = typeof window !== 'undefined' ? window.AsianSchoolDriveArchive : null;
    if (archive) return archive.writeCanonical(collection, id, data, options, routing);
    // Legacy embedders and unit-test harnesses that have not loaded the outbox yet.
    const ref = window.firebaseDb.collection(collection).doc(id);
    return options ? ref.set(data, options) : ref.set(data);
  }

  const SUBMISSIONS_KEY = 'asian_school_submissions_v1';
  const PRACTICE_SUBMISSIONS_KEY = 'asian_school_practice_submissions_v1';
  const PRACTICE_ATTEMPTS_KEY = 'asian_school_practice_attempt_details_v1';
  const PRACTICE_PENDING_KEY = 'asian_school_practice_pending_v1';
  const PRACTICE_QUEUE_LEDGER_KEY = 'asian_school_practice_queue_ledger_v1';
  const LIVE_KEY = 'asian_school_live_sessions_v1';
  // Giao kèo heartbeat với firestore.rules; bỏ trường cũ/lạ trước khi gửi.
  const LIVE_FIELDS = ['sessionId', 'uid', 'fullName', 'studentClass', 'studentId', 'grade',
    'mode', 'examCode', 'violations', 'status', 'isLocked', 'lockReason', 'penaltyPoints',
    'timeLeft', 'lastPing', 'score', 'maxScore', 'attemptNumber', 'pendingGrading'];
  const CONFIG_KEY = 'asian_school_exam_config_v1';
  const PROCTOR_CMD_KEY = 'asian_school_proctor_commands_v1';
  const AUDIT_LOG_KEY = 'asian_school_audit_log_v1';

  // Vi phạm 3 lần: hệ thống khóa bài chờ giám thị mở, KHÔNG tự trừ điểm; giáo viên tự ghi nhận vào sổ (quyết định 29/10/2026).
  // Bài nộp vẫn lưu số lần vi phạm để giáo viên đối chiếu.
  const VIOLATION_PENALTY_POINTS = 0;

  // Trường cấu hình chỉ giáo viên được xem: không bao giờ đẩy lên exam_config (học sinh đọc được)
  const PRIVATE_CONFIG_KEYS = ['examPassword', 'adminPasswordHash', 'googleDriveWebhookUrl', 'googleDriveWebhookToken'];

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
    examPeriod: 'midterm', // 'midterm' (Thi Giữa HK1) | 'final' (Thi Cuối HK1)
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
    // Khóa màn hình khi vi phạm an toàn bài thi (chuyển tab, thoát toàn màn hình 3 lần)
    lockOnExamViolation: true, // Thi chính thức: Mặc định KHÓA sau 3 lần vi phạm
    lockOnPracticeViolation: false, // Ôn tập đề cương: Mặc định KHÔNG KHÓA (chỉ cảnh báo vi phạm rèn luyện)

    // Chống nộp bài sớm & Quyền xem lại bài thi chính thức
    preventEarlySubmission: true,
    minExamMinutes: 15, // Thời gian tối thiểu (phút) được phép nộp bài thi
    allowStudentReviewOfficialExam: false, // Mặc định khóa xem lại chi tiết bài thi chính thức (toàn trường)
    classReviewControl: {}, // Điều khiển mở xem lại bài làm và chốt điểm theo từng lớp: { '8/19': true, '8/20': false, ... }
    reminderDurationSeconds: 5, // Thời gian (giây) hiển thị nhắc nhở của giáo viên trên màn hình học sinh
    
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

  function isRecoveredAssessmentRecord(sub) {
    return !!sub && sub.mode === 'exam' && Number(sub.grade) === 8 && sub.studentClass === '8/21'
      && sub.examCode === 'RECOVERY821' && sub.recoveryAssessment?.kind === 'practice-821-20261111';
  }

  function validateRecoveredAssessment(sub) {
    if (!isRecoveredAssessmentRecord(sub)) throw new Error('Bài nộp không thuộc đợt phục hồi lớp 8/21.');
    const source = sub.recoveryAssessment;
    if (typeof source.mcqScore !== 'number' || !Number.isFinite(source.mcqScore) || source.mcqScore < 0 || source.mcqScore > 7
      || Math.abs(source.mcqScore * 4 - Math.round(source.mcqScore * 4)) > 1e-8
      || sub.mcqPoints !== source.mcqScore || sub.score !== source.mcqScore || (sub.tfPoints !== undefined && sub.tfPoints !== 0)
      || typeof source.sourcePracticeId !== 'string' || !source.sourcePracticeId || source.missingMcqOrder !== true
      || !Array.isArray(source.essayQuestions) || source.essayQuestions.length !== 3
      || source.essayQuestions.some((q, i) => !q || Number(q.num) !== i + 1 || Number(q.points) !== 1)) {
      throw new Error('Nguồn điểm trắc nghiệm hoặc bộ tự luận đã thay đổi; chưa lưu điểm.');
    }
    return source;
  }

  function recoveredEssayScores(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).sort().join(',') !== '1,2,3') throw new Error('Cần đủ điểm ba câu tự luận 1, 2, 3, mỗi câu tối đa 1 điểm.');
    const scores = {};
    for (const key of ['1', '2', '3']) {
      const raw = value[key];
      if ((typeof raw !== 'number' && typeof raw !== 'string') || (typeof raw === 'string' && !raw.trim())) throw new Error('Phải nhập đủ điểm ba câu tự luận.');
      const number = Number(raw);
      if (!Number.isFinite(number) || number < 0 || number > 1 || Math.abs(number * 4 - Math.round(number * 4)) > 1e-8) throw new Error('Mỗi câu tự luận nhận 0–1 điểm theo bước 0,25.');
      scores[key] = number;
    }
    return { scores, total: Math.round(Object.values(scores).reduce((sum, point) => sum + point, 0) * 100) / 100 };
  }

  class StorageService {
    constructor() {
      this.submissionListeners = [];
      this.practiceSubmissionListeners = [];
      this.practiceAttemptListeners = [];
      this.liveListeners = [];
      this.configListeners = [];
      this.cmdListeners = [];
      this.practiceSessionMap = new Map(); // Bộ nhớ phiên ôn tập tạm theo mã LMS (fallback khi không có sessionStorage)
      this._memStore = new Map();
      this._memFailedKeys = new Set();

      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key) this._memFailedKeys.delete(e.key);
          if (e.key === SUBMISSIONS_KEY) this.notify(this.submissionListeners, this.getSubmissions());
          if (e.key === PRACTICE_SUBMISSIONS_KEY) this.notify(this.practiceSubmissionListeners, this.getPracticeSubmissions());
          if (e.key === PRACTICE_ATTEMPTS_KEY) this.notify(this.practiceAttemptListeners, this.getPracticeAttempts());
          if (e.key === LIVE_KEY) this.notify(this.liveListeners, this.getLiveSessions());
          if (e.key === CONFIG_KEY) this.notify(this.configListeners, this.getConfig());
          if (e.key === PROCTOR_CMD_KEY) this.notify(this.cmdListeners, this.getProctorCommandsRaw());
        });
      }
    }

    safeGetLocal(key) {
      if (this._memFailedKeys && this._memFailedKeys.has(key) && this._memStore && this._memStore.has(key)) {
        return this._memStore.get(key);
      }
      try {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
        return this._memStore ? (this._memStore.get(key) ?? null) : null;
      } catch {
        return this._memStore ? (this._memStore.get(key) ?? null) : null;
      }
    }

    safeSetLocal(key, value) {
      if (this._memStore) this._memStore.set(key, value);
      try {
        localStorage.setItem(key, value);
        if (this._memFailedKeys) this._memFailedKeys.delete(key);
        return true;
      } catch (err) {
        if (this._memFailedKeys) this._memFailedKeys.add(key);
        console.warn(`[Storage] Bộ nhớ cục bộ đầy hoặc bị chặn khi lưu "${key}", chuyển sang bộ nhớ phiên tạm:`, err?.message || err);
        return false;
      }
    }

    safeRemoveLocal(key) {
      if (this._memStore) this._memStore.delete(key);
      if (this._memFailedKeys) this._memFailedKeys.delete(key);
      try { localStorage.removeItem(key); } catch {}
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
        const raw = this.safeGetLocal(CONFIG_KEY);
        if (!raw) {
          this.safeSetLocal(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
          return DEFAULT_CONFIG;
        }
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }

    saveConfig(newConfig) {
      const merged = { ...this.getConfig(), ...newConfig };
      this.safeSetLocal(CONFIG_KEY, JSON.stringify(merged));
      this.notify(this.configListeners, merged);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            // exam_config học sinh đọc được: không đẩy mật khẩu, URL/token webhook lên đó.
            // Mật khẩu phòng thi -> exam_secrets/room; URL/token webhook -> exam_secrets/drive (chỉ giáo viên đọc)
            const publicConfig = { ...merged };
            PRIVATE_CONFIG_KEYS.forEach(k => { delete publicConfig[k]; });
            const fieldValue = typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue;
            if (fieldValue) {
              // Xóa hẳn các trường bí mật cũ còn sót trên bản cấu hình công khai
              PRIVATE_CONFIG_KEYS.forEach(k => { publicConfig[k] = fieldValue.delete(); });
            }
            window.firebaseDb.collection('exam_config').doc('global_config').set(publicConfig, { merge: true })
              .catch(e => console.warn('Firestore config save err', e));
            if (newConfig && newConfig.examPassword !== undefined) {
              window.firebaseDb.collection('exam_secrets').doc('room').set({ examPassword: newConfig.examPassword }, { merge: true })
                .catch(e => console.warn('Firestore secret save err', e));
            }
            const drive = {};
            if (newConfig && newConfig.googleDriveWebhookUrl !== undefined) drive.googleDriveWebhookUrl = newConfig.googleDriveWebhookUrl;
            if (newConfig && newConfig.googleDriveWebhookToken !== undefined) drive.googleDriveWebhookToken = newConfig.googleDriveWebhookToken;
            if (Object.keys(drive).length) {
              window.firebaseDb.collection('exam_secrets').doc('drive').set(drive, { merge: true })
                .catch(e => console.warn('Firestore drive secret save err', e));
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
      const indexed = q.options.map((opt, idx) => ({ opt, originalIndex: idx, isCorrect: idx === q.correctAnswer }));
      const shuffled = this.shuffleArray(indexed);
      const newOptions = shuffled.map(item => item.opt);
      const newCorrectAnswer = shuffled.findIndex(item => item.isCorrect);
      return {
        ...q,
        options: newOptions,
        ...(q.translations ? { translations: Object.fromEntries(Object.entries(q.translations).map(([language, translated]) => [language, {
          ...translated,
          ...(Array.isArray(translated.options) && translated.options.length === q.options.length ? { options: shuffled.map(item => translated.options[item.originalIndex]) } : {})
        }])) } : {}),
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

    // --- PHÂN QUYỀN XEM LẠI BÀI THI & CHỐT ĐIỂM THEO LỚP (CLASS REVIEW CONTROL) ---

    isClassReviewAllowed(studentClass) {
      const cfg = this.getConfig();
      if (cfg.allowStudentReviewOfficialExam) return true; // Cờ mở toàn trường
      if (studentClass && cfg.classReviewControl && cfg.classReviewControl[studentClass] === true) {
        return true;
      }
      return false;
    }

    setClassReviewMode(studentClass, isAllowed) {
      const cfg = this.getConfig();
      const currentMap = { ...(cfg.classReviewControl || {}) };
      currentMap[studentClass] = Boolean(isAllowed);
      const res = this.saveConfig({ classReviewControl: currentMap });
      this.logAudit('Đổi quyền xem bài theo lớp', `Lớp ${studentClass} ${isAllowed ? 'MỞ' : 'KHÓA'} chức năng xem lại bài và chốt điểm`);
      return res;
    }

    setGradeReviewMode(grade, isAllowed, classesList = []) {
      const cfg = this.getConfig();
      const currentMap = { ...(cfg.classReviewControl || {}) };
      classesList.forEach(cls => {
        currentMap[cls] = Boolean(isAllowed);
      });
      const res = this.saveConfig({ classReviewControl: currentMap });
      this.logAudit('Đổi quyền xem bài theo khối', `Khối ${grade} ${isAllowed ? 'MỞ' : 'KHÓA'} chức năng xem lại bài và chốt điểm cho ${classesList.length} lớp`);
      return res;
    }

    setAllClassesReviewMode(isAllowed, classesList = []) {
      const currentMap = {};
      classesList.forEach(cls => {
        currentMap[cls] = Boolean(isAllowed);
      });
      const res = this.saveConfig({
        allowStudentReviewOfficialExam: Boolean(isAllowed),
        classReviewControl: currentMap
      });
      this.logAudit('Đổi quyền xem bài toàn trường', `${isAllowed ? 'MỞ' : 'KHÓA'} chức năng xem lại bài và chốt điểm cho toàn bộ các lớp`);
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
      if (arguments.length === 0) {
        try { const rows = JSON.parse(this.safeGetLocal(PRACTICE_ATTEMPTS_KEY) || '[]'); return Array.isArray(rows) ? rows : []; } catch { return []; }
      }
      const key = (studentId || 'anon').trim().toUpperCase();
      if (typeof sessionStorage !== 'undefined') {
        const val = sessionStorage.getItem('ahs_practice_attempts_' + key);
        return val ? parseInt(val, 10) : 0;
      }
      return this.practiceSessionMap.get(key) || 0;
    }

    onPracticeAttemptChange(cb) {
      this.practiceAttemptListeners.push(cb);
      return () => { this.practiceAttemptListeners = this.practiceAttemptListeners.filter(fn => fn !== cb); };
    }

    savePracticeAttempt(doc) {
      if (!doc || !doc.id) return;
      const rows = this.getPracticeAttempts();
      const idx = rows.findIndex(row => row.id === doc.id);
      // A legacy summary can be enriched once with the full cloud attempt. Never overwrite saved answers.
      if (idx >= 0 && (rows[idx].answers || !doc.answers)) {
        const old = rows[idx];
        const sameAttempt = ['grade', 'studentClass', 'studentId', 'submittedAt'].every(k => String(old[k]) === String(doc[k]))
          && JSON.stringify(old.answers) === JSON.stringify(doc.answers);
        if (!old.practiceSet && doc.practiceSet && sameAttempt) {
          rows[idx] = JSON.parse(JSON.stringify({ ...old, practiceSet: doc.practiceSet, ...(old.startedAtMs ? {} : doc.startedAtMs ? { startedAtMs: doc.startedAtMs } : {}) }));
          this.safeSetLocal(PRACTICE_ATTEMPTS_KEY, JSON.stringify(rows));
          this.notify(this.practiceAttemptListeners, rows);
        }
        return;
      }
      const copy = JSON.parse(JSON.stringify(doc));
      if (idx >= 0) rows[idx] = copy; else rows.unshift(copy);
      this.safeSetLocal(PRACTICE_ATTEMPTS_KEY, JSON.stringify(rows));
      this.notify(this.practiceAttemptListeners, rows);
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
        const raw = JSON.parse((this.safeGetLocal ? this.safeGetLocal(PRACTICE_SUBMISSIONS_KEY) : localStorage.getItem(PRACTICE_SUBMISSIONS_KEY)) || '[]');
        if (!Array.isArray(raw)) return [];
        let modified = false;
        const normalized = raw.map(item => {
          if (!item) return item;
          let changed = false;
          // Chuẩn hóa lần làm bất thường (> 20 do lỗi lặp snapshot hàng chờ)
          if ((Number(item.attemptNumber) || 0) > 20 || (Number(item.totalAttempts) || 0) > 20) {
            item = { ...item, attemptNumber: 1, totalAttempts: 1 };
            changed = true;
          }
          // Chuẩn hóa điểm trắc nghiệm nếu = 0 nhưng có số câu đúng
          const scoreVal = Number(item.finalScore !== undefined ? item.finalScore : item.score);
          const mcqVal = Number(item.mcqPoints);
          if ((isNaN(mcqVal) || mcqVal === 0) && (scoreVal > 0 || Number(item.correctCount) > 0)) {
            const tot = Number(item.totalQuestions) || (Number(item.grade) === 10 ? 19 : 28);
            const recovered = scoreVal > 0 ? scoreVal : Math.round((Number(item.correctCount) / tot) * 10 * 10) / 10;
            item = { ...item, mcqPoints: recovered, score: Math.max(scoreVal, recovered), finalScore: Math.max(scoreVal, recovered) };
            changed = true;
          }
          if (changed) modified = true;
          return item;
        });
        if (modified) {
          this.safeSetLocal(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(normalized));
        }
        return normalized;
      } catch {
        return [];
      }
    }

    savePracticeSubmission(subDoc) {
      if (!subDoc) return null;
      this.savePracticeAttempt(subDoc);
      const list = this.getPracticeSubmissions();
      const sId = String(subDoc.studentId || '').trim();
      const sClass = subDoc.studentClass;
      const sGrade = Number(subDoc.grade);

      // Cập nhật duy nhất (unique) theo Mã LMS trong từng lớp học
      const idx = list.findIndex(s =>
        String(s.studentId || '').trim() === sId &&
        s.studentClass === sClass &&
        Number(s.grade) === sGrade
      );

      // Tính điểm trắc nghiệm chuẩn xác
      const rawMcq = subDoc.mcqPoints !== undefined ? Number(subDoc.mcqPoints) : 0;
      const rawScore = subDoc.finalScore !== undefined ? Number(subDoc.finalScore) : Number(subDoc.score || 0);
      let calculatedMcq = rawMcq > 0 ? rawMcq : rawScore;
      if (calculatedMcq === 0 && Number(subDoc.correctCount) > 0) {
        const tot = Number(subDoc.totalQuestions) || (sGrade === 10 ? 19 : 28);
        calculatedMcq = Math.round((Number(subDoc.correctCount) / tot) * 10 * 10) / 10;
      }

      if (idx >= 0) {
        const existing = list[idx];
        const newScore = Math.max(rawScore, calculatedMcq);
        const oldScore = existing.finalScore !== undefined ? Number(existing.finalScore) : Number(existing.score || 0);
        const isBetter = newScore >= oldScore;

        // Kiểm tra xem có phải cùng 1 bài nộp hay không (tránh cộng dồn vô tận khi snapshot Firestore re-entrant)
        const isSame = (existing.id && subDoc.id && existing.id === subDoc.id) ||
                       (existing._queueId && subDoc.id && existing._queueId === subDoc.id) ||
                       (existing.submittedAt && subDoc.submittedAt && existing.submittedAt === subDoc.submittedAt) ||
                       (existing.lastSubmittedAt && subDoc.submittedAt && existing.lastSubmittedAt === subDoc.submittedAt);

        let totalAttempts;
        if (isSame) {
          totalAttempts = Math.min(20, Math.max(1, Number(existing.attemptNumber) || 1));
        } else if (subDoc.attemptNumber && Number(subDoc.attemptNumber) > (Number(existing.attemptNumber) || 1)) {
          totalAttempts = Math.min(20, Number(subDoc.attemptNumber));
        } else {
          totalAttempts = Math.min(20, (Number(existing.attemptNumber) || 1) + 1);
        }

        const merged = {
          ...existing,
          ...(isBetter ? subDoc : {}),
          id: existing.id || subDoc.id,
          _queueId: subDoc.id || existing._queueId,
          attemptNumber: totalAttempts,
          totalAttempts,
          score: Math.max(oldScore, newScore),
          finalScore: Math.max(oldScore, newScore),
          mcqPoints: Math.max(Number(existing.mcqPoints) || 0, calculatedMcq),
          lastSubmittedAt: subDoc.submittedAt || new Date().toISOString(),
          submittedAt: isBetter ? (subDoc.submittedAt || new Date().toISOString()) : existing.submittedAt,
          durationFormatted: isBetter ? subDoc.durationFormatted : existing.durationFormatted,
          correctCount: isBetter ? subDoc.correctCount : existing.correctCount,
          totalQuestions: isBetter ? subDoc.totalQuestions : existing.totalQuestions,
          fullName: subDoc.fullName || existing.fullName
        };
        list[idx] = merged;
      } else {
        const safeAttempt = Math.min(20, Math.max(1, Number(subDoc.attemptNumber) || 1));
        const newRecord = {
          ...subDoc,
          _queueId: subDoc.id,
          attemptNumber: safeAttempt,
          totalAttempts: safeAttempt,
          mcqPoints: calculatedMcq,
          score: Math.max(rawScore, calculatedMcq),
          finalScore: Math.max(rawScore, calculatedMcq)
        };
        list.unshift(newRecord);
      }

      // Giới hạn lưu tối đa 500 bài ôn tập gần nhất để tối ưu bộ nhớ
      const trimmed = list.slice(0, 500);
      this.safeSetLocal(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(trimmed));
      this.notify(this.practiceSubmissionListeners, trimmed);
      return subDoc;
    }

    deletePracticeSubmission(subId) {
      const list = this.getPracticeSubmissions();
      const filtered = list.filter(s => s.id !== subId);
      this.safeSetLocal(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(filtered));
      this.notify(this.practiceSubmissionListeners, filtered);
      return { success: true, count: filtered.length };
    }

    clearPracticeSubmissionsByClass(studentClass) {
      const list = this.getPracticeSubmissions();
      const filtered = list.filter(s => s.studentClass !== studentClass);
      this.safeSetLocal(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(filtered));
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
        const raw = this.safeGetLocal ? this.safeGetLocal(SUBMISSIONS_KEY) : localStorage.getItem(SUBMISSIONS_KEY);
        return JSON.parse(raw || '[]');
      } catch {
        return [];
      }
    }

    deleteSubmission(subId) {
      if (this.getConfig().driveArchiveProtectDeletes === true && typeof window !== 'undefined' && window.AsianSchoolDriveArchive?.enabled()) {
        return { success: false, error: 'Đang bảo vệ dữ liệu lưu Drive. Cần đối chiếu bản lưu hiện tại trước khi xóa hoặc đặt lại lượt thi.' };
      }
      const targetId = String(subId || '').trim();
      if (!targetId) return { success: false, error: 'Mã bài nộp không hợp lệ' };

      let deletedFromExam = false;
      let deletedFromPractice = false;
      let targetExamSub = null;

      // 1. Kiểm tra và xóa trong danh sách bài thi chính thức (SUBMISSIONS_KEY)
      const examList = this.getSubmissions();
      targetExamSub = examList.find(s => String(s.id) === targetId || String(s.sessionId) === targetId);
      const filteredExam = examList.filter(s => String(s.id) !== targetId && String(s.sessionId) !== targetId);
      if (filteredExam.length !== examList.length) {
        this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(filteredExam));
        this.notify(this.submissionListeners, filteredExam);
        deletedFromExam = true;
      }

      // 2. Kiểm tra và xóa trong danh sách ôn tập đề cương (PRACTICE_SUBMISSIONS_KEY)
      const practiceList = this.getPracticeSubmissions();
      const filteredPractice = practiceList.filter(s => String(s.id) !== targetId && String(s.sessionId) !== targetId);
      if (filteredPractice.length !== practiceList.length) {
        this.safeSetLocal(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(filteredPractice));
        this.notify(this.practiceSubmissionListeners, filteredPractice);
        deletedFromPractice = true;
      }

      if (!deletedFromExam && !deletedFromPractice) {
        return { success: false, error: 'Không tìm thấy bài nộp cần xóa: ' + targetId };
      }

      // 3. Xóa đồng bộ trên Cloud Firestore (nếu có kết nối)
      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            window.firebaseDb.collection('submissions').doc(targetId).delete().catch(e => console.warn('Firestore del err', e));

            // Xóa/reset lượt thi tương ứng trong exam_attempts (để học sinh thi lại được)
            const attemptIdsToDelete = new Set();
            if (targetExamSub) {
              if (targetExamSub.attemptId) attemptIdsToDelete.add(targetExamSub.attemptId);
              const g = Number(targetExamSub.grade);
              const k = targetExamSub.studentId ? String(targetExamSub.studentId).trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
              const ck = targetExamSub.studentClass ? String(targetExamSub.studentClass).trim().replace(/[^a-zA-Z0-9]/g, '_') : '';
              if (g && k) {
                if (ck) attemptIdsToDelete.add(`g${g}_${ck}_${k}`);
                attemptIdsToDelete.add(`g${g}_${k}`);
              }
              if (targetExamSub.sessionId) {
                window.firebaseDb.collection('live_sessions').doc(targetExamSub.sessionId).delete().catch(() => {});
              }
              if (targetExamSub.uid) {
                window.firebaseDb.collection('exam_sessions').doc(targetExamSub.uid).delete().catch(() => {});
              }
            } else {
              const inferredAttemptId = targetId.replace(/_\d+$/, '');
              if (inferredAttemptId && inferredAttemptId !== targetId) {
                attemptIdsToDelete.add(inferredAttemptId);
              }
            }

            for (const attId of attemptIdsToDelete) {
              window.firebaseDb.collection('exam_attempts').doc(attId).delete().catch(e => console.warn('Lỗi xóa exam_attempt:', attId, e));
            }
          }
        } catch (e) { /* ignore */ }
      }

      this.logAudit('Xóa bài nộp & Reset lượt', `Đã xóa bài nộp ID: ${targetId} và reset lượt thi tương ứng.`);
      return { success: true, count: filteredExam.length, deletedFromExam, deletedFromPractice };
    }

    async resetExamAttempt({ grade, studentClass, studentId, attemptId } = {}) {
      if (this.getConfig().driveArchiveProtectDeletes === true && typeof window !== 'undefined' && window.AsianSchoolDriveArchive?.enabled()) {
        return { success: false, error: 'Đang bảo vệ dữ liệu lưu Drive. Cần đối chiếu bản lưu hiện tại trước khi xóa hoặc đặt lại lượt thi.' };
      }
      if (typeof window === 'undefined' || !window.firebaseDb || typeof window.firebaseDb.collection !== 'function') {
        return { success: false, error: 'Chưa kết nối Cloud Firestore' };
      }
      try {
        const attemptIds = new Set();
        if (attemptId) attemptIds.add(attemptId);
        const g = Number(grade);
        const k = studentId ? (window.AsianSchoolNormalize ? window.AsianSchoolNormalize.normalizeLmsCode(studentId) : String(studentId).trim().toUpperCase().replace(/[^A-Z0-9]/g, '')) : '';
        const ck = studentClass ? String(studentClass).trim().replace(/[^a-zA-Z0-9]/g, '_') : '';
        if (g && k) {
          if (ck) attemptIds.add(`g${g}_${ck}_${k}`);
          attemptIds.add(`g${g}_${k}`);
        }

        const col = window.firebaseDb.collection('exam_attempts');
        for (const id of attemptIds) {
          await col.doc(id).delete().catch(() => {});
        }

        if (k && typeof col.where === 'function') {
          try {
            let q = col.where('studentId', '==', k);
            if (g) q = q.where('grade', '==', g);
            const snap = await q.get();
            if (snap && !snap.empty) {
              const batch = window.firebaseDb.batch();
              snap.forEach(doc => batch.delete(doc.ref));
              await batch.commit();
            }
          } catch (e) { /* ignore */ }
        }

        this.logAudit('Reset lượt thi', `Đã reset lượt thi Mã LMS: ${k || attemptId} (Khối ${grade || ''} ${studentClass || ''})`);
        return { success: true };
      } catch (err) {
        console.error('Lỗi khi reset exam attempt:', err);
        return { success: false, error: err.message };
      }
    }

    async clearAllData() {
      if (this.getConfig().driveArchiveProtectDeletes === true && typeof window !== 'undefined' && window.AsianSchoolDriveArchive?.enabled()) {
        return { success: false, error: 'Đang bảo vệ dữ liệu lưu Drive. Cần đối chiếu bản lưu hiện tại trước khi xóa hoặc đặt lại lượt thi.' };
      }
      // 1. Xóa sạch dữ liệu cục bộ LocalStorage
      this.safeRemoveLocal(SUBMISSIONS_KEY);
      this.safeRemoveLocal(PRACTICE_SUBMISSIONS_KEY);
      this.safeRemoveLocal(LIVE_KEY);

      this.notify(this.submissionListeners, []);
      this.notify(this.practiceSubmissionListeners, []);
      this.notify(this.liveListeners, []);

      // 2. Xóa đồng bộ trên Cloud Firestore (toàn bộ collections liên quan đến ca thi và bài làm)
      if (typeof window !== 'undefined' && window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
        try {
          const deleteCollectionDocs = async (collName) => {
            try {
              const snap = await window.firebaseDb.collection(collName).get();
              if (!snap || snap.empty) return;
              const batchSize = 400;
              let batch = window.firebaseDb.batch();
              let count = 0;
              for (const d of snap.docs) {
                batch.delete(d.ref);
                count++;
                if (count % batchSize === 0) {
                  await batch.commit();
                  batch = window.firebaseDb.batch();
                }
              }
              if (count % batchSize !== 0) {
                await batch.commit();
              }
            } catch (colErr) {
              console.warn(`[clearAllData] Không thể xóa collection ${collName}:`, colErr);
            }
          };

          await Promise.all([
            deleteCollectionDocs('submissions'),
            deleteCollectionDocs('live_sessions'),
            deleteCollectionDocs('exam_attempts'),
            deleteCollectionDocs('exam_sessions'),
            deleteCollectionDocs('exam_keys'),
            deleteCollectionDocs('practice_results'),
            deleteCollectionDocs('proctor_commands')
          ]);
        } catch (err) {
          console.warn('Lỗi khi xóa CSDL Cloud Firestore:', err);
        }
      }

      this.logAudit('Xóa trắng CSDL', 'Đã xóa toàn bộ bài thi, lượt thi (exam_attempts) và phiên giám sát trên máy và Cloud Firestore.');
      return { success: true };
    }

    saveSubmission(subData) {
      const rawScore = subData.finalScore !== undefined ? subData.finalScore : (subData.score !== undefined ? subData.score : subData.mcqPoints);
      const penalty = VIOLATION_PENALTY_POINTS;
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
        // Gửi vào hàng chờ practice_results; trang quản trị đẩy lên Google Sheets rồi xóa khỏi hàng chờ
        // (máy học sinh không giữ URL/token webhook)
        this.queuePracticeResult(transientDoc);
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
      this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(list));
      this.notify(this.submissionListeners, list);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            writeArchivedSource('submissions', newDoc.id, newDoc).catch(e => console.warn('Firestore sub err', e));
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

    gradeEssaySubmission(subId, essayScores, teacherFeedback, options = {}) {
      const targetId = String(subId || '').trim();
      let list = this.getSubmissions();
      let idx = list.findIndex(s => String(s.id).trim() === targetId || String(s.sessionId).trim() === targetId);
      let isPractice = false;

      // Nếu không tìm thấy trong bài thi chính thức, kiểm tra kho bài ôn tập đề cương
      if (idx === -1) {
        list = this.getPracticeSubmissions();
        idx = list.findIndex(s => String(s.id).trim() === targetId || String(s.sessionId).trim() === targetId);
        if (idx !== -1) isPractice = true;
      }

      if (idx === -1) {
        return { success: false, error: 'Không tìm thấy bài nộp với ID: ' + targetId };
      }

      const sub = list[idx];
      if (isRecoveredAssessmentRecord(sub)) return this.approveRecoveredEssayGrade(sub, essayScores, teacherFeedback, options);
      for (const [questionNum,value] of Object.entries(essayScores || {})) {
        const number = value === '' ? 0 : Number(value);
        const max = Number(sub.grade || String(sub.studentClass || '').split('/')[0]) === 10 ? 0.75 : 1;
        if (!Number.isFinite(number) || number < 0 || number > max || Math.abs(number * 4 - Math.round(number * 4)) > 1e-8) {
          return { success: false, error: `Câu ${questionNum}: điểm phải theo bước 0,25 trong khoảng 0–${max}. Không lưu điểm lẻ như 0,88; thầy kiểm tra lại barem.` };
        }
      }
      let essayTotal = 0;
      Object.values(essayScores || {}).forEach(v => {
        const num = parseFloat(v);
        if (!isNaN(num)) essayTotal += num;
      });
      essayTotal = Math.round(essayTotal * 100) / 100;

      // Bảo vệ điểm trắc nghiệm / đúng sai nếu chưa tính
      if (sub.mcqPoints === undefined && sub.answers && typeof window !== 'undefined' && window.AsianSchoolLatestExamBank && window.AsianSchoolExamPackage) {
        const exam = window.AsianSchoolLatestExamBank[sub.grade]?.[sub.examCode || '101'];
        if (exam) {
          const r = window.AsianSchoolExamPackage.gradeExam(exam, sub.answers, { tfScoringPolicy: this.getConfig().tfScoringPolicy });
          sub.mcqPoints = r.mcqPoints;
          sub.maxMcqPoints = r.maxMcqPoints;
        }
      }

      let autoScore = sub.mcqPoints !== undefined ? parseFloat(sub.mcqPoints) : (parseFloat(sub.score) || 0);
      let penalty = VIOLATION_PENALTY_POINTS;
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

      if (isPractice) {
        this.safeSetLocal(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.practiceSubmissionListeners, list);
      } else {
        this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.submissionListeners, list);

        if (typeof window !== 'undefined' && window.firebaseDb) {
          try {
            if (typeof window.firebaseDb.collection === 'function') {
              writeArchivedSource('submissions', targetId, {
                essayScores,
                essayTotal,
                finalScore,
                teacherFeedback: sub.teacherFeedback,
                isGraded: true,
                gradedAt: sub.gradedAt
              }, { merge: true }, sub).catch(e => console.warn('Firestore grade sync err', e));
            }
          } catch (e) { /* fallback local */ }
        }
      }

      this.logAudit('Chấm tự luận học sinh', `${sub.fullName || sub.studentId} (${sub.studentClass}): Tự luận +${essayTotal}đ -> Tổng ${finalScore}đ`);
      this.syncRowToGoogleDrive(sub);

      return { success: true, submission: sub };
    }

    async writeRecoveredAssessment(sub, makeUpdate, options = {}) {
      try {
        const localSource = validateRecoveredAssessment(sub);
        const db = typeof window !== 'undefined' ? window.firebaseDb : null;
        if (!db || typeof db.runTransaction !== 'function') throw new Error('Chưa kết nối được máy chủ; chưa xác nhận lưu điểm.');
        const ref = db.collection('submissions').doc(sub.id);
        let saved;
        await db.runTransaction(async transaction => {
          const snap = await transaction.get(ref);
          if (!snap || !snap.exists) throw new Error('Không tìm thấy bài phục hồi trên máy chủ.');
          const latest = { ...snap.data(), id: sub.id };
          const remoteSource = validateRecoveredAssessment(latest);
          const stable = value => JSON.stringify(value, (key, val) => val && typeof val === 'object' && !Array.isArray(val) ? Object.fromEntries(Object.keys(val).sort().map(k => [k, val[k]])) : val);
          if (stable(remoteSource) !== stable(localSource) || latest.studentId !== sub.studentId
            || latest.uid !== sub.uid || stable(latest.answers) !== stable(sub.answers)) throw new Error('Nguồn bài làm đã thay đổi; hãy mở lại bài trước khi chấm.');
          const expectedRevision = options.expectedGradeRevision ?? (sub.gradeRevision || 0);
          if ((latest.gradeRevision || 0) !== expectedRevision) throw new Error('Điểm đã được cập nhật ở phiên khác; hãy mở lại bài để kiểm tra.');
          if (options.expectedProposalVersion !== undefined && (latest.aiEssayProposal?.version || 0) !== options.expectedProposalVersion) throw new Error('Đề xuất AI đã thay đổi; hãy mở lại bài trước khi duyệt.');
          const update = makeUpdate(latest);
          saved = { ...latest, ...update };
          transaction.set(ref, update, { merge: true });
          const archive = window.AsianSchoolDriveArchive;
          if (archive?.enabled()) archive.addArchiveWrite(transaction, 'submissions', sub.id, saved);
        });
        // Never announce success or replace a local grade before the server commit acknowledges it.
        const list = this.getSubmissions();
        const idx = list.findIndex(row => row.id === sub.id);
        if (idx >= 0) list[idx] = saved; else list.unshift(saved);
        this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.submissionListeners, list);
        return { success: true, submission: saved };
      } catch (error) { return { success: false, error: error.message || 'Chưa xác nhận lưu trên máy chủ.' }; }
    }

    async saveRecoveredEssayProposal(subId, gradeRes) {
      try {
        const sub = this.getSubmissions().find(row => row.id === subId);
        validateRecoveredAssessment(sub);
        if (!gradeRes || gradeRes.success !== true) throw new Error('AI chưa đề xuất hợp lệ đủ ba câu.');
        const { scores, total } = recoveredEssayScores(gradeRes.essayScores);
        if (gradeRes.essayTotal !== undefined && Number(gradeRes.essayTotal) !== total) throw new Error('Tổng điểm AI không khớp ba câu tự luận.');
        return this.writeRecoveredAssessment(sub, latest => {
          if (latest.isGraded || latest.teacherApprovedAt || latest.scoreConfirmed) throw new Error('Bài đã được thầy duyệt; AI không được ghi đè.');
          return { aiEssayProposal: {
            essayScores: scores, essayTotal: total,
            teacherFeedback: String(gradeRes.teacherFeedback || '').trim(),
            usedModels: Array.isArray(gradeRes.usedModels) ? gradeRes.usedModels.filter(model => typeof model === 'string') : [],
            proposedAt: new Date().toISOString(), baseGradeRevision: latest.gradeRevision || 0,
            version: (Number(latest.aiEssayProposal?.version) || 0) + 1, pending: true
          } };
        });
      } catch (error) { return { success: false, error: error.message }; }
    }

    async approveRecoveredEssayGrade(sub, essayScores, teacherFeedback, options = {}) {
      try {
        validateRecoveredAssessment(sub);
        const { scores, total } = recoveredEssayScores(essayScores);
        return this.writeRecoveredAssessment(sub, latest => {
          const at = new Date().toISOString();
          const finalScore = Math.round((latest.recoveryAssessment.mcqScore + total) * 100) / 100;
          return { essayScores: scores, essayTotal: total, finalScore,
            teacherFeedback: String(teacherFeedback || '').trim(), penaltyPoints: 0,
            isGraded: true, gradedAt: at, teacherApprovedAt: at,
            gradeRevision: (Number(latest.gradeRevision) || 0) + 1,
            scoreConfirmed: false, scoreConfirmedAt: null, confirmedByAdmin: false, scoreConfirmedRevision: null,
            // Approved sources become student-readable: retain only the teacher's approved grade and feedback.
            aiEssayProposal: null
          };
        }, options);
      } catch (error) { return { success: false, error: error.message }; }
    }

    // Admin duyệt và cập nhật lại mã LMS (và họ tên nếu có) cho bài nộp chưa khớp vào CSDL
    updateSubmissionStudentId(subId, newStudentId, newFullName = null) {
      const targetId = String(subId || '').trim();
      const cleanNewId = String(newStudentId || '').trim();
      if (!targetId || !cleanNewId) return { success: false, error: 'Thiếu ID bài nộp hoặc mã LMS mới.' };

      let list = this.getSubmissions();
      let idx = list.findIndex(s => String(s.id).trim() === targetId || String(s.sessionId).trim() === targetId);
      let isPractice = false;

      if (idx === -1) {
        list = this.getPracticeSubmissions();
        idx = list.findIndex(s => String(s.id).trim() === targetId || String(s.sessionId).trim() === targetId);
        if (idx !== -1) isPractice = true;
      }

      if (idx === -1) return { success: false, error: 'Không tìm thấy bài nộp với ID: ' + targetId };

      const sub = list[idx];
      const oldId = sub.studentId;
      sub.studentId = cleanNewId;
      if (newFullName && String(newFullName).trim()) {
        sub.fullName = String(newFullName).trim();
      }
      sub.updatedAt = new Date().toISOString();
      list[idx] = sub;

      const updatePayload = {
        studentId: cleanNewId,
        ...(newFullName ? { fullName: sub.fullName } : {}),
        updatedAt: sub.updatedAt
      };

      if (isPractice) {
        this.safeSetLocal(PRACTICE_SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.practiceSubmissionListeners, list);
        if (typeof window !== 'undefined' && window.firebaseDb) {
          try {
            window.firebaseDb.collection('practice_results').doc(targetId).set(updatePayload, { merge: true })
              .catch(e => console.warn('Firestore practice_results update err', e));
          } catch (e) { /* fallback */ }
        }
      } else {
        this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.submissionListeners, list);
        if (typeof window !== 'undefined' && window.firebaseDb) {
          try {
            if (typeof writeArchivedSource === 'function') {
              writeArchivedSource('submissions', targetId, updatePayload, { merge: true }, sub)
                .catch(e => console.warn('Firestore update submission err', e));
            } else {
              window.firebaseDb.collection('submissions').doc(targetId).set(updatePayload, { merge: true })
                .catch(e => console.warn('Firestore update submission err', e));
            }
          } catch (e) { /* fallback */ }
        }
      }

      this.logAudit('Cập nhật mã LMS bài nộp', `${sub.fullName || cleanNewId} (${sub.studentClass}): Đổi mã LMS từ ${oldId} sang ${cleanNewId}`);
      this.syncRowToGoogleDrive(sub);
      return { success: true, submission: sub };
    }

    // Chấm tự động phần trắc nghiệm (+ Đúng/Sai Khối 10) cho bài thi chính thức học sinh vừa nộp.
    // Gói Spark không có máy chủ: học sinh chỉ gửi bài làm, trang quản trị (đã nạp exam_bank kèm đáp án) chấm.
    // examsByGrade: { 8: { '101': exam, ... }, 9: {...}, 10: {...} }. Trả về số bài vừa chấm.
    autoGradeExamSubmissions(examsByGrade) {
      if (this._isAutoGrading) return 0;
      this._isAutoGrading = true;
      try {
        const pkg = (typeof window !== 'undefined' && window.AsianSchoolExamPackage) || require('./exam-package.js');
        const toMillis = (t) => (t && typeof t.toMillis === 'function') ? t.toMillis() : (t && typeof t.seconds === 'number' ? t.seconds * 1000 : null);
        const cfg = this.getConfig();
        const timingPkg = (typeof window !== 'undefined' && window.AsianSchoolExamTiming) || require('./exam-timing.js');
        const list = this.getSubmissions();
        const graded = [];

        list.forEach((sub, idx) => {
          if (isRecoveredAssessmentRecord(sub) || sub.mode !== 'exam' || sub.autoGradedAt || !sub.answers) return;
          const exam = ((examsByGrade || {})[sub.grade] || {})[sub.examCode];
          if (!exam) return;
          const r = pkg.gradeExam(exam, sub.answers, { tfScoringPolicy: cfg.tfScoringPolicy });
          const penalty = VIOLATION_PENALTY_POINTS;
          const essayTotal = sub.isGraded ? (parseFloat(sub.essayTotal) || 0) : 0;
          const startMs = toMillis(sub.startedAt);
          const endMs = toMillis(sub.serverSubmittedAt);
          const durationSeconds = startMs && endMs ? Math.max(0, Math.round((endMs - startMs) / 1000)) : (sub.durationSeconds || 0);
          const mins = Math.floor(durationSeconds / 60);
          const secs = durationSeconds % 60;
          const timing = timingPkg.getSubmissionTiming(sub);
          const update = {
            mcqPoints: r.mcqPoints,
            maxMcqPoints: r.maxMcqPoints,
            correctMcq: r.correctMcq,
            penaltyPoints: penalty,
            finalScore: Math.max(0, Math.min(10, Math.round((r.mcqPoints + essayTotal - penalty) * 100) / 100)),
            durationSeconds,
            durationFormatted: `${mins} phút ${secs < 10 ? '0' : ''}${secs} giây`,
            // Chỉ ghi độ trễ khi đủ mốc máy chủ, thời lượng và giờ được cấp của chính lượt thi.
            overtimeSeconds: timing.known ? timing.lateSeconds : null,
            mcqResults: r.mcqResults,
            tfResults: r.tfResults,
            autoGradedAt: new Date().toISOString()
          };
          list[idx] = { ...sub, ...update };
          graded.push({ id: sub.id, update });
        });

        if (!graded.length) return 0;
        this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.submissionListeners, list);
        if (typeof window !== 'undefined' && window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
          graded.forEach(({ id, update }) => {
            writeArchivedSource('submissions', id, update, { merge: true }, list.find(sub => sub.id === id))
              .catch(e => console.warn('Firestore auto-grade err', e));
          });
        }
        this.logAudit('Chấm tự động trắc nghiệm', `${graded.length} bài thi chính thức`);
        return graded.length;
      } finally {
        this._isAutoGrading = false;
      }
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

    confirmScore(subId, options = {}) {
      const targetId = String(subId || '').trim();
      const list = this.getSubmissions();
      const idx = list.findIndex(s => s.id === targetId || s.submissionId === targetId);
      const now = new Date().toISOString();
      if (idx !== -1) {
        const sub = list[idx];
        if (isRecoveredAssessmentRecord(sub) && (!sub.isGraded || !sub.teacherApprovedAt)) return { success: false, error: 'Bài phục hồi cần thầy duyệt đủ ba câu tự luận trước khi xác nhận điểm.' };
        sub.scoreConfirmed = true;
        sub.scoreConfirmedAt = now;
        if (options.confirmedByAdmin) {
          sub.confirmedByAdmin = true;
        }
        list[idx] = sub;
        this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.submissionListeners, list);

        if (options.confirmedByAdmin && typeof window !== 'undefined' && window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
          try {
            const docId = sub.id || targetId;
            const updatePayload = {
              scoreConfirmed: true,
              scoreConfirmedAt: now,
              confirmedByAdmin: true
            };
            writeArchivedSource('submissions', docId, updatePayload, { merge: true }, sub)
              .catch(() => {
                window.firebaseDb.collection('submissions').doc(docId).set(updatePayload, { merge: true }).catch(() => {});
              });
          } catch (e) { /* ignore */ }
        }

        if (options.confirmedByAdmin) {
          this.logAudit(
            'Xác nhận điểm thay học sinh',
            `${sub.fullName || sub.studentId} (Lớp ${sub.studentClass}): Đã xác nhận điểm ${sub.finalScore !== undefined ? sub.finalScore : (sub.mcqPoints || 0)}đ`
          );
        }

        this.syncRowToGoogleDrive(sub);
      }
      return { success: true, confirmedAt: now };
    }

    confirmBatchScoresByAdmin(subIds = []) {
      const idSet = new Set((subIds || []).map(id => String(id || '').trim()).filter(Boolean));
      if (idSet.size === 0) return { success: false, count: 0 };

      const list = this.getSubmissions();
      const now = new Date().toISOString();
      const updatedSubs = [];

      list.forEach((sub, idx) => {
        const key = String(sub.id || sub.submissionId || '').trim();
        if (idSet.has(key) && !sub.scoreConfirmed && (!isRecoveredAssessmentRecord(sub) || (sub.isGraded && sub.teacherApprovedAt))) {
          sub.scoreConfirmed = true;
          sub.scoreConfirmedAt = now;
          sub.confirmedByAdmin = true;
          list[idx] = sub;
          updatedSubs.push(sub);
        }
      });

      if (updatedSubs.length > 0) {
        this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(list));
        this.notify(this.submissionListeners, list);

        if (typeof window !== 'undefined' && window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
          updatedSubs.forEach((sub) => {
            const docId = sub.id || sub.submissionId;
            if (!docId) return;
            const updatePayload = {
              scoreConfirmed: true,
              scoreConfirmedAt: now,
              confirmedByAdmin: true
            };
            try {
              writeArchivedSource('submissions', docId, updatePayload, { merge: true }, sub)
                .catch(() => {
                  window.firebaseDb.collection('submissions').doc(docId).set(updatePayload, { merge: true }).catch(() => {});
                });
            } catch (e) { /* ignore */ }
          });
        }

        this.logAudit(
          'Xác nhận điểm hàng loạt thay HS',
          `Đã xác nhận điểm thay cho ${updatedSubs.length} học sinh chưa bấm xác nhận.`
        );
      }

      return { success: true, count: updatedSubs.length, confirmedAt: now };
    }

    lookupLocalSubmission(grade, studentClass, studentId) {
      const list = this.getSubmissions();
      const normId = String(studentId || '').replace(/\D/g, '');
      if (!normId) return null;
      // 1. Ưu tiên tìm đúng lớp
      if (studentClass) {
        const exact = list.find(s =>
          Number(s.grade) === Number(grade) &&
          String(s.studentClass || '').trim() === String(studentClass || '').trim() &&
          String(s.studentId || '').replace(/\D/g, '') === normId
        );
        if (exact) return exact;
      }
      // 2. Tìm theo mã LMS trong cùng khối (dành cho trường hợp học sinh chọn nhầm lớp)
      return list.find(s =>
        Number(s.grade) === Number(grade) &&
        String(s.studentId || '').replace(/\D/g, '') === normId
      ) || null;
    }

    exportSubmissionsJSON() {
      return JSON.stringify({ format: 'ahs-submissions-backup', version: 2,
        submissions: this.getSubmissions(), practiceSubmissions: this.getPracticeSubmissions(),
        practiceAttempts: this.getPracticeAttempts() }, null, 2);
    }

    importSubmissionsJSON(jsonString) {
      try {
        const input = JSON.parse(jsonString);
        const legacy = Array.isArray(input);
        if (!legacy && (!input || input.format !== 'ahs-submissions-backup' || input.version !== 2)) throw new Error('Định dạng sao lưu không được hỗ trợ');
        if (legacy && input.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('Danh sách có bài nộp không hợp lệ');
        const exam = legacy ? input.filter(row => row && row.mode !== 'practice') : input.submissions;
        const practice = legacy ? input.filter(row => row && row.mode === 'practice') : input.practiceSubmissions;
        const attempts = legacy ? practice : input.practiceAttempts;
        const isMap = value => value && typeof value === 'object' && !Array.isArray(value);
        const validAnswers = answers => isMap(answers) && ['mcq', 'tf', 'essay'].every(k => isMap(answers[k]))
          && Object.keys(answers).every(k => ['mcq', 'tf', 'essay'].includes(k))
          && Object.values(answers.mcq).every(v => Number.isInteger(v) && v >= 0 && v <= 9)
          && Object.values(answers.tf).every(v => isMap(v) && Object.values(v).every(x => typeof x === 'boolean'))
          && Object.values(answers.essay).every(v => typeof v === 'string');
        const valid = row => row && typeof row === 'object' && typeof row.id === 'string' && row.id.length > 0
          && ['exam', 'practice'].includes(row.mode) && [8, 9, 10].includes(Number(row.grade))
          && typeof row.studentId === 'string' && typeof row.studentClass === 'string' && typeof row.fullName === 'string'
          && (!row.answers || validAnswers(row.answers))
          && (!row.practiceSet || (typeof row.practiceSet === 'object' && !Array.isArray(row.practiceSet)
            && ['mcqQuestions', 'tfQuestions', 'essayQuestions'].every(k => Array.isArray(row.practiceSet[k]) && row.practiceSet[k].length <= (k === 'mcqQuestions' ? 40 : k === 'tfQuestions' ? 10 : 3)
              && row.practiceSet[k].every(q => q && typeof q === 'object' && !Array.isArray(q)
                && (k !== 'mcqQuestions' || (q.id !== undefined && Array.isArray(q.options) && q.options.every(option => typeof option === 'string')))
                && (k !== 'tfQuestions' || (q.num !== undefined && Array.isArray(q.subQuestions) && q.subQuestions.every(sub => sub && typeof sub === 'object')))
                && (k !== 'essayQuestions' || q.num !== undefined)))));
        if (![exam, practice, attempts].every(Array.isArray) || ![...exam, ...practice, ...attempts].every(valid)
          || exam.some(row => row.mode !== 'exam') || [...practice, ...attempts].some(row => row.mode !== 'practice')) throw new Error('Bản sao có bài nộp không hợp lệ; chưa nhập dữ liệu nào');
        let added = 0;
        const merge = (current, incoming) => {
          const map = new Map(current.map(row => [row.id, row]));
          for (const row of incoming) {
            if (!map.has(row.id)) { map.set(row.id, row); added++; }
            else if (!map.get(row.id).answers && row.answers) map.set(row.id, row);
            else {
              const old = map.get(row.id);
              if (!old.practiceSet && row.practiceSet && ['grade', 'studentClass', 'studentId', 'submittedAt'].every(k => String(old[k]) === String(row[k]))
                && JSON.stringify(old.answers) === JSON.stringify(row.answers)) map.set(row.id, { ...old, practiceSet: row.practiceSet });
            }
          }
          return [...map.values()];
        };
        const official = merge(this.getSubmissions(), exam);
        const detailed = merge(this.getPracticeAttempts(), attempts);
        const summaries = this.practiceGradebookRows([...this.getPracticeSubmissions(), ...practice, ...detailed]);
        // Validate and serialize all stores before touching any of them. Roll back on quota failure.
        const changes = [[SUBMISSIONS_KEY, official], [PRACTICE_SUBMISSIONS_KEY, summaries], [PRACTICE_ATTEMPTS_KEY, detailed]].map(([key, rows]) => [key, JSON.stringify(rows)]);
        const previous = changes.map(([key]) => [key, localStorage.getItem(key)]);
        try { for (const [key, value] of changes) localStorage.setItem(key, value); }
        catch (error) {
          for (const [key, value] of previous) { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {} }
          throw error;
        }
        this.notify(this.submissionListeners, official);
        this.notify(this.practiceSubmissionListeners, summaries);
        this.notify(this.practiceAttemptListeners, detailed);
        return { success: true, count: official.length + detailed.length, added };
      } catch (err) { return { success: false, error: err.message }; }
    }

    practiceGradebookRows(rows) {
      const best = new Map();
      for (const row of rows) {
        if (!row || row.mode !== 'practice') continue;
        const key = [Number(row.grade), row.studentClass, String(row.studentId || row.studentCode || '').trim()].join(':');
        const old = best.get(key);
        const score = item => Number(item.finalScore ?? item.score ?? 0);
        if (!old || score(row) > score(old) || (score(row) === score(old)
          && new Date(row.submittedAt || 0).getTime() > new Date(old.submittedAt || 0).getTime())) best.set(key, row);
      }
      return [...best.values()];
    }

    exportSubmissionsCSV() {
      const timingPkg = (typeof window !== 'undefined' && window.AsianSchoolExamTiming) || require('./exam-timing.js');
      const source = this.getSubmissions();
      const list = [...source.filter(row => row.mode !== 'practice'), ...this.practiceGradebookRows([...source, ...this.getPracticeSubmissions(), ...this.getPracticeAttempts()])];
      const hasPractice = list.some(row => row.mode === 'practice');
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
        'Ghi Chú Vi Phạm',
        hasPractice ? 'Tổng Điểm (Theo thang bài làm)' : 'Tổng Điểm (Thang 10)',
        'Trạng Thái Chấm',
        'Lời Phê Của Giáo Viên',
        'Số Lần Vi Phạm',
        'Thời Gian Nộp',
        'Trạng Thái Nộp',
        'Số Giây Trễ',
        ...(hasPractice ? ['Thang Điểm'] : [])
      ];

      const rows = list.map((s, idx) => {
        const autoScore = s.mode === 'practice' ? (s.finalScore ?? s.score ?? '') : (s.mcqPoints !== undefined ? s.mcqPoints : (s.score !== undefined ? s.score : ''));
        const essayScore = s.isGraded ? (s.essayTotal !== undefined ? s.essayTotal : 0) : 'Chưa chấm';
        const finalScore = s.finalScore !== undefined ? s.finalScore : (s.score !== undefined ? s.score : autoScore);
        const gradingStatus = s.isGraded ? 'Đã chấm xong' : (s.mode === 'exam' ? 'Chờ chấm tự luận' : 'Ôn tập');
        const penaltyText = s.violations >= 3 ? 'Bị khóa do vi phạm 3 lần (GV ghi nhận)' : '';
        const timing = timingPkg.getSubmissionTiming(s);
        const timingStatus = s.mode !== 'exam' ? '' : (timing.known ? (timing.isLate ? 'Nộp muộn' : 'Đúng hạn') : 'Chưa đủ dữ liệu');

        return [
          idx + 1,
          `"${(s.studentId || s.studentCode || '').replace(/"/g, '""')}"`,
          `"${(s.fullName || '').replace(/"/g, '""')}"`,
          `"${(s.studentClass || '').replace(/"/g, '""')}"`,
          s.grade || '',
          s.mode === 'exam' ? ((s.examPeriod === 'final' || this.getConfig().examPeriod === 'final') ? 'Thi Cuối HK1' : 'Thi Giữa HK1') : 'Ôn Tập Đề Cương',
          `"${(s.examCode || '').replace(/"/g, '""')}"`,
          `"${(s.durationFormatted || '45 phút').replace(/"/g, '""')}"`,
          autoScore,
          typeof essayScore === 'number' ? essayScore : `"${essayScore}"`,
          `"${penaltyText}"`,
          finalScore,
          `"${gradingStatus}"`,
          `"${(s.teacherFeedback || '').replace(/"/g, '""')}"`,
          s.violations || 0,
          `"${new Date(s.submittedAt || Date.now()).toLocaleString('vi-VN')}"`,
          `"${timingStatus}"`,
          timing.known ? timing.lateSeconds : '',
          ...(hasPractice ? [s.mode === 'practice' ? (s.maxScore ?? (Number(s.grade) === 10 ? 7.75 : 7)) : 10] : [])
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
      if (this.getConfig().driveArchiveProtectDeletes === true && typeof window !== 'undefined' && window.AsianSchoolDriveArchive?.enabled()) {
        return { success: false, error: 'Đang bảo vệ dữ liệu lưu Drive. Cần đối chiếu bản lưu hiện tại trước khi xóa hoặc đặt lại lượt thi.' };
      }
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

      this.safeSetLocal(SUBMISSIONS_KEY, JSON.stringify(toKeep));
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

    // Gửi tới Web App Apps Script và ĐỌC phản hồi { success, error } (Apps Script trả CORS cho yêu cầu text/plain).
    // Trước đây gửi không đọc phản hồi nên mọi yêu cầu đều bị coi là thành công, kể cả khi sai token.
    async postToWebhook(url, payload) {
      if (typeof window !== 'undefined' && ['local-sandbox', 'web-sandbox'].includes(window.AsianSchoolRuntime?.mode)) {
        try {
          const logKey = 'ahs_local_sandbox_webhook_log';
          let entries;
          try { entries = JSON.parse(localStorage.getItem(logKey) || '[]'); } catch { entries = []; }
          if (!Array.isArray(entries)) entries = [];
          const safePayload = { ...payload };
          delete safePayload.token;
          entries.push({ timestamp: new Date().toISOString(), simulated: true, payload: safePayload });
          localStorage.setItem(logKey, JSON.stringify(entries.slice(-50)));
          return { success: true, data: { success: true, simulated: true, spreadsheetName: 'BẢNG TÍNH THỬ MÔ PHỎNG' } };
        } catch {
          return { success: false, error: 'Không lưu được nhật ký đồng bộ thử trên máy. Không có yêu cầu nào được gửi tới Google Sheets.' };
        }
      }
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch (e) { /* không phải JSON */ }
        if (!data) return { success: false, error: `Webhook trả về dữ liệu không đọc được (HTTP ${res.status}). Kiểm tra bản triển khai Web App (quyền "Bất kỳ ai").` };
        if (data.success !== true) return { success: false, error: data.error || 'Webhook từ chối yêu cầu.', data };
        return { success: true, data };
      } catch (err) {
        return { success: false, error: 'Không kết nối được Webhook: ' + (err.message || 'lỗi mạng') };
      }
    }

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

        const res = await this.postToWebhook(url, payload);
        this.logAudit('Kiểm tra Webhook', res.success ? 'Webhook xác nhận kết nối và token hợp lệ' : 'Webhook từ chối: ' + res.error);
        if (!res.success) return { success: false, error: '❌ ' + res.error };
        const name = res.data && res.data.spreadsheetName ? ` (Sheet: ${res.data.spreadsheetName})` : '';
        return {
          success: true,
          message: `✅ Apps Script xác nhận kết nối thành công và token hợp lệ${name}. Kiểm tra kết nối không thêm dòng nào vào Sheet.`
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
          tfPoints: subDoc.tfPoints || 0,
          essayTotal: subDoc.essayTotal || 0,
          finalScore: subDoc.finalScore !== undefined ? subDoc.finalScore : (subDoc.score || 0),
          scoreConfirmed: subDoc.scoreConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận',
          scoreConfirmedAt: subDoc.scoreConfirmedAt || '',
          attemptNumber: subDoc.attemptNumber || 1,
          deviceChanges: subDoc.deviceChanges || 0,
          violations: subDoc.violations || 0,
          durationFormatted: subDoc.durationFormatted || (isPractice ? '30 phút' : '45 phút'),
          submittedAt: subDoc.submittedAt || new Date().toISOString(),
          lateNote: subDoc.overtimeSeconds ? `Nộp muộn +${subDoc.overtimeSeconds}s` : 'Đúng hạn',
          mode: subDoc.mode || 'exam'
        };
        const payload = {
          action: isPractice ? 'sync_practice' : 'sync_exam',
          token: (cfg.googleDriveWebhookToken || '').trim(),
          submission: formattedSub,
          answers: subDoc.answers || null,
          syncedAt: new Date().toISOString()
        };
        const res = await this.postToWebhook(url, payload);
        if (!res.success) console.warn('Google Drive row sync warning:', res.error);
        return res;
      } catch (err) {
        console.warn('Google Drive row sync warning:', err);
        return { success: false, error: err.message };
      }
    }

    // Dòng điểm ôn tập gọn để gửi qua hàng chờ (khớp các trường firestore.rules cho phép ở practice_results)
    toPracticeQueueRow(doc) {
      const N = (typeof window !== 'undefined' && window.AsianSchoolNormalize) || require('./normalize.js');
      const normLms = (v) => N.normalizeLmsCode(v);
      const normName = (v) => N.normalizeStudentName(v);
      const num = (v) => (typeof v === 'number' && isFinite(v) ? v : 0);
      const text = (v, n) => String(v === undefined || v === null ? '' : v).slice(0, n);
      const rawMcq = doc.mcqPoints !== undefined ? Number(doc.mcqPoints) : 0;
      const rawScore = doc.finalScore !== undefined ? Number(doc.finalScore) : Number(doc.score || 0);
      let calculatedMcq = rawMcq > 0 ? rawMcq : rawScore;
      if (calculatedMcq === 0 && Number(doc.correctCount) > 0) {
        const tot = Number(doc.totalQuestions) || (Number(doc.grade) === 10 ? 19 : 28);
        calculatedMcq = Math.round((Number(doc.correctCount) / tot) * 10 * 10) / 10;
      }
      const row = {
        id: text(doc.id, 80),
        mode: 'practice',
        studentId: text(normLms(doc.studentId || doc.studentCode), 30),
        fullName: text(normName(doc.fullName), 80),
        studentClass: text(doc.studentClass, 10),
        grade: num(Number(doc.grade)),
        attemptNumber: num(doc.attemptNumber) || 1,
        score: num(Math.max(rawScore, calculatedMcq)),
        finalScore: num(Math.max(rawScore, calculatedMcq)),
        mcqPoints: num(calculatedMcq),
        tfPoints: num(doc.tfPoints),
        correctCount: num(doc.correctCount),
        totalQuestions: num(doc.totalQuestions),
        violations: num(doc.violations),
        durationSeconds: num(doc.durationSeconds),
        durationFormatted: text(doc.durationFormatted, 40),
        submittedAt: text(doc.submittedAt || new Date().toISOString(), 40)
      };
      if (doc.answers) row.answers = JSON.parse(JSON.stringify(doc.answers));
      if (doc.practiceSet) row.practiceSet = JSON.parse(JSON.stringify(doc.practiceSet));
      if (Number.isFinite(doc.maxScore)) row.maxScore = doc.maxScore;
      if (doc.sessionId) row.sessionId = text(doc.sessionId, 200);
      if (Number.isFinite(doc.startedAtMs)) row.startedAtMs = doc.startedAtMs;
      return row;
    }

    getPracticePending() {
      try { const rows = JSON.parse(localStorage.getItem(PRACTICE_PENDING_KEY) || '[]'); return Array.isArray(rows) ? rows : []; } catch { return []; }
    }

    queuePracticeResult(doc) {
      const uid = typeof window !== 'undefined' && window.AsianSchoolAuth?.uid ? window.AsianSchoolAuth.uid() : null;
      const row = { ...this.toPracticeQueueRow(doc), ...(uid ? { uid } : {}) };
      const pending = this.getPracticePending();
      if (!pending.some(item => item.id === row.id)) {
        pending.push(row);
        localStorage.setItem(PRACTICE_PENDING_KEY, JSON.stringify(pending));
      }
      this.flushPracticePending();
      return true;
    }

    flushPracticePending() {
      if (this._practicePendingFlush) return this._practicePendingFlush;
      this._practicePendingFlush = this._flushPracticePending().finally(() => { this._practicePendingFlush = null; });
      return this._practicePendingFlush;
    }

    async _flushPracticePending() {
      const uid = typeof window !== 'undefined' && window.AsianSchoolAuth?.uid ? window.AsianSchoolAuth.uid() : null;
      if (!uid || !window.firebaseDb) return { success: false, pending: this.getPracticePending().length };
      let error = null;
      const visited = new Set();
      let saved;
      while ((saved = this.getPracticePending().find(row => !visited.has(row.id) && (!row.uid || row.uid === uid)))) {
        visited.add(saved.id);
        const row = { ...saved, uid };
        try {
          await writeArchivedSource('practice_results', row.id, row);
          localStorage.setItem(PRACTICE_PENDING_KEY, JSON.stringify(this.getPracticePending().filter(item => item.id !== row.id)));
        } catch (err) {
          // A previous create may already have reached Firestore before this browser closed.
          // Only acknowledge an existing document when it is exactly this owner's saved payload.
          let acknowledged = false;
          if (err.code === 'permission-denied') {
            try {
              const snap = await window.firebaseDb.collection('practice_results').doc(row.id).get({ source: 'server' });
              const current = snap.exists ? snap.data() : null;
              const stable = value => JSON.stringify(value, (key, val) => val && typeof val === 'object' && !Array.isArray(val) ? Object.fromEntries(Object.keys(val).sort().map(k => [k, val[k]])) : val);
              acknowledged = !!current && stable(current) === stable(row);
            } catch {}
          }
          if (acknowledged) localStorage.setItem(PRACTICE_PENDING_KEY, JSON.stringify(this.getPracticePending().filter(item => item.id !== row.id)));
          else error = err.message || 'Chưa nhận được xác nhận lưu trên máy chủ';
        }
      }
      return { success: !error && !this.getPracticePending().some(row => !row.uid || row.uid === uid), pending: this.getPracticePending().length, error };
    }

    // Chỉ lưu ID và cờ xử lý; mọi nguồn còn trong snapshot được giữ bất kể số lượng.
    // Ngoài snapshot, giữ tối đa 2.000 ID gần nhất để nhận diện callback cũ mà không tăng bộ nhớ vô hạn.
    readPracticeQueueLedger() {
      try {
        const entries = JSON.parse(localStorage.getItem(PRACTICE_QUEUE_LEDGER_KEY) || '[]');
        return new Map(Array.isArray(entries) ? entries.filter(entry => Array.isArray(entry)
          && typeof entry[0] === 'string' && entry[0].length > 0 && entry[0].length <= 250
          && typeof entry[1] === 'boolean' && typeof entry[2] === 'boolean' && Number.isFinite(entry[3]))
          .map(([id, merged, webhook, at]) => [id, { merged, webhook, at }]) : []);
      } catch { return new Map(); }
    }

    savePracticeQueueLedger(ledger, activeIds) {
      const pinned = [], recent = [];
      for (const [id, state] of ledger) (activeIds.has(id) ? pinned : recent).push([id, state.merged, state.webhook, state.at]);
      recent.sort((a, b) => b[3] - a[3]);
      localStorage.setItem(PRACTICE_QUEUE_LEDGER_KEY, JSON.stringify([...pinned, ...recent.slice(0, 2000)]));
    }

    // Trang quản trị: nhận điểm ôn tập từ hàng chờ, lưu vào bảng điểm ôn tập, đẩy lên Google Sheets, rồi xóa khỏi hàng chờ.
    // Chưa cấu hình webhook thì giữ nguyên hàng chờ để đẩy sau. Trả về số dòng đã đẩy.
    async processPracticeQueue(rows, deleteRow) {
      const cfg = this.getConfig();
      const hasWebhook = (cfg.googleDriveWebhookUrl || '').trim().startsWith('http');
      this._practiceQueueSeen = this._practiceQueueSeen || new Set();
      this._practiceQueueInFlight = this._practiceQueueInFlight || new Set();
      this._practiceQueueRemoved = this._practiceQueueRemoved || new Set();
      const known = new Set(this.getPracticeSubmissions().flatMap(s => [s.id, s._queueId, s.submittedAt]).filter(Boolean));
      this._practiceQueueLedger = this._practiceQueueLedger || this.readPracticeQueueLedger();
      const ledger = this._practiceQueueLedger;
      this._practiceQueueActiveIds = new Set((rows || []).filter(row => row && row.id).map(row => row.id));
      let pushed = 0;
      for (const row of rows || []) {
        if (!row || !row.id || this._practiceQueueRemoved.has(row.id)) continue;
        this.savePracticeAttempt({ ...row, mode: 'practice' });
        const processed = ledger.get(row.id) || { merged: false, webhook: false, at: Date.now() };
        if (!processed.merged) {
          if (!known.has(row.id)) {
            this.savePracticeSubmission({ ...row, isPracticeOnly: true, isGraded: true, penaltyPoints: 0 });
            known.add(row.id);
            if (row.submittedAt) known.add(row.submittedAt);
          }
          // Ghi dấu chỉ sau khi bảng điểm cục bộ đã lưu thành công.
          processed.merged = true;
          processed.at = Date.now();
          ledger.set(row.id, processed);
          this.savePracticeQueueLedger(ledger, this._practiceQueueActiveIds);
        }
        if (!hasWebhook) continue;
        if (this._practiceQueueInFlight.has(row.id)) continue;
        const alreadyPushed = processed.webhook || this._practiceQueueSeen.has(row.id);
        this._practiceQueueInFlight.add(row.id);
        let res;
        try { res = alreadyPushed ? { success: true } : await this.syncRowToGoogleDrive(row); }
        finally { this._practiceQueueInFlight.delete(row.id); }
        if (res && res.success) {
          this._practiceQueueSeen.add(row.id);
          if (!processed.webhook) {
            processed.webhook = true;
            processed.at = Date.now();
            ledger.set(row.id, processed);
            this.savePracticeQueueLedger(ledger, this._practiceQueueActiveIds);
          }
          if (!alreadyPushed) pushed++;
          if (typeof deleteRow === 'function') {
            const archive = typeof window !== 'undefined' ? window.AsianSchoolDriveArchive : null;
            // Detailed attempts are permanent sources until an explicit, current archive receipt exists.
            let archived = !row.answers && (!archive?.enabled() || cfg.driveArchiveEnabled !== true);
            if (archive?.enabled() && cfg.driveArchiveEnabled === true) {
              try {
                const receipt = await window.firebaseDb.collection('drive_archive_jobs').doc('practice_results_' + row.id).get();
                const job = receipt.exists ? receipt.data() : null;
                archived = !!job && job.pending === false && job.archivedRevision === job.revision;
              } catch { archived = false; }
            }
            if (archived) {
              try { await Promise.resolve(deleteRow(row.id)); this._practiceQueueRemoved.add(row.id); } catch { /* retry later */ }
            }
          }
        } else {
          this._practiceQueueSeen.delete(row.id);
        }
      }
      this.savePracticeQueueLedger(ledger, this._practiceQueueActiveIds);
      return pushed;
    }

    async syncAllToGoogleDrive() {
      const cfg = this.getConfig();
      const url = (cfg.googleDriveWebhookUrl || '').trim();
      if (!url || !url.startsWith('http')) {
        return { success: false, error: 'Chưa cấu hình URL Webhook của Google Drive / Apps Script!' };
      }

      const all = this.getSubmissions();
      const examSubs = all.filter(s => s.mode === 'exam');
      const practiceSubs = this.getPracticeSubmissions().map(p => {
        let attempts = Number(p.attemptNumber) || Number(p.totalAttempts) || 1;
        if (attempts > 20) attempts = 1;
        const rawMcq = p.mcqPoints !== undefined ? Number(p.mcqPoints) : 0;
        const rawScore = p.finalScore !== undefined ? Number(p.finalScore) : Number(p.score || 0);
        let mcq = rawMcq > 0 ? rawMcq : rawScore;
        if (mcq === 0 && Number(p.correctCount) > 0) {
          const tot = Number(p.totalQuestions) || (Number(p.grade) === 10 ? 19 : 28);
          mcq = Math.round((Number(p.correctCount) / tot) * 10 * 10) / 10;
        }
        return {
          ...p,
          attemptNumber: attempts,
          totalAttempts: attempts,
          mcqPoints: mcq,
          finalScore: mcq,
          score: mcq
        };
      });

      try {
        const payload = {
          action: 'sync_all',
          token: (cfg.googleDriveWebhookToken || '').trim(),
          examCount: examSubs.length,
          submissions: examSubs,
          practiceSubmissions: practiceSubs,
          jsonContent: JSON.stringify(all, null, 2),
          csvContent: this.exportSubmissionsCSV(),
          timestamp: new Date().toISOString()
        };

        const res = await this.postToWebhook(url, payload);
        if (!res.success) return { success: false, error: res.error };
        this.logAudit('Đồng bộ Google Drive', `Đã đồng bộ toàn bộ 5 tab và sao lưu ${examSubs.length} bài thi lên Google Drive (${(res.data && res.data.file) || 'tệp JSON'})`);
        return { success: true, count: examSubs.length, practiceCount: practiceSubs.length };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // --- QUẢN LÝ PHIÊN TRỰC TIẾP (LIVE SESSIONS) ---

    getLiveSessions() {
      try {
        const raw = JSON.parse(this.safeGetLocal(LIVE_KEY) || '[]');
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
      const merged = { ...(idx >= 0 ? list[idx] : {}), ...sessionData, lastPing: Date.now() };
      const updated = Object.fromEntries(LIVE_FIELDS.filter(key => merged[key] !== undefined)
        .map(key => [key, merged[key]]));
      // Phiên cũ có thể còn điểm phạt từ bản trước; chính sách hiện tại không trừ điểm.
      updated.penaltyPoints = 0;
      // Gắn uid người tạo phiên (học sinh đăng nhập ẩn danh) để firestore.rules kiểm tra quyền sở hữu
      const authUid = typeof window !== 'undefined' && window.AsianSchoolAuth ? window.AsianSchoolAuth.uid() : null;
      if (!updated.uid && authUid) updated.uid = authUid;
      if (idx >= 0) {
        list[idx] = updated;
      } else {
        list.unshift(updated);
      }
      this.safeSetLocal(LIVE_KEY, JSON.stringify(list));
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
      this.safeSetLocal(LIVE_KEY, JSON.stringify(list));
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
      this.safeSetLocal(LIVE_KEY, JSON.stringify(list));
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
      this.safeSetLocal(LIVE_KEY, JSON.stringify(list));
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
        return JSON.parse(this.safeGetLocal(PROCTOR_CMD_KEY) || '[]');
      } catch {
        return [];
      }
    }

    sendProctorCommand(targetSessionId, command, payload = {}) {
      const list = this.getProctorCommandsRaw();
      // uid của học sinh nhận lệnh (firestore.rules chỉ cho học sinh đọc lệnh có targetUid là mình hoặc 'all')
      const target = targetSessionId === 'all' ? null : this.getLiveSessions().find(x => x.sessionId === targetSessionId);
      const cmdObj = {
        cmdId: 'cmd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        grade: target ? Number(target.grade) : 0,
        studentClass: target?.studentClass || 'all',
        targetSessionId, // 'all' hoặc sessionId cụ thể
        targetUid: targetSessionId === 'all' ? 'all' : ((target && target.uid) || (command === 'unlock_session' ? 'all' : 'khong_ro')),
        command, // 'extend_time' | 'force_submit' | 'unlock_session' | 'broadcast_message'
        payload,
        createdAt: Date.now(),
        consumedBy: []
      };
      list.push(cmdObj);
      // Giữ lại 50 lệnh gần nhất
      const trimmed = list.slice(-50);
      this.safeSetLocal(PROCTOR_CMD_KEY, JSON.stringify(trimmed));
      this.notify(this.cmdListeners, trimmed);

      if (typeof window !== 'undefined' && window.firebaseDb) {
        try {
          if (typeof window.firebaseDb.collection === 'function') {
            writeArchivedSource('proctor_commands', cmdObj.cmdId, cmdObj)
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
        this.safeSetLocal(PROCTOR_CMD_KEY, JSON.stringify(list));
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
