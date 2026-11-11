# Lộ trình AHS-LMS

> Tệp trạng thái sống, nguồn duy nhất cho việc cần làm. Đánh dấu `[x]` kèm commit khi xong. Một việc chỉ xong khi `npm run check` đạt **và** giáo viên xác nhận trên trang thật.
> Lập ngày 28/10/2026 từ lịch sử git. Các mục "Đề xuất" chưa được thầy duyệt.

## Đã xong (27–28/10/2026)

- [x] Nền tảng thi trực tuyến Firebase + GitHub Pages (`fb9e5da`)
- [x] Thời lượng làm bài, khóa/mở phiên, phạt 3 vi phạm (`70979c0`)
- [x] Ma trận mở ca thi theo lớp, đồng bộ thời gian thực (`e711b51`)
- [x] Tối ưu CSDL cho 300+ học sinh, đồng bộ Google Drive (`fdebb7e`, `8468a31`)
- [x] Ôn tập lấy mẫu câu (THCS 28, THPT 19+3+3), xáo trộn, thời lượng (`0802487`)
- [x] Giám sát ôn tập trực tiếp, tự luận nhiều ý, rà đáp án 3 khối (`1274554`)
- [x] Chuyển sang gói Spark: bảo mật bằng `firestore.rules`, chấm ở trang quản trị, đăng nhập Google (`98dc055`)
- [x] Khóa kho đề, tự chấm lại bài nộp trùng id (`24bc873`)
- [x] Vite + React 18 + Tailwind v3; tách AdminApp và App thành controller/action/tab (`62f8121`, `6c204cd`, `095a373`)
- [x] CI: lint, test, build, chặn lọt mã đề, đăng Pages (`4579371`)
- [x] Không lộ URL/token webhook cho học sinh (`aa48472`)
- [x] Hộp thoại dùng chung, test component Vitest, bỏ Analytics (`e4a06d9`, `d3f2786`, `c8b022a`)
- [x] Sửa nút mở khóa bài làm (lỗi từ bước tách mã); bỏ tự trừ 5 điểm vi phạm; test hợp đồng context và luồng mở khóa (29/10/2026)

## Cần thầy xác nhận ngay

- [x] Dán `firestore.rules` khóa bài trên máy chủ và push mã (`be57a9a`, 29/10/2026)
- [ ] Thử trên trang thật: khóa 3 lần, tải lại trang vẫn khóa, giáo viên mở khóa, nộp bài ghi đúng số vi phạm
- [ ] Đầu mỗi ca thi: yêu cầu mọi máy tải lại trang (Ctrl+Shift+R) để không còn chạy mã cũ
- [x] Mã nguồn đã chặn retake khi còn khóa; rules thật cần được xác minh khi phát hành. Giáo viên xác nhận không bắt buộc danh sách mã LMS trước ca thi.
- [x] Mã nguồn đã siết schema `live_sessions`, lưu cộng giờ trên máy chủ và nhận bài muộn có đánh dấu theo quyết định giáo viên.
- [ ] Đánh giá riêng takeover/làm bài thay và dọn dữ liệu trên máy dùng chung; chưa mở rộng chính sách trong đợt này.
- [x] Giáo viên xác nhận 29/10: phần làm tròn đã làm; giữ cách tính/hiển thị hiện tại, không tự đổi chính sách. Mã lưu `finalScore` đến 2 chữ số; đây là hiện trạng kỹ thuật, không phải kết luận pháp lý.

- [ ] Xác minh phiên bản/hash `firestore.rules` đang chạy trên Console. Mục đã dán `be57a9a` ở trên là ghi nhận lịch sử, chưa chứng minh bản file hiện tại đã được áp dụng.
- [ ] Đã chạy thử một ca thi thật (ít nhất 1 lớp) trên bản Vite chưa?

## Trước CK1 (hạn: trước 18/1/2027)

- [ ] Đề cương ôn tập CK1 cho 3 khối vào `data/questions_grade{8,9,10}.js` (từ đề cương đã duyệt trong `../06_Kiem_tra_va_Danh_gia/`)
- [ ] Mã đề CK1 101–104 cho 3 khối tải lên `exam_bank` qua tab Cấu hình
- [ ] Diễn tập ca thi: đủ lượt, đúng mã đề theo lớp, mất mạng giữa chừng, nộp lỗi rồi nộp lại, cộng giờ, thu bài khẩn
- [ ] Kiểm tra chấm: so điểm tự chấm với chấm tay trên một mẫu bài (MC, Đ/S; vi phạm chỉ ghi nhận, không trừ điểm)
- [ ] Công cụ đã có và kiểm tự động đạt; còn chuyển/đối chiếu gói CK1 thật từ `ngan-hang-de-web` sang JSON `{ grade, officialExams }` của AHS-LMS, để mã đề thi trực tuyến trùng đúng mã đề đã duyệt (hash), không gõ lại
- [x] Giáo viên xác nhận đã có thời hạn lưu: `retentionDays:21`, cảnh báo14 ngày và quy trình sao lưu/dọn thủ công trong tab Cấu hình. Phạm vi xóa thực tế cần xem chức năng hiện có; không tự mở rộng xóa các collection khác.

## Sau CK1

- [ ] **Đề xuất:** phân tích câu sai nhiều theo mã câu ổn định, gửi ngược về `ngan-hang-de-web` (mốc D bên đó: độ khó, độ phân biệt)


## Tổ chức agents (29/10/2026)

Xem [đánh giá agents](DANH_GIA_AGENTS.md), [hồ sơ phân công](../AGENTS.md) và [kế hoạch giai đoạn 0–6](superpowers/plans/2026-10-29-trien-khai-agents.md). Đây là kế hoạch đề xuất; các mục chưa nghiệm thu ở trên vẫn giữ nguyên trạng thái. Giai đoạn 0 hòa giải trạng thái rules, ngày lịch sử, cách làm tròn và cách gọi “phạt vi phạm” trước khi triển khai.

## Thực thi kế hoạch agents — cập nhật 30/10/2026

Quy ước: các mục dưới ghi riêng phần mã/kiểm tự động và nghiệm thu thật; không đồng nhất hai trạng thái.

- [x] G0 — Đạt đường cơ sở nguồn và kiểm tra đầy đủ ở snapshot cô lập; [bằng chứng](THUC_THI_AGENTS.md).
- [x] G1 — Đạt kiểm tự động phần hardening retake/live; 12 test emulator. Bổ sung thời lượng theo lượt và tổng giờ gia hạn; nhận bài muộn có đánh dấu. Takeover giữ hiện trạng.
- [x] G2 — Đạt kiểm tự động phần nộp/retry/server ack, draft sau reload, timer mới nhất và mở khóa không báo thành công giả.
- [x] G3 — Đạt kiểm tự động phần cấp lượt/identity lịch sử/thang ôn tập và hồi quy retention/làm tròn hiện có.
- [x] G4 — Công cụ native + adapter export ngân hàng đã triển khai/kiểm thử bằng dữ liệu giả; xem [hướng dẫn](CHUYEN_GOI_DE_LMS.md).
- [x] G4 — Theo xác nhận giáo viên, dùng Giữa HK1 ở thư mục gửi Ms.Tuyến: đã đối chiếu348 câu/12 mã và barem, tạo3 gói upload trong private. CK1 chưa có, giữ ở mốc tương lai.
- [ ] G4 — Upload bộ Giữa HK1 đã đối chiếu khi phát hành, không thay đề dự bị hoặc tạo đề CK1.
- [x] G5 — Chuẩn bị workflow rules test, [runbook](VAN_HANH_PHAT_HANH.md), browser smoke và nộp ôn tập local ba khối.
- [ ] G5 — Xác nhận cặp client/rules trên hệ thống thật, CI Pages, diễn tập ca thi chính thức rồi nghiệm thu phát hành.
- [ ] G6 — Đối soát sau CK1; cần bài thi thực tế và thời điểm chốt điểm. Không tự xóa dữ liệu trước sự kiện này.

Các phần đạt kiểm tự động ở trên chưa có nghĩa đã triển khai lên web thật. Không bắt buộc roster; giữ làm tròn/retention đã có theo xác nhận giáo viên.

### Kiểm chứng cuối 30/10/2026

Cài sạch `npm ci` bằng Node22.23.4: đạt. Bộ kiểm tra với gói Giữa HK1 riêng tư: **80 Node đạt, không skip; 67 Vitest đạt**, lint/build/chặn lọt đề đạt. Rules emulator12/12 đạt. Browser local hiển thị ngữ cảnh và tự luận đủ12 mã; cloud được stub, chặn mọi kết nối ngoài localhost. Xem [đối chiếu nguồn chuẩn](DOI_CHIEU_GIUA_HK1.md). Đây chưa phải nghiệm thu hệ thống thật.

### Hoàn thiện cộng giờ và nhận bài muộn

Theo xác nhận giáo viên: vẫn nhận bài muộn và đánh dấu để thầy xử lý. Đã lưu thời lượng/gia hạn trên lượt thi, giữ khi tải lại, tránh cộng lặp nhiều tab; làm lại reset gia hạn. Bảng bài nộp và CSV ghi trạng thái/số giây trễ theo giờ máy chủ, không tự trừ điểm. Bài cũ thiếu mốc thời lượng không bị kết luận muộn.

Kiểm cuối trên bản cài sạch: **97 Node,78 Vitest,16 rules emulator đạt**, không skip; lint/build/chặn lọt đề đạt. Reviewer bảo mật không thấy blocker mới. Chưa phát hành thật; cần cặp client/rules mới ngoài ca và tải lại mọi máy.

### Phát hành thật ngày 31/10/2026

- [x] Đã phát hành client `b9314f5` lên [web thật](https://trangiahuy8444.github.io/AHS-LMS/); [GitHub Actions](https://github.com/trangiahuy8444/AHS-LMS/actions/runs/41163804059) build/deploy đều thành công.
- [x] Đã Publish rules trên Firebase Console lúc 10:21 (giờ Việt Nam). Nội dung đã xuất bản khớp SHA-256 sau chuẩn hóa khoảng trắng `63bda424c41f38de96cab0120e26eb10c7e1d0ecffc7b19660a64eacf32eb314`. Đã lưu bản khôi phục riêng tư.
- [x] Trang gốc, học sinh và quản trị trả HTTP200; mọi tệp JS/CSS được tham chiếu đều khớp bản build. Trang học sinh hiển thị thang ôn tập7 đúng bản mới.
- [ ] Trước ca tiếp theo: tải lại tất cả máy, diễn tập ca chính thức bằng dữ liệu thử và nghiệm thu vận hành; việc phát hành không thay thế diễn tập này.

Không upload/thay kho đề hoặc sửa bài nộp/điểm trong lần phát hành này. Những ghi nhận “chưa phát hành” phía trên là trạng thái lịch sử trước ngày31/10.

### 02/11/2026 — Học sinh chọn mã đề

- [x] Thêm lựa chọn `Học sinh tự chọn mã đề` trong Cấu hình → Phân mã đề thi, chỉ lưu sau khi máy chủ xác nhận. Giáo viên chủ động bật chế độ; giữ cấu hình phân mã hiện hành cho đến khi lưu.
- [x] Học sinh chọn mã đang bật của đúng khối khi bắt đầu lượt mới/thi lại được cấp; tiếp tục lượt đang làm giữ mã đã nhận, kể cả chuyển thiết bị và để trống lựa chọn.
- [x] Rules kiểm mã theo khối và chế độ; không cho đổi mã giữa lượt, không bỏ mật khẩu, ca thi, khóa hoặc giới hạn lượt.
- [x] Kiểm cuối:104 Node đạt/3 private skip,92 Vitest,19 rules emulator đạt; lint/build/chặn lọt đề đạt. Review độc lập đã sửa thêm trường hợp nhận lại lượt từ thiết bị khác; không còn blocker trong phạm vi rà soát.
- [ ] Diễn tập ca chính thức sau khi giáo viên chọn chế độ phù hợp; không dùng test cục bộ thay cho ca thật.

- Phát hành thật02/11: client `d36625a`, [GitHub Pages build/deploy đạt](https://github.com/trangiahuy8444/AHS-LMS/actions/runs/41369616826); rules mới đã Publish và đối chiếu khớp hash. Trang gốc/test/admin HTTP200, mọi asset tham chiếu khớp build. Cấu hình phân mã hiện hành được giữ, giáo viên chủ động bật tự chọn.


### 07/11/2026 — Hướng dẫn và nhắc nhở của giáo viên

- [x] Quản trị → Cấu hình cho phép sửa tiêu đề/nội dung hướng dẫn riêng cho ôn tập và thi chính thức; học sinh thấy trong bài làm, cập nhật khi cấu hình được lưu.
- [x] Giám sát → Nhắc nhở học sinh: giáo viên nhập nội dung, đếm riêng theo lượt, giữ sau tải lại và hiển thị cả khi bài đang khóa. Giáo viên tự quyết định xử lý theo xác nhận; nhắc nhở không tự khóa hoặc trừ điểm.
- [x] Gửi lại cùng yêu cầu không tăng trùng; gửi đồng thời được xử lý nguyên tử. Phân biệt đúng lớp và học sinh, hỗ trợ lượt thi cũ.
- [x] Kiểm cuối:123 Node đạt/3 private skip,107 Vitest đạt,23 rules emulator đạt; lint/build/chặn lọt đề đạt. Mô phỏng trình duyệt: sửa hướng dẫn, gửi hai lần, kiểm màn hình nhỏ, không lỗi trang. Review độc lập không còn blocker sau sửa nhắc nhở bị che trên màn hình khóa.
- [x] Đã phát hành client `8db089c`; [GitHub Pages build/deploy đạt](https://github.com/trangiahuy8444/AHS-LMS/actions/runs/42339355177). Trang gốc/test/admin HTTP200; mọi JS/CSS tham chiếu khớp bản build đã kiểm thử.

### 08/11/2026 — Trình bày tự luận thống nhất

- [x] Mã và kiểm tự động: tách các ý a), b) cho gói đề cũ, dùng cùng cách trình bày với ôn tập; giữ nguyên nội dung và cách chấm. `npm run check` đạt ở bản sao cục bộ.
- [ ] Phát hành và xác nhận hiển thị trên trang thật.

- [x] Đồng bộ thêm màn hình xem lại, tra đáp án và chấm tự luận; barem quản trị hỗ trợ alias. Kiểm tự động:123 Node đạt/3 private skip,116 Vitest đạt; lint/build/chặn lọt đề đạt.
- [x] Môi trường thử cục bộ theo lựa chọn giáo viên: Auth/Firestore Emulator riêng, dữ liệu giả, AI/Sheets mô phỏng rõ nhãn, bộ mở bằng một tệp.135 Node đạt/3 private skip,127 Vitest,23 rules emulator; lint/build/chặn lọt đề đạt. Diễn tập start/lock/unlock/extend/submit/grading và stop/restart đạt. Xem THU_NGHIEM_CUC_BO.md.
- [ ] Phát hành client thật khi được yêu cầu; các chức năng thử cục bộ hiện dùng được trên máy, chưa cập nhật tab mới lên website thật.

### 09/11/2026 — Thay lựa chọn bộ thử bằng website đồng bộ

- [x] Tạo dự án/Firestore miễn phí riêng, đăng nhập thử riêng, không anonymous; phát hành hai cổng web thử và diễn tập nhập/nộp dữ liệu giả.
- [x] Thông báo trước/trong bài dùng chung cấu hình; đã kiểm trên bộ thử web.
- [x] Mã Drive tự động theo lớp: worker riêng tư, outbox nguyên tử, receipt/retry, status UI, JSON+Sheet. Kiểm cuối184 Node/151 Vitest/30 rules đạt (3 private skip).
- [x] Người dùng cấp quyền Firebase CLI và Apps Script CLI, công cụ xác nhận đăng nhập.
- [ ] Cài/upload worker vào Google Apps Script, bật trigger, nghiệm thu ghi Drive khi admin đóng. Thư mục gốc đã tạo riêng tư, chưa báo lưu tự động hoạt động.
- [ ] Phát hành lần cập nhật cuối bộ thử: lệnh bị chặn vì hết hạn mức xét duyệt tự động, chưa thực thi; bản phát hành đầu vẫn dùng được.
- [ ] Chuẩn bị và duyệt phát hành client/rules sản xuất, không đồng nhất với website thử. Không phát hành main hoặc rules thật trong phiên này.


### 11/11/2026 — Bảo toàn ôn tập và xác nhận mở ca (cục bộ)

- [x] Đối soát dữ liệu cứu hộ riêng tư, tạo bản xem và JSON dễ đọc; không chấm lại hoặc đổi điểm thật.
- [x] Mã và kiểm tự động: lịch sử nguyên bài từng lượt, pending/retry, JSON v2/CSV đủ nguồn, quản trị xem ôn tập chỉ đọc và mở ca chờ máy chủ xác nhận.
- [x] Kiểm cuối: 218 Node đạt/3 private bỏ qua;208 Vitest;32 rules emulator;lint/build/chặn lọt đề đạt. Review độc lập và diễn tập giao diện bằng dữ liệu giả đạt.
- [ ] Publish rules tương thích trước client, diễn tập nhận đủ bài và mở ca sau phát hành. Chưa cập nhật website/Firebase trong đợt chuẩn bị này.
- [ ] Xác minh cấu hình/lỗi thật để kết luận nguyên nhân ca bị chặn; lỗi mã đã tái hiện chưa chứng minh nguyên nhân duy nhất.

Hướng dẫn: [Bảo toàn ôn tập](BAO_TOAN_ON_TAP_2026_11_11.md).

### 11/11/2026 — Phát hành theo yêu cầu tiếp theo của giáo viên

- [x] Giáo viên yêu cầu cập nhật website/rules và phục hồi dữ liệu ôn tập để quản trị xem, giữ quyền chốt điểm đóng và điểm gốc.
- [x] Rules tương thích mới đã Publish/đối chiếu hash; bảo vệ cả nguồn đầy đủ trước tab quản trị cũ;33/33 emulator đạt.
- [x] Client hoàn thiện `a125eac` đã phát hành thành công; trang gốc/test/admin HTTP200,6 asset nội bộ khớp byte bản đã kiểm thử. Nguồn phục hồi đã đọc lại đủ, điểm và cấu hình không đổi.
- [x] Tạo nguồn phục hồi kèm archive job nguyên tử, đọc lại đối chiếu câu trả lời/điểm và xác nhận cấu hình không đổi. Không tạo bài thi chính thức hoặc mở chốt điểm.
