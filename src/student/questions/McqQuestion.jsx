import React from 'react';
import { useStudent } from '../StudentContext.js';

// 1. Trắc nghiệm nhiều lựa chọn (MCQ)
export default function McqQuestion({ currentItem }) {
  const { mode, practiceAnswers, setPracticeAnswers, examAnswers, setExamAnswers } = useStudent();

  if (!((currentItem.type === 'mcq' || currentItem.type === 'exam_mcq'))) return null;

  return (
    <div className="space-y-6">
      <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed whitespace-pre-line">
        {currentItem.data.question}
      </p>

      <div className="grid grid-cols-1 gap-3 pt-2">
        {currentItem.data.options.map((opt, optIdx) => {
          const isSelected = mode === 'practice'
            ? practiceAnswers.mcq[currentItem.data.id] === optIdx
            : examAnswers.mcq[currentItem.data.num] === optIdx;
          const letter = ['A', 'B', 'C', 'D'][optIdx];

          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => {
                if (mode === 'practice') {
                  setPracticeAnswers(prev => ({
                    ...prev,
                    mcq: { ...prev.mcq, [currentItem.data.id]: optIdx }
                  }));
                } else {
                  setExamAnswers(prev => ({
                    ...prev,
                    mcq: { ...prev.mcq, [currentItem.data.num]: optIdx }
                  }));
                }
              }}
              className={`w-full p-4 rounded-2xl border-2 text-left flex items-start space-x-3.5 transition transform active:scale-[0.99] ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 text-slate-800 font-semibold'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {letter}
              </span>
              <span className="text-sm sm:text-base leading-relaxed pt-1.5 font-semibold">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
