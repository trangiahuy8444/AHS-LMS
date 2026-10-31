import React from 'react';
import { useStudent } from '../StudentContext.js';

// 3. Tự luận (Essay)
export default function EssayQuestion({ currentItem }) {
  const { mode, practiceAnswers, setPracticeAnswers, examAnswers, setExamAnswers } = useStudent();

  if (!((currentItem.type === 'essay' || currentItem.type === 'exam_essay'))) return null;

  return (
    <div className="space-y-5">
      <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
        {currentItem.data.context || currentItem.data.question}
      </p>

      {currentItem.data.subItems && currentItem.data.subItems.length > 0 && (
        <div className="space-y-2.5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
          {currentItem.data.subItems.map(item => (
            <div key={item.letter} className="text-sm text-slate-800 flex items-start space-x-2 font-semibold">
              <span className="font-black text-indigo-700">{item.letter})</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            Phần nhập bài làm của thí sinh:
          </label>
          <span className="text-xs text-slate-500 font-mono-code font-bold">
            Đã nhập: {((mode === 'practice' ? practiceAnswers.essay[currentItem.data.num] : examAnswers.essay[currentItem.data.num]) || '').length} ký tự
          </span>
        </div>
        <textarea
          rows={8}
          value={
            mode === 'practice'
              ? (practiceAnswers.essay[currentItem.data.num] || '')
              : (examAnswers.essay[currentItem.data.num] || '')
          }
          onChange={e => {
            const val = e.target.value;
            if (mode === 'practice') {
              setPracticeAnswers(prev => ({
                ...prev,
                essay: { ...prev.essay, [currentItem.data.num]: val }
              }));
            } else {
              setExamAnswers(prev => ({
                ...prev,
                essay: { ...prev.essay, [currentItem.data.num]: val }
              }));
            }
          }}
          placeholder="Nhập nội dung giải bài tập, phân tích tình huống của em vào đây..."
          className="w-full bg-white border-2 border-slate-300 rounded-2xl p-4 text-slate-900 text-base leading-relaxed focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 font-sans shadow-inner"
        ></textarea>
      </div>
    </div>
  );
}
