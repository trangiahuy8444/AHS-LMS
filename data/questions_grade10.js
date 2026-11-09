/**
 * questions_grade10.js
 * Ngân hàng câu hỏi Tin học Khối 10 - Trường Quốc Tế Á Châu (Asian School)
 * Bao gồm Đề cương Ôn tập (Trắc nghiệm + Đúng/Sai + Tự luận kèm Hướng dẫn chấm Rubric) và 4 Mã Đề Thi Chính Thức
 */

// Luôn gắn window.EXAM_DATA_G10 (kể cả khi Vite đóng gói tệp như CommonJS); Node test dùng module.exports
(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.EXAM_DATA_G10 = data;
}(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which core technology does Google Translate use to analyse language data and translate languages?",
          "options": [
            "The hardware's mechanical memorisation of binary character-code tables.",
            "Manual lookup by online translators working around the clock.",
            "Artificial intelligence and machine-learning models for natural language processing.",
            "Pure keyword-search algorithms using a fixed dictionary."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the default file extension for graphics created with the open-source software Inkscape?",
          "options": [
            ".svg",
            ".docx",
            ".mp4",
            ".xlsx"
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which action violates copyright in the digital environment?",
          "options": [
            "Downloading commercial software from an illegal source and cracking it to avoid paying.",
            "Quoting a short passage in an assignment and clearly identifying the author and source.",
            "Using an image with an open Creative Commons licence and crediting the original author.",
            "Buying a software licence and installing it on the permitted number of computers."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "How is information usually organised and classified in online digital repositories?",
          "options": [
            "In a clear hierarchy of folders by topic and searchable keywords.",
            "By automatically deleting older learning materials every 48 hours.",
            "By mixing all text documents and videos into a single file.",
            "In a random order based on when users visit the page."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "A major advantage of digital devices over traditional storage media is:",
          "options": [
            "Always operating reliably without an electrical supply.",
            "Never experiencing physical hardware failure.",
            "Storing very large amounts of data in a compact form.",
            "Automatically converting all information into cryptocurrency."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "In which order does a computer's basic information-processing cycle take place?",
          "options": [
            "Receive data -> Process data -> Output or store information.",
            "Store data -> Output information -> Receive input signals.",
            "Output information -> Receive data -> Process and transmit data.",
            "Process information -> Receive data -> Delete data from the computer."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "The most fundamental characteristic of an IoT (Internet of Things) system is:",
          "options": [
            "Every device must use the same LAN cable.",
            "Users must directly control every small operation.",
            "Devices connect to a network to exchange data automatically.",
            "All digital devices must share one display screen."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What core role do smart devices play in the Fourth Industrial Revolution?",
          "options": [
            "Completely eliminating the global need for the Internet.",
            "Acting as components that collect and process data automatically.",
            "Forcing people to stop participating in all production processes.",
            "Completely replacing every form of creative artistic thinking."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the fundamental difference between vector graphics and bitmap (raster) graphics?",
          "options": [
            "Vector graphics are defined by mathematical formulas; bitmap graphics consist of pixels.",
            "Bitmap images do not become pixelated when enlarged, whereas vector images do.",
            "Vector files are larger than bitmap files in every case.",
            "Bitmap graphics are used only for printing, while vector graphics are used only on the web."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which of the following is classified as a smart device?",
          "options": [
            "A basic calculator that performs only four arithmetic operations.",
            "A conventional ceiling fan with a mechanical speed control.",
            "An electric iron operated by a mechanical switch.",
            "A smartphone on which applications can be installed."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which cloud service model allows users to use software directly through a web browser?",
          "options": [
            "SaaS (Software as a Service).",
            "IaaS (Infrastructure as a Service).",
            "DaaS (Device as a Service).",
            "PaaS (Platform as a Service)."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the greatest information-security risk of downloading and using cracked software?",
          "options": [
            "A portable device's battery immediately swells and explodes.",
            "Users are forced to upgrade to newer hardware.",
            "The monitor's display resolution is permanently reduced.",
            "Malware is often bundled with the software to steal personal data."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "In computing, digital data is accurately defined as:",
          "options": [
            "Human memory of the natural world.",
            "Knowledge accumulated through school lessons.",
            "Practical meaning derived from events in everyday life.",
            "Information that has been encoded for computer processing."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the basic way a computer virus spreads in a digital environment?",
          "options": [
            "Attaching malicious code to other files and spreading when those files are activated.",
            "Automatically spreading to household electronic devices that have no digital circuits.",
            "Spreading between computers only through electrical power lines.",
            "Generating itself even when the computer is completely disconnected from every power source."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What major benefit do cloud storage services such as Google Drive and OneDrive provide?",
          "options": [
            "Making personal computers immune to every form of ransomware.",
            "Automatically doubling the processing speed of personal hardware.",
            "Allowing data access and synchronisation whenever an Internet connection is available.",
            "Preventing smartphones from ever consuming battery power during use."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which of the following are computer input devices?",
          "options": [
            "A keyboard and an optical mouse.",
            "A monitor and speakers.",
            "A colour printer and a projector.",
            "A hard drive and a memory card."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Within which area is a LAN (Local Area Network) usually installed?",
          "options": [
            "Within a building, organisation or school.",
            "Across continents worldwide.",
            "Between countries around the world.",
            "Across an entire province or city."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which characteristic describes a bitmap graphics file?",
          "options": [
            "It consists of a grid of pixels and can become pixelated when enlarged.",
            "It is defined by mathematical equations and never becomes pixelated.",
            "It always has a smaller file size than vector graphics.",
            "It cannot display photographs of real landscapes."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which Inkscape keyboard shortcut is used to export a file as a PNG image?",
          "options": [
            "Shift + Ctrl + E.",
            "Ctrl + S.",
            "Ctrl + Z.",
            "Ctrl + P."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What does the PaaS (Platform as a Service) cloud computing model provide?",
          "options": [
            "A platform and application development environment for programmers.",
            "All the raw physical server hardware.",
            "Only email sending and receiving services.",
            "Long-distance telecommunications cable networks."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which key should you hold while clicking to select multiple geometric objects in Inkscape?",
          "options": [
            "Shift.",
            "Alt.",
            "Tab.",
            "Esc."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "Which is the most effective measure for preventing computer viruses?",
          "options": [
            "Regularly scanning for viruses and updating the operating system and security software.",
            "Never starting a computer while its battery charger is connected.",
            "Using the computer only during daylight hours.",
            "Unplugging the display cable when it is not in use."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the main function of Inkscape's 'Edit paths by nodes' tool (shortcut N)?",
          "options": [
            "Editing the nodes and curves of vector objects.",
            "Drawing basic rectangles and squares.",
            "Changing the background colour of the entire design page.",
            "Deleting design layers."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "How many megabytes (MB) are equivalent to 2 GB of memory?",
          "options": [
            "1,024 MB.",
            "2,048 MB.",
            "512 MB.",
            "4,096 MB."
          ]
        }
      }
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
      "points": 0.25,
      "translations": {
        "en": {
          "question": "What is the usual purpose of Creative Commons (CC) licences in the digital environment?",
          "options": [
            "Completely prohibiting every form of copying.",
            "Allowing authors to share their work with the community under specific conditions.",
            "Protecting a business's exclusive trade secrets.",
            "Registering hardware technology patents."
          ]
        }
      }
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
      ],
      "translations": {
        "en": {
          "context": "During an IT practical lesson, An receives an email from an unfamiliar address announcing that An has won a phone. It includes a file called Phanthuong.exe. An's computer has licensed antivirus software installed.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "To check it safely, An should temporarily turn off the antivirus software and run the file to see its contents first."
            },
            {
              "letter": "b",
              "text": "Antivirus software can automatically warn about or quarantine files containing suspected malware."
            },
            {
              "letter": "c",
              "text": "Immediately opening an .exe file from a stranger risks infecting the computer with spyware (a Trojan)."
            },
            {
              "letter": "d",
              "text": "A file with the .exe extension is a program executable in Windows."
            }
          ]
        }
      }
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
      ],
      "translations": {
        "en": {
          "context": "Lan is making a presentation video about local scenic attractions to post on social media. She wants to use songs and images found on the Internet in the video.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "The CC BY symbol allows Lan to use the work freely but requires crediting the original author."
            },
            {
              "letter": "b",
              "text": "Creative Commons (CC) is a system of open licences that lets authors share works under specified conditions of use."
            },
            {
              "letter": "c",
              "text": "Music and digital images are protected by copyright law."
            },
            {
              "letter": "d",
              "text": "Lan may download a paid, exclusive song and add it to the video legally simply by writing, 'I do not own the copyright to this song.'"
            }
          ]
        }
      }
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
      ],
      "translations": {
        "en": {
          "context": "A group of Grade 10 students are working on a learning project. They use smartphones to photograph real activities and Google Drive cloud storage to share data with group members.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "To prevent outsiders from modifying project data, the group should set public sharing to 'Anyone with the link can edit (Editor)'."
            },
            {
              "letter": "b",
              "text": "A smartphone is a digital system capable of capturing and processing image data."
            },
            {
              "letter": "c",
              "text": "After photos are uploaded to the cloud, other members can view the data only if they have valid access permission."
            },
            {
              "letter": "d",
              "text": "Google Drive is a cloud computing service that allows users to store and share files online."
            }
          ]
        }
      }
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
      ],
      "translations": {
        "en": {
          "context": "A technology company implements an online working system and uses cloud services for its employees.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Cloud computing helps employees work and access documents remotely."
            },
            {
              "letter": "b",
              "text": "The company needs no account-security measures because the cloud provider automatically takes full responsibility."
            },
            {
              "letter": "c",
              "text": "IaaS services allow businesses to rent flexible virtualised server and storage infrastructure."
            },
            {
              "letter": "d",
              "text": "Data stored in the cloud cannot be affected by user mistakes such as accidental deletion or weak passwords."
            }
          ]
        }
      }
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
      ],
      "translations": {
        "en": {
          "context": "During a graphics practical lesson using Inkscape, Tuan creates a logo for the school's football club.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "Tuan can enlarge the vector logo to billboard size while keeping it sharp."
            },
            {
              "letter": "b",
              "text": "When preparing printed work, Tuan should save the source file as .svg for future editing."
            },
            {
              "letter": "c",
              "text": "Inkscape vector graphics support only solid colours and cannot use gradients."
            },
            {
              "letter": "d",
              "text": "To bring an external bitmap photograph into Inkscape, Tuan uses Import (Ctrl + I)."
            }
          ]
        }
      }
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
      ],
      "translations": {
        "en": {
          "context": "Minh searches the Internet for materials for an assignment in Economic and Legal Education.",
          "subQuestions": [
            {
              "letter": "a",
              "text": "All information on social media has been checked and is guaranteed completely accurate."
            },
            {
              "letter": "b",
              "text": "Minh should prioritise legal documents from official government and ministry portals."
            },
            {
              "letter": "c",
              "text": "Copying another author's article word for word into an assignment without citation is plagiarism."
            },
            {
              "letter": "d",
              "text": "Every document found through Google may be commercially exploited freely without the author's permission."
            }
          ]
        }
      }
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
      "modelAnswer": "a) Đổi GB sang MB (0,25 đ): 16 GB * 1024 = 16.384 MB.\nb) Số bức ảnh tối đa (0,25 đ): 16.384 / 8 = 2.048 bức ảnh.\nc) Dung lượng trống còn lại (0,25 đ): 16 - 4 = 12 GB.",
      "translations": {
        "en": {
          "context": "A camera memory card displays a storage capacity of 16 GB. A high-quality digital photograph taken with this camera has an average size of 8 MB.",
          "subItems": [
            {
              "letter": "a",
              "text": "Convert 16 GB to megabytes (MB), given that 1 GB = 1024 MB. (0.25 points)"
            },
            {
              "letter": "b",
              "text": "What is the maximum number of digital photographs of the stated size that this card can store? (0.25 points)"
            },
            {
              "letter": "c",
              "text": "If the user records additional short videos totalling 4 GB, calculate the card's remaining free space in GB. (0.25 points)"
            }
          ]
        }
      }
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
      "modelAnswer": "a) Hai lợi ích lưu trữ đám mây (0,25 đ): Truy cập mọi lúc mọi nơi trên nhiều thiết bị; không sợ mất dữ liệu khi hỏng ổ cứng cá nhân.\nb) Lựa chọn phân quyền (0,25 đ): Chọn Editor (Người chỉnh sửa) để các thành viên trong nhóm cùng trực tiếp đóng góp nội dung vào bài làm.\nc) Biện pháp bảo mật (0,25 đ): Đặt mật khẩu mạnh kết hợp bật tính năng xác thực hai yếu tố (2FA).",
      "translations": {
        "en": {
          "context": "Your school is introducing online learning combined with cloud storage for Grade 10 students.",
          "subItems": [
            {
              "letter": "a",
              "text": "State two practical benefits of storing learning materials in the cloud rather than on a personal computer's hard drive. (0.25 points)"
            },
            {
              "letter": "b",
              "text": "When sharing a group learning document on Google Drive, which permission should you give your groupmates so that you can work on it together: Viewer or Editor? Explain your answer. (0.25 points)"
            },
            {
              "letter": "c",
              "text": "State one important measure to protect your cloud storage account against unauthorised access and document theft. (0.25 points)"
            }
          ]
        }
      }
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
      "modelAnswer": "a) Phím thao tác hình chuẩn (0,25 đ): Giữ phím Ctrl khi kéo thả chuột.\nb) Phân biệt Fill và Stroke (0,25 đ): Fill là màu tô bên trong diện tích hình khối; Stroke là màu của đường viền bao quanh hình khối.\nc) Định dạng ảnh xuất (0,25 đ): Xuất sang tệp ảnh PNG vì PNG hỗ trợ kênh màu Alpha trong suốt, JPG không hỗ trợ.",
      "translations": {
        "en": {
          "context": "In the Inkscape graphics design software:",
          "subItems": [
            {
              "letter": "a",
              "text": "Which keyboard key should you hold while dragging to draw a perfect circle or square, rather than an ellipse or rectangle? (0.25 points)"
            },
            {
              "letter": "b",
              "text": "Explain the difference between an object's Fill and Stroke colour properties in Inkscape. (0.25 points)"
            },
            {
              "letter": "c",
              "text": "After creating a class logo, which image format should you export to, PNG or JPG, to preserve a transparent background for use in yearbook publications? (0.25 points)"
            }
          ]
        }
      }
    }
  ]
};
}));
