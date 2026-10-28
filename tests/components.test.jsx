// @vitest-environment jsdom
import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import TrueFalseQuestion from '../src/student/questions/TrueFalseQuestion.jsx';
import ResultScreen from '../src/student/screens/ResultScreen.jsx';
import ConfirmDialog from '../src/shared/components/ConfirmDialog.jsx';

afterEach(cleanup);

const tfItem = {
  type: 'exam_tf',
  data: {
    num: 1,
    context: 'Bạn An nhận email lạ có tệp Phanthuong.exe.',
    subQuestions: [
      { letter: 'a', text: 'Nên mở tệp ngay.' },
      { letter: 'b', text: 'Nên báo thầy cô.' },
      { letter: 'c', text: 'Nên quét virus trước.' },
      { letter: 'd', text: 'Nên chuyển tiếp cho bạn bè.' }
    ]
  }
};

// Bọc component bằng context có state thật cho phần bài làm
function WithStudent({ mode = 'exam', extra = {}, children, onAnswers }) {
  const [examAnswers, setExamAnswersRaw] = useState({ mcq: {}, tf: {}, essay: {} });
  const [practiceAnswers, setPracticeAnswersRaw] = useState({ mcq: {}, tf: {}, essay: {} });
  const wrap = (set) => (fn) => set(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; onAnswers && onAnswers(next); return next; });
  const value = {
    mode, examAnswers, practiceAnswers,
    setExamAnswers: wrap(setExamAnswersRaw), setPracticeAnswers: wrap(setPracticeAnswersRaw),
    ...extra
  };
  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

describe('TrueFalseQuestion', () => {
  it('hiện ngữ cảnh và 4 ý a–d, ghi đúng câu trả lời Đúng/Sai vào bài thi', () => {
    let latest;
    render(<WithStudent onAnswers={a => { latest = a; }}><TrueFalseQuestion currentItem={tfItem} /></WithStudent>);
    expect(screen.getByText(/Phanthuong\.exe/)).toBeTruthy();
    expect(screen.getAllByText('✓ ĐÚNG')).toHaveLength(4);
    fireEvent.click(screen.getAllByText('✓ ĐÚNG')[1]);
    fireEvent.click(screen.getAllByText('✕ SAI')[0]);
    expect(latest.tf[1]).toEqual({ b: true, a: false });
  });

  it('không hiện gì với câu không phải Đúng/Sai', () => {
    const { container } = render(<WithStudent><TrueFalseQuestion currentItem={{ ...tfItem, type: 'exam_mcq' }} /></WithStudent>);
    expect(container.innerHTML).toBe('');
  });

  it('chế độ ôn tập ghi vào practiceAnswers', () => {
    let latest;
    render(<WithStudent mode="practice" onAnswers={a => { latest = a; }}><TrueFalseQuestion currentItem={{ ...tfItem, type: 'tf' }} /></WithStudent>);
    fireEvent.click(screen.getAllByText('✓ ĐÚNG')[3]);
    expect(latest.tf[1]).toEqual({ d: true });
  });
});

describe('ResultScreen — bài thi chính thức (chờ giáo viên chấm)', () => {
  const examResult = {
    mode: 'exam', pendingGrading: true, examCode: '102', violations: 3, penaltyPoints: 0,
    durationFormatted: '40 phút 05 giây', submittedAt: '2026-10-28T09:00:00.000Z'
  };
  const extra = {
    examState: 'submitted', scoreResult: examResult, isCapturing: false,
    handleCaptureScreenshot: vi.fn(), handleRestartPractice: vi.fn(),
    fullName: 'Học Sinh Thử', studentClass: '9/20', studentId: 'HS01', grade: 9,
    practiceQuestions: [], practiceTfQuestions: [], practiceEssayQuestions: [], currentOfficialExam: null
  };

  it('báo đã nộp, không hiện điểm, có mã đề và ghi nhận vi phạm (không trừ điểm)', () => {
    render(<WithStudent extra={extra}><ResultScreen /></WithStudent>);
    expect(screen.getByText(/ĐÃ NỘP BÀI THÀNH CÔNG/)).toBeTruthy();
    expect(screen.getByText(/Mã đề 102/)).toBeTruthy();
    expect(screen.getByText(/Vi phạm 3 lần: bài đã bị khóa/)).toBeTruthy();
    expect(screen.queryByText(/[Tt]rừ 5 điểm/)).toBeNull();
    expect(screen.queryByText(/ĐIỂM ĐẠT ĐƯỢC/)).toBeNull();
    expect(screen.queryByText(/\/ 10/)).toBeNull();
  });

  it('chưa nộp thì không hiện màn hình kết quả', () => {
    const { container } = render(<WithStudent extra={{ ...extra, examState: 'in_progress' }}><ResultScreen /></WithStudent>);
    expect(container.innerHTML).toBe('');
  });
});

describe('ConfirmDialog dùng chung', () => {
  it('không có hộp thoại thì không hiện gì', () => {
    const { container } = render(<ConfirmDialog dialog={null} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('thông báo: nút ĐÃ HIỂU đóng hộp thoại', () => {
    const onClose = vi.fn();
    render(<ConfirmDialog dialog={{ title: 'Thông báo', message: 'Nội dung', type: 'info' }} onClose={onClose} variant="student" />);
    fireEvent.click(screen.getByText('ĐÃ HIỂU'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('xác nhận: đóng rồi mới chạy hành động; Hủy bỏ không chạy', () => {
    const calls = [];
    const onClose = () => calls.push('close');
    const onConfirm = () => calls.push('confirm');
    render(<ConfirmDialog dialog={{ title: 'Xóa?', message: 'Chắc chắn?', type: 'warning', onConfirm }} onClose={onClose} />);
    fireEvent.click(screen.getByText('Hủy bỏ'));
    fireEvent.click(screen.getByText('Xác nhận'));
    expect(calls).toEqual(['close', 'close', 'confirm']);
  });

  it('giữ màu riêng của từng cổng', () => {
    const d = { title: 'T', message: 'M', type: 'error' };
    const { container, rerender } = render(<ConfirmDialog dialog={d} onClose={() => {}} variant="student" />);
    expect(container.innerHTML).toContain('bg-rose-100');
    expect(container.innerHTML).toContain('bg-slate-900/60');
    rerender(<ConfirmDialog dialog={d} onClose={() => {}} variant="admin" />);
    expect(container.innerHTML).toContain('bg-rose-50');
    expect(container.innerHTML).toContain('text-blue-950');
  });
});
