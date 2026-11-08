import React from 'react';

export default function LocalSandboxTab() {
  const isLocal = window.AsianSchoolRuntime?.mode === 'local-sandbox';
  const teacherUrl = isLocal ? 'http://localhost:5188/AHS-LMS/admin/' : 'https://ahs-lms-sandbox.web.app/admin/';
  const studentUrl = isLocal ? 'http://127.0.0.1:5188/AHS-LMS/test/' : 'https://ahs-lms-sandbox.firebaseapp.com/test/';
  return (
    <section className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-8 space-y-5 text-slate-900">
      <h2 className="text-xl font-bold text-blue-900">{isLocal ? 'Thử nghiệm trên máy giáo viên' : 'Hệ thống thử trên web'}</h2>
      <p>Thử làm bài, giám sát, khóa/mở, cộng giờ, thu bài và chấm điểm bằng dữ liệu giả. Học sinh trên hệ thống thật vẫn ôn tập bình thường.</p>
      <ol className="list-decimal pl-6 space-y-2">
        {isLocal && <li>Mở tệp <strong>MO_HE_THONG_THU.command</strong> trong thư mục dự án trên máy này, giữ cửa sổ chạy mở.</li>}
        <li>{isLocal ? 'Mở cổng giáo viên thử, chọn “Vào vai giáo viên thử”.' : 'Mở cổng giáo viên thử và đăng nhập bằng tài khoản thử admin / admin trên hệ thống thử.'}</li>
        <li>{isLocal ? 'Mở cổng học sinh thử ở cửa sổ khác trên máy này; chọn học sinh và mã giả. Mật khẩu phòng thử: sandbox-local.' : 'Mở cổng học sinh thử ở cửa sổ khác hoặc máy khác; đăng nhập tài khoản dùng chung admin / admin rồi chọn học sinh và mã giả. Giáo viên xem hoặc đặt mật khẩu phòng thử trong Cấu hình của hệ thống thử.'}</li>
      </ol>
      <div className="flex flex-wrap gap-3">
        <a href={teacherUrl} target="_blank" rel="noreferrer" className="px-5 py-3 bg-blue-700 text-white rounded-xl font-bold focus:ring-4 focus:ring-blue-200">Mở giáo viên thử</a>
        <a href={studentUrl} target="_blank" rel="noreferrer" className="px-5 py-3 bg-white border-2 border-blue-700 text-blue-800 rounded-xl font-bold focus:ring-4 focus:ring-blue-200">Mở học sinh thử</a>
      </div>
      <p className="text-sm text-slate-600">{isLocal ? 'Giữ hai địa chỉ khác nhau để tách vai giáo viên và học sinh. Dừng bằng Ctrl+C; dữ liệu thử được lưu riêng cho lần sau.' : 'Hai cổng dùng địa chỉ khác nhau để tách phiên giáo viên và học sinh. Dữ liệu thử được đồng bộ giữa các máy, không cần mở máy giáo viên để duy trì hệ thống.'}</p>
      <p className="bg-blue-50 border-l-4 border-blue-600 p-4">AI và đồng bộ Google Sheets cũ dùng phản hồi mô phỏng, có ghi nhãn rõ. Bộ lưu trữ Drive tự động, nếu đã cài, lưu dữ liệu thật của lần thử vào kho thử riêng; xem trạng thái trong Cấu hình. Nhật ký gửi bảng điểm chỉ lưu trên thiết bị này và có thể tải xuống trên trang thử. Không dùng môi trường này để kết luận chất lượng chấm AI hoặc kết nối Google thật.</p>
    </section>
  );
}
