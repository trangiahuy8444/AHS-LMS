# Hệ thống thử cục bộ AHS-LMS

Giáo viên chọn chạy trên máy hiện tại, thử toàn bộ chức năng mà học sinh trên web thật vẫn ôn tập được.

Dùng cùng cổng admin/student và firestore.rules với Firebase Auth/Firestore Emulator, project demo-ahs-local. Không có Firebase cloud mới; không truy cập project ahs-lms khi chạy thử. Profile chỉ bật bằng Vite mode sandbox, chỉ được chạy trên localhost/127.0.0.1 port5188. Admin dùng localhost, student dùng127.0.0.1 để không dùng chung phiên đăng nhập. Emulator Auth9098, Firestore8188 đều bind127.0.0.1.

Dữ liệu khởi tạo giả: đủ 3 khối và4 mã, câu trắc nghiệm/đúng sai/tự luận, cấu hình mặc định mở cả hai chế độ. Không sao chép đề hoặc danh sách thật. Chạy lại khởi tạo không ghi đè tiến độ. Dữ liệu emulator được xuất riêng khi tắt và nhập lại lần chạy sau; phiên khởi động mới dọn cache trình duyệt thử trên hai origin chuyên dùng. Không đổi rules thật.

Thử được làm/nộp/khôi phục, đồng hồ, vi phạm/khóa/mở, cộng giờ/thu bài/nhắc nhở, chấm tay, bảng điểm/xuất/in, cấu hình và ngân hàng đề với dữ liệu giả. Các dịch vụ bên ngoài (Gemini/Sheets) dùng phản hồi mô phỏng ghi nhãn rõ và nhật ký yêu cầu cục bộ, không xác nhận chất lượng chấm AI hay kết nối Google thật. Google login được thay bằng danh tính giáo viên giả trong Auth Emulator; vẫn đi qua rules gốc.

Banner trên cả hai cổng và trang đăng nhập nêu rõ chế độ thử, liên kết mở hai vai, mật khẩu phòng thử và giới hạn dịch vụ mô phỏng. Admin thật có lối mở trang thử cục bộ, không bật chế độ lớp. Nếu chưa chạy máy chủ thì trình duyệt không kết nối được, hướng dẫn khởi động cục bộ.

Kiểm chứng: test profile/host/project/khởi tạo Firebase không có fallback cloud; kiểm tra mô phỏng không gọi mạng ngoài; seed đủ cấu trúc; npm run check; emulator rules; diễn tập trình duyệt bằng dữ liệu giả. Không dùng kết quả cục bộ thay nghiệm thu môi trường thật.
