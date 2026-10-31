# Đánh giá agents AHS-LMS — 29/10/2026

## Phạm vi và bằng chứng

Rà hồ sơ agents, `CLAUDE.md`, tài liệu trạng thái, `package.json`, workflow Pages, cấu trúc `src/`, test hiện có, rules và script kiểm build. Đây là đánh giá tổ chức triển khai dựa trên repository, không phải kết luận audit bảo mật đầy đủ hoặc chứng nhận hệ thống đang chạy. Không truy cập dữ liệu thật, không kiểm tra Console.

## Agents hiện có trước đợt rà soát

| Agent | Điểm phù hợp | Khoảng trống | Hướng xử lý |
|---|---|---|---|
| `bao-mat-de-thi` | Đúng mô hình Spark, kiểm collection và build, chỉ đọc | Chưa có cổng test rules bằng emulator; regex chống lộ đề chỉ bắt một số dạng | Giữ; yêu cầu nêu giới hạn bằng chứng và kiểm deny/allow ở giai đoạn 1 |
| `kiem-thu` | Có lint, Node, Vitest, build, kiểm context | Thang 10 bị áp chung; làm tròn 1 chữ số khác backlog; cùng commit chưa bảo đảm cùng nguồn; kết luận “được push” quá rộng | Đã sửa hồ sơ để phân biệt ôn tập/chính thức và quyền phát hành |
| `lms-platform-dev` (workspace) | Nắm kiến trúc toàn nền tảng | Ôm giao diện, bảo mật, test và phát hành | Giữ làm đầu mối core/rules; tách thực thi UI và reviewer |
| `exam-specialist` (workspace) | Nắm ma trận, nội dung, barem 3 khối | Chưa có hợp đồng chuyển gói đã duyệt sang LMS | Phối hợp agent tích hợp đề; không tự trộn lại gói đã duyệt |
| `student-records-auditor` (workspace) | Chuẩn hóa LMS, điểm cao nhất, tổng lượt | Cần phân biệt khóa bảng điểm và khóa thẻ giám sát | Là reviewer nghiệp vụ giai đoạn 3 |
| `pedagogy-officer` (workspace) | Phù hợp học liệu/phản hồi | Không cần cho mọi thay đổi phần mềm | Chỉ tham gia khi đổi nội dung hoặc cách phản hồi |

Không sửa bốn hồ sơ workspace vì chúng còn phục vụ các dự án khác. Bổ sung phân công riêng tại `AGENTS.md` của dự án.

## Những điểm cần ưu tiên

1. `docs/LO_TRINH.md` mục “Cần thầy xác nhận ngay” vừa ghi đã dán rules, vừa hỏi đã dán chưa. Cần gắn trạng thái với phiên bản cụ thể; repo không chứng minh được phiên bản Console.
2. `docs/BOI_CANH.md` và `docs/NHAT_KY.md` có mục ngày 30/10/2026 trong phiên rà soát ngày 29/10/2026. Giữ lịch sử, xác minh thời điểm trước khi chỉnh; không dùng thứ tự ngày làm căn cứ duy nhất.
3. Lộ trình còn nhắc “phạt vi phạm” trong bước đối chiếu chấm, trong khi `CLAUDE.md` đã ghi không tự trừ điểm. Kế hoạch giữ vi phạm như dữ liệu giám sát, không trừ điểm.
4. `src/core/storage-service.js` có 1269 dòng, `firebase-config.js` 684 dòng; controller học sinh 415 dòng và quản trị 456 dòng. Đây là vùng dễ xung đột khi nhiều agent sửa; ưu tiên một chủ sở hữu, chỉ tách module khi nhiệm vụ cụ thể cần.
5. `firestore.rules` phần `live_sessions` cho chủ uid tạo/cập nhật; chưa thấy allowlist trường như `exam_attempts`. Cần audit và test trường thừa/kích thước, chưa kết luận đã chứng minh khai thác.
6. `package.json` chưa khai báo Firebase rules testing/emulator. Test Node/Vitest hiện có không thay thế bằng chứng phân quyền thực thi.
7. `scripts/kiem_tra_ban_build.cjs` dùng mẫu regex nhận diện gói đề. Script đạt không chứng minh mọi dạng đáp án/bí mật đều không lọt; cần fixture âm/dương và review bổ sung.
8. Workflow `.github/workflows/deploy.yml` phát hành Pages sau push `main`, không triển khai rules. Đổi client và rules phụ thuộc nhau cần kế hoạch cặp phiên bản tương thích.

## Kết quả thiết lập

Thêm năm hồ sơ: điều phối, học sinh, quản trị, tích hợp đề và phát hành. Giữ hai reviewer sẵn có; cập nhật hướng dẫn `kiem-thu`. `AGENTS.md` nối các hồ sơ cho Codex và Claude Code, không giả định Markdown tự tạo runtime agent.

## Giới hạn

Chưa chạy trọn `npm run check` trên checkout này (không có `node_modules` tại dự án). Worktree ngoài Drive có dependency nhưng chưa xác minh cùng nội dung; không mượn kết quả của bản khác để tuyên bố đạt. Kiểm tra Node được chạy riêng và kết quả ghi tại nhật ký. Chưa diễn tập trình duyệt, emulator, tải đồng thời hoặc phát hành.
