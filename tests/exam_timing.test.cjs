const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getSubmissionTiming } = require('../src/core/exam-timing.js');
const start = 1793260800000;
const stamp = ms => ({ seconds: Math.floor(ms / 1000), nanoseconds: (ms % 1000) * 1e6 });
const record = (end, patch = {}) => ({ mode: 'exam', startedAt: stamp(start), serverSubmittedAt: stamp(end), durationMinutes: 45, extraTimeSeconds: 0, ...patch });
const end = start + 45 * 60000;
test('nộp đúng hạn và đúng mốc deadline không bị đánh dấu muộn', () => {
  for (const value of [end - 1, end]) {
    const result = getSubmissionTiming(record(value));
    assert.equal(result.known, true); assert.equal(result.isLate, false); assert.equal(result.lateSeconds, 0);
    assert.equal(result.deadlineMs, end);
  }
});
test('nộp muộn được đánh dấu và làm tròn số giây trễ lên, không dùng giờ máy học sinh', () => {
  const result = getSubmissionTiming(record(end + 1250, { submittedAt: '2000-01-01T00:00:00Z', durationSeconds: 1 }));
  assert.equal(result.isLate, true); assert.equal(result.lateSeconds, 2);
  assert.equal(getSubmissionTiming(record(end - 1000, { submittedAt: '2099-01-01T00:00:00Z', durationSeconds: 999999 })).isLate, false);
});
test('deadline tính cả thời gian giám thị cấp và dùng thời lượng lưu trên lượt', () => {
  const onTime = getSubmissionTiming(record(end + 300000, { extraTimeSeconds: 300 }));
  assert.equal(onTime.isLate, false); assert.equal(onTime.deadlineMs, end + 300000);
  assert.equal(getSubmissionTiming(record(end + 301000, { extraTimeSeconds: 300 })).lateSeconds, 1);
  assert.equal(getSubmissionTiming(record(start + 600000, { durationMinutes: 10 })).isLate, false);
});
test('bài cũ hoặc thiếu timestamp máy chủ không bị kết luận muộn', () => {
  for (const field of ['startedAt', 'serverSubmittedAt', 'durationMinutes', 'extraTimeSeconds']) {
    const row = record(end + 100000); delete row[field];
    const result = getSubmissionTiming(row);
    assert.equal(result.known, false, field); assert.equal(result.isLate, null, field); assert.equal(result.lateSeconds, null, field);
  }
  assert.equal(getSubmissionTiming(record(end + 1000, { startedAt: new Date(start).toISOString() })).known, false);
  assert.equal(getSubmissionTiming(record(end + 1000, { mode: 'practice' })).known, false);
});
test('timestamp SDK và bản serialize JSON cho cùng kết quả; cấu trúc lỗi không gây crash', () => {
  const expected = getSubmissionTiming(record(end + 1000));
  const actual = getSubmissionTiming(record(end + 1000, { startedAt: { toMillis: () => start }, serverSubmittedAt: { toMillis: () => end + 1000 } }));
  assert.deepEqual(actual, expected);
  for (const row of [null, {}, record(end, { durationMinutes: -1 }), record(end, { durationMinutes: Infinity }), record(end, { extraTimeSeconds: -1 }), record(end, { serverSubmittedAt: { toMillis() { throw new Error('bad'); } } }), record(start - 1)]) {
    assert.equal(getSubmissionTiming(row).known, false);
  }
});
