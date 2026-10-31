const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const NOW = Date.parse('2026-10-29T08:00:00.000Z');
const DAY = 86400000;
function setup(ageDays, config = {}) {
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [NOW])); } static now() { return NOW; } }
  const data = new Map([['asian_school_submissions_v1', JSON.stringify([
    { id: 'fake-exam', mode: 'exam', submittedAt: new Date(NOW - ageDays * DAY).toISOString() },
    { id: 'fake-practice', mode: 'practice', submittedAt: new Date(NOW - 100 * DAY).toISOString() }
  ])], ['asian_school_exam_config_v1', JSON.stringify(config)]]);
  const writes = [];
  const context = { console, Date: FixedDate, module: { exports: {} }, localStorage: {
    getItem: k => data.get(k) || null, setItem: (k,v) => { writes.push(k); data.set(k,v); }
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/storage-service.js'), 'utf8'), context);
  return { storage: context.module.exports, data, writes };
}
test('retention mặc định 21 ngày; chưa cảnh báo trước đủ 14 ngày', () => {
  const { storage } = setup(13.99);
  const summary = storage.getExamRetentionSummary();
  assert.equal(summary.retentionDays, 21);
  assert.equal(summary.daysActive, 13);
  assert.equal(summary.totalCount, 1, 'Chỉ bài thi chính thức được tính');
  assert.equal(summary.isNearExpiry, false);
  assert.equal(summary.isExpired, false);
});
test('retention cảnh báo từ đủ 14 ngày, hết hạn từ đủ 21 ngày', () => {
  for (const [days, near, expired] of [[14, true, false], [20, true, false], [21, true, true], [22, true, true]]) {
    const summary = setup(days).storage.getExamRetentionSummary();
    assert.equal(summary.isNearExpiry, near, `warning day ${days}`);
    assert.equal(summary.isExpired, expired, `expiry day ${days}`);
  }
});
test('xem cảnh báo retention không tự xóa hay sửa bài kể cả đã hết hạn', () => {
  const { storage, data, writes } = setup(30);
  const before = JSON.stringify([...data]);
  storage.getExamRetentionSummary();
  storage.getExamRetentionSummary();
  assert.equal(JSON.stringify([...data]), before);
  assert.deepEqual(writes, []);
});
test('summary tôn trọng retentionDays giáo viên đã cấu hình', () => {
  const summary = setup(24, { retentionDays: 28 }).storage.getExamRetentionSummary();
  assert.equal(summary.retentionDays, 28);
  assert.equal(summary.isExpired, false);
});
test('điểm bài thi hiện làm tròn hai chữ số và không tự trừ vi phạm', () => {
  const { storage } = setup(0);
  const sub = storage.saveSubmission({ mode: 'exam', mcqPoints: 1.236, violations: 3 });
  assert.equal(sub.finalScore, 1.24);
  assert.equal(sub.penaltyPoints, 0);
});
