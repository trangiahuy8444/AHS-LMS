# Lộ trình AHS-LMS

> Tệp trạng thái sống, nguồn duy nhất cho việc cần làm. Đánh dấu `[x]` kèm commit khi xong. Một việc chỉ xong khi `npm run check` đạt **và** giáo viên xác nhận trên trang thật.
> Lập ngày 28/10/2026 từ lịch sử git. Các mục "Đề xuất" chưa được thầy duyệt.

## Đã xong (27–28/10/2026)

- [x] Nền tảng thi trực tuyến Firebase + GitHub Pages (`fb9e5da`)
- [x] Thời lượng làm bài, khóa/mở phiên, phạt 3 vi phạm (`70979c0`)
- [x] Ma trận mở ca thi theo lớp, đồng bộ thời gian thực (`e711b51`)
- [x] Tối ưu CSDL cho 300+ học sinh, đồng bộ Google Drive (`fdebb7e`, `8468a31`)
- [x] Ôn tập lấy mẫu câu (THCS 28, THPT 19+3+3), xáo trộn, thời lượng (`0802487`)
- [x] Giám sát ôn tập trực tiếp, tự luận nhiều ý, rà đáp án 3 khối (`1274554`)
- [x] Chuyển sang gói Spark: bảo mật bằng `firestore.rules`, chấm ở trang quản trị, đăng nhập Google (`98dc055`)
- [x] Khóa kho đề, tự chấm lại bài nộp trùng id (`24bc873`)
- [x] Vite + React 18 + Tailwind v3; tách AdminApp và App thành controller/action/tab (`62f8121`, `6c204cd`, `095a373`)
- [x] CI: lint, test, build, chặn lọt mã đề, đăng Pages (`4579371`)
- [x] Không lộ URL/token webhook cho học sinh (`aa48472`)
- [x] Hộp thoại dùng chung, test component Vitest, bỏ Analytics (`e4a06d9`, `d3f2786`, `c8b022a`)
- [x] Sửa nút mở khóa bài làm (lỗi từ bước tách mã); bỏ tự trừ 5 điểm vi phạm; test hợp đồng context và luồng mở khóa (29/10/2026)

## Cần thầy xác nhận ngay

- [ ] Bản `firestore.rules` hiện tại đã dán lên Firebase Console chưa? (Nếu chưa, các bảo vệ ở commit `98dc055`, `aa48472` chưa có hiệu lực.)
- [ ] Đã chạy thử một ca thi thật (ít nhất 1 lớp) trên bản Vite chưa?

## Trước CK1 (hạn: trước 18/1/2027)

- [ ] Đề cương ôn tập CK1 cho 3 khối vào `data/questions_grade{8,9,10}.js` (từ đề cương đã duyệt trong `../06_Kiem_tra_va_Danh_gia/`)
- [ ] Mã đề CK1 101–104 cho 3 khối tải lên `exam_bank` qua tab Cấu hình
- [ ] Diễn tập ca thi: đủ lượt, đúng mã đề theo lớp, mất mạng giữa chừng, nộp lỗi rồi nộp lại, cộng giờ, thu bài khẩn
- [ ] Kiểm tra chấm: so điểm tự chấm với chấm tay trên một mẫu bài (MC, Đ/S, phạt vi phạm)
- [ ] **Đề xuất:** công cụ chuyển gói đề đã khóa từ `ngan-hang-de-web` sang JSON `{ grade, officialExams }` của AHS-LMS, để mã đề thi trực tuyến trùng đúng mã đề đã duyệt (hash), không gõ lại
- [ ] **Đề xuất:** quy định thời hạn lưu và xóa dữ liệu học sinh (`submissions`, `exam_attempts`, `live_sessions`, nhật ký vi phạm) sau khi chốt điểm học kì, theo Luật 91/2025 và NĐ 356/2025

## Sau CK1

- [ ] **Đề xuất:** phân tích câu sai nhiều theo mã câu ổn định, gửi ngược về `ngan-hang-de-web` (mốc D bên đó: độ khó, độ phân biệt)
