const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('xóa bài nộp hoặc xóa trắng CSDL phải xóa sạch lượt thi trong exam_attempts', async () => {
  const storageCode = fs.readFileSync(path.join(__dirname, '../src/core/storage-service.js'), 'utf8');

  const store = {};
  const mockLocalStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };

  const firestoreStore = new Map();
  const deletedDocs = [];

  const mockDb = {
    collection(colName) {
      return {
        doc(id) {
          const docPath = `${colName}/${id}`;
          return {
            path: docPath,
            async delete() {
              deletedDocs.push(docPath);
              firestoreStore.delete(docPath);
            },
            async get() {
              const exists = firestoreStore.has(docPath);
              return {
                exists,
                data: () => firestoreStore.get(docPath)
              };
            }
          };
        },
        async get() {
          const docs = [];
          for (const [p, val] of firestoreStore.entries()) {
            if (p.startsWith(`${colName}/`)) {
              docs.push({
                ref: {
                  path: p,
                  async delete() {
                    deletedDocs.push(p);
                    firestoreStore.delete(p);
                  }
                },
                data: () => val
              });
            }
          }
          return {
            empty: docs.length === 0,
            docs
          };
        }
      };
    },
    batch() {
      const batchDeletes = [];
      return {
        delete(ref) {
          batchDeletes.push(ref);
        },
        async commit() {
          for (const r of batchDeletes) {
            await r.delete();
          }
        }
      };
    }
  };

  const fakeWindow = {
    localStorage: mockLocalStorage,
    firebaseDb: mockDb,
    addEventListener: () => {}
  };

  const fn = new Function('window', 'localStorage', `${storageCode}; return window.AsianSchoolStorage;`);
  const storage = fn(fakeWindow, mockLocalStorage);

  assert.ok(storage, 'AsianSchoolStorage khởi tạo thành công');

  // Chuẩn bị dữ liệu bài nộp và lượt thi của học sinh test mã 111 lớp 8/19
  const testSub = {
    id: 'g8_8_19_111_1',
    attemptId: 'g8_8_19_111',
    studentId: '111',
    studentClass: '8/19',
    grade: 8,
    fullName: 'Học Sinh Thử Nghiệm',
    mode: 'exam',
    examCode: '101',
    attemptNumber: 1
  };

  mockLocalStorage.setItem('asian_school_submissions_v1', JSON.stringify([testSub]));
  firestoreStore.set('submissions/g8_8_19_111_1', testSub);
  firestoreStore.set('exam_attempts/g8_8_19_111', {
    studentId: '111',
    studentClass: '8/19',
    grade: 8,
    attemptsUsed: 1,
    submitted: true
  });
  firestoreStore.set('exam_attempts/g8_111', {
    studentId: '111',
    studentClass: '8/19',
    grade: 8,
    attemptsUsed: 1,
    submitted: true
  });

  // 1. Kiểm tra deleteSubmission: khi giáo viên xóa bài nộp, lượt thi exam_attempts phải được xóa theo
  await storage.deleteSubmission('g8_8_19_111_1');

  assert.ok(!firestoreStore.has('submissions/g8_8_19_111_1'), 'Bài nộp trên Firestore phải bị xóa');
  assert.ok(!firestoreStore.has('exam_attempts/g8_8_19_111'), 'Lượt thi scoped trong exam_attempts phải bị xóa');
  assert.ok(!firestoreStore.has('exam_attempts/g8_111'), 'Lượt thi legacy trong exam_attempts phải bị xóa');

  // 2. Kiểm tra resetExamAttempt trực tiếp
  firestoreStore.set('exam_attempts/g9_9_1_222', {
    studentId: '222',
    studentClass: '9/1',
    grade: 9,
    attemptsUsed: 1,
    submitted: true
  });

  const resetRes = await storage.resetExamAttempt({
    grade: 9,
    studentClass: '9/1',
    studentId: '222'
  });
  assert.equal(resetRes.success, true);
  assert.ok(!firestoreStore.has('exam_attempts/g9_9_1_222'), 'Lượt thi 222 phải được xóa sau khi reset');

  // 3. Kiểm tra clearAllData: xóa trắng toàn bộ bài thi, lượt thi, phiên thi
  firestoreStore.set('submissions/sub1', { id: 'sub1' });
  firestoreStore.set('live_sessions/live1', { id: 'live1' });
  firestoreStore.set('exam_attempts/att1', { id: 'att1' });
  firestoreStore.set('exam_sessions/sess1', { id: 'sess1' });
  firestoreStore.set('exam_keys/key1', { id: 'key1' });

  await storage.clearAllData();

  assert.ok(!firestoreStore.has('submissions/sub1'), 'submissions phải bị xóa trắng');
  assert.ok(!firestoreStore.has('live_sessions/live1'), 'live_sessions phải bị xóa trắng');
  assert.ok(!firestoreStore.has('exam_attempts/att1'), 'exam_attempts phải bị xóa trắng');
  assert.ok(!firestoreStore.has('exam_sessions/sess1'), 'exam_sessions phải bị xóa trắng');
  assert.ok(!firestoreStore.has('exam_keys/key1'), 'exam_keys phải bị xóa trắng');
});
