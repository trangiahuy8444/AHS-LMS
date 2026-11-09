import { useStudentLanguage } from '../StudentLanguage.jsx';
import React from 'react';
import { useStudent } from '../StudentContext.js';

// MODAL XÁC NHẬN NỘP BÀI THI
export default function SubmitConfirmModal() {
  const { t, language } = useStudentLanguage();
  const { mode, showSubmitModal, setShowSubmitModal, practiceItems, examItems, handleSubmitPractice,
    handleSubmitExam, config, elapsedSeconds, formatElapsed } = useStudent();

  const minExamMinutes = (config?.minExamMinutes !== undefined && config?.minExamMinutes !== null) ? Number(config.minExamMinutes) : 15;
  const remainingEarlyLockSeconds = (mode === 'exam' && config?.preventEarlySubmission !== false)
    ? Math.max(0, (minExamMinutes * 60) - (elapsedSeconds || 0))
    : 0;
  const isEarlyLockActive = remainingEarlyLockSeconds > 0;

  if (!(showSubmitModal)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-200 space-y-4">
        <h3 className="text-xl font-black text-center text-slate-900">
          {t('XÁC NHẬN NỘP BÀI LÀM')}
        </h3>
        {(() => {
          const activeList = mode === 'practice' ? practiceItems : examItems;
          const answeredCount = activeList.filter(item => item.isAnswered).length;
          const total = activeList.length;
          const unans = total - answeredCount;

          return (
            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between font-medium">
                <span>{t('Tổng số câu hỏi:')}</span>
                <strong className="text-slate-900">{total} {t('câu')}</strong>
              </div>
              <div className="flex justify-between font-medium">
                <span>{t('Số câu đã hoàn thành:')}</span>
                <strong className="text-emerald-700 font-bold">{answeredCount} {t('câu')}</strong>
              </div>
              {unans > 0 && (
                <div className="flex justify-between font-medium text-amber-700">
                  <span>{t('Số câu chưa hoàn thành:')}</span>
                  <strong className="text-amber-800 font-bold">{unans} {t('câu')}</strong>
                </div>
              )}
            </div>
          );
        })()}

        {isEarlyLockActive ? (
          <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 font-bold text-center space-y-1">
            <p>{language === 'en' ? `Minimum working time: ${minExamMinutes} minutes.` : `Chưa đủ thời gian làm bài tối thiểu ${minExamMinutes} phút!`}</p>
            <p className="text-[11px] text-amber-800 font-normal">
              {language === 'en' ? 'Time remaining before submission: ' : 'Thời gian cần làm thêm: '}<strong>{formatElapsed(remainingEarlyLockSeconds)}</strong>. {language === 'en' ? 'Please review your answers before submitting.' : 'Em hãy kiểm tra kỹ lại bài làm trước khi nộp.'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center font-medium">
            {t('Em có chắc chắn muốn nộp bài ngay bây giờ để hệ thống chấm điểm và xuất kết quả không?')}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowSubmitModal(false)}
            className="py-3 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-100 transition"
          >
            {t('Quay Lại Làm Tiếp')}
          </button>
          <button
            type="button"
            disabled={isEarlyLockActive}
            onClick={() => {
              if (mode === 'practice') {
                handleSubmitPractice();
              } else {
                handleSubmitExam(false);
              }
            }}
            className={`py-3 rounded-xl text-white font-extrabold text-sm transition shadow-md uppercase tracking-wide ${
              isEarlyLockActive
                ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                : (mode === 'practice' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700')
            }`}
          >
            {isEarlyLockActive ? `${t('Chờ')} ${formatElapsed(remainingEarlyLockSeconds)}` : t('Đồng Ý Nộp Bài')}
          </button>
        </div>
      </div>
    </div>
  );
}
