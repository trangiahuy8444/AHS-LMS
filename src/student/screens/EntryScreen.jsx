import React, { useState } from 'react';
import { useStudent } from '../StudentContext.js';
import { CLASS_LISTS } from '../constants.js';
import { getStudentsByClass, verifyStudentLms, findStudentInClassByLms } from '../../core/roster-data.js';

// 1. MÀN HÌNH CHỌN CHẾ ĐỘ & ĐĂNG KÝ VÀO PHÒNG LÀM BÀI — BỐ CỤC 1A (SPLIT CANVAS 2 CỘT CHUẨN ASIAN SCHOOL)
export default function EntryScreen() {
  const { grade, setGrade, mode, setMode, examState, fullName, setFullName, studentClass,
    setStudentClass, studentId, setStudentId, isContactingServer, examPasswordInput,
    setExamPasswordInput, showExamPassword, setShowExamPassword, showDialog, classAccessMode,
    handleStart, handleReviewLookup, config = {}, selectedExamCode, setSelectedExamCode,
    isEmergencyLmsOverride, setIsEmergencyLmsOverride } = useStudent();

  const [isManualName, setIsManualName] = useState(false);
  const classRoster = getStudentsByClass(studentClass);
  const matchedStudent = classRoster.find(s => s.fullName === fullName);
  const isLmsVerified = matchedStudent ? verifyStudentLms(matchedStudent, studentId) : false;

  if (!(examState === 'entry')) return null;

  const configuredCodes = config.activeCodes?.[String(grade)];
  const availableExamCodes = Array.isArray(configuredCodes)
    ? [...new Set(configuredCodes.filter(code => typeof code === 'string' && code.trim()))]
    : [];

  const isAnyReviewOpen = Boolean(
    config?.allowStudentReviewOfficialExam ||
    (config?.classReviewControl && Object.values(config.classReviewControl).some(Boolean))
  );
  const isCurrentClassReviewOpen = Boolean(
    config?.allowStudentReviewOfficialExam ||
    (studentClass && config?.classReviewControl && config.classReviewControl[studentClass] === true)
  );

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* ==================== CỘT TRÁI (38% ~ 5/12 CỘT): THÔNG TIN CA THI & KỶ LUẬT PHÒNG THI ==================== */}
      <div className="lg:col-span-5 space-y-5">
        
        {/* THẺ NHẬN DIỆN THƯƠNG HIỆU ASIAN SCHOOL */}
        <div className="bg-gradient-to-br from-[#0267B1] via-[#1A5493] to-[#0A2540] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-blue-400/30 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-2xl shadow-sm shrink-0">
              <img
                src={window.ASIAN_SCHOOL_LOGO_BASE64 || "../assets/logo_asian_school.png"}
                alt="Logo Asian School"
                className="h-10 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-sky-300 block truncate">
                TRƯỜNG QUỐC TẾ Á CHÂU
              </span>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight uppercase truncate">
                CỔNG KHẢO THÍ HỌC SINH
              </h2>
              <p className="text-xs text-blue-200 mt-0.5 font-medium truncate">
                Bộ Môn Tin Học — Năm Học 2026 - 2027
              </p>
            </div>
          </div>

          {/* HỘP TRẠNG THÁI CA THI & PHÒNG MÁY LAB */}
          <div className="space-y-2.5 border-t border-blue-400/30 pt-4 text-xs font-medium">
            <div className="flex justify-between items-center bg-blue-900/50 p-2.5 rounded-xl border border-blue-400/20">
              <span className="text-blue-200">Kỳ Khảo Thí:</span>
              <span className="font-black text-amber-300">Kiểm Tra Giữa HK1</span>
            </div>
            <div className="flex justify-between items-center bg-blue-900/50 p-2.5 rounded-xl border border-blue-400/20">
              <span className="text-blue-200">Thời Gian Làm Bài:</span>
              <span className="font-black text-white">45 Phút (Chính thức)</span>
            </div>
            <div className="flex justify-between items-center bg-blue-900/50 p-2.5 rounded-xl border border-blue-400/20">
              <span className="text-blue-200">Trạng Thái Lớp {studentClass}:</span>
              <span className="font-black text-xs px-2 py-0.5 rounded-lg border flex items-center space-x-1.5 ${
                classAccessMode === 'exam_only'
                  ? 'bg-red-500/20 text-red-300 border-red-400/40 animate-pulse'
                  : (classAccessMode === 'practice_only'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : (classAccessMode === 'both_open'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                          : 'bg-slate-700/50 text-slate-300 border-slate-600'))
              }">
                <span>{
                  classAccessMode === 'exam_only' ? '🔴 Đang trong ca thi' :
                  (classAccessMode === 'practice_only' ? '🟢 Đang mở ôn tập' :
                  (classAccessMode === 'both_open' ? '🟡 Mở cả 2 chế độ' : '⚫ Đang đóng cổng'))
                }</span>
              </span>
            </div>
          </div>
        </div>

        {/* HỘP HƯỚNG DẪN HOÀN THÀNH & KỶ LUẬT PHÒNG THI */}
        {mode === 'review' ? (
          <div className="border-2 border-indigo-400 bg-indigo-50/80 rounded-3xl p-5 text-slate-800 space-y-2.5 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                HƯỚNG DẪN ĐỐI SOÁT BÀI THI & CHỐT ĐIỂM
              </h4>
            </div>
            <div className="text-xs space-y-1.5 pl-8 text-slate-700 font-medium leading-relaxed">
              <p>• Hệ thống sẽ tải lại bài thi chính thức của em cùng điểm trắc nghiệm và điểm tự luận đã được Thầy chấm.</p>
              <p>• Em kiểm tra kỹ từng câu hỏi, lời phê của Thầy và bấm <strong>"XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC"</strong> để hoàn tất.</p>
              <p className="text-indigo-900 font-bold pt-1">💡 Chức năng này không yêu cầu Mật khẩu phòng thi.</p>
            </div>
          </div>
        ) : mode === 'practice' ? (
          <div className="border-2 border-blue-400 bg-blue-50/80 rounded-3xl p-5 text-slate-800 space-y-2.5 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📖</span>
              <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                HƯỚNG DẪN ÔN TẬP ĐỀ CƯƠNG (LMS)
              </h4>
            </div>
            <div className="text-xs space-y-1.5 pl-8 text-slate-700 font-medium leading-relaxed">
              <p>📖 <strong className="text-blue-900">Tài liệu cho phép:</strong> Được phép sử dụng <strong>Sách giáo khoa</strong> trong quá trình tự luyện.</p>
              <p>🎯 <strong className="text-blue-900">Yêu cầu đạt:</strong> Học sinh cần hoàn thành bài làm đạt từ <strong>6.0 điểm trở lên</strong> ít nhất <strong>5 lần</strong> để đủ điều kiện thi.</p>
              <p className="text-amber-800 font-bold pt-1">💡 Sau khi nộp bài, hệ thống sẽ mở Rubric chấm phần Tự luận để học sinh đối chiếu bài làm.</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-red-500 bg-red-50/80 rounded-3xl p-5 text-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-red-200 pb-2.5">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="text-xs font-black text-red-950 uppercase tracking-wider">
                  KỶ LUẬT PHÒNG THI CHÍNH THỨC
                </h4>
                <p className="text-[11px] text-red-700 font-semibold mt-0.5">Thời gian: 45 Phút • Không được dùng tài liệu</p>
              </div>
            </div>
            <div className="text-xs space-y-2 leading-relaxed text-slate-700 font-medium pl-1">
              <p>• <strong className="text-red-700">Chính chủ thí sinh:</strong> Học sinh chỉ làm bài đúng tên và Mã LMS của mình. Tuyệt đối không vào hộ bạn khác.</p>
              <p>• <strong className="text-red-700">Cấm gian lận:</strong> Không chuyển Tab, không thu nhỏ cửa sổ. Vi phạm 3 lần bài thi tự động bị phong tỏa.</p>
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 font-semibold">
                <strong>🔌 LƯU Ý PHÒNG MÁY:</strong> Không chạm vào dây nguồn hoặc dây mạng. Nếu xảy ra sự cố, giơ tay báo ngay cho Giám thị.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==================== CỘT PHẢI (62% ~ 7/12 CỘT): FORM CHỌN TÊN & XÁC THỰC LMS ==================== */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
        
        {/* 1. CHỌN MỤC ĐÍCH LÀM BÀI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Chọn Mục Đích Làm Bài <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
              Lớp {studentClass}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* NÚT ÔN TẬP ĐỀ CƯƠNG */}
            <button
              type="button"
              onClick={() => {
                if (classAccessMode === 'exam_only') {
                  showDialog('Lớp Đang Trong Ca Thi Chính Thức', `Lớp ${studentClass} hiện đang trong ca kiểm tra 45 phút! Chế độ ôn tập đang tạm đóng để các em tập trung làm bài thi.`, 'warning');
                  return;
                }
                setMode('practice');
              }}
              disabled={classAccessMode === 'closed'}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition relative ${
                classAccessMode === 'exam_only'
                  ? 'opacity-40 border-slate-200 bg-slate-100 cursor-not-allowed'
                  : (mode === 'practice'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50')
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📖</span>
                <span className="font-bold text-sm text-blue-950">ÔN TẬP ĐỀ CƯƠNG</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                {grade === 10
                  ? 'Bộ đề ngẫu nhiên: 19 câu Trắc nghiệm + 3 câu Đúng/Sai (tính điểm thang 7.75) + 3 câu Tự luận để tự luyện (không tính điểm).'
                  : 'Bộ đề ngẫu nhiên: 28 câu Trắc nghiệm (tính điểm thang 7) + 3 câu Tự luận để tự luyện (không tính điểm).'
                }
              </p>
              {classAccessMode === 'exam_only' && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  ⚠️ Tạm đóng
                </span>
              )}
            </button>

            {/* NÚT THI GIỮA HK1 */}
            <button
              type="button"
              onClick={() => {
                if (classAccessMode === 'practice_only') {
                  showDialog('Ca Thi Chưa Bắt Đầu', `Ca thi chính thức của Lớp ${studentClass} chưa bắt đầu.\n\nEm vui lòng chọn "ÔN TẬP ĐỀ CƯƠNG" để luyện tập trước nhé!`, 'info');
                  return;
                }
                setMode('exam');
              }}
              disabled={classAccessMode === 'closed'}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition relative ${
                classAccessMode === 'practice_only'
                  ? 'opacity-40 border-slate-200 bg-slate-100 cursor-not-allowed'
                  : (mode === 'exam'
                      ? 'border-red-600 bg-red-50/70 shadow-sm ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50')
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📝</span>
                <span className="font-bold text-sm text-red-950">THI GIỮA HK1</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                45 phút, cần mật khẩu phòng thi, chống gian lận.
              </p>
              {classAccessMode === 'practice_only' && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                  🔒 Chưa mở ca thi
                </span>
              )}
              {classAccessMode === 'exam_only' && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                  🔴 Đang thi!
                </span>
              )}
            </button>

            {/* NÚT XEM LẠI BÀI THI & CHỐT ĐIỂM */}
            <button
              type="button"
              onClick={() => {
                if (studentClass && !isCurrentClassReviewOpen) {
                  showDialog(
                    'Chức Năng Chưa Mở ⏳',
                    `Thầy Trần Gia Huy hiện đang chấm bài tự luận cho Lớp ${studentClass} và chưa mở chức năng xem lại bài làm.\n\nEm vui lòng chờ Thầy thông báo sau khi lớp mình hoàn tất chấm điểm nhé!`,
                    'info'
                  );
                  return;
                }
                if (!studentClass && !isAnyReviewOpen) {
                  showDialog(
                    'Chức Năng Chưa Mở ⏳',
                    'Thầy Trần Gia Huy hiện đang chấm bài và chưa mở chức năng xem lại bài làm.\n\nEm vui lòng chờ Thầy thông báo sau khi hoàn tất chấm điểm nhé!',
                    'info'
                  );
                  return;
                }
                setMode('review');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition relative ${
                mode === 'review'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📋</span>
                <span className="font-bold text-sm text-indigo-950">XEM BÀI & CHỐT ĐIỂM</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Xem lại bài thi đã nộp, đối soát điểm số và chốt điểm.
              </p>
              {studentClass ? (
                isCurrentClassReviewOpen ? (
                  <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🟢 Lớp {studentClass}: Đang mở
                  </span>
                ) : (
                  <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                    🔒 Lớp {studentClass}: Chờ chấm
                  </span>
                )
              ) : isAnyReviewOpen ? (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🟢 Mở theo từng lớp
                </span>
              ) : (
                <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                  🔒 Đang chờ chấm
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. CHỌN KHỐI LỚP */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Chọn Khối Lớp <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[8, 9, 10].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`py-3 rounded-2xl font-black text-sm border-2 transition ${
                  grade === g
                    ? 'border-blue-700 bg-blue-700 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                Khối {g}
              </button>
            ))}
          </div>
        </div>

        {/* 3 & 4. CHỌN LỚP HỌC VÀ HỌ TÊN THÍ SINH (TRONG 305 HỌC SINH) */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="student-class-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Lớp học <span className="text-red-500">*</span>
              </label>
              <select
                id="student-class-select"
                value={studentClass}
                onChange={e => {
                  setStudentClass(e.target.value);
                  setFullName('');
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black bg-white text-slate-900 shadow-sm"
              >
                {(CLASS_LISTS[grade] || []).map(cls => (
                  <option key={cls} value={cls}>Lớp {cls}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="student-name-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                {classRoster.length > 0 && mode !== 'review' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualName(!isManualName);
                      setFullName('');
                    }}
                    className="text-[10px] text-blue-700 hover:underline font-bold"
                  >
                    {isManualName ? '← Chọn từ danh sách lớp' : '+ Tự gõ tên'}
                  </button>
                )}
              </div>

              {mode === 'review' ? (
                <input
                  type="text"
                  value={fullName}
                  readOnly
                  placeholder="Họ tên sẽ tự động nạp từ bài thi..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm"
                />
              ) : (!isManualName && classRoster.length > 0) ? (
                <select
                  id="student-name-select"
                  value={fullName}
                  onChange={e => {
                    const chosen = e.target.value;
                    if (chosen === '__guest__') {
                      setIsManualName(true);
                      setFullName('');
                    } else {
                      setFullName(chosen);
                    }
                  }}
                  className="w-full px-3.5 py-3 rounded-xl border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black bg-blue-50/70 text-blue-950 shadow-sm"
                >
                  <option value="">-- Chọn tên em trong danh sách Lớp {studentClass} --</option>
                  {classRoster.map(s => (
                    <option key={s.stt} value={s.fullName}>
                      STT {String(s.stt).padStart(2, '0')} - {s.fullName}
                    </option>
                  ))}
                  <option value="__guest__">➕ [+ Em là Thí sinh bổ sung / Học sinh mới]</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onBlur={e => window.AsianSchoolNormalize && setFullName(window.AsianSchoolNormalize.normalizeStudentName(e.target.value))}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white text-slate-900 shadow-sm"
                />
              )}
            </div>
          </div>

          {/* 5. THẺ ĐỊNH DANH HỌC SINH SỐ & XÁC THỰC MÃ LMS 2 LỚP CHỐNG THI HỘ */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 uppercase flex items-center space-x-1.5">
                <span>🛡️</span><span>5. XÁC THỰC DANH TÍNH CHÍNH CHỦ (MÃ LMS) <span className="text-red-500">*</span></span>
              </span>
              {matchedStudent && (
                <span className="text-[11px] text-emerald-800 font-mono-code font-bold">
                  Gợi ý: {matchedStudent.loginId ? matchedStudent.loginId : 'Nhập toàn bộ mã của em'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7">
                <input
                  type="text"
                  value={studentId}
                  onChange={e => {
                    const val = e.target.value;
                    // Cho phép nhập số và dấu gạch ngang '-', không bị tự động xóa khi gõ
                    const clean = val.replace(/[^0-9-]/g, '').slice(0, 20);
                    setStudentId(clean);
                    if (isEmergencyLmsOverride) setIsEmergencyLmsOverride(false);

                    // Auto-fill: Nếu chưa chọn tên nhưng gõ đúng toàn bộ mã LMS (dù có hoặc không có dấu '-') thì tự động chọn đúng học sinh!
                    if (!fullName && clean.replace(/-/g, '').length >= 7) {
                      const autoFound = findStudentInClassByLms(studentClass, clean);
                      if (autoFound) {
                        setFullName(autoFound.fullName);
                      }
                    }
                  }}
                  placeholder="Nhập toàn bộ Mã LMS (Ví dụ: 01-19-0002 hoặc 01190002)"
                  className="w-full px-4 py-3 rounded-xl border-2 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-black font-mono-code bg-white text-emerald-950 shadow-sm"
                />
              </div>

              {/* Thẻ Học Sinh Số (Digital ID Badge) */}
              <div className="sm:col-span-5 bg-white p-3 rounded-xl border border-emerald-300 text-xs space-y-0.5 shadow-sm">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Thẻ Học Sinh Số:</div>
                <div className="font-black text-slate-900 text-sm truncate">
                  {fullName || 'Chưa chọn học sinh'}
                </div>
                <div className="text-[11px] text-emerald-800 font-mono-code truncate">
                  Lớp {studentClass} {matchedStudent ? `• STT ${matchedStudent.stt}` : ''}
                </div>
              </div>
            </div>

            {/* CHỈ BÁO XÁC THỰC 2 LỚP THỜI GIAN THỰC */}
            {fullName && matchedStudent && (
              <div className="text-xs">
                {isLmsVerified ? (
                  <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold flex items-center space-x-2">
                    <span className="text-base">✅</span>
                    <span>ĐÃ XÁC THỰC CHÍNH CHỦ: <strong>{fullName}</strong> (STT {matchedStudent.stt} - Lớp {studentClass}). Sẵn sàng vào thi!</span>
                  </div>
                ) : isEmergencyLmsOverride ? (
                  <div className="p-3 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 space-y-1">
                    <div className="flex items-center space-x-2 font-black text-xs text-amber-950 uppercase">
                      <span>⚡</span><span>ĐÃ KÍCH HOẠT XÁC NHẬN MÃ KHẨN CẤP (CHO PHÉP VÀO THI)</span>
                    </div>
                    <p className="text-[11px] text-amber-900 font-medium pl-6 leading-relaxed">
                      Em được phép vào làm bài thi với Mã LMS: <strong>{studentId}</strong>. Hệ thống đã lưu trữ ghi nhận để Giám thị Thầy Trần Gia Huy đối soát sau giờ thi.
                    </p>
                  </div>
                ) : studentId ? (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2.5">
                    <div className="flex items-start space-x-2">
                      <span className="text-xl">⛔</span>
                      <div className="text-xs">
                        <div className="font-black text-rose-950 uppercase">
                          MÃ LMS CHƯA TRÙNG KHỚP VỚI HỒ SƠ DANH SÁCH LỚP
                        </div>
                        <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                          Mã <strong>"{studentId}"</strong> không khớp với hồ sơ lưu của bạn <strong>{fullName}</strong>. Em vui lòng kiểm tra lại thẻ học sinh để nhập đúng toàn bộ mã.
                        </p>
                      </div>
                    </div>

                    {/* NÚT CỨU HỘ DỰ PHÒNG KHI DỮ LIỆU NHÀ TRƯỜNG BỊ SAI SÓT */}
                    <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs space-y-2">
                      <div className="text-[11px] text-slate-600 font-semibold flex items-center space-x-1">
                        <span>💡</span>
                        <span>Lỡ danh sách của trường bị sai sót hoặc mã của em mới đổi?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEmergencyLmsOverride(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs shadow transition flex items-center justify-center space-x-1.5"
                      >
                        <span>⚡</span>
                        <span>Em cam đoan đây là Mã LMS đúng của em — Báo Giám thị & Cho phép vào thi ngay</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 font-medium flex items-center space-x-2 text-xs">
                    <span className="text-base">🔑</span>
                    <span>Vui lòng nhập toàn bộ Mã LMS (có thể nhập có hoặc không có dấu gạch '-') để xác nhận chính chủ.</span>
                  </div>
                )}
              </div>
            )}

            {isManualName && (
              <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-950 text-xs font-semibold flex items-center space-x-2">
                <span className="text-base">ℹ️</span>
                <span>Chế độ Thí sinh bổ sung: Bài làm của em sẽ được ghi nhận và lưu trữ an toàn để Giám thị đối soát.</span>
              </div>
            )}
          </div>

          {/* MÃ ĐỀ THI (KHI CÓ CHỌN MÃ ĐỀ) */}
          {mode === 'exam' && config.codeAllocationMode === 'student_choice' && (
            <div className="pt-2 space-y-1.5">
              <label htmlFor="student-exam-code-select" className="block text-xs font-bold text-[#0267B1] uppercase tracking-wider">
                Mã đề thi <span className="text-red-500">*</span>
              </label>
              <select
                id="student-exam-code-select"
                value={selectedExamCode || ''}
                onChange={e => setSelectedExamCode(e.target.value)}
                disabled={isContactingServer}
                aria-describedby="student-exam-code-hint"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0267B1] text-sm font-bold bg-white text-slate-900 disabled:bg-slate-100 shadow-sm"
              >
                <option value="">Chọn mã đề</option>
                {availableExamCodes.map(code => <option key={code} value={code}>Mã đề {code}</option>)}
              </select>
              {availableExamCodes.length === 0 && (
                <p className="text-xs font-medium text-amber-800">Chưa có mã đề được bật cho khối này. Em báo giám thị để được hỗ trợ.</p>
              )}
              <p id="student-exam-code-hint" className="text-xs text-slate-600 leading-relaxed">
                Lượt đang làm sẽ giữ nguyên mã đề đã nhận khi em vào lại.
              </p>
            </div>
          )}

          {/* MẬT KHẨU PHÒNG THI (KHI CHỌN CHẾ ĐỘ THI CHÍNH THỨC) */}
          {mode === 'exam' && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>🔒 Mật Khẩu Phòng Thi (Do Giám thị cấp) <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  type={showExamPassword ? 'text' : 'password'}
                  value={examPasswordInput}
                  onChange={e => setExamPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu phòng thi..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-base font-black font-mono-code bg-red-50/40 text-slate-900 pr-12 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowExamPassword(prev => !prev)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  {showExamPassword ? 'ẨN' : 'HIỆN'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NÚT HÀNH ĐỘNG BẮT ĐẦU */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={mode === 'review' ? handleReviewLookup : handleStart}
            disabled={isContactingServer}
            className={`w-full py-4 disabled:opacity-60 text-white font-black rounded-2xl shadow-lg transition duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base uppercase tracking-wider ${
              mode === 'review'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                : (mode === 'exam'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25')
            }`}
          >
            <span>
              {isContactingServer
                ? 'ĐANG KẾT NỐI MÁY CHỦ...'
                : (mode === 'review'
                    ? 'TRA CỨU BÀI LÀM & CHỐT ĐIỂM'
                    : (mode === 'exam' ? 'BẮT ĐẦU VÀO PHÒNG THI (45 PHÚT)' : 'BẮT ĐẦU ÔN TẬP ĐỀ CƯƠNG'))}
            </span>
            <span>→</span>
          </button>
          
          <p className="text-[11px] text-slate-500 italic text-center">
            {mode === 'review'
              ? '🔍 Tra cứu nhanh chóng, minh bạch kết quả theo chuẩn Asian School.'
              : <>🖥️ Hệ thống sẽ tự động chuyển sang chế độ <strong>Toàn Màn Hình</strong> ngay khi bấm bắt đầu làm bài.</>
            }
          </p>
        </div>

      </div>

    </div>
  );
}
