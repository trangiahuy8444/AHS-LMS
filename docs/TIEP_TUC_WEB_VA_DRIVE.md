# Tiếp tục bộ thử web và Drive tự động

## Mục tiêu người dùng còn hiệu lực
- Hệ thống thử phải chạy trên web và đồng bộ giữa các máy, tách hoàn toàn học sinh thật.
- Đăng nhập đơn giản theo tài khoản thử dùng chung đã chỉ định; chỉ dùng trong test. Không Google/anonymous cho luồng sử dụng test.
- Khung thông báo ngoài màn hình test và trong bài lấy cùng nội dung cấu hình admin.
- Tự động sao lưu mọi dữ liệu thi đã lưu trên máy chủ về Drive, theo lớp, không phụ thuộc admin đang mở. Bản nháp hiện vẫn cục bộ, lịch sử chưa từng lưu không thể tái tạo.

## Đã thực hiện
Dự án riêng ahs-lms-sandbox có Firestore miễn phí, Authentication email/password (không anonymous), webapp và Hosting. Đã triển khai bản thử đầu. URLs: https://ahs-lms-sandbox.web.app/admin/ và https://ahs-lms-sandbox.firebaseapp.com/test/. Đã kiểm đăng nhập hai cổng, ôn tập/nộp và outbox cloud theo lớp. Chưa phát hành lên AHS-LMS thật.

Root Drive riêng tư đã được connector xác minh: https://drive.google.com/drive/folders/1VCxeOoRxOKAcr2fuyM9pO-aPXJKZoHl0 . Không đưa dữ liệu thật vào web test; kho Drive chia nhánh môi trường.

## Mã và bằng chứng
- Nguồn chuẩn: thư mục on-tap-kiem-tra-web trong workspace; snapshot kiểm tra /tmp/ahs-cloud-fix, dependency links tới Developer/AHS-LMS-vite/node_modules. Cấu hình SDK web public trong .env.sandbox-web.local (gitignored), không ghi hoặc in credentials CLI.
- Bộ công cụ riêng: ~/Developer/AHS-LMS-local-sandbox-tools (Firebase CLI, Firebase Admin SDK, clasp, JRE21, cacheemulators). CLI đã được người dùng đăng nhập; không mở/in tệp token.
- Kiểm cuối /tmp/ahs-cloud-final-check.log:184Nodepass/3skip,151Vitest; rules30pass /tmp/ahs-delete-flags-rules.log. Build /tmp/ahs-cloud-final-build.log; source đã build vào /tmp/ahs-cloud-fix/dist-sandbox, marker riêng.
- Deploy đầu thành công /tmp/ahs-cloud-deploy.log; lần mới bị từ chối bởi auto-review vì hết hạn mức, CHƯA thực hiện /tmp/ahs-cloud-final-deploy.log. Không đổi công cụ để bỏ qua xét duyệt.
- Worker private source scripts/drive-archive, tests mô phỏng32 trường hợp ops/worker; multi-project dispatcher cùng một trigger5phút, cấu hình và cursor riêng, tổngbudget210giây. Không có doPost công khai. Bộ upload riêng /tmp/ahs-drive-worker-upload (hai dự án, thư mục riêng đã xác minh, activateDeletionProtection:false).
- Production và sandbox rules khác teacher alias; deployguard CHỈ chấp nhận firestore.web-sandbox.rules và projectahs-lms-sandbox. Không deploy firestore.rules lên projectthử.

## Việc còn lại khi có thể xét duyệt
1. Không yêu cầu đăng nhập lại nếu các CLI còn hiệu lực. clasp login đã hoàn tất, đọc kết quả không đọc token. Chỉ dùng tool phù hợp, không vượt chặn xét duyệt.
2. Tạo private standalone Apps Script bằng clasp, upload 3files từ bộ riêng. Có thể cần bật Apps Script API qua user settings; nếu là cấp quyền mới, nêu rõ và để người dùng cho phép. Không công khai webapp; không tạo serviceaccountkey.
3. Mở editor, người dùng duyệt quyền của chính worker và chạy installDriveArchive. Kiểm tra trigger và drive_archive_status server. Không ghi rằng đã bật trước khi có bằng chứng.
4. Nghiệm thu bằng dữ liệu giả dự án thử, đóng admin, xác nhận JSON+Sheet đúng lớp và receipt trong Firestore; không dùng dữ liệu thật làm fixture hoặc in vào log. Dữ liệu sản xuất chỉ sao lưu vào thư mục riêng tư đã duyệt.
5. Cập nhật bản thử cuối bằng guarded deploy script sau khi review được tiếp tục. Không push main tự động: còn các thay đổi có sẵn trong repo; kiểm gitdiff và cổng phát hành riêng cho sản xuất. Sau khi source/rules sản xuất phù hợp mới chọn bật driveArchiveProtectDeletes; workerEnabled là cờ khác.
6. Cập nhật nhật ký/backlog chính xác; chưa hoàn tất tự động Drive ở trạng thái hiện tại.

## Browser handoff
Hai cổng thử đã được đánh dấu deliverable. Tab cấp quyền IAB có thể còn giao diện cũ dù clasp đăng nhập thành công qua trình duyệt khác; không cấp lại hoặc đọc token chỉ vì tab đó chưa đổi. Bộ thử cục bộ cũ không phải đích sử dụng; không xóa dữ liệu cũ hay thư mục công cụ.
