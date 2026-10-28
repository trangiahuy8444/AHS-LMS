// Biểu tượng và màu theo loại thông báo (success | error | warning | info), dùng cho hộp thoại và toast
export function feedbackIcon(type) {
  return type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠️' : 'ℹ️';
}

// tone 'soft': nền -50, viền -200 (trang quản trị); 'strong': nền -100, viền -300 (trang học sinh)
export function feedbackBadgeClass(type, tone = 'soft') {
  const strong = tone === 'strong';
  if (type === 'success') return strong ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (type === 'error') return strong ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-rose-50 text-rose-700 border border-rose-200';
  if (type === 'warning') return strong ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-50 text-amber-700 border border-amber-200';
  return strong ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200';
}
