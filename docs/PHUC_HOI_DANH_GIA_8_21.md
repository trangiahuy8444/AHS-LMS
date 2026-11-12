# Bài đánh giá phục hồi riêng lớp 8/21

Giáo viên yêu cầu chuyển nguồn ôn tập cứu hộ thành bài đánh giá. Ngày12/11, giáo viên đổi yêu cầu: giao Gemini chấm nhanh và tự lưu điểm hoàn chỉnh như các lớp khác, không cần duyệt riêng từng bài.

## Hành vi

- Chỉ nguồn có khối8/lớp8/21/mãRECOVERY821 và marker `practice-821-20261111` được xử lý đặc biệt. Giữ bản ôn tập gốc, tạo bản đánh giá riêng; không chiếm ID/lượt thi chính thức.
- Giữ nguyên điểm trắc nghiệm trên thang7, không tự chấm lại hoặc suy ra phương án đã đảo. Tự luận có3 câu theo đề cương tham chiếu, mỗi câu1điểm theo bước0,25; tổng thang10.
- Chấm nhanh cả lớp dùng cùng Gemini như các lớp khác, chỉ lưu khi chấm hợp lệ đủ3câu. Lưu điểm chính thức có xác nhận máy chủ và kiểm phiên bản nguồn/điểm/đề xuất; chấm lại xóa xác nhận điểm cũ. Mặc định chỉ chấm bài chưa chấm; bỏ chọn để chủ động chấm lại.
- Khi lưu điểm, bản nguồn xóa nội dung đề xuất cũ riêng tư, chỉ còn điểm/nhận xét được công nhận từ lần chấm do giáo viên khởi chạy để học sinh xem. Trường nội bộ `teacherApprovedAt` ghi thời điểm lưu của thao tác này, không yêu cầu một lượt duyệt tay nữa. Học sinh không đọc bản chưa duyệt, không dùng cache thay cho xác nhận mới của máy chủ.
- Chỉ mở cờ xem cho lớp8/21; máy chủ vẫn kiểm từng bài đã duyệt trước khi cho đọc/xác nhận. Học sinh chỉ xác nhận phiên bản điểm đã mở, không tự sửa điểm.
- Các nút xác nhận thay học sinh, xóa/đặt lại lượt thi không áp dụng cho bản phục hồi. Các lớp và bài thi thông thường giữ nguyên hành vi.

## Dữ liệu và giới hạn

Nội dung trắc nghiệm đầy đủ và thứ tự phương án cũ không còn. Giao diện giữ ID/chỉ số lựa chọn và điểm gốc; không ghép đề101 hoặc giả định đúng/sai. Tự luận hiển thị nguyên câu trả lời và câu hỏi/barem đề cương tham chiếu. Đề xuất cũ chỉ là bản nháp, không tự chuyển thành điểm chính thức; nút Chấm nhanh chạy Gemini mới và lưu điểm khi thành công.

Dữ liệu cá nhân, nguồn cứu hộ, kế hoạch chuyển dữ liệu và biên nhận chỉ ở vùng riêng tư ngoài repository. Tạo nguồn và archive job nguyên tử, create-only; không ghi vào exam_attempts/exam_sessions, không xóa nguồn ôn tập gốc.

## Vận hành

Admin → Bài nộp & chấm → Khối8 → Lớp8/21 → Chỉ bài thi → Chấm nhanh cả lớp. Gemini chấm và lưu điểm; không cần mở duyệt từng bài. Giáo viên vẫn có thể dùng Xem & Chấm để sửa điểm và bấm Lưu điểm chấm.

Học sinh vào cổng học sinh, nhập đúng Khối/Lớp/Mã LMS và chọn Xem bài & chốt điểm sau khi chấm và lưu thành công. Không bắt đầu ca thi mới để xem bản phục hồi. Bài chưa chấm hoặc lưu lỗi tiếp tục ở trạng thái chờ, có thể chấm lại.

## Kiểm chứng trước phát hành

237 Node đạt/3 gói riêng tư bỏ qua;239 Vitest đạt;lint/build/chặn lọt đề đạt;42 rules emulator đạt. Rà soát độc lập không còn blocker kỹ thuật. Đã rà soát19 bộ đề xuất/57 câu/114 ý theo barem, chưa công nhận điểm thay giáo viên.

## Kiểm thay đổi chấm nhanh12/11/2026

237Node đạt/3private bỏ qua;242Vitest đạt;lint/build/chặn lọt đề đạt. Review độc lập không thấy P1/P2. Không đổi rules hoặc tự ghi điểm học sinh khi phát hành; thao tác Chấm nhanh của giáo viên mới chạy Gemini và lưu điểm.

Bản `c9530a0` đã phát hành qua Actions43139434529;3trang HTTP200,6asset nội bộ khớp build. Khi quyền xem/chốt điểm của lớp đang khóa, giáo viên bấm Mở chốt điểm sau khi hoàn tất chấm như các lớp khác. Không tự bật cờ cấu hình khi phát hành.
