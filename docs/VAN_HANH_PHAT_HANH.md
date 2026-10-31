# Vận hành phát hành AHS-LMS

## Điều kiện mở ca

1. Xác định commit và SHA-256 của `firestore.rules` cho đúng bản phát hành. Đối chiếu nguồn chưa commit và file mới, không chỉ tên nhánh.
2. Chạy `npm ci`, `npm run check`, `npm run test:rules` trên đúng nguồn. Rules test cần Node >=22.12 và Java21, chỉ dùng project `demo-ahs-rules` trên localhost. `firebase.test.json` tách khỏi cấu hình project thật; test từ chối chạy ngoài 127.0.0.1:8080.
3. Xem số test bỏ qua; các test cần private không chứng minh gói CK1 khi không có gói đã duyệt. Không đưa gói đó vào repo để chạy CI.
4. Reviewer bảo mật và kiểm thử ghi kết quả. Giáo viên xác nhận nội dung gói đề, mã đề và cách chấm.

## Phát hành mã và rules

Push `main` kích hoạt GitHub Pages; workflow kiểm lint/test/rules/build/chống lọt đề trước deploy. Workflow không tự cập nhật rules trên Firebase thật.

Đợt này sửa retake để giữ trạng thái khóa, giới hạn schema live_sessions và chụp thời lượng/gia hạn trên lượt thi. Rules mới yêu cầu client mới khi tạo lượt/làm lại; client mới gửi hai trường thời lượng khi nộp nên cần rules mới. Client mới lọc trường cũ/lạ khi gửi heartbeat; nên phát hành client trước, yêu cầu tải lại, sau đó áp rules mới ngoài ca thi. Trong khoảng chuyển tiếp chưa mở ca mới. Phiên live cũ được tiếp tục heartbeat: rules cho giữ bất biến trường lạ đã tồn tại, chỉ cho cập nhật các trường trong giao kèo có kiểm kiểu/kích thước. Không cho tạo mới hoặc sửa trường lạ; không cần xóa phiên thật chỉ vì có trường thừa. Client đặt `penaltyPoints:0` để phiên cũ theo đúng chính sách không trừ điểm. Giá trị cũ sai kiểu/ngoài giới hạn ở các trường khác chưa được tự chuyển; nếu gặp, giáo viên xử lý phiên hết ca ngoài giờ thi, không xóa bài nộp.

- Trước cập nhật, lưu phiên bản client và bản rules đang chạy vào nơi riêng tư của giáo viên; ghi hash không chứa dữ liệu cá nhân trong nhật ký.
- Sau CI Pages đạt, kiểm tra `/AHS-LMS/`, `/AHS-LMS/test/`, `/AHS-LMS/admin/` rồi tải lại mọi máy.
- Giáo viên so hash/nội dung và Publish rules qua Console khi được phép; ghi người xác nhận, thời điểm và phiên bản. File trong repo không chứng minh bước này đã xong.
- Không mở ca khi còn client cũ hoặc chưa xác nhận rules.

## Diễn tập bằng dữ liệu giả

| Tình huống | Kết quả cần thấy |
|---|---|
| Sai mật khẩu / mã đề khác lượt | Bị từ chối, không lộ đề |
| Khóa3 lần → tải lại → giáo viên mở | Vẫn khóa sau reload; chỉ tiếp tục sau trạng thái mở hợp lệ |
| Đã nộp nhưng còn khóa, được cấp thêm lượt | Chưa làm lại được cho đến khi giáo viên mở |
| Mất mạng khi nộp → có mạng → retry | Bản pending còn, cùng id bài/lượt, chỉ xóa khi server xác nhận |
| Nộp đồng thời / timeout | Không ghi đè bài đã nhận; retry xác nhận trạng thái server |
| Cộng giờ / tải lại / nhiều tab / lệnh cũ lặp | Giữ tổng giờ đã cấp trên máy chủ, không cộng hai lần; làm lại bắt đầu từ 0 giờ gia hạn |
| Nộp sau hạn, kể cả mất mạng rồi thử lại | Vẫn nhận; bảng bài nộp và CSV đánh dấu muộn theo giờ máy chủ, không tự trừ điểm |
| Bài cũ thiếu thời lượng theo lượt | Hiện “Chưa đủ dữ liệu”, không suy hạn từ cấu hình hiện tại |
| Cấp thêm lượt khi đang làm | Bị chặn; sau nộp mới cấp được |
| Ôn tập 8/9 và10 | Thang7 và7.75, tự luận không tính điểm |
| Bảng điểm / CSV / A4 ngang | Đúng lớp/mã, điểm cao nhất/tổng lượt, tiếng Việt không lỗi |
| Retention | Cảnh báo14, hết hạn21 theo cấu hình, không tự xóa; sao lưu trước dọn |

Đánh dấu từng kịch bản với môi trường, bản nguồn, người thử và kết quả thực. Test mock/emulator không thay cho diễn tập nhiều trình duyệt và kiểm Console.

## Khôi phục

Dừng mở ca mới, giữ nguyên bản pending và bài đã nhận. Khôi phục client/rules theo cặp đã lưu ngoài giờ thi; không reset lượt, xóa bài hoặc sửa điểm để xử lý lỗi triển khai. Ghi tác động và bước khôi phục vào nhật ký riêng tư nếu cần thông tin cá nhân; báo cáo công khai chỉ ghi dữ liệu tổng hợp.

## Chính sách đã có

Giữ cách làm tròn hiện tại theo xác nhận giáo viên. Thời hạn lưu mặc định21 ngày, cảnh báo14; dọn thủ công sau sao lưu. Không bắt buộc roster trước ca thi. Giáo viên chốt nhận bài muộn có đánh dấu; thời lượng và gia hạn lấy từ chính lượt thi, giờ nhận bài lấy từ máy chủ. Takeover giữ hiện trạng.
