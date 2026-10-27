/**
 * storage-service.js
 * Quản lý lưu trữ dữ liệu bài thi, phiên trực tiếp, lệnh giám thị và cấu hình hệ thống
 * Hỗ trợ LocalStorage (offline/cục bộ) và Firebase Firestore (đồng bộ đám mây)
 */

(function () {
  const SUBMISSIONS_KEY = 'asian_school_submissions_v1';
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
    allowPracticeReview: true,
    allowExamReview: false, // Trong lúc thi không hiện đáp án ngay
    examPassword: 'asian2026', // Mật khẩu phòng thi chính thức
    adminPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin' sha256
    
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
      this.liveListeners = [];
      this.configListeners = [];
      this.cmdListeners = [];

      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key === SUBMISSIONS_KEY) this.notify(this.submissionListeners, this.getSubmissions());
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
            window.firebaseDb.collection('exam_config').doc('global_config').set(merged, { merge: true })
              .catch(e => console.warn('Firestore config save err', e));
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
      const expected = (cfg.examPassword || 'asian2026').trim().toLowerCase();
      return (inputPassword || '').trim().toLowerCase() === expected;
    }

    setExamPassword(newPassword) {
      const res = this.saveConfig({ examPassword: (newPassword || 'asian2026').trim() });
      this.logAudit('Đổi mật khẩu phòng thi', `Mật khẩu mới: ${(newPassword || 'asian2026').trim()}`);
      return res;
    }

    setAdminPasswordHash(newHash) {
      const res = this.saveConfig({ adminPasswordHash: newHash });
      this.logAudit('Đổi mật khẩu quản trị Admin', 'Đã băm SHA-256 mật khẩu quản trị viên mới');
      return res;
    }

    // --- QUẢN LÝ BÀI NỘP & CHẤM ĐIỂM TỰ LUẬN ---

    getSubmissions() {
      try {
        return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
      } catch {
        return [];
      }
    }

    saveSubmission(subData) {
      const list = this.getSubmissions();
      const rawScore = subData.finalScore !== undefined ? subData.finalScore : (subData.score !== undefined ? subData.score : subData.mcqPoints);
      const penalty = subData.penaltyPoints !== undefined ? subData.penaltyPoints : (subData.violations >= 3 ? 5 : 0);
      let calculatedFinal = typeof rawScore === 'number' ? Math.max(0, Math.round((rawScore - penalty) * 100) / 100) : rawScore;

      const newDoc = {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        ...subData,
        durationSeconds: subData.durationSeconds || 0,
        durationFormatted: subData.durationFormatted || (subData.durationTaken ? subData.durationTaken : '45 phút'),
        penaltyPoints: penalty,
        submittedAt: new Date().toISOString(),
        isGraded: subData.isGraded || false,
        essayScores: subData.essayScores || {},
        essayTotal: subData.essayTotal || 0,
        finalScore: calculatedFinal,
        teacherFeedback: subData.teacherFeedback || ''
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
      const list = this.getLiveSessions();
      const idx = list.findIndex(s => s.sessionId === sessionData.sessionId);
      const updated = {
        ...(idx >= 0 ? list[idx] : {}),
        ...sessionData,
        lastPing: Date.now()
      };
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
