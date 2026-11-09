import { useStudentLanguage } from '../StudentLanguage.jsx';
import React from 'react';
import { getStudentGuidance, getExamDurationMinutes } from '../../shared/studentGuidance.js';

export default function StudentGuidance({ config, mode, compact = false }) {
  const { t } = useStudentLanguage();
  const guidance = getStudentGuidance(config, mode);
  const content = (
    <section className="w-full rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 sm:p-5" aria-label="Hướng dẫn làm bài">
      <h3 className="text-base sm:text-lg font-extrabold text-blue-950">{t(guidance.title)}</h3>
      {mode === 'exam' && <p className="mt-2 text-sm sm:text-base font-bold text-blue-900">{t('Thời gian làm bài')}: {getExamDurationMinutes(config)} {t('phút')}</p>}
      <p className="mt-3 whitespace-pre-line break-words text-sm sm:text-base leading-relaxed font-medium text-slate-700">{t(guidance.body)}</p>
    </section>
  );
  if (!compact) return content;
  return <details className="exam-guidance"><summary>{t('Nội quy & hướng dẫn')}</summary><div>{content}</div></details>;
}
