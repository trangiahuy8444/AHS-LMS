import React from 'react';
import { useStudent } from '../StudentContext.js';

// PHẦN ĐÁNH GIÁ ĐÚNG/SAI & MỞ ĐÁP ÁN TỰ LUẬN CHO HỌC SINH
export default function AnswerReview() {
  const { grade, mode, practiceAnswers, examAnswers, practiceQuestions, practiceTfQuestions,
    practiceEssayQuestions, currentOfficialExam } = useStudent();

  return (
    <div className="space-y-6 pt-4">
    
      {mode === 'practice' && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 font-semibold space-y-1">
          <p>💡 <strong>Ghi chú sư phạm:</strong> Đối với phần trắc nghiệm, hệ thống chỉ thông báo câu nào em làm <strong>ĐÚNG</strong> hoặc <strong>SAI</strong> để em tự tra cứu lại tài liệu.</p>
          <p>📝 Đối với <strong>Phần Tự Luận</strong>, hệ thống đã mở toàn bộ <strong>Hướng dẫn trả lời & Thang điểm chấm (Rubric LMS)</strong> ở phía dưới để em đối chiếu!</p>
        </div>
      )}

      {/* 1. Đánh giá Trắc nghiệm (Practice) */}
      {mode === 'practice' && (
        <div className="space-y-4">
          <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
            <span>📝</span>
            <span>Kết Quả Đánh Giá Từng Câu Trắc Nghiệm</span>
          </h3>

          {practiceQuestions.map((q, idx) => {
            const userChoice = practiceAnswers.mcq[q.id];
            const isAnswered = userChoice !== undefined;
            const isCorrect = userChoice === q.correctAnswer;
            const userLetter = isAnswered ? ['A', 'B', 'C', 'D'][userChoice] : null;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border-2 shadow-sm space-y-2.5 transition ${
                  !isAnswered
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : (isCorrect ? 'bg-emerald-50 border-emerald-400 text-slate-900' : 'bg-rose-50 border-rose-400 text-slate-900')
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-600 uppercase">
                    Câu {idx + 1}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      !isAnswered
                        ? 'bg-slate-200 text-slate-700'
                        : (isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')
                    }`}
                  >
                    {!isAnswered ? '— Chưa làm' : (isCorrect ? '✓ Bạn làm ĐÚNG' : '✕ Bạn làm SAI')}
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">{q.question}</p>

                {/* Hiển thị đầy đủ 4 phương án A, B, C, D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {q.options.map((optText, optIdx) => {
                    const letter = ['A', 'B', 'C', 'D'][optIdx];
                    const isUserSelected = userChoice === optIdx;

                    let cardClass = "bg-white border-slate-200 text-slate-800";
                    let badgeClass = "bg-slate-100 text-slate-700 border-slate-300";
                    let tagBadge = null;

                    if (isUserSelected) {
                      if (isCorrect) {
                        cardClass = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-500/30";
                        badgeClass = "bg-emerald-600 text-white border-emerald-600";
                        tagBadge = (
                          <span className="shrink-0 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            ✓ Em đã chọn
                          </span>
                        );
                      } else {
                        cardClass = "bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-sm ring-1 ring-rose-500/30";
                        badgeClass = "bg-rose-600 text-white border-rose-600";
                        tagBadge = (
                          <span className="shrink-0 text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                            ✕ Em đã chọn
                          </span>
                        );
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border-2 flex items-start space-x-2.5 text-xs sm:text-sm transition ${cardClass}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border mt-0.5 ${badgeClass}`}>
                          {letter}
                        </span>
                        <span className="flex-1 leading-snug">{optText}</span>
                        {tagBadge}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-xs">
                  {isAnswered ? (
                    <p className={`font-semibold ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                      Phương án em đã chọn: <strong>{userLetter}. {q.options[userChoice]}</strong> {isCorrect ? '(Chính xác ✓)' : '(Chưa chính xác ✕ — Hãy đọc lại lý thuyết để tìm ra phương án đúng)'}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic font-medium">Em chưa chọn đáp án cho câu hỏi này.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Đánh giá Đúng/Sai (Khối 10 Practice) */}
      {mode === 'practice' && grade === 10 && practiceTfQuestions.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
            <span>⚖️</span>
            <span>Kết Quả Đánh Giá Phần Đúng / Sai</span>
          </h3>

          {practiceTfQuestions.map((tf) => (
            <div key={tf.num} className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <span className="font-black text-xs text-purple-800 uppercase">
                Câu {tf.num} (Đúng / Sai)
              </span>
              <p className="font-bold text-slate-900 text-sm whitespace-pre-line">
                {tf.context}
              </p>

              <div className="space-y-2 pt-1">
                {tf.subQuestions.map(sub => {
                  const userVal = practiceAnswers.tf[tf.num]?.[sub.letter];
                  const isAns = userVal !== undefined;
                  const isSubCorrect = userVal === sub.correctAnswer;
                  return (
                    <div
                      key={sub.letter}
                      className={`p-3 rounded-xl border-2 text-xs flex items-center justify-between ${
                        !isAns
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : (isSubCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-rose-50 border-rose-300 text-rose-950 font-bold')
                      }`}
                    >
                      <span><strong>{sub.letter})</strong> {sub.text}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        !isAns ? 'bg-slate-200 text-slate-700' : (isSubCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')
                      }`}>
                        {isAns ? (userVal ? 'Chọn ĐÚNG' : 'Chọn SAI') : 'Chưa làm'}
                        {isAns && (isSubCorrect ? ' (✓ ĐÚNG)' : ' (✕ SAI)')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. MỞ ĐÁP ÁN PHẦN TỰ LUẬN CHO HỌC SINH (RUBRIC LMS) */}
      {((mode === 'practice' ? practiceEssayQuestions : (currentOfficialExam?.essayQuestions || currentOfficialExam?.part3_essay || []))).length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
              <span>📖</span>
              <span>HƯỚNG DẪN TRẢ LỜI & ĐÁP ÁN MẪU PHẦN TỰ LUẬN</span>
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
              Thang điểm Rubric LMS
            </span>
          </div>

          {((mode === 'practice' ? practiceEssayQuestions : (currentOfficialExam?.essayQuestions || currentOfficialExam?.part3_essay || []))).map((eq) => {
            const studentAnswer = (mode === 'practice' ? practiceAnswers.essay[eq.num] : examAnswers.essay[eq.num]) || '';

            return (
              <div key={eq.num} className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-black text-sm text-indigo-900 uppercase">
                    Câu {eq.num} (Tự luận) {eq.pointsText && `— ${eq.pointsText}`}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {studentAnswer.trim() ? '✓ Đã làm bài' : 'Chưa nhập bài làm'}
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {eq.context || eq.question}
                </p>

                {eq.subItems && eq.subItems.length > 0 && (
                  <div className="space-y-2 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 text-xs sm:text-sm">
                    <span className="font-bold text-indigo-900 text-xs block uppercase">
                      Các ý yêu cầu trả lời:
                    </span>
                    {eq.subItems.map(item => (
                      <div key={item.letter} className="flex items-start space-x-2 text-slate-800 font-semibold">
                        <span className="font-black text-indigo-700 shrink-0">Ý {item.letter})</span>
                        <span className="leading-relaxed">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bài làm của học sinh */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Bài làm em đã gõ:
                  </span>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-slate-900 text-sm leading-relaxed whitespace-pre-line">
                    {studentAnswer.trim() ? studentAnswer : <em className="text-slate-400">Học sinh chưa nhập bài làm cho câu hỏi này.</em>}
                  </div>
                </div>

                {/* ĐÁP ÁN MẪU & RUBRIC CHẤM */}
                <div className="bg-blue-50/80 border-2 border-blue-300 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-900 font-black text-xs uppercase tracking-wide">
                    <span>💡</span>
                    <span>Hướng Dẫn Chấm Điểm & Gợi Ý Đáp Án Chuẩn:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-950 font-semibold leading-relaxed whitespace-pre-line pl-6">
                    {eq.modelAnswer || 'Đang cập nhật hướng dẫn trả lời chi tiết từ giáo viên.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
