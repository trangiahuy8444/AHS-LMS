# Tự động lưu dữ liệu AHS-LMS về Drive theo lớp

## Mục tiêu và phạm vi

Bộ lưu trữ chạy trên Google Apps Script riêng của giáo viên, theo lịch năm phút. Khi đã cài và cấp quyền, công việc tiếp tục chạy dù admin và máy giáo viên đều đóng. Không cần Cloud Functions, không nâng Firebase lên gói trả phí và không công khai một địa chỉ webhook.

Mã trong thư mục `scripts/drive-archive/` là bộ cài; chỉ có mã nguồn trong repo chưa có nghĩa lịch tự động đã được cài trên tài khoản Google. Cần hoàn thành bước cài, xác nhận chạy được với dữ liệu giả rồi mới xác nhận môi trường thật đã lưu thành công.

Bộ lưu trữ đọc các nguồn được cho phép: `submissions`, `exam_attempts`, `proctor_commands`, `exam_bank` và `practice_results`. Không đọc `exam_secrets`, `exam_keys`, mật khẩu, mã truy cập hay thông tin kết nối webhook. Các trường có tên chứa thông tin xác thực còn sót trong nguồn cũng bị loại bỏ trước khi tạo bản lưu.

Bản JSON giữ toàn bộ các trường của nguồn được phép: câu trả lời trắc nghiệm, đúng/sai, bài tự luận, điểm từng ý, nhận xét, trạng thái chấm/chốt điểm, mốc thời gian, gia hạn, số vi phạm và nhắc nhở nếu các trường này có trong nguồn. Bảng tính theo lớp là bản tóm tắt; JSON mới là bản đầy đủ. Nhận xét quá dài được rút gọn ở ô bảng tính để không vượt giới hạn ô, nhưng JSON vẫn giữ đầy đủ.

Bộ lưu trữ lưu trạng thái hiện có của mỗi nguồn; một công việc chờ có thể gộp nhiều thay đổi trước khi được xử lý. Các sự kiện có tài liệu riêng được lưu riêng. Không thể tái tạo lịch sử chưa từng được ứng dụng ghi lại. Hiện bản nháp đang gõ chỉ nằm trên trình duyệt, và bộ đếm vi phạm không phải nhật ký chi tiết từng lần; không coi chúng là dữ liệu đã được lưu đầy đủ lên Drive.

## Tổ chức thư mục

Một thư mục gốc riêng tư có thể chứa cả hệ thống thật và hệ thống thử, nhưng mỗi môi trường có nhánh dữ liệu riêng. Bên trong phân theo môi trường, năm học, kỳ, khối và lớp. Ví dụ dữ liệu giả:

```text
AHS-LMS-Archive/
  Thu_Nghiem/2026-2027/GK1/Khoi_9/Lop_9_20/
    Bang_Diem_Va_Nhat_Ky        (Google Sheets)
    Bai_Lam/
      submissions__<id>.json
    Nhat_Ky_Va_Nguon/
      exam_attempts__<id>.json
      proctor_commands__<id>.json
```

Bản đề dùng chung ở nhánh `_DE_CHUNG` của khối. Thông báo toàn trường hoặc sự kiện cũ không có lớp ở nhánh `_TOAN_TRUONG`, không tự gán vào một lớp bất kỳ.

Mỗi nguồn có một tệp JSON ổn định và một dòng bảng tính theo khóa nguồn/tài liệu. Chấm lại không thêm dòng trùng. Môi trường thật và môi trường thử không dùng chung nhánh dữ liệu; cấu hình, con trỏ và tiến độ bổ sung cũng tách theo dự án. Worker từ chối ghi vào thư mục/tệp đang được chia sẻ công khai hoặc theo toàn miền; không tự mở quyền chia sẻ.

## Cài trên tài khoản giáo viên

1. Tạo một dự án Apps Script riêng, không triển khai Web App. Tài khoản chạy phải có quyền IAM đọc/ghi Firestore của đúng dự án Firebase và quyền tạo tệp trong Drive của mình.
2. Thêm hai tệp mã `ArchiveEngine` và `Code`, lần lượt lấy nội dung từ `ArchiveEngine.js` và `Code.gs`. Bật hiển thị tệp manifest rồi dùng nội dung `appsscript.json` đi kèm.
3. Trong `AHS_ARCHIVE_SETTINGS`, kiểm tra `projectId`, `schoolYear` và `period`. Nếu đã tạo một thư mục Drive riêng tư dành riêng cho bộ lưu trữ, có thể đặt thêm `rootFolderId` để dùng thư mục đó. Bộ cài sẽ kiểm tra quyền riêng tư và không tạo thêm thư mục gốc trùng. Một bộ đã cài không được đổi sang thư mục khác để tránh tách dữ liệu. Mặc định là dự án thử `ahs-lms-sandbox`; dự án thật là `ahs-lms`. Bản đóng gói có thể phục vụ cả hai môi trường trong cùng một Apps Script và cùng một lần cấp quyền. Dispatcher dùng một trigger, tách riêng cấu hình/con trỏ/tiến độ của từng dự án và chia thời gian chạy giữa chúng. Không tự đổi dự án hoặc thư mục của trạng thái đã cài. Chỉ đổi năm/kỳ sau khi các công việc của kỳ cũ đã được lưu xong để không gán sai nhánh.
4. Chọn hàm `installDriveArchive` và chạy bằng tài khoản giáo viên. Cấp quyền Google một lần cho Drive, Sheets, Firestore, gọi API và lịch tự động. OAuth token chỉ được lấy khi chạy, không lưu thành thuộc tính hoặc ghi vào log.
5. Kiểm tra mục Triggers của Apps Script có đúng một `runDriveArchive` chạy mỗi năm phút. Sau khi cấu hình, thư mục và lịch sẵn sàng, bộ cài luôn bật `driveArchiveEnabled` để admin biết bộ tự động đã được cài. Bảo vệ thao tác xóa dùng cờ riêng `driveArchiveProtectDeletes`: người bảo trì chỉ bật bằng `activateDeletionProtection:true` sau khi mã ghi hàng chờ và bộ quy tắc tương ứng đã được phát hành trên đúng môi trường. Mặc định không ghi hoặc đặt lại cờ bảo vệ xóa; cờ đã bật trước đó được giữ nguyên. Cờ này không xác nhận dữ liệu đã lên Drive; xác nhận thành công chỉ xuất hiện sau lượt worker thực tế. Bộ cài chỉ thay lịch của chính hàm này, giữ các lịch khác.
6. Dùng bài nộp giả để kiểm tra tạo đúng thư mục lớp, JSON và bảng tính; chấm lại rồi kiểm tra dòng được cập nhật. Xác nhận trạng thái trong `drive_archive_status/worker` có `lastSuccessAt` mới.
7. Sau khi kiểm chứng môi trường thử, xác nhận nhánh môi trường thật cũng lưu được bằng quyền của giáo viên. Không sao chép mật khẩu/webhook hoặc danh sách học sinh thật sang môi trường thử.

Có thể tạo tệp JSON theo định dạng Apps Script API bằng `node scripts/drive-archive/build-bundle.cjs <đường-dẫn-đầu-ra>`. Lệnh này chỉ đóng gói mã nguồn, không kết nối Google và không bật lịch. Người bảo trì có thể dùng hàm `projectFiles` với `projects:['ahs-lms','ahs-lms-sandbox']` và `rootFolderId` đã kiểm tra riêng tư để tạo dispatcher chung; mặc định `activateDeletionProtection:false`. API quản lý Apps Script cần quyền OAuth riêng; connector Drive thông thường không thay thế quyền cài/chạy Apps Script.

## Cách bảo đảm không mất cập nhật

Ứng dụng phải ghi công việc vào `drive_archive_jobs` cùng lúc với thao tác nộp/chấm/sửa tương ứng. Mỗi công việc tham chiếu nguồn, lớp, khối và một số phiên bản tăng dần. Không coi một thao tác đã có bản Drive chỉ vì Firestore đã nhận bài.

Worker đọc tối đa 25 công việc đang chờ mỗi lượt, tạo/cập nhật JSON và dòng bảng tính, rồi mới xác nhận phiên bản đã lưu. Xác nhận dùng điều kiện `updateTime` của tài liệu công việc. Nếu giáo viên sửa điểm trong lúc worker đang lưu, xác nhận cũ bị từ chối và phiên bản mới vẫn chờ lượt tiếp theo. Nếu Drive, Sheets, mạng hoặc hạn mức lỗi, công việc chưa được xác nhận; lần chạy sau tự thử lại.

Vòng quét lưu con trỏ theo tên tài liệu và quay vòng. Một tài liệu lỗi không chặn mãi các lớp phía sau. Worker dừng bắt đầu công việc mới sau khoảng 3,5 phút để còn thời gian ghi trạng thái và không vượt thời gian thực thi Apps Script thông thường.

Không được xóa nguồn hoặc hàng chờ ôn tập trước khi có xác nhận lưu tương ứng. Không được coi bản lưu cũ là bảo đảm cho dữ liệu vừa sửa. Phần kiểm tra xóa và các điểm ghi hàng chờ trong ứng dụng phải được tích hợp trước khi nghiệm thu tự động lưu.

## Bổ sung dữ liệu cũ và theo dõi lỗi

Bộ cài bắt đầu một lượt bổ sung dữ liệu cũ. Mỗi lượt đọc tối đa 25 tài liệu từ một nguồn, chỉ tạo công việc chưa có rồi lưu con trỏ. Không quét lại toàn bộ kho mỗi năm phút. Có thể chạy `backfillDriveArchive` để bổ sung thêm một trang; không đặt lại hoặc xóa bài nộp.

Trạng thái `drive_archive_status/worker` dành cho giáo viên gồm thời điểm chạy, lần thành công gần nhất, số nguồn vừa lưu, số lỗi/xung đột, trạng thái bổ sung và thư mục gốc. Khi có lỗi, nguồn vẫn ở Firestore và công việc vẫn chờ; không tự xóa bài. Kiểm tra quyền tài khoản, hạn mức và lịch Apps Script trước khi thử lại. Không chép bài làm, tên học sinh hoặc mã truy cập vào log hỗ trợ.

Bản mã nguồn và các kiểm thử mô phỏng không chứng minh Google đã chạy lịch thật. Nghiệm thu phải có bằng chứng tệp Drive, bảng tính, xác nhận phiên bản, cập nhật chấm lại và một lần chạy tự động khi admin đã đóng.
