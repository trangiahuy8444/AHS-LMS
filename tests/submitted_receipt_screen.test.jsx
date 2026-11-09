import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {StudentContext} from '../src/student/StudentContext.js';
import ResultScreen from '../src/student/screens/ResultScreen.jsx';
vi.mock('../src/student/result/AnswerReview.jsx',()=>({default:()=> <div>PRIVATE_ANSWERS</div>}));
afterEach(cleanup);
for(const review of [false,true])it(`reopened result allows a screenshot without automatically exposing answers (review=${review})`,()=>{
 const capture=vi.fn(),lookup=vi.fn();
 render(<StudentContext.Provider value={{mode:'exam',examState:'submitted',grade:9,fullName:'Học Sinh Giả',studentClass:'9/21',studentId:'TEST',scoreResult:{receiptOnly:true,receiptDetailsUnavailable:true,examCode:'101',violations:0},config:{allowStudentReviewOfficialExam:review},handleCaptureScreenshot:capture,handleReviewLookup:lookup}}><ResultScreen/></StudentContext.Provider>);
 expect(screen.getByText('ĐÃ NỘP BÀI THÀNH CÔNG')).toBeTruthy();
 expect(screen.getByText('Chưa tải được điểm')).toBeTruthy();
 expect(screen.queryByText('PRIVATE_ANSWERS')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:/CHỤP MÀN HÌNH KẾT QUẢ/}));expect(capture).toHaveBeenCalledOnce();
 if(review){fireEvent.click(screen.getByRole('button',{name:'Xem bài & chốt điểm'}));expect(lookup).toHaveBeenCalledOnce();}
 else expect(screen.queryByRole('button',{name:'Xem bài & chốt điểm'})).toBeNull();
});
