/**
 * questions_grade8.js
 * Ngân hàng câu hỏi Tin học Khối 8 - Trường Quốc Tế Á Châu (Asian School)
 * Bao gồm Đề cương Ôn tập (Trắc nghiệm + Đúng/Sai + Tự luận kèm Hướng dẫn chấm Rubric) và 4 Mã Đề Thi Chính Thức
 */

// Luôn gắn window.EXAM_DATA_G8 (kể cả khi Vite đóng gói tệp như CommonJS); Node test dùng module.exports
(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.EXAM_DATA_G8 = data;
}(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  return {
  "grade": 8,
  "title": "Môn Tin Học Khối 8 - Trường Quốc Tế Á Châu (Asian School)",
  "practiceQuestions": [
    {
      "id": 1,
      "question": "Đa số các máy tính điện tử hiện đại ngày nay đều được thiết kế dựa trên nguyên lý kiến trúc của ai?",
      "options": [
        "Nhà toán học Blaise Pascal.",
        "Kỹ sư Charles Xavier Thomas.",
        "Nhà bác học John von Neumann.",
        "Nhà phát minh Charles Babbage."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    },
    {
      "id": 2,
      "question": "Các thế hệ máy tính xuất hiện trong cùng một giai đoạn công nghệ được phân loại chủ yếu dựa vào yếu tố nào?",
      "options": [
        "Tên tuổi của hãng sản xuất.",
        "Công nghệ linh kiện điện tử cốt lõi.",
        "Màu sắc và kích thước thiết bị.",
        "Giá thành phân phối trên thị trường."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 3,
      "question": "Chiếc máy tính cơ học Pascaline ra đời vào thế kỉ XVII có thể thực hiện được các phép tính số học nào?",
      "options": [
        "Phép nhân và phép chia.",
        "Phép cộng và phép trừ.",
        "Khai căn và tính lũy thừa.",
        "Các hàm số lượng giác phức tạp."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 4,
      "question": "Máy tính thế hệ thứ hai (giai đoạn 1955–1965) sử dụng công nghệ linh kiện điện tử nào sau đây?",
      "options": [
        "Đèn điện tử chân không.",
        "Bóng bán dẫn (Transistor).",
        "Mạch tích hợp (IC).",
        "Bộ vi xử lý (VLSI)."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 5,
      "question": "Động lực chính thúc đẩy con người phát minh và không ngừng cải tiến các công cụ tính toán từ thời cổ đại đến nay là gì?",
      "options": [
        "Nhu cầu giải trí và nghệ thuật của con người ngày một phong phú.",
        "Nhu cầu tính toán và xử lý dữ liệu trong đời sống ngày càng tăng cao.",
        "Con người muốn loại bỏ hoàn toàn mọi hoạt động lao động trí óc.",
        "Nhu cầu thay thế hoàn toàn chữ viết và các tài liệu truyền thống."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 6,
      "question": "Bàn tính gẩy (Abacus) thời cổ đại có đóng góp quan trọng nào đối với văn minh nhân loại?",
      "options": [
        "Tự động hóa hoàn toàn việc đưa ra các quyết định trong kinh doanh.",
        "Hỗ trợ con người thực hiện các phép tính cộng trừ nhanh chóng hơn.",
        "Lưu trữ dữ liệu văn bản và âm thanh dưới dạng các xung điện tử.",
        "Kết nối và trao đổi dữ liệu từ xa giữa các cộng đồng dân cư cổ sự."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 7,
      "question": "Điểm tương đồng quan trọng giữa thiết kế máy phân tích của Charles Babbage và máy tính hiện đại là gì?",
      "options": [
        "Khả năng kết nối mạng viễn thông để chia sẻ dữ liệu từ xa.",
        "Cấu trúc gồm thiết bị vào, bộ nhớ, bộ xử lý và thiết bị ra.",
        "Sử dụng nguồn điện xoay chiều công suất lớn để vận hành.",
        "Thiết kế bên ngoài rất nhỏ gọn và thuận tiện mang theo người."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 8,
      "question": "Một bài trình chiếu thuyết trình lưu dưới định dạng .pptx trên máy tính là:",
      "options": [
        "Dữ liệu số.",
        "Dữ liệu giấy tờ.",
        "Dữ liệu thủ công.",
        "Dữ liệu vật lý thô."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 9,
      "question": "Mạng Internet và các thiết bị số hóa tạo điều kiện thuận lợi nhất cho hoạt động nào đối với thông tin số?",
      "options": [
        "Giới hạn số lượng người có quyền tiếp cận nguồn tin tức.",
        "Dễ dàng thu thập, lưu trữ, xử lý và chia sẻ trên diện rộng.",
        "Bắt buộc chuyển đổi mọi dữ liệu thành dạng văn bản in ấn.",
        "Ngăn chặn triệt để mọi hành vi chỉnh sửa hay làm mới dữ liệu."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 10,
      "question": "Trong các thiết bị sau, thiết bị nào đóng vai trò là vật mang tin để lưu trữ dữ liệu số?",
      "options": [
        "Bàn phím cơ học.",
        "Ổ đĩa flash USB.",
        "Chuột quang không dây.",
        "Máy chiếu đa năng."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 11,
      "question": "Một bức ảnh lưu trên điện thoại có thể gửi cùng lúc cho hàng trăm người trong vài giây qua ứng dụng nhắn tin. Hiện tượng này thể hiện đặc tính nào của thông tin số?",
      "options": [
        "Thông tin số vô cùng khó sao chép hoặc trích xuất ra thiết bị khác.",
        "Thông tin số có thể nhân bản và lan truyền với tốc độ rất nhanh chóng.",
        "Thông tin số luôn tự động bảo mật tuyệt đối trước mọi nguy cơ xâm nhập.",
        "Thông tin số chỉ tồn tại tạm thời và tự hủy sau khi gửi đi ít phút."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 12,
      "question": "Khi chỉnh sửa nội dung văn bản trên tệp văn bản số đã lưu trên dịch vụ lưu trữ đám mây:",
      "options": [
        "Toàn bộ máy tính kết nối vào mạng đều bị xóa dữ liệu.",
        "Dữ liệu được cập nhật thuận tiện mà không làm hỏng vật mang tin.",
        "Tệp tin gốc trên không gian lưu trữ mạng sẽ biến mất vĩnh viễn.",
        "Toàn bộ máy in trong khu vực sẽ tự động in nội dung mới ra giấy."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 13,
      "question": "Việc đặt tên tệp tin tùy tiện và lưu trữ lộn xộn trong máy tính sẽ dẫn đến khó khăn gì?",
      "options": [
        "Máy tính tiêu thụ điện năng nhiều hơn bình thường.",
        "Người dùng mất nhiều thời gian tìm kiếm và dễ gây nhầm lẫn.",
        "Các tệp dữ liệu tự động bị hệ điều hành xóa bỏ.",
        "Thiết bị không cho phép cài đặt thêm các ứng dụng mới."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 14,
      "question": "So với các công cụ tính toán cơ học thời kì trước, máy tính điện tử mang lại ưu điểm vượt trội nào?",
      "options": [
        "Tốc độ xử lý cực nhanh và làm việc tự động theo chương trình.",
        "Thiết kế bên ngoài luôn dùng các vật liệu đắt tiền sang trọng.",
        "Hoạt động độc lập hoàn toàn mà không cần nguồn điện cung cấp.",
        "Không cần người dùng cung cấp bất kỳ dữ liệu đầu vào nào cả."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 15,
      "question": "Phát biểu nào dưới đây về đặc điểm của dữ liệu số là chính xác?",
      "options": [
        "Dữ liệu số chỉ được tạo ra khi dùng phần mềm soạn thảo văn bản.",
        "Dữ liệu số dễ lưu trữ, sao chép và xử lý bằng các thiết bị số.",
        "Dữ liệu số một khi đã tạo ra thì không thể xóa bỏ hay chỉnh sửa.",
        "Dữ liệu số biến mất ngay khi thiết bị ngắt kết nối với Internet."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 16,
      "question": "Tiêu chí quan trọng nhất để đánh giá độ tin cậy của một thông tin trên mạng Internet là gì?",
      "options": [
        "Số lượng lượt bấm thích và các bình luận khen ngợi trên mạng xã hội.",
        "Nguồn phát hành chính thống, tác giả rõ ràng và kiểm chứng đa nguồn.",
        "Tiêu đề bài viết dùng từ ngữ giật gân, khẩn cấp và kích thích tò mò.",
        "Nội dung bài viết hoàn toàn trùng khớp với suy đoán chủ quan cá nhân."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 17,
      "question": "Khi nhận được thông tin về một chính sách thi cử mới trên trang mạng xã hội không rõ nguồn gốc, học sinh nên xử lý như thế nào?",
      "options": [
        "Chia sẻ ngay về trang cá nhân để bạn bè cùng lớp biết sớm.",
        "Đối chiếu trên cổng thông tin chính thức của ngành giáo dục.",
        "Viết bài bình luận bức xúc và chỉ trích quy định trên diễn đàn.",
        "Tải ngay hình ảnh về và gửi vào nhóm lớp yêu cầu làm theo."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 18,
      "question": "Hành động nào sau đây thể hiện văn hóa ứng xử đúng mực trên không gian mạng?",
      "options": [
        "Dùng ngôn từ hòa nhã, tôn trọng người khác khi trao đổi.",
        "Tạo tài khoản ẩn danh để chỉ trích người có ý kiến khác.",
        "Phát tán rộng rãi các bài viết chưa qua kiểm chứng nguồn.",
        "Vào trang cá nhân của bạn bè để lại các nhận xét khiếm nhã."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 19,
      "question": "Hành vi nào sau đây vi phạm nghiêm trọng Luật Sở hữu trí tuệ trên môi trường số?",
      "options": [
        "Tải bài văn mẫu trên mạng rồi nhận đó là bài mình tự viết.",
        "Trích dẫn một câu danh ngôn và ghi rõ nguồn cùng tên tác giả.",
        "Mua bản quyền phần mềm học tập từ nhà phát hành chính hãng.",
        "Tự vẽ tranh minh họa bằng phần mềm đồ họa rồi chia sẻ cho bạn."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 20,
      "question": "Khi sử dụng hình ảnh hoặc tư liệu của người khác trong bài thuyết trình, cách làm đúng chuẩn mực là gì?",
      "options": [
        "Cắt bỏ chữ ký tác giả để bố cục trang chiếu nhìn đẹp hơn.",
        "Ghi chú rõ nguồn dẫn, tên tác giả hoặc liên kết của tư liệu.",
        "Khẳng định toàn bộ tư liệu do chính bản thân mình sáng tạo.",
        "Chỉ chia sẻ trong phạm vi nhóm kín để không ai phát hiện ra."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 21,
      "question": "Quy tắc cơ bản cần tuân thủ khi giao tiếp trên môi trường số là gì?",
      "options": [
        "Thể hiện bất kỳ quan điểm nào mà không cần suy nghĩ hậu quả.",
        "Tôn trọng người khác và chịu trách nhiệm về lời nói của mình.",
        "Công khai toàn bộ thông tin cá nhân để tạo dựng sự chân thành.",
        "Bắt buộc mọi người trong nhóm phải đồng ý với ý kiến của mình."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 22,
      "question": "Khi nhận được tin nhắn có nội dung xúc phạm hoặc đe dọa mình trên mạng xã hội, cách ứng xử phù hợp nhất là gì?",
      "options": [
        "Dùng lời lẽ gay gắt đáp trả quyết liệt để bảo vệ bản thân.",
        "Lưu lại bằng chứng, chặn tin nhắn và báo cho người lớn hỗ trợ.",
        "Kêu gọi bạn bè cùng lập nhóm để tìm người nhắn tin trả thù.",
        "Khóa tài khoản vĩnh viễn và giấu kín không kể cho ai biết."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 23,
      "question": "Thuật toán là gì?",
      "options": [
        "Một linh kiện phần cứng dùng để tính toán trong máy tính.",
        "Một dãy hữu hạn các bước chỉ dẫn rõ ràng để giải bài toán.",
        "Một ngôn ngữ lập trình cấp cao như Python hay Scratch.",
        "Một chương trình ứng dụng hỗ trợ soạn thảo văn bản số."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 24,
      "question": "Trong sơ đồ khối thuật toán, hình oval (elip) được sử dụng nhằm mục đích gì?",
      "options": [
        "Lưu trữ mã lệnh của chương trình vào bộ nhớ.",
        "Thể hiện thao tác bắt đầu hoặc kết thúc thuật toán.",
        "Thực hiện các phép toán số học và xử lý dữ liệu.",
        "Đưa ra phán đoán kiểm tra điều kiện logic rẽ nhánh."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 25,
      "question": "Thiết bị tính toán cơ học Pascaline sử dụng cơ cấu nào để thực hiện phép tính?",
      "options": [
        "Bánh răng kim loại ăn khớp.",
        "Đèn điện tử chân không.",
        "Bóng bán dẫn silicon.",
        "Mạch vi xử lý tích hợp."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 26,
      "question": "Thuật ngữ 'Bit' trong tin học là viết tắt của cụm từ tiếng Anh nào?",
      "options": [
        "Binary Digit.",
        "Byte Information.",
        "Basic Input.",
        "Built-in Text."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 27,
      "question": "Tại sao không nên chia sẻ mật khẩu hòm thư điện tử cá nhân cho người khác?",
      "options": [
        "Tránh nguy cơ bị đánh cắp thông tin cá nhân và giả mạo.",
        "Làm hỏng hệ thống máy chủ mạng của trường.",
        "Khiến máy tính bị giảm dung lượng ổ cứng.",
        "Làm cho đường truyền Internet bị ngắt kết nối."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 28,
      "question": "Trong sơ đồ khối thuật toán, khối hình thoi được sử dụng để thể hiện điều gì?",
      "options": [
        "Thao tác kiểm tra điều kiện rẽ nhánh.",
        "Thao tác bắt đầu hoặc kết thúc.",
        "Thao tác tính toán số học bình thường.",
        "Thao tác nhập xuất dữ liệu từ bàn phím."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 29,
      "question": "Một Byte tương đương với bao nhiêu bit nhị phân?",
      "options": [
        "8 bit.",
        "4 bit.",
        "16 bit.",
        "32 bit."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 30,
      "question": "Hành vi nào sau đây giúp hạn chế rủi ro bị lừa đảo trên mạng xã hội?",
      "options": [
        "Không bấm vào đường link lạ và không cung cấp mã OTP.",
        "Công khai toàn bộ số căn cước và ngày sinh lên trang cá nhân.",
        "Kết bạn và chuyển tiền cho tất cả người lạ khi được yêu cầu.",
        "Tắt phần mềm diệt virus khi lướt web trên mạng."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 31,
      "question": "Bộ phận nào trong kiến trúc máy tính Von Neumann thực hiện các phép tính số học và logic?",
      "options": [
        "ALU (Arithmetic Logic Unit).",
        "Bộ nhớ ngoài (Secondary Storage).",
        "Màn hình hiển thị (Monitor).",
        "Bàn phím cơ (Keyboard)."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 32,
      "question": "Trong sơ đồ khối thuật toán, khối hình chữ nhật được sử dụng để thể hiện điều gì?",
      "options": [
        "Thao tác tính toán, xử lý dữ liệu.",
        "Thao tác bắt đầu hoặc kết thúc.",
        "Thao tác kiểm tra điều kiện logic.",
        "Thao tác kết nối các trang tài liệu."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 33,
      "question": "Để bảo vệ dữ liệu cá nhân khi sử dụng máy tính tại nơi công cộng, em nên làm gì?",
      "options": [
        "Đăng xuất tài khoản và xóa lịch sử duyệt web trước khi rời đi.",
        "Lưu lại toàn bộ mật khẩu trên trình duyệt để tiện đăng nhập sau.",
        "Cắm thẻ nhớ cá nhân và để quên tại phòng máy.",
        "Tắt màn hình nhưng vẫn để nguyên tài khoản đang đăng nhập."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 34,
      "question": "Phát biểu nào sau đây đúng về mối quan hệ giữa thuật toán và chương trình?",
      "options": [
        "Thuật toán là ý tưởng giải quyết; chương trình là thể hiện của thuật toán bằng ngôn ngữ lập trình.",
        "Thuật toán và chương trình là hai khái niệm hoàn toàn trùng khít.",
        "Chương trình luôn được viết trước khi xây dựng thuật toán.",
        "Máy tính chỉ có thể thực hiện thuật toán mà không cần chương trình."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 35,
      "question": "Thế hệ máy tính thứ tư (từ khoảng năm 1971 đến nay) gắn liền với sự ra đời của linh kiện điện tử nào?",
      "options": [
        "Đèn điện tử chân không.",
        "Bóng bán dẫn (transistor).",
        "Mạch tích hợp cỡ rất lớn (VLSI - vi xử lí).",
        "Rơ-le điện từ."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    }
  ],
  "practiceEssayQuestions": [
    {
      "id": 1,
      "num": 1,
      "pointsText": "1,0 điểm",
      "context": "Em hãy nêu 2 ưu điểm nổi bật của việc lưu trữ tài liệu học tập trên ổ đĩa trực tuyến (như Google Drive, OneDrive) so với việc chỉ lưu trong tập vở giấy truyền thống. Cho ví dụ minh họa cụ thể trong thực tế học tập của em.",
      "subItems": [
        {
          "letter": "a",
          "text": "Nêu 2 ưu điểm nổi bật của việc lưu trữ trực tuyến. (0,5 điểm)"
        },
        {
          "letter": "b",
          "text": "Cho ví dụ minh họa cụ thể trong thực tế học tập của em. (0,5 điểm)"
        }
      ],
      "modelAnswer": "a) Hai ưu điểm nổi bật (0,5 đ): Khả năng sao lưu an toàn và truy cập mọi lúc, mọi nơi trên nhiều thiết bị; dễ dàng chia sẻ và làm việc nhóm đồng thời.\nb) Ví dụ thực tế (0,5 đ): Khi đi học nhóm mở điện thoại xem lại bài thuyết trình lưu trên Google Drive; cùng bạn soạn chung báo cáo học tập."
    },
    {
      "id": 2,
      "num": 2,
      "pointsText": "1,0 điểm",
      "context": "Em hãy kể tên 2 loại giấy tờ điện tử có giá trị pháp lý đang được áp dụng phổ biến tại Việt Nam và giải thích lợi ích của việc sử dụng giấy tờ điện tử đó đối với người dân.",
      "subItems": [
        {
          "letter": "a",
          "text": "Kể tên 2 loại giấy tờ điện tử có giá trị pháp lý. (0,5 điểm)"
        },
        {
          "letter": "b",
          "text": "Giải thích lợi ích của việc sử dụng giấy tờ điện tử đó. (0,5 điểm)"
        }
      ],
      "modelAnswer": "a) Kể tên 2 giấy tờ (0,5 đ): Thẻ Căn cước công dân gắn chip / VNeID mức độ 2; Thẻ BHYT điện tử / Giấy khai sinh điện tử có mã QR / Hóa đơn điện tử.\nb) Lợi ích thiết thực (0,5 đ): Thuận tiện khi làm thủ tục hành chính, không phải mang nhiều giấy tờ bản cứng tránh thất lạc; tra cứu nhanh chóng, chính xác."
    },
    {
      "id": 3,
      "num": 3,
      "pointsText": "1,0 điểm",
      "context": "Trong giờ thực hành, bạn Nam thấy bạn bên cạnh chưa đăng xuất tài khoản mạng xã hội. Nam liền vào tài khoản của bạn đăng một bài viết có nội dung trêu đùa, xúc phạm một bạn khác trong lớp. Theo em, hành vi của bạn Nam đã vi phạm những điều gì về mặt đạo đức và quy định văn hóa ứng xử trên mạng? Nếu chứng kiến, em sẽ xử lý như thế nào?",
      "subItems": [
        {
          "letter": "a",
          "text": "Chỉ rõ hành vi vi phạm đạo đức và quy định văn hóa ứng xử trên mạng. (0,5 điểm)"
        },
        {
          "letter": "b",
          "text": "Đề xuất cách ứng xử và xử lý tình huống đúng đắn. (0,5 điểm)"
        }
      ],
      "modelAnswer": "a) Hành vi vi phạm (0,5 đ): Xâm phạm quyền riêng tư khi tự ý dùng tài khoản người khác; vi phạm văn hóa ứng xử trên mạng xã hội (xúc phạm danh dự bạn bè).\nb) Cách xử lý (0,5 đ): Nhắc Nam xóa ngay bài viết và đăng xuất tài khoản; khuyên bạn bị hại đổi mật khẩu; giải thích hành vi sai trái và báo thầy cô nếu cần."
    }
  ]
};
}));
