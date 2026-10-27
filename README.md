# Nền Tảng Ôn Tập & Kiểm Tra Trực Tuyến — Tin Học Asian School

**Trường:** TH, THCS và THPT Quốc Tế Á Châu (Asian School)  
**Bộ Môn:** Tin Học — Năm học 2026 - 2027  
**Giáo viên phụ trách:** Thầy Trần Gia Huy  
**Đối tượng:** Toàn bộ học sinh Khối 8, Khối 9 và Khối 10  
**Hạ tầng Đám Mây:** Google Firebase Cloud Firestore (`ahs-lms`) & GitHub Pages  

---

## 🌐 1. ĐỊA CHỈ TRUY CẬP TRỰC TUYẾN (GITHUB PAGES)

- 🏠 **Trang chủ Cổng Tập Trung:**  
  👉 [https://trangiahuy8444.github.io/AHS-LMS/](https://trangiahuy8444.github.io/AHS-LMS/)
- ✍️ **Cổng Học Sinh (Ôn tập & Kiểm tra Giữa HK1):**  
  👉 [https://trangiahuy8444.github.io/AHS-LMS/test/](https://trangiahuy8444.github.io/AHS-LMS/test/)
- 🛡️ **Cổng Quản Trị Giáo Viên (Admin Dashboard & Chấm Tự Luận):**  
  👉 [https://trangiahuy8444.github.io/AHS-LMS/admin/](https://trangiahuy8444.github.io/AHS-LMS/admin/)
  - *Mật khẩu Quản trị mặc định:* `admin` (có thể đổi trong tab Cấu hình).
  - *Mật khẩu Phòng thi chính thức:* `asian2026` (học sinh cần nhập khi vào chế độ thi).

---

## 🚀 2. TÍNH NĂNG NỔI BẬT

### 2.1. Cổng Dành Cho Học Sinh (`/test`)
- **Hai chế độ linh hoạt:**
  - **Ôn tập đề cương:** Tự do luyện tập 35 câu (Khối 8, 9) hoặc 25 câu TN + 6 câu Đúng/Sai (Khối 10). Tự động chấm điểm, hiển thị số câu đúng/sai, đối chiếu bài tự luận mẫu.
  - **Kiểm tra chính thức (45 phút):** Yêu cầu mật khẩu phòng thi, tự động phân bổ mã đề (101..104) theo lớp, chống gian lận đa tầng (toàn màn hình, phát hiện chuyển tab/mất focus, chặn F12/Copy), đồng hồ đếm ngược đồng bộ chống tua giờ.
- **Giao diện bài thi tối ưu UX/UI:**
  - Hiển thị từng câu 1 (One-question-at-a-time) kèm thanh điều hướng nhanh.
  - Tự động lưu bài làm chống mất mạng.
  - Nút **"📸 Chụp màn hình nộp kết quả LMS"** tự động tạo file ảnh PNG định dạng chuẩn: `[MãLMS]_[HọTên]_[Lớp]_KetQua.png` để học sinh nộp làm minh chứng trên Asian School LMS.

### 2.2. Cổng Quản Trị Dành Cho Giáo Viên (`/admin`)
- **Tab 1 — Giám Sát Trực Tiếp (Live Proctor):** Xem trạng thái làm bài, tiến độ câu hỏi, cảnh báo vi phạm gian lận theo thời gian thực; can thiệp từ xa (cộng +5/+10 phút, mở khóa, thu bài khẩn, phát thông báo phòng thi).
- **Tab 2 — CSDL Bài Nộp & Chấm Tự Luận (Interactive Essay Grading):**
  - Giao diện chấm tự luận trực quan chia đôi màn hình: bên trái hiển thị bài làm của học sinh, bên phải hiển thị thang điểm barem đáp án chuẩn & nút chấm nhanh (0.0 đến 1.0đ) kèm ô nhận xét.
  - Tự động cộng dồn điểm trắc nghiệm + tự luận ra tổng điểm thang 10.
  - Hỗ trợ xuất file Excel CSV chuẩn UTF-8 BOM và sao lưu/hợp nhất CSDL JSON.
- **Tab 3 — Tra Cứu Toàn Bộ Ngân Hàng Đáp Án:** Xem toàn bộ 4 phương án A, B, C, D của tất cả các khối và mã đề (101..104).
- **Tab 4 — Phân Tích Khảo Thí & Phổ Điểm:** Tự động thống kê Top 5 câu trắc nghiệm học sinh làm sai nhiều nhất và biểu đồ phân bổ điểm số (Giỏi, Khá, TB, Yếu).
- **Tab 5 — Xuất Bảng Điểm In Khổ A4 Nằm Ngang:** Trình bày chuẩn thể thức văn bản sư phạm của Asian School, có sẵn khung chữ ký giáo viên phụ trách (Thầy Trần Gia Huy).
- **Tab 6 — Cấu Hình & Nhật Ký Hệ Thống:** Tùy chỉnh chế độ phân bổ mã đề, đổi mật khẩu phòng thi, mật khẩu admin, tra cứu audit log.

### 2.3. Tích Hợp Đám Mây Google Firebase Firestore (`ahs-lms`)
- Đồng bộ hóa dữ liệu thời gian thực giữa máy học sinh và bảng điều khiển giáo viên qua các bộ sưu tập Firestore:
  - `submissions`: Lưu toàn bộ bài nộp, điểm trắc nghiệm, điểm tự luận và lời phê giáo viên.
  - `live_sessions`: Theo dõi trạng thái học sinh đang trực tuyến trong phòng thi.
  - `proctor_commands`: Truyền lệnh giám thị thời gian thực.
- Kiến trúc **Hybrid Offline-First**: Hoạt động hoàn hảo ngay cả khi mất mạng nhờ bộ đệm LocalStorage, tự động đồng bộ khi có kết nối trở lại.

---

## 🛠️ 3. CẤU TRÚC MÃ NGUỒN

```
AHS-LMS/
├── index.html                   # Trang chủ cổng tập trung giới thiệu và điều hướng
├── .gitignore                   # Cấu hình bỏ qua tệp tạm
├── README.md                    # Tài liệu hướng dẫn hệ thống
├── assets/
│   ├── logo_asian_school.png    # Huy hiệu biểu trưng Trường Quốc Tế Á Châu
│   └── logo-base64.js           # Chuỗi Base64 logo dùng chụp ảnh kết quả
├── data/
│   ├── questions_grade8.js      # Ngân hàng đề cương & 4 mã đề thi Khối 8
│   ├── questions_grade9.js      # Ngân hàng đề cương & 4 mã đề thi Khối 9
│   └── questions_grade10.js     # Ngân hàng đề cương, Đúng/Sai & 4 mã đề thi Khối 10
├── src/
│   └── core/
│       ├── firebase-config.js   # Khởi tạo SDK Firebase & đồng bộ Cloud Firestore
│       ├── storage-service.js   # Module quản lý CSDL, chấm tự luận & xuất CSV
│       ├── anti-cheat.js        # Module giám sát chống gian lận đa tầng
│       └── exam-timer.js        # Bộ đếm ngược chống tua giờ
├── test/
│   └── index.html               # Giao diện làm bài của Học Sinh (React + Tailwind)
├── admin/
│   └── index.html               # Cổng Quản Trị & Giám Sát của Giáo Viên (React + Tailwind)
└── tests/
    └── verify_platform.test.cjs # Bộ kiểm thử tự động 11 bài test đảm bảo tính toàn vẹn
```

---

## 🏫 BẢN QUYỀN & CHUYÊN MÔN
© 2026 - 2027 **Trường Tiểu Học, THCS và THPT Quốc Tế Á Châu (Asian School)**  
Bộ Môn Tin Học — Giáo viên phụ trách: **Thầy Trần Gia Huy**
