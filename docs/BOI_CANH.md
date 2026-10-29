# Bối cảnh dự án AHS-LMS (Ôn tập & Kiểm tra trực tuyến)

> Tệp trạng thái sống. Đọc đầu tiên ở mỗi phiên. Repo **công khai**: không ghi mật khẩu, URL/token webhook, tên học sinh, mã LMS hay nội dung đề chính thức vào tệp này.
> Cập nhật: 29/10/2026.

## 1. Mục tiêu

Học sinh Khối 8, 9, 10 ôn tập theo đề cương và làm bài kiểm tra định kì trực tuyến trong phòng máy. Giáo viên giám sát trực tiếp, chấm tự luận, xem phổ điểm và in bảng điểm. Toàn bộ chạy **miễn phí**: GitHub Pages + Firebase gói Spark.

**Tiêu chí thành công trước mắt:** tổ chức được kỳ kiểm tra CK1 (HK1 kết thúc trước 18/1/2027) cho cả 3 khối: mỗi học sinh đúng mã đề, đúng số lượt, không lộ đề và đáp án, điểm chấm khớp quy tắc chấm, có minh chứng nộp lên LMS của trường.

## 2. Người dùng

- Học sinh: đăng nhập ẩn danh, nhập mã LMS, họ tên, lớp. Học sinh không có tài khoản Google/Microsoft của trường.
- Giáo viên: thầy Trần Gia Huy, đăng nhập Google (danh sách email trong `firestore.rules` và `src/core/firebase-config.js`).

## 3. Căn cứ pháp lý chi phối

Bản chuẩn chỉ nằm trong `../01_Van_ban_phap_ly_va_Quy_dinh/`. Không chép PDF vào repo.

| Nội dung | Căn cứ |
| :--- | :--- |
| Kiểm tra, đánh giá định kì; điểm lấy đến 1 chữ số thập phân | TT 22/2021/TT-BGDĐT (Điều 5, Điều 7) |
| Cấu trúc đề THPT, câu Đ/S 4 ý | CV 7991/BGDĐT-GDTrH |
| Dữ liệu cá nhân học sinh (họ tên, lớp, mã LMS, bài làm, nhật ký vi phạm) | Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15; NĐ 356/2025/NĐ-CP |
| 90% đề lấy từ hoặc bám sát đề cương | Quy định nội bộ `../rules/01` |

## 4. Quyết định đã chốt của giáo viên

| Ngày | Quyết định |
| :--- | :--- |
| 28/10/2026 | Giữ gói Firebase Spark, không nâng Blaze, không Cloud Functions. Bảo mật nằm ở `firestore.rules`; học sinh chỉ gửi bài làm, trang quản trị chấm |
| 28/10/2026 | Đ/S Khối 10 chấm theo hệ số 0 / 0,1 / 0,25 / 0,5 / 1 (khớp `ngan-hang-de-web`) |
| 28/10/2026 | Vi phạm 3 lần: khóa bài, chờ giám thị mở khóa |
| 30/10/2026 | Ôn tập đề cương: 3 câu tự luận **không tính điểm** và không bắt buộc làm (mọi khối); điểm thang 10 chỉ từ trắc nghiệm (và Đ/S Khối 10) |
| 30/10/2026 | Chuẩn hóa mã LMS (viết hoa, chỉ chữ và số, bỏ "-") và họ tên (viết hoa chữ đầu mỗi từ) trước khi lưu |
| 29/10/2026 | Hệ thống **không tự trừ điểm** vi phạm. Bài nộp vẫn lưu số lần vi phạm; giáo viên tự ghi nhận vào sổ |
| 28/10/2026 | Mặc định 1 lượt kiểm tra chính thức mỗi mã LMS; giáo viên cấp thêm khi cần |
| 28/10/2026 | Chuyển sang Vite + React 18 + Tailwind v3, triển khai bằng GitHub Actions; bản build bị chặn nếu lọt mã đề |
| 28/10/2026 | Điểm ôn tập chỉ đến Google Sheets qua hàng chờ `practice_results` do trang quản trị xử lý |

## 5. Ràng buộc

- Mã đề chính thức kèm đáp án: chỉ ở Firestore `exam_bank` và `private/` trên máy (gitignore). Không bao giờ ở `data/` hay trong bản build.
- Bí mật (mật khẩu phòng thi, webhook Drive) chỉ ở `exam_secrets/*`, không ở `exam_config` (ai cũng đọc được).
- Sửa `firestore.rules` chỉ có hiệu lực sau khi giáo viên dán vào Firebase Console.
- Đẩy mã thô lên `main` mà không qua workflow sẽ làm hỏng trang.
- Phát triển ở `~/Developer/AHS-LMS-vite` (cùng `.git`) để `node_modules` không đồng bộ lên Drive.

## 6. Thuật ngữ

| Từ | Nghĩa | Trong mã |
| :--- | :--- | :--- |
| Đề cương / ôn tập | Bộ câu công khai, có đáp án để tự chấm | `practiceQuestions`, `practiceTfQuestions` |
| Mã đề | Đề chính thức 101–104 | `officialExams`, `exam_bank`, `exam_public` |
| Ca thi | Lớp được mở cho làm bài chính thức | `exam_config`, `exam_sessions` |
| Lượt thi | Lần làm bài của một mã LMS | `exam_attempts` |
| Giám thị | Lệnh từ xa: cộng giờ, mở khóa, thu bài, thông báo | `proctor_commands`, `live_sessions` |
