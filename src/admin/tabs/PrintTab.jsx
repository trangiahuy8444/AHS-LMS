import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAdmin } from '../AdminContext.js';
import { getStudentsByClass, verifyStudentLms } from '../../core/roster-data.js';

export default function PrintTab() {
  const {
    submissions,
    printClass,
    setPrintClass,
    printType,
    setPrintType,
    printPeriod,
    setPrintPeriod,
    practiceSubs,
    handleClearPracticeClass,
    handleDeletePracticeSubmission,
    handleAdminConfirmScore,
    handleAdminConfirmBatchScores,
    handleExportStudentHtml
  } = useAdmin();

  const classRoster = useMemo(() => getStudentsByClass(printClass) || [], [printClass]);

  const getCanonicalName = (sub) => {
    if (!sub) return '';
    if (classRoster && classRoster.length > 0) {
      const matched = classRoster.find(st => verifyStudentLms(st, sub.studentId) || String(st.studentId).trim() === String(sub.studentId).trim());
      if (matched && matched.fullName) {
        return matched.fullName;
      }
    }
    return sub.fullName || '';
  };

  const getRosterIndex = (sub) => {
    if (!classRoster || classRoster.length === 0) return 999;
    const idx = classRoster.findIndex(st => 
      verifyStudentLms(st, sub.studentId) || 
      String(st.studentId).trim() === String(sub.studentId).trim() ||
      (st.fullName && sub.fullName && st.fullName.trim().toLowerCase() === sub.fullName.trim().toLowerCase())
    );
    return idx !== -1 ? idx : 999;
  };

  // 1. Lọc và gom nhóm bài nộp ôn tập: Duy nhất (unique) 1 học sinh / 1 mã LMS trong lớp
  // Lấy kết quả cao nhất (bestScore), đếm tổng số lần làm (totalAttempts)
  const uniquePracticeSubs = useMemo(() => {
    const classSubs = (practiceSubs || []).filter(s => s.studentClass === printClass);
    const map = new Map();
    classSubs.forEach(sub => {
      const key = String(sub.studentId || '').trim();
      if (!key) return;
      const pts = sub.finalScore !== undefined ? sub.finalScore : (sub.score !== undefined ? sub.score : 0);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          ...sub,
          bestScore: pts,
          totalAttempts: sub.totalAttempts || sub.attemptNumber || 1,
          allIds: [sub.id]
        });
      } else {
        const existScore = existing.bestScore;
        const totalAttempts = Math.max(existing.totalAttempts || 1, sub.totalAttempts || sub.attemptNumber || 1, (existing.totalAttempts || 1) + 1);
        const allIds = [...existing.allIds, sub.id];
        if (pts >= existScore) {
          map.set(key, {
            ...sub,
            bestScore: pts,
            totalAttempts,
            allIds
          });
        } else {
          existing.totalAttempts = totalAttempts;
          existing.allIds = allIds;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const posA = getRosterIndex(a);
      const posB = getRosterIndex(b);
      if (posA !== posB) return posA - posB;
      return (a.studentId || '').localeCompare(b.studentId || '', undefined, { numeric: true });
    });
  }, [practiceSubs, printClass, classRoster]);

  const formatConfirmedTime = (val) => {
    if (!val) return '';
    try {
      const d = typeof val?.toDate === 'function'
        ? val.toDate()
        : (typeof val?.seconds === 'number' ? new Date(val.seconds * 1000) : new Date(val));
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // 2. Lọc và gom nhóm bài nộp thi chính thức: Duy nhất 1 học sinh / 1 mã LMS trong lớp
  // Sắp xếp chính xác theo thứ tự STT sổ điểm / danh sách học sinh của lớp
  const uniqueExamSubs = useMemo(() => {
    const classSubs = (submissions || []).filter(s => s.studentClass === printClass);
    const map = new Map();
    classSubs.forEach(sub => {
      const key = String(sub.studentId || '').trim();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, sub);
      } else {
        const existing = map.get(key);
        if (sub.scoreConfirmed && !existing.scoreConfirmed) {
          map.set(key, {
            ...existing,
            scoreConfirmed: true,
            scoreConfirmedAt: sub.scoreConfirmedAt || existing.scoreConfirmedAt
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const posA = getRosterIndex(a);
      const posB = getRosterIndex(b);
      if (posA !== posB) return posA - posB;
      return (a.studentId || '').localeCompare(b.studentId || '', undefined, { numeric: true });
    });
  }, [submissions, printClass, classRoster]);

  // 3. Tự động đổi tên file xuất bản in / PDF theo cú pháp tên lớp của Asian School
  const handlePrint = () => {
    const originalTitle = document.title;
    const safeClass = (printClass || 'CHUA_CHON').replace(/[^a-zA-Z0-9]/g, '_');
    const docTitle = printType === 'practice'
      ? `BANG_DIEM_ON_TAP_LOP_${safeClass}`
      : (printPeriod === 'final'
          ? `BANG_DIEM_THI_CK1_LOP_${safeClass}`
          : `BANG_DIEM_THI_GK1_LOP_${safeClass}`);

    document.title = docTitle;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm no-print print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 uppercase">Mẫu Bảng Điểm:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setPrintType('exam');
                  if (setPrintPeriod) setPrintPeriod('midterm');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  printType === 'exam' && printPeriod !== 'final'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📝 Thi Giữa HK1
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintType('exam');
                  if (setPrintPeriod) setPrintPeriod('final');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  printType === 'exam' && printPeriod === 'final'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎓 Thi Cuối HK1
              </button>
              <button
                type="button"
                onClick={() => setPrintType('practice')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  printType === 'practice'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📖 Ôn Tập Đề Cương
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 uppercase">Chọn Lớp Để In:</span>
            <select
              value={printClass}
              onChange={e => setPrintClass(e.target.value)}
              className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-600"
            >
              {['8/19', '8/20', '8/21', '8/22', '8/23', '9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26', '10/14', '10/15', '10/16'].map(c => (
                <option key={c} value={c}>Lớp {c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {printType === 'exam' && uniqueExamSubs.some(s => !s.scoreConfirmed) && (
            <button
              type="button"
              onClick={() => handleAdminConfirmBatchScores(
                uniqueExamSubs.filter(s => !s.scoreConfirmed),
                `Lớp ${printClass}`
              )}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
              title={`Xác nhận điểm thay cho ${uniqueExamSubs.filter(s => !s.scoreConfirmed).length} học sinh chưa bấm xác nhận của Lớp ${printClass}`}
            >
              <span>✓</span>
              <span>Xác Nhận Thay Cả Lớp ({uniqueExamSubs.filter(s => !s.scoreConfirmed).length} HS)</span>
            </button>
          )}
          {printType === 'practice' && (
            <button
              type="button"
              onClick={() => handleClearPracticeClass(printClass)}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
              title={`Xóa toàn bộ dữ liệu ôn tập của Lớp ${printClass}`}
            >
              <span>🗑️</span>
              <span>Xóa Bảng Điểm Lớp {printClass}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-2"
          >
            <span>🖨️</span>
            <span>Xác Nhận In Bảng Điểm A4 Ngang</span>
          </button>
        </div>
      </div>

      {/* BẢN XEM TRƯỚC BẢNG ĐIỂM (PREVIEW) */}
      <div className="bg-white text-slate-900 rounded-3xl p-8 border border-slate-300 shadow-2xl space-y-6 font-sans print:shadow-none print:border-none print:p-0 print:rounded-none">
        
        {/* TIÊU ĐỀ TRƯỜNG ASIAN SCHOOL */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <p className="font-bold text-xs uppercase text-slate-800 tracking-wider">
              TRƯỜNG TIỂU HỌC, THCS & THPT QUỐC TẾ Á CHÂU
            </p>
            <p className="font-extrabold text-sm text-blue-900 uppercase">
              BỘ MÔN TIN HỌC — NĂM HỌC 2026 - 2027
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600 italic">Áp dụng mẫu khảo thí Asian School</p>
            <p className="text-xs font-bold text-slate-900">LỚP HỌC: {printClass}</p>
          </div>
        </div>

        {printType === 'exam' ? (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">
                {printPeriod === 'final'
                  ? 'BẢNG TỔNG HỢP ĐIỂM KIỂM TRA ĐÁNH GIÁ CUỐI HỌC KỲ 1'
                  : 'BẢNG TỔNG HỢP ĐIỂM KIỂM TRA ĐÁNH GIÁ GIỮA HỌC KỲ 1'}
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                Thời lượng làm bài: 45 phút • Lớp học: {printClass} • Giáo viên phụ trách: Thầy Trần Gia Huy
              </p>
            </div>

            {/* BẢNG ĐIỂM THI CHÍNH THỨC */}
            <table className="w-full text-left text-xs border border-slate-400">
              <thead className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center w-12">STT</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">Mã LMS</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">Họ và Tên Học Sinh</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Mã Đề</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Điểm TN</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Điểm TL</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Tổng Điểm</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Xác Nhận Điểm</th>
                  <th className="py-2.5 px-3">Lời Phê / Ghi Chú Của Giáo Viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {uniqueExamSubs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-500 italic">
                      Chưa có dữ liệu bài nộp nào của Lớp {printClass}.
                    </td>
                  </tr>
                ) : (
                  uniqueExamSubs.map((sub, idx) => {
                    const autoScore = sub.mcqPoints !== undefined ? sub.mcqPoints : (sub.score !== undefined ? sub.score : 0);
                    const essayScore = sub.isGraded ? (sub.essayTotal || 0) : 0;
                    const finalScore = sub.finalScore !== undefined ? sub.finalScore : (autoScore + essayScore);

                    const matchedRoster = classRoster.find(st => verifyStudentLms(st, sub.studentId) || String(st.studentId).trim() === String(sub.studentId).trim());
                    const sttDisplay = matchedRoster?.stt || (idx + 1);
                    const confirmedTime = formatConfirmedTime(sub.scoreConfirmedAt);

                    return (
                      <tr key={idx} className="text-slate-900">
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code font-bold">{sttDisplay}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-mono-code font-bold text-blue-900">{sub.studentId || '—'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold">
                          <div className="flex items-center justify-between gap-1.5">
                            <span>{getCanonicalName(sub)}</span>
                            {handleExportStudentHtml && (
                              <button
                                type="button"
                                onClick={() => handleExportStudentHtml(sub)}
                                title="Xuất bài làm của học sinh này (giao diện chốt điểm) ra file HTML để gửi đi"
                                className="print:hidden no-print px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-[10px] shrink-0 transition"
                              >
                                📄 HTML
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code">{sub.examCode || '101'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center">{autoScore}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center">{sub.isGraded ? essayScore : '—'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-black text-sm text-red-600">{finalScore}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center">
                          {sub.scoreConfirmed ? (
                            <span className="inline-flex flex-col items-center text-emerald-700 font-bold text-[11px]">
                              <span>✓ Đã xác nhận</span>
                              {confirmedTime && (
                                <span className="text-[10px] font-mono-code text-emerald-600">
                                  ({confirmedTime})
                                </span>
                              )}
                            </span>
                          ) : (
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="text-slate-400 italic text-[11px]">Chưa xác nhận</span>
                              <button
                                type="button"
                                onClick={() => handleAdminConfirmScore(sub)}
                                title="Xác nhận điểm thay cho học sinh này (trường hợp học sinh quên bấm xác nhận)"
                                className="print:hidden px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition"
                              >
                                ✓ Xác nhận thay
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700 italic">
                          {(sub.penaltyPoints > 0 || sub.violations >= 3) ? `[Vi phạm ${sub.violations} lần] ${sub.teacherFeedback || ''}` : (sub.teacherFeedback || '')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* KHỐI KÝ TÊN */}
            <div className="pt-8 flex justify-between items-end text-xs text-slate-800">
              <div>
                <p>Số lượng học sinh nộp bài: <strong>{uniqueExamSubs.length}</strong> học sinh</p>
                <p>Số lượng bài đã chấm: <strong>{uniqueExamSubs.filter(s => s.isGraded).length}</strong> bài</p>
                <p>Số lượng học sinh đã xác nhận điểm: <strong>{uniqueExamSubs.filter(s => s.scoreConfirmed).length}/{uniqueExamSubs.length}</strong> học sinh</p>
              </div>
              <div className="text-center space-y-12">
                <p className="italic">Thành phố Hồ Chí Minh, ngày ...... tháng ...... năm 2026</p>
                <p className="font-black uppercase text-sm">
                  GIÁO VIÊN BỘ MÔN TIN HỌC<br/><br/><br/>
                  <span className="text-blue-950 font-bold">Thầy Trần Gia Huy</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">
                BẢNG TỔNG HỢP KẾT QUẢ ÔN TẬP ĐỀ CƯƠNG TIN HỌC
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                Đánh giá số lần rèn luyện & điểm số ôn tập đề cương • Lớp {printClass} • Giáo viên phụ trách: Thầy Trần Gia Huy
              </p>
            </div>

            {/* BẢNG ĐIỂM ÔN TẬP ĐỀ CƯƠNG */}
            <table className="w-full text-left text-xs border border-slate-400">
              <thead className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center w-12">STT</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">Mã LMS</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">Họ và Tên Học Sinh</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Số Lần Làm</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Điểm Đạt (Cao Nhất)</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Đúng/Tổng</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Thời Điểm Nộp</th>
                  <th className="py-2.5 px-3 border-r border-slate-400 text-center">Đánh Giá (≥ 6.0)</th>
                  <th className="py-2.5 px-3 border-r border-slate-400">Ghi Chú Tiến Độ</th>
                  <th className="py-2.5 px-3 text-center print:hidden no-print w-12">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {uniquePracticeSubs.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-500 italic">
                      Chưa có dữ liệu bài làm ôn tập đề cương nào của Lớp {printClass}.
                    </td>
                  </tr>
                ) : (
                  uniquePracticeSubs.map((sub, idx) => {
                    const pts = sub.bestScore !== undefined ? sub.bestScore : (sub.finalScore !== undefined ? sub.finalScore : (sub.score || 0));
                    const isPass = pts >= 6.0;
                    const attempts = sub.totalAttempts || sub.attemptNumber || 1;
                    const matchedRoster = classRoster.find(st => verifyStudentLms(st, sub.studentId) || String(st.studentId).trim() === String(sub.studentId).trim());
                    const sttDisplay = matchedRoster?.stt || (idx + 1);

                    return (
                      <tr key={idx} className="text-slate-900">
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code font-bold">{sttDisplay}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-mono-code font-bold text-blue-900">{sub.studentId || '—'}</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold">
                          <div className="flex items-center justify-between gap-1.5">
                            <span>{getCanonicalName(sub)}</span>
                            {handleExportStudentHtml && (
                              <button
                                type="button"
                                onClick={() => handleExportStudentHtml(sub)}
                                title="Xuất bài làm của học sinh này (giao diện chốt điểm) ra file HTML để gửi đi"
                                className="print:hidden no-print px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-[10px] shrink-0 transition"
                              >
                                📄 HTML
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code font-bold text-amber-900">
                          {attempts} lượt
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-black text-sm text-red-600">{pts}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code text-slate-700">
                          {sub.correctCount !== undefined ? `${sub.correctCount}/${sub.totalQuestions || 25}` : '—'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-mono-code text-[11px] text-slate-600">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center font-bold">
                          {isPass ? (
                            <span className="text-emerald-700 font-black">✓ Đạt yêu cầu</span>
                          ) : (
                            <span className="text-amber-700 font-semibold">Cần rèn thêm</span>
                          )}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-slate-700 italic">
                          {attempts >= 5 && isPass ? 'Đủ điều kiện dự thi GK1' : `Đã rèn luyện ${attempts} lượt`}
                        </td>
                        <td className="py-2 px-3 text-center print:hidden no-print">
                          <button
                            type="button"
                            onClick={() => {
                              if (sub.allIds && sub.allIds.length > 0) {
                                sub.allIds.forEach(id => handleDeletePracticeSubmission(id, sub.fullName || sub.studentId));
                              } else {
                                handleDeletePracticeSubmission(sub.id, sub.fullName || sub.studentId);
                              }
                            }}
                            title="Xóa toàn bộ lượt làm của học sinh này"
                            className="p-1 hover:bg-rose-100 text-rose-600 rounded transition"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* KHỐI KÝ TÊN */}
            <div className="pt-8 flex justify-between items-end text-xs text-slate-800">
              <div>
                <p>Tổng số học sinh ôn tập: <strong>{uniquePracticeSubs.length}</strong> học sinh</p>
                <p>Số học sinh đạt chuẩn (≥ 6.0đ): <strong>{uniquePracticeSubs.filter(s => (s.bestScore >= 6.0 || s.finalScore >= 6.0 || s.score >= 6.0)).length}</strong> học sinh</p>
              </div>
              <div className="text-center space-y-12">
                <p className="italic">Thành phố Hồ Chí Minh, ngày ...... tháng ...... năm 2026</p>
                <p className="font-black uppercase text-sm">
                  GIÁO VIÊN BỘ MÔN TIN HỌC<br/><br/><br/>
                  <span className="text-blue-950 font-bold">Thầy Trần Gia Huy</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
