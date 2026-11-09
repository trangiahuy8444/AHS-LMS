export function sanitizeStudentFeedback(value) {
  return String(value || '').replace(/[ \t]*\[(?:Dự phòng|Fallback)\s*:\s*(?:gemini-[\w.-]+|local-sandbox|web-sandbox)\s*\]/gi,'')
    .replace(/\bhọc[ \t]+sinh\b/gi, word => word[0] === 'H' ? 'Em' : 'em')
    .replace(/(?:^|[ \t\r\n]+)(\[?Câu\s+\d+\s*(?:\(|:))/g, '\n\n$1')
    .trim().split(/\n\s*\n/).filter(block=>{
      const match=block.match(/^\s*\[?Câu\s+\d+\s*\(([\d.,]+)\s*\/\s*([\d.,]+)\s*đ\)\]?\s*:/i);
      return !match || Number(match[1].replace(',','.')) < Number(match[2].replace(',','.'));
    }).join('\n\n').trim();
}
export function essayIssueFeedback(result, maxPoints = result?.maxScore) {
  if (!result || Number(result.score)>=Number(maxPoints)-1e-8) return '';
  const issues=(result.breakdown || []).filter(part=>Number(part.points)<Number(part.maxPoints)).map(part=>{
    const reason=sanitizeStudentFeedback(part.reason);
    return reason ? `${part.item ? part.item+': ' : ''}${reason}` : '';
  }).filter(Boolean);
  return issues.length ? issues.join(' ') : sanitizeStudentFeedback(result.feedback);
}
export function setEssayQuestionFeedback(current, questionNum, result, maxPoints) {
  const blocks=sanitizeStudentFeedback(current).split(/(?=^\s*\[?Câu\s+\d+\s*[:(])/m).filter(block=>{
    const match=block.match(/^\s*\[?Câu\s+(\d+)\s*[:(]/);
    return !match || Number(match[1])!==Number(questionNum);
  }).map(block=>block.trim()).filter(Boolean);
  const issue=essayIssueFeedback(result,maxPoints);
  if(issue) blocks.push(`Câu ${questionNum}: ${issue}`);
  return blocks.join('\n\n');
}

export function getEssayFeedbackForQuestion(allFeedback, qNum) {
  if (!allFeedback) return '';
  const sanitized = sanitizeStudentFeedback(allFeedback);
  if (!sanitized) return '';
  const num = Number(qNum);
  const pattern = new RegExp(
    `(?:^|[\\r\\n]+)\\s*\\[?Câu\\s*${num}\\b[^\\]:\\n]*\\]?\\s*[:\\-–]\\s*([\\s\\S]*?)(?=(?:[\\r\\n]+\\s*\\[?Câu\\s*\\d+|[\\r\\n]+\\s*Nhận xét chung|$))`,
    'i'
  );
  const match = sanitized.match(pattern);
  return match && match[1] ? match[1].trim() : '';
}

