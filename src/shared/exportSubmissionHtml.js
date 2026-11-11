import { getStudentsByClass, verifyStudentLms } from '../core/roster-data.js';
import { getEssayQuestionsForSubmission } from '../core/gemini-grading-service.js';
import { sanitizeStudentFeedback, getEssayFeedbackForQuestion } from './studentFeedback.js';
import { essayPresentation } from './essayPresentation.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCanonicalStudentName(sub) {
  if (!sub) return 'Học sinh';
  if (sub.studentClass) {
    const roster = getStudentsByClass(sub.studentClass);
    if (roster && roster.length > 0) {
      const matched = roster.find(
        st => verifyStudentLms(st, sub.studentId) || String(st.studentId).trim() === String(sub.studentId).trim()
      );
      if (matched && matched.fullName) {
        return matched.fullName;
      }
    }
  }
  return sub.fullName || sub.studentName || 'Học sinh';
}

function formatDateTimeVi(val) {
  if (!val) return '';
  try {
    const d = typeof val?.toDate === 'function'
      ? val.toDate()
      : (typeof val?.seconds === 'number' ? new Date(val.seconds * 1000) : new Date(val));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  } catch {
    return '';
  }
}

function formatTimeVi(val) {
  if (!val) return 'Chưa có thông tin';
  try {
    const d = typeof val?.toDate === 'function'
      ? val.toDate()
      : (typeof val?.seconds === 'number' ? new Date(val.seconds * 1000) : new Date(val));
    if (isNaN(d.getTime())) return 'Chưa có thông tin';
    return d.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  } catch {
    return 'Chưa có thông tin';
  }
}

export async function resolveFullExamForSubmission(sub) {
  if (!sub) return null;
  const subGrade = Number(sub.grade || (sub.studentClass ? String(sub.studentClass).split('/')[0] : 8)) || 8;
  const subCode = String(sub.examCode || '101').trim();

  if (typeof window !== 'undefined') {
    const memExam = window.AsianSchoolLatestExamBank?.[subGrade]?.[subCode]
      || window['EXAM_DATA_G' + subGrade]?.officialExams?.[subCode]
      || window.AsianSchoolLatestExamBank?.[subGrade]?.['101']
      || window['EXAM_DATA_G' + subGrade]?.officialExams?.['101']
      || null;
    if (memExam) return memExam;

    try {
      const cached = window.localStorage?.getItem(`asian_school_exam_cache_g${subGrade}_${subCode}`)
        || window.localStorage?.getItem(`asian_school_exam_cache_g${subGrade}_101`);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore localStorage parse error
    }

    if (window.firebaseDb) {
      const docId = `g${subGrade}_${subCode}`;
      try {
        const snap = await window.firebaseDb.collection('exam_bank').doc(docId).get();
        if (snap.exists && snap.data()?.exam) return snap.data().exam;
        const pSnap = await window.firebaseDb.collection('exam_public').doc(docId).get();
        if (pSnap.exists && pSnap.data()?.exam) return pSnap.data().exam;
      } catch {
        // ignore firestore error
      }
    }
  }
  return null;
}

export function generateSubmissionReviewHtml(sub, options = {}) {
  const practice = sub?.mode === 'practice';
  const subGrade = Number(sub?.grade || (sub?.studentClass ? String(sub.studentClass).split('/')[0] : 8)) || 8;
  const subCode = String(sub?.examCode || '101').trim();
  const canonicalName = getCanonicalStudentName(sub);
  const studentId = sub?.studentId || 'Chưa nhập';
  const studentClass = sub?.studentClass || 'Chưa chọn';
  const fullExam = options.fullExam || null;

  // Điểm số và nhận xét (ưu tiên override nếu đang mở trong cửa sổ chấm bài)
  const effectiveEssayScores = options.tempEssayScores
    ? { ...(sub?.essayScores || {}), ...options.tempEssayScores }
    : (sub?.essayScores || {});

  const hasTempScores = options.tempEssayScores && Object.keys(options.tempEssayScores).length > 0;
  const computedEssayTotal = hasTempScores
    ? Math.round(Object.values(effectiveEssayScores).reduce((a, b) => a + (parseFloat(b) || 0), 0) * 100) / 100
    : (sub?.essayTotal !== undefined ? sub.essayTotal : 0);

  const mcqPoints = sub?.mcqPoints !== undefined ? sub.mcqPoints : (sub?.score !== undefined ? sub.score : 0);
  const isGraded = Boolean(sub?.isGraded || hasTempScores);
  const finalScore = hasTempScores
    ? Math.max(0, Math.min(10, Math.round((parseFloat(mcqPoints || 0) + computedEssayTotal) * 100) / 100))
    : (sub?.finalScore !== undefined ? sub.finalScore : (sub?.score !== undefined ? sub.score : mcqPoints));

  const rawFeedback = options.tempFeedback !== undefined ? options.tempFeedback : (sub?.teacherFeedback || '');
  const feedback = sanitizeStudentFeedback(rawFeedback);
  const maxMcqScore = sub?.maxScore ?? (subGrade === 10 ? 7.75 : 7);

  // Danh sách câu hỏi Trắc nghiệm
  const gradePracticeObj = typeof window !== 'undefined' ? window['EXAM_DATA_G' + subGrade] : null;
  const rawMcq = practice
    ? (gradePracticeObj?.practiceQuestions || [])
    : (subGrade === 10
        ? (fullExam?.part1_mcq || fullExam?.mcqQuestions || [])
        : (fullExam?.mcqQuestions || fullExam?.part1_mcq || []));

  const answers = {
    mcq: sub?.answers?.mcq || {},
    tf: sub?.answers?.tf || {},
    essay: sub?.answers?.essay || {}
  };

  const mcqList = rawMcq.length > 0 ? rawMcq : (
    Object.keys({ ...(sub?.mcqResults || {}), ...(answers.mcq || {}) })
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

  // Danh sách câu hỏi Đúng / Sai (Khối 10)
  const rawTf = practice
    ? (gradePracticeObj?.practiceTfQuestions || [])
    : (fullExam?.part2_tf || []);

  const tfList = rawTf.length > 0 ? rawTf : (
    subGrade === 10 ? (
      Object.keys({ ...(sub?.tfResults || {}), ...(answers.tf || {}) })
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

  // Danh sách câu hỏi Tự luận
  const rawEssay = practice
    ? (gradePracticeObj?.practiceEssayQuestions || [])
    : (fullExam?.essayQuestions || fullExam?.part3_essay || getEssayQuestionsForSubmission(sub) || []);

  const essayList = rawEssay.length > 0 ? rawEssay : (
    Object.keys({ ...effectiveEssayScores, ...(answers.essay || {}) })
      .map(Number)
      .sort((a, b) => a - b)
      .map(num => ({
        num,
        question: `Câu hỏi tự luận ${num}`,
        points: subGrade === 10 ? 0.75 : 1.0,
        pointsText: `${subGrade === 10 ? '0.75' : '1.0'} điểm`,
        modelAnswer: 'Xem thang điểm và nhận xét chi tiết của Thầy bên dưới.'
      }))
  );

  const letters = ['A', 'B', 'C', 'D'];
  const correctCount = sub?.correctMcq !== undefined
    ? sub.correctMcq
    : (sub?.correctCount !== undefined
        ? sub.correctCount
        : mcqList.filter((q, idx) => {
            const qKey = practice ? (q.id ?? q.num ?? (idx + 1)) : (q.num ?? (idx + 1));
            const mcqRes = sub?.mcqResults?.[qKey] || sub?.mcqResults?.[String(qKey)];
            if (mcqRes) return mcqRes.isCorrect;
            const uChoice = answers.mcq?.[qKey] !== undefined ? answers.mcq[qKey] : answers.mcq?.[String(qKey)];
            return q.correctAnswer !== undefined && uChoice === q.correctAnswer;
          }).length);

  const logoSrc = (typeof window !== 'undefined' && window.ASIAN_SCHOOL_LOGO_BASE64) || '';
  const confirmedTimeStr = formatDateTimeVi(sub?.scoreConfirmedAt);
  const submittedTimeStr = formatTimeVi(sub?.submittedAt);

  // Render Phần I: Trắc nghiệm
  const mcqHtml = mcqList.map((q, idx) => {
    const qNum = practice ? (q.id ?? q.num ?? (idx + 1)) : (q.num ?? (idx + 1));
    const userChoice = answers.mcq?.[qNum] !== undefined
      ? answers.mcq[qNum]
      : (answers.mcq?.[String(qNum)] !== undefined
          ? answers.mcq[String(qNum)]
          : sub?.mcqResults?.[qNum]?.userChoice);
    const isAnswered = userChoice !== undefined && userChoice !== null;
    const userLetter = isAnswered ? letters[userChoice] : null;
    const mcqRes = sub?.mcqResults?.[qNum] || sub?.mcqResults?.[String(qNum)];
    const hasKey = q.correctAnswer !== undefined || mcqRes !== undefined;
    const correctAnsIdx = mcqRes?.correctAnswer !== undefined ? mcqRes.correctAnswer : q.correctAnswer;
    const isCorrect = mcqRes ? mcqRes.isCorrect : (hasKey && isAnswered && userChoice === correctAnsIdx);
    const ptsEarned = isCorrect ? (mcqRes?.pointsEarned || q.points || 0.25) : 0;

    const cardBoxClass = hasKey
      ? (isCorrect ? 'q-card q-card-correct' : 'q-card q-card-wrong')
      : 'q-card';

    const statusBadgeClass = !isAnswered
      ? 'q-badge q-badge-unanswered'
      : hasKey
        ? (isCorrect ? 'q-badge q-badge-correct' : 'q-badge q-badge-wrong')
        : 'q-badge q-badge-neutral';

    const statusBadgeText = !isAnswered
      ? '— Chưa làm (0đ)'
      : hasKey
        ? (isCorrect ? `LÀM ĐÚNG (+${ptsEarned}đ)` : `LÀM SAI (0đ) • Em chọn ${userLetter}`)
        : `Đã chọn: ${userLetter}`;

    const optionsHtml = (q.options || []).map((optText, optIdx) => {
      const letter = letters[optIdx] || String.fromCharCode(65 + optIdx);
      const isUserSelected = isAnswered && userChoice === optIdx;
      const isCorrectOption = hasKey && correctAnsIdx === optIdx;

      let optClass = 'opt-item';
      let letterClass = 'opt-letter';
      let tagHtml = '';

      if (isUserSelected && isCorrectOption) {
        optClass = 'opt-item opt-user-correct';
        letterClass = 'opt-letter opt-letter-correct';
        tagHtml = `<span class="opt-tag opt-tag-correct">Em chọn ĐÚNG</span>`;
      } else if (isUserSelected && !isCorrectOption) {
        optClass = 'opt-item opt-user-wrong';
        letterClass = 'opt-letter opt-letter-wrong';
        tagHtml = `<span class="opt-tag opt-tag-wrong">Em đã chọn (Sai)</span>`;
      } else if (!isUserSelected && isCorrectOption) {
        optClass = 'opt-item opt-key-correct';
        letterClass = 'opt-letter opt-letter-correct';
        tagHtml = `<span class="opt-tag opt-tag-correct">Đáp án đúng</span>`;
      }

      return `
        <div class="${optClass}">
          <span class="${letterClass}">${escapeHtml(letter)}</span>
          <span class="opt-text">${escapeHtml(optText)}</span>
          ${tagHtml}
        </div>
      `;
    }).join('');

    return `
      <div class="${cardBoxClass}">
        <div class="q-header">
          <span class="q-num-wrap">
            <span class="q-num-pill">Câu ${escapeHtml(q.num || (idx + 1))}</span>
            ${q.pointsText ? `<span class="q-pts-text">(${escapeHtml(q.pointsText)})</span>` : ''}
          </span>
          <span class="${statusBadgeClass}">${escapeHtml(statusBadgeText)}</span>
        </div>
        <p class="q-stem">${escapeHtml(q.question)}</p>
        <div class="opt-grid">
          ${optionsHtml}
        </div>
      </div>
    `;
  }).join('');

  // Render Phần II: Đúng / Sai (Khối 10)
  const tfHtml = (subGrade === 10 && tfList.length > 0) ? `
    <div class="section-block">
      <div class="section-header">
        <h3>PHẦN II: CHI TIẾT TRẮC NGHIỆM ĐÚNG / SAI (${tfList.length} câu)</h3>
        <span class="section-note">Mỗi ý đúng: +0.25đ • Tối đa 1.0đ/câu</span>
      </div>
      <div class="q-list">
        ${tfList.map(tf => {
          const subRows = (tf.subQuestions || []).map(sq => {
            const userVal = answers.tf?.[tf.num]?.[sq.letter]
              ?? answers.tf?.[String(tf.num)]?.[sq.letter]
              ?? sub?.tfResults?.[tf.num]?.subResults?.[sq.letter]?.userChoice;
            const isAns = userVal !== undefined && userVal !== null;
            const tfRes = sub?.tfResults?.[tf.num]?.subResults?.[sq.letter]
              || sub?.tfResults?.[String(tf.num)]?.subResults?.[sq.letter];
            const hasSubKey = sq.correctAnswer !== undefined || tfRes !== undefined;
            const correctSubVal = tfRes?.correctAnswer !== undefined ? tfRes.correctAnswer : sq.correctAnswer;
            const isSubCorrect = tfRes ? tfRes.isCorrect : (hasSubKey && userVal === correctSubVal);

            const rowClass = !isAns
              ? 'tf-row tf-row-unanswered'
              : hasSubKey
                ? (isSubCorrect ? 'tf-row tf-row-correct' : 'tf-row tf-row-wrong')
                : 'tf-row';

            const choiceBadgeClass = !isAns
              ? 'tf-choice tf-choice-unanswered'
              : hasSubKey
                ? (isSubCorrect ? 'tf-choice tf-choice-correct' : 'tf-choice tf-choice-wrong')
                : 'tf-choice';

            const choiceText = isAns ? (userVal ? 'Em chọn: ĐÚNG' : 'Em chọn: SAI') : 'Chưa làm';
            const resultBadge = (isAns && hasSubKey)
              ? `<span class="${isSubCorrect ? 'tf-res tf-res-correct' : 'tf-res tf-res-wrong'}">
                  ${isSubCorrect ? 'Đúng (+0.25đ)' : `Sai (Đáp án: ${correctSubVal ? 'ĐÚNG' : 'SAI'})`}
                </span>`
              : '';

            return `
              <div class="${rowClass}">
                <span class="tf-statement"><strong>${escapeHtml(sq.letter)})</strong> ${escapeHtml(sq.text)}</span>
                <div class="tf-badges">
                  <span class="${choiceBadgeClass}">${escapeHtml(choiceText)}</span>
                  ${resultBadge}
                </div>
              </div>
            `;
          }).join('');

          return `
            <div class="q-card">
              <div class="tf-title">Câu ${escapeHtml(tf.num)} (Đúng / Sai)</div>
              <p class="q-stem">${escapeHtml(tf.context)}</p>
              <div class="tf-list">
                ${subRows}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  // Render Phần Tự luận
  const essaySectionTitle = tfList.length > 0 && subGrade === 10
    ? `PHẦN III: CHI TIẾT PHẦN TỰ LUẬN (${essayList.length} câu)`
    : `PHẦN II: CHI TIẾT PHẦN TỰ LUẬN (${essayList.length} câu)`;

  const essayScaleText = subGrade === 10
    ? 'Thang điểm: 2,25 điểm (0,75đ / câu)'
    : 'Thang điểm: 3,0 điểm (1,0đ / câu)';

  const essayHtml = essayList.length > 0 ? `
    <div class="section-block">
      <div class="section-header">
        <h3>${escapeHtml(essaySectionTitle)}</h3>
        <span class="essay-scale-pill">${escapeHtml(essayScaleText)}</span>
      </div>
      <div class="q-list">
        ${essayList.map((eq, idx) => {
          const qNum = eq.num !== undefined ? eq.num : (idx + 1);
          const { stem, subItems } = essayPresentation(eq);
          const studentAnswer = String(answers.essay?.[qNum] ?? answers.essay?.[String(qNum)] ?? '');
          const essayScoreRaw = effectiveEssayScores?.[qNum] ?? effectiveEssayScores?.[String(qNum)];
          const hasEssayScore = essayScoreRaw !== undefined && essayScoreRaw !== '';
          const essayScore = hasEssayScore ? parseFloat(essayScoreRaw) : undefined;
          const maxPoints = Math.round((Number(eq.points) || parseFloat(String(eq.pointsText || '').replace(/[^\d.,]/g, '').replace(',', '.')) || (subGrade === 10 ? 0.75 : 1.0)) * 100) / 100;
          const pointsLabel = eq.pointsText || `${maxPoints.toString().replace('.', ',')} điểm`;
          const questionFeedback = getEssayFeedbackForQuestion(rawFeedback, qNum);
          const qGraded = isGraded || hasEssayScore;
          const hasDeduction = qGraded && Number(essayScore ?? 0) < maxPoints;
          const feedbackText = questionFeedback || (hasDeduction ? feedback : '');

          const subItemsHtml = subItems && subItems.length > 0 ? `
            <div class="essay-subitems">
              <span class="essay-subitems-title">Các ý yêu cầu trả lời:</span>
              ${subItems.map(item => `
                <div class="essay-subitem-row">
                  <span class="essay-subitem-letter">Ý ${escapeHtml(item.letter)})</span>
                  <span>${escapeHtml(item.text)}</span>
                </div>
              `).join('')}
            </div>
          ` : '';

          const feedbackBoxHtml = !practice ? (
            qGraded ? (
              hasDeduction && feedbackText ? `
                <div class="essay-feedback-box">
                  <span class="essay-feedback-title">Nhận xét:</span>
                  <div class="essay-feedback-content">${escapeHtml(feedbackText)}</div>
                </div>
              ` : ''
            ) : `
              <div class="essay-pending-box">
                <span>Tự luận:</span>
                <span class="essay-pending-pill">Đang chờ chấm điểm</span>
              </div>
            `
          ) : '';

          return `
            <div class="essay-card">
              <div class="essay-card-header">
                <span class="essay-card-title">
                  Câu ${escapeHtml(qNum)} (Tự luận) — ${qGraded ? `${essayScore !== undefined ? essayScore : 0} / ${maxPoints} điểm` : escapeHtml(pointsLabel)}
                </span>
                <span class="essay-status-text">${studentAnswer.trim() ? 'Đã làm bài' : 'Chưa nhập bài làm'}</span>
              </div>
              <p class="essay-stem">${escapeHtml(stem)}</p>
              ${subItemsHtml}
              <div class="essay-answer-wrap">
                <span class="essay-answer-label">Bài làm em đã gõ:</span>
                <div class="essay-answer-box">${studentAnswer.trim() ? escapeHtml(studentAnswer) : '<em class="empty-answer">Học sinh chưa nhập bài làm cho câu hỏi này.</em>'}</div>
              </div>
              ${feedbackBoxHtml}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  const confirmStatusBoxHtml = !practice ? (
    sub?.scoreConfirmed ? `
      <div class="confirm-banner confirm-banner-done">
        <div>
          <p class="confirm-banner-title">EM ĐÃ XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC</p>
          <p class="confirm-banner-desc">
            Thời điểm chốt: ${escapeHtml(confirmedTimeStr || new Date().toLocaleString('vi-VN'))}${sub?.confirmedByAdmin ? ' (Giáo viên xác nhận)' : ''}. Điểm số này đã được gửi lưu trữ chính thức vào sổ điểm của Thầy.
          </p>
        </div>
      </div>
    ` : `
      <div class="confirm-banner confirm-banner-pending">
        <p class="confirm-banner-desc">
          Em vui lòng xem kỹ từng câu hỏi trắc nghiệm (đúng/sai) và phần tự luận được chấm ở dưới. Nếu kết quả chính xác, hãy bấm nút xác nhận chốt điểm trên cổng khảo thí.
        </p>
      </div>
    `
  ) : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phiếu Chốt Điểm - ${escapeHtml(canonicalName)} - Lớp ${escapeHtml(studentClass)} (${escapeHtml(studentId)})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .top-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 30;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    }
    .top-header-inner {
      width: 90%;
      max-width: 1440px;
      margin: 0 auto;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .brand-logo {
      height: 40px;
      width: auto;
      object-fit: contain;
    }
    .brand-title {
      font-size: 15px;
      font-weight: 900;
      color: #172554;
      text-transform: uppercase;
      line-height: 1.2;
    }
    .brand-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }
    .print-btn {
      background: #0267B1;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(2, 103, 177, 0.25);
    }
    .print-btn:hover { background: #025694; }

    .workspace {
      width: 90%;
      max-width: 1440px;
      margin: 18px auto 40px;
      display: grid;
      grid-template-columns: minmax(340px, 0.88fr) minmax(0, 1.12fr);
      gap: 18px;
      align-items: start;
    }
    .summary-pane {
      position: sticky;
      top: 76px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .result-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 18px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }
    .result-card-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .result-card-heading img { height: 30px; width: auto; }
    .result-card-heading div { flex: 1; }
    .result-card-heading h3 { font-size: 12px; font-weight: 800; color: #172554; }
    .result-card-heading p { font-size: 10px; color: #64748b; font-weight: 600; }
    .result-card-heading > span { font-size: 11px; font-weight: 800; color: #1e40af; }

    .identity-box {
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 10px 14px;
    }
    .identity-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 20px;
      font-size: 13px;
    }
    .identity-item {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .identity-item dt { color: #64748b; font-weight: 500; }
    .identity-item dd { font-weight: 800; color: #0f172a; }
    .identity-item dd.lms-id { color: #1e40af; }

    .result-card-score {
      text-align: center;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      padding: 14px 12px;
    }
    .result-card-score h2 {
      font-size: 17px;
      font-weight: 800;
      color: #047857;
    }
    .result-score-label {
      font-size: 11px;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 4px;
    }
    .result-score-value {
      font-size: 40px;
      font-weight: 900;
      color: #1e3a8a;
      line-height: 1.15;
      margin: 4px 0;
    }
    .result-score-value > span {
      font-size: 16px;
      font-weight: 600;
      color: #475569;
    }
    .score-breakdown-line {
      font-size: 12px;
      color: #1e293b;
      font-weight: 600;
    }
    .score-confirmed-line {
      font-size: 12px;
      font-weight: 800;
      color: #047857;
      margin-top: 4px;
    }

    .result-card-facts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      font-size: 12px;
    }
    .result-card-facts > div {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .result-card-facts dt { color: #64748b; }
    .result-card-facts dd { font-weight: 700; color: #0f172a; }

    .result-violation-line {
      color: #b91c1c;
      font-size: 11px;
      font-weight: 700;
    }
    .result-feedback {
      padding: 10px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 12px;
      white-space: pre-line;
    }
    .result-feedback h4 {
      font-size: 10px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .result-card footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      font-size: 10px;
      color: #64748b;
    }

    /* Cột phải: Chi tiết bài làm & đối soát */
    .review-pane {
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-width: 0;
    }
    .review-top-bar {
      background: #ffffff;
      border: 2px solid #bfdbfe;
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
    }
    .review-top-title {
      font-size: 12px;
      font-weight: 900;
      color: #172554;
      text-transform: uppercase;
    }
    .review-top-tag {
      font-size: 12px;
      font-weight: 700;
      color: #4338ca;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 4px 12px;
      border-radius: 10px;
    }

    .confirm-card {
      background: linear-gradient(90deg, #eff6ff 0%, #eef2ff 50%, #eff6ff 100%);
      border: 2px solid #93c5fd;
      border-radius: 22px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .confirm-card-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 1px solid #bfdbfe;
    }
    .confirm-card-header h3 {
      font-size: 14px;
      font-weight: 900;
      color: #172554;
      text-transform: uppercase;
    }
    .confirm-card-header p {
      font-size: 12px;
      color: #475569;
      font-weight: 500;
      margin-top: 2px;
    }
    .confirm-pill {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .confirm-pill-done {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    .confirm-pill-pending {
      background: #fef3c7;
      color: #78350f;
      border: 1px solid #fcd34d;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .stat-box {
      background: #ffffff;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      padding: 10px;
      text-align: center;
    }
    .stat-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      display: block;
    }
    .stat-val {
      font-size: 17px;
      font-weight: 900;
      margin-top: 2px;
      display: block;
    }
    .stat-blue { color: #1e3a8a; }
    .stat-indigo { color: #4338ca; }
    .stat-emerald { color: #047857; }
    .stat-amber { color: #b45309; }

    .confirm-banner {
      padding: 14px 16px;
      border-radius: 14px;
      font-size: 12px;
    }
    .confirm-banner-done {
      background: #ecfdf5;
      border: 2px solid #6ee7b7;
      color: #064e3b;
    }
    .confirm-banner-pending {
      background: #ffffff;
      border: 1px solid #bfdbfe;
      color: #334155;
    }
    .confirm-banner-title {
      font-size: 13px;
      font-weight: 900;
      color: #064e3b;
    }
    .confirm-banner-desc {
      font-size: 11px;
      margin-top: 2px;
    }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .section-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .section-header h3 {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
    }
    .section-note {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .legend-correct { color: #047857; font-weight: 700; }
    .legend-wrong { color: #be123c; font-weight: 700; }

    .q-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .q-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .q-card-correct {
      background: #f0fdf4;
      border-color: #6ee7b7;
    }
    .q-card-wrong {
      background: #fff1f2;
      border-color: #fda4af;
    }
    .q-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .q-num-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    .q-num-pill {
      padding: 2px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-family: monospace;
      font-weight: 800;
      text-transform: uppercase;
    }
    .q-pts-text {
      color: #94a3b8;
      font-size: 11px;
    }
    .q-badge {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
    }
    .q-badge-correct {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    .q-badge-wrong {
      background: #ffe4e6;
      color: #9f1239;
      border: 1px solid #fda4af;
    }
    .q-badge-unanswered {
      background: #e2e8f0;
      color: #334155;
    }
    .q-badge-neutral {
      background: #dbeafe;
      color: #1e3a8a;
    }
    .q-stem {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      white-space: pre-line;
    }
    .opt-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding-top: 4px;
    }
    .opt-item {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 11px 12px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 13px;
      color: #1e293b;
    }
    .opt-user-correct {
      background: #ecfdf5;
      border-color: #10b981;
      color: #064e3b;
      font-weight: 700;
    }
    .opt-user-wrong {
      background: #fff1f2;
      border-color: #fb7185;
      color: #881337;
      font-weight: 700;
    }
    .opt-key-correct {
      background: #ecfdf5;
      border-color: #34d399;
      border-style: dashed;
      color: #065f46;
      font-weight: 700;
    }
    .opt-letter {
      width: 24px;
      height: 24px;
      border-radius: 7px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-weight: 900;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .opt-letter-correct {
      background: #059669;
      border-color: #059669;
      color: #ffffff;
    }
    .opt-letter-wrong {
      background: #e11d48;
      border-color: #e11d48;
      color: #ffffff;
    }
    .opt-text { flex: 1; }
    .opt-tag {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 7px;
      border-radius: 5px;
    }
    .opt-tag-correct {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    .opt-tag-wrong {
      background: #ffe4e6;
      color: #9f1239;
      border: 1px solid #fda4af;
    }

    /* Đúng / Sai */
    .tf-title {
      font-size: 12px;
      font-weight: 900;
      color: #6b21a8;
      text-transform: uppercase;
    }
    .tf-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tf-row {
      padding: 11px 14px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 13px;
    }
    .tf-row-correct {
      background: #ecfdf5;
      border-color: #6ee7b7;
      color: #064e3b;
      font-weight: 700;
    }
    .tf-row-wrong {
      background: #fff1f2;
      border-color: #fda4af;
      color: #881337;
      font-weight: 700;
    }
    .tf-row-unanswered {
      background: #f8fafc;
      border-color: #e2e8f0;
      color: #475569;
    }
    .tf-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .tf-choice {
      padding: 3px 9px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 900;
    }
    .tf-choice-correct { background: #059669; color: #ffffff; }
    .tf-choice-wrong { background: #e11d48; color: #ffffff; }
    .tf-choice-unanswered { background: #e2e8f0; color: #334155; }
    .tf-res {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 5px;
    }
    .tf-res-correct { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .tf-res-wrong { background: #ffe4e6; color: #9f1239; border: 1px solid #fda4af; }

    /* Tự luận */
    .essay-scale-pill {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
      background: #e0e7ff;
      color: #312e81;
      border: 1px solid #c7d2fe;
    }
    .essay-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 22px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .essay-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    .essay-card-title {
      font-size: 13px;
      font-weight: 900;
      color: #312e81;
      text-transform: uppercase;
    }
    .essay-status-text {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
    }
    .essay-stem {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      white-space: pre-line;
    }
    .essay-subitems {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
    }
    .essay-subitems-title {
      font-size: 11px;
      font-weight: 800;
      color: #312e81;
      text-transform: uppercase;
    }
    .essay-subitem-row {
      display: flex;
      gap: 8px;
      color: #1e293b;
      font-weight: 600;
    }
    .essay-subitem-letter {
      font-weight: 900;
      color: #4338ca;
      flex-shrink: 0;
    }
    .essay-answer-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .essay-answer-label {
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
    }
    .essay-answer-box {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      font-size: 13px;
      color: #0f172a;
      white-space: pre-line;
    }
    .empty-answer { color: #94a3b8; }
    .essay-feedback-box {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .essay-feedback-title {
      font-size: 11px;
      font-weight: 800;
      color: #312e81;
      text-transform: uppercase;
    }
    .essay-feedback-content {
      background: #ffffff;
      border: 1px solid #c7d2fe;
      border-radius: 10px;
      padding: 12px;
      font-size: 13px;
      color: #1e293b;
      font-weight: 500;
      white-space: pre-line;
    }
    .essay-pending-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      color: #78350f;
    }
    .essay-pending-pill {
      background: #ffffff;
      border: 1px solid #fcd34d;
      padding: 3px 10px;
      border-radius: 8px;
    }

    @media (max-width: 960px) {
      .workspace {
        grid-template-columns: 1fr;
        width: 95%;
      }
      .summary-pane { position: static; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .opt-grid { grid-template-columns: 1fr; }
    }
    @media print {
      .no-print { display: none !important; }
      .workspace {
        grid-template-columns: 1fr;
        width: 100%;
        margin: 0;
      }
      .summary-pane { position: static; }
    }
  </style>
</head>
<body>
  <header class="top-header">
    <div class="top-header-inner">
      <div class="brand-wrap">
        ${logoSrc ? `<img src="${logoSrc}" alt="Logo Trường Quốc Tế Á Châu" class="brand-logo" />` : ''}
        <div>
          <h1 class="brand-title">TRƯỜNG QUỐC TẾ Á CHÂU</h1>
          <p class="brand-subtitle">Bộ Môn Tin Học — Cổng Ôn Tập &amp; Kiểm Tra Giữa HK1 (2026 - 2027)</p>
        </div>
      </div>
      <button type="button" class="print-btn no-print" onclick="window.print()">🖨️ In / Lưu PDF</button>
    </div>
  </header>

  <main class="workspace">
    <!-- CỘT TRÁI: THẺ KẾT QUẢ CHỐT ĐIỂM -->
    <div class="summary-pane">
      <section class="result-card">
        <header class="result-card-heading">
          ${logoSrc ? `<img src="${logoSrc}" alt="Logo Asian School" />` : ''}
          <div>
            <h3>TRƯỜNG QUỐC TẾ Á CHÂU</h3>
            <p>BỘ MÔN TIN HỌC · XÁC NHẬN KẾT QUẢ</p>
          </div>
          <span>${practice ? 'ÔN TẬP' : 'THI GIỮA HK1'}</span>
        </header>

        <section aria-label="Thông tin học sinh" class="identity-box">
          <dl class="identity-list">
            <div class="identity-item">
              <dt>Họ tên</dt>
              <dd>${escapeHtml(canonicalName)}</dd>
            </div>
            <div class="identity-item">
              <dt>Mã LMS</dt>
              <dd class="lms-id">${escapeHtml(studentId)}</dd>
            </div>
            <div class="identity-item">
              <dt>Lớp</dt>
              <dd>${escapeHtml(studentClass)}</dd>
            </div>
            <div class="identity-item">
              <dt>${practice ? 'Lượt làm' : 'Mã đề'}</dt>
              <dd>${escapeHtml(practice ? (sub?.attemptNumber || 1) : subCode)}</dd>
            </div>
          </dl>
        </section>

        <div class="result-card-score">
          ${!practice ? '<h2>ĐÃ NỘP BÀI THÀNH CÔNG</h2>' : ''}
          <p class="result-score-label">${practice ? 'ĐIỂM ĐẠT ĐƯỢC' : (isGraded ? 'ĐIỂM CHÍNH THỨC' : 'ĐIỂM TRẮC NGHIỆM')}</p>
          <div class="result-score-value">
            ${escapeHtml(practice ? (sub?.score ?? mcqPoints) : (isGraded ? finalScore : mcqPoints))}<span> / ${practice || !isGraded ? maxMcqScore : 10} đ</span>
          </div>
          ${!practice && isGraded ? `<p class="score-breakdown-line">Trắc nghiệm: ${escapeHtml(mcqPoints)} đ · Tự luận: ${escapeHtml(computedEssayTotal)} đ</p>` : ''}
          ${!practice && !isGraded ? `<p class="score-breakdown-line">Chưa bao gồm điểm tự luận.</p>` : ''}
          ${sub?.scoreConfirmed ? `<p class="score-confirmed-line">ĐÃ XÁC NHẬN CHỐT ĐIỂM</p>` : ''}
        </div>

        <dl class="result-card-facts">
          <div><dt>Thời gian làm bài</dt><dd>${escapeHtml(sub?.durationFormatted || 'Chưa có thông tin')}</dd></div>
          <div><dt>Nộp lúc</dt><dd>${escapeHtml(submittedTimeStr)}</dd></div>
          <div><dt>Số lần vi phạm</dt><dd>${escapeHtml(sub?.violations || 0)} lần</dd></div>
          <div><dt>Trắc nghiệm đúng</dt><dd>${practice ? `${escapeHtml(correctCount)} / ${escapeHtml(mcqList.length)} câu` : `${escapeHtml(correctCount)} câu`}</dd></div>
        </dl>

        ${(sub?.violations || 0) >= 3 ? `<p class="result-violation-line">Vi phạm ${escapeHtml(sub.violations)} lần: bài đã bị khóa, giám thị ghi nhận và xử lý theo quy chế</p>` : ''}
        ${!practice && isGraded && feedback ? `<section class="result-feedback"><h4>NHẬN XÉT</h4><p>${escapeHtml(feedback)}</p></section>` : ''}

        <footer>Hệ thống kiểm tra trực tuyến Tin học Asian School · Giáo viên: Thầy Trần Gia Huy</footer>
      </section>
    </div>

    <!-- CỘT PHẢI: CHI TIẾT BÀI LÀM & ĐỐI SOÁT CHỐT ĐIỂM -->
    <div class="review-pane">
      <div class="review-top-bar">
        <span class="review-top-title">ĐANG XEM CHI TIẾT BÀI THI &amp; ĐỐI SOÁT CHỐT ĐIỂM</span>
        <span class="review-top-tag">Phòng khảo thí trực tuyến</span>
      </div>

      ${!practice ? `
        <div class="confirm-card">
          <div class="confirm-card-header">
            <div>
              <h3>ĐỐI SOÁT BÀI LÀM &amp; XÁC NHẬN ĐIỂM SỐ CHÍNH THỨC</h3>
              <p>Em vui lòng kiểm tra kỹ lại toàn bộ bài làm trắc nghiệm và tự luận bên dưới trước khi bấm xác nhận chốt điểm.</p>
            </div>
            ${sub?.scoreConfirmed
              ? `<span class="confirm-pill confirm-pill-done">ĐÃ CHỐT ĐIỂM THÀNH CÔNG</span>`
              : `<span class="confirm-pill confirm-pill-pending">ĐANG CHỜ EM XÁC NHẬN</span>`}
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-label">${subGrade === 10 ? 'Trắc Nghiệm &amp; Đ/S' : 'Trắc Nghiệm'}</span>
              <span class="stat-val stat-blue">${escapeHtml(mcqPoints)} đ</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Tự Luận (Thầy Chấm)</span>
              <span class="stat-val stat-indigo">${isGraded ? `${escapeHtml(computedEssayTotal)} đ` : 'Chờ chấm'}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Tổng Điểm Bài Thi</span>
              <span class="stat-val stat-emerald">${escapeHtml(finalScore)} / 10 đ</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Số Câu Đúng</span>
              <span class="stat-val stat-amber">${escapeHtml(correctCount)} câu</span>
            </div>
          </div>

          ${confirmStatusBoxHtml}
        </div>
      ` : ''}

      <div class="section-block">
        <div class="section-header">
          <h3>PHẦN I: CHI TIẾT TRẮC NGHIỆM (${mcqList.length} câu • Mã Đề: ${escapeHtml(subCode)})</h3>
          <span class="section-note">Ký hiệu: <span class="legend-correct">Làm đúng</span> • <span class="legend-wrong">Làm sai</span></span>
        </div>
        <div class="q-list">
          ${mcqHtml}
        </div>
      </div>

      ${tfHtml}
      ${essayHtml}
    </div>
  </main>
</body>
</html>`;
}

export async function exportStudentSubmissionHtml(sub, options = {}) {
  if (!sub) return null;
  const fullExam = options.fullExam || await resolveFullExamForSubmission(sub);
  const htmlContent = generateSubmissionReviewHtml(sub, { ...options, fullExam });

  const canonicalName = getCanonicalStudentName(sub);
  const cleanLms = String(sub.studentId || 'ChuaCoLMS').trim().replace(/[^a-zA-Z0-9]/g, '');
  const cleanName = canonicalName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const cleanClass = String(sub.studentClass || 'Lop').replace(/[\/\s]+/g, '_');
  const subGrade = Number(sub.grade || (sub.studentClass ? String(sub.studentClass).split('/')[0] : 8)) || 8;
  const modeTag = sub.mode === 'practice' ? 'OnTap' : `ThiGK1_De${sub.examCode || '101'}`;
  const fileName = `ChotDiem_${cleanLms}_${cleanName}_Lop_${cleanClass}_Tin${subGrade}_${modeTag}.html`;

  if (typeof document !== 'undefined') {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { fileName, canonicalName, htmlContent };
}
