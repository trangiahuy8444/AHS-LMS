import { useStudentLanguage } from '../StudentLanguage.jsx';
import React, { useEffect, useState } from 'react';
import { useStudent } from '../StudentContext.js';
import { useTeacherReminder } from '../../shared/useTeacherReminder.js';

export default function TeacherReminderBanner() {
  const { t } = useStudentLanguage();
  const student = useStudent();
  const reminder = useTeacherReminder(student, student.examState === 'in_progress');
  const [visible, setVisible] = useState(false);
  const { id, count, message, createdAt } = reminder || {};
  useEffect(() => {
    if (!message) { setVisible(false); return; }
    const remaining = createdAt ? Math.min(10000, Math.max(0, Number(createdAt) + 10000 - Date.now())) : 10000;
    setVisible(remaining > 0);
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [id, count, message, createdAt]);
  if (!visible) return null;
  return (
    <section aria-live="polite" role="status" className="student-reminder" key={id || count}>
      <p className="font-bold">{t('Nhắc nhở của giáo viên')} · {t('Lần')} {count}</p>
      <p className="whitespace-pre-line break-words">{message}</p>
    </section>
  );
}
