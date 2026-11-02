import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AdminContext } from '../src/admin/AdminContext.js';
import ExamAllocationCard from '../src/admin/config/ExamAllocationCard.jsx';
let set;
beforeEach(() => { set=vi.fn().mockResolvedValue(undefined); window.firebaseDb={ collection:vi.fn(() => ({doc:vi.fn(() => ({set}))})) }; });
afterEach(cleanup);
function open(mode='class_assigned') { return render(<AdminContext.Provider value={{config:{codeAllocationMode:mode,fixedCode:'103'},setConfig:vi.fn()}}><ExamAllocationCard /></AdminContext.Provider>); }
it('preserves current allocation until teacher explicitly saves student choice', async () => {
 open('random'); expect(screen.getByLabelText('Cách phân mã đề').value).toBe('random'); expect(set).not.toHaveBeenCalled();
 fireEvent.change(screen.getByLabelText('Cách phân mã đề'),{target:{value:'student_choice'}});
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Lưu cách phân mã đề'})));
 expect(set).toHaveBeenCalledWith({codeAllocationMode:'student_choice'},{merge:true}); expect(screen.getByRole('status').textContent).toContain('Đã lưu');
});
it('waits for server acknowledgement and does not report success on error', async () => {
 let reject; set.mockReturnValue(new Promise((_,r)=>{reject=r;})); open();
 fireEvent.change(screen.getByLabelText('Cách phân mã đề'),{target:{value:'student_choice'}});
 fireEvent.click(screen.getByRole('button',{name:'Lưu cách phân mã đề'}));
 expect(screen.getByLabelText('Cách phân mã đề').disabled).toBe(true); expect(screen.queryByText(/Đã lưu/)).toBeNull();
 await act(async()=>reject(new Error('permission-denied')));
 expect(screen.getByRole('alert').textContent).toContain('Chưa lưu'); expect(screen.getByLabelText('Cách phân mã đề').disabled).toBe(false);
});
it('updates selection when a new server configuration arrives', () => {
 const view=open(); view.rerender(<AdminContext.Provider value={{config:{codeAllocationMode:'student_choice'},setConfig:vi.fn()}}><ExamAllocationCard /></AdminContext.Provider>);
 expect(screen.getByLabelText('Cách phân mã đề').value).toBe('student_choice');
});
