# Nhật ký phiên làm việc

> Tệp trạng thái sống. Mỗi phiên có thay đổi đáng kể thêm một mục **ở đầu** tệp: ngày, đã làm gì (kèm commit), kết quả `npm run check`, việc còn dở, câu hỏi chờ thầy. Repo công khai: không ghi bí mật hay dữ liệu học sinh.

## 30/10/2026 (phiên 2): sửa mã LMS chỉ là số, thang điểm ôn tập 7/7.75 và lịch sử làm bài trên thẻ giám thị

- Mã LMS học sinh: chỉ gồm các chữ số (`\D` bị loại bỏ); ô nhập hỗ trợ `inputMode="numeric"`, tự lọc số ngay khi gõ và khi rời ô; thông báo yêu cầu nhập số.
- Thang điểm ôn tập: không quy đổi sang thang 10. Điểm là điểm thực của phần trắc nghiệm/khách quan:
  - Khối 8, 9: 28 câu trắc nghiệm = thang điểm 7 (tối đa 7.0 điểm). Thẻ kết quả và ảnh tải về hiển thị `X / 7`.
  - Khối 10: 19 câu trắc nghiệm (4.75đ) + 3 câu Đúng/Sai (3.0đ) = thang điểm 7.75 (tối đa 7.75 điểm). Thẻ hiển thị `X / 7.75`.
- Sửa lỗi hiển thị 1 thẻ giám sát admin:
  - Trước đây gộp thẻ chỉ theo `khối|mã LMS`, dẫn tới khi học sinh chưa có mã hoặc trùng mã thì bị gộp hết thành 1 thẻ duy nhất. Nay chỉ gộp khi trùng cả `khối + mã LMS + họ tên`, nếu khác họ tên thì giữ riêng từng thẻ; giữ phiên qua `sessionStorage` để mỗi tab có mã phiên riêng.
  - Bổ sung khối "Lịch sử làm bài" trực tiếp trên từng thẻ học sinh: thống kê số lần đã ôn tập, điểm và thời gian của từng lần (lần 1, 2, 3...) hoặc lịch sử thi chính thức.
- Kết quả `npm run check`: toàn bộ 46 test logic (+ 3 test private bỏ qua), 25 test vitest, lint, build và chặn lọt đề đều đạt 100%.

## 29/10/2026 (phiên 3): thầy thử trên trang thật

Thầy thử ở chế độ **ôn tập** (Firestore không có lượt thi/bài nộp chính thức). Sửa:
- Ôn tập: khóa 3 lần lưu trên máy theo mã LMS + khối, tải lại trang vẫn khóa chờ giám thị; nộp bài thì xóa khóa. Kết quả ôn tập ghi tổng vi phạm (không đặt lại khi mở khóa).
- Mỗi máy một phiên giám sát (`sess-<uid>`); bảng giám sát chỉ hiện thẻ mới nhất mỗi mã LMS. Thẻ "đang khóa" theo cờ khóa thật, không theo số vi phạm.
- Bỏ nút mở khóa trùng; bỏ hộp thông báo "đã mở khóa" đè lên nút "VÀO LẠI".
- Lệnh giám thị: bỏ qua lệnh cũ hơn lúc mở phiên (hết cộng +5 phút lặp lại); thu bài dùng bài làm mới nhất, ôn tập gọi nộp ôn tập.
- Hết giờ ôn tập không nộp hai lần; màn hình khóa / cảnh báo vi phạm không đè lên trang kết quả.
- Bố cục: khung trang `max-w-7xl`; trang kết quả hai cột trên màn hình rộng (thẻ kết quả 620 px cố định khi cuộn, xem lại bài bên phải).
- Có 190 phiên giám sát cũ trên Firestore: thầy dùng nút "Dọn thí sinh hết ca".

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
