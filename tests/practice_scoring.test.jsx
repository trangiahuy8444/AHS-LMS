// @vitest-environment jsdom
// Ôn tập đề cương: 3 câu tự luận KHÔNG tính điểm và không bắt buộc làm (mọi khối).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPracticeSubmitActions } from '../src/student/actions/practiceSubmitActions.js';

const mcq = Array.from({ length: 28 }, (_, i) => ({ id: i + 1, correctAnswer: 0 }));
const essays = [{ num: 1 }, { num: 2 }, { num: 3 }];
const tf = [1, 2, 3].map(num => ({ num, subQuestions: ['a', 'b', 'c', 'd'].map(letter => ({ letter, correctAnswer: true })) }));

beforeEach(() => {
  window.AsianSchoolAntiCheat = { setSubmitting: vi.fn(), stop: vi.fn(), exitFullscreen: vi.fn() };
  window.AsianSchoolTimer = { stop: vi.fn() };
  window.AsianSchoolStorage = { saveSubmission: vi.fn(d => ({ ...d, attemptNumber: 1 })), updateLiveSession: vi.fn() };
});

function run(grade, answers, config = {}) {
  let result = null;
  const dialogs = [];
  const s = {
    grade, mode: 'practice', sessionId: 's', fullName: 'A', studentClass: grade + '/1', studentId: 'HS1',
    setExamState: () => {}, setShowSubmitModal: () => {}, practiceAnswers: answers, totalViolations: 0,
    setScoreResult: r => { result = r; }, showDialog: (...a) => dialogs.push(a), examStartTime: Date.now(),
    config, practiceQuestions: mcq, practiceTfQuestions: grade === 10 ? tf : [], practiceEssayQuestions: essays
  };
  createPracticeSubmitActions(s).handleSubmitPractice();
  return { result, dialogs };
}

const allRight = { mcq: Object.fromEntries(mcq.map(q => [q.id, 0])), tf: {}, essay: {} };

describe('Điểm ôn tập không tính tự luận', () => {
  for (const grade of [8, 9]) {
    it(`Khối ${grade}: đúng hết 28 câu TN = 7.0 điểm (thang điểm 7), viết hay không viết tự luận không đổi điểm`, () => {
      const noEssay = run(grade, allRight).result;
      const withEssay = run(grade, { ...allRight, essay: { 1: 'bài làm', 2: 'bài làm', 3: 'bài làm' } }).result;
      expect(noEssay.score).toBe(7);
      expect(noEssay.maxScore).toBe(7);
      expect(withEssay.score).toBe(noEssay.score);
    });
  }

  it('Khối 10: đúng hết TN + Đ/S = 7.75 điểm (thang điểm 7.75), tự luận không đổi điểm', () => {
    const tfAll = Object.fromEntries(tf.map(q => [q.num, { a: true, b: true, c: true, d: true }]));
    const mcq19 = mcq.slice(0, 19);
    const ans = { mcq: Object.fromEntries(mcq19.map(q => [q.id, 0])), tf: tfAll, essay: {} };
    const r1 = run(10, ans).result;
    const r2 = run(10, { ...ans, essay: { 1: 'x', 2: 'y', 3: 'z' } }).result;
    expect(r1.score).toBe(7.75);
    expect(r1.maxScore).toBe(7.75);
    expect(r2.score).toBe(r1.score);
  });

  it('Bật "bắt buộc làm hết câu": thiếu tự luận vẫn nộp được', () => {
    const { result, dialogs } = run(8, allRight, { requireAllQuestionsAnswered: true });
    expect(dialogs.filter(d => /Chưa Hoàn Thành/.test(d[0]))).toHaveLength(0);
    expect(result).not.toBeNull();
  });

  it('Bật "bắt buộc làm hết câu": thiếu trắc nghiệm thì vẫn chặn', () => {
    const { result, dialogs } = run(8, { mcq: {}, tf: {}, essay: {} }, { requireAllQuestionsAnswered: true });
    expect(dialogs.some(d => /Chưa Hoàn Thành/.test(d[0]))).toBe(true);
    expect(result).toBeNull();
  });
});
