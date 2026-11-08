import React from 'react';
import { useStudent } from '../StudentContext.js';

export default function StudentIdentity({ extraLabel, extraValue }) {
  const { fullName, studentId, studentClass } = useStudent();
  const fields = [
    ['Họ tên', fullName || 'Chưa nhập'],
    ['Mã LMS', studentId || 'Chưa nhập'],
    ['Lớp', studentClass || 'Chưa chọn'],
    ...(extraLabel ? [[extraLabel, extraValue]] : [])
  ];
  return (
    <section aria-label="Thông tin học sinh" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-wrap items-baseline gap-x-2 min-w-0">
            <dt className="text-slate-500">{label}</dt>
            <dd className={`font-bold [overflow-wrap:anywhere] ${label === 'Mã LMS' ? 'text-blue-800' : 'text-slate-900'}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
