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
      this.timedOut = false;
    }

    start({ durationMinutes = 45, deadlineMs, serverNowMs, startedAtMs, onTick, onWarning, onTimeout } = {}) {
      this.stop();
      this.clockAnchorMs = Number.isFinite(serverNowMs) ? serverNowMs : Date.now();
      this.monotonicAnchorMs = typeof performance !== 'undefined' ? performance.now() : null;
      this.startTime = Number.isFinite(startedAtMs) ? startedAtMs : this.clockAnchorMs;
      this.expectedEndTime = Number.isFinite(deadlineMs) ? deadlineMs : this.clockAnchorMs + Math.max(1, Math.round(durationMinutes * 60)) * 1000;
      this.durationSeconds = Math.max(0, Math.round((this.expectedEndTime - this.startTime) / 1000));
      this.remainingSeconds = Math.max(0, Math.round((this.expectedEndTime - this.clockAnchorMs) / 1000));
      this.lastTickTime = this.clockAnchorMs;
      this.timedOut = false;
      this.warningTriggered = false;
      this.isPaused = false;

      this.onTickCb = onTick;
      this.onWarningCb = onWarning;
      this.onTimeoutCb = onTimeout;

      this.tick();
      if (!this.timedOut) this.timerId = setInterval(() => this.tick(), 1000);
    }

    now() {
      if (Number.isFinite(this.clockAnchorMs) && this.monotonicAnchorMs !== null && typeof performance !== 'undefined') {
        return this.clockAnchorMs + performance.now() - this.monotonicAnchorMs;
      }
      return Date.now();
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

    // Đồng bộ bài thi chính thức bằng hạn tuyệt đối từ lượt thi máy chủ.
    // Không cộng dồn snapshot lặp và không khởi động lại đồng hồ đã dừng để nộp bài.
    syncDeadline(deadlineMs) {
      if (!Number.isFinite(deadlineMs) || this.startTime === null) return false;
      if (deadlineMs === this.expectedEndTime) return true;
      if (!this.timerId) return false;
      this.expectedEndTime = deadlineMs;
      this.durationSeconds = Math.max(1, Math.round((deadlineMs - this.startTime) / 1000));
      if (deadlineMs - this.now() > 300000) this.warningTriggered = false;
      this.tick();
      return true;
    }

    tick() {
      if (this.isPaused) return;

      const now = this.now();

      // Kiểm tra tua lùi đồng hồ máy tính
      if (now < this.lastTickTime - 2000) {
        console.warn('Phát hiện chỉnh lùi giờ hệ thống!');
      }

      const diff = Math.max(0, Math.round((this.expectedEndTime - now) / 1000));
      this.remainingSeconds = diff;
      this.lastTickTime = now;

      const formatted = this.formatTime(this.remainingSeconds);

      if (typeof this.onTickCb === 'function') {
        this.onTickCb(this.remainingSeconds, formatted, { nowMs: now, elapsedSeconds: Math.max(0, Math.floor((now - this.startTime) / 1000)) });
      }

      // Cảnh báo 5 phút cuối
      if (this.remainingSeconds <= 300 && !this.warningTriggered) {
        this.warningTriggered = true;
        if (typeof this.onWarningCb === 'function') {
          this.onWarningCb(this.remainingSeconds, formatted);
        }
      }

      // Hết giờ -> Tự động nộp
      if (this.remainingSeconds <= 0 && !this.timedOut) {
        this.timedOut = true;
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
