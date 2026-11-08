import {expect,it} from 'vitest';
import {getStudentsByClass,verifyStudentLms} from '../src/sandbox/roster-data.js';
import '../src/sandbox/practiceData.js';
it('provides only fake roster entries and full practice structures in all three grades',()=>{
 for(const grade of [8,9,10]){
  const list=getStudentsByClass(grade===8?'8/19':grade===9?'9/20':'10/14');
  expect(list).toHaveLength(2);expect(list.every(s=>s.fullName.startsWith('Học Sinh Thử'))).toBe(true);
  expect(verifyStudentLms(list[0],'990001')).toBe(true);expect(verifyStudentLms(list[0],'bad')).toBe(false);
  const data=window[`EXAM_DATA_G${grade}`];
  expect(data.practiceQuestions).toHaveLength(grade===10?19:28);expect(data.practiceEssayQuestions).toHaveLength(3);
  expect(data.practiceTfQuestions).toHaveLength(grade===10?3:0);
 }
});
