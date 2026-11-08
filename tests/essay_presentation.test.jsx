import { expect, it } from 'vitest';
import { essayPresentation } from '../src/shared/essayPresentation.js';

it('preserves unsplit questions when requirements are absent, single, or ambiguous', () => {
  for (const question of [
    'Mô tả cách xử lý tình huống.',
    'Tình huống. a) Một yêu cầu duy nhất.',
    'Tham khảo b) và c) trong tài liệu.',
    'Tình huống. a) Ý đầu. c) Ý không liên tiếp.',
    'Tình huống. a) Ý đầu. b) Có tham chiếu a) trong văn bản.'
  ]) expect(essayPresentation({ question })).toEqual({stem: question, subItems: []});
});
it('preserves structured subitems rather than parsing their context a second time', () => {
  const subItems = [{letter: 'a', text: 'Ý đã duyệt.'}];
  const context = 'Ví dụ a) thứ nhất b) thứ hai trong tình huống.';
  expect(essayPresentation({context, question: 'Bản dự phòng', subItems})).toEqual({stem: context, subItems});
});
it('keeps line breaks, examples and individual points in inline requirements', () => {
  expect(essayPresentation({question: 'Tình huống.\na) Nêu ví dụ (x; y).\nGiải thích. (0,5 điểm)\nb) Kết luận. (0,5 điểm)'})).toEqual({
    stem: 'Tình huống.', subItems: [
      {letter:'a', text:'Nêu ví dụ (x; y).\nGiải thích. (0,5 điểm)'},
      {letter:'b', text:'Kết luận. (0,5 điểm)'}
    ]
  });
});
it('accepts the text alias without adding answers or mutating the source', () => {
  const source = Object.freeze({text:'Tình huống. a) Ý đầu. b) Ý cuối.', rubric:'Barem riêng'});
  expect(essayPresentation(source)).toEqual({stem:'Tình huống.',subItems:[{letter:'a',text:'Ý đầu.'},{letter:'b',text:'Ý cuối.'}]});
  expect(essayPresentation()).toEqual({stem:'',subItems:[]});
});
