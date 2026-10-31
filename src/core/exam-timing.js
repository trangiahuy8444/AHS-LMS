/** Thời hạn bài thi dựa trên timestamp máy chủ và thời lượng của chính lượt thi. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AsianSchoolExamTiming = api;
}(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  // Không nhận chuỗi submittedAt hay Date.now(): đó có thể là đồng hồ máy học sinh.
  function timestampMillis(value) {
    try {
      if (!value || typeof value !== 'object') return null;
      let ms;
      if (typeof value.toMillis === 'function') ms = value.toMillis();
      else if (Number.isInteger(value.seconds) && Number.isInteger(value.nanoseconds || 0)
        && (value.nanoseconds || 0) >= 0 && (value.nanoseconds || 0) < 1e9) {
        ms = value.seconds * 1000 + (value.nanoseconds || 0) / 1e6;
      }
      return Number.isFinite(ms) && ms >= 0 ? ms : null;
    } catch { return null; }
  }

  function getSubmissionTiming(sub) {
    const unknown = { known: false, deadlineMs: null, submittedAtMs: null, isLate: null, lateSeconds: null };
    if (!sub || sub.mode !== 'exam') return unknown;
    const startedAtMs = timestampMillis(sub.startedAt);
    const submittedAtMs = timestampMillis(sub.serverSubmittedAt);
    if (startedAtMs === null || submittedAtMs === null || submittedAtMs < startedAtMs
      || !Number.isFinite(sub.durationMinutes) || sub.durationMinutes <= 0
      || !Number.isFinite(sub.extraTimeSeconds) || sub.extraTimeSeconds < 0) return unknown;
    const deadlineMs = startedAtMs + sub.durationMinutes * 60000 + sub.extraTimeSeconds * 1000;
    if (!Number.isFinite(deadlineMs)) return unknown;
    const lateSeconds = Math.ceil(Math.max(0, submittedAtMs - deadlineMs) / 1000);
    return { known: true, deadlineMs, submittedAtMs, isLate: submittedAtMs > deadlineMs, lateSeconds };
  }

  return { timestampMillis, getSubmissionTiming };
}));
