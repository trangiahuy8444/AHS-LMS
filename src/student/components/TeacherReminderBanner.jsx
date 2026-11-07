import React from 'react';
import { useStudent } from '../StudentContext.js';
import { useTeacherReminder } from '../../shared/useTeacherReminder.js';

export default function TeacherReminderBanner() {
  const student = useStudent();
  const reminder = useTeacherReminder(student, student.examState === 'in_progress');
  if (!reminder) return null;
  return (
    <section aria-live="polite" className="w-full rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 sm:p-5">
      <h3 className="text-base font-extrabold text-amber-950">Nhắc nhở của giáo viên · Lần {reminder.count}</h3>
      <p className="mt-2 whitespace-pre-line break-words text-base leading-relaxed text-amber-950">{reminder.message}</p>
    </section>
  );
}
