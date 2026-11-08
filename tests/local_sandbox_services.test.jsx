import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getGeminiApiKey, gradeSingleEssayWithGemini, testGeminiConnection } from '../src/core/gemini-grading-service.js';
import '../src/core/storage-service.js';
import LocalSandboxBanner from '../src/shared/components/LocalSandboxBanner.jsx';
import LoginScreen from '../src/admin/LoginScreen.jsx';
import { AdminContext } from '../src/admin/AdminContext.js';
import { useAdminController } from '../src/admin/hooks/useAdminController.js';

beforeEach(() => { localStorage.clear(); window.AsianSchoolRuntime = { mode: 'local-sandbox' }; vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network'); })); });
afterEach(() => { cleanup(); delete window.AsianSchoolRuntime; vi.unstubAllGlobals(); });
it('simulates Gemini even with an entered key and keeps grades bounded', async () => {
  expect(getGeminiApiKey()).toBe('local-sandbox-not-a-real-key');
  const connection = await testGeminiConnection('entered-key');
  expect(connection.success).toBe(true);
  expect(connection.simulated).toBe(true);
  const grade = await gradeSingleEssayWithGemini({studentAnswer:'Bài làm giả',maxPoints:0.75,apiKey:'entered-key'});
  expect(grade.success).toBe(true);
  expect(grade.simulated).toBe(true);
  expect(grade.score).toBeGreaterThanOrEqual(0);
  expect(grade.score).toBeLessThanOrEqual(0.75);
  expect(grade.feedback).toContain('MÔ PHỎNG CỤC BỘ');
  expect(fetch).not.toHaveBeenCalled();
});
it('keeps the real Gemini connection behavior outside the sandbox', async () => {
  delete window.AsianSchoolRuntime;
  fetch.mockResolvedValue({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'OK'}]}}]})});
  expect((await testGeminiConnection('fake-key','fake-model',false)).success).toBe(true);
  expect(fetch).toHaveBeenCalledOnce();
});
it('records only the latest 50 local webhook requests without sending them', async () => {
  for (let i=0;i<52;i++) {
    const result = await window.AsianSchoolStorage.postToWebhook('https://example.invalid/webhook',{action:'sync',row:i});
    expect(result.data.simulated).toBe(true);
  }
  const rows=JSON.parse(localStorage.getItem('ahs_local_sandbox_webhook_log'));
  expect(rows).toHaveLength(50);
  expect(rows[0].payload.row).toBe(2);
  expect(rows[49].payload.row).toBe(51);
  expect(fetch).not.toHaveBeenCalled();
});
it('retains webhook response handling outside the sandbox', async () => {
  delete window.AsianSchoolRuntime;
  fetch.mockResolvedValue({ok:true,text:async()=>JSON.stringify({success:false,error:'Từ chối thử'})});
  expect((await window.AsianSchoolStorage.postToWebhook('https://example.invalid',{})).success).toBe(false);
  expect(fetch).toHaveBeenCalledOnce();
});
it('identifies sandbox and separate teacher/student origins', () => {
  render(<LocalSandboxBanner />);
  expect(screen.getByRole('link',{name:'Cổng giáo viên thử'}).href).toBe('http://localhost:5188/AHS-LMS/admin/');
  expect(screen.getByRole('link',{name:'Cổng học sinh thử'}).href).toBe('http://127.0.0.1:5188/AHS-LMS/test/');
  expect(screen.getByText(/AI và đồng bộ Google Sheets cũ chỉ mô phỏng/)).toBeTruthy();
});
it('does not show a trial banner in normal mode', () => {
  delete window.AsianSchoolRuntime;
  const {container}=render(<LocalSandboxBanner />);
  expect(container.textContent).toBe('');
});
it('labels the local teacher sign in clearly', () => {
  render(<AdminContext.Provider value={{authReady:true,handleLogin:vi.fn()}}><LoginScreen /></AdminContext.Provider>);
  expect(screen.getByRole('button',{name:'Vào vai giáo viên thử'})).toBeTruthy();
});

it('web sandbox simulates Gemini and Sheets without using entered keys or endpoints', async () => {
  window.AsianSchoolRuntime = {mode:'web-sandbox',projectId:'ahs-lms-sandbox'};
  expect(getGeminiApiKey()).toBe('web-sandbox-not-a-real-key');
  expect((await testGeminiConnection('entered-key')).simulated).toBe(true);
  const grade=await gradeSingleEssayWithGemini({studentAnswer:'Bài làm giả trên web',maxPoints:1,apiKey:'entered-key'});
  expect(grade.success).toBe(true);
  expect(grade.simulated).toBe(true);
  expect(grade.feedback).toContain('MÔ PHỎNG WEB THỬ');
  const result=await window.AsianSchoolStorage.postToWebhook('https://example.invalid/real-webhook',{action:'sync',token:'not-to-log'});
  expect(result.data.simulated).toBe(true);
  expect(JSON.parse(localStorage.getItem('ahs_local_sandbox_webhook_log'))[0].payload.token).toBeUndefined();
  expect(fetch).not.toHaveBeenCalled();
});
it('web banner links distinct teacher and student domains and exposes no room password', () => {
  window.AsianSchoolRuntime = {mode:'web-sandbox'};
  render(<LocalSandboxBanner />);
  expect(screen.getByText('HỆ THỐNG THỬ TRÊN WEB')).toBeTruthy();
  expect(screen.getByRole('link',{name:'Cổng giáo viên thử'}).href).toBe('https://ahs-lms-sandbox.web.app/admin/');
  expect(screen.getByRole('link',{name:'Cổng học sinh thử'}).href).toBe('https://ahs-lms-sandbox.firebaseapp.com/test/');
  expect(screen.queryByText('sandbox-local')).toBeNull();
  expect(screen.getByRole('button',{name:/nhật ký Sheets mô phỏng trên thiết bị này/})).toBeTruthy();
});
it('web trial login clearly uses shared trial credentials instead of Google', () => {
  window.AsianSchoolRuntime = {mode:'web-sandbox'};
  render(<AdminContext.Provider value={{authReady:true,handleLogin:vi.fn()}}><LoginScreen /></AdminContext.Provider>);
  expect(screen.getByRole('button',{name:'Đăng nhập hệ thống thử'})).toBeTruthy();
  expect(screen.getByLabelText('Tài khoản thử').name).toBe('username');
  expect(screen.getByLabelText('Mật khẩu thử').type).toBe('password');
  expect(screen.getByLabelText('Mật khẩu thử').value).toBe('');
  expect(screen.getByText(/Tài khoản dùng chung.*chỉ dành cho hệ thống thử/)).toBeTruthy();
  expect(screen.getByRole('link',{name:/Về Cổng Khảo Thí Học Sinh/}).href).toBe('https://ahs-lms-sandbox.firebaseapp.com/test/');
});
function LoginHarness() {
  const admin=useAdminController();
  return <AdminContext.Provider value={admin}><LoginScreen /></AdminContext.Provider>;
}
it('forwards submitted trial credentials to the sandbox authentication function', async () => {
  window.AsianSchoolRuntime={mode:'web-sandbox'};
  const signInTeacher=vi.fn().mockResolvedValue({});
  window.AsianSchoolAuth={onChange:cb=>{cb({isTeacher:false,user:null});return()=>{};},signInTeacher};
  render(<LoginHarness />);
  fireEvent.change(screen.getByLabelText('Tài khoản thử'),{target:{value:'admin'}});
  fireEvent.change(screen.getByLabelText('Mật khẩu thử'),{target:{value:'admin'}});
  fireEvent.submit(screen.getByRole('button',{name:'Đăng nhập hệ thống thử'}).closest('form'));
  await waitFor(()=>expect(signInTeacher).toHaveBeenCalledWith({username:'admin',password:'admin'}));
  delete window.AsianSchoolAuth;
});
it('normal login still calls Google authentication without trial credentials', async () => {
  delete window.AsianSchoolRuntime;
  const signInTeacher=vi.fn().mockResolvedValue({});
  window.AsianSchoolAuth={onChange:cb=>{cb({isTeacher:false,user:null});return()=>{};},signInTeacher};
  render(<LoginHarness />);
  expect(screen.queryByLabelText('Tài khoản thử')).toBeNull();
  fireEvent.submit(screen.getByRole('button',{name:'Đăng Nhập Bằng Google'}).closest('form'));
  await waitFor(()=>expect(signInTeacher).toHaveBeenCalledWith());
  delete window.AsianSchoolAuth;
});
