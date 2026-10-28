/**
 * questions_grade9.js
 * Ngân hàng câu hỏi Tin học Khối 9 - Trường Quốc Tế Á Châu (Asian School)
 * Bao gồm Đề cương Ôn tập (Trắc nghiệm + Đúng/Sai + Tự luận kèm Hướng dẫn chấm Rubric) và 4 Mã Đề Thi Chính Thức
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EXAM_DATA_G9 = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return {
  "grade": 9,
  "title": "Môn Tin Học Khối 9 - Trường Quốc Tế Á Châu (Asian School)",
  "practiceQuestions": [
    {
      "id": 1,
      "question": "Thiết bị nào sau đây là ví dụ điển hình về thiết bị có tích hợp bộ xử lí thông tin phục vụ trong lĩnh vực thương mại và dịch vụ?",
      "options": [
        "Máy chiếu hiển thị hình ảnh trong phòng học.",
        "Máy chụp X-quang chẩn đoán tại bệnh viện.",
        "Hệ thống máy POS thanh toán tự động tại quầy thu ngân.",
        "Hệ thống vòi phun nước cơ học trong công viên."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    },
    {
      "id": 2,
      "question": "Thiết bị gia dụng nào dưới đây có gắn bộ xử lí thông tin giúp tự động nhận biết và vận hành theo chương trình?",
      "options": [
        "Nồi gang truyền thống đun nấu bằng bếp than củi.",
        "Nồi cơm điện cao tần có chế độ hẹn giờ tự động.",
        "Bình thủy tinh giữ nhiệt dùng rót nước thủ công.",
        "Quạt trần thông thường bật tắt bằng công tắc cơ."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 3,
      "question": "Bộ phận giữ vai trò quan trọng nhất của máy tính, thực hiện chức năng tiếp nhận dữ liệu, điều khiển và thực thi các lệnh được gọi là gì?",
      "options": [
        "Bộ nhớ ngoài (ổ đĩa cứng).",
        "Màn hình độ phân giải cao.",
        "Bộ xử lí trung tâm (CPU – Central Processing Unit).",
        "Chuột và bàn phím máy tính."
      ],
      "correctAnswer": 2,
      "answerLetter": "C",
      "points": 0.25
    },
    {
      "id": 4,
      "question": "Phát biểu nào sau đây nêu đúng chức năng cơ bản của bộ xử lí thông tin?",
      "options": [
        "Biểu diễn dữ liệu dưới dạng âm thanh tương tự.",
        "Tiếp nhận dữ liệu vào, xử lí dữ liệu và đưa ra kết quả.",
        "Đóng vai trò làm nguồn điện dự phòng khi mất điện.",
        "In trực tiếp dữ liệu ra giấy mà không qua lệnh in."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 5,
      "question": "Bộ xử lí thông tin trong máy tính chỉ có thể tiếp nhận và trực tiếp xử lí dữ liệu khi dữ liệu đó đã được:",
      "options": [
        "Số hóa thành dãy các bit nhị phân gồm 0 và 1.",
        "Dịch sang tiếng Anh theo các quy chuẩn quốc tế.",
        "In sẵn trên văn bản giấy có dấu mộc kiểm duyệt.",
        "Nén lại thành các tệp video chất lượng phân giải cao."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 6,
      "question": "Ưu thế vượt trội của máy tính về mặt lưu trữ dữ liệu so với các phương thức truyền thống được thể hiện qua đặc điểm nào?",
      "options": [
        "Lưu trữ khối lượng dữ liệu khổng lồ trên thiết bị nhỏ gọn hoặc đám mây.",
        "Bảo quản giấy tờ viết tay nguyên vẹn qua hàng trăm năm mà không ẩm mốc.",
        "Giới hạn thời gian lưu dữ liệu tối đa một tuần rồi tự động xóa sạch.",
        "Chỉ cho phép lưu trữ văn bản in và bắt buộc phải scan lại trước khi xem."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 7,
      "question": "Trong 4 tiêu chí đánh giá chất lượng thông tin, tiêu chí nào được xem là quan trọng hàng đầu vì nó quyết định trực tiếp tính đúng đắn của quyết định giải quyết vấn đề?",
      "options": [
        "Tính thẩm mỹ của phông chữ văn bản.",
        "Tính chính xác của nguồn dữ liệu.",
        "Tính dung lượng lớn của tệp lưu trữ.",
        "Tính hấp dẫn của tiêu đề bài viết."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 8,
      "question": "Tiêu chí “Tính mới” (thời điểm thông tin ra đời hoặc được cập nhật) trong đánh giá chất lượng thông tin còn được gọi là gì?",
      "options": [
        "Tính thời sự của thông tin.",
        "Tính sử dụng được của dữ liệu.",
        "Tính đầy đủ của nội dung văn bản.",
        "Tính nghệ thuật của hình ảnh minh họa."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 9,
      "question": "Nhận định nào sau đây là SAI khi nói về chất lượng thông tin trong quá trình giải quyết vấn đề?",
      "options": [
        "Chất lượng thông tin tốt giúp con người ra quyết định đúng đắn và hiệu quả.",
        "Thông tin sai lệch có thể dẫn đến hậu quả nghiêm trọng và làm thất bại công việc.",
        "Bốn tiêu chí cơ bản đánh giá chất lượng gồm: chính xác, mới, đầy đủ, sử dụng",
        "Thông tin càng dài và càng nhiều hình ảnh trang trí thì chất lượng giải quyết vấn đề"
      ],
      "correctAnswer": 3,
      "answerLetter": "D",
      "points": 0.25
    },
    {
      "id": 10,
      "question": "Tiêu chí “Tính sử dụng được” của thông tin được thể hiện rõ nét qua đặc điểm nào sau đây?",
      "options": [
        "Thông tin được trình bày rõ ràng, dễ hiểu và khai thác đúng mục đích.",
        "Thông tin có độ dài lớn, chứa hàng trăm trang tài liệu số phức tạp.",
        "Thông tin được giữ bí mật tuyệt đối và cấm mọi hành vi trích dẫn nguồn.",
        "Thông tin được mã hóa bằng ký hiệu lạ mà người khác không đọc được."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 11,
      "question": "Vì sao người dùng cần kiểm tra, đánh giá chất lượng thông tin khi tìm kiếm trên Internet?",
      "options": [
        "Mọi thông tin trên mạng đều đã qua kiểm duyệt khắt khe và đúng đắn 100%.",
        "Internet có nhiều thông tin hữu ích nhưng cũng lẫn nhiều tin giả, sai lệch chưa kiểm",
        "Máy tìm kiếm tự động lọc bỏ toàn bộ các bài viết không có bản quyền tác giả.",
        "Thông tin trên mạng xã hội luôn có độ chính xác cao hơn sách giáo khoa chuẩn."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 12,
      "question": "Một trang web khí tượng thủy văn cập nhật liên tục lượng mưa, hướng di chuyển của bão mỗi 15 phút một lần để hỗ trợ người dân phòng tránh thiên tai. Điều này thể hiện rõ nhất tiêu chí nào?",
      "options": [
        "Tính thời sự (tính mới).",
        "Tính phức tạp của dữ liệu.",
        "Tính nghệ thuật của bản đồ.",
        "Tính bảo mật của thông tin."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 13,
      "question": "Bạn đọc được một bài đăng trên mạng xã hội: “Uống nước chanh ấm vào lúc nửa đêm sẽ trị dứt điểm mọi bệnh nan y” từ tài khoản ẩn danh, không có trích dẫn từ Bộ Y tế. Tiêu chí nào của thông tin này cần bị nghi ngờ nhất?",
      "options": [
        "Tính sử dụng được.",
        "Tính chính xác của thông tin.",
        "Tính thời sự của tin tức.",
        "Tính nghệ thuật của bài viết."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 14,
      "question": "Mặt trái tiêu cực điển hình của việc lạm dụng quá mức thiết bị số và mạng xã hội đối với học sinh là gì?",
      "options": [
        "Giúp nâng cao kỹ năng làm việc nhóm trực tuyến và mở rộng kết nối bạn bè.",
        "Dễ gây sa sút thị lực, lối sống thụ động và giảm tương tác trực tiếp ngoài đời thực.",
        "Rèn luyện khả năng tư duy độc lập và giúp quản lý thời gian học tập tốt hơn.",
        "Tăng cường sức bền thể lực và phát triển các kỹ năng vận động ngoài trời."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 15,
      "question": "Rác thải điện tử (pin cũ, máy tính hỏng, vi mạch bỏ đi không qua xử lí) từ công nghệ số gây ra tác động tiêu cực nào đối với đời sống?",
      "options": [
        "Làm cạn kiệt băng thông đường truyền cáp quang.",
        "Ô nhiễm đất, nguồn nước và đe dọa nghiêm trọng sức khỏe con người do nhiễm",
        "Làm giảm tốc độ hoạt động của các phần mềm ứng dụng.",
        "Làm tăng nhiệt độ phòng máy khi sử dụng quạt gió làm mát."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 16,
      "question": "Việc tự ý chụp lén ảnh sổ liên lạc, kết quả học tập hoặc ảnh riêng tư của bạn học rồi đăng lên các diễn đàn mạng công cộng khi chưa được bạn đồng ý là hành vi:",
      "options": [
        "Đáng khen vì giúp cả lớp nắm được tình hình học tập.",
        "Xâm phạm quyền riêng tư và vi phạm quy tắc ứng xử trên mạng.",
        "Hoàn toàn hợp pháp vì mạng xã hội là không gian tự do phát ngôn.",
        "Hành động hài hước vô hại không cần phải quan tâm."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 17,
      "question": "Theo Bộ quy tắc ứng xử trên mạng xã hội do Bộ Thông tin và Truyền thông ban hành, người sử dụng mạng xã hội nên:",
      "options": [
        "Đăng tải dữ liệu cá nhân của bạn học để lôi kéo cộng đồng mạng phán xét.",
        "Chia sẻ thông tin từ nguồn chính thống, lan tỏa điều tích cực và ứng xử văn minh.",
        "Tích cực tham gia tranh cãi, xúc phạm nhau dưới các bài đăng nhạy cảm.",
        "Like và chia sẻ ngay các bài viết giật gân mà không cần kiểm chứng đúng sai."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 18,
      "question": "Khi sử dụng một bức ảnh đẹp hoặc một đoạn văn bản do tác giả khác sáng tạo trên mạng để đưa vào bài thuyết trình của mình, hành động nào sau đây là đúng chuẩn mực đạo đức và văn hóa số?",
      "options": [
        "Tự ý xóa tên tác giả cũ rồi ghi tên mình vào để lấy điểm cao.",
        "Ghi rõ tên tác giả và đường dẫn nguồn gốc tác phẩm trích dẫn.",
        "Chỉnh sửa lại một chút màu sắc ảnh rồi nhận là tác phẩm do mình tự thiết kế.",
        "Chỉ cần không nói gì thì thầy cô và các bạn sẽ không bao giờ phát hiện ra."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 19,
      "question": "Hành vi cố tình tạo lập và phát tán tin giả mạo về thiên tai, dịch bệnh trên mạng xã hội sẽ bị xử lý như thế nào?",
      "options": [
        "Chỉ bị quản trị viên diễn đàn nhắc nhở và không chịu bất kì chế tài nào.",
        "Bị xử phạt vi phạm hành chính hoặc truy cứu trách nhiệm hình sự tùy mức độ hậu quả.",
        "Được pháp luật bảo hộ theo quyền tự do sáng tạo nội dung giải trí.",
        "Chỉ bị khóa tài khoản mạng xã hội tạm thời trong vòng 24 giờ."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 20,
      "question": "Phần mềm nào sau đây là ví dụ tiêu biểu về phần mềm mô phỏng phục vụ học tập và nghiên cứu khoa học?",
      "options": [
        "Phòng thí nghiệm ảo PhET phục vụ học tập môn Khoa học tự nhiên.",
        "Trình duyệt web Google Chrome phục vụ tra cứu thông tin hằng ngày.",
        "Bảng mã gõ tiếng Việt UniKey hỗ trợ soạn thảo văn bản trên máy tính.",
        "Ứng dụng diệt virus bảo vệ máy tính trước các phần mềm độc hại."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 21,
      "question": "Nhận định nào sau đây mô tả đúng nhất về hệ thống mô phỏng giáo dục PhET?",
      "options": [
        "Website trò chơi điện tử trực tuyến có thu phí dành cho lứa tuổi thanh thiếu niên.",
        "Nguồn học liệu mở cung cấp các mô phỏng thí nghiệm tương tác trực quan đa môn",
        "Ứng dụng chuyên dùng để quản lý bảng điểm và xếp loại học lực cho các nhà trường.",
        "Phần mềm tự động chuyển đổi bài giảng trình chiếu thành video dạy học trực tuyến."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 22,
      "question": "Khi truy cập vào trang web PhET, mô phỏng về bài học “Cân bằng phương trình hóa học (Balancing Chemical Equations)” thuộc danh mục lĩnh vực nào?",
      "options": [
        "Vật lí (Physics).",
        "Hóa học (Chemistry).",
        "Toán và thống kê (Math & Statistics).",
        "Khoa học Trái đất (Earth & Space)."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 23,
      "question": "Trên hệ thống PhET, mô phỏng “Lắp ráp mạch điện một chiều (Circuit Construction Kit: DC)” thuộc lĩnh vực khoa học nào sau đây?",
      "options": [
        "Vật lí (Physics).",
        "Sinh học (Biology).",
        "Khoa học Trái đất (Earth & Space).",
        "Toán học (Mathematics)."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 24,
      "question": "Lợi ích nổi bật nhất của việc ứng dụng phần mềm mô phỏng trong học tập các môn Khoa học tự nhiên là gì?",
      "options": [
        "Giúp học sinh học thuộc nhanh các định nghĩa lý thuyết trong sách giáo khoa.",
        "Giúp giả lập trực quan các thí nghiệm nguy hiểm, tốn kém hoặc khó quan sát trong thực tế.",
        "Giúp tự động làm hết các bài tập về nhà mà học sinh không cần suy nghĩ.",
        "Thay thế hoàn toàn vai trò hướng dẫn và giảng dạy của giáo viên bộ môn."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    },
    {
      "id": 25,
      "question": "Thiết bị nào sau đây KHÔNG có bộ xử lí thông tin tích hợp?",
      "options": [
        "Bếp củi truyền thống.",
        "Điện thoại thông minh.",
        "Hệ thống tưới cây tự động IoT.",
        "Máy đo huyết áp điện tử."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 26,
      "question": "Tiêu chí 'Tính đầy đủ' của thông tin được thể hiện qua đặc điểm nào?",
      "options": [
        "Cung cấp toàn diện các khía cạnh cần thiết để giải quyết vấn đề.",
        "Bài viết có độ dài trên 100 trang sách.",
        "Sử dụng phông chữ nghệ thuật và hình ảnh sống động.",
        "Bài viết nhận được nhiều lượt chia sẻ trên mạng xã hội."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 27,
      "question": "Khi muốn tìm kiếm tài liệu học tập chính thống về quy chế thi tốt nghiệp, em nên truy cập vào đâu?",
      "options": [
        "Cổng thông tin điện tử chính thức của Bộ Giáo dục và Đào tạo (moet.gov.vn).",
        "Một trang blog cá nhân chia sẻ mẹo học tập không rõ tác giả.",
        "Diễn đàn mạng xã hội có nhiều bình luận tranh cãi.",
        "Trang web giải trí tổng hợp trên mạng."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 28,
      "question": "Hành vi chia sẻ công khai số điện thoại và địa chỉ nhà của bạn bè lên mạng xã hội khi chưa được sự đồng ý vi phạm điều gì?",
      "options": [
        "Quyền riêng tư và bí mật đời tư cá nhân.",
        "Bản quyền nhãn hiệu thương mại.",
        "Quy chuẩn mã hóa ký tự Unicode.",
        "Quy định về thời lượng sử dụng Internet của nhà trường."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 29,
      "question": "Để kiểm chứng một thông tin thời sự giật gân trên mạng xã hội, cách xử lý khoa học nhất là:",
      "options": [
        "Đối chiếu với các cơ quan báo chí chính thống và đài truyền hình quốc gia.",
        "Bấm chia sẻ ngay lên trang cá nhân để cảnh báo mọi người.",
        "Bình luận kêu gọi mọi người cùng vào công kích cá nhân trong bài viết.",
        "Lưu hình ảnh về máy rồi xóa lịch sử duyệt web."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 30,
      "question": "Phần mềm mô phỏng thí nghiệm trực tuyến PhET do tổ chức nào phát triển?",
      "options": [
        "Đại học Colorado Boulder (Hoa Kỳ).",
        "Tập đoàn Microsoft.",
        "Tổ chức Y tế Thế giới (WHO).",
        "Hiệp hội Toán học Quốc tế."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 31,
      "question": "Ưu điểm nổi bật nhất của việc mô phỏng hiện tượng núi lửa phun trào trên máy tính là gì?",
      "options": [
        "Giúp quan sát trực quan hiện tượng nguy hiểm mà không gây rủi ro tính mạng.",
        "Khiến dung nham thật tự động ngừng chảy ngoài tự nhiên.",
        "Thay thế hoàn toàn công việc nghiên cứu của các nhà địa chất học.",
        "Làm giảm nhiệt độ lõi Trái Đất ngay lập tức."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 32,
      "question": "Khi nhận thấy một thông tin sai sự thật đang lan truyền trong nhóm học tập, học sinh nên làm gì?",
      "options": [
        "Lên tiếng giải thích bằng chứng xác thực và khuyên các bạn ngừng chia sẻ.",
        "Hưởng ứng bình luận để bài viết trở nên sôi động hơn.",
        "Chụp ảnh màn hình rồi gửi cho người lạ trên mạng.",
        "Lập tức khóa tài khoản cá nhân và không quan tâm nữa."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 33,
      "question": "Trong phần mềm mô phỏng PhET, để thay đổi hiệu điện thế của nguồn pin, người dùng thao tác:",
      "options": [
        "Nhấp chọn vào viên pin và kéo thanh trượt điều chỉnh số Vôn.",
        "Lắc chuột mạnh trên màn hình máy tính.",
        "Gõ lại toàn bộ hệ điều hành máy tính.",
        "Rút dây nguồn máy tính ra cắm lại."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 34,
      "question": "Hành vi vi phạm nào sau đây có thể bị phạt tiền từ 10 triệu đến 20 triệu đồng theo Nghị định 15/2020/NĐ-CP?",
      "options": [
        "Cung cấp, chia sẻ thông tin giả mạo, thông tin sai sự thật trên mạng xã hội.",
        "Đăng bài chúc mừng sinh nhật bạn bè trên trang cá nhân.",
        "Gửi tệp bài tập về nhà cho giáo viên qua email trường.",
        "Sử dụng hình ảnh bản thân làm ảnh đại diện tài khoản học tập."
      ],
      "correctAnswer": 0,
      "answerLetter": "A",
      "points": 0.25
    },
    {
      "id": 35,
      "question": "Thiết bị nào sau đây là thành phần đóng vai trò 'bộ não' điều khiển mọi hoạt động xử lí dữ liệu trong máy tính?",
      "options": [
        "Bộ nhớ ngoài (ổ đĩa cứng SSD).",
        "Bộ xử lí trung tâm (CPU).",
        "Màn hình hiển thị hình ảnh.",
        "Bộ nguồn máy tính (PSU)."
      ],
      "correctAnswer": 1,
      "answerLetter": "B",
      "points": 0.25
    }
  ],
  "practiceEssayQuestions": [
    {
      "id": 1,
      "num": 1,
      "pointsText": "1,0 điểm",
      "context": "Để chuẩn bị cho chuyến đi học tập trải nghiệm thực tế (dã ngoại ngoại khóa) của lớp 9 sắp tới, bạn Nam được giao nhiệm vụ tìm kiếm thông tin trên Internet để lập kế hoạch chi tiết cho chuyến đi. Nam tìm thấy một bài viết trên một diễn đàn du lịch mạng xã hội chia sẻ về địa điểm mà lớp dự định đến. Tuy nhiên, bài viết này được đăng từ năm 2019, không ghi rõ nguồn gốc từ Ban quản lý khu trải nghiệm, đồng thời chỉ giới thiệu cảnh quan chung chung mà không có thông tin cập nhật về giá vé, lịch mở cửa, các quy định an toàn hay số điện thoại liên hệ khẩn cấp.",
      "subItems": [
        {
          "letter": "a",
          "text": "Dựa vào các tiêu chí đánh giá chất lượng thông tin, em hãy chỉ ra ít nhất 02 tiêu chí mà thông tin bạn Nam tìm được chưa đạt yêu cầu. (0,5 điểm)"
        },
        {
          "letter": "b",
          "text": "Để thu thập thông tin phục vụ mục đích lập kế hoạch cho chuyến đi dã ngoại học tập đạt chất lượng và an toàn, em hãy nêu ít nhất 02 thông tin quan trọng mà Nam cần thu thập và chỉ ra nguồn tin cậy để Nam tìm kiếm các thông tin đó. (0,5 điểm)"
        }
      ],
      "modelAnswer": "a) Hai tiêu chí chưa đạt yêu cầu (0,5 đ): Tính mới (tính thời sự - bài viết từ 2019 đã cũ); Tính chính xác; Tính đầy đủ (thiếu giá vé, nội quy); Tính sử dụng được.\nb) Thu thập thông tin kế hoạch (0,5 đ): Lịch mở cửa, giá vé cập nhật, nội quy an toàn, hotline liên hệ... Nguồn tin cậy: Website/Fanpage tích xanh chính thức của Ban quản lý địa điểm trải nghiệm."
    },
    {
      "id": 2,
      "num": 2,
      "pointsText": "1,0 điểm",
      "context": "Trong một buổi học thực hành tại phòng máy, bạn Hùng thấy tài khoản mạng xã hội của bạn An vẫn đang mở trên máy tính do bạn An quên đăng xuất khi hết tiết. Một vài bạn cùng lớp xúi giục Hùng hãy vào tài khoản của An để đổi ảnh đại diện hài hước và đọc trộm tin nhắn nhóm riêng tư của bạn để kể cho cả lớp nghe.",
      "subItems": [
        {
          "letter": "a",
          "text": "Nếu em là bạn Hùng trong tình huống trên, em sẽ lựa chọn hành động như thế nào để thể hiện hành vi có đạo đức, văn hóa trong môi trường số và tôn trọng quyền riêng tư của bạn? (0,5 điểm)"
        },
        {
          "letter": "b",
          "text": "Nếu ai đó cố tình chiếm đoạt tài khoản, phát tán hình ảnh hoặc tin nhắn riêng tư của người khác lên mạng nhằm mục đích bêu riếu, xúc phạm thì hành vi đó đã vi phạm quy định gì và có thể dẫn đến những hậu quả tâm lí, xã hội tiêu cực nào cho người bị hại? (0,5 điểm)"
        }
      ],
      "modelAnswer": "a) Hành động chuẩn mực của Hùng (0,5 đ): Từ chối ngay lời xúi giục của bạn bè; tuyệt đối không xem trộm tin nhắn hay đổi thông tin của An; chủ động đăng xuất tài khoản giúp bạn hoặc báo cho bạn biết.\nb) Hậu quả và quy định vi phạm (0,5 đ): Vi phạm Luật An ninh mạng, Nghị định 15/2020/NĐ-CP và Bộ quy tắc ứng xử trên mạng xã hội. Khiến nạn nhân bị tổn thương tâm lý sâu sắc (lo âu, trầm cảm, xấu hổ), làm rạn nứt tình bạn."
    },
    {
      "id": 3,
      "num": 3,
      "pointsText": "1,0 điểm",
      "context": "Trong môn Khoa học tự nhiên 9, lớp em học bài thực hành khảo sát đoạn mạch điện một chiều (gồm nguồn pin, bóng đèn, công tắc, dây dẫn) và sử dụng đồng hồ đo để đo cường độ dòng điện trong mạch. Nếu làm thí nghiệm thật với các thiết bị vật lý trong phòng thực hành, các bạn có thể lắp nhầm cực gây đoản mạch làm cháy bóng đèn hoặc hỏng đồng hồ đo, đồng thời số lượng linh kiện thí nghiệm trong phòng học có hạn.",
      "subItems": [
        {
          "letter": "a",
          "text": "Em hãy giải thích vì sao việc sử dụng phần mềm mô phỏng (như bài mô phỏng mạch điện trên trang PhET) lại là giải pháp an toàn và thuận tiện hơn so với khi làm thí nghiệm thật trong tình huống trên? (0,5 điểm)"
        },
        {
          "letter": "b",
          "text": "Để lắp ráp một mạch điện kín thắp sáng bóng đèn và đo cường độ dòng điện trong mạch trên giao diện mô phỏng PhET, em hãy nêu các thao tác cơ bản cần thực hiện. (0,5 điểm)"
        }
      ],
      "modelAnswer": "a) Lợi ích phần mềm mô phỏng (0,5 đ): An toàn tuyệt đối: Không lo nguy cơ đoản mạch làm cháy hỏng bóng đèn hay thiết bị đo; Thuận tiện và không giới hạn linh kiện, dễ dàng thay đổi thông số đo.\nb) Thao tác trên giao diện PhET (0,5 đ): Thao tác 1 (Lắp mạch): Kéo thả pin, bóng đèn, công tắc, dây dẫn từ thanh công cụ ra màn hình và nối lại thành mạch kín. Thao tác 2 (Đo dòng điện): Bấm đóng công tắc làm sáng đèn, kéo Ampe kế mắc nối tiếp vào mạch để đọc chỉ số."
    }
  ]
};
}));
