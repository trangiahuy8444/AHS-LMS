# Bảo toàn bài ôn tập và xác nhận mở ca thi — 11/11/2026

## Hành vi sau bản sửa

- Bài nộp & Chấm nhận cả bài chính thức, lịch sử từng lượt ôn tập và bản tổng hợp ôn tập cũ. Xem ôn tập chỉ đọc, không có nút đặt lại/xóa lượt thi chính thức.
- Lượt mới giữ `answers` và `practiceSet` đúng thứ tự câu/phương án đã hiển thị. Thang điểm và cách chấm không đổi. Bảng điểm/in vẫn lấy điểm cao nhất mỗi học sinh; lịch sử lượt riêng giữ cả lượt thấp điểm hơn.
- Bài cũ thiếu bộ câu hỏi không được ghép chỉ số lựa chọn với phương án ngân hàng gốc. Hiển thị cảnh báo nguồn chưa đủ, không tự chấm lại.
- CSV bao gồm bài thi và điểm ôn tập, có thang điểm riêng. JSON v2 bao gồm `submissions`, `practiceSubmissions`, `practiceAttempts`; phạm vi sao lưu là toàn bộ dữ liệu đã nhận trên máy giáo viên, không phải chỉ bộ lọc đang xem.
- Nộp ôn tập lưu nguyên bài trên máy và hàng chờ gửi lại; có cảnh báo riêng nếu chưa nhận xác nhận máy chủ. Không đóng/xóa trình duyệt khi còn cảnh báo.
- Mở/đóng lớp chỉ báo thành công sau khi máy chủ ghi nhận; dùng transaction để không gửi lại map cũ/bí mật.

## Phát hành theo cặp client và rules

1. Sao lưu dữ liệu hiện có, chọn thời điểm ngoài ca đang làm bài.
2. Publish `firestore.rules` mới (và rules tương ứng của website thử khi phát hành bản thử), kiểm chứng hash/nội dung. Rules mới nhận cả dòng ôn tập kiểu cũ và kiểu có chi tiết; không mở quyền đọc danh sách cho học sinh.
3. Phát hành client đã kiểm tra. Chỉ yêu cầu tải lại các máy trước ca mới, không tải lại giữa bài đang làm.
4. Diễn tập dữ liệu giả: nộp một lượt có tự luận, làm lượt mới điểm thấp hơn, kiểm tra cả hai lượt và bảng điểm cao nhất, xuất JSON/HTML, mất mạng/nối lại và xác nhận máy chủ.
5. Diễn tập mở một lớp thử: xác nhận map máy chủ, chọn đúng mã đề/mật khẩu, bắt đầu/nộp/giáo viên nhận bài. Thử lỗi quyền/kết nối phải không hiện đã mở thành công.

Nếu chỉ cập nhật client mà chưa cập nhật rules, máy chủ cũ có thể từ chối các trường chi tiết mới. Bản lưu nguyên bài trên máy và hàng chờ được giữ, nhưng chưa được gọi là đã sao lưu đám mây. Không xóa dữ liệu trình duyệt.

## Giới hạn và dữ liệu cứu hộ

Bản HTML/JSON cứu hộ riêng có thể dùng để xem câu trả lời và đối chiếu điểm gốc; việc công nhận điểm vẫn do giáo viên quyết định sau đối soát. Không tự nhập dữ liệu cứu hộ lên Firestore hoặc sổ điểm. Công cụ nhập JSON ở quản trị hợp nhất tại máy giáo viên, không tự tạo các bài thi chính thức trên máy chủ.

Lưu trữ trình duyệt có giới hạn dung lượng. Bản ghi chi tiết không bị cắt bỏ âm thầm; nếu bộ nhớ đầy, cần sao lưu/xác minh nguồn đám mây và xử lý dung lượng. Bản sửa không thay đổi chính sách xóa/retention mà giáo viên đã xác nhận.

Chưa kết luận nguyên nhân duy nhất của ca thật khi chưa đọc cấu hình và lỗi thật trên tài khoản giáo viên. Xem kế hoạch thực thi để phân biệt lỗi mã đã tái hiện với phần cần xác minh thực tế.
