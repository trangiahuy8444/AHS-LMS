/**
 * exam-timer.js
 * Đồng hồ đếm ngược bảo mật, chống tua giờ, tự động cảnh báo và nộp bài
 */

(function () {
  class ExamTimer {
    constructor() {
      this.timerId = null;
      this.durationSeconds = 45 * 60;
      this.remainingSeconds = 45 * 60;
      this.startTime = null;
      this.expectedEndTime = null;
      this.lastTickTime = null;
      this.isPaused = false;

      this.onTickCb = null;
      this.onWarningCb = null;
      this.onTimeoutCb = null;
      this.warningTriggered = false;
    }

    start({ durationMinutes = 45, onTick, onWarning, onTimeout } = {}) {
      this.stop();
      this.durationSeconds = Math.max(1, Math.round(durationMinutes * 60));
      this.remainingSeconds = this.durationSeconds;
      this.startTime = Date.now();
      this.expectedEndTime = this.startTime + this.durationSeconds * 1000;
      this.lastTickTime = this.startTime;
      this.warningTriggered = false;
      this.isPaused = false;

      this.onTickCb = onTick;
      this.onWarningCb = onWarning;
      this.onTimeoutCb = onTimeout;

      this.tick();
      this.timerId = setInterval(() => this.tick(), 1000);
    }

    stop() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }

    extendSeconds(extraSeconds) {
      const extra = Math.max(0, Math.round(extraSeconds));
      this.durationSeconds += extra;
      this.expectedEndTime += extra * 1000;
      this.warningTriggered = false;
      this.tick();
    }

    tick() {
      if (this.isPaused) return;

      const now = Date.now();

      // Kiểm tra tua lùi đồng hồ máy tính
      if (now < this.lastTickTime - 2000) {
        console.warn('Phát hiện chỉnh lùi giờ hệ thống!');
      }

      const diff = Math.max(0, Math.round((this.expectedEndTime - now) / 1000));
      this.remainingSeconds = diff;
      this.lastTickTime = now;

      const formatted = this.formatTime(this.remainingSeconds);

      if (typeof this.onTickCb === 'function') {
        this.onTickCb(this.remainingSeconds, formatted);
      }

      // Cảnh báo 5 phút cuối
      if (this.remainingSeconds <= 300 && !this.warningTriggered) {
        this.warningTriggered = true;
        if (typeof this.onWarningCb === 'function') {
          this.onWarningCb(this.remainingSeconds, formatted);
        }
      }

      // Hết giờ -> Tự động nộp
      if (this.remainingSeconds <= 0) {
        this.stop();
        if (typeof this.onTimeoutCb === 'function') {
          this.onTimeoutCb();
        }
      }
    }

    formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  const timer = new ExamTimer();
  if (typeof window !== 'undefined') {
    window.AsianSchoolTimer = timer;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = timer;
  }
})();
