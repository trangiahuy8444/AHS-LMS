# Hướng dẫn agents — on-tap-kiem-tra-web

Áp dụng cùng quy tắc workspace cha. Đọc `CLAUDE.md` và ba tệp trạng thái trong `docs/` trước khi làm. Hồ sơ dưới `.claude/agents/` là hướng dẫn vai trò dùng chung; metadata dành cho Claude Code, không tự đăng ký agent vào Codex. Khi dùng công cụ subagent của Codex, truyền đường dẫn hồ sơ và nhiệm vụ cụ thể.

## Phân công

| Vai trò | Hồ sơ | Quyền chính |
|---|---|---|
| Điều phối | [.claude/agents/dieu-phoi-du-an.md](.claude/agents/dieu-phoi-du-an.md) | Backlog, phụ thuộc, bằng chứng |
| Học sinh | [.claude/agents/phat-trien-hoc-sinh.md](.claude/agents/phat-trien-hoc-sinh.md) | `src/student/` |
| Quản trị | [.claude/agents/phat-trien-quan-tri.md](.claude/agents/phat-trien-quan-tri.md) | `src/admin/` |
| Tích hợp đề | [.claude/agents/tich-hop-ngan-hang-de.md](.claude/agents/tich-hop-ngan-hang-de.md) | Bộ chuyển đổi, kiểm cấu trúc |
| Bảo mật | [.claude/agents/bao-mat-de-thi.md](.claude/agents/bao-mat-de-thi.md) | Chỉ đọc, kiểm quyền và chống lộ đề |
| Kiểm thử | [.claude/agents/kiem-thu.md](.claude/agents/kiem-thu.md) | Chạy kiểm tra, báo cáo; không sửa logic |
| Phát hành | [.claude/agents/van-hanh-phat-hanh.md](.claude/agents/van-hanh-phat-hanh.md) | Chuẩn bị triển khai, diễn tập, khôi phục |

Bốn agent workspace giữ nguyên: `lms-platform-dev` làm đầu mối kiến trúc/core/rules; `exam-specialist` duyệt nội dung; `student-records-auditor` đối soát điểm; `pedagogy-officer` tham gia khi đổi nội dung/phản hồi học tập. Hồ sơ nằm tại `../.agents/agents/`.

## Cách phối hợp

- Điều phối giao từng nhiệm vụ nhỏ có phạm vi file và tiêu chí nghiệm thu. Không mặc định gọi toàn bộ agent.
- Cổng học sinh và quản trị có thể làm song song khi không sửa file chung. `src/core/`, rules, CSS chung, package và cấu hình build chỉ có một người sửa tại một thời điểm.
- Người viết không tự duyệt cuối. Kiểm thử và bảo mật đánh giá lại bản tích hợp trước phát hành.
- Phân biệt thang ôn tập 7/7.75 với thang thi chính thức; không tự trừ điểm vi phạm. Giữ cách làm tròn và thời hạn lưu đã triển khai theo xác nhận giáo viên; không bắt buộc roster.
- Chỉ có `docs/LO_TRINH.md` theo dõi trạng thái công việc; kế hoạch chi tiết mô tả cách làm, không thay thế backlog.
- Không đưa dữ liệu cá nhân, đề thật hoặc bí mật vào hồ sơ agent, log và fixture. Không chạy test ghi lên Firebase/webhook thật.
- Push `main` là phát hành thật; sửa rules trong repo chưa chứng minh rules trên Console đã đổi.

## Tài liệu đánh giá và kế hoạch

- [Đánh giá agents](docs/DANH_GIA_AGENTS.md)
- [Kế hoạch từng giai đoạn](docs/superpowers/plans/2026-10-29-trien-khai-agents.md)
