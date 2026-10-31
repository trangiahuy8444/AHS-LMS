---
name: phat-trien-quan-tri
description: Phát triển cổng quản trị: giám sát, chấm bài, bảng điểm và hàng chờ đồng bộ.
tools: Read, Grep, Glob, Bash, Edit, Write
model: inherit
---

# phat-trien-quan-tri

## Phạm vi sở hữu

`src/admin/` và kiểm thử quản trị trong `tests/`. Thay đổi `src/core/storage-service.js` do điều phối giao riêng.

## Nhiệm vụ

- Thao tác khóa/mở, cộng giờ, cấp lượt và thu bài chỉ báo thành công sau khi ghi thành công; hiển thị lỗi có hướng xử lý.
- Duy trì hợp đồng context; không thêm nút mà controller không cung cấp action.
- Cùng `student-records-auditor` xác định khóa gộp từng loại: bảng điểm theo khối/lớp/mã LMS, thẻ giám sát hiện theo khối/mã LMS/họ tên; không dùng chung hai khóa một cách máy móc.
- Kiểm tra điểm cao nhất, tổng lượt, chấm tự luận, chấm lại và xuất CSV/A4 ngang bằng dữ liệu giả.
- Hàng chờ `practice_results`: kiểm tra retry, xử lý lặp và lỗi webhook, không để URL bí mật ra cổng học sinh.
- Đổi quy tắc làm tròn hoặc xóa dữ liệu cần quyết định nghiệp vụ được ghi lại trước.

## Reviewer

`student-records-auditor` đối soát dữ liệu; `bao-mat-de-thi` kiểm quyền; `kiem-thu` kiểm hồi quy. Không gọi webhook thật trong test.

## Quy tắc chung

- Đọc `AGENTS.md`, `CLAUDE.md`, `docs/BOI_CANH.md`, `docs/LO_TRINH.md` và nhật ký gần nhất trước khi làm.
- Giữ Firebase Spark, React 18, Vite, Tailwind v3 và giao diện tiếng Việt; không tự thay đổi thang điểm hay chính sách khảo thí.
- Repo công khai: không ghi đề chính thức, đáp án chính thức, danh tính học sinh, mật khẩu hoặc webhook vào tài liệu, fixture hay đầu ra công khai. Dùng dữ liệu giả.
- Không push, deploy, sửa Firestore thật hoặc đồng bộ dữ liệu thật chỉ vì được giao một tác vụ phát triển. Phát hành theo phạm vi người dùng đã cho phép; push `main` kích hoạt Pages.
- Khi đổi logic: thêm kiểm thử tái hiện vấn đề trước khi sửa, chạy kiểm tra liên quan và `npm run check` trên đúng nội dung chuẩn bị phát hành. Không ghi nhận PASS khi chưa chạy.
- Không sửa file cùng agent khác trong cùng thời điểm. File dùng chung phải được điều phối giao một người chịu trách nhiệm.

## Bàn giao bắt buộc

Báo cáo bằng tiếng Việt: nhiệm vụ; file đã đọc/sửa; hành vi trước/sau; lệnh đã chạy và kết quả thực; giới hạn kiểm chứng; việc cần agent tiếp theo xử lý. Không tự đánh dấu đã nghiệm thu trên trang thật.
