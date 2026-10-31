const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function timerHarness() {
  let now = 1700000000000;
  class Clock extends Date { static now() { return now; } }
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/exam-timer.js'), 'utf8'), {
    window, Date: Clock, console, setInterval: () => 1, clearInterval() {}
  });
  return { timer: window.AsianSchoolTimer, advance: ms => { now += ms; }, now: () => now };
}
test('syncDeadline dùng hạn tuyệt đối: snapshot lặp không cộng dồn hoặc phát timeout lặp', () => {
  const h = timerHarness();
  let timeouts = 0;
  h.timer.start({ durationMinutes: 45, onTimeout: () => timeouts++ });
  const end = h.now() + 50 * 60 * 1000;
  h.timer.syncDeadline(end);
  assert.equal(h.timer.remainingSeconds, 3000);
  h.advance(10000);
  h.timer.syncDeadline(end);
  h.timer.tick();
  assert.equal(h.timer.remainingSeconds, 2990);
  assert.equal(h.timer.expectedEndTime, end);
  h.advance(2990000);
  h.timer.tick();
  assert.equal(timeouts, 1);
  h.timer.syncDeadline(end);
  assert.equal(timeouts, 1);
});
test('syncDeadline bỏ qua hạn không hợp lệ và không tạo timer trước start', () => {
  const h = timerHarness();
  assert.equal(h.timer.syncDeadline(h.now() + 1000), false);
  h.timer.start({ durationMinutes: 45 });
  const original = h.timer.expectedEndTime;
  for (const end of [NaN, Infinity, '1700000000000', null]) assert.equal(h.timer.syncDeadline(end), false);
  assert.equal(h.timer.expectedEndTime, original);
});
