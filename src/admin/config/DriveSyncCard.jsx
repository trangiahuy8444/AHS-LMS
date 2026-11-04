import React from 'react';
import { useAdmin } from '../AdminContext.js';

// 3. KẾT NỐI GOOGLE DRIVE & GOOGLE SHEETS
export default function DriveSyncCard() {
  const { googleDriveUrl, setGoogleDriveUrl, googleDriveToken, setGoogleDriveToken, isSyncingDrive,
    driveSyncNotice, isTestingDrive, driveTestMessage, showAppsScriptGuide, setShowAppsScriptGuide,
    handleSaveGoogleDriveUrl, handleTestGoogleDrive, handleSyncAllGoogleDrive } = useAdmin();

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm text-blue-950 uppercase tracking-wider flex items-center space-x-2">
          <span>☁️</span>
          <span>KẾT NỐI GOOGLE DRIVE & GOOGLE SHEETS (LƯU TRỮ VĨNH VIỄN)</span>
        </h3>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
          100% Miễn Phí
        </span>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        Tự động đồng bộ từng dòng điểm vào Google Sheets và lưu trữ tệp sao lưu kỳ thi lên Google Drive cá nhân của Thầy mà không lo mất dữ liệu.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            URL Webhook Google Apps Script (Triển khai từ Google Drive):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={googleDriveUrl}
              onChange={e => setGoogleDriveUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-emerald-800 font-mono-code focus:outline-none focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleSaveGoogleDriveUrl}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition shrink-0"
            >
              Lưu Cấu Hình
            </button>
            <button
              type="button"
              onClick={handleTestGoogleDrive}
              disabled={isTestingDrive}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow transition shrink-0 flex items-center space-x-1.5"
            >
              <span>{isTestingDrive ? '⏳ Đang Kiểm Tra...' : '🧪 Kiểm Tra Kết Nối Ngay'}</span>
            </button>
          </div>

          <div className="pt-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Mã Token Xác Thực (Tùy chọn - nếu Apps Script của Thầy có dùng WEBHOOK_TOKEN):
            </label>
            <input
              type="text"
              value={googleDriveToken}
              onChange={e => setGoogleDriveToken(e.target.value)}
              placeholder="Nhập mã Token nếu có, hoặc để trống nếu script không dùng token..."
              className="w-full sm:w-80 bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2 text-xs text-amber-800 font-mono-code focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {driveTestMessage && (
          <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            driveTestMessage.success === true
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : (driveTestMessage.success === false
                  ? 'bg-red-50 border-red-300 text-red-800'
                  : 'bg-blue-50 border-blue-300 text-blue-800')
          }`}>
            <span>{driveTestMessage.success === true ? '✅' : (driveTestMessage.success === false ? '❌' : 'ℹ️')}</span>
            <span>{driveTestMessage.text}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSyncAllGoogleDrive}
            disabled={isSyncingDrive}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>🚀</span>
            <span>{isSyncingDrive ? 'Đang Sao Lưu Lên Drive...' : 'Đồng Bộ Toàn Bộ Dữ Liệu Lên Google Drive Ngay'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAppsScriptGuide(!showAppsScriptGuide)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
          >
            {showAppsScriptGuide ? 'Ẩn Hướng Dẫn Google Script ✕' : 'Xem Hướng Dẫn & Mã Script Google Drive (Mới Nhất) 📖'}
          </button>
        </div>

        {driveSyncNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl">
            {driveSyncNotice}
          </div>
        )}

        {showAppsScriptGuide && (
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-bold text-blue-950 text-sm flex items-center space-x-2">
                <span>⚡</span>
                <span>HƯỚNG DẪN THIẾT LẬP GOOGLE APPS SCRIPT (TỰ ĐỘNG PHỤC HỒI 2026)</span>
              </h4>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-mono font-bold">Bản tự tạo Sheet & Folder</span>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
              <li>Mở Google Drive của Thầy, tạo 1 file Google Sheets mới (đặt tên: <strong className="text-slate-900">AHS_BangDiem_2026</strong>).</li>
              <li>Chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</li>
              <li>Xóa hết mã cũ trong trình soạn thảo và dán toàn bộ đoạn mã bên dưới vào.</li>
              <li>
                <strong className="text-amber-700">Cực kỳ quan trọng:</strong> Ở thanh công cụ trên cùng, tại ô chọn hàm thực thi, chọn hàm <code className="bg-slate-200 px-1.5 py-0.5 rounded text-emerald-800 font-mono">initSheet</code> rồi bấm nút <strong>Chạy (Run)</strong>.
                <div className="text-[11px] text-slate-500 pl-4 pt-1">
                  &bull; Google sẽ hiện cửa sổ yêu cầu cấp quyền truy cập &rarr; Chọn tài khoản Google của Thầy &rarr; Bấm <em>Nâng cao (Advanced)</em> &rarr; Bấm <em>Đi tới dự án (Không an toàn)</em> &rarr; Bấm <em>Cho phép (Allow)</em>.
                </div>
              </li>
              <li>
                Bấm nút <strong>Triển khai (Deploy)</strong> &rarr; <strong>Quản lý bản triển khai mới (New deployment)</strong>:
                <div className="text-[11px] text-slate-500 pl-4 pt-1 space-y-1">
                  <div>&bull; Bấm biểu tượng bánh răng ⚙️ &rarr; Chọn loại: <strong>Ứng dụng web (Web app)</strong>.</div>
                  <div>&bull; <strong>Thực thi dưới quyền (Execute as):</strong> Chọn <strong>Tôi (trangiahuy8444@gmail.com)</strong>.</div>
                  <div>&bull; <strong>Ai có quyền truy cập (Who has access):</strong> Chọn <strong className="text-amber-700">Bất kỳ ai (Anyone)</strong> <em>(Bắt buộc để hệ thống gửi dữ liệu)</em>.</div>
                  <div>&bull; Bấm <strong>Triển khai</strong> &rarr; Sao chép đường dẫn Web App (có đuôi kết thúc bằng <code className="bg-slate-200 px-1 text-emerald-800 font-mono">/exec</code>).</div>
                </div>
              </li>
              <li>Dán đường link vừa sao chép vào ô <strong>"URL Webhook"</strong> ở trên &rarr; Bấm <strong>"Lưu URL"</strong> &rarr; Bấm <strong>"🧪 Kiểm Tra Kết Nối Ngay"</strong> để kiểm chứng!</li>
            </ol>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">Mã nguồn Google Apps Script Đa Tab (5 Sheets Chuẩn):</span>
                <button
                  type="button"
                  onClick={() => {
                    const code = document.getElementById('apps-script-code-block')?.innerText;
                    if (code && navigator.clipboard) {
                      navigator.clipboard.writeText(code);
                      alert('Đã sao chép mã nguồn Google Apps Script (5 Sheet) vào clipboard!');
                    }
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-[10px] transition flex items-center space-x-1"
                >
                  <span>📋</span>
                  <span>Sao Chép Mã Apps Script (5 Sheet)</span>
                </button>
              </div>
              <div id="apps-script-code-block" className="bg-white p-4 rounded-xl border border-slate-300 font-mono-code text-[11px] text-slate-800 overflow-x-auto select-all max-h-96">
                {`/**
 * ASIAN SCHOOL LMS - GOOGLE APPS SCRIPT WEBHOOK ĐA TAB (5 SHEETS CHUẨN)
 * Phân luồng dữ liệu tự động:
 * 1. On_Tap_De_Cuong: Nhật ký ôn tập đề cương
 * 2. Bai_Thi_Chinh_Thuc: Bảng điểm thi chính thức kèm trạng thái chốt điểm
 * 3. Chi_Tiet_Bai_Lam: Chi tiết câu hỏi và bài làm của thí sinh
 * 4. Giam_Sat_Va_Vi_Pham: Nhật ký vi phạm, đổi máy và giám sát an toàn thi
 * 5. Thong_Ke_Theo_Lop: Thống kê số lượng, điểm TB theo từng lớp
 */

var SPREADSHEET_NAME = "AHS_BangDiem_2026";
var FOLDER_NAME = "AHS-LMS-Archive";

function initSheet() {
  var ss = getOrCreateSpreadsheet();
  getOrCreateTab(ss, "On_Tap_De_Cuong", [
    "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Lần Làm", "Điểm TN", "Số Câu Đúng", "Vi Phạm", "Thời Gian Làm"
  ]);
  getOrCreateTab(ss, "Bai_Thi_Chinh_Thuc", [
    "Thời Điểm Nộp", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Điểm TN", "Điểm Đúng/Sai", "Điểm TL", "Tổng Điểm", "HS Xác Nhận Điểm", "Thời Điểm Xác Nhận", "Số Lần Làm", "Số Lần Đổi Thiết Bị", "Vi Phạm", "Thời Lượng", "Ghi Chú Nộp Muộn"
  ]);
  getOrCreateTab(ss, "Chi_Tiet_Bai_Lam", [
    "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Lượt Thi", "Câu Số", "Loại Câu", "Câu Trả Lời Của HS", "Kết Quả Đánh Giá", "Điểm Đạt"
  ]);
  getOrCreateTab(ss, "Giam_Sat_Va_Vi_Pham", [
    "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Loại Sự Kiện", "Số Lần Vi Phạm", "Lý Do Khóa", "Thời Lượng Đã Làm"
  ]);
  getOrCreateTab(ss, "Thong_Ke_Theo_Lop", [
    "Khối", "Lớp", "Sĩ Số Tham Gia", "Số Bài Đã Nộp", "Điểm TB", "Điểm Cao Nhất", "Điểm Thấp Nhất", "Số Bài Nộp Muộn", "Số Bài Vi Phạm"
  ]);
  Logger.log("Đã khởi tạo thành công 5 sheets: " + ss.getUrl());
}

function getOrCreateSpreadsheet() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }
  if (!ss) {
    var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    }
  }
  return ss;
}

function getOrCreateTab(ss, tabName, headers) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }
  if (sheet.getLastRow() === 0 && headers && headers.length) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#0267B1")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Tiện ích AHS')
    .addItem('🧹 Chuẩn hóa Lần Làm & Điểm Ôn Tập (Sửa số 130, 256... và Điểm 0)', 'chuanHoaDuLieuOnTap')
    .addToUi();
}

function chuanHoaDuLieuOnTap() {
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName("On_Tap_De_Cuong");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Không tìm thấy tab On_Tap_De_Cuong!");
    return;
  }
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert("Chưa có dữ liệu học sinh trong tab On_Tap_De_Cuong!");
    return;
  }
  
  var range = sheet.getRange(2, 1, lastRow - 1, 10);
  var values = range.getValues();
  var updatedCount = 0;
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var grade = Number(row[3]) || 10;
    var attempt = Number(row[5]);
    var score = Number(row[6]);
    var correct = Number(row[7]);
    
    if (attempt > 20 || isNaN(attempt) || attempt <= 0) {
      row[5] = 1;
      updatedCount++;
    }
    
    if ((score === 0 || isNaN(score)) && correct > 0) {
      var totalQ = (grade === 10 ? 19 : 28);
      var calcScore = Math.round((correct / totalQ) * 10 * 10) / 10;
      row[6] = calcScore;
      updatedCount++;
    }
  }
  
  range.setValues(values);
  SpreadsheetApp.getUi().alert("✅ Đã chuẩn hóa thành công " + updatedCount + " ô dữ liệu trên tab On_Tap_De_Cuong!");
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getOrCreateSpreadsheet();

    // 1. Kiểm tra kết nối
    if (data.action === 'test_connection') {
      var tSheet = getOrCreateTab(ss, "Bai_Thi_Chinh_Thuc", [
        "Thời Điểm Nộp", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Điểm TN", "Điểm Đúng/Sai", "Điểm TL", "Tổng Điểm", "HS Xác Nhận Điểm", "Thời Điểm Xác Nhận", "Số Lần Làm", "Số Lần Đổi Thiết Bị", "Vi Phạm", "Thời Lượng", "Ghi Chú Nộp Muộn"
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Kết nối thành công tới 5 tab Google Sheets!",
        spreadsheetName: ss.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Ôn tập đề cương -> Ghi vào On_Tap_De_Cuong
    if (data.action === 'sync_practice' && data.submission) {
      var p = data.submission;
      var pAttempts = Number(p.attemptNumber) || 1;
      if (pAttempts > 20) pAttempts = 1;
      var pMcq = (p.mcqPoints !== undefined && Number(p.mcqPoints) > 0) ? Number(p.mcqPoints) : (Number(p.finalScore) || Number(p.score) || 0);
      if (pMcq === 0 && Number(p.correctCount) > 0) {
        var pTot = Number(p.totalQuestions) || (Number(p.grade) === 10 ? 19 : 28);
        pMcq = Math.round((Number(p.correctCount) / pTot) * 10 * 10) / 10;
      }
      var sheetPractice = getOrCreateTab(ss, "On_Tap_De_Cuong", [
        "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Lần Làm", "Điểm TN", "Số Câu Đúng", "Vi Phạm", "Thời Gian Làm"
      ]);
      sheetPractice.appendRow([
        p.submittedAt || new Date().toISOString(),
        p.studentId || p.studentCode || "",
        p.fullName || "",
        p.grade || "",
        p.studentClass || "",
        pAttempts,
        pMcq,
        p.correctCount !== undefined ? p.correctCount : "",
        p.violations || 0,
        p.durationFormatted || "30 phút"
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, sheet: "On_Tap_De_Cuong" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Thi chính thức -> Ghi vào Bai_Thi_Chinh_Thuc, Chi_Tiet_Bai_Lam, Giam_Sat_Va_Vi_Pham
    if ((data.action === 'sync_exam' || data.action === 'sync_row') && data.submission) {
      var s = data.submission;
      var isPractice = s.mode === 'practice';
      if (isPractice) {
        var sAttempts = Number(s.attemptNumber) || 1;
        if (sAttempts > 20) sAttempts = 1;
        var sMcq = (s.mcqPoints !== undefined && Number(s.mcqPoints) > 0) ? Number(s.mcqPoints) : (Number(s.finalScore) || Number(s.score) || 0);
        if (sMcq === 0 && Number(s.correctCount) > 0) {
          var sTot = Number(s.totalQuestions) || (Number(s.grade) === 10 ? 19 : 28);
          sMcq = Math.round((Number(s.correctCount) / sTot) * 10 * 10) / 10;
        }
        var sheetP = getOrCreateTab(ss, "On_Tap_De_Cuong", [
          "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Lần Làm", "Điểm TN", "Số Câu Đúng", "Vi Phạm", "Thời Gian Làm"
        ]);
        sheetP.appendRow([
          s.submittedAt || new Date().toISOString(),
          s.studentId || s.studentCode || "",
          s.fullName || "",
          s.grade || "",
          s.studentClass || "",
          sAttempts,
          sMcq,
          s.correctCount !== undefined ? s.correctCount : "",
          s.violations || 0,
          s.durationFormatted || "30 phút"
        ]);
        return ContentService.createTextOutput(JSON.stringify({ success: true, sheet: "On_Tap_De_Cuong" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var sheetExam = getOrCreateTab(ss, "Bai_Thi_Chinh_Thuc", [
        "Thời Điểm Nộp", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Điểm TN", "Điểm Đúng/Sai", "Điểm TL", "Tổng Điểm", "HS Xác Nhận Điểm", "Thời Điểm Xác Nhận", "Số Lần Làm", "Số Lần Đổi Thiết Bị", "Vi Phạm", "Thời Lượng", "Ghi Chú Nộp Muộn"
      ]);
      var examRow = [
        s.submittedAt || new Date().toISOString(),
        s.studentId || s.studentCode || "",
        s.fullName || "",
        s.grade || "",
        s.studentClass || "",
        s.examCode || "101",
        s.mcqPoints !== undefined ? s.mcqPoints : (s.score || 0),
        s.tfPoints || 0,
        s.essayTotal || 0,
        s.finalScore !== undefined ? s.finalScore : (s.score || 0),
        s.scoreConfirmed || "Chưa xác nhận",
        s.scoreConfirmedAt || "",
        s.attemptNumber || 1,
        s.deviceChanges || 0,
        s.violations || 0,
        s.durationFormatted || "45 phút",
        s.lateNote || "Đúng hạn"
      ];
      sheetExam.appendRow(examRow);

      // Nếu có tab BangDiem, ghi đồng thời vào BangDiem
      var sheetBangDiem = ss.getSheetByName("BangDiem");
      if (sheetBangDiem) {
        sheetBangDiem.appendRow(examRow);
      }

      // Ghi giám sát an toàn thi nếu có vi phạm hoặc đổi máy
      if (s.violations > 0 || s.deviceChanges > 0) {
        var sheetMon = getOrCreateTab(ss, "Giam_Sat_Va_Vi_Pham", [
          "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Loại Sự Kiện", "Số Lần Vi Phạm", "Lý Do Khóa", "Thời Lượng Đã Làm"
        ]);
        sheetMon.appendRow([
          s.submittedAt || new Date().toISOString(),
          s.studentId || "",
          s.fullName || "",
          s.grade || "",
          s.studentClass || "",
          s.examCode || "",
          s.violations >= 3 ? "Khóa Màn Hình Vi Phạm" : (s.deviceChanges > 0 ? "Đổi Thiết Bị" : "Cảnh Báo Vi Phạm"),
          s.violations || 0,
          s.violations >= 3 ? "Chuyển tab / Thoát toàn màn hình quá 3 lần" : "",
          s.durationFormatted || ""
        ]);
      }

      // Ghi chi tiết câu trả lời nếu có
      if (data.answers && typeof data.answers === 'object') {
        var sheetAns = getOrCreateTab(ss, "Chi_Tiet_Bai_Lam", [
          "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Lượt Thi", "Câu Số", "Loại Câu", "Câu Trả Lời Của HS", "Kết Quả Đánh Giá", "Điểm Đạt"
        ]);
        var mcq = data.answers.mcq || {};
        var letters = ['A', 'B', 'C', 'D'];
        for (var qNum in mcq) {
          sheetAns.appendRow([
            s.submittedAt || new Date().toISOString(),
            s.studentId || "",
            s.fullName || "",
            s.grade || "",
            s.studentClass || "",
            s.examCode || "",
            s.attemptNumber || 1,
            qNum,
            "Trắc nghiệm",
            letters[mcq[qNum]] || String(mcq[qNum]),
            "",
            ""
          ]);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, sheet: "Bai_Thi_Chinh_Thuc" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Đồng bộ toàn bộ dữ liệu & Thống kê theo lớp -> sync_all
    if (data.action === 'sync_all' || data.action === 'backup_file') {
      var examList = data.submissions || [];
      var practiceList = data.practiceSubmissions || [];

      // 4.1 Đổ toàn bộ bài thi chính thức vào Bai_Thi_Chinh_Thuc & BangDiem
      if (examList.length > 0) {
        var sheetExam = getOrCreateTab(ss, "Bai_Thi_Chinh_Thuc", [
          "Thời Điểm Nộp", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Điểm TN", "Điểm Đúng/Sai", "Điểm TL", "Tổng Điểm", "HS Xác Nhận Điểm", "Thời Điểm Xác Nhận", "Số Lần Làm", "Số Lần Đổi Thiết Bị", "Vi Phạm", "Thời Lượng", "Ghi Chú Nộp Muộn"
        ]);
        if (sheetExam.getLastRow() > 1) {
          sheetExam.getRange(2, 1, sheetExam.getLastRow() - 1, sheetExam.getLastColumn()).clearContent();
        }
        var examRows = [];
        for (var i = 0; i < examList.length; i++) {
          var sub = examList[i];
          examRows.push([
            sub.submittedAt || "",
            sub.studentId || sub.studentCode || "",
            sub.fullName || "",
            sub.grade || "",
            sub.studentClass || "",
            sub.examCode || "101",
            sub.mcqPoints !== undefined ? sub.mcqPoints : (sub.score || 0),
            sub.tfPoints || 0,
            sub.essayTotal || 0,
            sub.finalScore !== undefined ? sub.finalScore : (sub.score || 0),
            sub.scoreConfirmed ? "Đã xác nhận" : "Chưa xác nhận",
            sub.scoreConfirmedAt || "",
            sub.attemptNumber || 1,
            sub.deviceChanges || 0,
            sub.violations || 0,
            sub.durationFormatted || "45 phút",
            sub.lateNote || "Đúng hạn"
          ]);
        }
        if (examRows.length > 0) {
          sheetExam.getRange(2, 1, examRows.length, examRows[0].length).setValues(examRows);
        }

        // Đồng bộ luôn vào tab BangDiem nếu có sẵn
        var sheetBangDiem = ss.getSheetByName("BangDiem");
        if (sheetBangDiem) {
          if (sheetBangDiem.getLastRow() > 1) {
            sheetBangDiem.getRange(2, 1, sheetBangDiem.getLastRow() - 1, sheetBangDiem.getLastColumn()).clearContent();
          }
          if (examRows.length > 0 && sheetBangDiem.getLastColumn() >= examRows[0].length) {
            sheetBangDiem.getRange(2, 1, examRows.length, examRows[0].length).setValues(examRows);
          }
        }
      }

      // 4.2 Đổ toàn bộ bài ôn tập vào On_Tap_De_Cuong
      if (practiceList.length > 0) {
        var sheetP = getOrCreateTab(ss, "On_Tap_De_Cuong", [
          "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Lần Làm", "Điểm TN", "Số Câu Đúng", "Vi Phạm", "Thời Gian Làm"
        ]);
        if (sheetP.getLastRow() > 1) {
          sheetP.getRange(2, 1, sheetP.getLastRow() - 1, sheetP.getLastColumn()).clearContent();
        }
        var pRows = [];
        for (var j = 0; j < practiceList.length; j++) {
          var p = practiceList[j];
          var pAttempts = Number(p.attemptNumber) || 1;
          if (pAttempts > 20) pAttempts = 1;
          var pMcq = (p.mcqPoints !== undefined && Number(p.mcqPoints) > 0) ? Number(p.mcqPoints) : (Number(p.finalScore) || Number(p.score) || 0);
          if (pMcq === 0 && Number(p.correctCount) > 0) {
            var pTot = Number(p.totalQuestions) || (Number(p.grade) === 10 ? 19 : 28);
            pMcq = Math.round((Number(p.correctCount) / pTot) * 10 * 10) / 10;
          }
          pRows.push([
            p.submittedAt || "",
            p.studentId || p.studentCode || "",
            p.fullName || "",
            p.grade || "",
            p.studentClass || "",
            pAttempts,
            pMcq,
            p.correctCount !== undefined ? p.correctCount : "",
            p.violations || 0,
            p.durationFormatted || "30 phút"
          ]);
        }
        if (pRows.length > 0) {
          sheetP.getRange(2, 1, pRows.length, pRows[0].length).setValues(pRows);
        }
      }

      // 4.3 Thống kê theo lớp vào Thong_Ke_Theo_Lop
      if (examList.length > 0) {
        var sheetStats = getOrCreateTab(ss, "Thong_Ke_Theo_Lop", [
          "Khối", "Lớp", "Sĩ Số Tham Gia", "Số Bài Đã Nộp", "Điểm TB", "Điểm Cao Nhất", "Điểm Thấp Nhất", "Số Bài Nộp Muộn", "Số Bài Vi Phạm"
        ]);
        if (sheetStats.getLastRow() > 1) {
          sheetStats.getRange(2, 1, sheetStats.getLastRow() - 1, sheetStats.getLastColumn()).clearContent();
        }
        var classMap = {};
        for (var k = 0; k < examList.length; k++) {
          var item = examList[k];
          var cls = item.studentClass || "Khác";
          if (!classMap[cls]) {
            classMap[cls] = { grade: item.grade || "", count: 0, scores: [], late: 0, violations: 0 };
          }
          classMap[cls].count++;
          var sc = Number(item.finalScore !== undefined ? item.finalScore : item.score) || 0;
          classMap[cls].scores.push(sc);
          if (item.lateNote && item.lateNote !== "Đúng hạn") classMap[cls].late++;
          if (item.violations > 0) classMap[cls].violations++;
        }
        var statRows = [];
        for (var c in classMap) {
          var info = classMap[c];
          var sum = 0;
          var maxSc = info.scores.length ? Math.max.apply(null, info.scores) : 0;
          var minSc = info.scores.length ? Math.min.apply(null, info.scores) : 0;
          for (var sIdx = 0; sIdx < info.scores.length; sIdx++) sum += info.scores[sIdx];
          var avgSc = info.scores.length ? (sum / info.scores.length).toFixed(2) : 0;
          statRows.push([
            info.grade, c, info.count, info.count, avgSc, maxSc, minSc, info.late, info.violations
          ]);
        }
        if (statRows.length > 0) {
          sheetStats.getRange(2, 1, statRows.length, statRows[0].length).setValues(statRows);
        }
      }

      // 4.4 Ghi danh sách vi phạm vào Giam_Sat_Va_Vi_Pham
      var vioSubs = examList.filter(function(x) { return (x.violations && x.violations > 0) || (x.deviceChanges && x.deviceChanges > 0); });
      if (vioSubs.length > 0) {
        var sheetVio = getOrCreateTab(ss, "Giam_Sat_Va_Vi_Pham", [
          "Thời Điểm", "Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", "Loại Sự Kiện", "Số Lần Vi Phạm", "Lý Do Khóa", "Thời Lượng Đã Làm"
        ]);
        if (sheetVio.getLastRow() > 1) {
          sheetVio.getRange(2, 1, sheetVio.getLastRow() - 1, sheetVio.getLastColumn()).clearContent();
        }
        var vioRows = [];
        for (var v = 0; v < vioSubs.length; v++) {
          var vs = vioSubs[v];
          vioRows.push([
            vs.submittedAt || "",
            vs.studentId || "",
            vs.fullName || "",
            vs.grade || "",
            vs.studentClass || "",
            vs.examCode || "",
            vs.violations >= 3 ? "Khóa Màn Hình Vi Phạm" : (vs.deviceChanges > 0 ? "Đổi Thiết Bị" : "Cảnh Báo Vi Phạm"),
            vs.violations || 0,
            vs.violations >= 3 ? "Chuyển tab / Thoát toàn màn hình quá 3 lần" : "",
            vs.durationFormatted || ""
          ]);
        }
        if (vioRows.length > 0) {
          sheetVio.getRange(2, 1, vioRows.length, vioRows[0].length).setValues(vioRows);
        }
      }

      // 4.5 Lưu file JSON backup lên Google Drive
      if (data.jsonContent) {
        var folders = DriveApp.getFoldersByName(FOLDER_NAME);
        var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
        var fileName = "Backup_AHS_" + Utilities.formatDate(new Date(), "GMT+7", "yyyy_MM_dd_HHmm") + ".json";
        folder.createFile(fileName, data.jsonContent);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Đã đồng bộ trọn vẹn toàn bộ các trang tính và sao lưu Google Drive!",
        examCount: examList.length,
        practiceCount: practiceList.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Hành động không xác định" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
