import {expect,it} from 'vitest';
import {filterLiveSessions} from '../src/admin/live/liveSearch.js';
const sessions=[
 {sessionId:'a',fullName:'Đặng Minh Anh',studentId:'01-23-0045',studentClass:'9/21',status:'in_progress',violations:0},
 {sessionId:'b',fullName:'Nguyễn Gia Huy',studentId:'888888',studentClass:'9/25',status:'locked',isLocked:true,violations:3},
 {sessionId:'c',fullName:'Hồ Minh Anh',studentId:'777777',studentClass:'9/21',status:'practicing',violations:1}
];
it('finds accent-insensitive name tokens and complete or partial LMS codes without separators',()=>{
 expect(filterLiveSessions(sessions,{query:'dang anh'}).map(s=>s.sessionId)).toEqual(['a']);
 expect(filterLiveSessions(sessions,{query:'01230045'}).map(s=>s.sessionId)).toEqual(['a']);
 expect(filterLiveSessions(sessions,{query:'23-0045'}).map(s=>s.sessionId)).toEqual(['a']);
 expect(filterLiveSessions(sessions,{query:'minh anh',studentClass:'9/21'})).toHaveLength(2);
});
it('combines class, status and search; prioritizes locked pupils without mutating source sessions',()=>{
 expect(filterLiveSessions(sessions,{}).map(s=>s.sessionId)).toEqual(['b','a','c']);
 expect(filterLiveSessions(sessions,{status:'locked',studentClass:'9/21'})).toEqual([]);
 expect(filterLiveSessions(sessions,{status:'violations',query:'anh'}).map(s=>s.sessionId)).toEqual(['c']);
 expect(sessions.map(s=>s.sessionId)).toEqual(['a','b','c']);
});
