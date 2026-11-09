import React from 'react';
import { getStudentsByClass } from '../../core/roster-data.js';
import { classSubmissionProgress } from '../live/classAttendance.js';

export default function ClassSubmissionSummary({ studentClass, submissions, mode = 'exam' }) {
  const progress = classSubmissionProgress(submissions, studentClass, getStudentsByClass(studentClass), mode);
  return (
    <div className="rounded-xl bg-blue-50/60 border border-blue-100 px-3 py-2 text-xs" aria-label={`Tiến độ nộp bài lớp ${studentClass}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <strong className="text-blue-950">Lớp {studentClass}</strong>
        <span>Sĩ số: <strong>{progress.total ?? 'Chưa có danh sách'}</strong></span>
        <span className="text-emerald-800">Đã nộp {mode === 'exam' ? 'thi' : 'ôn tập'}: <strong>{progress.submitted} / {progress.total ?? '—'}</strong></span>
        <span className="text-amber-800">Chưa nộp: <strong>{progress.missing ?? '—'}</strong></span>
      </div>
      {progress.unmatched > 0 && <p className="mt-1 text-amber-800">Có {progress.unmatched} mã LMS nộp bài chưa khớp danh sách lớp, chưa tính vào sĩ số.</p>}
    </div>
  );
}
