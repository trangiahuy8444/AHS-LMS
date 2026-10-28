import React from 'react';
import { useStudent } from '../StudentContext.js';

// MODAL XÁC NHẬN NỘP BÀI THI
export default function SubmitConfirmModal() {
  const { mode, showSubmitModal, setShowSubmitModal, practiceItems, examItems, handleSubmitPractice,
    handleSubmitExam } = useStudent();

  if (!(showSubmitModal)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-200 space-y-4">
        <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl mx-auto flex items-center justify-center text-2xl">
          📝
        </div>
        <h3 className="text-xl font-black text-center text-slate-900">
          XÁC NHẬN NỘP BÀI LÀM
        </h3>
        {(() => {
          const activeList = mode === 'practice' ? practiceItems : examItems;
          const answeredCount = activeList.filter(item => item.isAnswered).length;
          const total = activeList.length;
          const unans = total - answeredCount;

          return (
            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between font-medium">
                <span>Tổng số câu hỏi:</span>
                <strong className="text-slate-900">{total} câu</strong>
              </div>
              <div className="flex justify-between font-medium">
                <span>Số câu đã hoàn thành:</span>
                <strong className="text-emerald-700 font-bold">{answeredCount} câu</strong>
              </div>
              {unans > 0 && (
                <div className="flex justify-between font-medium text-amber-700">
                  <span>Số câu chưa hoàn thành:</span>
                  <strong className="text-amber-800 font-bold">{unans} câu</strong>
                </div>
              )}
            </div>
          );
        })()}

        <p className="text-xs text-slate-500 text-center font-medium">
          Em có chắc chắn muốn nộp bài ngay bây giờ để hệ thống chấm điểm và xuất kết quả không?
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowSubmitModal(false)}
            className="py-3 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-100 transition"
          >
            Quay Lại Làm Tiếp
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === 'practice') {
                handleSubmitPractice();
              } else {
                handleSubmitExam(false);
              }
            }}
            className={`py-3 rounded-xl text-white font-extrabold text-sm transition shadow-md uppercase tracking-wide ${
              mode === 'practice' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Đồng Ý Nộp Bài
          </button>
        </div>
      </div>
    </div>
  );
}
