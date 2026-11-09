import { useStudentLanguage } from '../StudentLanguage.jsx';
import React, { useEffect, useState } from 'react';
import { useStudent } from '../StudentContext.js';

export default function ViolationWarningModal() {
  const { t, language } = useStudentLanguage();
  const { totalViolations, violations, config, mode, showWarningModal, warningMessage, isSessionLocked, handleDismissWarning, examState } = useStudent();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!showWarningModal || isSessionLocked || examState !== 'in_progress') {
      setCountdown(3);
      return;
    }

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleDismissWarning();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarningModal, isSessionLocked, examState]);

  if (!(showWarningModal && !isSessionLocked && examState === 'in_progress')) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <section role="alertdialog" aria-modal="true" aria-labelledby="violation-title" aria-describedby="violation-description" className="bg-white text-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto text-center border-2 border-red-500 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-black">
          ⚠
        </div>
        <h3 id="violation-title" className="text-xl font-extrabold text-red-700">{t('CẢNH BÁO VI PHẠM')}</h3>
        <p id="violation-description" className="text-sm text-slate-700 leading-relaxed">
          {language === 'en' ? `You left the exam interface or exited fullscreen. ${(mode === 'practice' ? config?.lockOnPracticeViolation : config?.lockOnExamViolation !== false) ? `Warning ${violations}/3 in this round; the third violation locks your work.` : 'This is recorded as a warning without locking your work.'}` : warningMessage || 'Em vừa rời giao diện làm bài hoặc thoát toàn màn hình. Hãy quay lại để tiếp tục.'}
        </p>
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 space-y-1">
          <p className="text-xs text-slate-600">{t('Tổng vi phạm đã ghi nhận:')} <strong className="text-red-700">{totalViolations} {t('lần')}</strong></p>
          <p className="text-[11px] text-amber-800 font-bold">⏱️ Thông báo tự đóng sau <strong>{countdown} giây</strong> để em tiếp tục làm bài</p>
        </div>
        <button
          type="button"
          onClick={handleDismissWarning}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition focus-visible:ring-4 focus-visible:ring-red-300 flex items-center justify-center space-x-2 shadow-md active:scale-98"
        >
          <span>{t('QUAY LẠI TOÀN MÀN HÌNH')}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-mono-code font-black">{countdown}s</span>
        </button>
      </section>
    </div>
  );
}
