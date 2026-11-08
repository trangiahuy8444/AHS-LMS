# Hệ thống thử AHS-LMS trên máy giáo viên

Hệ thống thử dùng cùng giao diện, luồng thi và quy tắc dữ liệu với AHS-LMS, nhưng kết nối Firebase Auth và Firestore mô phỏng trên máy này. Dự án thử luôn là `demo-ahs-local`. Không cần mở ca thi của lớp thật hoặc tạo Firebase mới.

## Mở hệ thống thử

Trên máy đã thiết lập, mở tệp `MO_HE_THONG_THU.command` trong thư mục dự án bằng cách nhấp đúp. Bộ chạy nằm ở `~/Developer/AHS-LMS-local-sandbox`, công cụ Java/Firebase riêng ở `~/Developer/AHS-LMS-local-sandbox-tools`; tệp mở sẽ đồng bộ mã nguồn mới từ thư mục Drive, không sao chép kho đề riêng hoặc dữ liệu thật. Giữ cửa sổ đang chạy mở.

Với người phát triển: chạy `npm run sandbox` trong bản phát triển đã cài các gói của dự án. Cần Node từ 22.12, Java phù hợp với Firebase CLI và Firebase CLI của dự án. Nếu Firebase CLI nằm ở thư mục khác, đặt `AHS_SANDBOX_FIREBASE_BIN` thành đường dẫn đến chương trình đó. Nếu Java chưa nằm trong PATH, đặt `JAVA_HOME` và bổ sung thư mục `bin` của Java vào PATH trước khi chạy.

Lần đầu bộ mô phỏng có thể cần tải thành phần chạy. Khi đã có các thành phần này, Auth/Firestore của phiên thử chạy cục bộ.

Mở hai địa chỉ sau trong cùng trình duyệt:

- Giáo viên: [Admin thử](http://localhost:5188/AHS-LMS/admin/).
- Học sinh giả lập: [Cổng học sinh thử](http://127.0.0.1:5188/AHS-LMS/test/).

Giữ đúng hai tên địa chỉ khác nhau: chúng tách phiên đăng nhập giáo viên và học sinh. Nếu đổi cả hai sang cùng một tên, phiên đăng nhập có thể ảnh hưởng lẫn nhau. Bản thử có dấu nhận diện riêng; nếu không thấy dấu này, không tiếp tục thử các thao tác quản trị.

Mật khẩu phòng thi giả lập là `sandbox-local`, chỉ dùng trong hệ thống thử. Chọn một lớp có sẵn và dùng “Học Sinh Thử Một” với mã `990001`, hoặc “Học Sinh Thử Hai” với mã `990002`. Có thể tự gõ tên giả và mã khác để thử thêm. Không nhập danh sách học sinh thật. Ban đầu các lớp trong môi trường thử được mở cả ôn tập và thi; thầy có thể đổi cấu hình tùy ý trong admin thử.

Bộ khởi tạo tạo 12 mã đề giả lập cho ba khối 8, 9, 10, mỗi khối bốn mã 101–104. Đề chỉ có nội dung mẫu để kiểm tra thao tác, không phải đề chính thức. Khối 8/9 có 28 câu trắc nghiệm và ba câu tự luận; khối 10 có 19 câu trắc nghiệm, ba câu đúng/sai và ba câu tự luận. Ban đầu không chặn nộp sớm; thầy bật lại tùy chọn này để thử giới hạn nộp bài.

## Diễn tập

1. Ở cổng học sinh thử, làm ôn tập rồi nộp; kiểm tra điểm, xem lại tự luận và tải ảnh kết quả.
2. Chuyển sang thi chính thức, chọn mã đề, làm một số câu và tải lại trang để kiểm tra giữ bài.
3. Ở admin thử, kiểm tra thẻ giám sát. Gửi nhắc nhở, cộng giờ, khóa rồi mở khóa bài làm; quan sát thay đổi ở cổng học sinh thử.
4. Thử chuyển khỏi toàn màn hình hoặc sang tab khác để kiểm tra bộ đếm vi phạm và khóa sau ba lần. Các thao tác này chỉ tác động lượt thi giả lập.
5. Thử thu bài từ admin, nộp bài, chấm tự luận, nhập nhận xét, cấp thêm lượt và xem lại điểm sau tải lại.
6. Thử các kiểu phân mã đề, bật/tắt mã đề, giới hạn lượt, mở/đóng lớp, giới hạn thời gian nộp và hướng dẫn học sinh.
7. Kiểm tra bảng điểm, lọc lớp, xuất CSV/JSON và bản in bằng dữ liệu giả. Chỉ nhập gói đề giả khi thử chức năng upload; không sao chép kho đề hoặc dữ liệu học sinh thật sang môi trường thử.

Đăng nhập giáo viên dùng danh tính giả trong Auth Emulator. Gemini trả điểm minh họa có nhãn MÔ PHỎNG CỤC BỘ; Google Sheets ghi yêu cầu vào nhật ký cục bộ (tải bằng nút trên banner), không gửi yêu cầu thật kể cả nhập khóa/URL thật. Những phản hồi mô phỏng này không chứng minh hoạt động của dịch vụ Google thật. Không dùng phiên cục bộ để xác nhận Google OAuth hoặc khả năng gửi dữ liệu lên bảng điểm thật.

## Dừng và mở lại

Giữ cửa sổ chạy hệ thống mở trong lúc thử. Nhấn Ctrl+C để dừng; chờ Firebase thông báo xuất dữ liệu xong trước khi đóng cửa sổ. Dữ liệu thử được lưu trong `.local-sandbox/firebase-data/` và tự nạp khi mở lại. Bộ khởi tạo không đặt lại cấu hình, kho đề hoặc tiến độ đã có.

Không chạy đồng thời hai phiên trên cùng máy. Nếu cổng đang bận, chương trình báo lỗi và không tự tắt ứng dụng đang dùng cổng đó. Các cổng cố định: web 5188; xác thực 9098; Firestore 8188 và WebSocket 9158; điều phối bộ mô phỏng 4418 và nhật ký 4518. Tất cả bộ mô phỏng chỉ lắng nghe trên `127.0.0.1`.

Việc dừng hệ thống thử không tắt website AHS-LMS thật. Chức năng thật chỉ thay đổi khi giáo viên thao tác trên hệ thống thật hoặc phát hành phiên bản mới.

## Kiểm chứng bản cài ngày 08/11/2026

135 kiểm thử Node đạt (3 kiểm thử cần gói đề riêng tư bỏ qua);127 Vitest đạt;23 kiểm thử rules emulator đạt; lint/build/kiểm lọt đề đạt. Đã diễn tập trên máy: hai vai riêng, cộng giờ/khóa/mở/nộp/chấm/lưu điểm và ôn tập Khối10 trên màn hình nhỏ. Những kết quả này không phải nghiệm thu dịch vụ Google thật hoặc toàn bộ thiết bị học sinh.
