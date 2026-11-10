import React, { createContext, useContext, useEffect, useState } from 'react';
const EN = {
  'Nhắc nhở vi phạm của giáo viên':'Teacher warning',
  'Giáo viên đã nhắc':'Teacher reminders:',
  'Em cần nghiêm túc làm bài.':'Please focus and follow the exam rules.',
  'Thông báo tự ẩn sau 3 giây.':'This notice closes automatically after 3 seconds.',
  'Thông báo tự ẩn sau 5 giây.':'This notice closes automatically after 5 seconds.',
  'Thông báo tự ẩn sau 7 giây.':'This notice closes automatically after 7 seconds.',
  'Thông báo tự ẩn sau 10 giây.':'This notice closes automatically after 10 seconds.',
  'Thông báo tự ẩn sau 15 giây.':'This notice closes automatically after 15 seconds.',

  'Họ tên':'Name','Mã LMS':'LMS ID','Lớp':'Class','Chưa nhập':'Not entered','Chưa chọn':'Not selected','Thông tin học sinh':'Student information',
  'Nội quy & hướng dẫn':'Rules & instructions','Thời gian làm bài':'Time allowed','phút':'minutes',
  'Câu trước':'Previous','Câu tiếp theo':'Next','Đã đến câu cuối':'Last question','Câu':'Question','câu':'questions','điểm':'points',
  'Trắc nghiệm':'Multiple choice','Đúng / Sai':'True / False','Tự luận':'Written response','Tự luận · không tính điểm':'Written response · ungraded',
  'Máy tính':'Calculator','Mở Máy tính cầm tay':'Open calculator','Đang mở Máy tính':'Calculator open','Tính toán':'Calculate','Tin 10':'IT 10',
  'Phần nhập bài làm của thí sinh:':'Your response:','Đã nhập:':'Characters:','ký tự':'',
  'Nhập nội dung giải bài tập, phân tích tình huống của em vào đây...':'Type your answer and explanation here...',
  'Thời gian còn lại':'Time remaining','Phòng thi':'Exam','Ôn tập':'Practice','Bắt đầu:':'Started:','Vừa xong':'Just now','Đã làm:':'Elapsed:',
  'BẢNG CÂU HỎI':'QUESTIONS','Bảng câu hỏi':'Questions','Đóng bảng câu hỏi':'Close questions','Đề cương ôn tập':'Practice questions','Mã đề':'Paper',
  'Đang xem':'Current','Đã làm':'Answered','Chưa làm':'Unanswered','NỘP BÀI THI CHÍNH THỨC':'SUBMIT EXAM','NỘP BÀI & XEM ĐÁNH GIÁ':'SUBMIT PRACTICE',
  'CHƯA THỂ NỘP (CÒN':'SUBMISSION OPENS IN','Còn:':'Left:','Thời gian:':'Time:','Vi phạm:':'Violations:',
  'Mất kết nối · Bài làm được giữ trên máy này. Em có thể tiếp tục làm bài.':'Offline · Your answers are kept on this device. You can continue working.',
  'Đang tải bộ câu hỏi, vui lòng chờ trong giây lát...':'Loading questions. Please wait...',
  'Nhắc nhở của giáo viên':'Teacher reminder','Lần':'No.',
  '💡':'💡','Yêu cầu:':'Instructions:','Đọc kĩ đoạn ngữ cảnh/tình huống dưới đây. Trong mỗi ý a), b), c), d), hãy chọn':'Read the situation below. For each statement a), b), c), d), choose',
  'ĐÚNG':'TRUE','SAI':'FALSE','hoặc':'or',
  'XÁC NHẬN NỘP BÀI LÀM':'CONFIRM SUBMISSION','Tổng số câu hỏi:':'Total questions:','Số câu đã hoàn thành:':'Answered:','Số câu chưa hoàn thành:':'Unanswered:',
  'Em có chắc chắn muốn nộp bài ngay bây giờ để hệ thống chấm điểm và xuất kết quả không?':'Submit your answers now for marking?',
  'Quay Lại Làm Tiếp':'Keep working','Đồng Ý Nộp Bài':'Submit answers','Chờ':'Wait',
  'Chưa Đến Thời Gian Nộp Bài ⏱️':'Submission not yet available ⏱️',
  'Tự luận không tính điểm':'Written response is ungraded',
  'CẢNH BÁO VI PHẠM':'VIOLATION WARNING','Tổng vi phạm đã ghi nhận:':'Recorded violations:','lần':'times',
  'QUAY LẠI TOÀN MÀN HÌNH':'RETURN TO FULLSCREEN','ĐÃ DUYỆT MỞ KHÓA':'UNLOCK APPROVED','BÀI THI BỊ TẠM THỜI KHÓA':'EXAM TEMPORARILY LOCKED',
  'Giáo viên đã mở khóa. Bấm nút dưới để trở lại toàn màn hình và tiếp tục làm bài.':'Your teacher has unlocked the exam. Use the button below to return to fullscreen and continue.',
  'Bài làm đã khóa sau 3 lần rời giao diện hoặc thoát toàn màn hình.':'Your work was locked after three instances of leaving the exam or exiting fullscreen.',
  'Giám thị đã tạm khóa bài làm.':'The invigilator has temporarily locked your work.',
  'Em hãy giữ màn hình này và báo giám thị để được mở khóa.':'Keep this screen open and ask the invigilator to unlock it.',
  'ĐANG CHỜ GIÁO VIÊN DUYỆT MỞ KHÓA':'WAITING FOR YOUR TEACHER TO UNLOCK',
  'VÀO LẠI TOÀN MÀN HÌNH':'RETURN TO FULLSCREEN',
  'HƯỚNG DẪN LÀM BÀI THI':'EXAM INSTRUCTIONS',
  'HƯỚNG DẪN VÀ ĐIỀU KIỆN HOÀN THÀNH (LMS)':'INSTRUCTIONS AND COMPLETION REQUIREMENTS (LMS)',
  'Kiểm tra thông tin học sinh và mã đề trước khi làm bài.\nKhông chuyển tab hoặc rời toàn màn hình. Khi cần hỗ trợ, giơ tay báo giám thị.\nKiểm tra lại câu trả lời trước khi nộp bài.':'Check your student information and paper code before starting.\nDo not switch tabs or leave fullscreen. Raise your hand if you need help.\nReview your answers before submitting.',
  'Tài liệu cho phép: Chỉ được sử dụng Sách giáo khoa trong quá trình làm bài.\nYêu cầu đạt: Học sinh cần hoàn thành bài làm đạt từ 6.0 điểm trở lên ít nhất 5 lần.\nSau khi nộp bài, hệ thống sẽ mở hướng dẫn chấm Rubric phần Tự luận để học sinh đối chiếu bài làm.':'Permitted material: Only your textbook may be used while working.\nCompletion requirement: Complete at least five attempts with a score of 6.0 or above.\nAfter submission, the written-response rubric is available for you to compare with your work.',

  'ĐỐI SOÁT BÀI LÀM & XÁC NHẬN ĐIỂM SỐ CHÍNH THỨC':'EXAM REVIEW & OFFICIAL SCORE CONFIRMATION',
  'Em vui lòng kiểm tra kỹ lại toàn bộ bài làm trắc nghiệm và tự luận bên dưới trước khi bấm xác nhận chốt điểm.':'Please review all your multiple choice and written responses below carefully before confirming your score.',
  'ĐÃ CHỐT ĐIỂM THÀNH CÔNG':'SCORE CONFIRMED',
  'ĐANG CHỜ EM XÁC NHẬN':'AWAITING CONFIRMATION',
  'Trắc Nghiệm & Đ/S':'Multiple Choice & T/F',
  'Trắc Nghiệm':'Multiple Choice',
  'Tự Luận (Thầy Chấm)':'Written Response (Teacher)',
  'Tổng Điểm Bài Thi':'Total Exam Score',
  'Số Câu Đúng':'Correct Answers',
  'XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC':'CONFIRM OFFICIAL SCORE',
  'EM ĐÃ XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC':'YOU HAVE CONFIRMED YOUR SCORE',
  'PHẦN I: CHI TIẾT TRẮC NGHIỆM':'PART I: MULTIPLE CHOICE DETAILS',
  'PHẦN II: CHI TIẾT TRẮC NGHIỆM ĐÚNG / SAI':'PART II: TRUE / FALSE DETAILS',
  'PHẦN II: CHI TIẾT PHẦN TỰ LUẬN':'PART II: WRITTEN RESPONSE DETAILS',
  'PHẦN III: CHI TIẾT PHẦN TỰ LUẬN':'PART III: WRITTEN RESPONSE DETAILS',
  'Ký hiệu:':'Legend:',
  'Làm đúng':'Correct',
  'Làm sai':'Incorrect',
  'LÀM ĐÚNG':'CORRECT',
  'LÀM SAI':'INCORRECT',
  'Em chọn ĐÚNG':'Your choice: CORRECT',
  'Em đã chọn (Sai)':'Your choice (Incorrect)',
  'Đáp án đúng':'Correct answer',
  'Bài làm em đã gõ:':'Your written answer:',
  'Học sinh chưa nhập bài làm cho câu hỏi này.':'No answer entered for this question.',
  'Nhận xét:':'Teacher feedback:',
  'Tự luận:':'Written response:',
  'Đang chờ chấm điểm':'Awaiting grading',
  'Gợi Ý Đáp Án & Hướng Dẫn Tự Ôn Tập':'Answer Hints & Study Guide',
  'Kết Quả Đánh Giá Từng Câu Trắc Nghiệm':'Multiple Choice Review',
  'Bạn làm ĐÚNG':'CORRECT',
  'Bạn làm SAI':'INCORRECT',
  'Phương án em đã chọn:':'Your selected option:',
  'Chính xác ✓':'Correct ✓',
  'Chưa chính xác ✕ — Hãy đọc lại lý thuyết để tìm ra phương án đúng':'Incorrect ✕ — Review course materials to find the correct answer',
  'Em chưa chọn đáp án cho câu hỏi này.':'You did not select an answer for this question.',
  'Kết Quả Đánh Giá Phần Đúng / Sai':'True / False Review',
  'Chọn ĐÚNG':'Chose TRUE',
  'Chọn SAI':'Chose FALSE',
  'Các ý yêu cầu trả lời:':'Questions to answer:',
  'Ý':'Part',
  'Đã làm bài':'Answered',
  'Chưa nhập bài làm':'Not answered',

  'Kết quả':'Result',
  'Bài làm':'Review',
  'CHỤP MÀN HÌNH KẾT QUẢ (NỘP LÊN LMS)':'CAPTURE RESULT SCREEN (SUBMIT TO LMS)',
  'Đang tạo ảnh...':'Capturing image...',
  'Làm Lại Bài Ôn Tập':'Restart Practice',
  'Về Trang Đăng Nhập':'Back to Login',
  'Hoàn Tất Bài Thi':'Finish Exam',
  'ĐANG XEM CHI TIẾT BÀI THI & ĐỐI SOÁT CHỐT ĐIỂM':'REVIEWING EXAM & CONFIRMING SCORE',
  'Phòng khảo thí trực tuyến':'Online Examination Center',
  'Thu Gọn':'Collapse',
  'XEM LẠI BÀI LÀM & ĐỐI SOÁT ĐIỂM':'REVIEW EXAM & CHECK SCORE'

};
export function translateStudent(language, key) { return language === 'en' ? EN[key] ?? key : key; }
const StudentLanguageContext = createContext({language:'vi',setLanguage:()=>{},t:key=>key});
export function StudentLanguageProvider({ children }) {
  const [language,setLanguage] = useState(() => { try { return localStorage.getItem('ahs_student_ui_language') === 'en' ? 'en' : 'vi'; } catch { return 'vi'; } });
  useEffect(() => { const previous = document.documentElement.lang; document.documentElement.lang = language; return () => { document.documentElement.lang = previous; }; }, [language]);
  useEffect(() => { try { localStorage.setItem('ahs_student_ui_language',language); } catch { /* lựa chọn chỉ giữ trong phiên khi bộ nhớ bị chặn */ } },[language]);
  return <StudentLanguageContext.Provider value={{language,setLanguage,t:key=>translateStudent(language,key)}}>{children}</StudentLanguageContext.Provider>;
}
export function useStudentLanguage() { return useContext(StudentLanguageContext); }
export function StudentLanguageSwitch() {
  const {language,setLanguage} = useStudentLanguage();
  return <div role="group" aria-label="Ngôn ngữ / Language" className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold">
    {['vi','en'].map(value=><button key={value} type="button" aria-pressed={language===value} onClick={()=>setLanguage(value)} className={`rounded px-2 py-1.5 ${language===value?'bg-blue-700 text-white':'text-slate-600'}`}>{value.toUpperCase()}</button>)}
  </div>;
}
