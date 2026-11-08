import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,render,screen} from '@testing-library/react';
import {AdminContext} from '../src/admin/AdminContext.js';
import DriveArchiveStatusCard from '../src/admin/config/DriveArchiveStatusCard.jsx';
afterEach(()=>{cleanup();delete window.firebaseDb;});
function mount(config={},callbacks={}){
  const unsubs=[vi.fn(),vi.fn()];
  const query={where:vi.fn().mockReturnThis(),limit:vi.fn().mockReturnThis(),onSnapshot:(next,error)=>{callbacks.jobs=next;callbacks.jobsError=error;return unsubs[1];}};
  window.firebaseDb={collection:vi.fn(name=>name==='drive_archive_status'?{doc:vi.fn(()=>({onSnapshot:(next,error)=>{callbacks.worker=next;callbacks.workerError=error;return unsubs[0];}}))}:query)};
  const view=render(<AdminContext.Provider value={{config,isAuthenticated:true}}><DriveArchiveStatusCard /></AdminContext.Provider>);
  return {...view,callbacks,query,unsubs};
}
it('does not claim an automatic backup exists just because its config is enabled',()=>{
  const {callbacks}=mount({driveArchiveEnabled:true});
  act(()=>{callbacks.worker({exists:false});callbacks.jobs({size:0});});
  expect(screen.getByText(/Chưa cài hoặc chưa có lượt chạy xác nhận/)).toBeTruthy();
  expect(screen.queryByRole('link',{name:'Mở thư mục lưu trữ'})).toBeNull();
  expect(screen.queryByText(/Tất cả dữ liệu đã/)).toBeNull();
});
it('shows actual worker receipts, capped backlog and a safe constructed Drive folder link',()=>{
  const {callbacks,query}=mount({driveArchiveEnabled:true});
  act(()=>{callbacks.worker({exists:true,data:()=>({lastRunAt:new Date('2026-11-08T12:00:00Z'),lastSuccessAt:new Date('2026-11-08T11:55:00Z'),rootFolderId:'fake_test_folder_123',lastArchived:4,backfillComplete:true})});callbacks.jobs({size:100});});
  expect(query.where).toHaveBeenCalledWith('pending','==',true);
  expect(query.limit).toHaveBeenCalledWith(100);
  expect(screen.getByText('Từ 100 mục trở lên')).toBeTruthy();
  expect(screen.getByRole('link',{name:'Mở thư mục lưu trữ'}).href).toBe('https://drive.google.com/drive/folders/fake_test_folder_123');
  expect(screen.getByText(/08\/11\/2026.*19:00/)).toBeTruthy();
  expect(screen.getByText(/Khoảng 5 phút/)).toBeTruthy();
});
it('shows worker failures and ignores untrusted folder links',()=>{
  const {callbacks}=mount({driveArchiveEnabled:true});
  act(()=>{callbacks.worker({exists:true,data:()=>({rootFolderId:'https://example.invalid/evil',lastErrorCode:'archive_source_http_403',lastFailed:2})});callbacks.jobs({size:2});});
  expect(screen.getByText(/archive_source_http_403/)).toBeTruthy();
  expect(screen.queryByRole('link',{name:'Mở thư mục lưu trữ'})).toBeNull();
});
it('shows disconnected and unauthenticated states without querying data',()=>{
  const collection=vi.fn();
  window.firebaseDb={collection};
  const {rerender}=render(<AdminContext.Provider value={{config:{},isAuthenticated:false}}><DriveArchiveStatusCard /></AdminContext.Provider>);
  expect(screen.getByText(/Chờ xác thực giáo viên/)).toBeTruthy();
  expect(collection).not.toHaveBeenCalled();
  delete window.firebaseDb;
  rerender(<AdminContext.Provider value={{config:{},isAuthenticated:true}}><DriveArchiveStatusCard /></AdminContext.Provider>);
  expect(screen.getByText(/Chưa kết nối máy chủ/)).toBeTruthy();
});
it('stops both subscriptions and reports listener failure without showing success',()=>{
  const {callbacks,unsubs,unmount}=mount({driveArchiveEnabled:true});
  act(()=>callbacks.workerError({code:'permission-denied'}));
  expect(screen.getByRole('alert').textContent).toContain('Chưa đọc được trạng thái lưu trữ');
  unmount();
  expect(unsubs[0]).toHaveBeenCalledOnce();expect(unsubs[1]).toHaveBeenCalledOnce();
});
