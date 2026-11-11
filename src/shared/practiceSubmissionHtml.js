import { essayPresentation } from './essayPresentation.js';

function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function text(value, fallback = '') { return typeof value === 'string' ? value : (typeof value === 'number' && Number.isFinite(value) ? String(value) : fallback); }
function objectRows(value) { return Array.isArray(value) ? value.filter(isRecord) : []; }
function escape(value) {
  return text(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function questionRows(questions, answers, keyFor) {
  const rows = objectRows(questions).flatMap((question, index) => {
    const key = keyFor(question, index);
    if (typeof key !== 'string' && !(typeof key === 'number' && Number.isFinite(key))) return [];
    return [{key: text(key), question}];
  });
  const known = new Set(rows.map(row => row.key));
  for (const key of Object.keys(answers)) if (!known.has(key)) rows.push({key, question: null});
  return rows;
}
export function generatePracticeReviewHtml(sub, canonicalName) {
  const set = isRecord(sub.practiceSet) ? sub.practiceSet : {};
  const answers = isRecord(sub.answers) ? sub.answers : {};
  const mcq = isRecord(answers.mcq) ? answers.mcq : {}, tf = isRecord(answers.tf) ? answers.tf : {}, essay = isRecord(answers.essay) ? answers.essay : {};
  const mcqRows = questionRows(set.mcqQuestions, mcq, (q, i) => q.id ?? q.num ?? i + 1);
  const essayRows = questionRows(set.essayQuestions, essay, (q, i) => q.num ?? q.id ?? i + 1);
  const tfRows = questionRows(set.tfQuestions, tf, (q, i) => q.num ?? q.id ?? i + 1);
  const time = sub.submittedAt ? new Date(sub.submittedAt) : null;
  const at = time && !isNaN(time.getTime()) ? time.toLocaleString('vi-VN', {timeZone:'Asia/Ho_Chi_Minh'}) : 'Chưa có mốc nộp';
  const card = (heading, body) => `<section><h3>${escape(heading)}</h3>${body}</section>`;
  const mcqHtml = mcqRows.map(({key, question}, index) => {
    const choice = mcq[key];
    const validChoice = Number.isInteger(choice) && choice >= 0;
    const candidate = validChoice && Array.isArray(question?.options) ? question.options[choice] : undefined;
    const capturedOption = typeof candidate === 'string' ? candidate : undefined;
    return card(`Câu ${index + 1} · ID ${key}`, `<p>${escape(text(question?.question, 'Chưa có bộ câu hỏi của lượt làm'))}</p><p>Chỉ số lựa chọn đã lưu: ${escape(choice === undefined ? 'Chưa trả lời' : (validChoice ? choice : 'Dữ liệu lựa chọn không hợp lệ'))}</p>${capturedOption !== undefined ? `<p>Phương án đã chọn trong bản lưu: <strong>${escape(capturedOption)}</strong></p>` : '<p class="notice">Chưa xác minh được nội dung phương án theo thứ tự lúc làm bài; không suy ra đúng/sai.</p>'}`);
  }).join('');
  const tfHtml = tfRows.map(({key, question}) => {
    const stored = isRecord(tf[key]) ? tf[key] : {};
    const statements = objectRows(question?.subQuestions);
    const letters = [...new Set([...statements.map(item => text(item.letter)).filter(Boolean), ...Object.keys(stored)])];
    return card(`Đúng / Sai · ID ${key}`, `<p>${escape(text(question?.context, 'Chưa có bộ câu hỏi của lượt làm'))}</p>${letters.map(letter => {
      const value = stored[letter];
      return `<p>${escape(letter)}) ${escape(text(statements.find(item => item.letter === letter)?.text))} — Lựa chọn đã lưu: ${escape(value === true ? 'Đúng' : value === false ? 'Sai' : value === undefined ? 'Chưa trả lời' : 'Dữ liệu lựa chọn không hợp lệ')}</p>`;
    }).join('')}`);
  }).join('');
  const essayHtml = essayRows.map(({key, question}) => {
    const safeQuestion = {context: text(question?.context), question: text(question?.question), text: text(question?.text), subItems: objectRows(question?.subItems).map(item => ({letter:text(item.letter),text:text(item.text)}))};
    const {stem, subItems} = essayPresentation(safeQuestion);
    return card(`Tự luận · ID ${key}`, `<p>${escape(stem || 'Chưa có nội dung câu hỏi trong bản lưu')}</p>${subItems.map(item => `<p><strong>${escape(item.letter)})</strong> ${escape(item.text)}</p>`).join('')}<pre>${escape(text(essay[key], 'Chưa trả lời'))}</pre>`);
  }).join('');
  const hasQuestions = objectRows(set.mcqQuestions).some(q => typeof q.question === 'string' && Array.isArray(q.options) && q.options.every(option => typeof option === 'string'));
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bài ôn tập — ${escape(canonicalName)}</title><style>body{font:17px/1.6 Arial,sans-serif;color:#172b4d;margin:0;padding:24px}main{max-width:1050px;margin:auto}h1,h2{color:#0267B1}section{border:1px solid #cbd5e1;border-radius:10px;padding:14px;margin:12px 0;break-inside:avoid}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;background:#f8fafc;padding:12px}.notice{color:#854d0e;background:#fefce8;padding:12px}p{overflow-wrap:anywhere}@media print{body{padding:0}section{border-radius:0}}</style></head><body><main><h1>Bài ôn tập đã lưu</h1><p><strong>${escape(canonicalName)}</strong> · Lớp ${escape(sub.studentClass)} · Mã LMS ${escape(sub.studentId)}</p><p>Lượt ghi trên bản lưu: ${escape(sub.attemptNumber ?? 'Chưa xác định')} · Nộp: ${escape(at)} · Thời gian làm: ${escape(sub.durationFormatted || 'Chưa có')}</p><p>Điểm gốc: <strong>${escape(sub.finalScore ?? sub.score ?? sub.mcqPoints ?? 'Chưa có')} / ${escape(sub.maxScore ?? (Number(sub.grade) === 10 ? 7.75 : 7))}</strong>. Tự luận ôn tập không tính điểm. Đây là bản xem chỉ đọc, không chấm lại hoặc đổi điểm.</p>${!hasQuestions ? '<p class="notice">Chưa có bộ câu hỏi của lượt làm. Bản tổng hợp cũ có thể giữ bài điểm cao nhất và thông tin lượt mới nhất; chưa xác minh đây là một lượt nguyên vẹn. Giữ nguyên ID câu và chỉ số lựa chọn; không ghép với ngân hàng hiện tại vì phương án có thể đã xáo trộn.</p>' : '<p>Bộ câu hỏi hiển thị lấy từ chính bản lưu của lượt làm.</p>'}${!sub.answers ? '<p class="notice">Bản ghi này chỉ có kết quả tổng hợp, chưa có câu trả lời chi tiết.</p>' : ''}<h2>Trắc nghiệm (${mcqRows.length})</h2>${mcqHtml}${tfRows.length ? `<h2>Đúng / Sai</h2>${tfHtml}` : ''}<h2>Tự luận (${essayRows.length})</h2>${essayHtml}</main></body></html>`;
}
