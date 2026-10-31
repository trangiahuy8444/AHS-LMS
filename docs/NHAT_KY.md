# Nhật ký phiên làm việc

> Tệp trạng thái sống. Mỗi phiên có thay đổi đáng kể thêm một mục **ở đầu** tệp: ngày, đã làm gì (kèm commit), kết quả `npm run check`, việc còn dở, câu hỏi chờ thầy. Repo công khai: không ghi bí mật hay dữ liệu học sinh.


## 31/10/2026 — Phát hành web thật và rules

- Theo yêu cầu giáo viên, phát hành bản `b9314f5` lên GitHub Pages, giữ các thay đổi đã có trên `main` (`b0a71f4`). Hai checkpoint nguồn được đưa vào bản phát hành: `c1be6d5`, `099dc21`.
- Cài sạch Node22.23.4;94 Node đạt/3 kiểm private bỏ qua,78 Vitest và16 rules emulator đạt; lint/build/chặn lọt đề đạt. Các file src/tests/rules khớp bản đã duyệt.
- [GitHub Actions41163804059](https://github.com/trangiahuy8444/AHS-LMS/actions/runs/41163804059) build/deploy thành công.
- Publish rules qua Console lúc10:21 giờ Việt Nam; bản đã xuất bản khớp hash chuẩn hóa của nguồn đã kiểm. Sao lưu rules cũ và biên bản trong private, không đưa vào repo.
- Đối chiếu trang gốc/test/admin:HTTP200; toàn bộ asset tham chiếu khớp build, giao diện học sinh đã cập nhật.
- Không sửa kho đề, bài nộp hoặc điểm. Cần tải lại máy trước ca và diễn tập chính thức; chưa thực hiện ca thi thật trong phiên này.

## 30/10/2026: chốt nguồn chuẩn Giữa HK1 và kiểm sạch Node22

- Giáo viên xác nhận bộ chuẩn tại thư mục gửi Ms.Tuyến, chưa có CK1. Đã đối chiếu348 câu/12 mã, thứ tự phương án, đáp án và36 barem theo câu: khớp. Không sửa nội dung đề đã duyệt.
- Tạo3 gói upload riêng tư và biên bản hash nguồn/gói; chưa upload.
- Kiểm bộ thật phát hiện converter chưa hỗ trợ context/points mặc định của TF và context tự luận10. Đã sửa; bổ sung renderer tự luận để hiện question của8/9 (trước đây chỉ đọc context).
- Kiểm cuối trên cài sạch Node22.23.4:80 Node không skip,67 Vitest,12 rules emulator đạt; lint/build/kiểm lọt đề đạt. Browser local12 mã hiện ngữ cảnh/tự luận, không lỗi; cloud stub/chặn mạng ngoài.
- Chưa phát hành thật/Console. Chi tiết tại DOI_CHIEU_GIUA_HK1.md và THUC_THI_AGENTS.md.

## 30/10/2026: triển khai agents theo giai đoạn G0–G5 (phần mã và kiểm tự động)

- Nhánh dự án: `codex/agents-staged-rollout`. Các thay đổi đã được đối chiếu SHA-256 trước khi đồng bộ từ snapshot cô lập ngoài Drive; không ghi đè thay đổi mới của người dùng.
- G1: chặn retake khi khóa, giới hạn schema live, tương thích trường thừa legacy; có rules emulator demo tách khỏi project thật và bước kiểm trong CI.
- G2: server-confirmed submit, retry không ghi đè, sessionId, draft đúng identity sau reload, hai timer dùng bài mới nhất, mở khóa không báo thành công giả.
- G3: schema lượt phẳng/cấp lượt sau nộp, lịch sử đúng identity, nhãn thang7/7.75; xác nhận lại retention21/cảnh báo14 và cách làm tròn hiện có, không bắt buộc roster.
- G4: công cụ chuyển native hoặc bốn export ngân hàng đã khóa, kiểm approved_hash/hoán vị/checksum, chỉ ghi private; chưa chuyển gói CK1 thật.
- G5: runbook phát hành/khôi phục và browser local ba trang, nộp ôn tập ba khối; toàn bộ kết nối ngoài localhost bị chặn trong diễn tập.
- Kiểm cuối: `npm run check` đạt (77 Node: 74 đạt, 3 skip thiếu gói private; 65 Vitest đạt; lint/build/kiểm lọt đề đạt). `npm run test:rules`: 12/12 đạt. `git diff --check` đạt. Node local v26.7.0; CI Node22 chưa được xác minh thực thi.
- Review G1–G3 có agent bảo mật độc lập; G4 agent chính rà soát bổ sung sau khi lượt subagent bị giới hạn sử dụng, sửa thêm chẩn đoán JSON không in nội dung đề qua test RED→GREEN.
- Chưa commit/push/deploy, chưa áp rules Console, chưa chỉnh/xóa dữ liệu thật. Gói CK1, diễn tập chính thức và đối soát sau kỳ thi còn trong backlog, không coi toàn bộ kế hoạch đã hoàn tất.

## 29/10/2026: rà soát agents và lập kế hoạch giai đoạn

- Đánh giá 2 agent dự án và 4 agent workspace; tạo `AGENTS.md`, 5 hồ sơ vai trò mới, `docs/DANH_GIA_AGENTS.md` và kế hoạch `docs/superpowers/plans/2026-10-29-trien-khai-agents.md`.
- Cập nhật `kiem-thu`: phân biệt thang ôn tập/chính thức, giữ làm tròn là việc chờ chốt, xác minh cả nội dung chưa commit và không tự cấp phép push.
- Nối tài liệu từ `CLAUDE.md` và backlog; giữ nguyên trạng thái nghiệm thu cũ. Chưa commit/push, chưa đổi logic/rules hoặc dữ liệu thật.
- Chạy `node --test tests/*.cjs`: 50 test, 49 đạt, 1 lỗi `Cannot find module 'vite'` ở kiểm cú pháp JSX; checkout Drive chưa có node_modules. Chưa chạy toàn bộ `npm run check`, Vitest, build hoặc diễn tập. Node môi trường hiện tại: v26.7.0; CI dùng Node 22.
- Kế hoạch mới là đề xuất phân công, chưa triển khai các giai đoạn phần mềm. Cần G0 xác minh phiên bản rules Console, mốc ngày lịch sử, chính sách làm tròn và nguồn chuẩn giữa các checkout.

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

## 30/10/2026 — Giữ giờ gia hạn, nhận bài muộn có đánh dấu

- Đã lưu checkpoint `c1be6d5` cho agents, bảo mật, cổng học sinh/quản trị và đối chiếu gói Giữa HK1; chưa push/deploy.
- Theo quyết định giáo viên, bài muộn vẫn nhận, không tự trừ điểm; nhãn muộn và số giây trễ có trên bảng bài nộp/CSV, dựa vào mốc máy chủ.
- Giờ giám thị cộng được lưu trên lượt thi, khôi phục sau reload; không cộng lặp khi nhiều tab hoặc snapshot lặp; lượt thi lại reset gia hạn.
- Bài cũ thiếu thời lượng không suy từ cấu hình mới để kết luận muộn.
- Kiểm sạch Node22:97 Node +78 Vitest +16 rules đạt; lint/build/chặn lọt đề đạt. Review bảo mật phần timing không thấy blocker.
- Chỉ thao tác mã và giả lập/cục bộ, không sửa bài nộp/điểm hay Firebase thật.
