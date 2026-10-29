/**
 * anti-cheat.js
 * Hệ thống giám sát và chống gian lận đa tầng cho phòng thi trực tuyến
 * Chỉ kích hoạt trong Chế độ Thi Giữa HK1 (không làm phiền khi ôn tập)
 */

(function () {
  class AntiCheatSystem {
    constructor() {
      this.enabled = false;
      this.violationCount = 0;
      this.listeners = [];
      this.onViolationCallback = null;
      this.isSubmitting = false;
      this.isLocked = false;

      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleContextMenu = this.handleContextMenu.bind(this);
      this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    }

    start({ onViolation, allowCopyPaste = false } = {}) {
      if (this.enabled) return;
      this.enabled = true;
      this.isLocked = false;
      this.violationCount = 0;
      this.isSubmitting = false;
      this.onViolationCallback = onViolation;
      this.allowCopyPaste = allowCopyPaste;

      if (typeof window === 'undefined') return;

      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('blur', this.handleBlur);
      window.addEventListener('keydown', this.handleKeyDown, true);
      document.addEventListener('contextmenu', this.handleContextMenu);
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    }

    stop() {
      if (!this.enabled) return;
      this.enabled = false;

      if (typeof window === 'undefined') return;

      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('blur', this.handleBlur);
      window.removeEventListener('keydown', this.handleKeyDown, true);
      document.removeEventListener('contextmenu', this.handleContextMenu);
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    }

    setSubmitting(val) {
      this.isSubmitting = val;
    }

    setLocked(val) {
      this.isLocked = !!val;
    }

    resetViolations() {
      this.violationCount = 0;
    }

    triggerViolation(reason, details = {}) {
      if (!this.enabled || this.isSubmitting || this.isLocked) return;
      this.violationCount++;
      const payload = {
        count: this.violationCount,
        reason,
        details,
        timestamp: new Date().toISOString()
      };
      if (typeof this.onViolationCallback === 'function') {
        this.onViolationCallback(payload);
      }
    }

    handleVisibilityChange() {
      if (document.hidden) {
        this.triggerViolation('Chuyển sang tab khác hoặc thu nhỏ trình duyệt');
      }
    }

    handleBlur() {
      // Khi mất tiêu điểm cửa sổ (Alt-Tab hoặc click ngoài)
      if (!this.isSubmitting) {
        this.triggerViolation('Mất tiêu điểm cửa sổ thi (chuyển ứng dụng khác)');
      }
    }

    handleFullscreenChange() {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFull && !this.isSubmitting) {
        this.triggerViolation('Thoát chế độ toàn màn hình khi đang làm bài');
      }
    }

    handleContextMenu(e) {
      e.preventDefault();
      this.triggerViolation('Nhấp chuột phải trong phòng thi');
      return false;
    }

    handleKeyDown(e) {
      const key = e.key;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // 1. Chặn F12
      if (key === 'F12') {
        e.preventDefault();
        this.triggerViolation('Nhấn phím F12 mở công cụ DevTools');
        return false;
      }

      // 2. Chặn phím tắt mở DevTools / Inspector trên cả Windows (Ctrl+Shift+I/J/C) và macOS (Cmd+Option+I/J/C)
      if (isCtrlOrCmd && (e.shiftKey || e.altKey) && ['I', 'i', 'J', 'j', 'C', 'c'].includes(key)) {
        e.preventDefault();
        this.triggerViolation('Mở bảng điều khiển DevTools kiểm tra mã nguồn');
        return false;
      }

      // 3. Chặn xem mã nguồn (Ctrl+U / Cmd+Option+U / Cmd+U)
      if (isCtrlOrCmd && (key === 'U' || key === 'u')) {
        e.preventDefault();
        this.triggerViolation('Xem mã nguồn trang web');
        return false;
      }

      // 4. Chặn lưu trang (Ctrl+S / Cmd+S) và in trang (Ctrl+P / Cmd+P)
      if (isCtrlOrCmd && ['S', 's', 'P', 'p'].includes(key)) {
        e.preventDefault();
        this.triggerViolation(`Nhấn phím tắt hệ thống (${key.toUpperCase()})`);
        return false;
      }

      // 5. Chặn Copy/Paste/Cut/SelectAll nếu không cho phép
      if (!this.allowCopyPaste && isCtrlOrCmd && ['C', 'c', 'V', 'v', 'X', 'x', 'A', 'a'].includes(key)) {
        e.preventDefault();
        this.triggerViolation(`Sử dụng phím tắt sao chép/chọn (${key.toUpperCase()})`);
        return false;
      }
    }

    async requestFullscreen() {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
        return true;
      } catch (err) {
        console.warn('Fullscreen request rejected', err);
        return false;
      }
    }

    async exitFullscreen() {
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          }
        }
      } catch (e) { /* ignore */ }
    }
  }

  const antiCheat = new AntiCheatSystem();
  if (typeof window !== 'undefined') {
    window.AsianSchoolAntiCheat = antiCheat;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = antiCheat;
  }
})();
