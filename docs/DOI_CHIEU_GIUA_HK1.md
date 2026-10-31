# Đối chiếu bộ Giữa HK1 — 30/10/2026

Nguồn chuẩn do giáo viên xác nhận: [thư mục gửi Ms.Tuyến](../../06_Kiem_tra_va_Danh_gia/00_Ho_so_nop_Giua_HK1/00_De_gui_Van_phong_photo_Ms_Tuyen/). Hiện chưa có đề CK1; không tạo hoặc giả định bộ CK1 đã duyệt.

| Khối | Mã | Câu được đối chiếu | Kết quả |
|---|---|---:|---|
|8|101–104|124|Khớp nội dung, phương án, đáp án, barem|
|9|101–104|124|Khớp nội dung, phương án, đáp án, barem|
|10|101–104|100|Khớp nội dung/ngữ cảnh, phương án, đáp án, barem|

Tổng348 câu gồm300 MC,12 câu Đ/S (48 ý),36 tự luận. So văn bản chuẩn hóa UnicodeNFC và khoảng trắng, giữ dấu câu, toán tử và chữ hoa/thường. Đối chiếu riêng thứ tự phương án, bảng đáp án MC/ĐS, đáp án tự luận theo đúng câu và tổng điểm từng barem. Các đề dự bị được giữ riêng; không thay vào bộ101–104.

Ba gói upload đã tạo tại `private/goi_upload_gk1_khoi_{8,9,10}_2026-10-30.json`; dữ liệu JSON giữ nguyên nội dung và đáp án của gói hiện có. `private/doi_chieu_gk1_2026-10-30.json` ghi hash DOCX/gói nguồn/gói upload và kết quả kiểm. Không đưa nội dung đề hoặc đáp án vào báo cáo công khai này.

Kiểm chấm trên12 mã: làm đúng toàn bộ phần khách quan đạt7 hoặc7.75; bỏ trống đạt0; tổng điểm gồm tự luận là10. Bản bỏ đáp án không còn các trường bí mật đã quy định. Browser local đã mở đủ12 mã, nhìn thấy12 ngữ cảnh Đ/S và36 đề bài tự luận; không pageerror. Cloud được stub và mạng ngoàilocalhost bị chặn nên đây là kiểm giao diện, không chứng minh auth/rules đang chạy trên Firebase thật.

Cài sạch Node22.23.4 và kiểm toàn bộ:80 test Node,67 Vitest,12 rules emulator đạt; lint/build/kiểm lọt đề đạt. Chưa upload, chưa đổi rules Console hoặc phát hành website thật.
