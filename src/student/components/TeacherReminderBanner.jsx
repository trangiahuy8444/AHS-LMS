import { useStudentLanguage } from '../StudentLanguage.jsx';
import React, { useEffect, useState } from 'react';
import { useStudent } from '../StudentContext.js';
import { useTeacherReminder } from '../../shared/useTeacherReminder.js';

export default function TeacherReminderBanner() {
  const { t, language } = useStudentLanguage();
  const student = useStudent();
  const reminder = useTeacherReminder(student, student?.examState === 'in_progress');
  const [visible, setVisible] = useState(false);
  const { id, count, message, createdAt } = reminder || {};

  const durationSeconds = Number(student?.config?.reminderDurationSeconds) || 5;
  const durationMs = durationSeconds * 1000;

  useEffect(() => {
    if (!message) { setVisible(false); return; }
    const clock = window.AsianSchoolTimer;
    const now = Number.isFinite(clock?.clockAnchorMs) && typeof clock.now === 'function' ? clock.now() : Date.now();
    const remaining = createdAt ? Math.min(durationMs, Math.max(0, Number(createdAt) + durationMs - now)) : durationMs;
    setVisible(remaining > 0);
    const timer = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timer);
  }, [id, count, message, createdAt, durationMs]);

  if (!message || student?.examState !== 'in_progress') return null;
  if (!visible) return <p role="status" className="student-reminder-history">{t('Giáo viên đã nhắc')} <strong>{count}</strong> {t('lần')}. {t('Em cần nghiêm túc làm bài.')}</p>;

  const autoHideNotice = language === 'en'
    ? `This notice closes automatically after ${durationSeconds} seconds.`
    : `Thông báo tự ẩn sau ${durationSeconds} giây.`;

  return (
    <section aria-live="assertive" aria-atomic="true" role="alert" className="student-reminder" key={id || count}>
      <div className="student-reminder-heading"><h2>{t('Nhắc nhở vi phạm của giáo viên')} <span>· {t('Lần')} {count}</span></h2></div>
      <p className="student-reminder-recipient">{student.fullName} <span>· {t('Lớp')} {student.studentClass} · {t('Mã LMS')}: {student.studentId}</span></p>
      <p className="student-reminder-message">{message}</p>
      <p className="student-reminder-instruction">{t('Em cần nghiêm túc làm bài.')} {autoHideNotice}</p>
    </section>
  );
}
