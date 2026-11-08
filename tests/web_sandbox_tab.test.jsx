import React from 'react';
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import LocalSandboxTab from '../src/admin/tabs/LocalSandboxTab.jsx';
afterEach(()=>{cleanup();delete window.AsianSchoolRuntime;});
it('main admin trial entry opens the web system without local installation',()=>{
  render(<LocalSandboxTab />);
  expect(screen.getByRole('heading',{name:'Hệ thống thử trên web'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'Mở giáo viên thử'}).href).toBe('https://ahs-lms-sandbox.web.app/admin/');
  expect(screen.getByRole('link',{name:'Mở học sinh thử'}).href).toBe('https://ahs-lms-sandbox.firebaseapp.com/test/');
  expect(screen.queryByText('MO_HE_THONG_THU.command')).toBeNull();
  expect(screen.getByText(/đồng bộ giữa các máy/)).toBeTruthy();
});
