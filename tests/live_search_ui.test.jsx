import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {AdminContext} from '../src/admin/AdminContext.js';
import LiveTab from '../src/admin/tabs/LiveTab.jsx';
vi.mock('../src/admin/live/ClassAccessPanel.jsx',()=>({default:()=>null}));
afterEach(cleanup);
const liveSessions=[
 {sessionId:'fake-a',fullName:'Đặng Minh Anh',studentId:'123456',studentClass:'9/21',grade:9,status:'in_progress',mode:'exam',lastPing:Date.now(),violations:0},
 {sessionId:'fake-b',fullName:'Nguyễn Gia Huy',studentId:'654321',studentClass:'9/25',grade:9,status:'locked',isLocked:true,mode:'exam',lastPing:Date.now(),violations:3},
 {sessionId:'fake-c',fullName:'Hồ Minh Anh',studentId:'999999',studentClass:'9/21',grade:9,status:'in_progress',mode:'exam',lastPing:Date.now(),violations:1}
];
function setup(){const s={liveSessions,submissions:[],practiceSubs:[],liveFilter:'all',handleUnlockSession:vi.fn(),handleExtendTime:vi.fn(),showToast:vi.fn()};render(<AdminContext.Provider value={s}><LiveTab/></AdminContext.Provider>);return s;}
it('finds a pupil without accents, opens the correct reminder, and filters to the exact locked pupil for unlocking',()=>{
 const s=setup();
 fireEvent.change(screen.getByRole('searchbox',{name:'Tên hoặc mã LMS'}),{target:{value:'dang anh'}});
 expect(screen.getByText('Đặng Minh Anh')).toBeTruthy();expect(screen.queryByText('Nguyễn Gia Huy')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Nhắc nhở học sinh'}));
 expect(screen.getByRole('dialog',{name:'Nhắc nhở học sinh'}).textContent).toContain('123456');
 fireEvent.click(screen.getByRole('button',{name:'Hủy'}));
 fireEvent.click(screen.getByRole('button',{name:'Xóa tìm / lọc'}));
 fireEvent.change(screen.getByRole('combobox',{name:'Lọc trạng thái giám sát'}),{target:{value:'locked'}});
 expect(screen.getByText('Nguyễn Gia Huy')).toBeTruthy();expect(screen.queryByText('Đặng Minh Anh')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:/MỞ KHÓA/}));
 expect(s.handleUnlockSession).toHaveBeenCalledWith('fake-b','Nguyễn Gia Huy');
});
it('slash focuses search, typing in another input does not steal focus, escape clears search and empty results offer guidance',()=>{
 setup();const input=screen.getByRole('searchbox',{name:'Tên hoặc mã LMS'});
 fireEvent.keyDown(document,{key:'/'});expect(document.activeElement).toBe(input);
 fireEvent.change(input,{target:{value:'khongco'}});expect(screen.getByText(/Không tìm thấy học sinh phù hợp/)).toBeTruthy();
 fireEvent.keyDown(input,{key:'Escape'});expect(input.value).toBe('');expect(screen.getByText('Đặng Minh Anh')).toBeTruthy();
 fireEvent.change(screen.getByRole('combobox',{name:'Lọc lớp giám sát'}),{target:{value:'9/25'}});expect(screen.queryByText('Đặng Minh Anh')).toBeNull();
});

it('hides class-wide commands while targeting a pupil to avoid acting on the whole class by mistake',()=>{
 setup();
 fireEvent.change(screen.getByRole('searchbox',{name:'Tên hoặc mã LMS'}),{target:{value:'dang anh'}});
 expect(screen.queryByRole('button',{name:/\+5p Cả Lớp/})).toBeNull();
 expect(screen.queryByRole('button',{name:'Xóa Lớp Này'})).toBeNull();
 expect(screen.getByRole('button',{name:'Nhắc nhở học sinh'})).toBeTruthy();
});
