const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function createFirebaseHarness(existingDocs = {}) {
  const store = new Map(Object.entries(existingDocs));
  const setWrites = [];
  const updateWrites = [];

  const db = {
    enablePersistence: () => Promise.resolve(),
    collection(name) {
      return {
        doc(id) {
          const docPath = `${name}/${id}`;
          return {
            path: docPath,
            async get(options) {
              const data = store.get(docPath);
              return {
                exists: !!data,
                data: () => name === 'exam_keys' ? {...data,at:{toMillis:()=>Date.now()}} : name === 'exam_attempts' && data?.startedAt === 'SERVER_TIME' ? {...data,startedAt:{toMillis:()=>Date.now()}} : data,
                metadata: { fromCache: false, hasPendingWrites: false }
              };
            },
            async set(data) {
              setWrites.push({ path: docPath, data });
              store.set(docPath, { ...data });
            },
            async update(data) {
              updateWrites.push({ path: docPath, data });
              const current = store.get(docPath) || {};
              store.set(docPath, { ...current, ...data });
            },
            onSnapshot(options, cb) {
              const handler = typeof options === 'function' ? options : cb;
              const data = store.get(docPath);
              handler({ exists: !!data, data: () => name === 'exam_keys' ? {...data,at:{toMillis:()=>Date.now()}} : name === 'exam_attempts' && data?.startedAt === 'SERVER_TIME' ? {...data,startedAt:{toMillis:()=>Date.now()}} : data, metadata: { hasPendingWrites: false, fromCache: false } });
              return () => {};
            }
          };
        },
        where(field, op, val) {
          return {
            where(f2, op2, v2) {
              return {
                async get() {
                  const matches = [];
                  for (const [p, docData] of store.entries()) {
                    if (p.startsWith(`${name}/`) && docData[field] === val && docData[f2] === v2) {
                      matches.push({ ref: { path: p }, data: () => docData });
                    }
                  }
                  return { empty: matches.length === 0, docs: matches };
                }
              };
            }
          };
        }
      };
    },
    batch() {
      const batchOps = [];
      return {
        update(ref, data) { batchOps.push({ type: 'update', ref, data }); },
        set(ref, data) { batchOps.push({ type: 'set', ref, data }); },
        async commit() {
          for (const op of batchOps) {
            if (op.type === 'update') await op.ref.update(op.data);
            if (op.type === 'set') await op.ref.set(op.data);
          }
        }
      };
    },
    async runTransaction(fn) {
      const tx = {
        async get(ref) { return ref.get({ source: 'server' }); },
        update(ref, data) { return ref.update(data); }
      };
      return fn(tx);
    }
  };

  const firestore = Object.assign(() => db, {
    FieldValue: {
      serverTimestamp: () => 'SERVER_TIME',
      increment: n => n,
      delete: () => 'DELETE_FIELD'
    }
  });

  const auth = {
    currentUser: { uid: 'user-8-20' },
    onAuthStateChanged() {}
  };

  const window = {
    location: { pathname: '/test/' },
    dispatchEvent() {},
    AsianSchoolNormalize: {
      normalizeLmsCode: v => String(v || '').replace(/\D/g, '').slice(0, 30),
      normalizeStudentName: v => String(v || '').trim()
    }
  };

  const context = {
    window,
    document: { readyState: 'loading', addEventListener() {} },
    CustomEvent: class {},
    console: { log() {}, warn() {} },
    firebase: { apps: [{}], app: () => ({}), firestore, auth: () => auth },
    setTimeout: (fn, ms) => { const t = setTimeout(fn, ms); t.unref(); return t; },
    clearTimeout
  };

  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/firebase-config.js'), 'utf8'), context);
  return { cloud: window.AsianSchoolCloud, store, setWrites, updateWrites, db };
}

test('mã LMS 111 của lớp 8/20 có lượt thi riêng biệt không bị xung đột với lớp 8/19', async () => {
  // Lớp 8/19 đã có học sinh 111 nộp bài và hết 1/1 lượt
  const existingDocs = {
    'exam_config/global_config': {
      classAccessControl: { '8/19': 'practice_only', '8/20': 'exam_only' },
      defaultClassMode: 'practice_only',
      activeCodes: { 8: ['101', '102'] },
      classMapping: { '8/19': '101', '8/20': '101' },
      examDurationMinutes: 45,
      maxExamAttempts: 1
    },
    'exam_public/g8_101': {
      exam: { code: '101', title: 'Đề kiểm tra HK1 Khối 8' }
    },
    // Lượt cũ của học sinh 111 ở lớp 8/19 lưu theo cấu trúc cũ g8_111
    'exam_attempts/g8_111': {
      grade: 8,
      studentClass: '8/19',
      studentId: '111',
      fullName: 'Học Sinh Lớp 19',
      uid: 'user-8-19',
      examCode: '101',
      attemptsUsed: 1,
      allowedAttempts: 1,
      submitted: true,
      locked: false,
      violations: 0,
      durationMinutes: 45,
      extraTimeSeconds: 0
    }
  };

  const harness = createFirebaseHarness(existingDocs);

  // Học sinh 111 ở lớp 8/20 bắt đầu vào phòng thi
  const startResult = await harness.cloud.startExam({
    grade: 8,
    studentClass: '8/20',
    studentId: '111',
    fullName: 'Học Sinh Lớp 20',
    password: 'fake-password',
    examCode: '101'
  });

  // 1. Phải vào phòng thi thành công
  assert.equal(startResult.examCode, '101');
  assert.equal(startResult.locked, false);
  assert.ok(startResult.exam);

  // 2. Lượt thi được lưu theo định danh mới gắn với lớp: exam_attempts/g8_8_20_111
  const attempt820 = harness.store.get('exam_attempts/g8_8_20_111');
  assert.ok(attempt820, 'Lượt thi mới g8_8_20_111 phải được tạo trong store');
  assert.equal(attempt820.studentClass, '8/20');
  assert.equal(attempt820.studentId, '111');
  assert.equal(attempt820.attemptsUsed, 1);
  assert.equal(attempt820.submitted, false);

  // 3. Lượt cũ của lớp 8/19 (g8_111) vẫn được giữ nguyên, không bị ghi đè
  const attempt819 = harness.store.get('exam_attempts/g8_111');
  assert.equal(attempt819.studentClass, '8/19');
  assert.equal(attempt819.submitted, true);

  // 4. Khi học sinh lớp 8/20 nộp bài, bài nộp gắn đúng ID g8_8_20_111_1
  const submitResult = await harness.cloud.submitExam({
    grade: 8,
    studentClass: '8/20',
    studentId: '111',
    sessionId: 'session-8-20',
    answers: { mcq: { 1: 2 }, tf: {}, essay: {} },
    violations: 0
  });
  assert.equal(submitResult.submissionId, 'g8_8_20_111_1');
  assert.equal(harness.store.get('submissions/g8_8_20_111_1')?.studentClass, '8/20');
});

test('học sinh cũ vào lại đúng lớp vẫn phục hồi được lượt thi theo cấu trúc legacy', async () => {
  const existingDocs = {
    'exam_config/global_config': {
      classAccessControl: { '8/19': 'both_open' },
      defaultClassMode: 'practice_only',
      activeCodes: { 8: ['101'] },
      classMapping: { '8/19': '101' },
      examDurationMinutes: 45
    },
    'exam_public/g8_101': {
      exam: { code: '101' }
    },
    // Lượt đang làm dở của học sinh 222 ở lớp 8/19
    'exam_attempts/g8_222': {
      grade: 8,
      studentClass: '8/19',
      studentId: '222',
      fullName: 'Học Sinh Đang Làm Dở',
      uid: 'user-8-222',
      examCode: '101',
      attemptsUsed: 1,
      submitted: false,
      locked: false,
      startedAt: { seconds: 1700000000 },
      durationMinutes: 45,
      extraTimeSeconds: 120
    }
  };

  const harness = createFirebaseHarness(existingDocs);
  // Cùng học sinh 222 lớp 8/19 tải lại trang / vào lại
  const resume = await harness.cloud.startExam({
    grade: 8,
    studentClass: '8/19',
    studentId: '222',
    fullName: 'Học Sinh Đang Làm Dở',
    password: 'fake-password'
  });

  assert.equal(resume.attemptId, 'g8_222');
  assert.equal(resume.extraTimeSeconds, 120);
});
