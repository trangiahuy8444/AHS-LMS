# Nhật ký phiên làm việc

> Tệp trạng thái sống. Mỗi phiên có thay đổi đáng kể thêm một mục **ở đầu** tệp: ngày, đã làm gì (kèm commit), kết quả `npm run check`, việc còn dở, câu hỏi chờ thầy. Repo công khai: không ghi bí mật hay dữ liệu học sinh.

## 29/10/2026 (phiên 2): khóa bài trên máy chủ

- Đã triển khai `be57a9a` cùng rules mới; thử trên trang thật: học sinh không đọc được toàn bộ lệnh giám thị, đọc được lệnh của mình.
- Agent bảo mật rà `be57a9a`: rules dán được. Sửa ngay 2 lỗi mã: học sinh vào lại khi đang khóa bị kẹt nếu giáo viên mở trước khi máy bắt đầu theo dõi; chỉ tin trạng thái mở khi máy chủ xác nhận; trang quản trị không báo khóa/mở thành công khi ghi lên máy chủ thất bại hoặc không tìm thấy phiên.
- Theo báo cáo agent `bao-mat-de-thi` (mục 2–4, 7): khóa bài thi chính thức chỉ là trạng thái trình duyệt, học sinh tự thoát được (tải lại trang, lệnh giả trong localStorage); số vi phạm bị đặt lại khi mở khóa và bị nhịp tim ghi đè.
- Sửa: `exam_attempts` có `locked`, `violations` (tổng, chỉ tăng), `lockCount`; học sinh chỉ được tăng và khóa (`reportViolation()` trong rules), chỉ giáo viên mở khóa; đang khóa thì không đọc được `exam_public`; bài nộp phải khớp `violations` trên lượt thi; học sinh chỉ đọc lệnh giám thị có `targetUid` là mình hoặc `all`. Máy học sinh theo dõi lượt thi và chỉ mở khi máy chủ chuyển khóa -> mở; ôn tập giữ cách cũ.
- **Phải làm cùng lúc, ngoài giờ thi:** dán `firestore.rules` mới lên Console và push mã (mã mới với rules cũ: học sinh bị khóa không được mở; rules mới với mã cũ: nộp bài lỗi).
- Còn mở (chưa duyệt): siết `live_sessions`, chặn nộp quá giờ, chặn làm bài thay, làm tròn 1 chữ số thập phân, dọn dữ liệu học sinh trên máy dùng chung.

## 29/10/2026

- **Lỗi:** nút "VÀO LẠI TOÀN MÀN HÌNH" sau khi giám thị mở khóa và nút "Làm lại bài ôn tập" không làm gì. Nguyên nhân: bước tách mã (`095a373`) đưa hai hàm vào `useProctorCommands` nhưng hook không trả chúng ra context. Sửa: hook trả hàm, controller gộp vào `s`.
- Thêm `tests/context_contract.test.cjs` (mọi tên lấy từ context phải có trong controller) và `tests/unlock_flow.test.jsx` (khóa → lệnh mở khóa → bấm nút); cả hai báo lỗi trên mã cũ.
- Quyết định của thầy: hệ thống không tự trừ điểm vi phạm; vẫn khóa bài và lưu số lần vi phạm. Cập nhật chữ trên màn hình học sinh, trang quản trị, CSV, ảnh kết quả.
- Đưa `CLAUDE.md`, `docs/`, `.claude/agents/` vào repo.
- Chờ thầy: thử mở khóa trên một ca thật.



- Lập `CLAUDE.md`, bộ tệp trạng thái `docs/BOI_CANH.md`, `docs/LO_TRINH.md`, `docs/NHAT_KY.md` và các agent trong `.claude/agents/`.
- Trong ngày (25 commit): chuyển sang Spark và rules, Vite + React, tách mã, CI chặn lọt đề, sửa lộ webhook.
- Chờ thầy: xác nhận rules đã dán lên Console; ca thi thử trên bản Vite.
