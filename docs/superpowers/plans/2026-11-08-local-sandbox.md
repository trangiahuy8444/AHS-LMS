# Local sandbox implementation plan

**Goal:** Chạy đầy đủ luồng khảo thí trên máy giáo viên, độc lập web thật.
**Architecture:** Profile Vite sandbox kết nối Auth/Firestore Emulator bằng project demo-ahs-local. Tái sử dụng ứng dụng và rules; external services mô phỏng rõ nhãn.
**Spec:** ../specs/2026-11-08-local-sandbox-design.md

## Constraints
React18/Vite hiện có; không cloud writes/deploy, không đề/danh tính thật; port5188 chỉ loopback; cùng rules gốc; không fallback production. Phiên giáo viên/học sinh khác origin. Dịch vụ ngoài không gửi dữ liệu thật.

## Review focus
- Chạy nhầm profile/host hoặc emulator ngừng: không nối cloud.
- Hai vai không đổi phiên đăng nhập của nhau.
- Tải lại giữ tiến độ; khởi động mới không dùng cache dữ liệu cũ.
- Seed lần2 không phá bài làm.
- AI/Sheets có nhãn mô phỏng và không có outbound requests.

## Tasks
- [x] Runtime: test fail cho profile/host/project và Firebase useEmulator trước reads; triển khai runtimeEnvironment + globals + core Firebase init + sandbox auth. Test normal mode không đổi.
- [x] Launcher/seed: test project/host guard, cấu trúc giả và idempotence; runner fail nếu port bận, stop con khi thoát; seed qua REST emulator. Viết hướng dẫn chạy.
- [x] Dịch vụ ngoài/UI: test không gọi fetch thật, deterministic mock bounded scores; banner hai cổng + nút mở thử admin, tài khoản giả rõ nhãn.
- [x] Tích hợp: sync snapshot đúng nguồn; npm run check; chạy rules emulator; kiểm trình duyệt start/lock/unlock/extend/submit/grading, và không có kết nối cloud; review độc lập. Ghi nhật ký/backlog trạng thái thực tế.
