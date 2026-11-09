import { questionForLanguage } from '../../shared/questionLanguage.js';
import { useStudentLanguage } from '../StudentLanguage.jsx';
import React from 'react';
import { useStudent } from '../StudentContext.js';
import { essayPresentation } from '../../shared/essayPresentation.js';

// 3. Tự luận (Essay)
export default function EssayQuestion({ currentItem }) {
  const { t, language } = useStudentLanguage();
  const { mode, practiceAnswers, setPracticeAnswers, examAnswers, setExamAnswers, grade, isCalculatorOpen, setIsCalculatorOpen } = useStudent();

  if (!((currentItem.type === 'essay' || currentItem.type === 'exam_essay'))) return null;

  const { stem, subItems } = essayPresentation(questionForLanguage(currentItem.data, language));

  return (
    <div className="essay-workspace">
      <div className="essay-prompt">
      <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
        {stem}
      </p>

      {subItems.length > 0 && (
        <div className="space-y-2.5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200">
          {subItems.map(item => (
            <div key={item.letter} className="text-sm text-slate-800 flex items-start space-x-2 font-semibold">
              <span className="font-black text-indigo-700">{item.letter})</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      </div>
      <div className="essay-editor">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              {t('Phần nhập bài làm của thí sinh:')}
            </label>
            {/* NÚT MỞ MÁY TÍNH CẦM TAY (ĐẶC BIỆT PHỤC VỤ KHỐI 10 TÍNH TOÁN DUNG LƯỢNG) */}
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-sm border ${
                isCalculatorOpen
                  ? 'bg-blue-700 text-white border-blue-800 shadow-blue-700/20'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
              }`}
            >
              <span>🧮</span>
              <span>{t(isCalculatorOpen ? 'Đang mở Máy tính' : 'Mở Máy tính cầm tay')}</span>
              <span className="text-[10px] bg-blue-200/80 text-blue-950 px-1.5 py-0.5 rounded font-black">
                {t(grade === 10 ? 'Tin 10' : 'Tính toán')}
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono-code font-bold">
            {t('Đã nhập:')} {((mode === 'practice' ? practiceAnswers.essay[currentItem.data.num] : examAnswers.essay[currentItem.data.num]) || '').length} {t('ký tự')}
          </span>
        </div>
        <textarea
          rows={5}
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
          placeholder={t('Nhập nội dung giải bài tập, phân tích tình huống của em vào đây...')}
          className="w-full bg-white border-2 border-slate-300 rounded-2xl p-4 text-slate-900 text-base leading-relaxed focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 font-sans shadow-inner"
        ></textarea>
      </div>
    </div>
  );
}
