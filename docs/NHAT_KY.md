## 12/11/2026 — Bài đánh giá phục hồi riêng lớp 8/21: AI đề xuất, giáo viên duyệt

- Theo yêu cầu giáo viên, bổ sung luồng chuyển nguồn cứu hộ riêng lớp này thành bài đánh giá để chấm tự luận và học sinh xác nhận sau duyệt. Giữ điểm trắc nghiệm gốc/thang7,3câu tự luận mỗi câu1điểm, tổng10; không tự chấm lại MCQ thiếu permutation.
- AI đề xuất riêng và chưa công nhận điểm. Giáo viên xem điểm từng ý/lý do/lưu ý, bấm Duyệt và lưu điểm; giao dịch kiểm nguồn/phiên bản và đợi máy chủ xác nhận. Duyệt lại xóa xác nhận cũ; xóa đề xuất riêng tư trước khi học sinh được đọc bản đã duyệt.
- Học sinh chỉ đọc bản phục hồi đã duyệt với dữ liệu máy chủ mới nhất; không dùng cache/local thay thế. Xác nhận kiểm đúng phiên bản điểm và cờ riêng lớp, không giả thành công khi lưu lỗi. Các nút giáo viên xác nhận thay/xóa/đặt lại lượt không áp dụng nguồn phục hồi.
- Kiểm bản cuối:237Node đạt/3private bỏ qua;239Vitest đạt;lint/build/chặn lọt đề đạt;42rules emulator đạt. Review độc lập không còn blocker; đã đối chiếu riêng tư các đề xuất theo barem, vẫn chờ giáo viên quyết định điểm.
- Đã Publish rules SHA256 `faf3c0bb18c5b3890ff031ae5bccadb334986caaa5fbe698786fef4df665a54b`. Chuẩn bị phát hành client trước khi tạo nguồn đánh giá mới cùng archivejob nguyên tử. Dùng ID riêng, không ghi exam_attempts/exam_sessions; nguồn ôn tập gốc giữ nguyên.
- Tệp dữ liệu thật/đề xuất/biên nhận chỉ ở vùng riêng ngoài repository. Xem PHUC_HOI_DANH_GIA_8_21.md.

## 11/11/2026 — Hoàn tất phát hành và kiểm tra website thật

- Client `a125eac` đã build/deploy thành công: https://github.com/trangiahuy8444/AHS-LMS/actions/runs/43032275705 . Trang gốc/test/admin HTTP200;6 asset JS/CSS nội bộ tham chiếu khớp byte với bản đã kiểm thử.
- Đọc lại máy chủ xác nhận nguồn phục hồi còn đầy đủ câu trả lời, điểm gốc và cấu hình không đổi; quyền xem/chốt điểm vẫn đóng. Không ghi vào bài thi chính thức.
- Bản hoàn thiện gộp bản tổng hợp cũ/lượt phục hồi đã phát hành, không gộp nhầm các lượt lịch sử độc lập. Mã nguồn công khai không chứa dữ liệu cứu hộ hoặc biên nhận cá nhân.
- Hướng dẫn giáo viên: tải lại Admin, Bài nộp & chấm → lớp cần kiểm tra → Chỉ bài Ôn tập Đề cương → Tất cả trạng thái → Xem bài ôn tập. Bài cũ vẫn hiển thị hạn chế thiếu thứ tự phương án; không tự chấm lại MCQ hoặc công nhận điểm.
- Hoàn tất kiểm chứng kỹ thuật và phục hồi; việc giáo viên kiểm tra/chốt phương án sử dụng điểm là bước chuyên môn riêng, chưa thực hiện tự động.

## 11/11/2026 — Đã phát hành và phục hồi bài ôn tập lên máy chủ

- Client `9a7fef3` đã build/deploy thành công qua GitHub Actions. Rules bản có bảo vệ xóa nguồn đầy đủ đã Publish và đọc lại khớp hash.
- Đã tạo nguồn ôn tập phục hồi cùng archive job nguyên tử, create-only; đọc lại xác minh đủ câu trả lời và điểm gốc. Danh tính, câu trả lời và biên nhận chi tiết chỉ lưu riêng tư ngoài repo.
- Cấu hình kỳ thi, quyền xem/chốt điểm và collection bài thi chính thức không bị thay đổi. Chưa công nhận điểm hoặc mở chốt cho học sinh.
- Bổ sung gộp bản tổng hợp cũ với lượt phục hồi khi khớp danh tính, thời gian, điểm và câu trả lời để tránh hiển thị trùng; vẫn giữ các lượt lịch sử độc lập và bản có nội dung khác. Đối chiếu nguồn cứu hộ riêng cho kết quả số bài hiển thị đúng, không ghi lại dữ liệu.
- Bản hoàn thiện gộp hiển thị đã kiểm:218 Node đạt/3 private bỏ qua,215 Vitest đạt;lint/build/chặn lọt đề đạt. Chỉ sửa cách trình bày dữ liệu trên Admin.

## 11/11/2026 — Giáo viên yêu cầu phát hành và phục hồi dữ liệu ôn tập

- Giáo viên đã yêu cầu thực hiện bước tiếp theo: cập nhật client/rules và đưa bài cứu hộ vào nguồn ôn tập để quản trị xem; không mở chốt điểm hoặc thay điểm gốc.
- Đã sao lưu riêng tư quy tắc/cấu hình hiện hành trước cập nhật. Rules mới đã Publish và đọc lại khớp SHA-256 `867231b09d01387ecd015aeb3aaaa0f69259825512ba6524eb7d53ecc2514097`.
- Bổ sung ràng buộc máy chủ: bài ôn tập có câu trả lời chỉ được xóa khi biên nhận lưu trữ hiện hành khớp, kể cả công tắc bảo vệ tắt; chặn tab quản trị cũ tự dọn bài vừa phục hồi sau Sheets.
- Kiểm bản phát hành: 218 Node/208 Vitest đạt,3 gói riêng tư bỏ qua;lint/build/chặn lọt đề đạt;rules emulator riêng33/33 đạt. Mã nguồn/rules/tests đã đối chiếu khớp bản kiểm thử.
- Đang phát hành client qua GitHub Actions. Dữ liệu thật không đưa vào repo; kế hoạch phục hồi dùng tạo mới có điều kiện cùng archive job trong một commit, không ghi vào collection bài thi chính thức hoặc cấu hình xem/chốt điểm.

## 11/11/2026 — Bảo toàn bài ôn tập và xác nhận mở ca thi (cục bộ)

- Dữ liệu cứu hộ được giữ riêng ngoài repository công khai. Tạo bản xem và JSON dễ đọc; giữ điểm gốc, không suy ra đáp án từ chỉ số phương án đã đảo.
- Lượt mới giữ nguyên câu trả lời và bộ câu hỏi của lượt, tách khỏi bảng điểm cao nhất. Bổ sung hàng gửi bền/retry và cảnh báo khi chưa có xác nhận máy chủ. Nguồn chi tiết chỉ tự dọn sau biên nhận lưu trữ hợp lệ.
- Quản trị xem ôn tập chỉ đọc; JSON v2 giữ lịch sử và câu trả lời, CSV tổng hợp đúng thang điểm và không được coi là sao lưu đầy đủ. Kiểm tra dữ liệu lồng nhau và nhập hợp nhất không trùng.
- Mở/đóng ca thi dùng map mới nhất trong transaction, chỉ báo thành công sau commit. Chưa xác minh cấu hình thật để kết luận nguyên nhân duy nhất của ca thực tế.
- Kiểm cuối: npm run check đạt — 218 Node đạt, 3 gói riêng tư bỏ qua; 208 Vitest đạt; lint/build/chặn lọt đề đạt. Rules emulator riêng 32/32 đạt. Diễn tập giao diện dữ liệu giả 1366×768 và 390×844 đạt, không kết nối dịch vụ thật. Review độc lập không còn blocker trong phạm vi sửa.
- Mã đã đồng bộ về checkout Drive. Không commit/push/publish, không sửa Firebase, Sheets hoặc điểm thật. Cần publish rules tương thích trước client và diễn tập sau phát hành. Xem BAO_TOAN_ON_TAP_2026_11_11.md.

## 09/11/2026 — Giáo viên duyệt commit/push bản giao diện, tìm nhanh và nhắc nhở

- Giáo viên đã yêu cầu commit/push các thay đổi giao diện đang chờ: khung 88%, tìm nhanh Giám sát và nhắc nhở học sinh nổi bật.
- Kiểm tra lại trước phát hành: 207 Node + 188 Vitest đạt, 3 kiểm tra gói riêng tư bỏ qua; lint/build/không lọt đề đạt. Chỉ phát hành mã, không sửa dữ liệu, điểm hoặc cấu hình kỳ thi thật.

## 09/11/2026 — Bản chỉnh giao diện và nhắc nhở đang chờ duyệt (KHÔNG commit/push)

- Theo chỉ dẫn mới của giáo viên, mọi thay đổi sau HEAD 2736cc1 chỉ lưu cục bộ, không stage/commit/push hoặc phát hành, không thay dữ liệu thật.
- Khung nội dung học sinh và Admin rộng 88% trên màn hình lớn, 94% ở khoảng 901–1100px, 100% ở màn hình hẹp. Header và nội dung thẳng cùng khung; in bảng điểm vẫn dùng toàn khổ. Giữ chiều cao phòng làm bài/kết quả, chỉ cuộn nội dung dài.
- Giám sát có tìm tên có dấu/không dấu hoặc mã LMS có/không dấu gạch, lọc lớp và trạng thái Đang khóa/Có vi phạm. Phím / đặt con trỏ vào ô tìm, Escape xóa từ khóa; không chiếm phím khi đang nhập ở ô khác. Thanh tìm bám dưới header khi cuộn, đo theo chiều cao header thực tế.
- Ưu tiên lớp/thẻ đang khóa; kết quả tìm có bố cục gọn với nhắc nhở và mở khóa dễ thấy. Ẩn thao tác cả lớp khi đang tìm đích cá nhân; không thu hẹp đích lệnh cả lớp theo từ khóa. Lịch sử bài làm gấp gọn. Sĩ số và số đã nộp vẫn tính từ dữ liệu toàn lớp, không theo số thẻ tìm thấy.
- Giáo viên phản ánh học sinh không nhận ra nhắc nhở: đổi thành thông báo nền đỏ sẫm, chữ trắng lớn, tiêu đề Nhắc nhở vi phạm của giáo viên/lần, có tên, lớp, mã LMS và nội dung. Tự ẩn sau 15 giây, còn dòng nhỏ lưu số lần GV đã nhắc. Không thêm hộp thoại chặn bài, không tự khóa/trừ điểm hoặc đổi số lần rời giao diện. Hiệu ứng nhấn biểu tượng ngắn, tôn trọng chế độ giảm chuyển động; có nhãn tiếng Anh. Dùng đồng hồ đã hiệu chỉnh của bài khi có, tránh ẩn thông báo mới vì máy lệch giờ.
- Kiểm tra cuối: lint/build/không lọt đề đạt; 207 Node + 188 Vitest đạt, 3 bài gói riêng tư bỏ qua. Kiểm thử tìm đúng học sinh/nhắc/mở đúng phiên, không trộn danh tính; thao tác chỉ dùng dữ liệu giả.
- Rà trình duyệt: 42 trường hợp làm bài (7 cỡ × 3 dạng × VI/EN), Admin 1366/1920/390px (khung/tìm/nhắc/mở/sticky), 4 cỡ kết quả không tràn chiều cao, nhắc nhở 1366×768/390×844/844×390 đọc được tên/nội dung, tự ẩn và không làm tràn trang. Ảnh xem thử chỉ dùng dữ liệu giả trong /tmp.

## 09/11/2026 — Tự đóng hộp chấm sau khi lưu điểm

- Theo yêu cầu giáo viên, khi thao tác lưu điểm trả thành công: cập nhật bảng bài nộp/ôn tập, tự đóng hộp chấm và hiện thông báo ngắn ở trang quản trị. Không cần bấm Đóng hộp thoại thêm lần nữa.
- Nếu lưu trả lỗi (ví dụ điểm ngoài bước 0,25), giữ hộp và dữ liệu đang chỉnh, hiện lỗi; không thông báo thành công. Không thay cách tính điểm hoặc cơ chế đồng bộ đang dùng.
- Kiểm tra: 207 Node + 181 Vitest đạt, 3 kiểm tra gói riêng tư bỏ qua; lint/build/không lọt đề đạt. Hai kiểm tra mới bao gồm lưu thành công/giữ hộp khi lưu lỗi, có chứng minh lỗi trước khi sửa.

## 09/11/2026 — Đồng nhất phong cách nhận xét lớp 9/25 với 9/21

- Theo yêu cầu giáo viên, sửa nhận xét lớp 9/25 thành câu ngắn, chỉ lỗi sai/ý thiếu đã có, dùng “em”, tách mỗi câu hỏi thành một đoạn riêng. Không chấm lại hoặc sửa điểm.
- Đã sao lưu riêng tư 22 bài trước khi sửa, cập nhật đúng 8 nhận xét có nội dung với điều kiện phiên bản chống ghi đè; giữ trống 14 bài trọn điểm. Đọc lại cả 22 bài xác nhận mọi trường khác giữ nguyên. Tạo 8 yêu cầu lưu Drive theo hàng đợi hiện có, không xác nhận đã xuất Drive.
- Hướng dẫn AI áp dụng cả reason của từng ý (nguồn ghép nhận xét) và feedback: dùng em, không kể lại phần đúng, không nhắc điểm. Bài bỏ trống ghi ngắn “Em bỏ trống câu này.” Bộ chuẩn hóa cũng thay cách xưng hô cũ và tách các nhãn Câu trên cùng dòng thành đoạn riêng.
- Kiểm tra: 207 Node + 179 Vitest đạt, 3 bài gói riêng tư bỏ qua; lint/build/không lọt đề đạt. Có kiểm thử đối chiếu cách xưng hô và xuống dòng ở cả bộ chuẩn hóa lẫn luồng chấm toàn bài.

## 09/11/2026 — Hiển thị sĩ số và tiến độ nộp bài theo lớp

- Sửa thiếu số đã nộp/sĩ số ở Admin: thêm khung Sĩ số / Đã nộp / Chưa nộp ở Bài nộp & chấm và từng nhóm lớp trong Giám sát.
- Sĩ số lấy từ danh sách học sinh hiện có (roster-data); số đã nộp lấy từ CSDL bài làm đồng bộ, gộp mã LMS/Canvas và nhiều lượt của cùng học sinh. Bài không khớp danh sách báo riêng, không làm tăng sĩ số. Không suy sĩ số từ số đang trực tuyến hoặc số bài nộp.
- Lớp có bài đã lưu vẫn hiển thị khi không còn phiên trực tuyến. Đếm riêng thi/ôn tập, không thay theo tìm tên hoặc trạng thái chấm. Khi mất kết nối có nhắc số liệu có thể chưa cập nhật đủ.
- Đối chiếu bản sao dữ liệu thật lớp 9/21: 21/21 đã nộp, không có mã ngoài danh sách; danh sách lớp 9/25 có 22 học sinh. Không thay dữ liệu học sinh, điểm hoặc cấu hình thi.
- Kiểm tra: 206 Node + 178 Vitest đạt (6 kiểm tra mới cho đếm và giao diện), 3 kiểm tra gói riêng tư bỏ qua; lint/build/không lọt đề đạt. Giao diện dữ liệu giả kiểm ở 1366×768 và 390×844 không tràn ngang.

## 09/11/2026 — Giáo viên cho phép commit/push; sửa nhận xét lớp 9/21

- Giáo viên yêu cầu phát hành các thay đổi đang chờ trước khi chấm lớp 9/25.
- Đã sao lưu riêng tư và sửa nhận xét của đúng 21 bài lớp 9/21 bằng cập nhật chỉ trường teacherFeedback, kèm điều kiện phiên bản chống ghi đè thay đổi mới. 13 bài trọn điểm không còn nhận xét; 8 bài chỉ giữ lỗi/ý thiếu có trong nhận xét gốc. Không chấm lại, không thêm lỗi mới.
- Đọc lại 21 bài xác nhận mọi trường khác, gồm điểm và câu trả lời, giữ nguyên. Tạo 21 yêu cầu lưu Drive theo cơ chế hàng đợi hiện có; chưa xác nhận đã xuất Drive. Có một điểm 0,88 từ lần chấm cũ, giữ nguyên để giáo viên rà/chấm lại, không tự làm tròn.
- Bổ sung xử lý nhận xét cũ không có ngoặc hoặc thiếu ngoặc; kiểm thử chứng minh lỗi trước khi sửa và đạt sau khi sửa.
- Kiểm tra trước phát hành: lint/build/kiểm tra không lọt đề đạt; 206 Node + 172 Vitest đạt, 3 kiểm tra gói đề riêng tư bỏ qua; 30 kiểm tra quyền trên máy chủ giả lập đạt. Không đổi rules hoặc kho đề thật.

## 09/11/2026 — Khôi phục bài, đồng hồ máy chủ và chuẩn hóa chấm tự luận (chưa phát hành)

- Giữ yêu cầu không commit, push hoặc triển khai. Chỉ sửa mã và kiểm thử với dữ liệu giả; không sửa điểm/bài nộp/Firebase thật.
- Bản nháp thi chính thức lưu bền trên cùng trình duyệt, tách theo khối/lớp/mã LMS/mã đề/lượt bắt đầu/tài khoản. Chỉ chứa câu trả lời, không lưu đáp án chuẩn. Khôi phục câu đang xem; giữ nháp khi nộp lỗi, xóa khi máy chủ xác nhận nhận bài.
- Theo lựa chọn giáo viên, ôn tập cũng khôi phục bộ câu hỏi đã chọn, câu trả lời, vị trí, số vi phạm và mốc bắt đầu/thời lượng (kể cả gia hạn). Đóng trình duyệt thông thường rồi vào lại không đổi đề hay cấp lại thời gian; hết hạn thì nộp bài đã khôi phục một lần. Không bảo đảm khi dùng ẩn danh, xóa bộ nhớ hoặc đổi máy/trình duyệt.
- Đồng hồ thi đồng bộ từ dấu thời gian máy chủ, dùng đồng hồ đơn điệu khi đang làm, giữ hạn nộp và gia hạn của lượt cũ; giờ bắt đầu hiển thị múi giờ Việt Nam. Không âm thầm tạo lại 45 phút khi thiếu mốc bắt đầu. Kiểm thử máy lệch ±5 phút và thay giờ máy giữa lượt.
- Trang kết quả dùng toàn bộ chiều cao màn hình; thông tin/nút thao tác gọn, phần xem bài cuộn riêng. Màn hình hẹp có tab Kết quả/Bài làm. Kiểm tra 1366×768, 1024×600, 390×844, 375×667 không cuộn toàn trang hoặc tràn thẻ kết quả; nhận xét dài có vùng cuộn riêng.
- AI phải tách điểm đúng từng ý: ý 0,5 chỉ nhận 0/0,25/0,5. Tổng câu theo bước 0,25; từ chối 0,88 và tổng không khớp, không tự làm tròn hay ghi điểm 0 khi chấm lỗi. Chặn điểm lẻ cả khi lưu tay. Không đổi các điểm cũ trên hệ thống thật.
- Câu đúng trọn điểm không sinh nhận xét; câu chưa đạt chỉ ghi lỗi/ý thiếu. Loại nhãn dự phòng/model khỏi nhận xét học sinh; chấm lại đúng sẽ gỡ nhận xét cũ của riêng câu đó. Thông tin model chỉ dùng cho giáo viên.
- Kiểm tra cuối: lint đạt; 206 Node đạt, 3 bài riêng tư bỏ qua; 171 Vitest đạt; build và kiểm tra không lọt đề chính thức đạt. Có kiểm thử mở lại ôn tập sau mất sessionStorage, hạn cũ dù cấu hình đổi, hết giờ lúc khôi phục và từ chối lưu 0,88 không thay điểm cũ.

# Nhật ký phiên làm việc

> Tệp trạng thái sống. Mỗi phiên có thay đổi đáng kể thêm một mục **ở đầu** tệp: ngày, đã làm gì (kèm commit), kết quả `npm run check`, việc còn dở, câu hỏi chờ thầy. Repo công khai: không ghi bí mật hay dữ liệu học sinh.


## 09/11/2026 — Vào lại sau khi hết lượt mở màn hình kết quả (cục bộ)

- Theo yêu cầu giáo viên, lượt đã được máy chủ xác nhận nộp và đã hết lượt sẽ trả kết quả thay vì báo hết lượt. Dùng đúng bài của lượt cuối, không tạo thêm lượt, không tải đề hoặc chạy đồng hồ/chống gian lận. Lượt thi lại được giáo viên cấp vẫn giữ luồng hiện có; không tự mở khóa lượt còn bị khóa.
- Kết quả có thể chụp lại ảnh. Việc mở câu hỏi/đáp án vẫn kiểm quyền xem bài; không gán isOfficialReview cho luồng xác nhận. Cập nhật điểm thời gian thực của thẻ chỉ nhận các trường kết quả, bỏ câu trả lời và khóa chấm.
- Khi không đọc được chi tiết bài nộp nhưng lượt đã nộp được xác nhận, chỉ hiện xác nhận và báo chưa tải được điểm; không bịa điểm 0 hoặc giờ nộp/thời lượng. Không coi cache hoặc ghi đang chờ đồng bộ là bằng chứng đã nộp.
- Giữ điều kiện vào cổng thi hiện có (mật khẩu, lớp đang mở); không mở rộng rules hay quyền đọc bài của người khác. Chưa commit, push hoặc phát hành theo yêu cầu đang áp dụng.

## 09/11/2026 — Song ngữ, sĩ số và tránh vi phạm trùng khi vào bài (chưa phát hành)

- Giữ yêu cầu không commit/push/phát hành. Bản GitHub đang chạy không thay đổi.
- Thêm VI/EN cho giao diện làm bài và nội dung câu hỏi; lưu lựa chọn ngôn ngữ trên máy, không đặt lại câu đang làm hoặc câu trả lời. Không gọi dịch vụ dịch từ trình duyệt học sinh.
- Chuẩn bị bản tiếng Anh cho 110 câu ôn tập công khai và 348 câu của 12 mã đề trong gói riêng tư. Gói song ngữ riêng tư lấy từ bản nguồn ngày 30/10; chưa ghi đè kho đề thật. Bản dịch cần giáo viên rà soát trước khi phát hành. Nội dung nguồn, đáp án, barem, điểm, thứ tự và ID giữ nguyên; xáo trộn phương án đồng thời cho VI/EN.
- Nguồn ôn tập có một số phương án đã bị cắt câu; bản tiếng Anh giữ dạng thiếu với dấu ba chấm, không tự đoán thêm kiến thức. Ghi chú đối chiếu lưu riêng cùng gói đề để giáo viên rà soát.
- Admin hiển thị sĩ số từ roster và số đang làm; gộp nhiều phiên/mã LMS/Canvas cùng học sinh, loại phiên đã nộp hoặc không có nhịp tim hơn 3 phút. Không thay dữ liệu sĩ số hoặc điểm.
- Ô mã phòng thi là mã dùng cho ca, không còn kiểu đăng nhập mật khẩu tài khoản; hiển thị che ký tự theo lựa chọn. Gộp chuỗi blur/visibility/fullscreen trong 1,2 giây thành một lần rời bài; không thêm khoảng miễn giám sát đầu ca, giữ khóa sau 3 lần.
- Bố cục VI/EN kiểm bằng dữ liệu giả:42 trường hợp (7 kích thước × 3 loại câu × 2 ngôn ngữ), mở bảng câu hỏi, giữ bài khi chuyển câu, mở điều phối lớp và nhóm cấu hình đạt. Không thử thao tác trên dữ liệu học sinh thật.
- Kiểm chốt bản cục bộ:192 Node đạt/3 private bỏ qua,160 Vitest đạt; lint/build/chặn lọt đề đạt. HEAD vẫn 4dd8ff3, không stage/commit/push. Hộp lưu mật khẩu của trình duyệt chưa được nghiệm thu trên Chrome phòng máy; mã mới hạn chế nhận diện sai loại trường, không hứa chặn mọi hộp trình duyệt.

## 09/11/2026 — Bản chỉnh giao diện cục bộ, chờ giáo viên duyệt phát hành

- Yêu cầu mới: không commit/push/phát hành đến khi giáo viên yêu cầu. Các thay đổi trong mục này chỉ nằm ở thư mục làm việc.
- Nhắc nhở riêng giáo viên gửi hiện chữ có hiệu ứng, tự ẩn sau 10 giây; snapshot lặp không phát lại. Theo đính chính cuối, giữ nguyên cảnh báo chuyển tab/toàn màn hình, khóa bài và thông báo cộng giờ.
- Phòng làm bài dùng chiều cao cửa sổ, giữ thông tin học sinh, nút chuyển câu/nộp bài trong khung nhìn. Nội quy thu gọn; nội dung dài cuộn riêng; tự luận chia vùng đọc/nhập; bảng câu hỏi trên màn hình nhỏ mở/đóng được. Chuyển nút máy tính vào thanh câu hỏi để không đè nút nộp.
- Admin: rút ngắn thanh điều hướng, ưu tiên giám sát; điều phối lớp và cấu hình chia nhóm đóng/mở. Giữ các chức năng điều khiển và cơ chế lưu hiện tại.
- Kiểm thử bố cục bằng dữ liệu giả tại 7 kích thước, 3 loại câu hỏi (21 trường hợp); kiểm tra nút trong màn hình, không tràn trang, chuyển câu vẫn giữ bài và mở bảng câu hỏi/điều phối lớp. Không sử dụng dữ liệu học sinh thật.

## 09/11/2026 — Thông tin học sinh gọn và thống nhất

- Thêm khung họ tên, mã LMS, lớp ở đầu màn hình làm bài. Thẻ kết quả dùng cùng thành phần, giữ mã đề/lượt làm. Cho phép xuống dòng tên dài trên màn hình nhỏ, không cắt tên.

## 09/11/2026 — Thống nhất kết quả sau nộp bài các khối

- Một mẫu thẻ kết quả cho khối 8/9/10: giữ xác nhận nộp thành công, tách vùng điểm và trạng thái chấm. Khi chưa có điểm ghi đang chấm, điểm 0 thật vẫn hiển thị đúng; cập nhật thời gian thực không thay xác nhận bằng con số.
- Giữ thang điểm theo khối và quyền xem lại. Bỏ nhận xét đạt yêu cầu tự sinh khi giáo viên chưa viết nhận xét.

## 09/11/2026 — Tinh gọn màn hình làm bài

- Theo yêu cầu giáo viên, bỏ khung đỏ thông tin lượt thi trùng mã đề và đồng hồ của bảng câu hỏi bên phải. Giữ nguyên hướng dẫn chung, nhắc nhở riêng và cảnh báo mất mạng. Không thay logic giờ, lưu bài hoặc giám sát.
- Rút gọn cảnh báo vi phạm và màn hình khóa/mở: một trạng thái, một hướng dẫn, một nút khi được phép. Bỏ tỷ lệ tổng vi phạm dạng 4/3 dễ nhầm; tách tổng tích lũy khỏi số lần của đợt hiện tại. Giữ nguyên cơ chế khóa/mở và nhắc nhở giáo viên.

## 09/11/2026 — Phát hành theo yêu cầu giáo viên

- Giáo viên yêu cầu commit và push lên GitHub Pages hiện tại. Ghép các cập nhật đã có trên main, giữ nguyên lịch sử.
- Rà soát phát hành sửa thêm hàng chờ ôn tập bị cộng trùng khi nhận lại snapshot và loại barem/answerGuide lồng khỏi gói đề công khai.
- Bản ghép cuối kiểm đạt:190 Node (3 kiểm riêng tư bỏ qua),151 Vitest,30 rules; lint/build/chặn lọt đề đạt. Rà soát độc lập không còn lỗi chặn phát hành.
- Trình tự phát hành: kiểm đầy đủ bản ghép, triển khai rules tương thích trước client rồi theo dõi GitHub Pages. Không tự bật worker Drive khi chưa cài/kiểm chứng.

## 09/11/2026 — Bộ thử trên web, thông báo chung và chuẩn bị Drive theo lớp

- Theo lựa chọn mới, tạo dự án Spark riêng ahs-lms-sandbox và Firestore miễn phí asia-southeast1. Đã phát hành website thử tại https://ahs-lms-sandbox.web.app/admin/ và https://ahs-lms-sandbox.firebaseapp.com/test/; chỉ tài khoản dùng chung đã được giáo viên chỉ định, không bật anonymous. Không ghi thông tin đăng nhập vào nhật ký. Alias xác thực riêng chỉ có quyền ở rules thử.
- Hai cổng web đăng nhập thành công; diễn tập ôn tập, chọn MCQ, nhập tự luận và nộp thành công. Kiểm tra cloud: hàng chờ practice_results theo đúng lớp xuất hiện nguyên tử với nguồn. Không đọc hoặc sửa dữ liệu thi thật trong kiểm chứng.
- Entry và màn hình làm bài dùng chung thông báo theo chế độ, cập nhật từ cấu hình admin, cùng thời lượng thi. Tự luận đã dùng chung cách trình bày ở làm/xem/chấm bài.
- Drive: đã tạo thư mục gốc riêng tư cho chủ tài khoản; có worker Apps Script hai môi trường, trigger5phút, chia năm/kỳ/khối/lớp, JSON đầy đủ và Sheet upsert. Có outbox nguyên tử tại các đường ghi, retry, receipt đúng revision, backfill theo trang. Cờ worker driveArchiveEnabled tách khỏi driveArchiveProtectDeletes. Không lưu token hoặc mật khẩu vào mã worker/nhật ký.
- Kiểm tích hợp cuối:184 Node đạt/3 private skip,151 Vitest đạt;30 rules emulator đạt; lint/build/chặn lọt đề đạt. Đã sửa thêm nhầm bản dựng trên domain thử phải dừng trước khi khởi tạo Firebase thật, và reset lượt chỉ báo thành công sau batch ack.
- Bản thử đã phát hành thành công lần đầu. Bản cập nhật cuối (nhãn điều hướng web và tách cờ bảo vệ xóa) đã kiểm xong nhưng lệnh phát hành chưa chạy: auto-review không thể xét duyệt do hết hạn mức, không kết luận thao tác nguy hiểm. Không thử đường khác để bỏ qua xét duyệt.
- Quyền CLI Firebase và Apps Script đã được người dùng xác nhận và công cụ xác minh đăng nhập thành công. Worker Drive chưa được tạo/upload/install/ủy quyền chạy và chưa có lượt ghi Drive thực tế; không được báo đã bật sao lưu. Bản mã riêng để upload đã chuẩn bị trong /tmp/ahs-drive-worker-upload. Không phát hành client/rules thật; sản xuất vẫn cần cổng phát hành riêng.


## 08/11/2026 — Hệ thống thử cục bộ đầy đủ

- Giáo viên chọn chạy thử trên máy này. Thêm mode sandbox dùng cùng ứng dụng/rules với Auth/Firestore Emulator project demo-ahs-local, chỉ loopback. Admin/student tách origin; không dùng Firebase thật hoặc tự chuyển sang cloud khi lỗi. CSP bản thử chỉ cho kết nối dịch vụ cục bộ.
- Tách roster, đề ôn tập và 12 mã đề thi bằng dữ liệu giả. Admin có tab Thử nghiệm trên máy; banner rõ trên hai cổng. AI/Sheets dùng phản hồi mô phỏng có nhãn; nhật ký Sheets tải xuống được, không gọi dịch vụ thật. Bản thường giữ cấu hình/luồng hiện hành.
- Bộ chạy Java/Firebase riêng ngoài Drive tại Developer; tệp MO_HE_THONG_THU.command đồng bộ mã nguồn vào bản chạy và mở hệ thống. Dừng sạch có lưu/khôi phục emulator; xử lý Ctrl+C lặp để tránh mất bản xuất.
- Kiểm tự động trên snapshot:135 Node đạt/3 private skip,127 Vitest đạt; lint/build/chặn lọt đề đạt.23 rules emulator đạt. Review độc lập phát hiện và đã sửa lỗi mã hóa tên tài khoản giả và gửi trùng tín hiệu dừng; kiểm thử hồi quy/diễn tập dừng-mở lại đạt.
- Trình duyệt cục bộ: đăng nhập hai vai; bắt đầu thi, nhập trắc nghiệm+tự luận, cộng5phút, khóa/mở và giữ bài, nộp, xem/chấm AI mô phỏng, duyệt/lưu điểm. Đã đối chiếu bản ghi emulator lưu điểm; không có lỗi trang hoặc yêu cầu đến Firebase thật. REST kiểm quyền học sinh không đọc kho đáp án hoặc tự mở khóa. Dữ liệu kiểm chứng đều giả, không ghi chi tiết đề/danh tính vào log công khai.
- Diễn tập thêm trên bản cài cuối: ôn tập Khối10, câu Đ/S, nộp/xem lại trên màn hình390px không tràn. Phát hiện lỗi có sẵn khi tự lưu điểm bài thi bỏ trống câu: userChoice undefined bị Firestore từ chối; đổi dữ liệu lưu thành null (giữ nguyên lựa chọn0/false và cách chấm), kiểm thử đỏ→xanh. Đã kiểm backend tự lưu điểm trắc nghiệm và autoGradedAt thành công khi bỏ trống câu.
- Không phát hành web/rules thật. Bộ thử không xác nhận Google OAuth, chất lượng Gemini hoặc gửi Google Sheets thật; không thay thế nghiệm thu thật.


## 08/11/2026 — Đồng bộ tự luận tại các màn hình xem/chấm

- Dùng chung hàm trình bày tự luận tại bài làm, xem lại ôn tập, tra đáp án và cửa sổ chấm. Giữ các ý tách sẵn; không tách câu đơn/chuỗi ký hiệu mơ hồ. Barem quản trị đọc cả `modelAnswer`, `rubric`, `answerGuide`.
- Thêm kiểm thử thành phần thực và trường hợp biên. Kiểm đầy đủ trên bản sao nguồn: 123 Node đạt, 3 private skip, 116 Vitest đạt; lint/build/chặn lọt đề đạt. Đã rà soát độc lập phần dùng chung và các điểm tích hợp.
- Chưa phát hành. Giáo viên yêu cầu chạy thử toàn bộ chức năng không ảnh hưởng học sinh; đang chốt chọn môi trường riêng trên web hoặc máy cục bộ, chưa thay cấu hình/rules/dữ liệu thật.


## 08/11/2026 — Thống nhất trình bày tự luận giữa thi và ôn tập

- Giao diện tự luận nhận cả dữ liệu tách sẵn `subItems` và dạng cũ gộp các ý a), b) trong đề bài; chỉ tách chuỗi ký hiệu liên tiếp, giữ nguyên nội dung, ví dụ và điểm từng ý. Không sửa dữ liệu kho đề hoặc cách chấm.
- Kiểm thử hồi quy cho cả hai chế độ: đã chứng kiến 2 test thất bại trước sửa, 4 test tương thích đạt sau sửa. `npm run check` trên bản sao cục bộ đạt: lint, Node, 109 Vitest, build và chặn lọt đề. Các test cần gói đề riêng tư bỏ qua trong bản sao.
- Chưa phát hành lên web thật; cần kiểm tra hiển thị thực tế sau phát hành.


## 07/11/2026 — Hướng dẫn trong bài làm và nhắc nhở riêng

- Theo xác nhận giáo viên: đếm riêng nhắc nhở, giáo viên tự xử lý. Thêm nút gửi nội dung riêng trên thẻ giám sát; lưu số lần trên dữ liệu được bảo vệ, không tăng trùng khi thử lại và giữ khi học sinh tải lại.
- Thêm cấu hình tiêu đề/nội dung hướng dẫn riêng cho ôn tập và thi chính thức, hiển thị trong bài làm. Chờ máy chủ xác nhận trước khi báo lưu/gửi thành công.
- Phân biệt lớp trong nhóm thẻ giám sát để tránh gộp học sinh trùng mã LMS/họ tên giữa các lớp.
- Review độc lập phát hiện banner bị che khi bài khóa; đã sửa và kiểm thử hồi quy đỏ → xanh. Không còn blocker trong phạm vi review.
- Kiểm cuối:123 Node đạt/3 private skip,107 Vitest đạt,23 rules emulator đạt; lint/build/chặn lọt đề đạt. Mô phỏng trình duyệt bằng dữ liệu giả: sửa hướng dẫn, gửi nhắc hai lần, màn hình nhỏ không tràn; không ghi vào Firebase thật.
- Không cần thay rules cho tính năng này; dùng quyền ghi giáo viên đã có. Đã phát hành client `8db089c`, GitHub Pages run42339355177 đạt; trang gốc/test/admin HTTP200 và JS/CSS khớp build.


## 03/11/2026 — Nâng cấp Khảo thí: Chống nộp sớm, Khóa bài làm, Chốt điểm học sinh, Bảo toàn dữ liệu & Google Sheets 5 Tab

- **1. Chống nộp bài sớm (Anti-Early Submission)**:
  - Mặc định thời gian tối thiểu làm bài là 15 phút (trên tổng 45 phút). Hệ thống khóa nút nộp bài với đồng hồ đếm ngược `⏱️ Nộp bài (còn mm:ss)`.
  - Hộp thoại nộp bài hiển thị cảnh báo đỏ và vô hiệu hóa nút nộp nếu chưa đủ thời gian.
  - Khi hết thời gian làm bài chính thức hoặc khi giáo viên phát lệnh thu bài từ xa (`isForced = true`), cơ chế chặn nộp bài sớm tự động được gỡ bỏ ngay lập tức để học sinh nộp bài an toàn.
  - Chế độ ôn tập đề cương được miễn trừ, học sinh có thể nộp bất kỳ lúc nào để tra cứu rubric.
- **2. Ẩn toàn bộ bài làm sau khi nộp thi chính thức**:
  - Giao diện kết quả (`ResultCard`) trong chế độ thi chính thức chỉ hiển thị điểm trắc nghiệm khách quan (7.0đ THCS hoặc 7.75đ THPT) và thông báo bài tự luận đang chờ giáo viên chấm.
  - Toàn bộ danh sách câu hỏi, phương án lựa chọn, bài làm tự luận và barem đáp án bị ẩn hoàn toàn để bảo mật tuyệt đối đề thi trong phòng máy.
- **3. Mở xem lại bài thi & Học sinh xác nhận chốt điểm**:
  - Tùy chọn `allowStudentReviewOfficialExam` do Admin toàn quyền kiểm soát trong tab Cấu hình (thẻ *Mở / Khóa Học Sinh Xem Lại Bài Thi Chính Thức*).
  - Khi Admin BẬT tính năng, màn hình kết quả của học sinh sẽ xuất hiện nút mở xem lại chi tiết bài làm.
  - Tại giao diện xem lại, học sinh kiểm tra từng câu và bấm nút `✅ XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC`.
  - Trạng thái `scoreConfirmed: true` và `scoreConfirmedAt` được lưu vĩnh viễn vào Firestore và localStorage, hiển thị huy hiệu `✓ ĐÃ CHỐT ĐIỂM THÀNH CÔNG` và đồng bộ tức thời lên bảng điểm Quản trị cũng như Google Sheets.
- **4. Bảo toàn lưu trữ vĩnh viễn dữ liệu thi**:
  - Loại bỏ hoàn toàn mọi cơ chế tự động xóa bài nộp. Dữ liệu bài thi chính thức được cam kết lưu trữ vĩnh viễn (0% Auto-deletion).
  - Thẻ quản trị *Lưu Trữ Dữ Liệu Bài Thi & Dọn Dẹp An Toàn* hiển thị trạng thái `🟢 Lưu Trữ Vĩnh Viễn`.
  - Thao tác dọn dẹp chỉ được kích hoạt khi Admin chủ động nhập đúng từ khóa bảo mật `XAC NHAN XOA`, đồng thời hệ thống tự động xuất bản sao lưu CSV & JSON trước khi thực hiện.
- **5. Mở rộng đồng bộ Google Sheets 5 Tab độc lập**:
  - Cập nhật Google Apps Script Webhook trong `DriveSyncCard.jsx` với nút Sao Chép 1-click.
  - Dữ liệu được phân luồng tự động vào 5 sheet chuyên biệt:
    1. `On_Tap_De_Cuong`: Lưu kết quả các lượt ôn tập tự do.
    2. `Bai_Thi_Chinh_Thuc`: Lưu kết quả thi chính thức, bổ sung cột Xác nhận điểm & Thời điểm xác nhận.
    3. `Chi_Tiet_Bai_Lam`: Lưu chi tiết câu trả lời trắc nghiệm, đúng/sai và bài làm tự luận của từng học sinh.
    4. `Giam_Sat_Va_Vi_Pham`: Lưu nhật ký vi phạm chuyển tab, toàn màn hình và thời gian làm bài.
    5. `Thong_Ke_Theo_Lop`: Bảng tổng hợp sĩ số, số bài đã nộp, điểm trung bình và tỷ lệ chốt điểm theo từng lớp.
- **Kiểm thử tự động**:
  - 101/101 bài kiểm tra Node (`node --test tests/*.test.cjs`) đạt 100%.
  - `tests/exam_early_submit.test.cjs`: Đạt 4/4 kiểm thử chống nộp bài sớm.
  - `tests/drive_multi_sheet_sync.test.cjs`: Đạt 3/3 kiểm thử luồng 5 tab và chốt điểm.
  - `tests/verify_platform.test.cjs`: Đạt 33/33 kiểm thử chuẩn hóa nền tảng.


## 03/11/2026 — Phân biệt lượt thi theo Khối, Lớp và Mã LMS

- **Giải quyết lỗi xung đột mã LMS giữa các lớp**: Sửa cách định danh tài liệu lượt thi thành `exam_attempts/g<khối>_<LỚP>_<MÃ LMS>` (vd: `g8_8_20_111`), giúp học sinh trùng mã LMS (như 111) ở các lớp khác nhau (lớp 8/19 đã thi xong và lớp 8/20 đang mở thi) có lượt thi hoàn toàn độc lập, không bị khóa nhầm do lượt thi của lớp khác.
- **Tương thích ngược (Backward Compatibility)**: Khi học sinh vào phòng thi hoặc nộp bài, hệ thống ưu tiên định danh theo lớp mới; nếu chưa có thì kiểm tra lượt cũ theo mã LMS và chỉ nhận lại nếu trùng đúng lớp của học sinh. Học sinh cũ đang thi dở theo cấu trúc cũ vẫn tiếp tục bình thường.
- **Cập nhật Security Rules**: `firestore.rules` hỗ trợ cả định danh mới theo lớp (`g<khối>_<LỚP>_<MÃ LMS>`) và định danh cũ (`g<khối>_<MÃ LMS>`).
- **Nâng cấp Cổng Quản Trị**:
  - Nút *Lưu Mật Khẩu Thi* chờ máy chủ xác nhận, có thông báo trạng thái rõ ràng và chống lưu rỗng/lỗi mạng.
  - Bổ sung ô chọn Lớp trong thẻ *Lượt làm bài thi chính thức theo mã LMS*, hỗ trợ tra cứu lượt thi theo từng lớp hoặc tra cứu toàn khối; liệt kê chi tiết nếu mã LMS xuất hiện ở nhiều lớp.
- **Kiểm thử & Đóng gói**:
  - Bổ sung `tests/class_scoped_attempts.test.cjs` mô phỏng chính xác ca học sinh 111 lớp 8/19 và 8/20.
  - Bộ kiểm thử: 109 Node tests đạt, 94 Vitest tests đạt (16 files), ESLint đạt, build Vite đạt.


## 02/11/2026 — Bổ sung học sinh tự chọn mã đề
- Phát hành thật02/11: client `d36625a`, [GitHub Pages build/deploy đạt](https://github.com/trangiahuy8444/AHS-LMS/actions/runs/41369616826); rules mới đã Publish và đối chiếu khớp hash. Trang gốc/test/admin HTTP200, mọi asset tham chiếu khớp build. Cấu hình phân mã hiện hành được giữ, giáo viên chủ động bật tự chọn.


- Cấu hình thêm cách phân mã `student_choice`, giữ các chế độ theo lớp/ngẫu nhiên/cố định. Lưu riêng trường cấu hình và chờ máy chủ xác nhận.
- Cổng học sinh hiện danh sách mã đang bật theo đúng khối; không chọn sẵn. Máy chủ kiểm mã cho lượt mới/thi lại; resume giữ mã cũ, cả khi đổi thiết bị.
- Rules vẫn chặn đổi mã giữa lượt; mật khẩu, ca thi, khóa và số lượt không đổi. Không sửa kho đề hoặc bài nộp.
- TDD cho UI/core/rules; review bảo mật độc lập phát hiện và đã sửa resume trống từ máy khác. Kiểm cuối104 Node +92 Vitest +19 emulator đạt (3 Node private skip); lint/build/chặn lọt đề đạt.
- Hướng dẫn bật: Quản trị → Cấu hình → Phân mã đề thi → Học sinh tự chọn mã đề → Lưu cách phân mã đề.


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
