import React, { useState } from 'react';
import { getStudentsByClass } from '../../core/roster-data.js';
import { classSubmissionProgress } from '../live/classAttendance.js';

function stripVietnamese(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findBestMatchStudent(sub, missingStudents) {
  if (!missingStudents || missingStudents.length === 0) return null;
  const subName = stripVietnamese(sub.fullName);
  const subId = String(sub.studentId || '').trim();

  // 1. So khớp theo studentId / canvasUserId nếu có trùng
  for (const st of missingStudents) {
    const stId = String(st.studentId || '').trim();
    const canvasId = String(st.canvasUserId || '').trim();
    if (subId && (subId === stId || subId === canvasId || (stId && subId.endsWith(stId)) || (stId && stId.endsWith(subId)))) {
      return st;
    }
  }

  // 2. So khớp theo họ tên không dấu chính xác
  if (subName) {
    for (const st of missingStudents) {
      const stName = stripVietnamese(st.fullName);
      if (subName === stName) return st;
    }

    // 3. So khớp họ + tên chính (từ đầu và từ cuối)
    const subWords = subName.split(' ');
    const subFirst = subWords[0];
    const subLast = subWords[subWords.length - 1];

    for (const st of missingStudents) {
      const stWords = stripVietnamese(st.fullName).split(' ');
      const stFirst = stWords[0];
      const stLast = stWords[stWords.length - 1];
      if (subFirst === stFirst && subLast === stLast && subLast.length >= 2) {
        return st;
      }
    }

    // 4. So khớp chuỗi con (nằm trong nhau)
    for (const st of missingStudents) {
      const stName = stripVietnamese(st.fullName);
      if (subName.includes(stName) || stName.includes(subName)) {
        return st;
      }
    }
  }

  // 5. Nếu danh sách chưa nộp chỉ có ĐÚNG 1 bạn:
  if (missingStudents.length === 1) {
    return missingStudents[0];
  }

  return null;
}

export default function ClassSubmissionSummary({ studentClass, submissions, mode = 'exam' }) {
  const roster = getStudentsByClass(studentClass);
  const progress = classSubmissionProgress(submissions, studentClass, roster, mode);
  const [updating, setUpdating] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [manualMatchTarget, setManualMatchTarget] = useState({});

  const missingStudents = progress.missingStudents || [];
  const unmatchedRows = progress.unmatchedRows || [];

  // Tự động tìm gợi ý khớp cho toàn bộ các bài nộp chưa khớp
  const suggestions = [];
  unmatchedRows.forEach(sub => {
    const match = findBestMatchStudent(sub, missingStudents);
    if (match) {
      suggestions.push({
        submissionId: sub.id || sub.sessionId,
        subName: sub.fullName || 'Chưa rõ họ tên',
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

  const hasUnmatched = progress.unmatched > 0;

  return (
    <div className={`rounded-2xl border-2 px-4 py-3 text-xs space-y-3 transition ${
      hasUnmatched ? 'bg-amber-50/70 border-amber-300 shadow-sm' : 'bg-blue-50/60 border-blue-200'
    }`} aria-label={`Tiến độ nộp bài lớp ${studentClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <strong className="text-blue-950 text-sm">Lớp {studentClass}</strong>
          <span>Sĩ số: <strong>{progress.total ?? 'Chưa có danh sách'}</strong></span>
          <span className="text-emerald-800">Đã nộp {mode === 'exam' ? 'thi' : 'ôn tập'}: <strong>{progress.submitted} / {progress.total ?? '—'}</strong></span>
          <span className="text-amber-800">Chưa nộp: <strong>{progress.missing ?? '—'}</strong></span>
        </div>
        {progress.submitted >= (progress.total || 0) && progress.total > 0 && progress.unmatched === 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✓ ĐÃ NỘP ĐỦ 100%
          </span>
        )}
      </div>

      {hasUnmatched && (
        <div className="flex items-center space-x-2 text-amber-900 font-bold bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300">
          <span className="text-base">⚠️</span>
          <span>Có <strong>{progress.unmatched}</strong> mã LMS nộp bài chưa khớp danh sách lớp, chưa tính vào sĩ số.</span>
        </div>
      )}

      {alertMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center space-x-2 shadow-sm">
          <span>🎉</span>
          <span>{alertMessage}</span>
        </div>
      )}

      {/* KHUNG ĐỐI SOÁT & DUYỆT CẬP NHẬT CSDL: LUÔN HIỂN THỊ NGAY KHI CÓ BÀI NỘP CHƯA KHỚP */}
      {hasUnmatched && (
        <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <span className="font-black text-xs sm:text-sm text-blue-950 flex items-center space-x-1.5">
              <span>🛠️</span>
              <span>ĐỐI SOÁT & DUYỆT CẬP NHẬT MÃ LMS VÀO CSDL ({unmatchedRows.length} bài chưa khớp):</span>
            </span>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
              Cần Thầy duyệt để tính vào sĩ số
            </span>
          </div>

          {/* 1. CÁC GỢI Ý ĐỐI SOÁT TỰ ĐỘNG (NẾU TÌM THẤY TƯƠNG ĐỒNG) */}
          {suggestions.length > 0 && (
            <div className="space-y-2 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300">
              <span className="font-black text-xs text-emerald-950 flex items-center space-x-1.5">
                <span>💡</span>
                <span>Gợi ý đối chiếu tự động ({suggestions.length} trường hợp): Thầy bấm nút duyệt để cập nhật ngay vào CSDL</span>
              </span>
              <div className="space-y-2">
                {suggestions.map((sug, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-emerald-300 shadow-sm">
                    <div className="text-xs text-slate-800 leading-relaxed">
                      Thí sinh <strong>{sug.subName}</strong> nộp với mã <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono-code font-bold">{sug.subId}</code> {sug.score !== undefined && `(${sug.score}đ)`}
                      <br className="sm:hidden" />
                      ➔ Khớp với <strong>STT {sug.rosterStt}: {sug.rosterName}</strong> (Mã hồ sơ chuẩn: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono-code font-bold">{sug.rosterId}</code>)
                    </div>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleApproveMatch(sug.submissionId, sug.rosterId, sug.rosterName)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 shrink-0"
                    >
                      <span>✅</span>
                      <span>{updating ? 'Đang cập nhật...' : `Duyệt & Khớp sang mã ${sug.rosterId}`}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CHI TIẾT TẤT CẢ CÁC BÀI NỘP CHƯA KHỚP VÀ MENU KHỚP THỦ CÔNG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Cột 1: Danh sách bài nộp chưa khớp */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="font-bold text-xs text-amber-950 block">
                📌 Danh sách {unmatchedRows.length} bài nộp chưa khớp mã LMS:
              </span>
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {unmatchedRows.map((row, idx) => {
                  const subKey = row.id || row.sessionId;
                  return (
                    <li key={idx} className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900">{row.fullName || 'Chưa rõ họ tên'}</span>
                        {row.score !== undefined && <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">{row.score}đ</span>}
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Mã đã nộp: <code className="font-mono-code text-amber-900 font-bold bg-amber-50 px-1 rounded">{row.studentId}</code>
                        {row.examCode && ` • Đề: ${row.examCode}`}
                      </div>
                      {missingStudents.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100">
                          <select
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 flex-1 min-w-[180px]"
                            value={manualMatchTarget[subKey] || ''}
                            onChange={e => setManualMatchTarget(prev => ({ ...prev, [subKey]: e.target.value }))}
                          >
                            <option value="">-- Chọn học sinh trong lớp để khớp --</option>
                            {missingStudents.map(st => (
                              <option key={st.studentId} value={st.studentId}>
                                STT {st.stt}: {st.fullName} (Mã: {st.studentId})
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
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-sm transition shrink-0"
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
            </div>

            {/* Cột 2: Danh sách học sinh trong lớp chưa có bài nộp */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-900 block">
                📋 Danh sách {missingStudents.length} học sinh trong lớp chưa có bài nộp:
              </span>
              {missingStudents.length === 0 ? (
                <p className="text-xs text-emerald-700 italic font-medium p-2">Tất cả học sinh trong danh sách đã có bài nộp.</p>
              ) : (
                <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {missingStudents.map((st, idx) => (
                    <li key={idx} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">STT {st.stt}: {st.fullName}</span>
                        <div className="text-[11px] text-slate-500">
                          Mã hồ sơ: <code className="font-mono-code text-blue-900 font-bold bg-blue-50 px-1 rounded">{st.studentId}</code>
                          {st.canvasUserId && ` • Canvas: ${st.canvasUserId}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (unmatchedRows.length === 1) {
                            const onlySub = unmatchedRows[0];
                            handleApproveMatch(onlySub.id || onlySub.sessionId, st.studentId, st.fullName);
                          } else if (unmatchedRows.length > 0) {
                            const firstSubKey = unmatchedRows[0].id || unmatchedRows[0].sessionId;
                            setManualMatchTarget(prev => ({ ...prev, [firstSubKey]: st.studentId }));
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold transition shrink-0"
                      >
                        Chọn khớp ➔
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
