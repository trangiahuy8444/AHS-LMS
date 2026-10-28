import React from 'react';
import { useStudent } from '../StudentContext.js';

// 2. Trắc nghiệm Đúng / Sai (Khối 10)
export default function TrueFalseQuestion({ currentItem }) {
  const { mode, practiceAnswers, setPracticeAnswers, examAnswers, setExamAnswers } = useStudent();

  if (!((currentItem.type === 'tf' || currentItem.type === 'exam_tf'))) return null;

  return (
    <div className="space-y-5">
      <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-2xl text-purple-950 text-sm font-bold">
        💡 <strong>Yêu cầu:</strong> Đọc kĩ đoạn ngữ cảnh/tình huống dưới đây. Trong mỗi ý a), b), c), d), hãy chọn <strong>ĐÚNG</strong> hoặc <strong>SAI</strong>.
      </div>

      <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
        {currentItem.data.context}
      </p>

      <div className="space-y-3 pt-2">
        {currentItem.data.subQuestions.map((sub) => {
          const currVal = mode === 'practice'
            ? practiceAnswers.tf[currentItem.data.num]?.[sub.letter]
            : examAnswers.tf[currentItem.data.num]?.[sub.letter];

          return (
            <div
              key={sub.letter}
              className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                currVal !== undefined
                  ? 'bg-blue-50/50 border-blue-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="font-black text-purple-700 text-base uppercase shrink-0">
                  {sub.letter})
                </span>
                <span className="text-sm sm:text-base text-slate-800 leading-relaxed font-semibold">
                  {sub.text}
                </span>
              </div>

              <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'practice') {
                      setPracticeAnswers(prev => ({
                        ...prev,
                        tf: {
                          ...prev.tf,
                          [currentItem.data.num]: {
                            ...(prev.tf[currentItem.data.num] || {}),
                            [sub.letter]: true
                          }
                        }
                      }));
                    } else {
                      setExamAnswers(prev => ({
                        ...prev,
                        tf: {
                          ...prev.tf,
                          [currentItem.data.num]: {
                            ...(prev.tf[currentItem.data.num] || {}),
                            [sub.letter]: true
                          }
                        }
                      }));
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition border-2 ${
                    currVal === true
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ✓ ĐÚNG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'practice') {
                      setPracticeAnswers(prev => ({
                        ...prev,
                        tf: {
                          ...prev.tf,
                          [currentItem.data.num]: {
                            ...(prev.tf[currentItem.data.num] || {}),
                            [sub.letter]: false
                          }
                        }
                      }));
                    } else {
                      setExamAnswers(prev => ({
                        ...prev,
                        tf: {
                          ...prev.tf,
                          [currentItem.data.num]: {
                            ...(prev.tf[currentItem.data.num] || {}),
                            [sub.letter]: false
                          }
                        }
                      }));
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition border-2 ${
                    currVal === false
                      ? 'bg-rose-600 border-rose-500 text-white shadow-md ring-2 ring-rose-500/30'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ✕ SAI
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
