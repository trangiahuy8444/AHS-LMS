import { useStudentLanguage } from '../StudentLanguage.jsx';
import React from 'react';
import { useStudent } from '../StudentContext.js';
import TeacherReminderBanner from './TeacherReminderBanner.jsx';

export default function LockScreen() {
  const { t } = useStudentLanguage();
  const { isSessionLocked, isProctorUnlocked, lockReason, handleStudentResumeFromLock, examState } = useStudent();
  if (!(isSessionLocked && examState === 'in_progress')) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="lock-title" className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white border-2 border-red-500 rounded-2xl p-5 sm:p-6 text-center shadow-2xl space-y-4">
        <h2 id="lock-title" className={`text-xl font-extrabold ${isProctorUnlocked ? 'text-emerald-700' : 'text-red-700'}`}>
          {t(isProctorUnlocked ? 'ĐÃ DUYỆT MỞ KHÓA' : 'BÀI THI BỊ TẠM THỜI KHÓA')}
        </h2>
        {isProctorUnlocked ? (
          <p className="text-sm text-slate-700 leading-relaxed">{t('Giáo viên đã mở khóa. Bấm nút dưới để trở lại toàn màn hình và tiếp tục làm bài.')}</p>
        ) : (
          <>
            <p className="text-sm text-slate-700 leading-relaxed">
              {t(lockReason === 'violation_3_times' ? 'Bài làm đã khóa sau 3 lần rời giao diện hoặc thoát toàn màn hình.' : 'Giám thị đã tạm khóa bài làm.')}
              {' '}{t('Em hãy giữ màn hình này và báo giám thị để được mở khóa.')}
            </p>
            <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">{t('ĐANG CHỜ GIÁO VIÊN DUYỆT MỞ KHÓA')}</p>
          </>
        )}
        <TeacherReminderBanner />
        {isProctorUnlocked && (
          <button type="button" onClick={handleStudentResumeFromLock} className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition focus-visible:ring-4 focus-visible:ring-emerald-300">
            {t('VÀO LẠI TOÀN MÀN HÌNH')}
          </button>
        )}
      </section>
    </div>
  );
}
