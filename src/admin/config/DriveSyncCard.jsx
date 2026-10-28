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

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Mã nguồn Google Apps Script (Bấm vào để chọn tất cả):</span>
                <span className="text-emerald-700 font-mono text-[10px] font-bold">Tự động tạo Sheet & Tiêu đề cột chuẩn</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-300 font-mono-code text-[11px] text-slate-800 overflow-x-auto select-all max-h-96">
                {`/**
 * ASIAN SCHOOL LMS - GOOGLE APPS SCRIPT WEBHOOK (BẢN TỰ ĐỘNG PHỤC HỒI 2026)
 * Tự động tạo Google Sheet, tiêu đề cột, thư mục lưu trữ và hỗ trợ kiểm tra kết nối
 */

function initSheet() {
var ss = getOrCreateSpreadsheet();
var sheet = ss.getActiveSheet();
setupSheetHeaders(sheet);
Logger.log("Đã khởi tạo thành công: " + ss.getUrl());
}

function getOrCreateSpreadsheet() {
var ss;
try {
ss = SpreadsheetApp.getActiveSpreadsheet();
} catch (e) {
ss = null;
}
if (!ss) {
var files = DriveApp.getFilesByName("AHS_BangDiem_2026");
if (files.hasNext()) {
ss = SpreadsheetApp.open(files.next());
} else {
ss = SpreadsheetApp.create("AHS_BangDiem_2026");
}
}
return ss;
}

function setupSheetHeaders(sheet) {
if (sheet.getLastRow() === 0) {
var headers = [
"Mã LMS", "Họ và Tên", "Khối", "Lớp", "Mã Đề", 
"Điểm TN", "Điểm TL", "Tổng Điểm", "Vi Phạm", 
"Thời Gian Làm", "Thời Điểm Nộp"
];
sheet.appendRow(headers);
sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
sheet.setFrozenRows(1);
}
}

function doPost(e) {
try {
var data = JSON.parse(e.postData.contents);
var ss = getOrCreateSpreadsheet();
var sheet = ss.getActiveSheet();
setupSheetHeaders(sheet);

// 1. Lệnh kiểm tra kết nối từ Admin
if (data.action === 'test_connection') {
var t = data.testRow || {};
sheet.appendRow([
  t.studentId || "TEST_LMS",
  t.fullName || "Kiểm Tra Kết Nối",
  t.grade || "10",
  t.studentClass || "10/14",
  t.examCode || "101",
  t.mcqPoints || 7.0,
  t.essayTotal || 3.0,
  t.finalScore || 10.0,
  t.violations || 0,
  t.durationFormatted || "00:01",
  t.submittedAt || new Date().toISOString()
]);
return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Kết nối thành công!" }))
  .setMimeType(ContentService.MimeType.JSON);
}

// 2. Đồng bộ từng dòng khi học sinh nộp bài thi
if (data.action === 'sync_row' && data.submission) {
var s = data.submission;
sheet.appendRow([
  s.studentId || s.studentCode || "",
  s.fullName || "",
  s.grade || "",
  s.studentClass || "",
  s.examCode || "",
  s.mcqPoints !== undefined ? s.mcqPoints : (s.score || 0),
  s.essayTotal || 0,
  s.finalScore !== undefined ? s.finalScore : (s.score || 0),
  s.violations || 0,
  s.durationFormatted || "45 phút",
  s.submittedAt || new Date().toISOString()
]);
return ContentService.createTextOutput(JSON.stringify({ success: true }))
  .setMimeType(ContentService.MimeType.JSON);
}

// 3. Sao lưu toàn bộ kỳ thi thành tệp JSON vào Google Drive
if (data.action === 'backup_file') {
var folders = DriveApp.getFoldersByName("AHS-LMS-Archive");
var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("AHS-LMS-Archive");
var fileName = "Backup_AHS_" + Utilities.formatDate(new Date(), "GMT+7", "yyyy_MM_dd_HHmm") + ".json";
folder.createFile(fileName, data.jsonContent);
return ContentService.createTextOutput(JSON.stringify({ success: true, file: fileName }))
  .setMimeType(ContentService.MimeType.JSON);
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
