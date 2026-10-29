/**
 * normalize.js
 * Chuẩn hóa mã LMS và họ tên học sinh, dùng chung cho cổng học sinh, trang quản trị và khóa lượt thi.
 *  - Mã LMS: viết hoa, chỉ giữ chữ và số (bỏ "-", khoảng trắng, dấu chấm, gạch dưới). "hs-2026 01" -> "HS202601"
 *  - Họ tên: bỏ khoảng trắng thừa, viết hoa chữ đầu mỗi từ. "nguyễn  văn an" -> "Nguyễn Văn An"
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AsianSchoolNormalize = api;
}(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  function normalizeLmsCode(value) {
    return String(value === undefined || value === null ? '' : value)
      .normalize('NFKC')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 30);
  }

  function normalizeStudentName(value) {
    return String(value === undefined || value === null ? '' : value)
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi'))
      .join(' ')
      .slice(0, 80);
  }

  return { normalizeLmsCode, normalizeStudentName };
}));
