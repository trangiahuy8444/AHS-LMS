# Bài đánh giá phục hồi riêng lớp 8/21

Giáo viên đã yêu cầu chuyển nguồn ôn tập cứu hộ của lớp này thành bài đánh giá có chấm tự luận và học sinh xác nhận điểm; đã chọn phương án AI đề xuất, giáo viên kiểm tra và duyệt.

## Hành vi

- Chỉ nguồn có khối8/lớp8/21/mãRECOVERY821 và marker `practice-821-20261111` được xử lý đặc biệt. Giữ bản ôn tập gốc, tạo bản đánh giá riêng; không chiếm ID/lượt thi chính thức.
- Giữ nguyên điểm trắc nghiệm trên thang7, không tự chấm lại hoặc suy ra phương án đã đảo. Tự luận có3 câu theo đề cương tham chiếu, mỗi câu1điểm theo bước0,25; tổng thang10.
- Đề xuất AI lưu riêng, chưa thay điểm chính thức. Giáo viên xem điểm từng ý/lý do/lưu ý rồi bấm Duyệt và lưu điểm. Lưu phải có xác nhận máy chủ và kiểm phiên bản; duyệt lại xóa xác nhận điểm cũ.
- Khi duyệt, bản nguồn xóa nội dung đề xuất AI riêng tư, chỉ còn điểm/nhận xét giáo viên đã duyệt để học sinh xem. Học sinh không đọc bản chưa duyệt, không dùng cache thay cho xác nhận mới của máy chủ.
- Chỉ mở cờ xem cho lớp8/21; máy chủ vẫn kiểm từng bài đã duyệt trước khi cho đọc/xác nhận. Học sinh chỉ xác nhận phiên bản điểm đã mở, không tự sửa điểm.
- Các nút xác nhận thay học sinh, xóa/đặt lại lượt thi không áp dụng cho bản phục hồi. Các lớp và bài thi thông thường giữ nguyên hành vi.

## Dữ liệu và giới hạn

Nội dung trắc nghiệm đầy đủ và thứ tự phương án cũ không còn. Giao diện giữ ID/chỉ số lựa chọn và điểm gốc; không ghép đề101 hoặc giả định đúng/sai. Tự luận hiển thị nguyên câu trả lời và câu hỏi/barem đề cương tham chiếu. Mọi đề xuất vẫn cần giáo viên duyệt; trường hợp có cách hiểu khác được nêu riêng.

Dữ liệu cá nhân, nguồn cứu hộ, kế hoạch chuyển dữ liệu và biên nhận chỉ ở vùng riêng tư ngoài repository. Tạo nguồn và archive job nguyên tử, create-only; không ghi vào exam_attempts/exam_sessions, không xóa nguồn ôn tập gốc.

## Vận hành

Admin → Bài nộp & chấm → Khối8 → Lớp8/21 → Chỉ bài thi → Tất cả trạng thái → Xem & Chấm. Giáo viên đọc đề xuất và lý do, điều chỉnh nếu cần, bấm Duyệt và lưu điểm từng học sinh.

Học sinh vào cổng học sinh, nhập đúng Khối/Lớp/Mã LMS và chọn Xem bài & chốt điểm sau khi giáo viên đã duyệt. Không bắt đầu ca thi mới để xem bản phục hồi. Các bài chưa duyệt tiếp tục ở trạng thái chờ.

## Kiểm chứng trước phát hành

237 Node đạt/3 gói riêng tư bỏ qua;239 Vitest đạt;lint/build/chặn lọt đề đạt;42 rules emulator đạt. Rà soát độc lập không còn blocker kỹ thuật. Đã rà soát19 bộ đề xuất/57 câu/114 ý theo barem, chưa công nhận điểm thay giáo viên.
