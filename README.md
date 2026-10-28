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
  - Đăng nhập bằng tài khoản Google giáo viên (danh sách email trong `firestore.rules`).
  - Mật khẩu phòng thi do giáo viên đặt trong tab Cấu hình, lưu ở `exam_secrets/room`. Không ghi mật khẩu vào mã nguồn hay README.

---

## 🚀 2. TÍNH NĂNG NỔI BẬT

### 2.1. Cổng Dành Cho Học Sinh (`/test`)
- **Hai chế độ linh hoạt:**
  - **Ôn tập đề cương:** Tự do luyện tập 35 câu (Khối 8, 9) hoặc 25 câu TN + 6 câu Đúng/Sai (Khối 10). Tự động chấm điểm, hiển thị số câu đúng/sai, đối chiếu bài tự luận mẫu.
  - **Kiểm tra chính thức (45 phút):** Yêu cầu mật khẩu phòng thi, tự động phân bổ mã đề (101..104) theo lớp, chống gian lận đa tầng (toàn màn hình, phát hiện chuyển tab/mất focus, chặn F12/Copy), đồng hồ đếm ngược đồng bộ chống tua giờ.
- **Giao diện bài thi tối ưu UX/UI:**
  - Hiển thị từng câu 1 (One-question-at-a-time) kèm thanh điều hướng nhanh.
  - Tự động lưu bài làm chống mất mạng; nộp lỗi thì giữ bài trên máy và cho nộp lại.
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

## 🛠️ 3. CẤU TRÚC MÃ NGUỒN (VITE + REACT 18 + TAILWIND v3)

```
AHS-LMS/
├── index.html, test/index.html, admin/index.html   # Khung trang; mã nằm trong src/
├── vite.config.mjs, tailwind.config.mjs, postcss.config.mjs, eslint.config.mjs
├── data/questions_grade{8,9,10}.js   # Đề cương ôn tập công khai (không có mã đề chính thức)
├── public/assets/                    # Logo (logo-base64.js dùng khi chụp ảnh kết quả)
├── src/
│   ├── core/            # Logic dùng chung, giữ dạng UMD để Node test require() được
│   │   ├── firebase-config.js   # Firebase Auth/Firestore, AsianSchoolCloud.startExam/submitExam
│   │   ├── storage-service.js   # Cấu hình, bài nộp, chấm tự luận, tự chấm trắc nghiệm, CSV
│   │   ├── exam-package.js      # Bỏ đáp án, chấm điểm, kiểm tra cấu trúc mã đề
│   │   ├── anti-cheat.js, exam-timer.js
│   ├── shared/globals.js        # Nạp firebase compat + html2canvas từ npm vào window
│   ├── student/         # Cổng học sinh
│   │   ├── App.jsx, StudentContext.js, constants.js
│   │   ├── hooks/       # useStudentController (state), useProctorCommands, useBlockDevtools
│   │   ├── actions/     # bắt đầu phiên, nộp ôn tập, nộp bài thi, chụp ảnh kết quả
│   │   ├── screens/     # EntryScreen, ExamScreen, ResultScreen
│   │   ├── questions/   # McqQuestion, TrueFalseQuestion, EssayQuestion, QuestionSidebar
│   │   ├── result/      # ResultCard, AnswerReview
│   │   └── components/  # LockScreen, các hộp thoại, StudentHeader
│   └── admin/           # Cổng quản trị
│       ├── AdminApp.jsx, AdminContext.js, LoginScreen.jsx
│       ├── hooks/useAdminController.js   # state, đồng bộ Firestore, dữ liệu dẫn xuất
│       ├── actions/     # giám thị, ca thi theo lớp, chấm tự luận, xuất/sao lưu, kho đề, cấu hình
│       ├── tabs/        # Live, Submissions, Answers, Analytics, Print, Config
│       ├── config/      # 7 card của tab Cấu hình
│       ├── live/        # Bảng điều phối ca thi, danh sách thí sinh
│       └── components/  # Modal chấm tự luận, phát thông báo, toast, dialog
├── firestore.rules      # Quy tắc truy cập (thay máy chủ trên gói Spark)
├── scripts/             # Tách mã đề sang private/, kiểm tra bản build không lọt đề
├── tests/               # node --test
└── .github/workflows/deploy.yml   # Lint → test → build → kiểm tra lọt đề → GitHub Pages
```

Mỗi component lấy state từ context (`useStudent()` / `useAdmin()`) thay vì truyền props qua nhiều tầng. Muốn sửa một màn hình, mở đúng tệp trong `screens/`, `tabs/` hoặc `config/`. Muốn sửa cách xử lý, mở tệp tương ứng trong `actions/`.

---

## 🔐 4. BẢO MẬT ĐỀ THI & TRIỂN KHAI (GÓI FIREBASE SPARK, MIỄN PHÍ)

Repo này công khai, nên **mã đề chính thức kèm đáp án không bao giờ nằm trong `data/`**. Gói Spark không có Cloud Functions, nên `firestore.rules` làm thay phần máy chủ.

| Thành phần | Nơi lưu | Ai đọc được |
| :--- | :--- | :--- |
| Đề cương ôn tập (kèm đáp án để tự chấm) | `data/questions_grade{8,9,10}.js` | Mọi người |
| Mã đề kèm đáp án | Firestore `exam_bank/g{khối}_{mã}`; bản trên máy ở `private/` (gitignore) | Giáo viên |
| Mã đề đã bỏ đáp án | Firestore `exam_public/g{khối}_{mã}` | Học sinh, chỉ đúng mã đề của lượt đang làm |
| Mật khẩu phòng thi | Firestore `exam_secrets/room` | Giáo viên |
| Lượt thi theo mã LMS | Firestore `exam_attempts/g{khối}_{MÃ LMS}` | Giáo viên, học sinh chủ lượt |
| Bài nộp chính thức | Firestore `submissions` (học sinh chỉ gửi bài làm, không có điểm) | Giáo viên |

Luồng thi:
1. Học sinh đăng nhập ẩn danh rồi tạo lượt thi. Rules kiểm tra mật khẩu phòng thi, lớp đang mở ca thi, mã đề theo phân công và số lượt còn lại của mã LMS (mặc định 1 lượt).
2. Học sinh đọc đề đã bỏ đáp án. Khi nộp, chỉ bài làm được gửi đi.
3. Trang quản trị (giáo viên đăng nhập Google) tự chấm trắc nghiệm, Đúng/Sai theo hệ số 0,1/0,25/0,5/1, vi phạm 3 lần thì khóa bài chờ giám thị mở (không tự trừ điểm, giáo viên ghi nhận riêng). Phần tự luận giáo viên chấm.

Giáo viên được nhận diện bằng email Google trong `isTeacher()` của `firestore.rules`. Danh sách này phải giống `TEACHER_EMAILS` trong `src/core/firebase-config.js`.

### Cài đặt trên Firebase Console (không cần dòng lệnh)

1. **Authentication > Sign-in method**: bật **Anonymous** và **Google**.
2. **Authentication > Settings > Authorized domains**: thêm `trangiahuy8444.github.io`.
3. **Firestore Database > Rules**: dán toàn bộ `firestore.rules`, bấm **Publish**.
4. Vào `/admin`, chọn **Đăng nhập bằng Google**, rồi mở tab Cấu hình: đặt mật khẩu phòng thi và tải tệp mã đề JSON (`{ "grade": 9, "officialExams": {...} }`).

### Phát triển và kiểm thử trên máy (Node ≥ 22.12)

```sh
npm install            # lần đầu; nên đặt thư mục dự án ngoài Google Drive để node_modules không bị đồng bộ
npm run dev            # http://localhost:5173/AHS-LMS/test/ và /AHS-LMS/admin/
npm run check          # ESLint + test + build + kiểm tra bản build không lọt mã đề
npm run preview        # xem bản build tại http://localhost:4173/AHS-LMS/
```

Push lên `main` thì GitHub Actions tự chạy `npm run check` rồi đăng lên GitHub Pages (Settings → Pages → Source: **GitHub Actions**).

`scripts/tach_ma_de_chinh_thuc.cjs` tách mã đề từ `data/` sang `private/` (chạy thử mặc định, thêm `--apply` để ghi tệp).

---

## 🏫 BẢN QUYỀN & CHUYÊN MÔN
© 2026 - 2027 **Trường Tiểu Học, THCS và THPT Quốc Tế Á Châu (Asian School)**  
Bộ Môn Tin Học — Giáo viên phụ trách: **Thầy Trần Gia Huy**
