import { useStudentLanguage } from '../StudentLanguage.jsx';
import React, { useEffect, useState } from 'react';
import { useStudent } from '../StudentContext.js';
import { useTeacherReminder } from '../../shared/useTeacherReminder.js';

const REMINDER_DURATION_MS = 15000;
export default function TeacherReminderBanner() {
  const { t } = useStudentLanguage();
  const student = useStudent();
  const reminder = useTeacherReminder(student, student.examState === 'in_progress');
  const [visible, setVisible] = useState(false);
  const { id, count, message, createdAt } = reminder || {};
  useEffect(() => {
    if (!message) { setVisible(false); return; }
    const clock = window.AsianSchoolTimer;
    const now = Number.isFinite(clock?.clockAnchorMs) && typeof clock.now === 'function' ? clock.now() : Date.now();
    const remaining = createdAt ? Math.min(REMINDER_DURATION_MS, Math.max(0, Number(createdAt) + REMINDER_DURATION_MS - now)) : REMINDER_DURATION_MS;
    setVisible(remaining > 0);
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [id, count, message, createdAt]);
  if (!message || student.examState !== 'in_progress') return null;
  if (!visible) return <p role="status" className="student-reminder-history"><span aria-hidden="true">⚠</span> {t('Giáo viên đã nhắc')} <strong>{count}</strong> {t('lần')}. {t('Em cần nghiêm túc làm bài.')}</p>;
  return (
    <section aria-live="assertive" aria-atomic="true" role="alert" className="student-reminder" key={id || count}>
      <div className="student-reminder-heading"><span aria-hidden="true">⚠</span><h2>{t('Nhắc nhở vi phạm của giáo viên')} <span>· {t('Lần')} {count}</span></h2></div>
      <p className="student-reminder-recipient">{student.fullName} <span>· {t('Lớp')} {student.studentClass} · {t('Mã LMS')}: {student.studentId}</span></p>
      <p className="student-reminder-message">{message}</p>
      <p className="student-reminder-instruction">{t('Em cần nghiêm túc làm bài.')} {t('Thông báo tự ẩn sau 15 giây.')}</p>
    </section>
  );
}
