import React from 'react';
import { useStudent } from '../StudentContext.js';

// CỘT PHẢI (1 CỘT): SIDEBAR DANH SÁCH CÂU HỎI & NỘP BÀI (TRẮNG SÁNG, NỔI BẬT)
export default function QuestionSidebar() {
  const { mode, assignedCode, activeQuestionIdx, setActiveQuestionIdx, setShowSubmitModal,
    timeLeftStr, examStartTime, elapsedSeconds, formatElapsed, config, practiceItems, examItems } = useStudent();

  return (
    <div className="lg:col-span-1" id="question-palette-sidebar">
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl sticky top-20 space-y-4 shadow-lg">
      
        {/* WIDGET ĐỒNG HỒ THỜI GIAN TRỰC TIẾP TRÊN BẢNG BÀI LÀM */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/60 border-2 border-blue-200 rounded-2xl p-3.5 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{mode === 'exam' ? 'Thời gian còn lại' : (config.practiceDurationMinutes > 0 ? 'Thời gian còn lại' : 'Thời gian làm bài')}</span>
            <span className="text-blue-900 font-extrabold">{mode === 'exam' ? 'Phòng thi' : 'Ôn tập'}</span>
          </div>
          <div className="text-2xl font-black font-mono-code text-red-600 flex items-center space-x-2">
            <span>⏱️</span>
            <span>{mode === 'exam' ? timeLeftStr : (config.practiceDurationMinutes > 0 ? timeLeftStr : formatElapsed(elapsedSeconds))}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold pt-1 border-t border-blue-100">
            <span>Bắt đầu: {(() => {
              if (!examStartTime) return 'Vừa xong';
              const d = examStartTime instanceof Date ? examStartTime : new Date(examStartTime);
              return !isNaN(d.getTime()) ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong';
            })()}</span>
            <span className="text-emerald-700 font-bold">Đã làm: {formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Header Sidebar */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-xs text-blue-950 uppercase tracking-wider">
              BẢNG CÂU HỎI
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              {mode === 'practice' ? 'Đề cương ôn tập' : `Mã đề ${assignedCode}`}
            </p>
          </div>
          <div className="text-right">
            {(() => {
              const activeList = mode === 'practice' ? practiceItems : examItems;
              const answeredTotal = activeList.filter(item => item.isAnswered).length;
              return (
                <span className="text-xs font-black text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                  {answeredTotal} / {activeList.length}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Phân nhóm câu hỏi theo từng phần trong Sidebar */}
        {(() => {
          const activeList = mode === 'practice' ? practiceItems : examItems;
          const sections = [];
          activeList.forEach((item, idx) => {
            let sec = sections.find(s => s.name === item.section);
            if (!sec) {
              sec = { name: item.section, items: [] };
              sections.push(sec);
            }
            sec.items.push({ item, globalIdx: idx });
          });

          return (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {sections.map((sec, secIdx) => (
                <div key={secIdx} className="space-y-2">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide block">
                    {sec.name.split('(')[0]}
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {sec.items.map(({ item, globalIdx }) => {
                      const isCurrent = globalIdx === activeQuestionIdx;
                      const isDone = item.isAnswered;
                      const isPartial = item.partialCount && item.partialCount > 0 && !isDone;

                      let btnStyle = 'bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-300 shadow-sm font-bold';
                      if (isCurrent) {
                        btnStyle = 'bg-blue-600 text-white font-black ring-4 ring-blue-200 border-2 border-blue-600 scale-105 shadow-md z-10';
                      } else if (isDone) {
                        btnStyle = 'bg-emerald-600 hover:bg-emerald-700 text-white font-black border-2 border-emerald-600 shadow-sm';
                      } else if (isPartial) {
                        btnStyle = 'bg-amber-500 hover:bg-amber-600 text-white font-black border-2 border-amber-500 shadow-sm';
                      }

                      return (
                        <button
                          key={globalIdx}
                          type="button"
                          onClick={() => setActiveQuestionIdx(globalIdx)}
                          className={`h-9 rounded-xl text-xs transition flex items-center justify-center ${btnStyle}`}
                          title={`${item.label}: ${item.section}`}
                        >
                          {globalIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Chú thích màu sắc */}
        <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-around text-[11px] text-slate-600 font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
            <span>Đang xem</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
            <span>Đã làm</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400 inline-block"></span>
            <span>Chưa làm</span>
          </div>
        </div>

        {/* Nút Nộp Bài Lớn ở Sidebar */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className={`w-full py-3.5 rounded-2xl font-black text-xs transition shadow-xl uppercase tracking-wider ${
              mode === 'practice'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
            }`}
          >
            {mode === 'practice' ? 'NỘP BÀI & XEM ĐÁNH GIÁ' : 'NỘP BÀI THI CHÍNH THỨC'}
          </button>
        </div>

      </div>
    </div>
  );
}
