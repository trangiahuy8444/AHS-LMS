# Kiểm tra và đóng gói đề LMS

Công cụ `scripts/chuyen_goi_de_lms.cjs` hiện kiểm tra **gói native** `{ grade, officialExams }` cho một khối 8, 9 hoặc 10, đủ mã 101–104. Công cụ không tự tạo đề, xáo câu/phương án hay đổi barem. Mọi dữ liệu được giữ nguyên (kể cả id câu và metadata); chỉ chuẩn hóa thứ tự key JSON để tạo fingerprint SHA-256. Fingerprint này không phải chữ ký phê duyệt.

## Sử dụng

Đặt gói đã được giáo viên duyệt trong `private/`. Bắt đầu bằng kiểm tra không ghi:

```sh
node scripts/chuyen_goi_de_lms.cjs private/goi_nguon.json
```

Kết quả chỉ in khối, mã đề và checksum; không in nội dung/đáp án. Đối chiếu gói nguồn với giáo viên và giữ checksum đã xác nhận. Khi cần tạo tệp riêng để upload:

```sh
node scripts/chuyen_goi_de_lms.cjs private/goi_nguon.json --expected-sha256 HASH_DA_DOI_CHIEU --output private/goi_upload.json --apply
```

`--apply` bắt buộc có checksum khớp nội dung và đường dẫn `.json` trong `private/` được gitignore. Công cụ từ chối ghi đè và đường dẫn đi qua symlink. Không đưa gói upload vào `data/`, repo hoặc fixture. Upload lên Firestore là bước vận hành riêng qua trang quản trị, công cụ không gọi mạng.

## Các kiểm tra

- Khối hợp lệ, đủ đúng bốn mã và code khớp key; câu có số nguyên dương duy nhất trong mỗi phần.
- Khối 8/9: 28 trắc nghiệm và 3 tự luận. Khối 10: 19 trắc nghiệm, 3 Đ/S và 2–3 tự luận. Tổng điểm chính thức phải đúng 10; trắc nghiệm và tự luận có điểm dương hữu hạn. Đúng/Sai native được phép thiếu points, dùng mặc định1 điểm đúng hành vi LMS, không sửa gói nguồn.
- Trắc nghiệm có 4 phương án khác nhau và đáp án nguyên 0–3; Đ/S đủ a–d, nội dung và đáp án boolean.
- Tự luận có modelAnswer hoặc rubric; rubric dạng danh sách phải có tiêu chí, điểm dương và tổng khớp điểm câu.
- Từ chối các alias danh sách đồng thời để tránh chọn nhầm phần dữ liệu; dùng thêm validator hiện có của LMS.
- Hash thay đổi khi nội dung/đáp án/barem hoặc metadata thay đổi; thứ tự key không ảnh hưởng hash. Hash chuẩn hóa này khác hash byte của file và không mặc nhiên bằng approved_hash bên ngân hàng.

## Adapter export ngân hàng đã duyệt

Đã xác định export hiện có: `ngan-hang-de-web/server.py:188–203` phục vụ `GET /api/exams/<id>/export?format=json&answers=1`; `exports.py:export_document` nhánh JSON trả nguyên record giáo viên (khác bản học sinh bị bỏ đáp án). Tải bốn file JSON giáo viên của đúng family sau khi từng mã đã được duyệt khóa. Công cụ nhận chính bốn file record này, không cần envelope mới và không sửa repo ngân hàng:

```sh
node scripts/chuyen_goi_de_lms.cjs --bank-input private/101.json --bank-input private/102.json --bank-input private/103.json --bank-input private/104.json
```

Sau đối chiếu checksum, thêm `--expected-sha256 HASH_DA_DOI_CHIEU --output private/goi_upload.json --apply` để ghi. Adapter cần Python 3 trên PATH để kiểm nguyên thuật toán `domain/exam_lifecycle.py`; đây là công cụ cục bộ, không thêm Python vào cổng học sinh hoặc bản build.

Bằng chứng schema:

- `input_schema.py:validate_question_input`: MC dùng `correct`, YN dùng `statements[{label,text,correct}]`, ES dùng `rubric[{criterion,points}]`.
- `domain/permutation.py:verify_codes`: mã đề dùng `exam_code`, câu dùng `id`, `slot_number`, `points`; giữ bộ câu và barem khi hoán vị.
- `domain/exam_lifecycle.py:exam_hash`: bỏ ADMIN_FIELDS rồi SHA-256 Python JSON `sort_keys=True, ensure_ascii=False, separators=(',',':'), allow_nan=False`. Python phân biệt serialization `1.0` và `1`, nên adapter xác minh từ JSON nguồn bằng Python trước khi Node parse/đổi schema.
- `bank_service.py:_apply_exam_transition` (logic approve/publish khoảng dòng 1480–1545): approved_hash được ghi khi duyệt, publish chặn nội dung bị đổi.
- `bank_service.py:export_exam_bundle`: xuất gói tài liệu theo family; adapter không cần giải ZIP vì endpoint JSON giáo viên từng mã đã đủ dữ liệu và hash.

Adapter bắt buộc đủ mã 101–104, cùng `grade`, `parent_exam_id`, tổng 10; mỗi record phải locked/published và approved_hash khớp. Từ chối id câu trùng, SHORT và câu có ngữ cảnh nhóm/đa phương tiện chưa có renderer LMS để tránh mất nội dung. Đối chiếu cùng bộ câu, điểm, nội dung, barem và đáp án theo nội dung sau hoán vị. MC map `slot_number → num`, `correct → correctAnswer`; YN map `statements → subQuestions` và nhãn/đáp án tương ứng; ES giữ `rubric` và tạo `modelAnswer` dạng dòng tiêu chí/điểm để cổng quản trị đang có hiển thị. Giữ `id` câu và không tự trộn lại.

`sourceManifest` ở root gói chỉ chứa id nguồn, mã và approved_hash; không chứa raw record/đáp án. Nội dung đáp án chỉ ở các trường LMS đã được `stripAnswers` loại bỏ khi tạo `exam_public`. Không đặt raw bank record vào metadata câu vì có thể làm lọt trường `correct` mà bộ strip hiện tại không nhận biết.

Hash đầu ra LMS khác approved_hash nguồn do đổi schema. Manifest nguồn giữ bằng chứng kiểm; hash native dùng để xác nhận đúng gói upload. Đây là kiểm tra tính toàn vẹn dữ liệu, không thay thế xác thực người tải/giáo viên hoặc xác nhận nội dung sư phạm. Chưa lấy hoặc chuyển gói CK1 thật, chưa upload Firebase; bốn mã sinh mới ở ngân hàng nhưng còn drafting phải được duyệt riêng trước khi adapter chấp nhận.

## Chỉ dẫn cho reviewer

- Điểm vào LMS: `scripts/chuyen_goi_de_lms.cjs:prepareBankExports` nhận bốn chuỗi JSON gốc; `BANK_VERIFY` kiểm phê duyệt bằng Python trước khi Node đổi schema; `preparePackage` kiểm gói đích và hash; `writePrivatePackage` bảo vệ vị trí ghi.
- Đường export ngân hàng: `server.py:Handler.do_GET`, nhánh `/api/(exams|revisions)/<id>/export` (khoảng dòng 188–203), gọi `exports.py:export_document` (dòng 1310; nhánh `fmt == 'json'` khoảng 1330) với `answers=True` để giữ đáp án và trạng thái phê duyệt.
- Nguồn phê duyệt: `domain/exam_lifecycle.py:exam_content`, `exam_hash` cùng `ADMIN_FIELDS`; `bank_service.py:BankService._apply_exam_transition` (dòng 1459; approve khoảng 1521, publish khoảng 1530) ghi/đối chiếu `approved_hash`.
- Nguồn family: `bank_service.py:BankService.create_permuted_exams` (dòng 1650) gắn `parent_exam_id` và `exam_code` vào từng record con; `domain/permutation.py:verify_codes` đối chiếu bộ id câu, điểm, slot và phiên bản nội dung.
- Bằng chứng số thập phân: test `adapter kiểm approved_hash Python với điểm 1.0 và bản public không giữ đáp án nguồn` trong `tests/chuyen_goi_de_lms.test.cjs` ký raw JSON có `"points":1.0` bằng Python rồi chạy adapter; Node không tự tính lại approved_hash sau `JSON.parse`, vì khi đó mất phân biệt serialize `1.0` với `1` của Python.
- Bằng chứng test: 12 test converter đạt; log `/private/tmp/ahs-bank-adapter-green.log`; lần kiểm tổng `/private/tmp/ahs-bank-adapter-all-check.log` đạt 73 Node, 3 skip, 65 Vitest, lint/build/kiểm lọt đề. Đây là bằng chứng bộ giả và nguồn mã, chưa xác nhận gói CK1 thật.

## Kiểm thử

```sh
node --test tests/chuyen_goi_de_lms.test.cjs
```

Fixture hoàn toàn giả, kiểm native và bank export cả ba khối, checksum thay đổi, approved_hash Python (kể cả số 1.0), cấu trúc/đáp án/điểm sai, hoán vị và bảo vệ output riêng tư. Không chứng minh nội dung sư phạm của gói CK1 thật.


## Bộ nguồn hiện tại đã xác nhận — Giữa HK1

Giáo viên xác nhận ngày30/10/2026: bộ chuẩn ở `06_Kiem_tra_va_Danh_gia/00_Ho_so_nop_Giua_HK1/00_De_gui_Van_phong_photo_Ms_Tuyen`; hiện chưa có CK1. Đợt này dùng ba file chính `DE GIUA KI 1 – MON TIN HOC {8,9,10} – THAY TRAN GIA HUY.docx`, mỗi file có mã101–104; các đề dự bị giữ riêng.

Đã đối chiếu348 câu, thứ tự phương án, bảng đáp án và36 barem tự luận với các gói native hiện có: không phát hiện sai lệch. So văn bản giữ nguyên chữ hoa/thường, dấu câu và toán tử, chỉ chuẩn hóa UnicodeNFC/khoảng trắng. Ba gói upload riêng tư đã tạo trong `private/`, kèm biên bản SHA-256 không chứa nội dung đề. Chưa upload Firebase.

Schema đúng với renderer: TF dùng context; tự luận chấp nhận question (8/9) hoặc context kèm subItems (10). Renderer tự luận đã hỗ trợ cả hai; adapter ngân hàng map ngữ cảnh TF sang context để không hiện câu trống. 16 test converter và test render bảo vệ các trường hợp này.
