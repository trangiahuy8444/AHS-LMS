/**
 * questions_grade10.js
 * Ngân hàng câu hỏi Tin học Khối 10 - Trường Quốc Tế Á Châu (Asian School)
 * Bao gồm Đề cương Ôn tập (Trắc nghiệm + Đúng/Sai + Tự luận kèm Hướng dẫn chấm Rubric) và 4 Mã Đề Thi Chính Thức
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EXAM_DATA_G10 = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return {
  "grade": 10,
  "title": "Môn Tin Học Khối 10 - Trường Quốc Tế Á Châu (Asian School)",
  "practiceQuestions": [
    {
      "id": 1,
      "question": "Công cụ Google Translate phân tích ngữ liệu và dịch ngôn ngữ dựa trên công nghệ cốt lõi nào?",
      "options": [
        "Khả năng ghi nhớ cơ học các bảng mã ký tự nhị phân của phần cứng.",
        "Quá trình tra cứu thủ công của các dịch thuật viên trực tuyến 24/7.",
        "Trí tuệ nhân tạo và các mô hình học máy xử lý ngôn ngữ tự nhiên.",
        "Thuật toán tìm kiếm từ khóa thuần túy trong từ điển cố định."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    },
    {
      "id": 2,
      "question": "Tệp tin đồ họa được thiết kế bằng phần mềm mã nguồn mở Inkscape có phần mở rộng mặc định là:",
      "options": [
        ".svg",
        ".docx",
        ".mp4",
        ".xlsx"
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 3,
      "question": "Hành vi nào sau đây vi phạm quyền tác giả trong môi trường số?",
      "options": [
        "Tải phần mềm thương mại từ mạng lậu rồi bẻ khóa để sử dụng không trả phí.",
        "Trích dẫn một đoạn văn ngắn trong bài tập và ghi rõ tên tác giả cùng nguồn tài liệu.",
        "Sử dụng hình ảnh có giấy phép mở Creative Commons kèm trích dẫn tác giả gốc.",
        "Mua bản quyền sử dụng phần mềm và cài đặt trên đúng số lượng máy quy định."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 4,
      "question": "Trong các kho dữ liệu số trực tuyến, thông tin thường được tổ chức và phân loại theo cách nào?",
      "options": [
        "Cấu trúc thư mục phân cấp rõ ràng theo chủ đề và từ khóa tra cứu.",
        "Tự động xóa bớt các tài liệu học tập cũ sau mỗi chu kỳ 48 giờ lưu.",
        "Trộn lẫn toàn bộ tài liệu văn bản và video vào một tệp tin duy nhất.",
        "Xếp ngẫu nhiên theo thứ tự thời gian người dùng truy cập vào trang."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 5,
      "question": "Ưu điểm vượt trội của thiết bị số so với các phương tiện lưu trữ truyền thống là:",
      "options": [
        "Luôn hoạt động ổn định mà không cần nguồn điện cấp vào.",
        "Không bao giờ xảy ra tình trạng hư hỏng phần cứng vật lý.",
        "Giúp lưu trữ lượng dữ liệu rất lớn với kích thước nhỏ gọn.",
        "Tự động chuyển đổi toàn bộ thông tin thành tiền điện tử."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    },
    {
      "id": 6,
      "question": "Quá trình xử lý thông tin cơ bản của máy tính diễn ra theo thứ tự nào sau đây?",
      "options": [
        "Thu nhận dữ liệu -> Xử lý dữ liệu -> Xuất hoặc lưu trữ thông tin.",
        "Lưu trữ dữ liệu -> Xuất thông tin -> Thu nhận các tín hiệu vào.",
        "Xuất thông tin -> Thu nhận dữ liệu -> Xử lý và truyền tải dữ liệu.",
        "Xử lý thông tin -> Thu nhận dữ liệu -> Xóa bỏ dữ liệu trong máy."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 7,
      "question": "Đặc trưng cơ bản nhất của hệ thống IoT (Internet of Things) là:",
      "options": [
        "Toàn bộ thiết bị bắt buộc phải sử dụng chung dây cáp mạng LAN.",
        "Người dùng bắt buộc phải trực tiếp điều khiển từng thao tác vi mô.",
        "Các thiết bị kết nối mạng để tự động trao đổi dữ liệu với nhau.",
        "Mọi thiết bị số đều phải dùng chung một màn hình hiển thị."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    },
    {
      "id": 8,
      "question": "Thiết bị thông minh đóng vai trò cốt lõi nào trong cuộc Cách mạng công nghiệp lần thứ tư?",
      "options": [
        "Loại bỏ triệt để nhu cầu sử dụng mạng Internet trên toàn cầu.",
        "Đóng vai trò là thành phần thu thập và xử lý dữ liệu tự động.",
        "Buộc con người phải ngừng tham gia vào mọi quy trình sản xuất.",
        "Thay thế hoàn toàn mọi hoạt động tư duy sáng tạo nghệ thuật."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 9,
      "question": "Điểm khác biệt căn bản giữa ảnh đồ họa vector và ảnh đồ họa bitmap (raster) là:",
      "options": [
        "Ảnh vector tạo bởi công thức toán học, ảnh bitmap tạo bởi các điểm ảnh.",
        "Ảnh bitmap không bị vỡ hạt khi phóng to, ảnh vector bị vỡ hình.",
        "Ảnh vector có dung lượng tệp lớn hơn ảnh bitmap trong mọi trường hợp.",
        "Ảnh bitmap chỉ dùng trong in ấn, ảnh vector chỉ dùng hiển thị trên web."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 10,
      "question": "Thiết bị nào sau đây được phân loại là một thiết bị thông minh?",
      "options": [
        "Máy tính bỏ túi đơn giản chỉ thực hiện bốn phép tính.",
        "Quạt trần thông thường sử dụng hộp số điều chỉnh cơ.",
        "Bàn là nhiệt điện điều khiển bằng công tắc cơ học.",
        "Điện thoại thông minh có khả năng cài đặt ứng dụng."
      ],
      "correctAnswer": 3,
      "answerLetter": "D",
      "points": 0.25
    },
    {
      "id": 11,
      "question": "Dịch vụ đám mây cho phép người dùng sử dụng trực tiếp các phần mềm qua trình duyệt mạng là:",
      "options": [
        "SaaS (Phần mềm như một dịch vụ).",
        "IaaS (Hạ tầng như một dịch vụ).",
        "DaaS (Thiết bị như một dịch vụ).",
        "PaaS (Nền tảng như một dịch vụ)."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 12,
      "question": "Nguy cơ an toàn thông tin lớn nhất khi tải và sử dụng phần mềm bẻ khóa (crack) là:",
      "options": [
        "Pin thiết bị xách tay lập tức bị phồng và cháy nổ ngay tức thì.",
        "Bắt buộc người dùng phải nâng cấp cấu hình phần cứng đời mới.",
        "Màn hình máy tính bị giảm độ phân giải hiển thị vĩnh viễn.",
        "Thường bị đính kèm mã độc nhằm đánh cắp dữ liệu cá nhân."
      ],
      "correctAnswer": 3,
      "answerLetter": "D",
      "points": 0.25
    },
    {
      "id": 13,
      "question": "Trong tin học, dữ liệu số được định nghĩa chính xác là:",
      "options": [
        "Khả năng ghi nhớ của con người về thế giới tự nhiên.",
        "Tri thức tích lũy qua các bài giảng trong nhà trường.",
        "Ý nghĩa thực tế rút ra từ các sự kiện trong cuộc sống.",
        "Thông tin đã được mã hóa đưa vào máy tính xử lý."
      ],
      "correctAnswer": 3,
      "answerLetter": "D",
      "points": 0.25
    },
    {
      "id": 14,
      "question": "Đặc điểm lây lan cơ bản của virus máy tính trong môi trường số là:",
      "options": [
        "Gắn mã độc vào các tệp tin khác để lây lan khi tệp đó được kích hoạt.",
        "Tự động lây lan sang các thiết bị điện tử gia dụng không có mạch số.",
        "Chỉ có thể truyền từ máy tính này sang máy tính khác qua đường dây điện.",
        "Tự động sinh ra ngay cả khi máy tính bị ngắt hoàn toàn mọi nguồn điện."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 15,
      "question": "Dịch vụ lưu trữ đám mây (Google Drive, OneDrive) mang lại tiện ích nổi bật nào?",
      "options": [
        "Giúp máy tính cá nhân miễn nhiễm với mọi loại mã độc tống tiền.",
        "Tự động nhân đôi tốc độ xử lý phần cứng của thiết bị cá nhân.",
        "Cho phép truy cập và đồng bộ dữ liệu mọi lúc khi có Internet.",
        "Giúp điện thoại thông minh không bao giờ bị tiêu hao pin khi dùng."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    },
    {
      "id": 16,
      "question": "Thiết bị nào sau đây đóng vai trò là thiết bị vào (Input device) của máy tính?",
      "options": [
        "Bàn phím và chuột quang.",
        "Màn hình và loa âm thanh.",
        "Máy in màu và máy chiếu.",
        "Ổ đĩa cứng và thẻ nhớ."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 17,
      "question": "Mạng LAN (Local Area Network) thường được lắp đặt trong phạm vi nào?",
      "options": [
        "Trong một tòa nhà, cơ quan hoặc trường học.",
        "Toàn cầu xuyên lục địa.",
        "Giữa các quốc gia trên thế giới.",
        "Trong toàn bộ một tỉnh hoặc thành phố."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 18,
      "question": "Tệp tin đồ họa bitmap có đặc điểm nào sau đây?",
      "options": [
        "Được tạo bởi lưới các điểm ảnh (pixel), khi phóng to dễ bị vỡ hình.",
        "Được tạo bởi các phương trình toán học nên không bao giờ bị vỡ hạt.",
        "Luôn có dung lượng nhẹ hơn ảnh vector trong mọi tình huống.",
        "Không thể hiển thị ảnh chụp phong cảnh ngoài đời thật."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 19,
      "question": "Trong phần mềm Inkscape, phím tắt nào được sử dụng để xuất tệp ra định dạng ảnh PNG?",
      "options": [
        "Shift + Ctrl + E.",
        "Ctrl + S.",
        "Ctrl + Z.",
        "Ctrl + P."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 20,
      "question": "Mô hình điện toán đám mây PaaS (Platform as a Service) cung cấp dịch vụ gì cho người dùng?",
      "options": [
        "Cung cấp nền tảng và môi trường phát triển ứng dụng cho lập trình viên.",
        "Cung cấp toàn bộ máy chủ phần cứng vật lý thô.",
        "Chỉ cung cấp dịch vụ gửi nhận thư điện tử.",
        "Cung cấp mạng cáp viễn thông đường dài."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 21,
      "question": "Khi muốn chọn đồng thời nhiều đối tượng hình học trong Inkscape, người dùng nhấn giữ phím nào khi nhấp chuột?",
      "options": [
        "Shift.",
        "Alt.",
        "Tab.",
        "Esc."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 22,
      "question": "Hành động nào sau đây là biện pháp phòng chống virus máy tính hiệu quả nhất?",
      "options": [
        "Thường xuyên quét virus và cập nhật hệ điều hành cùng phần mềm bảo vệ.",
        "Không bao giờ khởi động máy tính khi cắm sạc pin.",
        "Chỉ sử dụng máy tính vào ban ngày.",
        "Rút cáp màn hình khi không sử dụng."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 23,
      "question": "Trong Inkscape, công cụ Edit paths by nodes (phím tắt N) có chức năng chính là gì?",
      "options": [
        "Hiệu chỉnh các nút và đường cong của đối tượng vectơ.",
        "Vẽ các hình chữ nhật và hình vuông cơ bản.",
        "Đổi màu nền làm việc của toàn bộ trang thiết kế.",
        "Xóa bỏ các lớp layer thiết kế."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 24,
      "question": "Dung lượng bộ nhớ 2 GB tương đương với bao nhiêu Megabyte (MB)?",
      "options": [
        "1 024 MB.",
        "2 048 MB.",
        "512 MB.",
        "4 096 MB."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 25,
      "question": "Giấy phép Creative Commons (CC) thường được sử dụng nhằm mục đích gì trong môi trường số?",
      "options": [
        "Cấm hoàn toàn việc sao chép tác phẩm dưới mọi hình thức.",
        "Cho phép tác giả chia sẻ tác phẩm của mình cho cộng đồng với những điều kiện cụ thể.",
        "Bảo hộ bí mật kinh doanh độc quyền của doanh nghiệp.",
        "Đăng ký bằng sáng chế kỹ thuật phần cứng."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    }
  ],
  "practiceTfQuestions": [
    {
      "id": 1,
      "num": 1,
      "pointsText": "1 điểm",
      "context": "Trong tiết thực hành Tin học, bạn An nhận được email từ một địa chỉ lạ với tiêu đề thông báo trúng thưởng điện thoại đính kèm tệp tin có tên Phanthuong.exe. Máy tính của An đang cài đặt phần mềm diệt virus có bản quyền.",
      "subQuestions": [
        {
          "letter": "a",
          "text": "Để kiểm tra an toàn, An nên tạm thời tắt phần mềm diệt virus rồi chạy tệp tin để xem nội dung bên trong trước.",
          "correctAnswer": false
        },
        {
          "letter": "b",
          "text": "Phần mềm diệt virus có thể tự động cảnh báo hoặc cách ly các tệp tin chứa mã độc đáng ngờ.",
          "correctAnswer": true
        },
        {
          "letter": "c",
          "text": "Việc mở ngay tệp tin .exe từ người lạ tiềm ẩn nguy cơ máy tính bị nhiễm phần mềm gián điệp (Trojan).",
          "correctAnswer": true
        },
        {
          "letter": "d",
          "text": "Tệp tin có phần mở rộng .exe là tệp tin thực thi chương trình trong hệ điều hành Windows.",
          "correctAnswer": true
        }
      ]
    },
    {
      "id": 2,
      "num": 2,
      "pointsText": "1 điểm",
      "context": "Bạn Lan thiết kế một video thuyết trình về danh lam thắng cảnh quê hương để đăng lên mạng xã hội. Lan muốn sử dụng một số bài hát và hình ảnh tìm kiếm được trên Internet làm tư liệu cho video.",
      "subQuestions": [
        {
          "letter": "a",
          "text": "Ký hiệu CC BY trên tác phẩm cho phép Lan tự do sử dụng tác phẩm nhưng bắt buộc phải ghi tên tác giả gốc.",
          "correctAnswer": true
        },
        {
          "letter": "b",
          "text": "Giấy phép Creative Commons (CC) là hệ thống giấy phép mở cho phép tác giả chia sẻ tác phẩm kèm điều kiện sử dụng.",
          "correctAnswer": true
        },
        {
          "letter": "c",
          "text": "Tác phẩm âm nhạc và hình ảnh kỹ thuật số là đối tượng được bảo hộ quyền tác giả theo pháp luật.",
          "correctAnswer": true
        },
        {
          "letter": "d",
          "text": "Lan có thể tải một bài hát độc quyền có thu phí trên mạng rồi lồng vào video, chỉ cần ghi chú 'Tôi không giữ bản quyền bài hát này' là hoàn toàn hợp pháp.",
          "correctAnswer": false
        }
      ]
    },
    {
      "id": 3,
      "num": 3,
      "pointsText": "1 điểm",
      "context": "Một nhóm học sinh lớp 10 cùng thực hiện bài tập dự án học tập. Các bạn sử dụng điện thoại thông minh để chụp ảnh hoạt động thực tế và sử dụng dịch vụ lưu trữ đám mây Google Drive để chia sẻ dữ liệu cho các thành viên trong nhóm.",
      "subQuestions": [
        {
          "letter": "a",
          "text": "Để bảo vệ dữ liệu dự án không bị người ngoài sửa đổi, nhóm nên thiết lập quyền chia sẻ công khai là 'Bất kỳ ai có liên kết đều có quyền chỉnh sửa (Editor)'.",
          "correctAnswer": false
        },
        {
          "letter": "b",
          "text": "Điện thoại thông minh là một hệ thống kỹ thuật số có khả năng thu nhận và xử lý dữ liệu hình ảnh.",
          "correctAnswer": true
        },
        {
          "letter": "c",
          "text": "Khi tải ảnh lên đám mây, các thành viên khác chỉ có thể xem được dữ liệu nếu được cấp quyền truy cập hợp lệ.",
          "correctAnswer": true
        },
        {
          "letter": "d",
          "text": "Google Drive là dịch vụ điện toán đám mây cho phép người dùng lưu trữ và chia sẻ tệp tin trực tuyến.",
          "correctAnswer": true
        }
      ]
    },
    {
      "id": 4,
      "num": 4,
      "pointsText": "1 điểm",
      "context": "Một công ty công nghệ triển khai hệ thống làm việc trực tuyến và sử dụng dịch vụ đám mây cho nhân viên.",
      "subQuestions": [
        {
          "letter": "a",
          "text": "Hệ thống điện toán đám mây giúp nhân viên làm việc và truy cập tài liệu từ xa thuận tiện.",
          "correctAnswer": true
        },
        {
          "letter": "b",
          "text": "Công ty không cần bất kỳ biện pháp bảo mật tài khoản nào vì nhà cung cấp đám mây tự động chịu trách nhiệm hoàn toàn.",
          "correctAnswer": false
        },
        {
          "letter": "c",
          "text": "Dịch vụ IaaS cho phép doanh nghiệp thuê hạ tầng máy chủ và lưu trữ ảo hóa linh hoạt.",
          "correctAnswer": true
        },
        {
          "letter": "d",
          "text": "Dữ liệu lưu trên đám mây không thể bị ảnh hưởng bởi lỗi người dùng như xóa nhầm hoặc đặt mật khẩu yếu.",
          "correctAnswer": false
        }
      ]
    },
    {
      "id": 5,
      "num": 5,
      "pointsText": "1 điểm",
      "context": "Trong giờ thực hành thiết kế đồ họa với Inkscape, bạn Tuấn thực hiện vẽ logo cho câu lạc bộ bóng đá của trường.",
      "subQuestions": [
        {
          "letter": "a",
          "text": "Tuấn có thể phóng to logo vẽ bằng vectơ lên kích thước pano lớn mà hình ảnh vẫn sắc nét.",
          "correctAnswer": true
        },
        {
          "letter": "b",
          "text": "Khi xuất sản phẩm in ấn, Tuấn nên lưu tệp nguồn dưới định dạng .svg để tiện chỉnh sửa sau này.",
          "correctAnswer": true
        },
        {
          "letter": "c",
          "text": "Ảnh vectơ Inkscape chỉ có thể tô được màu đơn sắc, không thể áp dụng hiệu ứng chuyển màu Gradient.",
          "correctAnswer": false
        },
        {
          "letter": "d",
          "text": "Để đưa một tệp ảnh chụp bitmap từ ngoài vào phần mềm Inkscape, Tuấn sử dụng lệnh Import (Ctrl + I).",
          "correctAnswer": true
        }
      ]
    },
    {
      "id": 6,
      "num": 6,
      "pointsText": "1 điểm",
      "context": "Bạn Minh tìm kiếm tài liệu trên mạng Internet phục vụ bài thu hoạch môn Giáo dục kinh tế và pháp luật.",
      "subQuestions": [
        {
          "letter": "a",
          "text": "Mọi thông tin xuất hiện trên các trang mạng xã hội đều đã qua kiểm duyệt và đảm bảo độ chính xác tuyệt đối.",
          "correctAnswer": false
        },
        {
          "letter": "b",
          "text": "Minh nên ưu tiên tham khảo các văn bản pháp luật trên Cổng thông tin điện tử của Chính phủ hoặc các Bộ ngành.",
          "correctAnswer": true
        },
        {
          "letter": "c",
          "text": "Việc sao chép nguyên văn bài viết của tác giả khác vào bài làm của mình mà không trích dẫn là hành vi đạo văn.",
          "correctAnswer": true
        },
        {
          "letter": "d",
          "text": "Tất cả các tài liệu tìm kiếm được trên Google đều được phép tự do kinh doanh thương mại mà không cần xin phép tác giả.",
          "correctAnswer": false
        }
      ]
    }
  ],
  "practiceEssayQuestions": [
    {
      "id": 1,
      "num": 1,
      "pointsText": "0,75 điểm",
      "context": "Một thẻ nhớ máy ảnh có dung lượng lưu trữ hiển thị là 16 GB. Trung bình một bức ảnh kỹ thuật số chất lượng cao chụp từ máy ảnh này có dung lượng 8 MB.",
      "subItems": [
        {
          "letter": "a",
          "text": "Hãy chuyển đổi dung lượng 16 GB sang đơn vị Megabyte (MB), biết 1 GB = 1024 MB. (0,25 đ)"
        },
        {
          "letter": "b",
          "text": "Thẻ nhớ trên có thể lưu trữ tối đa được bao nhiêu bức ảnh kỹ thuật số có dung lượng nêu trên? (0,25 đ)"
        },
        {
          "letter": "c",
          "text": "Nếu người dùng chụp thêm các đoạn video ngắn có dung lượng 4 GB, hãy tính dung lượng trống còn lại của thẻ nhớ theo đơn vị GB. (0,25 đ)"
        }
      ],
      "modelAnswer": "a) Đổi GB sang MB (0,25 đ): 16 GB * 1024 = 16.384 MB.\nb) Số bức ảnh tối đa (0,25 đ): 16.384 / 8 = 2.048 bức ảnh.\nc) Dung lượng trống còn lại (0,25 đ): 16 - 4 = 12 GB."
    },
    {
      "id": 2,
      "num": 2,
      "pointsText": "0,75 điểm",
      "context": "Trường học của em đang triển khai mô hình học tập trực tuyến kết hợp lưu trữ đám mây cho học sinh khối 10.",
      "subItems": [
        {
          "letter": "a",
          "text": "Hãy nêu 2 lợi ích thiết thực nhất của việc lưu trữ tài liệu học tập trên đám mây so với lưu trên ổ cứng máy tính cá nhân. (0,25 đ)"
        },
        {
          "letter": "b",
          "text": "Khi chia sẻ một tài liệu học tập nhóm trên Google Drive, em sẽ chọn chế độ phân quyền nào ('Người xem - Viewer' hay 'Người chỉnh sửa - Editor') cho bạn cùng nhóm để cùng làm bài? Giải thích lý do. (0,25 đ)"
        },
        {
          "letter": "c",
          "text": "Nêu một biện pháp quan trọng để bảo vệ tài khoản lưu trữ đám mây của em không bị kẻ xấu xâm nhập đánh cắp tài liệu. (0,25 đ)"
        }
      ],
      "modelAnswer": "a) Hai lợi ích lưu trữ đám mây (0,25 đ): Truy cập mọi lúc mọi nơi trên nhiều thiết bị; không sợ mất dữ liệu khi hỏng ổ cứng cá nhân.\nb) Lựa chọn phân quyền (0,25 đ): Chọn Editor (Người chỉnh sửa) để các thành viên trong nhóm cùng trực tiếp đóng góp nội dung vào bài làm.\nc) Biện pháp bảo mật (0,25 đ): Đặt mật khẩu mạnh kết hợp bật tính năng xác thực hai yếu tố (2FA)."
    },
    {
      "id": 3,
      "num": 3,
      "pointsText": "0,75 điểm",
      "context": "Trong phần mềm thiết kế đồ họa Inkscape:",
      "subItems": [
        {
          "letter": "a",
          "text": "Để vẽ một hình tròn hoàn hảo hoặc hình vuông chuẩn xác (không bị méo thành hình elip hay hình chữ nhật), em cần giữ phím nào trên bàn phím khi kéo thả chuột? (0,25 đ)"
        },
        {
          "letter": "b",
          "text": "Trình bày sự khác biệt giữa hai thuộc tính màu sắc: màu tô nền (Fill) và màu đường viền (Stroke) của một hình khối trong Inkscape. (0,25 đ)"
        },
        {
          "letter": "c",
          "text": "Sau khi vẽ xong một logo của lớp, em nên xuất sản phẩm sang định dạng ảnh nào (PNG hay JPG) nếu muốn giữ nền trong suốt để chèn vào các ấn phẩm kỷ yếu? (0,25 đ)"
        }
      ],
      "modelAnswer": "a) Phím thao tác hình chuẩn (0,25 đ): Giữ phím Ctrl khi kéo thả chuột.\nb) Phân biệt Fill và Stroke (0,25 đ): Fill là màu tô bên trong diện tích hình khối; Stroke là màu của đường viền bao quanh hình khối.\nc) Định dạng ảnh xuất (0,25 đ): Xuất sang tệp ảnh PNG vì PNG hỗ trợ kênh màu Alpha trong suốt, JPG không hỗ trợ."
    }
  ],
  "officialExams": {
    "101": {
      "code": "101",
      "title": "Đề Kiểm Tra Giữa Học Kì 1 - Tin Học 10 (Mã đề 101)",
      "durationMinutes": 45,
      "part1_mcq": [
        {
          "id": 1,
          "num": 1,
          "question": "Công cụ Google Translate phân tích ngữ liệu và dịch ngôn ngữ dựa trên công nghệ cốt lõi nào?",
          "options": [
            "Khả năng ghi nhớ cơ học các bảng mã ký tự nhị phân của phần cứng.",
            "Quá trình tra cứu thủ công của các dịch thuật viên trực tuyến 24/7.",
            "Trí tuệ nhân tạo và các mô hình học máy xử lý ngôn ngữ tự nhiên.",
            "Thuật toán tìm kiếm từ khóa thuần túy trong từ điển cố định."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 2,
          "num": 2,
          "question": "Tệp tin đồ họa được thiết kế bằng phần mềm mã nguồn mở Inkscape có phần mở rộng mặc định là:",
          "options": [
            ".svg",
            ".docx",
            ".mp4",
            ".xlsx"
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 3,
          "num": 3,
          "question": "Hành vi nào sau đây vi phạm quyền tác giả trong môi trường số?",
          "options": [
            "Tải phần mềm thương mại từ mạng lậu rồi bẻ khóa để sử dụng không trả phí.",
            "Trích dẫn một đoạn văn ngắn trong bài tập và ghi rõ tên tác giả cùng nguồn tài liệu.",
            "Sử dụng hình ảnh có giấy phép mở Creative Commons kèm trích dẫn tác giả gốc.",
            "Mua bản quyền sử dụng phần mềm và cài đặt trên đúng số lượng máy quy định."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 4,
          "num": 4,
          "question": "Trong các kho dữ liệu số trực tuyến, thông tin thường được tổ chức và phân loại theo cách nào?",
          "options": [
            "Cấu trúc thư mục phân cấp rõ ràng theo chủ đề và từ khóa tra cứu.",
            "Tự động xóa bớt các tài liệu học tập cũ sau mỗi chu kỳ 48 giờ lưu.",
            "Trộn lẫn toàn bộ tài liệu văn bản và video vào một tệp tin duy nhất.",
            "Xếp ngẫu nhiên theo thứ tự thời gian người dùng truy cập vào trang."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 5,
          "num": 5,
          "question": "Ưu điểm vượt trội của thiết bị số so với các phương tiện lưu trữ truyền thống là:",
          "options": [
            "Luôn hoạt động ổn định mà không cần nguồn điện cấp vào.",
            "Không bao giờ xảy ra tình trạng hư hỏng phần cứng vật lý.",
            "Giúp lưu trữ lượng dữ liệu rất lớn với kích thước nhỏ gọn.",
            "Tự động chuyển đổi toàn bộ thông tin thành tiền điện tử."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 6,
          "num": 6,
          "question": "Quá trình xử lý thông tin cơ bản của máy tính diễn ra theo thứ tự nào sau đây?",
          "options": [
            "Thu nhận dữ liệu -> Xử lý dữ liệu -> Xuất hoặc lưu trữ thông tin.",
            "Lưu trữ dữ liệu -> Xuất thông tin -> Thu nhận các tín hiệu vào.",
            "Xuất thông tin -> Thu nhận dữ liệu -> Xử lý và truyền tải dữ liệu.",
            "Xử lý thông tin -> Thu nhận dữ liệu -> Xóa bỏ dữ liệu trong máy."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 7,
          "num": 7,
          "question": "Đặc trưng cơ bản nhất của hệ thống IoT (Internet of Things) là:",
          "options": [
            "Toàn bộ thiết bị bắt buộc phải sử dụng chung dây cáp mạng LAN.",
            "Người dùng bắt buộc phải trực tiếp điều khiển từng thao tác vi mô.",
            "Các thiết bị kết nối mạng để tự động trao đổi dữ liệu với nhau.",
            "Mọi thiết bị số đều phải dùng chung một màn hình hiển thị."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 8,
          "num": 8,
          "question": "Phát biểu nào sau đây phân biệt ĐÚNG giữa mạng LAN và mạng Internet?",
          "options": [
            "LAN có quy mô nhỏ trong một tòa nhà, Internet có quy mô toàn cầu.",
            "LAN luôn có hàng tỷ máy tính, Internet chỉ kết nối vài máy nội bộ.",
            "LAN thuộc sở hữu quốc tế, Internet thuộc sở hữu của một gia đình.",
            "LAN bắt buộc dùng sóng vô tuyến, Internet bắt buộc dùng cáp mạng."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 9,
          "num": 9,
          "question": "Thiết bị thông minh đóng vai trò cốt lõi nào trong cuộc Cách mạng công nghiệp lần thứ tư?",
          "options": [
            "Loại bỏ triệt để nhu cầu sử dụng mạng Internet trên toàn cầu.",
            "Đóng vai trò là thành phần thu thập và xử lý dữ liệu tự động.",
            "Buộc con người phải ngừng tham gia vào mọi quy trình sản xuất.",
            "Thay thế hoàn toàn mọi hoạt động tư duy sáng tạo nghệ thuật."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 10,
          "num": 10,
          "question": "Điểm khác biệt căn bản giữa ảnh đồ họa vector và ảnh đồ họa bitmap (raster) là:",
          "options": [
            "Ảnh vector tạo bởi công thức toán học, ảnh bitmap tạo bởi các điểm ảnh.",
            "Ảnh bitmap không bị vỡ hạt khi phóng to, ảnh vector bị vỡ hình.",
            "Ảnh vector có dung lượng tệp lớn hơn ảnh bitmap trong mọi trường hợp.",
            "Ảnh bitmap chỉ dùng trong in ấn, ảnh vector chỉ dùng hiển thị trên web."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 11,
          "num": 11,
          "question": "Trong mô hình thành phố thông minh, các cảm biến nhiệt độ tự động truyền số liệu về trung tâm nhằm:",
          "options": [
            "Buộc hệ thống điện lưới phải ngắt điện toàn bộ khu dân cư.",
            "Thay thế hoàn toàn vai trò của các nhà nghiên cứu khí tượng.",
            "Giúp giảm bớt chi phí mua sắm thiết bị máy chủ điều hành.",
            "Phục vụ công tác phân tích, dự báo và ra quyết định kịp thời."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 12,
          "num": 12,
          "question": "Thiết bị nào sau đây được phân loại là một thiết bị thông minh?",
          "options": [
            "Máy tính bỏ túi đơn giản chỉ thực hiện bốn phép tính.",
            "Quạt trần thông thường sử dụng hộp số điều chỉnh cơ.",
            "Bàn là nhiệt điện điều khiển bằng công tắc cơ học.",
            "Điện thoại thông minh có khả năng cài đặt ứng dụng."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 13,
          "num": 13,
          "question": "Dịch vụ đám mây cho phép người dùng sử dụng trực tiếp các phần mềm qua trình duyệt mạng là:",
          "options": [
            "SaaS (Phần mềm như một dịch vụ).",
            "IaaS (Hạ tầng như một dịch vụ).",
            "DaaS (Thiết bị như một dịch vụ).",
            "PaaS (Nền tảng như một dịch vụ)."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 14,
          "num": 14,
          "question": "Nguy cơ an toàn thông tin lớn nhất khi tải và sử dụng phần mềm bẻ khóa (crack) là:",
          "options": [
            "Pin thiết bị xách tay lập tức bị phồng và cháy nổ ngay tức thì.",
            "Bắt buộc người dùng phải nâng cấp cấu hình phần cứng đời mới.",
            "Màn hình máy tính bị giảm độ phân giải hiển thị vĩnh viễn.",
            "Thường bị đính kèm mã độc nhằm đánh cắp dữ liệu cá nhân."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 15,
          "num": 15,
          "question": "Trong tin học, dữ liệu số được định nghĩa chính xác là:",
          "options": [
            "Khả năng ghi nhớ của con người về thế giới tự nhiên.",
            "Tri thức tích lũy qua các bài giảng trong nhà trường.",
            "Ý nghĩa thực tế rút ra từ các sự kiện trong cuộc sống.",
            "Thông tin đã được mã hóa đưa vào máy tính xử lý."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 16,
          "num": 16,
          "question": "Theo Luật Sở hữu trí tuệ, quyền tác giả đối với tác phẩm phần mềm bao gồm hai nhóm quyền là:",
          "options": [
            "Quyền sở hữu và quyền hủy hoại.",
            "Quyền thương mại và quyền thế chấp.",
            "Quyền nhân thân và quyền tài sản.",
            "Quyền độc quyền và quyền tự do."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 17,
          "num": 17,
          "question": "Đặc điểm lây lan cơ bản của virus máy tính trong môi trường số là:",
          "options": [
            "Gắn mã độc vào các tệp tin khác để lây lan khi tệp đó được kích hoạt.",
            "Tự động lây lan sang các thiết bị điện tử gia dụng không có mạch số.",
            "Chỉ có thể truyền từ máy tính này sang máy tính khác qua đường dây điện.",
            "Tự động sinh ra ngay cả khi máy tính bị ngắt hoàn toàn mọi nguồn điện."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 18,
          "num": 18,
          "question": "Dịch vụ lưu trữ đám mây (Google Drive, OneDrive) mang lại tiện ích nổi bật nào?",
          "options": [
            "Giúp máy tính cá nhân miễn nhiễm với mọi loại mã độc tống tiền.",
            "Tự động nhân đôi tốc độ xử lý phần cứng của thiết bị cá nhân.",
            "Cho phép truy cập và đồng bộ dữ liệu mọi lúc khi có Internet.",
            "Giúp điện thoại thông minh không bao giờ bị tiêu hao pin khi dùng."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 19,
          "num": 19,
          "question": "Trong phần mềm đồ họa Inkscape, công cụ Select and Transform (phím tắt S) dùng để:",
          "options": [
            "Vẽ thêm các đường xoắn ốc phức tạp trên trang thiết kế.",
            "Xóa bỏ vĩnh viễn cấu hình card màn hình của máy tính đồ họa.",
            "Lựa chọn, di chuyển, thay đổi kích thước và xoay đối tượng.",
            "Đổi định dạng tệp tin đồ họa sang video hoạt hình đa sắc."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        }
      ],
      "part2_tf": [
        {
          "id": 1,
          "num": 1,
          "context": "Trong tiết thực hành Tin học, bạn An nhận được email từ một địa chỉ lạ với tiêu đề thông báo trúng thưởng điện thoại đính kèm tệp tin có tên Phanthuong.exe. Máy tính của An đang cài đặt phần mềm diệt virus có bản quyền.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Để kiểm tra an toàn, An nên tạm thời tắt phần mềm diệt virus rồi chạy tệp tin để xem nội dung bên trong trước.",
              "correctAnswer": false
            },
            {
              "letter": "b",
              "text": "Phần mềm diệt virus có thể tự động cảnh báo hoặc cách ly các tệp tin chứa mã độc đáng ngờ.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Việc mở ngay tệp tin .exe từ người lạ tiềm ẩn nguy cơ máy tính bị nhiễm phần mềm gián điệp (Trojan).",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Tệp tin có phần mở rộng .exe là tệp tin thực thi chương trình trong hệ điều hành Windows.",
              "correctAnswer": true
            }
          ],
          "type": "true_false"
        },
        {
          "id": 2,
          "num": 2,
          "context": "Bạn Lan thiết kế một video thuyết trình về danh lam thắng cảnh quê hương để đăng lên mạng xã hội. Lan muốn sử dụng một số bài hát và hình ảnh tìm kiếm được trên Internet làm tư liệu cho video.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Ký hiệu CC BY trên tác phẩm cho phép Lan tự do sử dụng tác phẩm nhưng bắt buộc phải ghi tên tác giả gốc.",
              "correctAnswer": true
            },
            {
              "letter": "b",
              "text": "Giấy phép Creative Commons (CC) là hệ thống giấy phép mở cho phép tác giả chia sẻ tác phẩm kèm điều kiện sử dụng.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Tác phẩm âm nhạc và hình ảnh kỹ thuật số là đối tượng được bảo hộ quyền tác giả theo pháp luật.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Lan có thể tải một bài hát độc quyền có thu phí trên mạng rồi lồng vào video, chỉ cần ghi chú ‘Tôi không giữ bản quyền bài hát này’ là hoàn toàn hợp pháp.",
              "correctAnswer": false
            }
          ],
          "type": "true_false"
        },
        {
          "id": 3,
          "num": 3,
          "context": "Một nhóm học sinh lớp 10 cùng thực hiện bài tập dự án học tập. Các bạn sử dụng điện thoại thông minh để chụp ảnh hoạt động thực tế và sử dụng dịch vụ lưu trữ đám mây Google Drive để chia sẻ dữ liệu cho các thành viên trong nhóm.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Để bảo vệ dữ liệu dự án không bị người ngoài sửa đổi, nhóm nên thiết lập quyền chia sẻ công khai là ‘Bất kỳ ai có liên kết đều có quyền chỉnh sửa (Editor)’.",
              "correctAnswer": false
            },
            {
              "letter": "b",
              "text": "Điện thoại thông minh là một hệ thống kỹ thuật số có khả năng thu nhận và xử lý dữ liệu hình ảnh.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Khi tải ảnh lên đám mây, các thành viên khác chỉ có thể xem được dữ liệu nếu được cấp quyền truy cập hợp lệ.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Google Drive là dịch vụ điện toán đám mây cho phép người dùng lưu trữ và chia sẻ tệp tin trực tuyến.",
              "correctAnswer": true
            }
          ],
          "type": "true_false"
        }
      ],
      "part3_essay": [
        {
          "id": 1,
          "num": 1,
          "pointsText": "(0,75 điểm)",
          "context": "Một thẻ nhớ máy ảnh có dung lượng lưu trữ hiển thị là 16 GB. Trung bình một bức ảnh kỹ thuật số chất lượng cao chụp từ máy ảnh này có dung lượng 8 MB.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy chuyển đổi dung lượng 16 GB sang đơn vị Megabyte (MB), biết 1 GB = 1024 MB."
            },
            {
              "letter": "b",
              "text": "Thẻ nhớ trên có thể lưu trữ tối đa được bao nhiêu bức ảnh kỹ thuật số có dung lượng nêu trên?"
            },
            {
              "letter": "c",
              "text": "Nếu người dùng chụp thêm các đoạn video ngắn có dung lượng 4 GB, hãy tính dung lượng trống còn lại của thẻ nhớ (theo đơn vị GB)."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Đổi GB sang MB (0,25 đ): 16 GB * 1024 = 16.384 MB.\nb) Số bức ảnh tối đa (0,25 đ): 16.384 / 8 = 2.048 bức ảnh.\nc) Dung lượng trống còn lại (0,25 đ): 16 - 4 = 12 GB."
        },
        {
          "id": 2,
          "num": 2,
          "pointsText": "(0,75 điểm)",
          "context": "Trường học của em đang triển khai mô hình học tập trực tuyến kết hợp lưu trữ đám mây cho học sinh khối 10.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy nêu 2 lợi ích thiết thực nhất của việc lưu trữ tài liệu học tập trên đám mây so với lưu trên ổ cứng máy tính cá nhân."
            },
            {
              "letter": "b",
              "text": "Khi chia sẻ một tài liệu học tập nhóm trên Google Drive, em sẽ chọn chế độ phân quyền nào (‘Người xem - Viewer’ hay ‘Người chỉnh sửa - Editor’) cho bạn cùng nhóm để cùng làm bài? Giải thích lý do."
            },
            {
              "letter": "c",
              "text": "Nêu một biện pháp quan trọng để bảo vệ tài khoản lưu trữ đám mây của em không bị kẻ xấu xâm nhập đánh cắp tài liệu."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Hai lợi ích lưu trữ đám mây (0,25 đ): Truy cập mọi lúc mọi nơi trên nhiều thiết bị; không sợ mất dữ liệu khi hỏng ổ cứng cá nhân.\nb) Lựa chọn phân quyền (0,25 đ): Chọn Editor (Người chỉnh sửa) để các thành viên trong nhóm cùng trực tiếp đóng góp nội dung vào bài làm.\nc) Biện pháp bảo mật (0,25 đ): Đặt mật khẩu mạnh kết hợp bật tính năng xác thực hai yếu tố (2FA)."
        },
        {
          "id": 3,
          "num": 3,
          "pointsText": "(0,75 điểm)",
          "context": "Trong phần mềm thiết kế đồ họa Inkscape:",
          "subItems": [
            {
              "letter": "a",
              "text": "Để vẽ một hình tròn hoàn hảo hoặc hình vuông chuẩn xác (không bị méo thành hình elip hay hình chữ nhật), em cần giữ phím nào trên bàn phím khi kéo thả chuột?"
            },
            {
              "letter": "b",
              "text": "Trình bày sự khác biệt giữa hai thuộc tính màu sắc: màu tô nền (Fill) và màu đường viền (Stroke) của một hình khối trong Inkscape."
            },
            {
              "letter": "c",
              "text": "Sau khi vẽ xong một logo của lớp, em nên xuất sản phẩm sang định dạng ảnh nào (PNG hay JPG) nếu muốn giữ nền trong suốt để chèn vào các ấn phẩm kỷ yếu?"
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Phím thao tác hình chuẩn (0,25 đ): Giữ phím Ctrl khi kéo thả chuột.\nb) Phân biệt Fill và Stroke (0,25 đ): Fill là màu tô bên trong diện tích hình khối; Stroke là màu của đường viền bao quanh hình khối.\nc) Định dạng ảnh xuất (0,25 đ): Xuất sang tệp ảnh PNG vì PNG hỗ trợ kênh màu Alpha trong suốt, JPG không hỗ trợ."
        }
      ],
      "totalPart1Points": 4.75,
      "totalPart2Points": 3,
      "totalPart3Points": 2.25,
      "totalPoints": 10
    },
    "102": {
      "code": "102",
      "title": "Đề Kiểm Tra Giữa Học Kì 1 - Tin Học 10 (Mã đề 102)",
      "durationMinutes": 45,
      "part1_mcq": [
        {
          "id": 1,
          "num": 1,
          "question": "Tệp tin đồ họa được thiết kế bằng phần mềm mã nguồn mở Inkscape có phần mở rộng mặc định là:",
          "options": [
            ".docx",
            ".svg",
            ".mp4",
            ".xlsx"
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 2,
          "num": 2,
          "question": "Công cụ Google Translate phân tích ngữ liệu và dịch ngôn ngữ dựa trên công nghệ cốt lõi nào?",
          "options": [
            "Khả năng ghi nhớ cơ học các bảng mã ký tự nhị phân của phần cứng.",
            "Trí tuệ nhân tạo và các mô hình học máy xử lý ngôn ngữ tự nhiên.",
            "Thuật toán tìm kiếm từ khóa thuần túy trong từ điển cố định.",
            "Quá trình tra cứu thủ công của các dịch thuật viên trực tuyến 24/7."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 3,
          "num": 3,
          "question": "Hành vi nào sau đây vi phạm quyền tác giả trong môi trường số?",
          "options": [
            "Trích dẫn một đoạn văn ngắn trong bài tập và ghi rõ tên tác giả cùng nguồn tài liệu.",
            "Mua bản quyền sử dụng phần mềm và cài đặt trên đúng số lượng máy quy định.",
            "Sử dụng hình ảnh có giấy phép mở Creative Commons kèm trích dẫn tác giả gốc.",
            "Tải phần mềm thương mại từ mạng lậu rồi bẻ khóa để sử dụng không trả phí."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 4,
          "num": 4,
          "question": "Trong các kho dữ liệu số trực tuyến, thông tin thường được tổ chức và phân loại theo cách nào?",
          "options": [
            "Cấu trúc thư mục phân cấp rõ ràng theo chủ đề và từ khóa tra cứu.",
            "Tự động xóa bớt các tài liệu học tập cũ sau mỗi chu kỳ 48 giờ lưu.",
            "Trộn lẫn toàn bộ tài liệu văn bản và video vào một tệp tin duy nhất.",
            "Xếp ngẫu nhiên theo thứ tự thời gian người dùng truy cập vào trang."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 5,
          "num": 5,
          "question": "Quá trình xử lý thông tin cơ bản của máy tính diễn ra theo thứ tự nào sau đây?",
          "options": [
            "Xuất thông tin -> Thu nhận dữ liệu -> Xử lý và truyền tải dữ liệu.",
            "Xử lý thông tin -> Thu nhận dữ liệu -> Xóa bỏ dữ liệu trong máy.",
            "Lưu trữ dữ liệu -> Xuất thông tin -> Thu nhận các tín hiệu vào.",
            "Thu nhận dữ liệu -> Xử lý dữ liệu -> Xuất hoặc lưu trữ thông tin."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 6,
          "num": 6,
          "question": "Ưu điểm vượt trội của thiết bị số so với các phương tiện lưu trữ truyền thống là:",
          "options": [
            "Không bao giờ xảy ra tình trạng hư hỏng phần cứng vật lý.",
            "Tự động chuyển đổi toàn bộ thông tin thành tiền điện tử.",
            "Luôn hoạt động ổn định mà không cần nguồn điện cấp vào.",
            "Giúp lưu trữ lượng dữ liệu rất lớn với kích thước nhỏ gọn."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 7,
          "num": 7,
          "question": "Đặc trưng cơ bản nhất của hệ thống IoT (Internet of Things) là:",
          "options": [
            "Mọi thiết bị số đều phải dùng chung một màn hình hiển thị.",
            "Người dùng bắt buộc phải trực tiếp điều khiển từng thao tác vi mô.",
            "Các thiết bị kết nối mạng để tự động trao đổi dữ liệu với nhau.",
            "Toàn bộ thiết bị bắt buộc phải sử dụng chung dây cáp mạng LAN."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 8,
          "num": 8,
          "question": "Phát biểu nào sau đây phân biệt ĐÚNG giữa mạng LAN và mạng Internet?",
          "options": [
            "LAN thuộc sở hữu quốc tế, Internet thuộc sở hữu của một gia đình.",
            "LAN bắt buộc dùng sóng vô tuyến, Internet bắt buộc dùng cáp mạng.",
            "LAN có quy mô nhỏ trong một tòa nhà, Internet có quy mô toàn cầu.",
            "LAN luôn có hàng tỷ máy tính, Internet chỉ kết nối vài máy nội bộ."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 9,
          "num": 9,
          "question": "Điểm khác biệt căn bản giữa ảnh đồ họa vector và ảnh đồ họa bitmap (raster) là:",
          "options": [
            "Ảnh vector có dung lượng tệp lớn hơn ảnh bitmap trong mọi trường hợp.",
            "Ảnh bitmap không bị vỡ hạt khi phóng to, ảnh vector bị vỡ hình.",
            "Ảnh vector tạo bởi công thức toán học, ảnh bitmap tạo bởi các điểm ảnh.",
            "Ảnh bitmap chỉ dùng trong in ấn, ảnh vector chỉ dùng hiển thị trên web."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 10,
          "num": 10,
          "question": "Thiết bị thông minh đóng vai trò cốt lõi nào trong cuộc Cách mạng công nghiệp lần thứ tư?",
          "options": [
            "Đóng vai trò là thành phần thu thập và xử lý dữ liệu tự động.",
            "Buộc con người phải ngừng tham gia vào mọi quy trình sản xuất.",
            "Loại bỏ triệt để nhu cầu sử dụng mạng Internet trên toàn cầu.",
            "Thay thế hoàn toàn mọi hoạt động tư duy sáng tạo nghệ thuật."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 11,
          "num": 11,
          "question": "Nguy cơ an toàn thông tin lớn nhất khi tải và sử dụng phần mềm bẻ khóa (crack) là:",
          "options": [
            "Thường bị đính kèm mã độc nhằm đánh cắp dữ liệu cá nhân.",
            "Pin thiết bị xách tay lập tức bị phồng và cháy nổ ngay tức thì.",
            "Màn hình máy tính bị giảm độ phân giải hiển thị vĩnh viễn.",
            "Bắt buộc người dùng phải nâng cấp cấu hình phần cứng đời mới."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 12,
          "num": 12,
          "question": "Trong mô hình thành phố thông minh, các cảm biến nhiệt độ tự động truyền số liệu về trung tâm nhằm:",
          "options": [
            "Phục vụ công tác phân tích, dự báo và ra quyết định kịp thời.",
            "Buộc hệ thống điện lưới phải ngắt điện toàn bộ khu dân cư.",
            "Thay thế hoàn toàn vai trò của các nhà nghiên cứu khí tượng.",
            "Giúp giảm bớt chi phí mua sắm thiết bị máy chủ điều hành."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 13,
          "num": 13,
          "question": "Dịch vụ đám mây cho phép người dùng sử dụng trực tiếp các phần mềm qua trình duyệt mạng là:",
          "options": [
            "SaaS (Phần mềm như một dịch vụ).",
            "DaaS (Thiết bị như một dịch vụ).",
            "IaaS (Hạ tầng như một dịch vụ).",
            "PaaS (Nền tảng như một dịch vụ)."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 14,
          "num": 14,
          "question": "Thiết bị nào sau đây được phân loại là một thiết bị thông minh?",
          "options": [
            "Máy tính bỏ túi đơn giản chỉ thực hiện bốn phép tính.",
            "Điện thoại thông minh có khả năng cài đặt ứng dụng.",
            "Bàn là nhiệt điện điều khiển bằng công tắc cơ học.",
            "Quạt trần thông thường sử dụng hộp số điều chỉnh cơ."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 15,
          "num": 15,
          "question": "Trong tin học, dữ liệu số được định nghĩa chính xác là:",
          "options": [
            "Tri thức tích lũy qua các bài giảng trong nhà trường.",
            "Khả năng ghi nhớ của con người về thế giới tự nhiên.",
            "Thông tin đã được mã hóa đưa vào máy tính xử lý.",
            "Ý nghĩa thực tế rút ra từ các sự kiện trong cuộc sống."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 16,
          "num": 16,
          "question": "Theo Luật Sở hữu trí tuệ, quyền tác giả đối với tác phẩm phần mềm bao gồm hai nhóm quyền là:",
          "options": [
            "Quyền thương mại và quyền thế chấp.",
            "Quyền nhân thân và quyền tài sản.",
            "Quyền độc quyền và quyền tự do.",
            "Quyền sở hữu và quyền hủy hoại."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 17,
          "num": 17,
          "question": "Dịch vụ lưu trữ đám mây (Google Drive, OneDrive) mang lại tiện ích nổi bật nào?",
          "options": [
            "Tự động nhân đôi tốc độ xử lý phần cứng của thiết bị cá nhân.",
            "Giúp điện thoại thông minh không bao giờ bị tiêu hao pin khi dùng.",
            "Cho phép truy cập và đồng bộ dữ liệu mọi lúc khi có Internet.",
            "Giúp máy tính cá nhân miễn nhiễm với mọi loại mã độc tống tiền."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 18,
          "num": 18,
          "question": "Trong phần mềm đồ họa Inkscape, công cụ Select and Transform (phím tắt S) dùng để:",
          "options": [
            "Lựa chọn, di chuyển, thay đổi kích thước và xoay đối tượng.",
            "Đổi định dạng tệp tin đồ họa sang video hoạt hình đa sắc.",
            "Vẽ thêm các đường xoắn ốc phức tạp trên trang thiết kế.",
            "Xóa bỏ vĩnh viễn cấu hình card màn hình của máy tính đồ họa."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 19,
          "num": 19,
          "question": "Đặc điểm lây lan cơ bản của virus máy tính trong môi trường số là:",
          "options": [
            "Gắn mã độc vào các tệp tin khác để lây lan khi tệp đó được kích hoạt.",
            "Tự động sinh ra ngay cả khi máy tính bị ngắt hoàn toàn mọi nguồn điện.",
            "Chỉ có thể truyền từ máy tính này sang máy tính khác qua đường dây điện.",
            "Tự động lây lan sang các thiết bị điện tử gia dụng không có mạch số."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        }
      ],
      "part2_tf": [
        {
          "id": 1,
          "num": 1,
          "context": "Trong tiết thực hành Tin học, bạn An nhận được email từ một địa chỉ lạ với tiêu đề thông báo trúng thưởng điện thoại đính kèm tệp tin có tên Phanthuong.exe. Máy tính của An đang cài đặt phần mềm diệt virus có bản quyền.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Việc mở ngay tệp tin .exe từ người lạ tiềm ẩn nguy cơ máy tính bị nhiễm phần mềm gián điệp (Trojan).",
              "correctAnswer": true
            },
            {
              "letter": "b",
              "text": "Tệp tin có phần mở rộng .exe là tệp tin thực thi chương trình trong hệ điều hành Windows.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Phần mềm diệt virus có thể tự động cảnh báo hoặc cách ly các tệp tin chứa mã độc đáng ngờ.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Để kiểm tra an toàn, An nên tạm thời tắt phần mềm diệt virus rồi chạy tệp tin để xem nội dung bên trong trước.",
              "correctAnswer": false
            }
          ],
          "type": "true_false"
        },
        {
          "id": 2,
          "num": 2,
          "context": "Bạn Lan thiết kế một video thuyết trình về danh lam thắng cảnh quê hương để đăng lên mạng xã hội. Lan muốn sử dụng một số bài hát và hình ảnh tìm kiếm được trên Internet làm tư liệu cho video.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Ký hiệu CC BY trên tác phẩm cho phép Lan tự do sử dụng tác phẩm nhưng bắt buộc phải ghi tên tác giả gốc.",
              "correctAnswer": true
            },
            {
              "letter": "b",
              "text": "Tác phẩm âm nhạc và hình ảnh kỹ thuật số là đối tượng được bảo hộ quyền tác giả theo pháp luật.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Giấy phép Creative Commons (CC) là hệ thống giấy phép mở cho phép tác giả chia sẻ tác phẩm kèm điều kiện sử dụng.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Lan có thể tải một bài hát độc quyền có thu phí trên mạng rồi lồng vào video, chỉ cần ghi chú ‘Tôi không giữ bản quyền bài hát này’ là hoàn toàn hợp pháp.",
              "correctAnswer": false
            }
          ],
          "type": "true_false"
        },
        {
          "id": 3,
          "num": 3,
          "context": "Một nhóm học sinh lớp 10 cùng thực hiện bài tập dự án học tập. Các bạn sử dụng điện thoại thông minh để chụp ảnh hoạt động thực tế và sử dụng dịch vụ lưu trữ đám mây Google Drive để chia sẻ dữ liệu cho các thành viên trong nhóm.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Khi tải ảnh lên đám mây, các thành viên khác chỉ có thể xem được dữ liệu nếu được cấp quyền truy cập hợp lệ.",
              "correctAnswer": true
            },
            {
              "letter": "b",
              "text": "Điện thoại thông minh là một hệ thống kỹ thuật số có khả năng thu nhận và xử lý dữ liệu hình ảnh.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Google Drive là dịch vụ điện toán đám mây cho phép người dùng lưu trữ và chia sẻ tệp tin trực tuyến.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Để bảo vệ dữ liệu dự án không bị người ngoài sửa đổi, nhóm nên thiết lập quyền chia sẻ công khai là ‘Bất kỳ ai có liên kết đều có quyền chỉnh sửa (Editor)’.",
              "correctAnswer": false
            }
          ],
          "type": "true_false"
        }
      ],
      "part3_essay": [
        {
          "id": 1,
          "num": 1,
          "pointsText": "(0,75 điểm)",
          "context": "Một thẻ nhớ máy ảnh có dung lượng lưu trữ hiển thị là 16 GB. Trung bình một bức ảnh kỹ thuật số chất lượng cao chụp từ máy ảnh này có dung lượng 8 MB.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy chuyển đổi dung lượng 16 GB sang đơn vị Megabyte (MB), biết 1 GB = 1024 MB."
            },
            {
              "letter": "b",
              "text": "Thẻ nhớ trên có thể lưu trữ tối đa được bao nhiêu bức ảnh kỹ thuật số có dung lượng nêu trên?"
            },
            {
              "letter": "c",
              "text": "Nếu người dùng chụp thêm các đoạn video ngắn có dung lượng 4 GB, hãy tính dung lượng trống còn lại của thẻ nhớ (theo đơn vị GB)."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Đổi GB sang MB (0,25 đ): 16 GB * 1024 = 16.384 MB.\nb) Số bức ảnh tối đa (0,25 đ): 16.384 / 8 = 2.048 bức ảnh.\nc) Dung lượng trống còn lại (0,25 đ): 16 - 4 = 12 GB."
        },
        {
          "id": 2,
          "num": 2,
          "pointsText": "(0,75 điểm)",
          "context": "Trường học của em đang triển khai mô hình học tập trực tuyến kết hợp lưu trữ đám mây cho học sinh khối 10.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy nêu 2 lợi ích thiết thực nhất của việc lưu trữ tài liệu học tập trên đám mây so với lưu trên ổ cứng máy tính cá nhân."
            },
            {
              "letter": "b",
              "text": "Khi chia sẻ một tài liệu học tập nhóm trên Google Drive, em sẽ chọn chế độ phân quyền nào (‘Người xem - Viewer’ hay ‘Người chỉnh sửa - Editor’) cho bạn cùng nhóm để cùng làm bài? Giải thích lý do."
            },
            {
              "letter": "c",
              "text": "Nêu một biện pháp quan trọng để bảo vệ tài khoản lưu trữ đám mây của em không bị kẻ xấu xâm nhập đánh cắp tài liệu."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Hai lợi ích lưu trữ đám mây (0,25 đ): Truy cập mọi lúc mọi nơi trên nhiều thiết bị; không sợ mất dữ liệu khi hỏng ổ cứng cá nhân.\nb) Lựa chọn phân quyền (0,25 đ): Chọn Editor (Người chỉnh sửa) để các thành viên trong nhóm cùng trực tiếp đóng góp nội dung vào bài làm.\nc) Biện pháp bảo mật (0,25 đ): Đặt mật khẩu mạnh kết hợp bật tính năng xác thực hai yếu tố (2FA)."
        },
        {
          "id": 3,
          "num": 3,
          "pointsText": "(0,75 điểm)",
          "context": "Trong phần mềm thiết kế đồ họa Inkscape:",
          "subItems": [
            {
              "letter": "a",
              "text": "Để vẽ một hình tròn hoàn hảo hoặc hình vuông chuẩn xác (không bị méo thành hình elip hay hình chữ nhật), em cần giữ phím nào trên bàn phím khi kéo thả chuột?"
            },
            {
              "letter": "b",
              "text": "Trình bày sự khác biệt giữa hai thuộc tính màu sắc: màu tô nền (Fill) và màu đường viền (Stroke) của một hình khối trong Inkscape."
            },
            {
              "letter": "c",
              "text": "Sau khi vẽ xong một logo của lớp, em nên xuất sản phẩm sang định dạng ảnh nào (PNG hay JPG) nếu muốn giữ nền trong suốt để chèn vào các ấn phẩm kỷ yếu?"
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Phím thao tác hình chuẩn (0,25 đ): Giữ phím Ctrl khi kéo thả chuột.\nb) Phân biệt Fill và Stroke (0,25 đ): Fill là màu tô bên trong diện tích hình khối; Stroke là màu của đường viền bao quanh hình khối.\nc) Định dạng ảnh xuất (0,25 đ): Xuất sang tệp ảnh PNG vì PNG hỗ trợ kênh màu Alpha trong suốt, JPG không hỗ trợ."
        }
      ],
      "totalPart1Points": 4.75,
      "totalPart2Points": 3,
      "totalPart3Points": 2.25,
      "totalPoints": 10
    },
    "103": {
      "code": "103",
      "title": "Đề Kiểm Tra Giữa Học Kì 1 - Tin Học 10 (Mã đề 103)",
      "durationMinutes": 45,
      "part1_mcq": [
        {
          "id": 1,
          "num": 1,
          "question": "Hành vi nào sau đây vi phạm quyền tác giả trong môi trường số?",
          "options": [
            "Trích dẫn một đoạn văn ngắn trong bài tập và ghi rõ tên tác giả cùng nguồn tài liệu.",
            "Sử dụng hình ảnh có giấy phép mở Creative Commons kèm trích dẫn tác giả gốc.",
            "Mua bản quyền sử dụng phần mềm và cài đặt trên đúng số lượng máy quy định.",
            "Tải phần mềm thương mại từ mạng lậu rồi bẻ khóa để sử dụng không trả phí."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 2,
          "num": 2,
          "question": "Tệp tin đồ họa được thiết kế bằng phần mềm mã nguồn mở Inkscape có phần mở rộng mặc định là:",
          "options": [
            ".svg",
            ".mp4",
            ".docx",
            ".xlsx"
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 3,
          "num": 3,
          "question": "Công cụ Google Translate phân tích ngữ liệu và dịch ngôn ngữ dựa trên công nghệ cốt lõi nào?",
          "options": [
            "Thuật toán tìm kiếm từ khóa thuần túy trong từ điển cố định.",
            "Khả năng ghi nhớ cơ học các bảng mã ký tự nhị phân của phần cứng.",
            "Quá trình tra cứu thủ công của các dịch thuật viên trực tuyến 24/7.",
            "Trí tuệ nhân tạo và các mô hình học máy xử lý ngôn ngữ tự nhiên."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 4,
          "num": 4,
          "question": "Quá trình xử lý thông tin cơ bản của máy tính diễn ra theo thứ tự nào sau đây?",
          "options": [
            "Thu nhận dữ liệu -> Xử lý dữ liệu -> Xuất hoặc lưu trữ thông tin.",
            "Xuất thông tin -> Thu nhận dữ liệu -> Xử lý và truyền tải dữ liệu.",
            "Xử lý thông tin -> Thu nhận dữ liệu -> Xóa bỏ dữ liệu trong máy.",
            "Lưu trữ dữ liệu -> Xuất thông tin -> Thu nhận các tín hiệu vào."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 5,
          "num": 5,
          "question": "Ưu điểm vượt trội của thiết bị số so với các phương tiện lưu trữ truyền thống là:",
          "options": [
            "Luôn hoạt động ổn định mà không cần nguồn điện cấp vào.",
            "Giúp lưu trữ lượng dữ liệu rất lớn với kích thước nhỏ gọn.",
            "Tự động chuyển đổi toàn bộ thông tin thành tiền điện tử.",
            "Không bao giờ xảy ra tình trạng hư hỏng phần cứng vật lý."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 6,
          "num": 6,
          "question": "Đặc trưng cơ bản nhất của hệ thống IoT (Internet of Things) là:",
          "options": [
            "Các thiết bị kết nối mạng để tự động trao đổi dữ liệu với nhau.",
            "Mọi thiết bị số đều phải dùng chung một màn hình hiển thị.",
            "Người dùng bắt buộc phải trực tiếp điều khiển từng thao tác vi mô.",
            "Toàn bộ thiết bị bắt buộc phải sử dụng chung dây cáp mạng LAN."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 7,
          "num": 7,
          "question": "Trong các kho dữ liệu số trực tuyến, thông tin thường được tổ chức và phân loại theo cách nào?",
          "options": [
            "Cấu trúc thư mục phân cấp rõ ràng theo chủ đề và từ khóa tra cứu.",
            "Xếp ngẫu nhiên theo thứ tự thời gian người dùng truy cập vào trang.",
            "Tự động xóa bớt các tài liệu học tập cũ sau mỗi chu kỳ 48 giờ lưu.",
            "Trộn lẫn toàn bộ tài liệu văn bản và video vào một tệp tin duy nhất."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 8,
          "num": 8,
          "question": "Phát biểu nào sau đây phân biệt ĐÚNG giữa mạng LAN và mạng Internet?",
          "options": [
            "LAN có quy mô nhỏ trong một tòa nhà, Internet có quy mô toàn cầu.",
            "LAN thuộc sở hữu quốc tế, Internet thuộc sở hữu của một gia đình.",
            "LAN bắt buộc dùng sóng vô tuyến, Internet bắt buộc dùng cáp mạng.",
            "LAN luôn có hàng tỷ máy tính, Internet chỉ kết nối vài máy nội bộ."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 9,
          "num": 9,
          "question": "Điểm khác biệt căn bản giữa ảnh đồ họa vector và ảnh đồ họa bitmap (raster) là:",
          "options": [
            "Ảnh vector có dung lượng tệp lớn hơn ảnh bitmap trong mọi trường hợp.",
            "Ảnh vector tạo bởi công thức toán học, ảnh bitmap tạo bởi các điểm ảnh.",
            "Ảnh bitmap không bị vỡ hạt khi phóng to, ảnh vector bị vỡ hình.",
            "Ảnh bitmap chỉ dùng trong in ấn, ảnh vector chỉ dùng hiển thị trên web."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 10,
          "num": 10,
          "question": "Thiết bị thông minh đóng vai trò cốt lõi nào trong cuộc Cách mạng công nghiệp lần thứ tư?",
          "options": [
            "Đóng vai trò là thành phần thu thập và xử lý dữ liệu tự động.",
            "Buộc con người phải ngừng tham gia vào mọi quy trình sản xuất.",
            "Thay thế hoàn toàn mọi hoạt động tư duy sáng tạo nghệ thuật.",
            "Loại bỏ triệt để nhu cầu sử dụng mạng Internet trên toàn cầu."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 11,
          "num": 11,
          "question": "Trong mô hình thành phố thông minh, các cảm biến nhiệt độ tự động truyền số liệu về trung tâm nhằm:",
          "options": [
            "Phục vụ công tác phân tích, dự báo và ra quyết định kịp thời.",
            "Thay thế hoàn toàn vai trò của các nhà nghiên cứu khí tượng.",
            "Giúp giảm bớt chi phí mua sắm thiết bị máy chủ điều hành.",
            "Buộc hệ thống điện lưới phải ngắt điện toàn bộ khu dân cư."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 12,
          "num": 12,
          "question": "Dịch vụ đám mây cho phép người dùng sử dụng trực tiếp các phần mềm qua trình duyệt mạng là:",
          "options": [
            "PaaS (Nền tảng như một dịch vụ).",
            "SaaS (Phần mềm như một dịch vụ).",
            "DaaS (Thiết bị như một dịch vụ).",
            "IaaS (Hạ tầng như một dịch vụ)."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 13,
          "num": 13,
          "question": "Thiết bị nào sau đây được phân loại là một thiết bị thông minh?",
          "options": [
            "Bàn là nhiệt điện điều khiển bằng công tắc cơ học.",
            "Quạt trần thông thường sử dụng hộp số điều chỉnh cơ.",
            "Điện thoại thông minh có khả năng cài đặt ứng dụng.",
            "Máy tính bỏ túi đơn giản chỉ thực hiện bốn phép tính."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 14,
          "num": 14,
          "question": "Nguy cơ an toàn thông tin lớn nhất khi tải và sử dụng phần mềm bẻ khóa (crack) là:",
          "options": [
            "Pin thiết bị xách tay lập tức bị phồng và cháy nổ ngay tức thì.",
            "Bắt buộc người dùng phải nâng cấp cấu hình phần cứng đời mới.",
            "Thường bị đính kèm mã độc nhằm đánh cắp dữ liệu cá nhân.",
            "Màn hình máy tính bị giảm độ phân giải hiển thị vĩnh viễn."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 15,
          "num": 15,
          "question": "Trong tin học, dữ liệu số được định nghĩa chính xác là:",
          "options": [
            "Khả năng ghi nhớ của con người về thế giới tự nhiên.",
            "Tri thức tích lũy qua các bài giảng trong nhà trường.",
            "Ý nghĩa thực tế rút ra từ các sự kiện trong cuộc sống.",
            "Thông tin đã được mã hóa đưa vào máy tính xử lý."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 16,
          "num": 16,
          "question": "Theo Luật Sở hữu trí tuệ, quyền tác giả đối với tác phẩm phần mềm bao gồm hai nhóm quyền là:",
          "options": [
            "Quyền sở hữu và quyền hủy hoại.",
            "Quyền nhân thân và quyền tài sản.",
            "Quyền độc quyền và quyền tự do.",
            "Quyền thương mại và quyền thế chấp."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 17,
          "num": 17,
          "question": "Đặc điểm lây lan cơ bản của virus máy tính trong môi trường số là:",
          "options": [
            "Gắn mã độc vào các tệp tin khác để lây lan khi tệp đó được kích hoạt.",
            "Chỉ có thể truyền từ máy tính này sang máy tính khác qua đường dây điện.",
            "Tự động lây lan sang các thiết bị điện tử gia dụng không có mạch số.",
            "Tự động sinh ra ngay cả khi máy tính bị ngắt hoàn toàn mọi nguồn điện."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 18,
          "num": 18,
          "question": "Trong phần mềm đồ họa Inkscape, công cụ Select and Transform (phím tắt S) dùng để:",
          "options": [
            "Đổi định dạng tệp tin đồ họa sang video hoạt hình đa sắc.",
            "Vẽ thêm các đường xoắn ốc phức tạp trên trang thiết kế.",
            "Xóa bỏ vĩnh viễn cấu hình card màn hình của máy tính đồ họa.",
            "Lựa chọn, di chuyển, thay đổi kích thước và xoay đối tượng."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 19,
          "num": 19,
          "question": "Dịch vụ lưu trữ đám mây (Google Drive, OneDrive) mang lại tiện ích nổi bật nào?",
          "options": [
            "Giúp điện thoại thông minh không bao giờ bị tiêu hao pin khi dùng.",
            "Tự động nhân đôi tốc độ xử lý phần cứng của thiết bị cá nhân.",
            "Cho phép truy cập và đồng bộ dữ liệu mọi lúc khi có Internet.",
            "Giúp máy tính cá nhân miễn nhiễm với mọi loại mã độc tống tiền."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        }
      ],
      "part2_tf": [
        {
          "id": 1,
          "num": 1,
          "context": "Trong tiết thực hành Tin học, bạn An nhận được email từ một địa chỉ lạ với tiêu đề thông báo trúng thưởng điện thoại đính kèm tệp tin có tên Phanthuong.exe. Máy tính của An đang cài đặt phần mềm diệt virus có bản quyền.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Phần mềm diệt virus có thể tự động cảnh báo hoặc cách ly các tệp tin chứa mã độc đáng ngờ.",
              "correctAnswer": true
            },
            {
              "letter": "b",
              "text": "Tệp tin có phần mở rộng .exe là tệp tin thực thi chương trình trong hệ điều hành Windows.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Việc mở ngay tệp tin .exe từ người lạ tiềm ẩn nguy cơ máy tính bị nhiễm phần mềm gián điệp (Trojan).",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Để kiểm tra an toàn, An nên tạm thời tắt phần mềm diệt virus rồi chạy tệp tin để xem nội dung bên trong trước.",
              "correctAnswer": false
            }
          ],
          "type": "true_false"
        },
        {
          "id": 2,
          "num": 2,
          "context": "Bạn Lan thiết kế một video thuyết trình về danh lam thắng cảnh quê hương để đăng lên mạng xã hội. Lan muốn sử dụng một số bài hát và hình ảnh tìm kiếm được trên Internet làm tư liệu cho video.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Lan có thể tải một bài hát độc quyền có thu phí trên mạng rồi lồng vào video, chỉ cần ghi chú ‘Tôi không giữ bản quyền bài hát này’ là hoàn toàn hợp pháp.",
              "correctAnswer": false
            },
            {
              "letter": "b",
              "text": "Giấy phép Creative Commons (CC) là hệ thống giấy phép mở cho phép tác giả chia sẻ tác phẩm kèm điều kiện sử dụng.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Tác phẩm âm nhạc và hình ảnh kỹ thuật số là đối tượng được bảo hộ quyền tác giả theo pháp luật.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Ký hiệu CC BY trên tác phẩm cho phép Lan tự do sử dụng tác phẩm nhưng bắt buộc phải ghi tên tác giả gốc.",
              "correctAnswer": true
            }
          ],
          "type": "true_false"
        },
        {
          "id": 3,
          "num": 3,
          "context": "Một nhóm học sinh lớp 10 cùng thực hiện bài tập dự án học tập. Các bạn sử dụng điện thoại thông minh để chụp ảnh hoạt động thực tế và sử dụng dịch vụ lưu trữ đám mây Google Drive để chia sẻ dữ liệu cho các thành viên trong nhóm.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Để bảo vệ dữ liệu dự án không bị người ngoài sửa đổi, nhóm nên thiết lập quyền chia sẻ công khai là ‘Bất kỳ ai có liên kết đều có quyền chỉnh sửa (Editor)’.",
              "correctAnswer": false
            },
            {
              "letter": "b",
              "text": "Khi tải ảnh lên đám mây, các thành viên khác chỉ có thể xem được dữ liệu nếu được cấp quyền truy cập hợp lệ.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Google Drive là dịch vụ điện toán đám mây cho phép người dùng lưu trữ và chia sẻ tệp tin trực tuyến.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Điện thoại thông minh là một hệ thống kỹ thuật số có khả năng thu nhận và xử lý dữ liệu hình ảnh.",
              "correctAnswer": true
            }
          ],
          "type": "true_false"
        }
      ],
      "part3_essay": [
        {
          "id": 1,
          "num": 1,
          "pointsText": "(0,75 điểm)",
          "context": "Một thẻ nhớ máy ảnh có dung lượng lưu trữ hiển thị là 16 GB. Trung bình một bức ảnh kỹ thuật số chất lượng cao chụp từ máy ảnh này có dung lượng 8 MB.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy chuyển đổi dung lượng 16 GB sang đơn vị Megabyte (MB), biết 1 GB = 1024 MB."
            },
            {
              "letter": "b",
              "text": "Thẻ nhớ trên có thể lưu trữ tối đa được bao nhiêu bức ảnh kỹ thuật số có dung lượng nêu trên?"
            },
            {
              "letter": "c",
              "text": "Nếu người dùng chụp thêm các đoạn video ngắn có dung lượng 4 GB, hãy tính dung lượng trống còn lại của thẻ nhớ (theo đơn vị GB)."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Đổi GB sang MB (0,25 đ): 16 GB * 1024 = 16.384 MB.\nb) Số bức ảnh tối đa (0,25 đ): 16.384 / 8 = 2.048 bức ảnh.\nc) Dung lượng trống còn lại (0,25 đ): 16 - 4 = 12 GB."
        },
        {
          "id": 2,
          "num": 2,
          "pointsText": "(0,75 điểm)",
          "context": "Trường học của em đang triển khai mô hình học tập trực tuyến kết hợp lưu trữ đám mây cho học sinh khối 10.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy nêu 2 lợi ích thiết thực nhất của việc lưu trữ tài liệu học tập trên đám mây so với lưu trên ổ cứng máy tính cá nhân."
            },
            {
              "letter": "b",
              "text": "Khi chia sẻ một tài liệu học tập nhóm trên Google Drive, em sẽ chọn chế độ phân quyền nào (‘Người xem - Viewer’ hay ‘Người chỉnh sửa - Editor’) cho bạn cùng nhóm để cùng làm bài? Giải thích lý do."
            },
            {
              "letter": "c",
              "text": "Nêu một biện pháp quan trọng để bảo vệ tài khoản lưu trữ đám mây của em không bị kẻ xấu xâm nhập đánh cắp tài liệu."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Hai lợi ích lưu trữ đám mây (0,25 đ): Truy cập mọi lúc mọi nơi trên nhiều thiết bị; không sợ mất dữ liệu khi hỏng ổ cứng cá nhân.\nb) Lựa chọn phân quyền (0,25 đ): Chọn Editor (Người chỉnh sửa) để các thành viên trong nhóm cùng trực tiếp đóng góp nội dung vào bài làm.\nc) Biện pháp bảo mật (0,25 đ): Đặt mật khẩu mạnh kết hợp bật tính năng xác thực hai yếu tố (2FA)."
        },
        {
          "id": 3,
          "num": 3,
          "pointsText": "(0,75 điểm)",
          "context": "Trong phần mềm thiết kế đồ họa Inkscape:",
          "subItems": [
            {
              "letter": "a",
              "text": "Để vẽ một hình tròn hoàn hảo hoặc hình vuông chuẩn xác (không bị méo thành hình elip hay hình chữ nhật), em cần giữ phím nào trên bàn phím khi kéo thả chuột?"
            },
            {
              "letter": "b",
              "text": "Trình bày sự khác biệt giữa hai thuộc tính màu sắc: màu tô nền (Fill) và màu đường viền (Stroke) của một hình khối trong Inkscape."
            },
            {
              "letter": "c",
              "text": "Sau khi vẽ xong một logo của lớp, em nên xuất sản phẩm sang định dạng ảnh nào (PNG hay JPG) nếu muốn giữ nền trong suốt để chèn vào các ấn phẩm kỷ yếu?"
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Phím thao tác hình chuẩn (0,25 đ): Giữ phím Ctrl khi kéo thả chuột.\nb) Phân biệt Fill và Stroke (0,25 đ): Fill là màu tô bên trong diện tích hình khối; Stroke là màu của đường viền bao quanh hình khối.\nc) Định dạng ảnh xuất (0,25 đ): Xuất sang tệp ảnh PNG vì PNG hỗ trợ kênh màu Alpha trong suốt, JPG không hỗ trợ."
        }
      ],
      "totalPart1Points": 4.75,
      "totalPart2Points": 3,
      "totalPart3Points": 2.25,
      "totalPoints": 10
    },
    "104": {
      "code": "104",
      "title": "Đề Kiểm Tra Giữa Học Kì 1 - Tin Học 10 (Mã đề 104)",
      "durationMinutes": 45,
      "part1_mcq": [
        {
          "id": 1,
          "num": 1,
          "question": "Hành vi nào sau đây vi phạm quyền tác giả trong môi trường số?",
          "options": [
            "Trích dẫn một đoạn văn ngắn trong bài tập và ghi rõ tên tác giả cùng nguồn tài liệu.",
            "Mua bản quyền sử dụng phần mềm và cài đặt trên đúng số lượng máy quy định.",
            "Tải phần mềm thương mại từ mạng lậu rồi bẻ khóa để sử dụng không trả phí.",
            "Sử dụng hình ảnh có giấy phép mở Creative Commons kèm trích dẫn tác giả gốc."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 2,
          "num": 2,
          "question": "Tệp tin đồ họa được thiết kế bằng phần mềm mã nguồn mở Inkscape có phần mở rộng mặc định là:",
          "options": [
            ".mp4",
            ".svg",
            ".docx",
            ".xlsx"
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 3,
          "num": 3,
          "question": "Công cụ Google Translate phân tích ngữ liệu và dịch ngôn ngữ dựa trên công nghệ cốt lõi nào?",
          "options": [
            "Thuật toán tìm kiếm từ khóa thuần túy trong từ điển cố định.",
            "Quá trình tra cứu thủ công của các dịch thuật viên trực tuyến 24/7.",
            "Trí tuệ nhân tạo và các mô hình học máy xử lý ngôn ngữ tự nhiên.",
            "Khả năng ghi nhớ cơ học các bảng mã ký tự nhị phân của phần cứng."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 4,
          "num": 4,
          "question": "Trong các kho dữ liệu số trực tuyến, thông tin thường được tổ chức và phân loại theo cách nào?",
          "options": [
            "Xếp ngẫu nhiên theo thứ tự thời gian người dùng truy cập vào trang.",
            "Tự động xóa bớt các tài liệu học tập cũ sau mỗi chu kỳ 48 giờ lưu.",
            "Trộn lẫn toàn bộ tài liệu văn bản và video vào một tệp tin duy nhất.",
            "Cấu trúc thư mục phân cấp rõ ràng theo chủ đề và từ khóa tra cứu."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 5,
          "num": 5,
          "question": "Đặc trưng cơ bản nhất của hệ thống IoT (Internet of Things) là:",
          "options": [
            "Mọi thiết bị số đều phải dùng chung một màn hình hiển thị.",
            "Người dùng bắt buộc phải trực tiếp điều khiển từng thao tác vi mô.",
            "Các thiết bị kết nối mạng để tự động trao đổi dữ liệu với nhau.",
            "Toàn bộ thiết bị bắt buộc phải sử dụng chung dây cáp mạng LAN."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 6,
          "num": 6,
          "question": "Ưu điểm vượt trội của thiết bị số so với các phương tiện lưu trữ truyền thống là:",
          "options": [
            "Không bao giờ xảy ra tình trạng hư hỏng phần cứng vật lý.",
            "Giúp lưu trữ lượng dữ liệu rất lớn với kích thước nhỏ gọn.",
            "Luôn hoạt động ổn định mà không cần nguồn điện cấp vào.",
            "Tự động chuyển đổi toàn bộ thông tin thành tiền điện tử."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 7,
          "num": 7,
          "question": "Quá trình xử lý thông tin cơ bản của máy tính diễn ra theo thứ tự nào sau đây?",
          "options": [
            "Xử lý thông tin -> Thu nhận dữ liệu -> Xóa bỏ dữ liệu trong máy.",
            "Thu nhận dữ liệu -> Xử lý dữ liệu -> Xuất hoặc lưu trữ thông tin.",
            "Lưu trữ dữ liệu -> Xuất thông tin -> Thu nhận các tín hiệu vào.",
            "Xuất thông tin -> Thu nhận dữ liệu -> Xử lý và truyền tải dữ liệu."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 8,
          "num": 8,
          "question": "Thiết bị thông minh đóng vai trò cốt lõi nào trong cuộc Cách mạng công nghiệp lần thứ tư?",
          "options": [
            "Buộc con người phải ngừng tham gia vào mọi quy trình sản xuất.",
            "Thay thế hoàn toàn mọi hoạt động tư duy sáng tạo nghệ thuật.",
            "Đóng vai trò là thành phần thu thập và xử lý dữ liệu tự động.",
            "Loại bỏ triệt để nhu cầu sử dụng mạng Internet trên toàn cầu."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 9,
          "num": 9,
          "question": "Điểm khác biệt căn bản giữa ảnh đồ họa vector và ảnh đồ họa bitmap (raster) là:",
          "options": [
            "Ảnh vector tạo bởi công thức toán học, ảnh bitmap tạo bởi các điểm ảnh.",
            "Ảnh bitmap chỉ dùng trong in ấn, ảnh vector chỉ dùng hiển thị trên web.",
            "Ảnh bitmap không bị vỡ hạt khi phóng to, ảnh vector bị vỡ hình.",
            "Ảnh vector có dung lượng tệp lớn hơn ảnh bitmap trong mọi trường hợp."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 10,
          "num": 10,
          "question": "Phát biểu nào sau đây phân biệt ĐÚNG giữa mạng LAN và mạng Internet?",
          "options": [
            "LAN luôn có hàng tỷ máy tính, Internet chỉ kết nối vài máy nội bộ.",
            "LAN bắt buộc dùng sóng vô tuyến, Internet bắt buộc dùng cáp mạng.",
            "LAN có quy mô nhỏ trong một tòa nhà, Internet có quy mô toàn cầu.",
            "LAN thuộc sở hữu quốc tế, Internet thuộc sở hữu của một gia đình."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 11,
          "num": 11,
          "question": "Thiết bị nào sau đây được phân loại là một thiết bị thông minh?",
          "options": [
            "Bàn là nhiệt điện điều khiển bằng công tắc cơ học.",
            "Điện thoại thông minh có khả năng cài đặt ứng dụng.",
            "Máy tính bỏ túi đơn giản chỉ thực hiện bốn phép tính.",
            "Quạt trần thông thường sử dụng hộp số điều chỉnh cơ."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 12,
          "num": 12,
          "question": "Nguy cơ an toàn thông tin lớn nhất khi tải và sử dụng phần mềm bẻ khóa (crack) là:",
          "options": [
            "Thường bị đính kèm mã độc nhằm đánh cắp dữ liệu cá nhân.",
            "Màn hình máy tính bị giảm độ phân giải hiển thị vĩnh viễn.",
            "Pin thiết bị xách tay lập tức bị phồng và cháy nổ ngay tức thì.",
            "Bắt buộc người dùng phải nâng cấp cấu hình phần cứng đời mới."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 13,
          "num": 13,
          "question": "Trong mô hình thành phố thông minh, các cảm biến nhiệt độ tự động truyền số liệu về trung tâm nhằm:",
          "options": [
            "Phục vụ công tác phân tích, dự báo và ra quyết định kịp thời.",
            "Thay thế hoàn toàn vai trò của các nhà nghiên cứu khí tượng.",
            "Giúp giảm bớt chi phí mua sắm thiết bị máy chủ điều hành.",
            "Buộc hệ thống điện lưới phải ngắt điện toàn bộ khu dân cư."
          ],
          "type": "mcq",
          "correctAnswer": 0,
          "answerLetter": "A",
          "points": 0.25
        },
        {
          "id": 14,
          "num": 14,
          "question": "Dịch vụ đám mây cho phép người dùng sử dụng trực tiếp các phần mềm qua trình duyệt mạng là:",
          "options": [
            "PaaS (Nền tảng như một dịch vụ).",
            "DaaS (Thiết bị như một dịch vụ).",
            "IaaS (Hạ tầng như một dịch vụ).",
            "SaaS (Phần mềm như một dịch vụ)."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        },
        {
          "id": 15,
          "num": 15,
          "question": "Trong tin học, dữ liệu số được định nghĩa chính xác là:",
          "options": [
            "Khả năng ghi nhớ của con người về thế giới tự nhiên.",
            "Thông tin đã được mã hóa đưa vào máy tính xử lý.",
            "Tri thức tích lũy qua các bài giảng trong nhà trường.",
            "Ý nghĩa thực tế rút ra từ các sự kiện trong cuộc sống."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 16,
          "num": 16,
          "question": "Theo Luật Sở hữu trí tuệ, quyền tác giả đối với tác phẩm phần mềm bao gồm hai nhóm quyền là:",
          "options": [
            "Quyền độc quyền và quyền tự do.",
            "Quyền sở hữu và quyền hủy hoại.",
            "Quyền nhân thân và quyền tài sản.",
            "Quyền thương mại và quyền thế chấp."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 17,
          "num": 17,
          "question": "Dịch vụ lưu trữ đám mây (Google Drive, OneDrive) mang lại tiện ích nổi bật nào?",
          "options": [
            "Giúp điện thoại thông minh không bao giờ bị tiêu hao pin khi dùng.",
            "Giúp máy tính cá nhân miễn nhiễm với mọi loại mã độc tống tiền.",
            "Cho phép truy cập và đồng bộ dữ liệu mọi lúc khi có Internet.",
            "Tự động nhân đôi tốc độ xử lý phần cứng của thiết bị cá nhân."
          ],
          "type": "mcq",
          "correctAnswer": 2,
          "answerLetter": "C",
          "points": 0.25
        },
        {
          "id": 18,
          "num": 18,
          "question": "Đặc điểm lây lan cơ bản của virus máy tính trong môi trường số là:",
          "options": [
            "Tự động lây lan sang các thiết bị điện tử gia dụng không có mạch số.",
            "Gắn mã độc vào các tệp tin khác để lây lan khi tệp đó được kích hoạt.",
            "Chỉ có thể truyền từ máy tính này sang máy tính khác qua đường dây điện.",
            "Tự động sinh ra ngay cả khi máy tính bị ngắt hoàn toàn mọi nguồn điện."
          ],
          "type": "mcq",
          "correctAnswer": 1,
          "answerLetter": "B",
          "points": 0.25
        },
        {
          "id": 19,
          "num": 19,
          "question": "Trong phần mềm đồ họa Inkscape, công cụ Select and Transform (phím tắt S) dùng để:",
          "options": [
            "Vẽ thêm các đường xoắn ốc phức tạp trên trang thiết kế.",
            "Đổi định dạng tệp tin đồ họa sang video hoạt hình đa sắc.",
            "Xóa bỏ vĩnh viễn cấu hình card màn hình của máy tính đồ họa.",
            "Lựa chọn, di chuyển, thay đổi kích thước và xoay đối tượng."
          ],
          "type": "mcq",
          "correctAnswer": 3,
          "answerLetter": "D",
          "points": 0.25
        }
      ],
      "part2_tf": [
        {
          "id": 1,
          "num": 1,
          "context": "Trong tiết thực hành Tin học, bạn An nhận được email từ một địa chỉ lạ với tiêu đề thông báo trúng thưởng điện thoại đính kèm tệp tin có tên Phanthuong.exe. Máy tính của An đang cài đặt phần mềm diệt virus có bản quyền.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Việc mở ngay tệp tin .exe từ người lạ tiềm ẩn nguy cơ máy tính bị nhiễm phần mềm gián điệp (Trojan).",
              "correctAnswer": true
            },
            {
              "letter": "b",
              "text": "Phần mềm diệt virus có thể tự động cảnh báo hoặc cách ly các tệp tin chứa mã độc đáng ngờ.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Tệp tin có phần mở rộng .exe là tệp tin thực thi chương trình trong hệ điều hành Windows.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Để kiểm tra an toàn, An nên tạm thời tắt phần mềm diệt virus rồi chạy tệp tin để xem nội dung bên trong trước.",
              "correctAnswer": false
            }
          ],
          "type": "true_false"
        },
        {
          "id": 2,
          "num": 2,
          "context": "Bạn Lan thiết kế một video thuyết trình về danh lam thắng cảnh quê hương để đăng lên mạng xã hội. Lan muốn sử dụng một số bài hát và hình ảnh tìm kiếm được trên Internet làm tư liệu cho video.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Ký hiệu CC BY trên tác phẩm cho phép Lan tự do sử dụng tác phẩm nhưng bắt buộc phải ghi tên tác giả gốc.",
              "correctAnswer": true
            },
            {
              "letter": "b",
              "text": "Giấy phép Creative Commons (CC) là hệ thống giấy phép mở cho phép tác giả chia sẻ tác phẩm kèm điều kiện sử dụng.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Lan có thể tải một bài hát độc quyền có thu phí trên mạng rồi lồng vào video, chỉ cần ghi chú ‘Tôi không giữ bản quyền bài hát này’ là hoàn toàn hợp pháp.",
              "correctAnswer": false
            },
            {
              "letter": "d",
              "text": "Tác phẩm âm nhạc và hình ảnh kỹ thuật số là đối tượng được bảo hộ quyền tác giả theo pháp luật.",
              "correctAnswer": true
            }
          ],
          "type": "true_false"
        },
        {
          "id": 3,
          "num": 3,
          "context": "Một nhóm học sinh lớp 10 cùng thực hiện bài tập dự án học tập. Các bạn sử dụng điện thoại thông minh để chụp ảnh hoạt động thực tế và sử dụng dịch vụ lưu trữ đám mây Google Drive để chia sẻ dữ liệu cho các thành viên trong nhóm.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Để bảo vệ dữ liệu dự án không bị người ngoài sửa đổi, nhóm nên thiết lập quyền chia sẻ công khai là ‘Bất kỳ ai có liên kết đều có quyền chỉnh sửa (Editor)’.",
              "correctAnswer": false
            },
            {
              "letter": "b",
              "text": "Khi tải ảnh lên đám mây, các thành viên khác chỉ có thể xem được dữ liệu nếu được cấp quyền truy cập hợp lệ.",
              "correctAnswer": true
            },
            {
              "letter": "c",
              "text": "Điện thoại thông minh là một hệ thống kỹ thuật số có khả năng thu nhận và xử lý dữ liệu hình ảnh.",
              "correctAnswer": true
            },
            {
              "letter": "d",
              "text": "Google Drive là dịch vụ điện toán đám mây cho phép người dùng lưu trữ và chia sẻ tệp tin trực tuyến.",
              "correctAnswer": true
            }
          ],
          "type": "true_false"
        }
      ],
      "part3_essay": [
        {
          "id": 1,
          "num": 1,
          "pointsText": "(0,75 điểm)",
          "context": "Một thẻ nhớ máy ảnh có dung lượng lưu trữ hiển thị là 16 GB. Trung bình một bức ảnh kỹ thuật số chất lượng cao chụp từ máy ảnh này có dung lượng 8 MB.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy chuyển đổi dung lượng 16 GB sang đơn vị Megabyte (MB), biết 1 GB = 1024 MB."
            },
            {
              "letter": "b",
              "text": "Thẻ nhớ trên có thể lưu trữ tối đa được bao nhiêu bức ảnh kỹ thuật số có dung lượng nêu trên?"
            },
            {
              "letter": "c",
              "text": "Nếu người dùng chụp thêm các đoạn video ngắn có dung lượng 4 GB, hãy tính dung lượng trống còn lại của thẻ nhớ (theo đơn vị GB)."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Đổi GB sang MB (0,25 đ): 16 GB * 1024 = 16.384 MB.\nb) Số bức ảnh tối đa (0,25 đ): 16.384 / 8 = 2.048 bức ảnh.\nc) Dung lượng trống còn lại (0,25 đ): 16 - 4 = 12 GB."
        },
        {
          "id": 2,
          "num": 2,
          "pointsText": "(0,75 điểm)",
          "context": "Trường học của em đang triển khai mô hình học tập trực tuyến kết hợp lưu trữ đám mây cho học sinh khối 10.",
          "subItems": [
            {
              "letter": "a",
              "text": "Hãy nêu 2 lợi ích thiết thực nhất của việc lưu trữ tài liệu học tập trên đám mây so với lưu trên ổ cứng máy tính cá nhân."
            },
            {
              "letter": "b",
              "text": "Khi chia sẻ một tài liệu học tập nhóm trên Google Drive, em sẽ chọn chế độ phân quyền nào (‘Người xem - Viewer’ hay ‘Người chỉnh sửa - Editor’) cho bạn cùng nhóm để cùng làm bài? Giải thích lý do."
            },
            {
              "letter": "c",
              "text": "Nêu một biện pháp quan trọng để bảo vệ tài khoản lưu trữ đám mây của em không bị kẻ xấu xâm nhập đánh cắp tài liệu."
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Hai lợi ích lưu trữ đám mây (0,25 đ): Truy cập mọi lúc mọi nơi trên nhiều thiết bị; không sợ mất dữ liệu khi hỏng ổ cứng cá nhân.\nb) Lựa chọn phân quyền (0,25 đ): Chọn Editor (Người chỉnh sửa) để các thành viên trong nhóm cùng trực tiếp đóng góp nội dung vào bài làm.\nc) Biện pháp bảo mật (0,25 đ): Đặt mật khẩu mạnh kết hợp bật tính năng xác thực hai yếu tố (2FA)."
        },
        {
          "id": 3,
          "num": 3,
          "pointsText": "(0,75 điểm)",
          "context": "Trong phần mềm thiết kế đồ họa Inkscape:",
          "subItems": [
            {
              "letter": "a",
              "text": "Để vẽ một hình tròn hoàn hảo hoặc hình vuông chuẩn xác (không bị méo thành hình elip hay hình chữ nhật), em cần giữ phím nào trên bàn phím khi kéo thả chuột?"
            },
            {
              "letter": "b",
              "text": "Trình bày sự khác biệt giữa hai thuộc tính màu sắc: màu tô nền (Fill) và màu đường viền (Stroke) của một hình khối trong Inkscape."
            },
            {
              "letter": "c",
              "text": "Sau khi vẽ xong một logo của lớp, em nên xuất sản phẩm sang định dạng ảnh nào (PNG hay JPG) nếu muốn giữ nền trong suốt để chèn vào các ấn phẩm kỷ yếu? SỞ GIÁO DỤC VÀ ĐÀO TẠOTHÀNH PHỐ HỒ CHÍ MINHTRƯỜNG TH, THCS VÀ THPTQUỐC TẾ Á CHÂU"
            }
          ],
          "points": 0.75,
          "modelAnswer": "a) Phím thao tác hình chuẩn (0,25 đ): Giữ phím Ctrl khi kéo thả chuột.\nb) Phân biệt Fill và Stroke (0,25 đ): Fill là màu tô bên trong diện tích hình khối; Stroke là màu của đường viền bao quanh hình khối.\nc) Định dạng ảnh xuất (0,25 đ): Xuất sang tệp ảnh PNG vì PNG hỗ trợ kênh màu Alpha trong suốt, JPG không hỗ trợ."
        }
      ],
      "totalPart1Points": 4.75,
      "totalPart2Points": 3,
      "totalPart3Points": 2.25,
      "totalPoints": 10
    }
  }
};
}));
