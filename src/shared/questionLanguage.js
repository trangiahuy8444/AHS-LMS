// Chỉ thay nội dung hiển thị; giữ nguyên số câu, thứ tự phương án, đáp án và khóa chấm.
export function hasEnglishQuestion(question) {
  const en = question?.translations?.en;
  if (!en || typeof en !== 'object') return false;
  for (const key of ['question','context','text']) if (typeof question[key] === 'string' && typeof en[key] !== 'string') return false;
  if (question.options && (!Array.isArray(en.options) || en.options.length !== question.options.length || en.options.some(text => typeof text !== 'string'))) return false;
  for (const key of ['subQuestions','subItems']) {
    if (question[key]?.length && (!Array.isArray(en[key]) || question[key].some(item => !en[key].some(translated => translated.letter === item.letter && typeof translated.text === 'string')))) return false;
  }
  return true;
}
export function questionForLanguage(question, language) {
  if (language !== 'en' || !hasEnglishQuestion(question)) return question;
  const en = question.translations.en;
  const result = { ...question };
  for (const key of ['question','context','text']) if (typeof en[key] === 'string') result[key] = en[key];
  if (question.options) result.options = en.options;
  for (const key of ['subQuestions','subItems']) if (question[key]) result[key] = question[key].map(item => ({...item,text:en[key].find(translated=>translated.letter===item.letter).text}));
  return result;
}
