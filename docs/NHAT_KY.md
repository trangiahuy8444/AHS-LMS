# Nhật ký phiên làm việc

> Tệp trạng thái sống. Mỗi phiên có thay đổi đáng kể thêm một mục **ở đầu** tệp: ngày, đã làm gì (kèm commit), kết quả `npm run check`, việc còn dở, câu hỏi chờ thầy. Repo công khai: không ghi bí mật hay dữ liệu học sinh.

## 29/10/2026

- **Lỗi:** nút "VÀO LẠI TOÀN MÀN HÌNH" sau khi giám thị mở khóa và nút "Làm lại bài ôn tập" không làm gì. Nguyên nhân: bước tách mã (`095a373`) đưa hai hàm vào `useProctorCommands` nhưng hook không trả chúng ra context. Sửa: hook trả hàm, controller gộp vào `s`.
- Thêm `tests/context_contract.test.cjs` (mọi tên lấy từ context phải có trong controller) và `tests/unlock_flow.test.jsx` (khóa → lệnh mở khóa → bấm nút); cả hai báo lỗi trên mã cũ.
- Quyết định của thầy: hệ thống không tự trừ điểm vi phạm; vẫn khóa bài và lưu số lần vi phạm. Cập nhật chữ trên màn hình học sinh, trang quản trị, CSV, ảnh kết quả.
- Đưa `CLAUDE.md`, `docs/`, `.claude/agents/` vào repo.
- Chờ thầy: thử mở khóa trên một ca thật.



- Lập `CLAUDE.md`, bộ tệp trạng thái `docs/BOI_CANH.md`, `docs/LO_TRINH.md`, `docs/NHAT_KY.md` và các agent trong `.claude/agents/`.
- Trong ngày (25 commit): chuyển sang Spark và rules, Vite + React, tách mã, CI chặn lọt đề, sửa lộ webhook.
- Chờ thầy: xác nhận rules đã dán lên Console; ca thi thử trên bản Vite.
