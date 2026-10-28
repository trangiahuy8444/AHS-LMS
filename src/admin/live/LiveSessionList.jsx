import React from 'react';
import { useAdmin } from '../AdminContext.js';

// DANH SÁCH THÍ SINH ĐANG TRỰC TUYẾN THEO LỚP
export default function LiveSessionList() {
  const { liveSessions, liveFilter, setShowBroadcastModal, setBroadcastTarget, setBroadcastMsgInput,
    setIndividualMsgTarget, showToast, handleExtendTime, handleForceSubmit, handleLockSession,
    handleUnlockSession, handleRemoveCandidate, handleClearClassSessions } = useAdmin();

  return (
    <div className="space-y-6">
      {(() => {
        const filteredLive = liveSessions.filter(s => {
          if (liveFilter === 'exam') return s.mode === 'exam';
          if (liveFilter === 'practice') return s.mode === 'practice';
          return true;
        });

        if (filteredLive.length === 0) {
          return (
            <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border-2 border-slate-200">
              {liveFilter === 'all'
                ? 'Hiện tại chưa có học sinh nào đang mở cổng làm bài.'
                : (liveFilter === 'exam' ? 'Hiện không có học sinh nào đang thi chính thức.' : 'Hiện không có học sinh nào đang trong ca ôn tập đề cương.')}
            </div>
          );
        }

        // Phân nhóm theo Lớp học
        const classGroups = {};
        filteredLive.forEach(session => {
          const cls = session.studentClass || 'Chưa rõ';
          if (!classGroups[cls]) classGroups[cls] = [];
          classGroups[cls].push(session);
        });

        return Object.keys(classGroups).sort().map(cls => {
          const sessionsInClass = classGroups[cls];
          const lockedCount = sessionsInClass.filter(s => s.status === 'locked' || s.isLocked || (s.violations >= 3)).length;
          const examCount = sessionsInClass.filter(s => s.mode === 'exam').length;
          const practiceCount = sessionsInClass.filter(s => s.mode === 'practice').length;

          return (
            <div key={cls} className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 border border-blue-200 font-black text-sm flex items-center justify-center">
                    {cls}
                  </span>
                  <div>
                    <h3 className="font-black text-base text-blue-950 uppercase">
                      LỚP {cls}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Sĩ số trực tuyến: <strong className="text-blue-900 font-bold">{sessionsInClass.length} học sinh</strong>
                      {' '}• Đang thi: <span className="font-bold text-red-600">{examCount}</span>
                      {' '}• Ôn tập: <span className="font-bold text-purple-600">{practiceCount}</span>
                      {lockedCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px] border border-red-300">
                          🚨 {lockedCount} em bị khóa
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleClearClassSessions(cls)}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition flex items-center space-x-1"
                    title={`Dọn dẹp toàn bộ thí sinh Lớp ${cls} khi chuyển sang ca thi lớp mới`}
                  >
                    <span>🗑️</span>
                    <span>Xóa Lớp Này</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sessionsInClass.forEach(s => window.AsianSchoolStorage.sendProctorCommand(s.sessionId, 'extend_time', { minutes: 5 }));
                      showToast(`Đã gia hạn +5 phút cho toàn bộ học sinh Lớp ${cls}!`, 'success', `Lớp ${cls}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition flex items-center space-x-1"
                  >
                    <span>⏱️</span>
                    <span>+5p Cả Lớp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastTarget('all');
                      setBroadcastMsgInput(`Thông báo riêng tới Lớp ${cls}: `);
                      setShowBroadcastModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center space-x-1"
                  >
                    <span>📢</span>
                    <span>Nhắn Cả Lớp</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sessionsInClass.map(session => {
                  const isLocked = session.status === 'locked' || session.isLocked || (session.violations >= 3);
                  const isPractice = session.mode === 'practice';
                  return (
                    <div
                      key={session.sessionId}
                      className={`p-4 rounded-2xl border-2 transition shadow-sm space-y-3 ${
                        isLocked
                          ? 'bg-red-50 border-red-400 ring-2 ring-red-400/50'
                          : (session.violations > 0
                              ? 'bg-amber-50/60 border-amber-300'
                              : (isPractice ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'))
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-black text-sm text-slate-900">{session.fullName || 'Chưa nhập tên'}</h4>
                            {isPractice && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                ÔN TẬP
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Lớp <strong className="text-slate-800">{session.studentClass}</strong> • Khối {session.grade} {session.studentId && `• Mã LMS: ${session.studentId}`}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          isLocked
                            ? 'bg-red-600 text-white'
                            : (session.status === 'submitted'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : (isPractice
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'))
                        }`}>
                          {isLocked
                            ? '🚨 BỊ KHÓA'
                            : (session.status === 'submitted'
                                ? 'Đã nộp bài'
                                : (isPractice ? '📖 Ôn tập' : '📝 Đang thi'))}
                        </span>
                      </div>

                      {isLocked && (
                        <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-xs text-red-900 space-y-1">
                          <div className="font-black flex items-center justify-between">
                            <span>⚠️ BỊ KHÓA TOÀN MÀN HÌNH</span>
                            {session.violations >= 3 && <span className="text-red-700 font-extrabold bg-red-200 px-1 rounded">-5đ</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnlockSession(session.sessionId, session.fullName)}
                            className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow transition flex items-center justify-center space-x-1"
                          >
                            <span>🔓</span>
                            <span>XÁC NHẬN MỞ KHÓA</span>
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Mã đề:</span>
                          <strong className="text-slate-900 font-mono-code text-xs">{session.examCode || 'Đề cương'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Thời gian:</span>
                          <strong className="text-amber-700 font-mono-code text-xs">{session.timeLeft || '—'}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className={session.violations > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                          Vi phạm: <strong className="text-xs">{session.violations || 0}</strong> lần {session.violations >= 3 && <span className="text-red-600 font-extrabold">(-5đ)</span>}
                        </span>
                        {session.status === 'submitted' && (
                          <span className="text-emerald-700 font-black text-xs">
                            Điểm: {session.score !== undefined ? session.score : session.mcqPoints}đ
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleExtendTime(session.sessionId, session.fullName, 5)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition text-center"
                        >
                          ⏱️ +5 Phút
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIndividualMsgTarget(session);
                            setBroadcastTarget(session.sessionId);
                            setShowBroadcastModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition text-center"
                        >
                          ✉️ Nhắn
                        </button>

                        {isLocked ? (
                          <button
                            type="button"
                            onClick={() => handleUnlockSession(session.sessionId, session.fullName)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition text-center"
                          >
                            🔓 Mở Khóa
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleLockSession(session.sessionId, session.fullName)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition text-center"
                          >
                            🔒 Khóa
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleForceSubmit(session.sessionId, session.fullName)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition text-center"
                        >
                          🛑 Thu Bài
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveCandidate(session.sessionId, session.fullName)}
                          className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition text-center col-span-2 font-bold flex items-center justify-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Xóa Thí Sinh</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        });
      })()}
    </div>
  );
}
