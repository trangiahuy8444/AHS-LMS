import React from 'react';
import { getStudentGuidance } from '../../shared/studentGuidance.js';

export default function StudentGuidance({ config, mode }) {
  const guidance = getStudentGuidance(config, mode);
  return (
    <section className="w-full rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 sm:p-5" aria-label="Hướng dẫn làm bài">
      <h3 className="text-base sm:text-lg font-extrabold text-blue-950">📌 {guidance.title}</h3>
      <p className="mt-3 whitespace-pre-line break-words text-sm sm:text-base leading-relaxed font-medium text-slate-700">{guidance.body}</p>
    </section>
  );
}
