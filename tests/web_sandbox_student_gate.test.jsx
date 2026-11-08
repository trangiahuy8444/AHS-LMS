import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import WebSandboxStudentGate from '../src/student/components/WebSandboxStudentGate.jsx';
afterEach(()=>{cleanup();delete window.AsianSchoolRuntime;delete window.AsianSchoolAuth;});
function setup(state){
  window.AsianSchoolRuntime={mode:'web-sandbox'};
  let listener;
  const signInSandbox=vi.fn().mockResolvedValue({});
  window.AsianSchoolAuth={getState:()=>state,onChange:cb=>{listener=cb;return()=>{};},signInSandbox};
  render(<WebSandboxStudentGate><div>Nội dung học sinh thử</div></WebSandboxStudentGate>);
  return {signInSandbox,update:next=>act(()=>listener(next))};
}
it('keeps a signed-in but unauthorized account outside the trial student app',()=>{
  setup({ready:true,user:{uid:'not-teacher'},isTeacher:false});
  expect(screen.queryByText('Nội dung học sinh thử')).toBeNull();
  expect(screen.getByLabelText('Tài khoản thử')).toBeTruthy();
});
it('waits for ready authentication before exposing an authorized cached session',()=>{
  setup({ready:false,user:{uid:'trial-teacher'},isTeacher:true});
  expect(screen.queryByText('Nội dung học sinh thử')).toBeNull();
  expect(screen.getByRole('status').textContent).toContain('Đang kiểm tra phiên thử');
});
it('submits shared credentials and waits for an authorized auth event before showing children',async()=>{
  const {signInSandbox,update}=setup({ready:true,user:null,isTeacher:false});
  expect(screen.getByLabelText('Mật khẩu thử').value).toBe('');
  fireEvent.change(screen.getByLabelText('Tài khoản thử'),{target:{value:'admin'}});
  fireEvent.change(screen.getByLabelText('Mật khẩu thử'),{target:{value:'admin'}});
  fireEvent.submit(screen.getByRole('button',{name:'Vào cổng học sinh thử'}).closest('form'));
  await waitFor(()=>expect(signInSandbox).toHaveBeenCalledWith({username:'admin',password:'admin'}));
  expect(screen.queryByText('Nội dung học sinh thử')).toBeNull();
  update({ready:true,user:{uid:'trial-teacher'},isTeacher:true});
  expect(screen.getByText('Nội dung học sinh thử')).toBeTruthy();
  update({ready:true,user:null,isTeacher:false});
  expect(screen.queryByText('Nội dung học sinh thử')).toBeNull();
});
it('does not change normal or local student entry access',()=>{
  window.AsianSchoolRuntime={mode:'local-sandbox'};
  render(<WebSandboxStudentGate><div>Nội dung học sinh thử</div></WebSandboxStudentGate>);
  expect(screen.getByText('Nội dung học sinh thử')).toBeTruthy();
});
