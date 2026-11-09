import React, { useState } from 'react';
import { getStudentsByClass } from '../../core/roster-data.js';
import { classSubmissionProgress } from '../live/classAttendance.js';

export default function ClassSubmissionSummary({ studentClass, submissions, mode = 'exam' }) {
  const roster = getStudentsByClass(studentClass);
  const progress = classSubmissionProgress(submissions, studentClass, roster, mode);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [manualMatchTarget, setManualMatchTarget] = useState({});

  const missingStudents = progress.missingStudents || [];
  const unmatchedRows = progress.unmatchedRows || [];

  const normalizeName = value => String(value || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  const suggestions = [];
  unmatchedRows.forEach(sub => {
    const subName = normalizeName(sub.fullName);
    if (!subName) return;
    const match = missingStudents.find(st => normalizeName(st.fullName) === subName);
    if (match) {
      suggestions.push({
        submissionId: sub.id || sub.sessionId,
        subName: sub.fullName,
        subId: sub.studentId,
        rosterStt: match.stt,
        rosterName: match.fullName,
        rosterId: match.studentId,
        score: sub.score !== undefined ? sub.score : sub.mcqPoints
      });
    }
  });

  const handleApproveMatch = (subId, targetStudentId, targetFullName) => {
    if (!subId || !targetStudentId) return;
    const confirmMsg = `Thầy có chắc chắn muốn duyệt và cập nhật bài nộp này sang mã LMS chuẩn ${targetStudentId} (${targetFullName}) trong CSDL?`;
    if (typeof window !== 'undefined' && window.confirm && !window.confirm(confirmMsg)) return;

    setUpdating(true);
    try {
      if (window.AsianSchoolStorage && typeof window.AsianSchoolStorage.updateSubmissionStudentId === 'function') {
        const res = window.AsianSchoolStorage.updateSubmissionStudentId(subId, targetStudentId, targetFullName);
        if (res && res.success) {
          setAlertMessage(`✅ Đã duyệt và cập nhật bài nộp sang mã LMS ${targetStudentId} (${targetFullName}) trong CSDL thành công.`);
          setTimeout(() => setAlertMessage(''), 5000);
        } else {
          alert(res?.error || 'Không cập nhật được CSDL.');
        }
      }
    } catch (e) {
      alert('Lỗi cập nhật CSDL: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const hasIssues = progress.unmatched > 0 || (progress.missing > 0 && progress.submitted > 0);

  return (
    <div className="rounded-xl bg-blue-50/60 border border-blue-100 px-3 py-2 text-xs space-y-2" aria-label={`Tiến độ nộp bài lớp ${studentClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <strong className="text-blue-950">Lớp {studentClass}</strong>
          <span>Sĩ số: <strong>{progress.total ?? 'Chưa có danh sách'}</strong></span>
          <span className="text-emerald-800">Đã nộp {mode === 'exam' ? 'thi' : 'ôn tập'}: <strong>{progress.submitted} / {progress.total ?? '—'}</strong></span>
          <span className="text-amber-800">Chưa nộp: <strong>{progress.missing ?? '—'}</strong></span>
        </div>
        {hasIssues && (
          <button
            type="button"
            onClick={() => setShowDetails(prev => !prev)}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center space-x-1"
          >
            <span>{showDetails ? '▲ Thu gọn' : '▼ Chỉ ra chỗ chưa khớp / chưa nộp'}</span>
          </button>
        )}
      </div>

      {progress.unmatched > 0 && (
        <p className="text-amber-800 font-medium">
          ⚠️ Có <strong>{progress.unmatched}</strong> mã LMS nộp bài chưa khớp danh sách lớp, chưa tính vào sĩ số.
        </p>
      )}

      {alertMessage && (
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center space-x-2">
          <span>🎉</span>
          <span>{alertMessage}</span>
        </div>
      )}

      {/* GỢI Ý ĐỐI SOÁT TỰ ĐỘNG NẾU TRÙNG TÊN VÀ NÚT DUYỆT CẬP NHẬT CSDL */}
      {suggestions.length > 0 && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-2">
          <p className="font-bold flex items-center space-x-1.5 text-xs text-emerald-950">
            <span>💡</span>
            <span>Gợi ý đối chiếu tự động ({suggestions.length} trường hợp trùng họ tên): Thầy có thể duyệt cập nhật trực tiếp vào CSDL</span>
          </p>
          <div className="space-y-1.5">
            {suggestions.map((sug, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white border border-emerald-300 text-[11px] shadow-sm">
                <div>
                  Thí sinh <strong>{sug.subName}</strong> nộp mã <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono-code font-bold">{sug.subId}</code> (Điểm: {sug.score ?? '—'})
                  ➔ STT <strong>{sug.rosterStt}</strong> hồ sơ: <strong>{sug.rosterName}</strong> (Mã chuẩn: <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono-code font-bold">{sug.rosterId}</code>)
                </div>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleApproveMatch(sug.submissionId, sug.rosterId, sug.rosterName)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-lg shadow-sm transition flex items-center space-x-1 shrink-0"
                >
                  <span>✅</span>
                  <span>{updating ? 'Đang cập nhật...' : `Duyệt & Khớp sang mã ${sug.rosterId}`}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHI TIẾT DANH SÁCH CHƯA KHỚP VÀ CHƯA NỘP */}
      {showDetails && (
        <div className="pt-2 border-t border-blue-200/60 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Cột 1: Các bài nộp chưa khớp mã danh sách */}
          <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1">
            <span className="font-bold text-amber-950 block">
              📌 {unmatchedRows.length} bài nộp chưa khớp mã LMS danh sách:
            </span>
            {unmatchedRows.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Không có bài nào chưa khớp.</p>
            ) : (
              <ul className="space-y-1.5 text-[11px] max-h-48 overflow-y-auto">
                {unmatchedRows.map((row, idx) => {
                  const subKey = row.id || row.sessionId;
                  return (
                    <li key={idx} className="bg-white p-2 rounded-lg border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{row.fullName || 'Chưa rõ tên'}</span>
                        {row.score !== undefined && <span className="font-bold text-blue-800">{row.score}đ</span>}
                      </div>
                      <div className="text-slate-600">
                        Mã nộp: <code className="font-mono-code text-amber-900 font-bold">{row.studentId}</code>
                        {row.examCode && ` • Đề: ${row.examCode}`}
                      </div>
                      {missingStudents.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1 border-t border-slate-100">
                          <select
                            className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-slate-800 max-w-[200px]"
                            value={manualMatchTarget[subKey] || ''}
                            onChange={e => setManualMatchTarget(prev => ({ ...prev, [subKey]: e.target.value }))}
                          >
                            <option value="">-- Khớp vào học sinh --</option>
                            {missingStudents.map(st => (
                              <option key={st.studentId} value={st.studentId}>
                                STT {st.stt}: {st.fullName} ({st.studentId})
                              </option>
                            ))}
                          </select>
                          {manualMatchTarget[subKey] && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() => {
                                const targetId = manualMatchTarget[subKey];
                                const matchedSt = missingStudents.find(s => s.studentId === targetId);
                                handleApproveMatch(subKey, targetId, matchedSt?.fullName);
                              }}
                              className="px-2 py-0.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded text-[10px] shadow-sm transition"
                            >
                              Khớp CSDL
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Cột 2: Học sinh trong danh sách lớp chưa có bài nộp */}
          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">
              📋 {missingStudents.length} học sinh trong danh sách lớp chưa nộp:
            </span>
            {missingStudents.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Tất cả học sinh trong danh sách đã nộp bài.</p>
            ) : (
              <ul className="space-y-1 text-[11px] max-h-36 overflow-y-auto">
                {missingStudents.map((st, idx) => (
                  <li key={idx} className="bg-white p-1.5 rounded border border-slate-200">
                    <div className="font-bold text-slate-900">STT {st.stt}: {st.fullName}</div>
                    <div className="text-slate-600">
                      Mã hồ sơ: <code className="font-mono-code text-blue-900">{st.studentId}</code>
                      {st.canvasUserId && ` • Canvas: ${st.canvasUserId}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
