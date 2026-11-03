import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AdminContext } from '../src/admin/AdminContext.js';
import RoomPasswordCard from '../src/admin/config/RoomPasswordCard.jsx';
afterEach(cleanup);
it('waits for the private server write before confirming the new password', async () => {
  let finish;
  const set = vi.fn(() => new Promise(resolve => { finish = resolve; }));
  const collection = vi.fn(() => ({ doc: () => ({ set }) }));
  window.firebaseDb = { collection };
  const setConfig = vi.fn();
  render(<AdminContext.Provider value={{ config: { examPassword: '' }, setConfig }}><RoomPasswordCard /></AdminContext.Provider>);
  fireEvent.change(screen.getByLabelText('Mật khẩu phòng thi'), { target: { value: '  fake-room  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu Mật Khẩu Thi' }));
  expect(collection).toHaveBeenCalledExactlyOnceWith('exam_secrets');
  expect(set).toHaveBeenCalledWith({ examPassword: 'fake-room' }, { merge: true });
  expect(setConfig).not.toHaveBeenCalled();
  await act(async () => finish());
  expect(screen.getByRole('status').textContent).toMatch(/Đã lưu/);
});

it('shows an error and keeps the input when the private write is rejected', async () => {
  const set = vi.fn().mockRejectedValue(new Error('permission-denied'));
  window.firebaseDb = { collection: () => ({ doc: () => ({ set }) }) };
  const setConfig = vi.fn();
  render(<AdminContext.Provider value={{ config: { examPassword: 'old-room' }, setConfig }}><RoomPasswordCard /></AdminContext.Provider>);
  const input = screen.getByLabelText('Mật khẩu phòng thi');
  fireEvent.change(input, { target: { value: 'new-room' } });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Lưu Mật Khẩu Thi' })));
  expect(screen.getByRole('alert').textContent).toMatch(/Chưa lưu/);
  expect(input.value).toBe('new-room');
  expect(setConfig).not.toHaveBeenCalled();
});
