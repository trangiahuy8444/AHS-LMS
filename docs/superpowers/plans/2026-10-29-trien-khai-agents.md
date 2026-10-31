# Kế hoạch áp dụng agents theo giai đoạn — AHS-LMS

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Đây là kế hoạch phân công; chưa phải lệnh triển khai toàn bộ thay đổi phần mềm.

**Goal:** Có quy trình triển khai và kiểm duyệt rõ người, đúng phạm vi, đủ bằng chứng trước kỳ thi CK1.

**Architecture:** Giữ mô hình Spark và chấm chính thức ở cổng giáo viên. Điều phối giao core/rules cho `lms-platform-dev`; hai nhóm UI dùng giao kèo chung; bảo mật và kiểm thử duyệt bản tích hợp. Chỉ chia việc song song khi không sửa chung file.

**Tech Stack:** React 18.3.1, Vite, Tailwind v3, Firebase Auth/Firestore Spark, Node >=22.12, Node test, Vitest, GitHub Pages.

**Spec:** `../../DANH_GIA_AGENTS.md`, `../../BOI_CANH.md`, `../../../AGENTS.md`. Trạng thái công việc chỉ cập nhật ở `../../LO_TRINH.md`.

## Cập nhật khi thực thi 30/10/2026

Giáo viên xác nhận làm tròn và thời hạn lưu đã được triển khai; giữ hiện trạng, không yêu cầu chốt lại. Không bắt buộc roster trước ca thi. Bằng chứng và các ngoại lệ khi thực thi nằm tại `../../THUC_THI_AGENTS.md`; trạng thái chỉ theo `../../LO_TRINH.md`. Các giai đoạn G1–G4 có phần mã và test đã thực hiện; các bước cần gói CK1, Console và ca thi thật chưa được coi là hoàn tất.

## Xác nhận nguồn 30/10/2026

Nguồn thực thi hiện tại là bộ Giữa HK1 gửi Ms.Tuyến theo chỉ định giáo viên. CK1 chưa có, các bước về CK1 trong kế hoạch gốc là mốc tương lai. G4 nghiệm thu bằng bộ Giữa HK1 đã đối chiếu; không tạo đề mới để lấp phần chưa có.

## Global Constraints

- Giữ dịch vụ miễn phí; không Blaze/Cloud Functions.
- Không đưa đề chính thức, đáp án, dữ liệu cá nhân hay bí mật vào repo công khai.
- Ôn tập: tự luận không bắt buộc, không chấm; khối 8/9 thang 7, khối 10 thang 7.75. Không tự trừ điểm vi phạm.
- Chưa tự quyết định chính sách làm tròn, roster hoặc thời hạn lưu/xóa.
- Push `main` phát hành Pages; rules cập nhật riêng. Không xóa dữ liệu thật hoặc phát hành trong tác vụ lập kế hoạch này.
- Chạy test ở bản có dependency ngoài Drive sau khi xác minh nội dung; không đồng bộ đè thay đổi đang có.

## Review Focus

- Tải lại khi khóa và lệnh mở khóa đến sớm/lặp: chỉ mở theo trạng thái được phép.
- Mất mạng hoặc nộp đồng thời: bài còn khôi phục được, không tăng lượt/điểm do ghi trùng.
- Trùng LMS nhưng khác lớp/tên: bảng điểm và thẻ giám sát dùng đúng khóa riêng.
- Gói đề sai schema hoặc lẫn đáp án: từ chối đầu vào không hợp lệ, không lộ đề trong build.
- Client/rules lệch phiên bản: không mở ca thi trước khi xác nhận tương thích.

## Bản đồ sở hữu

| Khu vực | Thực hiện | Duyệt |
|---|---|---|
| `src/core/`, `firestore.rules` | `lms-platform-dev` | `bao-mat-de-thi` + `kiem-thu` |
| `src/student/` | `phat-trien-hoc-sinh` | `kiem-thu` |
| `src/admin/` | `phat-trien-quan-tri` | `student-records-auditor` + `kiem-thu` |
| Công cụ/gói đề | `tich-hop-ngan-hang-de` | `exam-specialist` + bảo mật |
| Workflow, kế hoạch rules, diễn tập | `van-hanh-phat-hanh` | Điều phối + giáo viên |
| Tài liệu trạng thái | `dieu-phoi-du-an` | Chủ nhiệm vụ xác minh bằng chứng |

## Giai đoạn 0 — Chốt đường cơ sở và phân công

**Chủ trì:** điều phối. **Phụ thuộc:** không. **File:** `AGENTS.md`, `CLAUDE.md`, `docs/BOI_CANH.md`, `docs/LO_TRINH.md`, `docs/NHAT_KY.md`.

- [ ] Ghi checkout, commit, diff, file chưa theo dõi; so cả nguồn và cấu hình với worktree ngoài Drive.
- [ ] Chạy `npm run check`, lưu số test đạt/bỏ qua/lỗi và bản nguồn đã kiểm, không dùng số cũ trong nhật ký.
- [ ] Hòa giải ngày lịch sử, phiên bản rules đã áp dụng và mục “phạt vi phạm”; ghi mục nào cần giáo viên xác minh.
- [ ] Với làm tròn, roster, giữ/xóa dữ liệu: ghi lựa chọn và tác động; chỉ triển khai khi có quyết định tương ứng.

**Đầu ra/cổng qua:** báo cáo baseline có nguồn và kết quả, backlog có chủ việc. Không bắt đầu sửa rules khi chưa có snapshot nguồn rõ ràng.

## Giai đoạn 1 — Ràng buộc bảo mật máy chủ

**Chủ trì:** `lms-platform-dev`. **Reviewer:** bảo mật + kiểm thử. **Phụ thuộc:** G0. **File:** `firestore.rules`, `src/core/firebase-config.js`, `package.json`, `package-lock.json`, `firebase.json`; tạo `tests/firestore_rules.test.cjs` nếu triển khai emulator.

- [ ] Bảo mật lập ma trận allow/deny cho từng collection với teacher, owner, uid khác và chưa đăng nhập.
- [ ] Viết test phủ đọc đề khác mã, ghi điểm giả, retake khi khóa, takeover, `live_sessions` trường thừa/kích thước và nộp quá giờ. Các chính sách mới phải được chốt trước khi viết expected result.
- [ ] Thiết lập chạy rules test trên emulator cục bộ, project thử riêng; không dùng endpoint thật. Ghi dependency và lệnh chạy tái lập trong package scripts.
- [ ] Chứng minh test hồi quy thất bại trên hành vi lỗi, sửa tối thiểu, chạy lại ma trận và `npm run check`.
- [ ] Bàn giao giao kèo trường trạng thái/giờ cho hai agent UI; agent phát hành ghi rõ mã/rules phải cập nhật cùng đợt hay tương thích ngược.

**Đầu ra/cổng qua:** ma trận quyền, bằng chứng emulator và diff được review; không coi regex hay test mã nguồn là thay thế kiểm quyền thực thi.

## Giai đoạn 2 — Khôi phục phiên và nộp bài bền vững

**Chủ trì:** học sinh; quản trị nhận việc UI giám thị độc lập sau khi chốt giao kèo G1. **File:** `src/student/actions/{startActions,examSubmitActions,practiceSubmitActions}.js`, `src/student/hooks/useProctorCommands.js`, `src/admin/actions/proctorActions.js`; core chỉ do đầu mối sửa. **Test:** `tests/unlock_flow.test.jsx`, `tests/verify_platform.test.cjs`, `tests/context_contract.test.cjs`.

- [ ] Thêm test khóa → reload → mở khóa; mở khóa trước lúc subscribe; lệnh cũ/lặp không cộng giờ hai lần.
- [ ] Thêm test mất mạng lúc nộp, retry cùng bài, hết giờ đồng thời thu bài; bài chưa gửi vẫn còn khôi phục được.
- [ ] Sửa từng luồng nhỏ; kiểm thao tác quản trị không báo thành công khi ghi thất bại.
- [ ] Kiểm dữ liệu còn lại trên máy chung với bài đã nộp/chưa nộp; chỉ áp dụng chính sách xóa đã thống nhất.
- [ ] Chạy test liên quan rồi `npm run check`; reviewer đánh giá lại bản tích hợp.

**Đầu ra/cổng qua:** kịch bản tái hiện và hồi quy đạt; chưa tuyên bố diễn tập thật nếu mới mock.

## Giai đoạn 3 — Chấm bài và đối soát bảng điểm

**Chủ trì:** quản trị; auditor duyệt nghiệp vụ. **Phụ thuộc:** G2; chuẩn bị bộ giả có thể từ G0. **File:** `src/admin/actions/{gradingActions,exportActions}.js`, `src/admin/tabs/{PrintTab,SubmissionsTab}.jsx`, `src/core/{storage-service,normalize,exam-package}.js`; `tests/practice_scoring.test.jsx`, `tests/exam_package.test.cjs`, `tests/verify_platform.test.cjs`.

- [ ] Lập bộ bài giả có điểm kỳ vọng chấm tay: Đ/S đủ 0–4 ý đúng, tự luận, nhiều lượt, trùng mã khác lớp/tên.
- [ ] Test thang 7/7.75 của ôn tập, tự luận rỗng và không tính điểm, không trừ điểm vi phạm; chính thức theo gói duyệt. Chỉ thêm test làm tròn mới sau quyết định.
- [ ] Đối soát khóa bảng điểm với khóa thẻ giám sát; test điểm cao nhất và tổng lượt không mất khi retry/chấm lại.
- [ ] Kiểm CSV tiếng Việt, bản in A4 ngang và hàng chờ đồng bộ bằng endpoint giả.
- [ ] Chạy bộ kiểm tra, auditor xác nhận bảng kỳ vọng/đầu ra, không dùng dữ liệu học sinh thật làm fixture.

**Đầu ra/cổng qua:** bảng đối soát không sai lệch và minh chứng in; không sửa điểm thật trong quá trình kiểm thử.

## Giai đoạn 4 — Chuẩn bị gói đề CK1

**Chủ trì:** tích hợp đề; `exam-specialist` duyệt. **Phụ thuộc:** giao kèo schema G0; tích hợp sau G3. **File:** tạo `scripts/chuyen_goi_de_lms.cjs`, `tests/chuyen_goi_de_lms.test.cjs`; đọc bộ nạp hiện có; chỉ sửa `data/questions_grade{8,9,10}.js` với đề cương được phép công khai.

- [ ] Đọc schema nguồn từ ngân hàng đề và schema đích hiện có; lập bảng ánh xạ trường và điểm trước khi viết bộ chuyển đổi.
- [ ] Tạo fixture giả đủ khối/mã đề; test mã thiếu/trùng, đáp án sai miền, tổng điểm sai và gói bị đổi nội dung.
- [ ] Viết chuyển đổi có chế độ kiểm tra không ghi; chỉ ghi gói chính thức vào vùng riêng tư được gitignore.
- [ ] Đối chiếu mã câu, mã đề, barem và fingerprint nội dung chuẩn hóa; không xáo lại gói đã duyệt.
- [ ] Chạy check build, reviewer bảo mật rà đầu ra; giáo viên upload qua cấu hình theo kế hoạch vận hành.

**Đầu ra/cổng qua:** biên bản xác nhận gói và kết quả chấm mẫu; không đưa đề thật vào biên bản công khai.

## Giai đoạn 5 — Diễn tập và phát hành

**Chủ trì:** phát hành; kiểm thử/bảo mật báo cáo độc lập. **Phụ thuộc:** G1–G4. **File:** workflow hiện có, tạo `docs/VAN_HANH_PHAT_HANH.md`, cập nhật backlog và nhật ký.

- [ ] Chốt nguồn phát hành, chạy lại `npm run check` và rules test trên đúng bản tích hợp; liệt kê mọi skip/giới hạn.
- [ ] Chuẩn bị cặp phiên bản mã/rules, thời điểm ngoài ca thi, thứ tự cập nhật và phương án khôi phục; bảo toàn bài đã gửi/chưa gửi.
- [ ] Diễn tập dữ liệu giả: vào đúng mã và lượt, reload khi khóa, mở khóa, mất mạng, nộp lại, cộng giờ, thu bài, chấm và in. Ghi rõ môi trường và người xác nhận.
- [ ] Chỉ publish/push trong phạm vi người dùng cho phép; giáo viên xác nhận rules Console, CI Pages và thao tác trên trang thật.
- [ ] Ghi phiên bản đã phát hành và nghiệm thu vào backlog. Nếu lỗi: dừng mở ca mới, bảo toàn dữ liệu, khôi phục theo cặp tương thích.

**Đầu ra/cổng qua:** CI đạt, rules đúng phiên bản và giáo viên xác nhận diễn tập. Chỉ đạt test tự động thì trạng thái vẫn là chờ nghiệm thu.

## Giai đoạn 6 — Sau CK1

**Chủ trì:** auditor + quản trị, sư phạm khi đổi phản hồi. **Phụ thuộc:** chốt điểm và chính sách dữ liệu được duyệt.

- [ ] Đối soát điểm cuối, sao lưu riêng tư, thực hiện giữ/xóa theo chính sách; không tự suy ra thời hạn pháp lý.
- [ ] Nếu giáo viên duyệt phân tích câu hỏi: dùng mã câu ổn định, dữ liệu tổng hợp, không xuất thông tin định danh về ngân hàng đề.
- [ ] Tổng kết lỗi và điều chỉnh hồ sơ agent dựa trên bằng chứng kỳ thi.

## Cách giao một nhiệm vụ

Mẫu: “Đọc AGENTS.md và hồ sơ vai trò. Mục tiêu: [hành vi]. Chỉ sửa [file]. Đầu vào: [giao kèo/phiên bản]. Chứng minh bằng [test/kịch bản]. Bàn giao cho [reviewer]; báo phần chưa kiểm chứng. Không truy cập dữ liệu thật.” Điều phối phải điền đủ trường trước khi giao, không truyền toàn bộ roadmap như một nhiệm vụ khổng lồ.

## Rà soát kế hoạch

Mỗi giai đoạn có chủ trì, phụ thuộc, file, đầu ra và cổng qua. Năm nhóm rủi ro trong Review Focus được phân cho G1–G5. G0 phải giải quyết phần chưa rõ trước khi agent triển khai viết chi tiết thuật toán và expected result; kế hoạch này không tự quyết định các nghiệp vụ còn chờ giáo viên.
