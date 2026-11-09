import React, { useEffect, useRef, useState } from 'react';
import { ROSTER_BY_CLASS } from '../../core/roster-data.js';
import { useAdmin } from '../AdminContext.js';
import ClassAccessPanel from '../live/ClassAccessPanel.jsx';
import LiveSessionList from '../live/LiveSessionList.jsx';

export default function LiveTab() {
  const { liveSessions, liveFilter, setLiveFilter, handleExtendTimeAll, handleCleanStaleSessions } = useAdmin();

  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const searchRef = useRef(null);
  const classes = [...new Set([...Object.keys(ROSTER_BY_CLASS), ...liveSessions.map(s => s.studentClass).filter(Boolean)])].sort((a,b) => a.localeCompare(b,'vi',{numeric:true}));
  useEffect(() => {
    const focusSearch = event => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-base font-black text-blue-950 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Giám sát học sinh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Theo dõi bài làm, xử lý khóa và gia hạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCleanStaleSessions}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5 shadow-sm"
            title="Xóa thí sinh đã nộp bài hoặc mất kết nối quá 15 phút"
          >
            <span>🧹</span>
            <span>Dọn phiên hết ca</span>
          </button>
          <button
            type="button"
            onClick={() => handleExtendTimeAll(5)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow"
          >
            <span>⏱️</span>
            <span>+5 phút toàn phòng</span>
          </button>
          <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
            Đang làm bài: {liveSessions.filter(s => ['in_progress', 'practicing'].includes(s.status)).length} em
          </span>
        </div>
      </div>

      {/* BẢNG ĐIỀU PHỐI CA THI THEO LỚP HỌC (CLASS ACCESS CONTROL MATRIX) */}
      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-blue-950">Điều phối lớp · Mở/đóng thi & quyền xem bài</summary>
        <div className="px-3 pb-3"><ClassAccessPanel /></div>
      </details>

      {/* BỘ LỌC CHẾ ĐỘ GIÁM SÁT TRỰC TIẾP */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
        <button
          type="button"
          onClick={() => setLiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            liveFilter === 'all'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm'
          }`}
        >
          <span>Tất Cả Thí Sinh</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono-code font-bold">
            {liveSessions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setLiveFilter('exam')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            liveFilter === 'exam'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm'
          }`}
        >
          <span>📝 Đang Thi Chính Thức</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono-code font-bold">
            {liveSessions.filter(s => s.mode === 'exam').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setLiveFilter('practice')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            liveFilter === 'practice'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-sm'
          }`}
        >
          <span>📖 Đang Ôn Tập Đề Cương</span>
          <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono-code font-bold">
            {liveSessions.filter(s => s.mode === 'practice').length}
          </span>
        </button>
      </div>

      <section className="live-search-tools" aria-label="Tìm nhanh học sinh">
        <label>Tìm học sinh <span className="font-normal text-slate-500">· phím /</span>
          <input ref={searchRef} type="search" aria-label="Tên hoặc mã LMS" placeholder="Tên có dấu/không dấu hoặc mã LMS…" value={query}
            onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setQuery(''); }} />
        </label>
        <label>Lớp
          <select aria-label="Lọc lớp giám sát" value={classFilter} onChange={event => setClassFilter(event.target.value)}>
            <option value="all">Tất cả lớp</option>
            {classes.map(cls => <option key={cls} value={cls}>Lớp {cls}</option>)}
          </select>
        </label>
        <label>Trạng thái
          <select aria-label="Lọc trạng thái giám sát" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="locked">Đang khóa</option>
            <option value="violations">Có vi phạm</option>
          </select>
        </label>
        <button type="button" disabled={!query && classFilter === 'all' && statusFilter === 'all'} onClick={() => { setQuery(''); setClassFilter('all'); setStatusFilter('all'); searchRef.current?.focus(); }}>Xóa tìm / lọc</button>
      </section>

      {/* DANH SÁCH THÍ SINH ĐANG TRỰC TUYẾN THEO LỚP */}
      <LiveSessionList query={query} classFilter={classFilter} statusFilter={statusFilter} />
    </div>
  );
}
