import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAdmin } from '../AdminContext.js';

export default function SubmissionsTab() {
  const { filterGrade, setFilterGrade, filterClass, setFilterClass, filterMode, setFilterMode,
    filterGraded, setFilterGraded, searchQuery, setSearchQuery, fileInputRef,
    handleDeleteSubmission, openGradingModal, handleExportCSV, handleExportJSON, handleImportJSON,
    handleClearAllData, filteredSubmissions } = useAdmin();

  return (
    <div className="space-y-6">
      
      {/* THANH BỘ LỌC NÂNG CAO */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Khối Lớp:</label>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Tất cả Khối (8, 9, 10)</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
              <option value="10">Khối 10</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Lớp Học:</label>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Tất cả các lớp</option>
              {['8/19', '8/20', '8/21', '8/22', '8/23', '9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26', '10/14', '10/15', '10/16'].map(c => (
                <option key={c} value={c}>Lớp {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Chế Độ:</label>
            <select
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Tất cả bài làm</option>
              <option value="exam">Chỉ bài Thi Giữa HK1</option>
              <option value="practice">Chỉ bài Ôn tập Đề cương</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Trạng Thái Chấm:</label>
            <select
              value={filterGraded}
              onChange={e => setFilterGraded(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ chấm tự luận ⏳</option>
              <option value="graded">Đã chấm xong ✓</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tìm Kiếm:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Họ tên hoặc Mã LMS..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* THANH CÔNG CỤ XUẤT NHẬP */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-semibold">
            Tìm thấy: <strong className="text-blue-950 font-bold">{filteredSubmissions.length}</strong> bài nộp
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1"
            >
              <span>📥</span>
              <span>Xuất File Excel (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1"
            >
              <span>💾</span>
              <span>Sao Lưu JSON</span>
            </button>

            <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer flex items-center space-x-1">
              <span>📂</span>
              <span>Nhập JSON</span>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleClearAllData}
              className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
            >
              Xóa Dữ Liệu
            </button>
          </div>
        </div>
      </div>

      {/* BẢNG CƠ SỞ DỮ LIỆU BÀI THI */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Mã LMS</th>
                <th className="py-3 px-4">Chế Độ</th>
                <th className="py-3 px-4">Mã Đề</th>
                <th className="py-3 px-4 text-center">Thời Gian Làm</th>
                <th className="py-3 px-4 text-center">Điểm TN</th>
                <th className="py-3 px-4 text-center">Tự Luận</th>
                <th className="py-3 px-4 text-center">Tổng Điểm</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="12" className="py-12 text-center text-slate-500 font-medium">
                    Chưa có bài nộp nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const autoScore = sub.mcqPoints !== undefined ? sub.mcqPoints : (sub.score !== undefined ? sub.score : 0);
                  const finalScore = sub.finalScore !== undefined ? sub.finalScore : autoScore;
                  const hasPenalty = sub.violations >= 3;
                  return (
                    <tr key={sub.id || idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono-code text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{sub.fullName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 font-bold text-blue-900 border border-blue-200">
                          Lớp {sub.studentClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-code text-blue-700 font-bold">{sub.studentId || '—'}</td>
                      <td className="py-3 px-4">
                        {sub.mode === 'exam' ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
                            Thi Giữa HK1
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                            Ôn Tập Đề Cương
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono-code font-bold text-slate-800">
                        {sub.examCode || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono-code text-slate-600">
                        {sub.durationFormatted || '45 phút'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {autoScore}đ
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {sub.isGraded ? (
                          <span className="text-indigo-600 font-bold">+{sub.essayTotal}đ</span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa chấm</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-base font-black text-emerald-600">
                          {finalScore}
                        </span>
                        <span className="text-[11px] text-slate-400"> / 10đ</span>
                        {hasPenalty && (
                          <div className="text-[10px] text-red-600 font-extrabold">
                            ⚠️ Vi phạm {sub.violations} lần
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {sub.isGraded ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            Đã chấm ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Chờ chấm ⏳
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openGradingModal(sub)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"
                          >
                            <span>✍️</span>
                            <span>Chấm</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubmission(sub.id, sub.fullName || sub.studentName || sub.studentId, sub.examCode || 'Bài thi')}
                            title="Xóa bài nộp này khỏi hệ thống"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
