# Website thử riêng AHS-LMS

Website thử dùng Firebase riêng `ahs-lms-sandbox`, tách khỏi hệ thống học sinh thật `ahs-lms`. Dữ liệu thử đồng bộ qua Internet giữa các thiết bị; máy giáo viên không cần chạy máy chủ cục bộ.

## Hai cổng truy cập

- [Cổng giáo viên thử](https://ahs-lms-sandbox.web.app/admin/).
- [Cổng học sinh thử](https://ahs-lms-sandbox.firebaseapp.com/test/).

Website thử dùng tên đăng nhập **admin** và mật khẩu **admin** theo lựa chọn của giáo viên. Đây là tài khoản dùng chung chỉ cho dự án thử; cổng giáo viên và cổng học sinh thử cùng sử dụng tài khoản này. Không cần đăng nhập Google hoặc bật tài khoản ẩn danh cho bản thử. Đăng nhập trên thiết bị khác sẽ thấy cùng dữ liệu thử. Bài làm chỉ được khôi phục theo cơ chế mã LMS/lớp và lượt thi của ứng dụng, không tự sao chép bài đang nhập chỉ vì mở một thiết bị mới.

Tài khoản dùng chung có quyền quản trị trong dự án thử. Vì vậy môi trường này kiểm tra chức năng và đồng bộ, không đại diện cho việc phân quyền giữa học sinh và giáo viên trên hệ thống thật. Chỉ nhập dữ liệu giả; không dùng thông tin đăng nhập thử cho hệ thống thật.

Trang thử có dấu nhận diện riêng. Trước khi thay cấu hình, mở ca thi, chấm hoặc xóa dữ liệu thử, kiểm tra đang ở website `ahs-lms-sandbox`, không phải trang thật.

## Bắt đầu diễn tập

Bộ dữ liệu ban đầu có 12 mã đề giả lập: bốn mã 101–104 cho mỗi khối 8, 9, 10. Nội dung mẫu chỉ dùng thử thao tác, không phải đề thi thật. Khối 8/9 có 28 câu trắc nghiệm và ba câu tự luận; khối 10 có 19 câu trắc nghiệm, ba câu đúng/sai và ba câu tự luận.

Ban đầu các lớp thử mở cả ôn tập và thi, tối đa năm lượt, thời lượng thi 45 phút, không chặn nộp sớm và không xáo trộn. Thầy thay các tùy chọn này trong admin thử để diễn tập đúng tình huống cần kiểm tra.

Mật khẩu phòng thi được tạo ngẫu nhiên khi khởi tạo và chỉ lưu trong vùng riêng dành cho giáo viên. Mở **Cấu hình** của admin thử để xem hoặc thay mật khẩu; không lấy mật khẩu lớp thật cho website thử.

Dùng tên và mã học sinh giả. Có thể mở cổng học sinh trên điện thoại hoặc máy khác, rồi theo dõi trong admin trên máy giáo viên. Thử lần lượt:

1. Ôn tập, nộp bài, xem lại và tải ảnh kết quả.
2. Vào thi, chọn mã, nhập bài và tải lại trang để kiểm tra lưu bài.
3. Gửi nhắc nhở, cộng giờ, khóa/mở và thu bài từ admin.
4. Thử chuyển tab hoặc thoát toàn màn hình ba lần để kiểm tra ghi vi phạm và khóa bài; mở lại từ admin.
5. Nộp bài, chấm tự luận, nhập nhận xét, cấp thêm lượt và xem kết quả từ thiết bị khác.
6. Đổi cách phân mã, mở/đóng ca thi, bật giới hạn nộp sớm, sửa hướng dẫn và thử lại.
7. Thử lọc bảng điểm, xuất CSV/JSON, in và nhập gói đề giả.

Mọi thay đổi trên website thử chỉ thuộc dự án thử. Không nhập danh sách học sinh thật, kho đề thật hoặc thông tin kết nối bảng điểm thật. Các dịch vụ ngoài Firebase, như Gemini hoặc Google Sheets, cần cơ chế thử riêng và được phân biệt trên giao diện; kết quả giả lập không chứng minh dịch vụ bên ngoài đã gửi/nhận dữ liệu thật.

## Chuẩn bị và phát hành website thử

Phần này dành cho người bảo trì dự án:

- Tạo bản dựng bằng chế độ `sandbox-web`. Bản dựng nằm trong `dist-sandbox/` và phải có `sandbox-environment.json` xác nhận đúng chế độ và dự án.
- Dùng `node scripts/web-sandbox/deploy.cjs` để phát hành Hosting và bộ quy tắc thử riêng `firestore.web-sandbox.rules`. Chương trình cố định đích `ahs-lms-sandbox`, từ chối bản dựng thiếu dấu xác nhận, không dùng cấu hình phát hành của hệ thống thật.
- Dùng `node scripts/web-sandbox/seed.cjs` để tạo dữ liệu giả ban đầu sau khi Firestore đã sẵn sàng. Cần Firebase CLI đã đăng nhập bằng tài khoản có quyền với dự án thử. Quyền truy cập chỉ dùng trong bộ nhớ, không in hoặc tạo tệp bí mật mới.
- Bộ khởi tạo chỉ tạo tài liệu chưa có. Khi đã khởi tạo, chạy lại giữ nguyên mật khẩu, cấu hình, kho đề và tiến độ thử; không đặt lại hoặc xóa dữ liệu.
- Có thể chạy `node scripts/web-sandbox/trial-account.cjs` để tạo tài khoản thử bằng Firebase Admin SDK và phiên OAuth đã đăng nhập. Chỉ chấp nhận email nội bộ cố định của bản thử và đúng dự án `ahs-lms-sandbox`. Mật khẩu người dùng nhập được chuyển đổi nhất quán trước khi gửi tới Firebase; không áp dụng thay đổi này vào hệ thống thật. Chạy lại không đặt lại mật khẩu tài khoản đã tồn tại.
- Nếu Firebase CLI ở thư mục khác, đặt `AHS_SANDBOX_FIREBASE_BIN` thành đường dẫn đến chương trình đó. Không đổi mục tiêu sang `ahs-lms` và không dùng lệnh phát hành website thử để phát hành hệ thống thật.

Website thử cần bật đăng nhập email/mật khẩu, tạo tài khoản nội bộ dùng chung đã xác nhận và áp dụng bộ quy tắc thử riêng. Không bật đăng nhập ẩn danh cho bản thử này. Không triển khai bộ quy tắc thử lên dự án thật hoặc dùng `firestore.rules` của hệ thống thật thay cho tệp thử. Bản thử dùng gói Firebase miễn phí và vẫn chịu giới hạn của gói; không bật dịch vụ trả phí chỉ để diễn tập.
