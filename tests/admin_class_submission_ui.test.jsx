import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import {AdminContext} from '../src/admin/AdminContext.js';
import LiveSessionList from '../src/admin/live/LiveSessionList.jsx';
import SubmissionsTab from '../src/admin/tabs/SubmissionsTab.jsx';
vi.mock('../src/core/roster-data.js',()=>({ROSTER_BY_CLASS:{'9/21':[{studentId:'1'},{studentId:'2'}],'9/25':[{studentId:'3'}]},getStudentsByClass:cls=>cls==='9/21'?[{studentId:'1'},{studentId:'2'}]:[{studentId:'3'}]}));
vi.mock('../src/admin/components/ClassGradingStatusBar.jsx',()=>({default:()=>null}));
afterEach(cleanup);
const submissions=[{studentClass:'9/21',grade:9,studentId:'1',mode:'exam'},{studentClass:'9/21',grade:9,studentId:'1',mode:'exam'}];
it('keeps class totals and submitted counts visible after every student leaves the website, never marks class finished when pupils remain unsubmitted',()=>{
 render(<AdminContext.Provider value={{liveSessions:[],liveFilter:'all',submissions,practiceSubs:[]}}><LiveSessionList/></AdminContext.Provider>);
 const summary=screen.getByLabelText('Tiến độ nộp bài lớp 9/21');
 expect(summary.textContent).toContain('Sĩ số: 2');
 expect(summary.textContent).toContain('Đã nộp thi: 1 / 2');
 expect(summary.textContent).toContain('Chưa nộp: 1');
 expect(screen.getByText(/Không có phiên trực tuyến/)).toBeTruthy();
 expect(screen.queryByText(/ĐÃ THI XONG/)).toBeNull();
});

it('only marks class finished when 100% of the class roster has submitted and no pupil is actively taking the test',()=>{
 const allDoneSubmissions = [
   {studentClass:'9/21',grade:9,studentId:'1',mode:'exam'},
   {studentClass:'9/21',grade:9,studentId:'2',mode:'exam'}
 ];
 render(<AdminContext.Provider value={{liveSessions:[],liveFilter:'all',submissions:allDoneSubmissions,practiceSubs:[]}}><LiveSessionList/></AdminContext.Provider>);
 expect(screen.getByText(/ĐÃ THI XONG \(2\/2\)/)).toBeTruthy();
});
it('submission counts use all database rows, not the filtered table or search results, and update with new rows',()=>{
 const context={config:{},filterGrade:'9',filterClass:'9/21',filterMode:'all',filterGraded:'pending',searchQuery:'Không khớp tên',filteredSubmissions:[],submissions,practiceSubs:[],cloudStatus:{connected:true}};
 const view=render(<AdminContext.Provider value={context}><SubmissionsTab/></AdminContext.Provider>);
 expect(screen.getByLabelText('Tiến độ nộp bài lớp 9/21').textContent).toContain('Đã nộp thi: 1 / 2');
 view.rerender(<AdminContext.Provider value={{...context,submissions:[...submissions,{studentClass:'9/21',grade:9,studentId:'2',mode:'exam'}]}}><SubmissionsTab/></AdminContext.Provider>);
 expect(screen.getByLabelText('Tiến độ nộp bài lớp 9/21').textContent).toContain('Đã nộp thi: 2 / 2');
 expect(within(screen.getByLabelText('Tiến độ nộp bài lớp 9/21')).getByText(/Chưa nộp:/).textContent).toContain('0');
});
it('shows classes with zero submissions using the class roster, including the practice mode',()=>{
 render(<AdminContext.Provider value={{config:{},filterGrade:'9',filterClass:'all',filterMode:'practice',filterGraded:'all',searchQuery:'',filteredSubmissions:[],submissions,practiceSubs:[]}}><SubmissionsTab/></AdminContext.Provider>);
 expect(screen.getByLabelText('Tiến độ nộp bài lớp 9/25').textContent).toContain('Đã nộp ôn tập: 0 / 1');
 expect(screen.getByLabelText('Tiến độ nộp bài lớp 9/21').textContent).toContain('Đã nộp ôn tập: 0 / 2');
});
