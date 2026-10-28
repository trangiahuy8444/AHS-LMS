import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAdmin } from '../AdminContext.js';

export default function AnalyticsTab() {
  const { analyticsData } = useAdmin();

  return (
    <div className="space-y-6">
      
      {/* THỐNG KÊ TỔNG QUAN KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Tổng Lượt Bài Thi</span>
          <p className="text-3xl font-black text-blue-950 mt-1">{analyticsData.totalExams}</p>
          <span className="text-[11px] text-blue-700 font-semibold">Bài kiểm tra chính thức</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Điểm Trung Bình</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{analyticsData.avg}đ</p>
          <span className="text-[11px] text-slate-500">Thang điểm 10.0</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Điểm Cao Nhất</span>
          <p className="text-3xl font-black text-amber-600 mt-1">{analyticsData.max}đ</p>
          <span className="text-[11px] text-slate-500">Thủ khoa phòng thi</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Điểm Thấp Nhất</span>
          <p className="text-3xl font-black text-rose-600 mt-1">{analyticsData.min}đ</p>
          <span className="text-[11px] text-slate-500">Cần kèm cặp thêm</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Tỷ Lệ Đạt (&ge; 5.0đ)</span>
          <p className="text-3xl font-black text-blue-700 mt-1">{analyticsData.passRate}%</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Đạt chuẩn chuyên môn</span>
        </div>
      </div>

      {/* BIỂU ĐỒ PHỔ ĐIỂM THEO 4 MỨC XẾP LOẠI */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-5">
        <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
          <span>📈</span>
          <span>PHỔ ĐIỂM VÀ TỶ LỆ PHÂN LOẠI HỌC SINH</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-800">Giỏi (8.0 - 10.0đ)</span>
              <span className="font-mono-code font-black text-emerald-700">{analyticsData.distribution.gioi} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.gioi / analyticsData.totalExams) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-blue-800">Khá (6.5 - 7.9đ)</span>
              <span className="font-mono-code font-black text-blue-700">{analyticsData.distribution.kha} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.kha / analyticsData.totalExams) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-800">Trung Bình (5.0 - 6.4đ)</span>
              <span className="font-mono-code font-black text-amber-700">{analyticsData.distribution.trungBinh} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.trungBinh / analyticsData.totalExams) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-rose-800">Chưa Đạt (&lt; 5.0đ)</span>
              <span className="font-mono-code font-black text-rose-700">{analyticsData.distribution.chuaDat} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${analyticsData.totalExams > 0 ? (analyticsData.distribution.chuaDat / analyticsData.totalExams) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* ITEM ANALYSIS: CÂU TRẮC NGHIỆM HỌC SINH SAI NHIỀU NHẤT */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
          <span>⚠️</span>
          <span>PHÂN TÍCH ITEM: TOP CÂU HỎI TRẮC NGHIỆM HỌC SINH LÀM SAI NHIỀU NHẤT</span>
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Giúp Thầy Trần Gia Huy phát hiện lỗ hổng kiến thức để giảng dạy củng cố hoặc chữa bài trọng tâm trên lớp.
        </p>

        <div className="space-y-2.5 pt-2">
          {analyticsData.topMistakes.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">Chưa có đủ dữ liệu câu hỏi sai để thống kê.</p>
          ) : (
            analyticsData.topMistakes.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800">{item.qText}</span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 shrink-0">
                  {item.count} lượt sai
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
