// Danh sách thử độc lập; được Vite thay cho roster thật chỉ ở mode sandbox.
const classes = ['8/19','8/20','8/21','8/22','8/23','9/20','9/21','9/22','9/23','9/24','9/25','9/26','10/14','10/15','10/16'];
export const ROSTER_BY_CLASS = Object.fromEntries(classes.map(name => [name,[
  {stt:1,fullName:'Học Sinh Thử Một',lmsCode:'990001',studentId:'990001'},
  {stt:2,fullName:'Học Sinh Thử Hai',lmsCode:'990002',studentId:'990002'}
]]));
export function getStudentsByClass(name) { return ROSTER_BY_CLASS[name] || []; }
export function cleanLmsCode(value) { return String(value || '').replace(/[^a-zA-Z0-9]/g,'').toLowerCase(); }
export function verifyStudentLms(student,value) { return !!student && cleanLmsCode(value) === student.studentId; }
export function findStudentInClassByLms(name,value) { return getStudentsByClass(name).find(s=>verifyStudentLms(s,value)) || null; }
export function findStudentInGradeByLms(grade,value) {
  const entry=Object.entries(ROSTER_BY_CLASS).find(([name,students])=>name.startsWith(`${grade}/`) && students.some(s=>verifyStudentLms(s,value)));
  return entry ? {...entry[1].find(s=>verifyStudentLms(s,value)),studentClass:entry[0],grade:Number(grade)} : null;
}
