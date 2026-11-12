import { sanitizeStudentFeedback, getEssayFeedbackForQuestion } from '../../shared/studentFeedback.js';
import React from 'react';
import { isRecoveredAssessment } from '../../shared/recoveredAssessment.js';
import { generatePracticeReviewHtml } from '../../shared/practiceSubmissionHtml.js';
import { useStudent } from '../StudentContext.js';
import { essayPresentation } from '../../shared/essayPresentation.js';
import { useStudentLanguage } from '../StudentLanguage.jsx';
import { questionForLanguage } from '../../shared/questionLanguage.js';

// PHẦN ĐÁNH GIÁ ĐÚNG/SAI & MỞ ĐÁP ÁN TỰ LUẬN CHO HỌC SINH
export default function AnswerReview() {
  const { t, language } = useStudentLanguage();
  const { grade, mode, practiceAnswers, examAnswers, practiceQuestions, practiceTfQuestions,
    practiceEssayQuestions, currentOfficialExam, scoreResult, handleConfirmScore, config, fullName } = useStudent();

  if (isRecoveredAssessment(scoreResult)) {
    const classOpen = config?.classReviewControl?.['8/21'] === true;
    const approved = scoreResult.isGraded === true && typeof scoreResult.teacherApprovedAt === 'string' && Boolean(scoreResult.teacherApprovedAt.trim())
      && Number.isInteger(scoreResult.gradeRevision) && scoreResult.gradeRevision > 0 && scoreResult.aiEssayProposal == null;
    if (!approved || !classOpen) return <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700">Bài đánh giá đang chờ thầy kiểm tra, duyệt và mở quyền xem điểm. Không hiển thị đề xuất AI hoặc bản lưu cũ.</p>;
    const html = generatePracticeReviewHtml(scoreResult, scoreResult.fullName || fullName || 'Học sinh');
    return <div className="space-y-4">
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Bài đánh giá phục hồi riêng lớp 8/21. Giữ nguyên điểm trắc nghiệm đã lưu; thiếu thứ tự phương án gốc nên không suy ra lại đúng/sai.</p>
      <iframe title="Bài đánh giá phục hồi" sandbox="" srcDoc={html} className="w-full rounded-xl border border-slate-200 bg-white" style={{minHeight:'70vh'}} />
      {scoreResult.scoreConfirmed ? <p className="rounded-xl bg-emerald-50 p-4 font-bold text-emerald-800">EM ĐÃ XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC · ĐÃ CHỐT ĐIỂM THÀNH CÔNG</p>
        : approved && classOpen ? <button type="button" onClick={handleConfirmScore} className="w-full rounded-xl bg-[#0267B1] px-5 py-4 font-bold text-white">XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC</button>
          : <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700">{approved ? 'Chờ giáo viên mở xác nhận điểm cho lớp 8/21.' : 'AI chỉ đề xuất điểm. Bài đang chờ thầy kiểm tra và duyệt; chưa thể xác nhận điểm.'}</p>}
    </div>;
  }

  // Gom câu trả lời từ cả examAnswers và scoreResult.answers (đảm bảo không bị mất khi tải lại trang)
  const answers = mode === 'practice'
    ? (practiceAnswers || { mcq: {}, tf: {}, essay: {} })
    : {
        mcq: { ...(scoreResult?.answers?.mcq || {}), ...(examAnswers?.mcq || {}) },
        tf: { ...(scoreResult?.answers?.tf || {}), ...(examAnswers?.tf || {}) },
        essay: { ...(scoreResult?.answers?.essay || {}), ...(examAnswers?.essay || {}) }
      };

  // Nạp kho đề fallback từ bộ nhớ hoặc cache thiết bị nếu currentOfficialExam chưa có
  const activeCode = String(scoreResult?.examCode || currentOfficialExam?.code || '101').trim();
  let cachedExam = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(`asian_school_exam_cache_g${grade}_${activeCode}`)
        || localStorage.getItem(`asian_school_exam_cache_g${grade}_101`);
      if (raw) cachedExam = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }
  const fallbackExam = (typeof window !== 'undefined' && (
    window.AsianSchoolLatestExamBank?.[grade]?.[activeCode]
    || window['EXAM_DATA_G' + grade]?.officialExams?.[activeCode]
    || cachedExam
  )) || null;
  const resolvedExam = currentOfficialExam || fallbackExam;

  // 1. Danh sách câu hỏi Trắc nghiệm chuẩn
  const rawMcq = grade === 10
    ? (resolvedExam?.part1_mcq || resolvedExam?.mcqQuestions || [])
    : (resolvedExam?.mcqQuestions || resolvedExam?.part1_mcq || []);

  const examMcqList = rawMcq.length > 0 ? rawMcq : (
    Object.keys({ ...(scoreResult?.mcqResults || {}), ...(answers.mcq || {}) })
      .map(Number)
      .sort((a, b) => a - b)
      .map(num => ({
        num,
        question: `Câu hỏi trắc nghiệm ${num}`,
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        points: 0.25,
        pointsText: '0.25 điểm'
      }))
  );

  // 2. Danh sách câu hỏi Đúng / Sai chuẩn (Khối 10)
  const rawTf = resolvedExam?.part2_tf || [];
  const examTfList = rawTf.length > 0 ? rawTf : (
    grade === 10 ? (
      Object.keys({ ...(scoreResult?.tfResults || {}), ...(answers.tf || {}) })
        .map(Number)
        .sort((a, b) => a - b)
        .map(num => ({
          num,
          context: `Câu hỏi Đúng / Sai ${num}`,
          points: 1,
          subQuestions: ['a', 'b', 'c', 'd'].map(letter => ({ letter, text: `Nhận định ${letter}` }))
        }))
    ) : []
  );

  // 3. Danh sách câu hỏi Tự luận chuẩn
  const rawEssay = mode === 'practice'
    ? practiceEssayQuestions
    : (resolvedExam?.essayQuestions || resolvedExam?.part3_essay || []);

  const examEssayList = rawEssay.length > 0 ? rawEssay : (
    Object.keys({ ...(scoreResult?.essayScores || {}), ...(answers.essay || {}) })
      .map(Number)
      .sort((a, b) => a - b)
      .map(num => ({
        num,
        question: `Câu hỏi tự luận ${num}`,
        points: grade === 10 ? 0.75 : 1.0,
        pointsText: `${grade === 10 ? '0.75' : '1.0'} điểm`,
        modelAnswer: 'Xem thang điểm và nhận xét chi tiết của Thầy bên dưới.'
      }))
  );

  // Đếm số câu đúng
  const correctCount = scoreResult?.correctMcq !== undefined
    ? scoreResult.correctMcq
    : examMcqList.filter(q => {
        const mcqRes = scoreResult?.mcqResults?.[q.num] || scoreResult?.mcqResults?.[String(q.num)];
        if (mcqRes) return mcqRes.isCorrect;
        const uChoice = answers.mcq?.[q.num] !== undefined ? answers.mcq[q.num] : answers.mcq?.[String(q.num)];
        return q.correctAnswer !== undefined && uChoice === q.correctAnswer;
      }).length;

  return (
    <div className="space-y-6 pt-4">

      {/* KHỐI XÁC NHẬN CHỐT ĐIỂM CHÍNH THỨC */}
      {mode === 'exam' && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200/80 pb-3">
            <div>
              <h3 className="font-black text-sm text-blue-950 uppercase">
                {t('ĐỐI SOÁT BÀI LÀM & XÁC NHẬN ĐIỂM SỐ CHÍNH THỨC')}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {t('Em vui lòng kiểm tra kỹ lại toàn bộ bài làm trắc nghiệm và tự luận bên dưới trước khi bấm xác nhận chốt điểm.')}
              </p>
            </div>
            {scoreResult?.scoreConfirmed ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm flex items-center space-x-1.5">
                <span>{t('ĐÃ CHỐT ĐIỂM THÀNH CÔNG')}</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm flex items-center space-x-1.5">
                <span>{t('ĐANG CHỜ EM XÁC NHẬN')}</span>
              </span>
            )}
          </div>

          {/* BẢNG TỔNG KẾT ĐIỂM SỐ ĐỐI SOÁT */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {t(Number(grade) === 10 ? 'Trắc Nghiệm & Đ/S' : 'Trắc Nghiệm')}
              </span>
              <span className="text-base sm:text-lg font-black text-blue-900">
                {scoreResult?.mcqPoints !== undefined ? scoreResult.mcqPoints : (scoreResult?.score || 0)} {language === 'en' ? 'pts' : 'đ'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{t('Tự Luận (Thầy Chấm)')}</span>
              <span className="text-base sm:text-lg font-black text-indigo-700">
                {scoreResult?.essayTotal !== undefined ? `${scoreResult.essayTotal} ${language === 'en' ? 'pts' : 'đ'}` : (scoreResult?.isGraded ? (language === 'en' ? '0 pts' : '0 đ') : (language === 'en' ? 'Pending' : 'Chờ chấm'))}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{t('Tổng Điểm Bài Thi')}</span>
              <span className="text-base sm:text-lg font-black text-emerald-700">
                {scoreResult?.finalScore !== undefined ? scoreResult.finalScore : scoreResult?.score} / 10 {language === 'en' ? 'pts' : 'đ'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{t('Số Câu Đúng')}</span>
              <span className="text-base sm:text-lg font-black text-amber-700">
                {correctCount} {t('câu')}
              </span>
            </div>
          </div>

          {scoreResult?.scoreConfirmed ? (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 text-xs font-bold flex items-center space-x-3">
              <div>
                <p className="text-sm font-black text-emerald-900">
                  {t('EM ĐÃ XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC')}
                </p>
                <p className="text-[11px] text-emerald-800 font-normal mt-0.5">
                  {language === 'en'
                    ? `Confirmed at: ${new Date(scoreResult.scoreConfirmedAt || Date.now()).toLocaleString('en-US')}. This score is officially recorded in the teacher's gradebook.`
                    : `Thời điểm chốt: ${new Date(scoreResult.scoreConfirmedAt || Date.now()).toLocaleString('vi-VN')}. Điểm số này đã được gửi lưu trữ chính thức vào sổ điểm của Thầy.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-blue-200 shadow-sm">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {language === 'en'
                  ? 'Please review each question (multiple choice and written response) below carefully. If correct, click confirm.'
                  : 'Em vui lòng xem kỹ từng câu hỏi trắc nghiệm (đúng/sai) và phần tự luận được chấm ở dưới. Nếu kết quả chính xác, hãy bấm nút xác nhận chốt điểm.'}
              </p>
              <button
                type="button"
                onClick={handleConfirmScore}
                className="shrink-0 px-6 py-3 bg-[#0267B1] hover:bg-[#025694] active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-700/30 transition flex items-center space-x-2"
              >
                <span>{t('XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHẦN I: DANH SÁCH CÂU HỎI TRẮC NGHIỆM BÀI THI CHÍNH THỨC */}
      {mode === 'exam' && examMcqList.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h3 className="font-black text-base text-slate-900">
              {language === 'en'
                ? `PART I: MULTIPLE CHOICE DETAILS (${examMcqList.length} questions • Paper: ${scoreResult?.examCode || currentOfficialExam?.code || '101'})`
                : `PHẦN I: CHI TIẾT TRẮC NGHIỆM (${examMcqList.length} câu • Mã Đề: ${scoreResult?.examCode || currentOfficialExam?.code || '101'})`}
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {t('Ký hiệu:')} <span className="text-emerald-700 font-bold">{t('Làm đúng')}</span> • <span className="text-rose-700 font-bold">{t('Làm sai')}</span>
            </span>
          </div>

          {examMcqList.map((rawQ, idx) => {
            const q = questionForLanguage(rawQ, language);
            const userChoice = answers.mcq?.[rawQ.num] !== undefined
              ? answers.mcq[rawQ.num]
              : (answers.mcq?.[String(rawQ.num)] !== undefined ? answers.mcq[String(rawQ.num)] : scoreResult?.mcqResults?.[rawQ.num]?.userChoice);
            const isAnswered = userChoice !== undefined && userChoice !== null;
            const letters = ['A', 'B', 'C', 'D'];
            const userLetter = isAnswered ? letters[userChoice] : null;
            const mcqRes = scoreResult?.mcqResults?.[rawQ.num] || scoreResult?.mcqResults?.[String(rawQ.num)];
            const hasKey = rawQ.correctAnswer !== undefined || mcqRes !== undefined;
            const correctAnsIdx = mcqRes?.correctAnswer !== undefined ? mcqRes.correctAnswer : rawQ.correctAnswer;
            const isCorrect = mcqRes ? mcqRes.isCorrect : (hasKey && isAnswered && userChoice === correctAnsIdx);
            const ptsEarned = isCorrect ? (mcqRes?.pointsEarned || rawQ.points || 0.25) : 0;

            return (
              <div
                key={rawQ.num || idx}
                className={`p-5 rounded-2xl border-2 shadow-sm space-y-3 transition ${
                  hasKey
                    ? (isCorrect
                        ? 'bg-emerald-50/20 border-emerald-300 text-slate-900 ring-1 ring-emerald-400/20'
                        : 'bg-rose-50/20 border-rose-300 text-slate-900 ring-1 ring-rose-400/20')
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-600 uppercase flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono-code font-bold">
                      {language === 'en' ? `Question ${rawQ.num || (idx + 1)}` : `Câu ${rawQ.num || (idx + 1)}`}
                    </span>
                    {rawQ.pointsText && <span className="text-slate-400 font-normal">({language === 'en' ? `${ptsEarned || 0.25} pts` : rawQ.pointsText})</span>}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                      !isAnswered
                        ? 'bg-slate-200 text-slate-700'
                        : hasKey
                          ? (isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1')
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {!isAnswered
                      ? (language === 'en' ? '— Unanswered (0 pts)' : '— Chưa làm (0đ)')
                      : hasKey
                        ? (isCorrect
                            ? (language === 'en' ? `CORRECT (+${ptsEarned} pts)` : `LÀM ĐÚNG (+${ptsEarned}đ)`)
                            : (language === 'en' ? `INCORRECT (0 pts) • You chose ${userLetter}` : `LÀM SAI (0đ) • Em chọn ${userLetter}`))
                        : (language === 'en' ? `Selected: ${userLetter}` : `Đã chọn: ${userLetter}`)}
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">{q.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {(q.options || []).map((optText, optIdx) => {
                    const letter = letters[optIdx];
                    const isUserSelected = isAnswered && userChoice === optIdx;
                    const isCorrectOption = hasKey && correctAnsIdx === optIdx;

                    let optStyle = 'bg-white border-slate-200 text-slate-800';
                    let badgeText = null;
                    let badgeStyle = '';

                    if (isUserSelected && isCorrectOption) {
                      optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/30';
                      badgeText = language === 'en' ? 'Your choice: CORRECT' : 'Em chọn ĐÚNG';
                      badgeStyle = 'text-emerald-800 bg-emerald-100 border-emerald-300';
                    } else if (isUserSelected && !isCorrectOption) {
                      optStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-500/20';
                      badgeText = language === 'en' ? 'Your choice (Incorrect)' : 'Em đã chọn (Sai)';
                      badgeStyle = 'text-rose-800 bg-rose-100 border-rose-300';
                    } else if (!isUserSelected && isCorrectOption) {
                      optStyle = 'bg-emerald-50/70 border-emerald-400 text-emerald-900 font-bold border-dashed';
                      badgeText = language === 'en' ? 'Correct answer' : 'Đáp án đúng';
                      badgeStyle = 'text-emerald-800 bg-emerald-100 border-emerald-300';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border-2 flex items-start space-x-2.5 text-xs sm:text-sm transition ${optStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border mt-0.5 ${
                          isUserSelected
                            ? (isCorrectOption ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600')
                            : (isCorrectOption ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-700 border-slate-300')
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1 leading-relaxed">{optText}</span>
                        {badgeText && (
                          <span className={`shrink-0 text-[11px] font-black px-2 py-0.5 rounded border shadow-sm ${badgeStyle}`}>
                            {badgeText}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHẦN II: DANH SÁCH CÂU HỎI ĐÚNG / SAI (KHỐI 10 BÀI THI CHÍNH THỨC) */}
      {mode === 'exam' && grade === 10 && examTfList.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-black text-base text-slate-900">
              {language === 'en' ? `PART II: TRUE / FALSE DETAILS (${examTfList.length} questions)` : `PHẦN II: CHI TIẾT TRẮC NGHIỆM ĐÚNG / SAI (${examTfList.length} câu)`}
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {language === 'en' ? 'Each correct statement: +0.25 pts • Max 1.0 pt/question' : 'Mỗi ý đúng: +0.25đ • Tối đa 1.0đ/câu'}
            </span>
          </div>

          {examTfList.map((rawTf) => {
            const tf = questionForLanguage(rawTf, language);
            return (
              <div key={rawTf.num} className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
                <span className="font-black text-xs text-purple-800 uppercase">
                  {language === 'en' ? `Question ${rawTf.num} (True / False)` : `Câu ${rawTf.num} (Đúng / Sai)`}
                </span>
                <p className="font-bold text-slate-900 text-sm whitespace-pre-line">
                  {tf.context}
                </p>

                <div className="space-y-2 pt-1">
                  {(tf.subQuestions || []).map(sub => {
                    const userVal = answers.tf?.[rawTf.num]?.[sub.letter] ?? answers.tf?.[String(rawTf.num)]?.[sub.letter] ?? scoreResult?.tfResults?.[rawTf.num]?.subResults?.[sub.letter]?.userChoice;
                    const isAns = userVal !== undefined && userVal !== null;
                    const tfRes = scoreResult?.tfResults?.[rawTf.num]?.subResults?.[sub.letter] || scoreResult?.tfResults?.[String(rawTf.num)]?.subResults?.[sub.letter];
                    const hasSubKey = sub.correctAnswer !== undefined || tfRes !== undefined;
                    const correctSubVal = tfRes?.correctAnswer !== undefined ? tfRes.correctAnswer : sub.correctAnswer;
                    const isSubCorrect = tfRes ? tfRes.isCorrect : (hasSubKey && userVal === correctSubVal);

                    return (
                      <div
                        key={sub.letter}
                        className={`p-3.5 rounded-xl border-2 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                          !isAns
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : hasSubKey
                              ? (isSubCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-rose-50 border-rose-300 text-rose-950 font-bold')
                              : 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                        }`}
                      >
                        <span className="leading-relaxed"><strong>{sub.letter})</strong> {sub.text}</span>
                        <div className="shrink-0 flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded text-xs font-black ${
                            !isAns
                              ? 'bg-slate-200 text-slate-700'
                              : hasSubKey
                                ? (isSubCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')
                                : 'bg-blue-600 text-white'
                          }`}>
                            {isAns
                              ? (userVal ? (language === 'en' ? 'You chose: TRUE' : 'Em chọn: ĐÚNG') : (language === 'en' ? 'You chose: FALSE' : 'Em chọn: SAI'))
                              : (language === 'en' ? 'Unanswered' : 'Chưa làm')}
                          </span>
                          {isAns && hasSubKey && (
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                              isSubCorrect ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                            }`}>
                              {isSubCorrect
                                ? (language === 'en' ? 'Correct (+0.25 pts)' : 'Đúng (+0.25đ)')
                                : (language === 'en' ? `Incorrect (Answer: ${correctSubVal ? 'TRUE' : 'FALSE'})` : `Sai (Đáp án: ${correctSubVal ? 'ĐÚNG' : 'SAI'})`)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHẦN LUYỆN TẬP ĐỀ CƯƠNG (PRACTICE MODE) */}
      {mode === 'practice' && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 font-semibold space-y-1">
          <p>
            {language === 'en' ? (
              <><strong>Pedagogical note:</strong> For multiple choice, the system only indicates whether each question is <strong>CORRECT</strong> or <strong>INCORRECT</strong> so you can review course materials.</>
            ) : (
              <><strong>Ghi chú sư phạm:</strong> Đối với phần trắc nghiệm, hệ thống chỉ thông báo câu nào em làm <strong>ĐÚNG</strong> hoặc <strong>SAI</strong> để em tự tra cứu lại tài liệu.</>
            )}
          </p>
          <p>
            {language === 'en' ? (
              <>For the <strong>Written Response</strong> section, the full <strong>Study Guide & Rubric</strong> is provided below for your reference!</>
            ) : (
              <>Đối với <strong>Phần Tự Luận</strong>, hệ thống đã mở toàn bộ <strong>Hướng dẫn trả lời & Thang điểm chấm (Rubric LMS)</strong> ở phía dưới để em đối chiếu!</>
            )}
          </p>
        </div>
      )}

      {/* 1. Đánh giá Trắc nghiệm (Practice) */}
      {mode === 'practice' && (
        <div className="space-y-4">
          <h3 className="font-black text-base text-slate-900">
            {t('Kết Quả Đánh Giá Từng Câu Trắc Nghiệm')}
          </h3>

          {practiceQuestions.map((rawQ, idx) => {
            const q = questionForLanguage(rawQ, language);
            const userChoice = practiceAnswers.mcq[rawQ.id];
            const isAnswered = userChoice !== undefined;
            const isCorrect = userChoice === rawQ.correctAnswer;
            const userLetter = isAnswered ? ['A', 'B', 'C', 'D'][userChoice] : null;

            return (
              <div
                key={rawQ.id}
                className={`p-5 rounded-2xl border-2 shadow-sm space-y-2.5 transition ${
                  !isAnswered
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : (isCorrect ? 'bg-emerald-50 border-emerald-400 text-slate-900' : 'bg-rose-50 border-rose-400 text-slate-900')
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-600 uppercase">
                    {language === 'en' ? `Question ${idx + 1}` : `Câu ${idx + 1}`}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      !isAnswered
                        ? 'bg-slate-200 text-slate-700'
                        : (isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')
                    }`}
                  >
                    {!isAnswered ? (language === 'en' ? '— Unanswered' : '— Chưa làm') : (isCorrect ? (language === 'en' ? 'You are CORRECT' : 'Bạn làm ĐÚNG') : (language === 'en' ? 'You are INCORRECT' : 'Bạn làm SAI'))}
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">{q.question}</p>

                {/* Hiển thị đầy đủ 4 phương án A, B, C, D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {(q.options || []).map((optText, optIdx) => {
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
                            {language === 'en' ? 'Your choice' : 'Em đã chọn'}
                          </span>
                        );
                      } else {
                        cardClass = "bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-sm ring-1 ring-rose-500/30";
                        badgeClass = "bg-rose-600 text-white border-rose-600";
                        tagBadge = (
                          <span className="shrink-0 text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                            {language === 'en' ? 'Your choice' : 'Em đã chọn'}
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
                      {language === 'en'
                        ? <>Your selected option: <strong>{userLetter}. {q.options[userChoice]}</strong> {isCorrect ? '(Correct ✓)' : '(Incorrect ✕ — Review course materials to find the correct answer)'}</>
                        : <>Phương án em đã chọn: <strong>{userLetter}. {q.options[userChoice]}</strong> {isCorrect ? '(Chính xác ✓)' : '(Chưa chính xác ✕ — Hãy đọc lại lý thuyết để tìm ra phương án đúng)'}</>}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic font-medium">{t('Em chưa chọn đáp án cho câu hỏi này.')}</p>
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
          <h3 className="font-black text-base text-slate-900">
            {t('Kết Quả Đánh Giá Phần Đúng / Sai')}
          </h3>

          {practiceTfQuestions.map((rawTf) => {
            const tf = questionForLanguage(rawTf, language);
            return (
              <div key={rawTf.num} className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
                <span className="font-black text-xs text-purple-800 uppercase">
                  {language === 'en' ? `Question ${rawTf.num} (True / False)` : `Câu ${rawTf.num} (Đúng / Sai)`}
                </span>
                <p className="font-bold text-slate-900 text-sm whitespace-pre-line">
                  {tf.context}
                </p>

                <div className="space-y-2 pt-1">
                  {(tf.subQuestions || []).map(sub => {
                    const userVal = practiceAnswers.tf[rawTf.num]?.[sub.letter];
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
                          {isAns ? (userVal ? (language === 'en' ? 'Chose TRUE' : 'Chọn ĐÚNG') : (language === 'en' ? 'Chose FALSE' : 'Chọn SAI')) : (language === 'en' ? 'Unanswered' : 'Chưa làm')}
                          {isAns && (isSubCorrect ? ' (✓)' : ' (✕)')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHẦN TỰ LUẬN: BÀI LÀM, ĐIỂM SỐ VÀ NHẬN XÉT CỦA GIÁO VIÊN */}
      {examEssayList.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h3 className="font-black text-base text-slate-900">
              {language === 'en'
                ? `${examTfList.length > 0 ? 'PART III' : 'PART II'}: WRITTEN RESPONSE DETAILS (${examEssayList.length} questions)`
                : `${examTfList.length > 0 ? 'PHẦN III' : 'PHẦN II'}: CHI TIẾT PHẦN TỰ LUẬN (${examEssayList.length} câu)`}
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
              {language === 'en'
                ? (Number(grade) === 10 ? 'Scale: 2.25 pts (0.75 pts / question)' : 'Scale: 3.0 pts (1.0 pt / question)')
                : (Number(grade) === 10 ? 'Thang điểm: 2,25 điểm (0,75đ / câu)' : 'Thang điểm: 3,0 điểm (1,0đ / câu)')}
            </span>
          </div>

          {examEssayList.map((rawEq) => {
            const eq = questionForLanguage(rawEq, language);
            const { stem, subItems } = essayPresentation(eq);
            const studentAnswer = (mode === 'practice'
              ? practiceAnswers?.essay?.[rawEq.num]
              : (answers.essay?.[rawEq.num] ?? answers.essay?.[String(rawEq.num)] ?? '')) || '';
            const essayScore = scoreResult?.essayScores?.[rawEq.num] ?? scoreResult?.essayScores?.[String(rawEq.num)];
            const maxPoints = Math.round((Number(rawEq.points) || parseFloat(String(rawEq.pointsText || '').replace(/[^\d.,]/g, '').replace(',', '.')) || (Number(grade) === 10 ? 0.75 : 1.0)) * 100) / 100;
            const pointsLabel = rawEq.pointsText || `${maxPoints.toString().replace('.', ',')} điểm`;
            const questionFeedback = getEssayFeedbackForQuestion(scoreResult?.teacherFeedback, rawEq.num);
            const isGraded = scoreResult?.isGraded || essayScore !== undefined;
            const hasDeduction = isGraded && Number(essayScore) < maxPoints;
            const feedbackText = questionFeedback || (hasDeduction ? (sanitizeStudentFeedback(scoreResult?.teacherFeedback) || '') : '');

            return (
              <div key={rawEq.num} className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-black text-sm text-indigo-900 uppercase">
                    {language === 'en'
                      ? `Question ${rawEq.num} (Written response) — ${isGraded ? `${essayScore !== undefined ? essayScore : 0} / ${maxPoints} pts` : `${maxPoints} pts`}`
                      : `Câu ${rawEq.num} (Tự luận) — ${isGraded ? `${essayScore !== undefined ? essayScore : 0} / ${maxPoints} điểm` : pointsLabel}`}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {studentAnswer.trim() ? t('Đã làm bài') : t('Chưa nhập bài làm')}
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {stem}
                </p>

                {subItems.length > 0 && (
                  <div className="space-y-2 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 text-xs sm:text-sm">
                    <span className="font-bold text-indigo-900 text-xs block uppercase">
                      {t('Các ý yêu cầu trả lời:')}
                    </span>
                    {subItems.map(item => (
                      <div key={item.letter} className="flex items-start space-x-2 text-slate-800 font-semibold">
                        <span className="font-black text-indigo-700 shrink-0">{t('Ý')} {item.letter})</span>
                        <span className="leading-relaxed">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bài làm của học sinh */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    {t('Bài làm em đã gõ:')}
                  </span>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-slate-900 text-sm leading-relaxed whitespace-pre-line">
                    {studentAnswer.trim() ? studentAnswer : <em className="text-slate-400">{t('Học sinh chưa nhập bài làm cho câu hỏi này.')}</em>}
                  </div>
                </div>

                {/* NHẬN XÉT: CHỈ HIỂN THỊ KHI CÓ TRỪ ĐIỂM (PHẦN NÀO ĐÚNG THÌ KHÔNG NHẬN XÉT) */}
                {mode === 'exam' && (
                  isGraded ? (
                    hasDeduction && feedbackText ? (
                      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2">
                        <span className="text-xs font-bold text-indigo-900 uppercase block tracking-wider">
                          {t('Nhận xét:')}
                        </span>
                        <div className="bg-white/95 border border-indigo-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                          {feedbackText}
                        </div>
                      </div>
                    ) : null
                  ) : (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-950">
                      <span>{t('Tự luận:')}</span>
                      <span className="text-xs font-bold text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300">
                        {t('Đang chờ chấm điểm')}
                      </span>
                    </div>
                  )
                )}

                {/* GỢI Ý ĐÁP ÁN (CHỈ DÀNH CHO ÔN TẬP TỰ LUYỆN) */}
                {mode === 'practice' && (
                  <details className="group bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-3.5 text-xs">
                    <summary className="cursor-pointer font-black text-blue-900 uppercase tracking-wide flex items-center justify-between">
                      <span>{t('Gợi Ý Đáp Án & Hướng Dẫn Tự Ôn Tập')}</span>
                      <span className="text-[11px] text-blue-600 font-semibold group-open:hidden">{language === 'en' ? 'Click to view hints ▾' : 'Nhấn để xem gợi ý ▾'}</span>
                    </summary>
                    <p className="mt-2.5 text-xs sm:text-sm text-blue-950 font-medium leading-relaxed whitespace-pre-line border-t border-blue-100 pt-2">
                      {eq.modelAnswer || (language === 'en' ? 'Detailed answer guide is being updated by the teacher.' : 'Đang cập nhật hướng dẫn trả lời chi tiết từ giáo viên.')}
                    </p>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}