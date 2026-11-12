export const RECOVERED_ASSESSMENT_KIND = 'practice-821-20261111';
export function isRecoveredAssessment(sub) {
  const meta = sub?.recoveryAssessment;
  return Number(sub?.grade) === 8 && sub?.studentClass === '8/21' && sub?.examCode === 'RECOVERY821'
    && meta?.kind === RECOVERED_ASSESSMENT_KIND
    && Number.isFinite(meta.mcqScore) && meta.mcqScore >= 0 && meta.mcqScore <= 7;
}
export function getRecoveredEssayQuestions(sub) {
  if (!isRecoveredAssessment(sub) || !Array.isArray(sub.recoveryAssessment.essayQuestions)) return [];
  const rows = sub.recoveryAssessment.essayQuestions;
  if (rows.length !== 3 || new Set(rows.map(q => Number(q?.num))).size !== 3
    || rows.some(q => !q || ![1, 2, 3].includes(Number(q.num)))) return [];
  return rows.map(q => ({ ...q, num: Number(q.num), points: 1, pointsText: '1,0 điểm' }));
}
export function getRecoveredExam(sub) {
  if (!isRecoveredAssessment(sub)) return null;
  return { code: 'RECOVERY821', title: 'Bài đánh giá phục hồi lớp 8/21', mcqQuestions: [], part1_mcq: [], part2_tf: [], essayQuestions: getRecoveredEssayQuestions(sub), maxScore: 10, recoveredAssessment: true };
}
