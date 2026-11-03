import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { StudentContext } from '../src/student/StudentContext.js';
import ResultScreen from '../src/student/screens/ResultScreen.jsx';
import AnswerReview from '../src/student/result/AnswerReview.jsx';

afterEach(cleanup);

describe('Bảo mật xem lại bài thi chính thức & Xác nhận điểm số', () => {
  const baseStudentState = {
    grade: 8,
    mode: 'exam',
    examState: 'submitted',
    fullName: 'Nguyễn Văn A',
    studentClass: '8/19',
    studentId: '111',
    scoreResult: {
      submissionId: 'sub-test-1',
      score: 6.5,
      mcqPoints: 6.5,
      finalScore: 6.5,
      violations: 0,
      durationFormatted: '35 phút',
      submittedAt: new Date().toISOString(),
      scoreConfirmed: false
    },
    config: {
      allowStudentReviewOfficialExam: false
    },
    isCapturing: false,
    handleCaptureScreenshot: vi.fn(),
    handleRestartPractice: vi.fn(),
    handleConfirmScore: vi.fn(),
    practiceAnswers: { mcq: {}, tf: {}, essay: {} },
    examAnswers: { mcq: {}, tf: {}, essay: {} },
    practiceQuestions: [],
    practiceTfQuestions: [],
    practiceEssayQuestions: [],
    currentOfficialExam: {
      code: '101',
      mcqQuestions: [
        { num: 1, question: 'Câu hỏi mẫu 1', options: ['A', 'B', 'C', 'D'] }
      ]
    }
  };

  it('Ẩn chi tiết bài thi và hiển thị thông báo bảo mật khi admin chưa cho phép', () => {
    const value = {
      ...baseStudentState,
      config: { allowStudentReviewOfficialExam: false }
    };

    render(
      <StudentContext.Provider value={value}>
        <ResultScreen />
      </StudentContext.Provider>
    );

    expect(screen.getByText(/Chi Tiết Bài Thi Đang Được Bảo Mật/i)).toBeTruthy();
    expect(screen.getByText(/Trạng thái: Chờ Thầy mở quyền xem lại bài thi/i)).toBeTruthy();
    expect(screen.queryByText(/ĐANG XEM CHI TIẾT BÀI THI/i)).toBeNull();
  });

  it('Hiển thị nút mở xem lại bài thi khi admin đã bật cho phép', () => {
    const value = {
      ...baseStudentState,
      config: { allowStudentReviewOfficialExam: true }
    };

    render(
      <StudentContext.Provider value={value}>
        <ResultScreen />
      </StudentContext.Provider>
    );

    expect(screen.getByText(/Giáo Viên Đã Mở Quyền Xem Lại Bài Thi/i)).toBeTruthy();
    const openBtn = screen.getByText(/Xem Chi Tiết Bài Làm & Chốt Điểm/i);
    expect(openBtn).toBeTruthy();

    // Bấm mở xem lại
    fireEvent.click(openBtn);
    expect(screen.getByText(/ĐANG XEM CHI TIẾT BÀI THI & ĐỐI SOÁT CHỐT ĐIỂM/i)).toBeTruthy();
  });

  it('Hiển thị nút XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC trong AnswerReview khi chưa chốt điểm', () => {
    const handleConfirmScore = vi.fn();
    const value = {
      ...baseStudentState,
      scoreResult: {
        ...baseStudentState.scoreResult,
        scoreConfirmed: false
      },
      handleConfirmScore
    };

    render(
      <StudentContext.Provider value={value}>
        <AnswerReview />
      </StudentContext.Provider>
    );

    const confirmBtn = screen.getByText(/XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC/i);
    expect(confirmBtn).toBeTruthy();

    fireEvent.click(confirmBtn);
    expect(handleConfirmScore).toHaveBeenCalledTimes(1);
  });

  it('Hiển thị huy hiệu ĐÃ XÁC NHẬN CHỐT ĐIỂM khi học sinh đã chốt điểm', () => {
    const value = {
      ...baseStudentState,
      scoreResult: {
        ...baseStudentState.scoreResult,
        scoreConfirmed: true,
        scoreConfirmedAt: '2026-11-03T09:30:00Z'
      }
    };

    render(
      <StudentContext.Provider value={value}>
        <AnswerReview />
      </StudentContext.Provider>
    );

    expect(screen.getByText(/EM ĐÃ XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC/i)).toBeTruthy();
    expect(screen.getByText(/ĐÃ CHỐT ĐIỂM THÀNH CÔNG/i)).toBeTruthy();
    expect(screen.queryByText(/XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC/i)).toBeNull();
  });
});
