# Bảo toàn bài ôn tập và xác nhận mở ca thi

Phạm vi giáo viên đã yêu cầu thực hiện trong cuộc trò chuyện ngày 11/11/2026: đối soát dữ liệu cứu hộ; tạo bản xem để kiểm tra/chấm; sửa lưu/xuất ôn tập; điều tra chức năng mở ca thi. Đây là kế hoạch thực thi của yêu cầu đã duyệt, không thay cho backlog `docs/LO_TRINH.md`.

## Thiết kế và ràng buộc

- Bản cứu hộ gốc và dữ liệu cá nhân chỉ ở thư mục riêng ngoài repository công khai. Không ghi tên/mã LMS, câu trả lời thật vào mã/test/log công khai.
- Giữ điểm gốc và thang ôn tập 7/7.75, tự luận ôn tập không tính điểm. Không tự chuyển bài thành thi chính thức hoặc ghi sổ điểm.
- Bài cũ chỉ có chỉ số phương án sau xáo trộn: giữ nguyên chỉ số và không suy ra nội dung/đúng sai từ ngân hàng gốc.
- Lượt mới lưu độc lập nguyên câu trả lời và bộ câu hỏi/phương án của chính lượt; bảng điểm tổng hợp vẫn giữ điểm cao nhất.
- Tận dụng collection `practice_results` và outbox Drive đang có; schema bổ sung tương thích bản cũ. Nguồn có chi tiết không tự xóa chỉ vì đã đẩy điểm lên Sheets; cần biên nhận lưu trữ tương ứng.
- Ghi chờ bền trên máy trước khi gửi, thử gửi lại lúc có Auth/kết nối; thất bại phải giữ câu trả lời và không báo máy chủ đã nhận.
- Quản trị hiển thị và xuất đủ nguồn ôn tập; xem ôn tập chỉ đọc, tách khỏi hành động dành cho bài thi chính thức. JSON v2 giữ bài thi, bảng điểm ôn tập và từng lượt; hỗ trợ nhập mảng cũ và từ chối toàn bộ tệp sai trước khi ghi.
- Mở/đóng ca thi đọc map mới nhất trong transaction và chỉ cập nhật giao diện sau commit, báo lỗi rõ khi mất kết nối/từ chối quyền; chỉ ghi chính sách mở lớp.

## Các bước và nghiệm thu

1. Đối chiếu ZIP/ảnh/thời gian, xác nhận sĩ số có mặt; tạo HTML ngoại tuyến với tự luận gốc, chỉ số MCQ và nguồn minh chứng. Không tái dựng permutation không có bằng chứng.
2. Tái hiện lỗi bằng kiểm thử trước sửa: thiếu practice ở danh sách/xuất; điểm cao nhất ghi đè lượt sau; async mở ca chưa chờ xác nhận. Test mới dùng dữ liệu giả.
3. Sửa core/student/rules và admin theo ràng buộc trên, kiểm tra các trường hợp lỗi lưu, retry sau tải lại, hàng chờ thêm trong khi đang gửi, dữ liệu lồng nhau không hợp lệ, legacy không có snapshot, nhập lại không trùng.
4. Chạy `npm run check` và Firestore emulator riêng bằng project demo; rà soát độc lập quyền dữ liệu và luồng xuất. Không dùng emulator của công việc khác hoặc backend thật.
5. Đồng bộ mã đã kiểm về checkout Drive; ghi bằng chứng và hướng dẫn phát hành. Phát hành client và rules là một cặp, cần diễn tập sau khi publish; chưa thực hiện trên hệ thống thật trong đợt chuẩn bị này.

## Điều tra sự cố mở thi

Đã chứng minh từ mã và test: đường mở thi cũ cập nhật localStorage/UI ngay, trong khi ghi Firestore chạy nền và chỉ ghi cảnh báo khi thất bại; có thể khiến máy giáo viên trông đã mở nhưng học sinh vẫn bị chặn. Gửi toàn bộ cấu hình cũ còn có thể ghi đè cập nhật mới từ máy khác. Đây là lỗi đã tái hiện trong mã, chưa phải kết luận nguyên nhân duy nhất của ca thực tế.

Còn cần đọc cấu hình thực tế và diễn tập với tài khoản thử: lớp có `exam_only`/`both_open` trên máy chủ; mã được bật đúng khối/phân công; mật khẩu phòng thi; lượt đã sử dụng/khóa; bản client/rules đang chạy. Không mở ca, đổi mật khẩu hoặc cấp lượt thật để thử.
