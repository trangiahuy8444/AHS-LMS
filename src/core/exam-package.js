/**
 * exam-package.js
 * Module dùng cho Cổng Quản Trị và bộ kiểm thử:
 *  - stripAnswers: bỏ đáp án, barem trước khi gửi đề cho học sinh
 *  - gradeExam: chấm phần trắc nghiệm (Khối 8, 9) và trắc nghiệm + Đúng/Sai (Khối 10)
 *  - validateExam: kiểm tra cấu trúc mã đề trước khi tải lên exam_bank
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AsianSchoolExamPackage = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const ANSWER_FIELDS = ['correctAnswer', 'answerLetter', 'modelAnswer', 'rubric', 'explanation'];

  // Hệ số chấm câu Đúng/Sai theo số ý đúng (quy ước tổ, trùng ngan-hang-de-web/domain/scoring.py)
  const TF_COEFFICIENTS = { 0: 0, 1: 0.1, 2: 0.25, 3: 0.5, 4: 1 };

  function round2(x) {
    return Math.round(x * 100) / 100;
  }

  function mcqList(exam) {
    return exam.mcqQuestions || exam.part1_mcq || [];
  }

  function tfList(exam) {
    return exam.part2_tf || [];
  }

  function essayList(exam) {
    return exam.essayQuestions || exam.part3_essay || [];
  }

  function stripItem(item) {
    const out = {};
    Object.keys(item).forEach(key => {
      if (ANSWER_FIELDS.indexOf(key) !== -1) return;
      out[key] = key === 'subQuestions' && Array.isArray(item[key]) ? item[key].map(stripItem) : item[key];
    });
    return out;
  }

  function stripAnswers(exam) {
    const out = {};
    Object.keys(exam).forEach(key => {
      out[key] = Array.isArray(exam[key]) ? exam[key].map(item => (item && typeof item === 'object' ? stripItem(item) : item)) : exam[key];
    });
    return out;
  }

  function maxObjectivePoints(exam) {
    const mcq = mcqList(exam).reduce((s, q) => s + (q.points || 0.25), 0);
    const tf = tfList(exam).reduce((s, q) => s + (q.points || 1), 0);
    return round2(mcq + tf);
  }

  /**
   * answers: { mcq: { [num]: chỉ số phương án }, tf: { [num]: { a: true/false, ... } } }
   * options.tfScoringPolicy: 'coefficient' (mặc định: TF_COEFFICIENTS × điểm câu, giống phần ôn tập) | 'per_statement' (0,25đ mỗi ý)
   */
  function gradeExam(exam, answers, options) {
    const opts = options || {};
    const mcqAnswers = (answers && answers.mcq) || {};
    const tfAnswers = (answers && answers.tf) || {};
    let mcqPoints = 0;
    let correctMcq = 0;
    let tfPoints = 0;

    mcqList(exam).forEach(q => {
      if (mcqAnswers[q.num] === q.correctAnswer) {
        correctMcq++;
        mcqPoints += (q.points || 0.25);
      }
    });

    tfList(exam).forEach(q => {
      const userSub = tfAnswers[q.num] || {};
      const subs = q.subQuestions || [];
      const correctCount = subs.filter(sub => userSub[sub.letter] === sub.correctAnswer).length;
      if (opts.tfScoringPolicy === 'per_statement') {
        tfPoints += correctCount * 0.25;
      } else {
        tfPoints += (q.points || 1) * (TF_COEFFICIENTS[correctCount] || 0);
      }
    });

    const maxPoints = maxObjectivePoints(exam);
    const objectivePoints = Math.min(maxPoints, round2(mcqPoints + tfPoints));
    return {
      correctMcq,
      totalMcq: mcqList(exam).length,
      mcqPoints: objectivePoints,
      tfPoints: round2(tfPoints),
      maxMcqPoints: maxPoints
    };
  }

  function validateExam(exam) {
    const errors = [];
    if (!exam || typeof exam !== 'object') return ['Mã đề không phải đối tượng JSON.'];
    if (!/^\d{3}$/.test(String(exam.code || ''))) errors.push('Thiếu "code" gồm 3 chữ số (ví dụ "101").');
    const mcq = mcqList(exam);
    if (!mcq.length) errors.push('Thiếu danh sách câu trắc nghiệm ("mcqQuestions" hoặc "part1_mcq").');
    mcq.forEach((q, idx) => {
      const label = `Câu trắc nghiệm ${q.num || idx + 1}`;
      if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${label}: phải có đúng 4 phương án.`);
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) errors.push(`${label}: "correctAnswer" phải là 0..3.`);
      if (q.answerLetter && q.answerLetter !== String.fromCharCode(65 + q.correctAnswer)) errors.push(`${label}: "answerLetter" không khớp "correctAnswer".`);
    });
    tfList(exam).forEach((q, idx) => {
      const label = `Câu Đúng/Sai ${q.num || idx + 1}`;
      const subs = q.subQuestions || [];
      if (subs.length !== 4) errors.push(`${label}: phải có đúng 4 ý a, b, c, d.`);
      subs.forEach(sub => {
        if (typeof sub.correctAnswer !== 'boolean') errors.push(`${label} ý ${sub.letter}: "correctAnswer" phải là true/false.`);
      });
    });
    const total = maxObjectivePoints(exam) + essayList(exam).reduce((s, q) => s + (q.points || 0), 0);
    if (exam.totalPoints !== undefined && Math.abs(total - exam.totalPoints) > 0.001) {
      errors.push(`Tổng điểm các câu (${round2(total)}) khác "totalPoints" (${exam.totalPoints}).`);
    }
    return errors;
  }

  return { TF_COEFFICIENTS, stripAnswers, gradeExam, validateExam, maxObjectivePoints };
}));
