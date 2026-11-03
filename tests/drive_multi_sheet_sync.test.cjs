const { test } = require('node:test');
const assert = require('node:assert/strict');

const storageData = new Map();
global.localStorage = {
  getItem: k => storageData.get(k) || null,
  setItem: (k, v) => storageData.set(k, String(v)),
  removeItem: k => storageData.delete(k)
};

const storage = require('../src/core/storage-service.js');

test('confirmScore cập nhật scoreConfirmed và thời điểm xác nhận vào bài nộp', () => {
  const fakeSub = {
    id: 'sub-test-confirm-1',
    mode: 'exam',
    grade: 8,
    studentClass: '8/19',
    studentId: '111',
    fullName: 'Trần Gia Huy',
    score: 6.5,
    mcqPoints: 6.5,
    finalScore: 6.5,
    violations: 0
  };

  storage.saveSubmission(fakeSub);

  const res = storage.confirmScore('sub-test-confirm-1');
  assert.equal(res.success, true);
  assert.ok(res.confirmedAt);

  const updated = storage.getSubmissionById('sub-test-confirm-1');
  assert.equal(updated.scoreConfirmed, true);
  assert.equal(updated.scoreConfirmedAt, res.confirmedAt);
});

test('syncRowToGoogleDrive định tuyến sync_practice khi ôn tập và sync_exam khi thi chính thức', async () => {
  let capturedPayload = null;
  storage.saveConfig({
    googleDriveWebhookUrl: 'https://script.google.com/macros/s/test/exec',
    googleDriveWebhookToken: 'SECRET123'
  });

  // Mock postToWebhook
  storage.postToWebhook = async (url, payload) => {
    capturedPayload = { url, payload };
    return { success: true, data: { status: 'ok' } };
  };

  // 1. Ôn tập
  const practiceDoc = {
    mode: 'practice',
    grade: 8,
    studentClass: '8/19',
    studentId: '111',
    fullName: 'Em Ôn Tập',
    score: 7.0,
    mcqPoints: 7.0,
    attemptNumber: 2
  };
  await storage.syncRowToGoogleDrive(practiceDoc);
  assert.equal(capturedPayload.payload.action, 'sync_practice');
  assert.equal(capturedPayload.payload.submission.studentId, '111');

  // 2. Thi chính thức
  const examDoc = {
    mode: 'exam',
    grade: 8,
    studentClass: '8/19',
    studentId: '111',
    fullName: 'Em Đi Thi',
    score: 6.5,
    mcqPoints: 6.5,
    scoreConfirmed: true,
    scoreConfirmedAt: '2026-11-03T09:00:00Z',
    examCode: '101'
  };
  await storage.syncRowToGoogleDrive(examDoc);
  assert.equal(capturedPayload.payload.action, 'sync_exam');
  assert.equal(capturedPayload.payload.submission.scoreConfirmed, 'Đã xác nhận');
  assert.equal(capturedPayload.payload.submission.scoreConfirmedAt, '2026-11-03T09:00:00Z');
});

test('syncAllToGoogleDrive gửi payload sync_all kèm cả bài thi chính thức và bài ôn tập cho 5 sheet', async () => {
  let capturedAllPayload = null;
  storage.postToWebhook = async (url, payload) => {
    capturedAllPayload = payload;
    return { success: true, data: { file: 'Backup_AHS.json' } };
  };

  const res = await storage.syncAllToGoogleDrive();
  assert.equal(res.success, true);
  assert.equal(capturedAllPayload.action, 'sync_all');
  assert.ok(Array.isArray(capturedAllPayload.submissions));
  assert.ok(Array.isArray(capturedAllPayload.practiceSubmissions));
  assert.ok(capturedAllPayload.jsonContent);
  assert.ok(capturedAllPayload.csvContent);
});
