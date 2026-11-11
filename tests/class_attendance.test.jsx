import { expect, it } from 'vitest';
import { classAttendance } from '../src/admin/live/classAttendance.js';
it('counts pupils rather than tabs, excludes submitted and stale sessions, keeps the full class size', () => {
  const now = 1000000;
  const sessions = [
    { sessionId:'a',studentId:'01-01',studentClass:'9/21',mode:'exam',status:'in_progress',lastPing:now },
    { sessionId:'b',studentId:'0101',studentClass:'9/21',mode:'exam',status:'locked',lastPing:now+1 },
    { sessionId:'c',studentId:'02',studentClass:'9/21',mode:'practice',status:'practicing',lastPing:now },
    { sessionId:'d',studentId:'03',studentClass:'9/21',mode:'exam',status:'in_progress',lastPing:now-200000 },
    { sessionId:'e',studentId:'04',studentClass:'9/21',mode:'exam',status:'in_progress',lastPing:now-1000 },
    { sessionId:'f',studentId:'04',studentClass:'9/21',mode:'exam',status:'submitted',lastPing:now },
    { sessionId:'g',studentId:'05',studentClass:'8/19',mode:'exam',status:'in_progress',lastPing:now }
  ];
  expect(classAttendance(sessions,'9/21',new Array(30).fill({}),now)).toEqual({total:30,active:2,exam:1,practice:1,locked:1});
  expect(classAttendance(sessions,'unknown',[],now).total).toBeNull();
});

it('uses roster aliases to count a pupil once when LMS and Canvas IDs differ',()=>{
 const now=Date.now(),roster=[{studentId:'000123',canvasUserId:'456',loginId:'00-01-23'}];
 const base={studentClass:'8/19',mode:'exam',status:'in_progress',lastPing:now};
 expect(classAttendance([{...base,studentId:'123'},{...base,studentId:'456'},{...base,studentId:'00-01-23'}],'8/19',roster,now).active).toBe(1);
});

it('đã nộp bài ôn tập không làm mất học sinh đang thi chính thức khỏi bộ đếm', () => {
  const now = Date.now();
  const roster = [{ studentId: '14180325' }, { studentId: '14180300' }, { studentId: '15230056' }];
  const sessions = [
    { sessionId: 'p1', studentId: '14180325', fullName: 'Trương Khải Tuấn', studentClass: '9/23', mode: 'practice', status: 'submitted', lastPing: now - 5000 },
    { sessionId: 'x1', studentId: '14180325', fullName: 'Trương Khải Tuấn', studentClass: '9/23', mode: 'exam', status: 'in_progress', lastPing: now - 60000 },
    { sessionId: 'x2', studentId: '14180300', fullName: 'Võ Giáp Minh Quân', studentClass: '9/23', mode: 'exam', status: 'in_progress', lastPing: now },
    { sessionId: 'x3', studentId: '15230056', fullName: 'Nguyễn Ngọc Hân', studentClass: '9/23', mode: 'exam', status: 'in_progress', lastPing: now }
  ];
  const submissions = [
    { studentId: '14180325', studentClass: '9/23', mode: 'practice', sessionId: 'p1' },
    { studentId: '14180300', studentClass: '9/23', mode: 'practice', sessionId: 'p0' },
    { studentId: '15230056', studentClass: '9/23', mode: 'exam', sessionId: 'x3' }
  ];
  const res = classAttendance(sessions, '9/23', roster, now, submissions, 15 * 60 * 1000);
  expect(res.exam).toBe(2);
  expect(res.active).toBe(2);
});
