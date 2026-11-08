import React, { useEffect, useState } from 'react';
import { useAdmin } from '../AdminContext.js';

function formatTime(value) {
  try {
    const date = value?.toDate ? value.toDate() : value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null;
    if (!date || !Number.isFinite(date.getTime())) return 'Chưa có ghi nhận';
    const zone = { timeZone: 'Asia/Ho_Chi_Minh' };
    return date.toLocaleDateString('vi-VN', { ...zone, day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('vi-VN', { ...zone, hour12: false });
  } catch { return 'Chưa có ghi nhận'; }
}

export default function DriveArchiveStatusCard() {
  const { config = {}, isAuthenticated = false } = useAdmin();
  const db = window.firebaseDb;
  const [state, setState] = useState({ worker: null, loaded: false, pending: null, error: '', cached: false });
  useEffect(() => {
    let active = true;
    const subscriptions = [];
    const update = change => { if (active) setState(current => ({ ...current, ...change })); };
    update({ worker: null, loaded: false, pending: null, error: '', cached: false });
    if (isAuthenticated && db?.collection) {
      const failed = () => update({ error: 'Chưa đọc được trạng thái lưu trữ. Kiểm tra kết nối và quyền giáo viên rồi thử lại.' });
      try {
        subscriptions.push(db.collection('drive_archive_status').doc('worker').onSnapshot(snapshot => {
          update({ worker: snapshot.exists ? snapshot.data() || {} : null, loaded: true, cached: snapshot.metadata?.fromCache === true });
        }, failed));
        subscriptions.push(db.collection('drive_archive_jobs').where('pending', '==', true).limit(100).onSnapshot(snapshot => {
          update({ pending: snapshot.size });
        }, failed));
      } catch { failed(); }
    }
    return () => { active = false; subscriptions.forEach(unsubscribe => { if (typeof unsubscribe === 'function') unsubscribe(); }); };
  }, [db, isAuthenticated]);
  const { worker, loaded, pending, error, cached } = state;
  const enabled = config.driveArchiveEnabled === true;
  const folderId = worker?.rootFolderId;
  const safeFolder = typeof folderId === 'string' && /^[A-Za-z0-9_-]{10,}$/.test(folderId);
  const workerError = worker?.lastErrorCode;
  const errorCode = typeof workerError === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(workerError) ? workerError : workerError ? 'không xác định' : '';
  let summary;
  if (!isAuthenticated) summary = 'Chờ xác thực giáo viên để đọc trạng thái lưu trữ.';
  else if (!db?.collection) summary = 'Chưa kết nối máy chủ; chưa xác nhận được việc lưu trữ.';
  else if (!loaded) summary = 'Đang đọc ghi nhận lưu trữ từ máy chủ…';
  else if (!worker) summary = 'Chưa cài hoặc chưa có lượt chạy xác nhận. Chưa có bằng chứng dữ liệu đã được lưu vào Drive.';
  else if (!enabled) summary = 'Chưa bật lưu trữ tự động. Các mốc bên dưới là ghi nhận trước đó.';
  else summary = 'Đã có ghi nhận từ bộ lưu trữ tự động. Kiểm tra thời điểm, hàng chờ và lỗi bên dưới để biết dữ liệu nào còn chờ lưu.';

  return (
    <section aria-label="Lưu trữ Drive tự động" className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-5 space-y-4">
      <h3 className="text-lg font-bold text-blue-950">Lưu trữ dữ liệu thi tự động trên Google Drive</h3>
      <p className="text-sm text-slate-800">{summary}</p>
      <p className="text-sm text-slate-600">Khoảng 5 phút một lượt kiểm tra, không lưu tức thời. Dữ liệu được xếp theo môi trường / năm học / kỳ thi / khối / lớp, gồm bản JSON đầy đủ và bảng tính theo lớp.</p>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {cached && <p className="text-sm text-amber-800">Đang xem bản lưu trên thiết bị; chưa xác nhận được trạng thái mới nhất từ máy chủ.</p>}
      {isAuthenticated && db?.collection && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="font-semibold text-slate-700">Lần chạy gần nhất</dt><dd>{formatTime(worker?.lastRunAt)}</dd></div>
          <div><dt className="font-semibold text-slate-700">Lần chạy thành công gần nhất</dt><dd>{formatTime(worker?.lastSuccessAt)}</dd></div>
          <div><dt className="font-semibold text-slate-700">Mục đang chờ lưu</dt><dd>{pending === null ? 'Chưa đọc được' : pending >= 100 ? 'Từ 100 mục trở lên' : pending}</dd></div>
          <div><dt className="font-semibold text-slate-700">Cấu hình tự động</dt><dd>{enabled ? 'Đã bật' : 'Chưa bật'}</dd></div>
        </dl>
      )}
      {worker && !worker.backfillComplete && <p className="text-sm text-amber-800">Chưa có xác nhận rà soát xong dữ liệu cũ; hàng chờ bằng 0 chưa có nghĩa toàn bộ dữ liệu đã được lưu.</p>}
      {!!errorCode && <p role="alert" className="text-sm text-red-800">Bộ lưu trữ báo lỗi: {errorCode}. Chưa xác nhận lượt chạy này thành công.</p>}
      {Number(worker?.lastFailed) > 0 && <p className="text-sm text-red-800">Có {Number(worker.lastFailed)} mục lưu chưa thành công trong lượt gần nhất; cần kiểm tra và thử lại.</p>}
      {isAuthenticated && safeFolder && <a className="inline-block rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white" href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noreferrer">Mở thư mục lưu trữ</a>}
    </section>
  );
}
