# Sổ thực thi agents — kế hoạch 2026-10-29

## Đường cơ sở

- Nguồn Drive: commit `7b23e242d98719cc850911a960640b3e6cd944dd` cùng các hồ sơ Markdown chưa commit của phiên trước.
- Bản Developer: commit `2c03516467b9835c88701524d88ae49d1b6455d2`; so SHA-256 từng file cho thấy mã nguồn, rules, package và test giống bản Drive. Khác các tài liệu agent và script phụ bị gitignore.
- Công cụ tạo worktree của app không chấp nhận repo con; Git worktree fallback thất bại `mmap failed: Operation canceled` khi đọc object trên Drive. Không dùng checkout dở.
- Ruling: tạo snapshot cô lập ngoài Drive, Git riêng ở `/private/tmp/ahs-rollout-src`, sao đúng file hiện tại, không sao private, không ghi vào repo Developer. Có manifest SHA-256 trước sửa ở `/private/tmp/ahs-baseline-manifest.json`; khi trả kết quả về Drive phải kiểm tra hash file gốc chưa đổi trước khi ghi.
- Dependency: dùng package đã cài tại Developer qua liên kết, thư mục cache Vite riêng ở snapshot. Không cài node_modules vào Drive.
- `npm run check`: lint đạt; Node 50 test, 47 đạt/3 skip do không sao đề private; Vitest 25/25 đạt; build đạt; kiểm lọt đề đạt. Node thực thi v26.7.0, CI Node 22 chưa được chạy trong phiên này.
- Cảnh báo build: chunk dùng chung lớn hơn 500 kB; chưa phải lỗi kiểm tra.

## Quyết định phạm vi

- Theo xác nhận của giáo viên: giữ cách làm tròn đã triển khai, retention 21 ngày/cảnh báo14 và quy trình dọn thủ công; không bắt buộc roster. Giữ takeover hiện tại. Không thực thi xóa dữ liệu thật trong đợt kiểm thử.
- Giữ nguyên ngày lịch sử 30/10 xuất hiện trong tài liệu; ghi là ngày chưa xác minh, không dùng làm căn cứ xác nhận triển khai.
- Repo không cho biết rules Console thực tế. Không đánh dấu “đã áp dụng” chỉ vì có file rules.
- G1 → G2: xác nhận nộp từ server, giữ id bài theo lượt; G1 không đổi schema bài nộp. G2 → G3: nộp thành công một lần để thống kê lượt không trùng.
- Chưa triển khai đề CK1 thật, publish, cập nhật Console hoặc thao tác dữ liệu thật. Chuẩn bị công cụ/kiểm thử và tài liệu trước.

## Theo dõi

Trạng thái công việc chính chỉ tại `LO_TRINH.md`; tài liệu này lưu bằng chứng và quyết định kỹ thuật.

## Kết quả triển khai và kiểm chứng 30/10/2026

### G1 — Rules

- Chặn retake khi lượt đã nộp còn khóa; chỉ giáo viên mở khóa rồi mới làm lại.
- Giới hạn kiểu/kích thước trường live, allowlist khi tạo và affectedKeys khi cập nhật. Trường thừa legacy được giữ bất biến, heartbeat hợp lệ vẫn chạy; không thêm/sửa trường lạ.
- Client lọc payload cũ và đưa penaltyPoints về0 theo chính sách hiện hành, không xóa dữ liệu thật.
- Thêm Java21 + rules emulator vào workflow Pages. `npm run test:rules` dùng project `demo-ahs-rules` và localhost, 12/12 test đạt; không dùng project thật.
- Bằng chứng RED: retake khóa và trường live lạ bị cho qua trước sửa; legacy heartbeat bị từ chối trước khi bổ sung tương thích.
- Giới hạn: chưa kiểm hạn nộp máy chủ/cộng giờ theo schema mới, chưa đổi takeover. Rules trong repo chưa được xác nhận trên Console.

### G2 — Luồng học sinh và giám thị

- Nộp chỉ xác nhận từ server, không tin snapshot cache/pending; retry giữ id theo lượt và không ghi đè bài đã nộp. Có sessionId khi gửi.
- Draft theo tab, identity gồm grade/class/LMS/code/server-start/uid; chỉ giữ đáp án học sinh, phục hồi sau xác nhận server kể cả đang khóa, giữ khi lỗi và xóa sau nộp thành công.
- Hai timer thi/ôn tập dùng handler mới nhất, tránh tự nộp đáp án rỗng do closure lúc vào bài.
- Mở khóa quản trị dừng ngay nếu không tìm thấy phiên hoặc server từ chối; không báo thành công giả.
- Bằng chứng RED→GREEN: test hành vi cloud, retry/draft/timer và lỗi mở khóa. Giới hạn draft theo sessionStorage: giữ sau reload cùng tab, không hứa khôi phục sau khi đóng tab/browser; pending local là lớp bảo vệ riêng, bản legacy thiếu identity không tự phục hồi.

### G3 — Quản trị và dữ liệu

- Đọc schema lượt thi phẳng, chỉ cấp thêm sau submitted===true.
- Lịch sử thẻ chỉ gắn bài khi đúng grade/class/LMS/tên chuẩn hóa, không suy đoán dữ liệu thiếu; không đổi key gộp thẻ hoặc bảng điểm đã có.
- Nhãn ôn tập khớp thang7/7.75.
- Test xác nhận retention21, cảnh báo14, chỉ xem summary không xóa; làm tròn hiện tại2 chữ số vẫn giữ nguyên theo giáo viên.

### G4 — Công cụ ngân hàng → LMS

- Đọc bốn export giáo viên thật theo schema endpoint hiện có, kiểm locked/published và approved_hash bằng đúng Python JSON của ngân hàng.
- Đối chiếu family, grade, mã101–104 và bất biến nội dung/barem qua hoán vị. Map MC/YN/ES, giữ id/slot/điểm. Dạng SHORT và nội dung chưa có renderer bị từ chối rõ ràng.
- Dry-run mặc định, checksum trước ghi, đầu ra chỉ private được gitignore; chặn symlink/ghi đè. Không gọi mạng, không đọc gói đề thật trong test.
- Rà soát bổ sung đã phát hiện lỗi thông báo JSON native có thể lộ trích đoạn nguồn; test RED→GREEN bảo đảm chẩn đoán không in nội dung đề.
- Chưa có gói CK1 cụ thể được chuyển/giáo viên đối chiếu/upload trong phiên này.

### G5 — Kiểm thử và vận hành

- Browser headless local: home/test/admin HTTP200, không pageerror; nhập học sinh giả và nộp ôn tập không tự luận cho cả8/9/10, kết quả đúng thang7/7/7.75. Chặn toàn bộ kết nối ngoài localhost, không chạm Firebase thật.
- Hướng dẫn phát hành/khôi phục tại `VAN_HANH_PHAT_HANH.md`; cấu hình rules test riêng tại `firebase.test.json`.
- CI Pages và rules Console thực tế chưa chạy/xác minh trong phiên; chưa push/publish.

## Review và giới hạn bằng chứng

Agent bảo mật đã review G1–G3 và yêu cầu sửa hai P1 (legacy live merge, báo mở khóa thành công giả); cả hai đã sửa và có test. Review bổ sung G4 của subagent bị dừng vì giới hạn sử dụng; agent chính đọc mã và đối chiếu ADMIN_FIELDS/exam_hash với nguồn ngân hàng, sửa lỗi diagnostic qua test. Đây không phải chứng nhận bảo mật đầy đủ.

Kết quả cuối cùng xem mục thực thi trong `LO_TRINH.md` và nhật ký; không dùng test giả thay cho nghiệm thu gói CK1 hoặc diễn tập trang thật. Cảnh báo chunk >500kB và script logo chưa type=module đã tồn tại, không làm build thất bại. Kiểm trên Node26; chưa tái lập môi trường Node22 của CI ở máy local.

## Kiểm tra cuối trước bàn giao nguồn

- `npm run check`: 77 Node gồm74 đạt/3 private skip; 65 Vitest đạt; lint/build/leak check đạt.
- `npm run test:rules`: 12 đạt, không skip.
- `git diff --check`: đạt. Browser smoke ba trang và nộp ôn tập8/9/10 đạt, mọi kết nối ngoài localhost bị chặn.
- Đồng bộ37 file mã/tài liệu/test đã sửa/thêm về Drive và kiểm SHA-256 từng file trùng snapshot; không đưa node_modules, dist, đề private hoặc dữ liệu thật về repo.
- Nhánh nguồn Drive `codex/agents-staged-rollout`; chưa commit/push/deploy. Snapshot và log máy local ở `/private/tmp/ahs-rollout-src` và `/private/tmp/ahs-*.log`, không dựa vào /tmp để lưu lâu dài.

## Bổ sung sau xác nhận nguồn chuẩn ngày30/10

- Đổi nguồn nghiệm thu hiện tại sang Giữa HK1 trong thư mục Ms.Tuyến theo lời giáo viên; CK1 chưa tồn tại, không phải đầu vào cần chuẩn bị trong đợt này.
- Đã đối chiếu12 mã/348 câu và barem theo câu, không sai lệch; tạo3 gói upload riêng tư, không sửa bộ nguồn.
- Sửa thêm tương thích converter TF context/points mặc định, tự luận question/context; renderer tự luận8/9 trước đó trống vì chỉ đọc context, đã sửa và có test RED→GREEN.
- Cài sạch Node22.23.4 thành công;80 test Node có gói private đạt không skip,67 Vitest đạt;12 rules emulator đạt. Các kết quả Node26 ở trên là bằng chứng từng bước lịch sử, không phải kiểm cuối.
- Browser local đủ12 mã chính thức hiển thị ngữ cảnh/tự luận, cloud stub + chặn mạng ngoài, không pageerror.
- Đã chuẩn bị nguồn và gói upload; phát hành/rules thật cần cửa sổ ngoài ca thi. Không tự thao tác bài nộp, điểm hoặc dữ liệu học sinh thật.

## Bổ sung quyết định nhận bài muộn ngày 30/10

- Checkpoint đã commit ở repo nguồn: `c1be6d5`, chưa push/deploy.
- Gia hạn chính thức ghi bằng transaction trên lượt thi, tránh mất giờ khi reload và ghi đè khi cộng đồng thời. Gia hạn toàn phòng gộp theo khối/LMS để nhiều tab không cộng lặp; chỉ báo thành công sau máy chủ nhận.
- Mỗi lượt mới/làm lại chụp `durationMinutes`, đặt `extraTimeSeconds:0`; client theo hạn tuyệt đối từ snapshot máy chủ. Rules không cho học sinh tự tăng thời lượng hoặc gia hạn.
- Bài nộp lưu thời lượng/gia hạn đúng lượt, `serverSubmittedAt` do máy chủ ghi. Rules vẫn nhận bài muộn; bảng và CSV tính độ trễ từ mốc tin cậy, không thay điểm. Legacy thiếu thời lượng giữ null/“Chưa đủ dữ liệu”, không suy từ cấu hình mới.
- Test hồi quy cũ dùng thời lượng cấu hình đã được chuyển sang fixture có thời lượng theo lượt; giữ kiểm tra quá 1 phút và điểm không đổi.

### Kiểm chứng bản timing

- Bản cài sạch Node22.23.4: **97 Node đạt, không bỏ qua; 78 Vitest đạt**. Lint, build và kiểm chặn lọt đề đạt.
- Rules emulator: **16/16 đạt**, có test nhận bài trễ, từ chối giả thời lượng/gia hạn, reset khi thi lại và legacy thiếu thời lượng.
- Reviewer bảo mật đọc lại riêng bản timing: không thấy blocker; yêu cầu phát hành cặp client/rules ngoài ca và tải lại tất cả máy.
