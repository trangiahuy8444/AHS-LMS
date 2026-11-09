import React from 'react';
import { useStudent } from '../StudentContext.js';
import StudentIdentity from '../components/StudentIdentity.jsx';
import { sanitizeStudentFeedback } from '../../shared/studentFeedback.js';

export default function ResultCard() {
  const {grade,mode,scoreResult:result}=useStudent();
  const practice=mode==='practice';
  const max=result.maxScore ?? (grade===10?7.75:7);
  const feedback=sanitizeStudentFeedback(result.teacherFeedback);
  return (
    <section id="result-capture-card" className="result-card bg-white border border-slate-200 rounded-2xl text-slate-900">
      <header className="result-card-heading">
        <img src={window.ASIAN_SCHOOL_LOGO_BASE64 || '../assets/logo_asian_school.png'} alt="Logo Asian School" />
        <div><h3>TRƯỜNG QUỐC TẾ Á CHÂU</h3><p>BỘ MÔN TIN HỌC · XÁC NHẬN KẾT QUẢ</p></div>
        <span>{practice?'ÔN TẬP':'THI GIỮA HK1'}</span>
      </header>
      <StudentIdentity extraLabel={practice?'Lượt làm':'Mã đề'} extraValue={practice?result.attemptNumber||1:result.examCode||'—'}/>
      <div className="result-card-score">
        {!practice && <h2>ĐÃ NỘP BÀI THÀNH CÔNG</h2>}
        <p className="result-score-label">{practice?'ĐIỂM ĐẠT ĐƯỢC':result.isGraded?'ĐIỂM CHÍNH THỨC':'ĐIỂM TRẮC NGHIỆM'}</p>
        {practice || result.isGraded || result.mcqPoints!=null ? (
          <div className="result-score-value">
            {practice?result.score:result.isGraded?(result.finalScore ?? result.score ?? '—'):result.mcqPoints}
            <span> / {result.isGraded&&!practice?10:max} đ</span>
          </div>
        ) : <p className="text-sm text-slate-600">{result.receiptDetailsUnavailable?'Chưa tải được điểm':'Đang chấm trắc nghiệm'}</p>}
        {!practice&&result.isGraded&&<p className="text-xs">Trắc nghiệm: {result.mcqPoints ?? '—'} đ · Tự luận: {result.essayTotal ?? '—'} đ</p>}
        {!practice&&!result.isGraded&&result.mcqPoints!=null&&<p className="text-xs text-slate-600">Chưa bao gồm điểm tự luận.</p>}
        {result.scoreConfirmed&&<p className="text-xs font-bold text-emerald-700">ĐÃ XÁC NHẬN CHỐT ĐIỂM</p>}
      </div>
      <dl className="result-card-facts">
        <div><dt>Thời gian làm bài</dt><dd>{result.durationFormatted || 'Chưa có thông tin'}</dd></div>
        <div><dt>Nộp lúc</dt><dd>{result.submittedAt?new Date(result.submittedAt).toLocaleTimeString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'Chưa có thông tin'}</dd></div>
        <div><dt>Số lần vi phạm</dt><dd>{result.violations || 0} lần</dd></div>
        <div><dt>Trắc nghiệm đúng</dt><dd>{practice?`${result.correctCount ?? 0} / ${result.totalQuestions ?? 0} câu`:`${result.correctMcq ?? '—'} câu`}</dd></div>
      </dl>
      {practice&&<p className="result-status-line">SỐ LẦN ĐÃ LÀM: LẦN THỨ {result.attemptNumber||1} · Tự luận không tính điểm</p>}
      {result.violations>=3&&<p className="result-violation-line">Vi phạm 3 lần: bài đã bị khóa, giám thị ghi nhận và xử lý theo quy chế</p>}
      {!practice&&!result.isGraded&&<p className="result-status-line">{result.receiptDetailsUnavailable?'LƯỢT THI ĐÃ ĐƯỢC XÁC NHẬN NỘP · Chưa tải được chi tiết điểm; em báo giáo viên kiểm tra.':'ĐANG CHỜ GIÁO VIÊN CHẤM TỰ LUẬN'}</p>}
      {!practice&&result.isGraded&&feedback&&<section className="result-feedback"><h4>NHẬN XÉT</h4><p>{feedback}</p></section>}
      <footer>Hệ thống kiểm tra trực tuyến Tin học Asian School · Giáo viên: Thầy Trần Gia Huy</footer>
    </section>
  );
}
