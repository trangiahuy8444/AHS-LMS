export const DEFAULT_STUDENT_GUIDANCE = {
  practice: {
    title: 'HƯỚNG DẪN VÀ ĐIỀU KIỆN HOÀN THÀNH (LMS)',
    body: 'Tài liệu cho phép: Chỉ được sử dụng Sách giáo khoa trong quá trình làm bài.\nYêu cầu đạt: Học sinh cần hoàn thành bài làm đạt từ 6.0 điểm trở lên ít nhất 5 lần.\nSau khi nộp bài, hệ thống sẽ mở hướng dẫn chấm Rubric phần Tự luận để học sinh đối chiếu bài làm.'
  },
  exam: {
    title: 'HƯỚNG DẪN LÀM BÀI THI',
    body: 'Kiểm tra thông tin học sinh và mã đề trước khi làm bài.\nKhông chuyển tab hoặc rời toàn màn hình. Khi cần hỗ trợ, giơ tay báo giám thị.\nKiểm tra lại câu trả lời trước khi nộp bài.'
  }
};

export function getStudentGuidance(config, mode) {
  const defaults = DEFAULT_STUDENT_GUIDANCE[mode === 'exam' ? 'exam' : 'practice'];
  const saved = config?.studentGuidance?.[mode] || {};
  return {
    title: typeof saved.title === 'string' && saved.title.trim() ? saved.title : defaults.title,
    body: typeof saved.body === 'string' && saved.body.trim() ? saved.body : defaults.body
  };
}

// Thời lượng hiển thị lấy từ cùng cấu hình của ca thi, không ghi cứng trong nội quy.
export function getExamDurationMinutes(config) {
  const minutes = Number(config?.examDurationMinutes);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 45;
}
