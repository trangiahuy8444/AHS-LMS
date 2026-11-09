import {expect,it} from 'vitest';
import {validateEssayGrade,essayRubricParts} from '../src/shared/essayGradingPolicy.js';
it('requires 0, 0.25 or 0.5 per half-point criterion and an exact total',()=>{
 const parts=essayRubricParts({question:'Đề giả. a) Ý a (0,5 điểm). b) Ý b (0,5 điểm).',maxPoints:1});
 expect(parts.map(part=>part.maxPoints)).toEqual([0.5,0.5]);
 const grade=(score,points)=>validateEssayGrade({score,breakdown:points.map((point,i)=>({item:parts[i].item,points:point,maxPoints:0.5,reason:'Lỗi giả để kiểm tra'}))},parts,1);
 expect(grade(0.88,[0.5,0.38]).valid).toBe(false);
 expect(grade(0.75,[0.375,0.375]).valid).toBe(false);
 expect(grade(1,[0.5,0.25]).valid).toBe(false);
 expect(grade(0.75,[0.5,0.25]).valid).toBe(true);
 expect(grade(1,[0.5,0.5]).valid).toBe(true);
});
it('quarter-point criteria allow only zero or the full quarter point',()=>{
 const parts=essayRubricParts({maxPoints:0.75,subItems:[{letter:'a'},{letter:'b'},{letter:'c'}]});
 expect(parts.map(part=>part.maxPoints)).toEqual([0.25,0.25,0.25]);
 expect(validateEssayGrade({score:0.5,breakdown:[0.25,0,0.25].map(points=>({points,maxPoints:0.25,reason:'Ý còn thiếu'}))},parts,0.75).valid).toBe(true);
});
