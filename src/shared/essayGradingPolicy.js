import { essayPresentation } from './essayPresentation.js';
export function isValidEssayScore(value, max = Infinity) {
  if (value === '' || value == null) return false;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= max + 1e-8 && Math.abs(score * 4 - Math.round(score * 4)) < 1e-8;
}
export function essayRubricParts({ question = '', subItems = [], maxPoints = 1 }) {
  const items = subItems.length ? subItems : essayPresentation({ question }).subItems;
  const explicit = items.map(item => {
    const value = item.maxPoints ?? item.points;
    if (value != null) return Number(value);
    const match = String(item.text || '').match(/(\d+(?:[.,]\d+)?)\s*(?:điểm|đ\b|points?)/i);
    return match ? Number(match[1].replace(',', '.')) : null;
  });
  if (items.length) {
    const unknown = explicit.filter(value => value === null).length;
    const remainder = maxPoints - explicit.reduce((sum,value)=>sum+(value ?? 0),0);
    return items.map((item,index)=>({ item: `Ý ${item.letter || String.fromCharCode(97+index)}`, maxPoints: explicit[index] ?? remainder / unknown }));
  }
  const count = maxPoints === 0.75 ? 3 : Math.ceil(maxPoints / 0.5);
  return Array.from({length:count},(_,index)=>({item:`Ý ${String.fromCharCode(97+index)}`,maxPoints:Math.min(maxPoints === 0.75 ? 0.25 : 0.5,maxPoints-(maxPoints === 0.75 ? 0.25 : 0.5)*index)}));
}
export function validateEssayGrade(result, parts, maxPoints) {
  const bad = reason => ({valid:false,error:`Điểm AI không khớp barem: ${reason}. Thầy kiểm tra hoặc chấm lại; hệ thống không tự làm tròn.`});
  if (!isValidEssayScore(result.score,maxPoints)) return bad('tổng điểm phải theo bước 0,25');
  if (!Array.isArray(result.breakdown) || result.breakdown.length !== parts.length) return bad('chưa tách đủ các ý');
  let sum = 0;
  for (let index=0;index<parts.length;index++) {
    const actual=result.breakdown[index],expected=parts[index].maxPoints;
    if (!isValidEssayScore(actual.points,expected) || Number(actual.maxPoints)!==expected) return bad(`${parts[index].item} chỉ nhận các mức từ 0 đến ${expected}, bước 0,25`);
    if (Number(actual.points)<expected && !String(actual.reason || '').trim()) return bad(`${parts[index].item} chưa chỉ rõ lỗi sai/ý thiếu`);
    sum+=Number(actual.points);
  }
  if (Math.abs(sum-Number(result.score))>1e-8 || Math.abs(parts.reduce((sum,part)=>sum+part.maxPoints,0)-maxPoints)>1e-8) return bad('tổng điểm các ý không khớp tổng câu');
  return {valid:true};
}
