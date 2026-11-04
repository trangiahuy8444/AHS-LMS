import React, { useState, useMemo } from 'react';
import { useAdmin } from '../AdminContext.js';

export default function AnalyticsTab() {
  const { analyticsData, practiceAnalyticsData, submissions, practiceSubs, ALL_CLASSES_BY_GRADE } = useAdmin();

  // Chế độ phân tích: 'exam' (Bài thi chính thức) hoặc 'practice' (Bài ôn tập đề cương)
  const [analyticsType, setAnalyticsType] = useState('exam');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  const isPractice = analyticsType === 'practice';

  // Lấy danh sách lớp phù hợp với khối đang chọn
  const availableClasses = useMemo(() => {
    if (filterGrade === 'all') {
      return ['8/19', '8/20', '8/21', '8/22', '8/23', '9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26', '10/14', '10/15', '10/16'];
    }
    return ALL_CLASSES_BY_GRADE?.[Number(filterGrade)] || [];
  }, [filterGrade, ALL_CLASSES_BY_GRADE]);

  // Lọc danh sách bài làm theo Chế độ, Khối & Lớp
  const filteredList = useMemo(() => {
    let list = [];
    if (isPractice) {
      const map = new Map();
      (practiceSubs || []).forEach(sub => {
        const key = sub.id || `${sub.studentClass}_${sub.studentId}_${sub.submittedAt}`;
        map.set(key, sub);
      });
      (submissions || []).filter(sub => sub.mode === 'practice').forEach(sub => {
        const key = sub.id || `${sub.studentClass}_${sub.studentId}_${sub.submittedAt}`;
        if (!map.has(key)) map.set(key, sub);
      });
      list = Array.from(map.values());
    } else {
      list = (submissions || []).filter(sub => sub.mode === 'exam');
    }

    return list.filter(sub => {
      if (filterGrade !== 'all' && Number(sub.grade) !== Number(filterGrade)) return false;
      if (filterClass !== 'all' && sub.studentClass !== filterClass) return false;
      return true;
    });
  }, [isPractice, submissions, practiceSubs, filterGrade, filterClass]);

  // Tính toán số liệu thống kê chi tiết & phổ điểm
  const currentStats = useMemo(() => {
    const scores = filteredList.map(sub => {
      if (sub.finalScore !== undefined) return sub.finalScore;
      if (sub.bestScore !== undefined) return sub.bestScore;
      if (sub.score !== undefined) return sub.score;
      return sub.mcqPoints || 0;
    });

    const totalCount = filteredList.length;
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
    const max = scores.length > 0 ? Math.max(...scores).toFixed(1) : 0;
    const min = scores.length > 0 ? Math.min(...scores).toFixed(1) : 0;

    const distribution = {
      gioi: scores.filter(sc => sc >= 8.0).length,
      kha: scores.filter(sc => sc >= 6.5 && sc < 8.0).length,
      trungBinh: scores.filter(sc => sc >= 5.0 && sc < 6.5).length,
      chuaDat: scores.filter(sc => sc < 5.0).length
    };

    const passCount5 = scores.filter(sc => sc >= 5.0).length;
    const passRate5 = totalCount > 0 ? ((passCount5 / totalCount) * 100).toFixed(1) : 0;

    const passCount6 = scores.filter(sc => sc >= 6.0).length;
    const passRate6 = totalCount > 0 ? ((passCount6 / totalCount) * 100).toFixed(1) : 0;

    const uniqueStudents = new Set(filteredList.map(sub => `${sub.studentClass}_${sub.studentId || sub.fullName}`));
    const totalUniqueStudents = uniqueStudents.size;
    const avgAttempts = totalUniqueStudents > 0 ? (totalCount / totalUniqueStudents).toFixed(1) : 0;

    // Phân tích câu hỏi sai nhiều nhất (Item Analysis)
    const mistakeMap = {};
    filteredList.forEach(sub => {
      if (sub.answers?.mcq) {
        const gradeObj = sub.grade === 8 ? window.EXAM_DATA_G8 : (sub.grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10);
        if (isPractice) {
          const qList = gradeObj?.practiceQuestions || [];
          qList.forEach(q => {
            const userAns = sub.answers.mcq[q.id] || sub.answers.mcq[q.num];
            if (userAns !== undefined && userAns !== q.correctAnswer) {
              const key = `K${sub.grade}_C${q.num || q.id}_${(q.question || '').slice(0, 48)}...`;
              mistakeMap[key] = (mistakeMap[key] || 0) + 1;
            }
          });
        } else if (sub.examCode) {
          const examObj = gradeObj?.officialExams?.[sub.examCode];
          const qList = sub.grade === 10 ? examObj?.part1_mcq : examObj?.mcqQuestions;
          if (qList) {
            qList.forEach(q => {
              const userAns = sub.answers.mcq[q.num];
              if (userAns !== undefined && userAns !== q.correctAnswer) {
                const key = `K${sub.grade}_C${q.num}_${(q.question || '').slice(0, 48)}...`;
                mistakeMap[key] = (mistakeMap[key] || 0) + 1;
              }
            });
          }
        }
      }
    });

    const topMistakes = Object.entries(mistakeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([qText, count]) => ({ qText, count }));

    return {
      totalCount,
      totalUniqueStudents,
      avgAttempts,
      avg,
      max,
      min,
      distribution,
      passCount5,
      passRate5,
      passCount6,
      passRate6,
      topMistakes
    };
  }, [filteredList, isPractice]);

  return (
    <div className="space-y-6">
      
      {/* THANH ĐIỀU HƯỚNG CHỌN CHẾ ĐỘ & BỘ LỌC PHÂN TÍCH */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* NÚT CHUYỂN CHẾ ĐỘ: THI CHÍNH THỨC / ÔN TẬP ĐỀ CƯƠNG */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setAnalyticsType('exam')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-2 ${
                !isPractice
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📝</span>
              <span>PHỔ ĐIỂM BÀI THI CHÍNH THỨC ({analyticsData.totalExams || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setAnalyticsType('practice')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center space-x-2 ${
                isPractice
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📖</span>
              <span>PHỔ ĐIỂM BÀI ÔN TẬP ĐỀ CƯƠNG ({practiceAnalyticsData?.totalPractices || 0})</span>
            </button>
          </div>

          {/* BỘ LỌC KHỐI VÀ LỚP */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <label className="font-bold text-slate-700 uppercase text-[11px]">Khối Lớp:</label>
              <select
                value={filterGrade}
                onChange={e => {
                  setFilterGrade(e.target.value);
                  setFilterClass('all');
                }}
                className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="all">Tất cả Khối (8, 9, 10)</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
                <option value="10">Khối 10</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-bold text-slate-700 uppercase text-[11px]">Lớp Học:</label>
              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="all">Tất cả các lớp</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>Lớp {cls}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DÒNG THÔNG BÁO BỐI CẢNH SƯ PHẠM */}
        <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 ${
          isPractice ? 'bg-purple-50 text-purple-950 border border-purple-200' : 'bg-blue-50 text-blue-950 border border-blue-200'
        }`}>
          <span className="text-base">{isPractice ? '💡' : '🎯'}</span>
          <span>
            {isPractice
              ? <><strong>PHÂN TÍCH ÔN TẬP ĐỀ CƯƠNG:</strong> Thống kê quá trình rèn luyện của học sinh. Chuẩn đạt Asian School yêu cầu học sinh hoàn thành đạt từ <strong>6.0 điểm trở lên</strong> ít nhất <strong>5 lần</strong>.</>
              : <><strong>PHÂN TÍCH BÀI THI CHÍNH THỨC:</strong> Đánh giá kết quả kiểm tra định kỳ 45 phút trên thang điểm 10.0 phục vụ tổng kết học kỳ.</>
            }
          </span>
        </div>
      </div>
      
      {/* THỐNG KÊ TỔNG QUAN KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* CARD 1: TỔNG LƯỢT */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">
            {isPractice ? 'Tổng Lượt Ôn Tập' : 'Tổng Lượt Bài Thi'}
          </span>
          <p className={`text-3xl font-black mt-1 ${isPractice ? 'text-purple-950' : 'text-blue-950'}`}>
            {currentStats.totalCount}
          </p>
          <span className="text-[11px] text-slate-500">
            {isPractice
              ? `${currentStats.totalUniqueStudents} học sinh • TB ${currentStats.avgAttempts} lượt/em`
              : 'Bài kiểm tra chính thức'}
          </span>
        </div>

        {/* CARD 2: ĐIỂM TRUNG BÌNH */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Điểm Trung Bình</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{currentStats.avg}đ</p>
          <span className="text-[11px] text-slate-500">
            {isPractice ? 'Thang điểm đề cương' : 'Thang điểm 10.0'}
          </span>
        </div>

        {/* CARD 3: ĐIỂM CAO NHẤT */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Điểm Cao Nhất</span>
          <p className="text-3xl font-black text-amber-600 mt-1">{currentStats.max}đ</p>
          <span className="text-[11px] text-slate-500">
            {isPractice ? 'Thủ khoa đề cương' : 'Thủ khoa phòng thi'}
          </span>
        </div>

        {/* CARD 4: ĐIỂM THẤP NHẤT */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Điểm Thấp Nhất</span>
          <p className="text-3xl font-black text-rose-600 mt-1">{currentStats.min}đ</p>
          <span className="text-[11px] text-slate-500">
            {isPractice ? 'Cần tăng lượt rèn luyện' : 'Cần kèm cặp thêm'}
          </span>
        </div>

        {/* CARD 5: TỶ LỆ ĐẠT */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">
            {isPractice ? 'Tỷ Lệ Đạt (≥ 6.0đ)' : 'Tỷ Lệ Đạt (≥ 5.0đ)'}
          </span>
          <p className={`text-3xl font-black mt-1 ${isPractice ? 'text-purple-700' : 'text-blue-700'}`}>
            {isPractice ? currentStats.passRate6 : currentStats.passRate5}%
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {isPractice ? `${currentStats.passCount6} lượt đạt chuẩn LMS` : 'Đạt chuẩn chuyên môn'}
          </span>
        </div>
      </div>

      {/* BIỂU ĐỒ PHỔ ĐIỂM THEO 4 MỨC XẾP LOẠI */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
            <span>📈</span>
            <span>
              PHỔ ĐIỂM & TỶ LỆ PHÂN LOẠI {isPractice ? 'BÀI ÔN TẬP ĐỀ CƯƠNG' : 'BÀI THI CHÍNH THỨC'}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            (Tổng số: <strong>{currentStats.totalCount}</strong> lượt làm bài)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* MỨC GIỎI */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-800">Giỏi (8.0 - 10.0đ)</span>
              <span className="font-mono-code font-black text-emerald-700">{currentStats.distribution.gioi} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentStats.totalCount > 0 ? (currentStats.distribution.gioi / currentStats.totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-emerald-700 text-right font-bold">
              {currentStats.totalCount > 0 ? ((currentStats.distribution.gioi / currentStats.totalCount) * 100).toFixed(1) : 0}%
            </p>
          </div>

          {/* MỨC KHÁ */}
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-blue-800">Khá (6.5 - 7.9đ)</span>
              <span className="font-mono-code font-black text-blue-700">{currentStats.distribution.kha} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentStats.totalCount > 0 ? (currentStats.distribution.kha / currentStats.totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-blue-700 text-right font-bold">
              {currentStats.totalCount > 0 ? ((currentStats.distribution.kha / currentStats.totalCount) * 100).toFixed(1) : 0}%
            </p>
          </div>

          {/* MỨC TRUNG BÌNH */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-800">Trung Bình (5.0 - 6.4đ)</span>
              <span className="font-mono-code font-black text-amber-700">{currentStats.distribution.trungBinh} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentStats.totalCount > 0 ? (currentStats.distribution.trungBinh / currentStats.totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-amber-700 text-right font-bold">
              {currentStats.totalCount > 0 ? ((currentStats.distribution.trungBinh / currentStats.totalCount) * 100).toFixed(1) : 0}%
            </p>
          </div>

          {/* MỨC CHƯA ĐẠT */}
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-rose-800">Chưa Đạt (&lt; 5.0đ)</span>
              <span className="font-mono-code font-black text-rose-700">{currentStats.distribution.chuaDat} em</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentStats.totalCount > 0 ? (currentStats.distribution.chuaDat / currentStats.totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-rose-700 text-right font-bold">
              {currentStats.totalCount > 0 ? ((currentStats.distribution.chuaDat / currentStats.totalCount) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* ITEM ANALYSIS: CÂU TRẮC NGHIỆM HỌC SINH SAI NHIỀU NHẤT */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center space-x-2">
          <span>⚠️</span>
          <span>
            PHÂN TÍCH ITEM: TOP CÂU HỎI {isPractice ? 'ĐỀ CƯƠNG ÔN TẬP' : 'BÀI THI CHÍNH THỨC'} HỌC SINH LÀM SAI NHIỀU NHẤT
          </span>
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          {isPractice
            ? 'Giúp Thầy Trần Gia Huy phát hiện lỗ hổng kiến thức trong đề cương ôn tập để củng cố, giảng lại hoặc chữa bài trọng tâm trên lớp trước ngày thi.'
            : 'Giúp Thầy Trần Gia Huy đánh giá độ phân hóa và câu hỏi gây nhầm lẫn nhiều nhất trong kỳ kiểm tra chính thức.'
          }
        </p>

        <div className="space-y-2.5 pt-2">
          {currentStats.topMistakes.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">Chưa có đủ dữ liệu câu hỏi sai để thống kê cho bộ lọc hiện hành.</p>
          ) : (
            currentStats.topMistakes.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 min-w-0 pr-3">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800 truncate">{item.qText}</span>
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
