import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAdmin } from '../AdminContext.js';

export default function AnswersTab() {
  const { answerGrade, setAnswerGrade, answerType, setAnswerType, currentAnswerData } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Khối lớp:</span>
          {[8, 9, 10].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setAnswerGrade(g)}
              className={`px-4 py-2 rounded-xl font-black text-xs transition ${
                answerGrade === g
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Khối {g}
            </button>
          ))}

          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-4">Bộ đề:</span>
          <select
            value={answerType}
            onChange={e => setAnswerType(e.target.value)}
            className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-600"
          >
            <option value="practice">Đề Cương Ôn Tập (Đầy Đủ)</option>
            <option value="101">Đề Thi Chính Thức — Mã Đề 101</option>
            <option value="102">Đề Thi Chính Thức — Mã Đề 102</option>
            <option value="103">Đề Thi Chính Thức — Mã Đề 103</option>
            <option value="104">Đề Thi Chính Thức — Mã Đề 104</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <span>🖨️</span>
          <span>In Đáp Án</span>
        </button>
      </div>

      {/* BẢNG ĐÁP ÁN MASTER */}
      {(() => {
        const isPractice = answerType === 'practice';
        let mcqList = [];
        let tfList = [];
        let essayList = [];

        if (isPractice) {
          mcqList = currentAnswerData?.practiceQuestions || [];
          tfList = currentAnswerData?.practiceTfQuestions || [];
          essayList = currentAnswerData?.practiceEssayQuestions || [];
        } else {
          const exam = currentAnswerData?.officialExams?.[answerType];
          if (answerGrade === 8 || answerGrade === 9) {
            mcqList = exam?.mcqQuestions || [];
            essayList = exam?.essayQuestions || [];
          } else {
            mcqList = exam?.part1_mcq || [];
            tfList = exam?.part2_tf || [];
            essayList = exam?.part3_essay || [];
          }
        }

        const letterMap = ['A', 'B', 'C', 'D'];

        return (
          <div className="space-y-6">
            
            {/* BẢNG MA TRẬN NHANH */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider">
                  PHẦN I: MA TRẬN ĐÁP ÁN TRẮC NGHIỆM ({mcqList.length} CÂU)
                </h3>
                <span className="text-xs text-slate-500 font-medium">Tin Học {answerGrade} — {isPractice ? 'Đề Cương' : `Mã Đề ${answerType}`}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {mcqList.map((q, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block font-semibold">Câu {idx + 1}</span>
                    <strong className="text-base font-black text-emerald-600 font-mono-code">
                      {letterMap[q.correctAnswer]}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* CHI TIẾT TỪNG CÂU VỚI ĐỦ 4 PHƯƠNG ÁN A, B, C, D */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
              <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3">
                CHI TIẾT TỪNG CÂU HỎI TRẮC NGHIỆM VỚI 4 PHƯƠNG ÁN A, B, C, D
              </h3>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {mcqList.map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 uppercase">
                        Câu {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                        Đáp án đúng: {letterMap[q.correctAnswer]}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm leading-relaxed">
                      {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((optText, optIdx) => {
                        const isCorrect = optIdx === q.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400/50'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {letterMap[optIdx]}
                            </span>
                            <span className="leading-snug">{optText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ĐÁP ÁN ĐÚNG / SAI (KHỐI 10) */}
            {tfList.length > 0 && (
              <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
                <h3 className="font-black text-sm text-purple-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  PHẦN II: ĐÁP ÁN ĐÚNG / SAI ({tfList.length} CÂU)
                </h3>

                <div className="space-y-4">
                  {tfList.map((tf, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-purple-900 uppercase">Câu {tf.num} (Đúng / Sai)</span>
                      <p className="text-slate-800 font-medium whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200">
                        {tf.context}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {tf.subQuestions.map(sub => (
                          <div key={sub.letter} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                            <span className="text-slate-700"><strong>{sub.letter})</strong> {sub.text}</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                              sub.correctAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {sub.correctAnswer ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HƯỚNG DẪN TRẢ LỜI & RUBRIC TỰ LUẬN */}
            {essayList.length > 0 && (
              <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 space-y-4 shadow-sm">
                <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3">
                  PHẦN TỰ LUẬN & THANG ĐIỂM RUBRIC CHUẨN ASIAN SCHOOL
                </h3>

                <div className="space-y-5">
                  {essayList.map((eq, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-blue-900 uppercase">
                          Câu {eq.num} (Tự luận) {eq.pointsText && `— ${eq.pointsText}`}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-200">
                          Rubric LMS
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
                        {eq.context || eq.question}
                      </p>
                      {eq.subItems && eq.subItems.length > 0 && (
                        <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                          <span className="font-bold text-blue-900 text-[11px] block uppercase">
                            Danh sách câu hỏi con:
                          </span>
                          {eq.subItems.map(item => (
                            <div key={item.letter} className="flex items-start space-x-2 text-slate-700">
                              <span className="font-black text-blue-700 shrink-0">Ý {item.letter})</span>
                              <span className="leading-relaxed">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                        <span className="font-black text-emerald-800 uppercase text-[11px] block">
                          ✓ Hướng Dẫn Trả Lời & Biểu Điểm:
                        </span>
                        <p className="text-emerald-900 whitespace-pre-line leading-relaxed font-sans">
                          {eq.modelAnswer || 'Chưa cập nhật hướng dẫn trả lời cho câu này.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        );
      })()}

    </div>
  );
}
