/**
 * questions_grade9.js
 * Ngân hàng câu hỏi Tin học Khối 9 - Trường Quốc Tế Á Châu (Asian School)
 * Bao gồm Đề cương Ôn tập (Trắc nghiệm + Đúng/Sai + Tự luận kèm Hướng dẫn chấm Rubric) và 4 Mã Đề Thi Chính Thức
 */

// Luôn gắn window.EXAM_DATA_G9 (kể cả khi Vite đóng gói tệp như CommonJS); Node test dùng module.exports
(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.EXAM_DATA_G9 = data;
}(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which device is a typical example of a device with an embedded information processor used in commerce and services?",
          "options": [
            "A projector displaying images in a classroom.",
            "An X-ray machine used for diagnosis in a hospital.",
            "An automated POS payment system at a checkout counter.",
            "A mechanical fountain system in a park."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which household appliance has an information processor that enables automatic sensing and programmed operation?",
          "options": [
            "A traditional cast-iron pot heated on a wood-fired stove.",
            "An induction-heating rice cooker with an automatic timer.",
            "A glass vacuum flask from which water is poured manually.",
            "A conventional ceiling fan operated by a mechanical switch."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the main computer component responsible for receiving data, controlling operations and executing instructions called?",
          "options": [
            "Secondary storage (a hard drive).",
            "A high-resolution monitor.",
            "The CPU (Central Processing Unit).",
            "The computer mouse and keyboard."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which statement correctly describes the basic function of an information processor?",
          "options": [
            "Representing data as analogue sound.",
            "Receiving input data, processing it and producing results.",
            "Providing backup electrical power during an outage.",
            "Printing data directly on paper without a print command."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "A computer's information processor can receive and directly process data only after the data has been:",
          "options": [
            "Digitised into a sequence of binary bits consisting of 0s and 1s.",
            "Translated into English according to international standards.",
            "Printed on a paper document bearing an approval stamp.",
            "Compressed into high-resolution video files."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which characteristic demonstrates computers' major advantage in data storage over traditional methods?",
          "options": [
            "Storing enormous amounts of data on compact devices or in the cloud.",
            "Preserving handwritten papers for hundreds of years without mould.",
            "Limiting data storage to one week before automatically deleting everything.",
            "Allowing only printed text to be stored and requiring it to be scanned again before viewing."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Of the four criteria for information quality, which is most important because it directly determines whether a problem-solving decision is correct?",
          "options": [
            "The aesthetic quality of the document's font.",
            "The accuracy of the data source.",
            "The large size of the stored file.",
            "The attractiveness of the headline."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is another name for the 'newness' criterion, referring to when information was created or updated?",
          "options": [
            "The timeliness of information.",
            "The usability of data.",
            "The completeness of the text.",
            "The artistic quality of illustrations."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which statement about information quality in problem-solving is FALSE?",
          "options": [
            "Good-quality information helps people make correct and effective decisions.",
            "Misleading information can have serious consequences and cause tasks to fail.",
            "The four basic quality criteria are accuracy, newness, completeness and use…",
            "The longer the information and the more decorative images it contains, the quality of problem-solving…"
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which characteristic most clearly demonstrates the usability of information?",
          "options": [
            "The information is clearly presented, easy to understand and useful for the intended purpose.",
            "The information is very long and contains hundreds of pages of complex digital documents.",
            "The information is kept completely secret and all source citation is prohibited.",
            "The information is encoded with unfamiliar symbols that others cannot read."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Why do users need to check and assess information quality when searching the Internet?",
          "options": [
            "All information online has undergone strict checks and is 100% accurate.",
            "The Internet contains useful information alongside fake and misleading information that has not been checked…",
            "Search engines automatically remove every article without copyright.",
            "Information on social media is always more accurate than standard textbooks."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "A meteorological website updates rainfall and storm movement information every 15 minutes to help people prepare for natural disasters. Which criterion does this most clearly demonstrate?",
          "options": [
            "Timeliness (newness).",
            "Data complexity.",
            "The artistic quality of the map.",
            "Information security."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "You read an anonymous social media post claiming, 'Drinking warm lemon water at midnight completely cures every incurable disease,' with no reference to the Ministry of Health. Which information quality criterion is most questionable?",
          "options": [
            "Usability.",
            "The accuracy of information.",
            "The timeliness of the news.",
            "The artistic quality of the post."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is a typical negative effect of excessive use of digital devices and social media on students?",
          "options": [
            "Improving online teamwork skills and widening friendships.",
            "Potentially worsening eyesight, encouraging inactivity and reducing face-to-face interaction.",
            "Developing independent thinking and improving study-time management.",
            "Increasing physical endurance and developing outdoor movement skills."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What negative effect can electronic waste, such as used batteries, broken computers and untreated discarded circuits, have on people's lives?",
          "options": [
            "Exhausting fibre-optic network bandwidth.",
            "Polluting soil and water and seriously threatening human health through contamination…",
            "Reducing the operating speed of application software.",
            "Increasing the computer room temperature when cooling fans are used."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Secretly photographing a classmate's school records, results or private photos and posting them on public online forums without permission is:",
          "options": [
            "Commendable because it helps the whole class understand their academic progress.",
            "An invasion of privacy and a violation of online conduct rules.",
            "Completely legal because social media permits unrestricted speech.",
            "A harmless joke that needs no attention."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "According to the Code of Conduct on Social Networks issued by the Ministry of Information and Communications, social media users should:",
          "options": [
            "Post a classmate's personal data to encourage online judgement.",
            "Share information from official sources, spread positive messages and behave respectfully.",
            "Actively argue and insult others under sensitive posts.",
            "Immediately like and share sensational posts without checking their accuracy."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "When using an image or text created by another author online in your presentation, which action follows digital ethical and cultural standards?",
          "options": [
            "Remove the original author's name and replace it with your own to earn a higher mark.",
            "Clearly state the author's name and provide the original source link.",
            "Make a small change to the image's colours and claim to have designed it yourself.",
            "Say nothing, because teachers and classmates will never discover it."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "How may deliberately creating and spreading false information about natural disasters or epidemics on social media be dealt with?",
          "options": [
            "Only through a forum moderator's warning, with no other penalties.",
            "Through administrative penalties or criminal prosecution, depending on the consequences.",
            "Through legal protection under freedom to create entertainment content.",
            "Only through a temporary 24-hour suspension of the social media account."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which is a typical example of simulation software used for learning and scientific research?",
          "options": [
            "The PhET virtual laboratory for learning natural sciences.",
            "The Google Chrome browser for everyday information searches.",
            "The UniKey Vietnamese input utility for typing on a computer.",
            "An antivirus application that protects computers from malware."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which statement best describes the PhET educational simulation system?",
          "options": [
            "A paid online gaming website for teenagers.",
            "An open educational resource offering visual, interactive experimental simulations across multiple subjects…",
            "An application specifically for managing school gradebooks and academic classifications.",
            "Software that automatically converts presentation lessons into online teaching videos."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "On the PhET website, the 'Balancing Chemical Equations' simulation belongs to which subject category?",
          "options": [
            "Physics.",
            "Chemistry.",
            "Math & Statistics.",
            "Earth & Space."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "On PhET, 'Circuit Construction Kit: DC' belongs to which scientific field?",
          "options": [
            "Physics.",
            "Biology.",
            "Earth & Space.",
            "Mathematics."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the main benefit of using simulation software to learn natural sciences?",
          "options": [
            "Helping students memorise textbook definitions more quickly.",
            "Visually simulating experiments that are dangerous, expensive or difficult to observe in real life.",
            "Automatically completing all homework without students having to think.",
            "Completely replacing the subject teacher's guidance and teaching."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which device does NOT have an embedded information processor?",
          "options": [
            "A traditional wood-fired stove.",
            "A smartphone.",
            "An IoT automatic watering system.",
            "An electronic blood pressure monitor."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which characteristic demonstrates the completeness of information?",
          "options": [
            "Covering all the necessary aspects of solving a problem.",
            "An article being more than 100 book pages long.",
            "Using artistic fonts and vivid images.",
            "An article receiving many social media shares."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Where should you look for official learning materials about graduation examination regulations?",
          "options": [
            "The Ministry of Education and Training's official portal (moet.gov.vn).",
            "A personal study-tips blog with no identifiable author.",
            "A social media forum with many argumentative comments.",
            "A general entertainment website."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is violated by publicly sharing a friend's phone number and home address on social media without permission?",
          "options": [
            "Personal privacy and the confidentiality of private life.",
            "Trademark copyright.",
            "Unicode character-encoding standards.",
            "The school's Internet-use time limits."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the most systematic way to verify a sensational social media news story?",
          "options": [
            "Check it against official news organisations and national television.",
            "Immediately share it on your personal page to warn everyone.",
            "Comment to encourage others to attack the person mentioned in the post.",
            "Save the image to your device and delete your browsing history."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which organisation developed the PhET online experimental simulation software?",
          "options": [
            "The University of Colorado Boulder, United States.",
            "Microsoft Corporation.",
            "The World Health Organization (WHO).",
            "The International Mathematical Union."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the main advantage of simulating a volcanic eruption on a computer?",
          "options": [
            "It allows visual observation of a dangerous phenomenon without risking lives.",
            "It automatically stops real lava from flowing in nature.",
            "It completely replaces geologists' research work.",
            "It immediately reduces the temperature of the Earth's core."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What should students do when false information is spreading in a study group?",
          "options": [
            "Explain the verified evidence and encourage others to stop sharing it.",
            "Join the comments to make the post more active.",
            "Take a screenshot and send it to strangers online.",
            "Immediately lock their own accounts and stop caring about it."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "In a PhET simulation, how can a user change a battery's voltage?",
          "options": [
            "Select the battery and move the voltage slider.",
            "Shake the computer mouse vigorously.",
            "Retype the computer's entire operating system.",
            "Unplug the computer's power cable and plug it in again."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which violation may be subject to a fine of VND 10–20 million under Decree 15/2020/ND-CP?",
          "options": [
            "Providing or sharing fabricated or false information on social media.",
            "Posting birthday wishes for friends on a personal page.",
            "Emailing homework to a teacher through school email.",
            "Using your own photo as the profile picture of a learning account."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which computer component acts as the 'brain' controlling all data-processing activities?",
          "options": [
            "Secondary storage (an SSD).",
            "The CPU (Central Processing Unit).",
            "The image display monitor.",
            "The computer's power supply unit (PSU)."
          ]
        }
      }
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
      "modelAnswer": "a) Hai tiêu chí chưa đạt yêu cầu (0,5 đ): Tính mới (tính thời sự - bài viết từ 2019 đã cũ); Tính chính xác; Tính đầy đủ (thiếu giá vé, nội quy); Tính sử dụng được.\nb) Thu thập thông tin kế hoạch (0,5 đ): Lịch mở cửa, giá vé cập nhật, nội quy an toàn, hotline liên hệ... Nguồn tin cậy: Website/Fanpage tích xanh chính thức của Ban quản lý địa điểm trải nghiệm.",
      "translations": {
        "en": {
          "context": "To prepare for an upcoming Grade 9 field trip, Nam is asked to find information online and create a detailed plan. He finds a post about the intended destination on a social media travel forum. However, it was posted in 2019, does not identify the site's management as its source, and only describes the scenery in general terms. It gives no updated ticket prices, opening hours, safety rules or emergency contact numbers.",
          "subItems": [
            {
              "letter": "a",
              "text": "Using the information quality criteria, identify at least two criteria that Nam's information does not satisfy. (0.5 points)"
            },
            {
              "letter": "b",
              "text": "To plan a safe, high-quality educational field trip, state at least two important pieces of information Nam needs to collect and identify reliable sources for finding them. (0.5 points)"
            }
          ]
        }
      }
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
      "modelAnswer": "a) Hành động chuẩn mực của Hùng (0,5 đ): Từ chối ngay lời xúi giục của bạn bè; tuyệt đối không xem trộm tin nhắn hay đổi thông tin của An; chủ động đăng xuất tài khoản giúp bạn hoặc báo cho bạn biết.\nb) Hậu quả và quy định vi phạm (0,5 đ): Vi phạm Luật An ninh mạng, Nghị định 15/2020/NĐ-CP và Bộ quy tắc ứng xử trên mạng xã hội. Khiến nạn nhân bị tổn thương tâm lý sâu sắc (lo âu, trầm cảm, xấu hổ), làm rạn nứt tình bạn.",
      "translations": {
        "en": {
          "context": "During a practical lesson in the computer room, Hung notices that An's social media account is still open because An forgot to log out after the lesson. Some classmates encourage Hung to change An's profile picture to something funny and secretly read An's private group messages to tell the class about them.",
          "subItems": [
            {
              "letter": "a",
              "text": "If you were Hung, what would you do to demonstrate ethical and respectful digital behaviour and respect An's privacy? (0.5 points)"
            },
            {
              "letter": "b",
              "text": "If someone deliberately takes over another person's account and publishes their private pictures or messages online to ridicule or insult them, what rules does this violate, and what negative psychological and social consequences could the victim experience? (0.5 points)"
            }
          ]
        }
      }
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
      "modelAnswer": "a) Lợi ích phần mềm mô phỏng (0,5 đ): An toàn tuyệt đối: Không lo nguy cơ đoản mạch làm cháy hỏng bóng đèn hay thiết bị đo; Thuận tiện và không giới hạn linh kiện, dễ dàng thay đổi thông số đo.\nb) Thao tác trên giao diện PhET (0,5 đ): Thao tác 1 (Lắp mạch): Kéo thả pin, bóng đèn, công tắc, dây dẫn từ thanh công cụ ra màn hình và nối lại thành mạch kín. Thao tác 2 (Đo dòng điện): Bấm đóng công tắc làm sáng đèn, kéo Ampe kế mắc nối tiếp vào mạch để đọc chỉ số.",
      "translations": {
        "en": {
          "context": "In Grade 9 natural sciences, your class studies a DC circuit consisting of a battery, bulb, switch and wires, using a meter to measure the current. With real laboratory equipment, incorrectly connecting the terminals could cause a short circuit, damage the bulb or meter, and the number of available components is limited.",
          "subItems": [
            {
              "letter": "a",
              "text": "Explain why simulation software, such as a circuit simulation on PhET, is a safer and more convenient solution than a real experiment in this situation. (0.5 points)"
            },
            {
              "letter": "b",
              "text": "Describe the basic steps for building a closed circuit that lights a bulb and measuring the current in that circuit in PhET. (0.5 points)"
            }
          ]
        }
      }
    }
  ]
};
}));
