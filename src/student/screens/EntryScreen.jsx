import StudentGuidance from '../components/StudentGuidance.jsx';
import { getExamDurationMinutes } from '../../shared/studentGuidance.js';
import React, { useState } from 'react';
import { useStudent } from '../StudentContext.js';
import { CLASS_LISTS } from '../constants.js';
import { getStudentsByClass, verifyStudentLms } from '../../core/roster-data.js';

// 1. MÀN HÌNH CHỌN CHẾ ĐỘ & ĐĂNG KÝ VÀO PHÒNG LÀM BÀI
export default function EntryScreen() {
  const { grade, setGrade, mode, setMode, examState, fullName, setFullName, studentClass,
    setStudentClass, studentId, setStudentId, isContactingServer, examPasswordInput,
    setExamPasswordInput, showExamPassword, setShowExamPassword, showDialog, classAccessMode,
    handleStart, handleReviewLookup, config = {}, selectedExamCode, setSelectedExamCode,
    isEmergencyLmsOverride, setIsEmergencyLmsOverride,
    showLmsMismatch, setShowLmsMismatch,
    lmsErrorCount, setLmsErrorCount } = useStudent();

  const [isManualName, setIsManualName] = useState(false);
  const [showGuidanceConfirm, setShowGuidanceConfirm] = useState(false);

  const classRoster = getStudentsByClass(studentClass);
  const matchedStudent = classRoster.find(s => s.fullName === fullName);

  if (!(examState === 'entry')) return null;

  const examDurationMinutes = getExamDurationMinutes(config);
  const configuredCodes = config.activeCodes?.[String(grade)];
  const availableExamCodes = Array.isArray(configuredCodes)
    ? [...new Set(configuredCodes.filter(code => typeof code === 'string' && code.trim()))]
    : [];

  const onStartClick = () => {
    const N = window.AsianSchoolNormalize;
    const cleanFullName = N ? N.normalizeStudentName(fullName) : String(fullName || '').trim();
    const cleanStudentId = N ? N.normalizeLmsCode(studentId) : String(studentId || '').trim();
    if (!cleanFullName) {
      showDialog('Yêu Cầu Nhập Họ Tên', 'Vui lòng nhập đầy đủ Họ và tên học sinh trước khi bắt đầu!', 'warning');
      return;
    }
    if (!cleanStudentId) {
      showDialog('Yêu Cầu Nhập Mã LMS', 'Vui lòng nhập Mã LMS của em (chỉ gồm các chữ số) trước khi bắt đầu!', 'warning');
      return;
    }
    if (matchedStudent && !verifyStudentLms(matchedStudent, cleanStudentId) && !isEmergencyLmsOverride) {
      handleStart();
      return;
    }
    if (mode === 'exam' && classAccessMode === 'practice_only') {
      showDialog('Thông Báo Ca Thi', `🔒 Ca thi chính thức của Lớp ${studentClass} chưa bắt đầu!\n\nEm vui lòng chọn chế độ "ÔN TẬP ĐỀ CƯƠNG" để luyện tập nhé.`, 'info');
      return;
    }
    if (mode === 'practice' && classAccessMode === 'exam_only') {
      showDialog('Ca Thi Đang Diễn Ra', `⚠️ Lớp ${studentClass} hiện đang trong ca kiểm tra chính thức ${examDurationMinutes} phút!\n\nEm vui lòng chọn chế độ "THI GIỮA HK1" để làm bài.`, 'warning');
      return;
    }
    if (classAccessMode === 'closed') {
      showDialog('Cổng Làm Bài Tạm Đóng', `🔒 Cổng làm bài tạm thời đóng đối với Lớp ${studentClass}.\n\nVui lòng báo Giám thị Thầy Trần Gia Huy để được hỗ trợ.`, 'warning');
      return;
    }
    if (mode === 'exam' && !examPasswordInput.trim()) {
      showDialog('Yêu Cầu Mật Khẩu', '⚠️ VUI LÒNG NHẬP MẬT KHẨU PHÒNG THI!\n\nMật khẩu do Thầy/Cô giám thị cung cấp trước giờ làm bài.', 'warning');
      return;
    }
    setShowGuidanceConfirm(true);
  };

  const handleConfirmAndStart = () => {
    setShowGuidanceConfirm(false);
    handleStart();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 text-center">
        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-widest inline-block mb-2">
          CỔNG KHẢO THÍ HỌC SINH
        </span>
        <h2 className="text-xl sm:text-2xl font-black">XÁC THỰC THÔNG TIN HỌC SINH</h2>
        <p className="text-xs sm:text-sm text-blue-200 mt-1 font-medium">
          Bộ Môn Tin Học — Năm Học 2026 - 2027
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
      
        {/* Chọn Chế Độ: Ôn Tập, Thi hoặc Xem lại bài & Chốt điểm */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Chọn Mục Đích Làm Bài <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
              Lớp {studentClass}: {
                classAccessMode === 'exam_only' ? '🔴 Đang trong ca thi' :
                (classAccessMode === 'practice_only' ? '🟢 Đang mở ôn tập' :
                (classAccessMode === 'both_open' ? '🟡 Mở cả 2 chế độ' : '⚫ Đang đóng cổng'))
              }
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* NÚT ÔN TẬP ĐỀ CƯƠNG */}
            <button
              type="button"
              onClick={() => {
                if (classAccessMode === 'exam_only') {
                  showDialog('Lớp Đang Trong Ca Thi Chính Thức', `Lớp ${studentClass} hiện đang trong ca kiểm tra ${examDurationMinutes} phút! Chế độ ôn tập đang tạm đóng để các em tập trung làm bài thi.`, 'warning');
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
                Kiểm tra {examDurationMinutes} phút, cần mật khẩu phòng thi, bảo mật chống gian lận.
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
            {(() => {
              const isAnyReviewOpen = Boolean(
                config?.allowStudentReviewOfficialExam ||
                (config?.classReviewControl && Object.values(config.classReviewControl).some(Boolean))
              );
              const isCurrentClassReviewOpen = Boolean(
                config?.allowStudentReviewOfficialExam ||
                (studentClass && config?.classReviewControl && config.classReviewControl[studentClass] === true)
              );

              return (
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
                    Xem lại bài thi đã nộp, đối soát điểm trắc nghiệm, tự luận và chốt điểm chính thức.
                  </p>
                  {studentClass ? (
                    isCurrentClassReviewOpen ? (
                      <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        🟢 Lớp {studentClass}: Đang mở xem bài
                      </span>
                    ) : (
                      <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                        🔒 Lớp {studentClass}: Chờ chấm bài
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
              );
            })()}
          </div>
        </div>

        {/* Chọn Khối */}
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

        {/* Nhập Thông tin Học sinh */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-class-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                3. Lớp học <span className="text-red-500">*</span>
              </label>
              <select
                id="student-class-select"
                value={studentClass}
                onChange={e => {
                  setStudentClass(e.target.value);
                  setFullName('');
                  if (setShowLmsMismatch) setShowLmsMismatch(false);
                  if (setLmsErrorCount) setLmsErrorCount(0);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white text-slate-900"
              >
                {(CLASS_LISTS[grade] || []).map(cls => (
                  <option key={cls} value={cls}>Lớp {cls}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold"
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
                    if (setShowLmsMismatch) setShowLmsMismatch(false);
                    if (setLmsErrorCount) setLmsErrorCount(0);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white text-slate-900"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold bg-white text-slate-900"
                />
              )}
            </div>
          </div>

          {/* Ô NHẬP MÃ LMS VÀ XÁC THỰC 2 LỚP CHỐNG THI HỘ */}
          <div>
            <div className="mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                5. Mã LMS / SIS ID (Bắt buộc nhập đầy đủ) <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="text"
              value={studentId}
              onChange={e => {
                const val = e.target.value;
                const clean = val.replace(/[^0-9a-zA-Z.@_-]/g, '').slice(0, 30);
                setStudentId(clean);
                if (isEmergencyLmsOverride) setIsEmergencyLmsOverride(false);
                if (setShowLmsMismatch) setShowLmsMismatch(false);
              }}
              placeholder="Nhập toàn bộ Mã LMS hoặc SIS ID (Ví dụ: 01-19-0002 hoặc 01190002)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold font-mono-code bg-white text-slate-900"
            />

            {/* CHỈ BÁO XÁC THỰC 2 LỚP - KHÔNG HIỂN THỊ KHI ĐÚNG ĐỂ TRÁNH DÒ MÃ */}
            {fullName && matchedStudent && (
              <div className="mt-2 text-xs">
                {isEmergencyLmsOverride ? (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                    <div className="flex items-center space-x-2 font-black text-xs text-amber-900 uppercase">
                      <span>⚡</span><span>ĐÃ KÍCH HOẠT XÁC NHẬN MÃ KHẨN CẤP (CHO PHÉP VÀO THI)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium pl-6 leading-relaxed">
                      Em được phép vào làm bài thi với Mã LMS: <strong>{studentId}</strong>. Hệ thống đã lưu trữ ghi nhận để Giám thị Thầy Trần Gia Huy đối soát sau giờ thi.
                    </p>
                  </div>
                ) : showLmsMismatch ? (
                  lmsErrorCount <= 1 ? (
                    /* LẦN 1: Báo sai đơn giản giống như sai mật khẩu, yêu cầu kiểm tra lại */
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 font-medium flex items-center space-x-2 text-xs">
                      <span className="text-base">⛔</span>
                      <span>Mã LMS chưa chính xác. Em vui lòng kiểm tra lại thẻ học sinh và nhập lại.</span>
                    </div>
                  ) : (
                    /* LẦN 2 TRỞ LÊN (NẾU VẪN SAI): Hiện thêm nút xác thực cam đoan khẩn cấp */
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="text-base">⛔</span>
                        <div className="text-xs">
                          <span className="font-bold">MÃ LMS VẪN CHƯA KHỚP với học sinh <strong>{fullName}</strong>.</span>
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-xs space-y-1.5">
                        <p className="text-[11px] text-slate-600 font-medium">Lỡ danh sách của trường bị sai sót hoặc mã của em mới đổi?</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmergencyLmsOverride(true);
                            if (setShowLmsMismatch) setShowLmsMismatch(false);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs shadow transition flex items-center justify-center space-x-1"
                        >
                          <span>⚡</span>
                          <span>Em cam đoan đây là Mã LMS đúng — Báo Giám thị & Cho phép vào thi ngay</span>
                        </button>
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            )}

            {isManualName && (
              <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 text-xs font-semibold flex items-center space-x-2">
                <span className="text-base">ℹ️</span>
                <span>Chế độ Thí sinh bổ sung: Bài làm của em sẽ được ghi nhận và lưu trữ an toàn để Giám thị đối soát.</span>
              </div>
            )}
          </div>

          {mode === 'exam' && config.codeAllocationMode === 'student_choice' && (
            <div className="pt-2 space-y-2">
              <label htmlFor="student-exam-code-select" className="block text-sm font-bold text-[#0267B1]">
                Mã đề thi <span className="text-red-500">*</span>
              </label>
              <select
                id="student-exam-code-select"
                value={selectedExamCode || ''}
                onChange={e => setSelectedExamCode(e.target.value)}
                disabled={isContactingServer}
                aria-describedby="student-exam-code-hint"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0267B1] text-base font-semibold bg-white text-slate-900 disabled:bg-slate-100"
              >
                <option value="">Chọn mã đề</option>
                {availableExamCodes.map(code => <option key={code} value={code}>Mã đề {code}</option>)}
              </select>
              {availableExamCodes.length === 0 && (
                <p className="text-sm font-medium text-amber-800">Chưa có mã đề được bật cho khối này. Em báo giám thị để được hỗ trợ.</p>
              )}
              <p id="student-exam-code-hint" className="text-sm text-slate-600 leading-relaxed">
                Lượt đang làm sẽ giữ nguyên mã đề đã nhận khi em vào lại.
              </p>
            </div>
          )}

          {/* MẬT KHẨU PHÒNG THI (KHI CHỌN CHẾ ĐỘ THI CHÍNH THỨC) */}
          {mode === 'exam' && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>🔒 Mật Khẩu Phòng Thi (Do Giám thị cấp) <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="one-time-code"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  style={{ WebkitTextSecurity: showExamPassword ? 'none' : 'disc' }}
                  value={examPasswordInput}
                  onChange={e => setExamPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu phòng thi..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-semibold font-mono-code bg-red-50/40 text-slate-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowExamPassword(prev => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  {showExamPassword ? 'ẨN' : 'HIỆN'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KHUNG HƯỚNG DẪN THỰC TẾ TRÊN LMS ASIAN SCHOOL */}
        {mode === 'review' ? (
          <div className="border-2 border-indigo-400 bg-indigo-50/70 rounded-2xl p-4 text-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📋</span>
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                HƯỚNG DẪN ĐỐI SOÁT BÀI THI & CHỐT ĐIỂM
              </h4>
            </div>
            <div className="text-xs space-y-1.5 pl-7 text-slate-700 font-medium leading-relaxed">
              <p>• Hệ thống sẽ tải lại bài thi chính thức của em cùng điểm trắc nghiệm và điểm tự luận đã được Thầy chấm.</p>
              <p>• Em kiểm tra kỹ từng câu hỏi, lời phê của Thầy và bấm <strong>"XÁC NHẬN ĐIỂM SỐ CHÍNH XÁC"</strong> để hoàn tất.</p>
              <p className="text-indigo-900 font-bold">💡 Chức năng này không yêu cầu Mật khẩu phòng thi.</p>
            </div>
          </div>
        ) : (
          <StudentGuidance mode={mode} config={config} />
        )}

        <button
          type="button"
          onClick={mode === 'review' ? handleReviewLookup : onStartClick}
          disabled={isContactingServer}
          className={`w-full py-4 disabled:opacity-60 text-white font-black rounded-2xl shadow-lg transition duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base uppercase tracking-wider ${
            mode === 'review'
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
              : (mode === 'exam'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25')
          }`}
        >
          <span>
            {isContactingServer
              ? 'ĐANG KẾT NỐI MÁY CHỦ...'
              : (mode === 'review'
                  ? 'TRA CỨU BÀI LÀM & CHỐT ĐIỂM'
                  : (mode === 'exam' ? 'BẮT ĐẦU VÀO PHÒNG THI' : 'BẮT ĐẦU ÔN TẬP ĐỀ CƯƠNG'))}
          </span>
          <span>→</span>
        </button>
        <p className="text-[11px] text-slate-500 italic mt-2 text-center">
          {mode === 'review'
            ? '🔍 Tra cứu nhanh chóng, minh bạch kết quả theo chuẩn Asian School.'
            : <>🖥️ Hệ thống sẽ tự động chuyển sang chế độ <strong>Toàn Màn Hình</strong> ngay khi bấm bắt đầu làm bài.</>
          }
        </p>
      </div>

      {/* MODAL XÁC NHẬN NỘI QUY & HƯỚNG DẪN KHI ĐĂNG NHẬP VÀO LÀM BÀI */}
      {showGuidanceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guidance-confirm-title"
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 border-2 border-blue-500 my-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-center space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wider inline-block">
                Chuẩn Quy Chế Asian School
              </span>
              <h3 id="guidance-confirm-title" className="text-xl sm:text-2xl font-black text-blue-950">
                NỘI QUY VÀ HƯỚNG DẪN LÀM BÀI
              </h3>
              <p className="text-xs text-slate-500">
                Em vui lòng đọc kỹ thông báo và hướng dẫn bên dưới trước khi bắt đầu làm bài.
              </p>
            </div>

            {/* Thẻ thông tin học sinh xác nhận */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Thí sinh:</span>
                  <strong className="text-slate-900 font-bold">{fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mã LMS:</span>
                  <strong className="text-blue-900 font-mono-code font-bold">{studentId}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lớp / Khối:</span>
                  <strong className="text-slate-900 font-bold">Lớp {studentClass} • Khối {grade}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Thời gian làm bài:</span>
                  <strong className="text-amber-800 font-bold">{mode === 'exam' ? `${examDurationMinutes} phút` : (config?.practiceDurationMinutes ? `${config.practiceDurationMinutes} phút` : 'Tự do rèn luyện')}</strong>
                </div>
              </div>
              {mode === 'exam' && selectedExamCode && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 text-[11px]">Mã đề thi: </span>
                  <strong className="text-blue-950 font-bold font-mono-code">Mã đề {selectedExamCode}</strong>
                </div>
              )}
            </div>

            {/* Nội dung và hướng dẫn làm bài */}
            <div className="max-h-60 overflow-y-auto pr-1">
              <StudentGuidance mode={mode} config={config} />
            </div>

            {/* Lưu ý an toàn thi */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
              <p className="font-bold flex items-center space-x-1">
                <span>⚠️</span>
                <span>Lưu ý quan trọng khi làm bài:</span>
              </p>
              <p className="leading-relaxed">
                Ngay khi bấm xác nhận, hệ thống sẽ tự động kích hoạt chế độ <strong>Toàn Màn Hình</strong> và bắt đầu tính giờ. Em tuyệt đối <strong>không chuyển tab, không mở ứng dụng khác</strong> để tránh bài thi bị khóa.
              </p>
            </div>

            {/* Nút xác nhận & quay lại */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleConfirmAndStart}
                className="w-full py-4 bg-[#0267B1] hover:bg-[#025696] active:scale-[0.99] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-900/20 transition flex items-center justify-center space-x-2 uppercase tracking-wider"
              >
                <span>✓</span>
                <span>XÁC NHẬN ĐÃ ĐỌC KĨ THÔNG BÁO VÀ LÀM BÀI</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGuidanceConfirm(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Quay lại kiểm tra thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
