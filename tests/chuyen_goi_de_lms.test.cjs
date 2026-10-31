const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { preparePackage, writePrivatePackage, main } = require('../scripts/chuyen_goi_de_lms.cjs');

function fixture(grade = 8) {
  const mcq = Array.from({ length: grade === 10 ? 19 : 28 }, (_, i) => ({ num: i + 1, id: `fake-mc-${i}`, question: 'Câu giả', options: ['A giả', 'B giả', 'C giả', 'D giả'], correctAnswer: i % 4, points: 0.25 }));
  const essay = Array.from({ length: 3 }, (_, i) => ({ num: i + 1, question: 'Tự luận giả', points: grade === 10 ? 0.75 : 1, modelAnswer: 'Barem giả', rubric: [{ criterion: 'Tiêu chí giả', points: grade === 10 ? 0.75 : 1 }] }));
  return { grade, officialExams: Object.fromEntries(['101','102','103','104'].map(code => [code, { code, totalPoints: 10, ...(grade === 10 ? { part1_mcq: mcq, part2_tf: Array.from({ length: 3 }, (_, i) => ({ num: i + 1, context: 'Đúng sai giả', points: 1, subQuestions: ['a','b','c','d'].map(letter => ({ letter, text: 'Nhận định giả', correctAnswer: true })) })), part3_essay: essay } : { mcqQuestions: mcq, essayQuestions: essay }) }])) };
}
function repo() { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ahs-converter-test-')); execFileSync('git', ['init','-q',dir]); fs.writeFileSync(path.join(dir,'.gitignore'),'private/\n'); return dir; }

test('gói native ba khối giữ nguyên mã câu, barem và toàn bộ dữ liệu', () => {
  for (const grade of [8,9,10]) { const input = fixture(grade), result = preparePackage(input); assert.deepEqual(result.package, input); assert.notEqual(result.package, input); assert.equal(result.sha256.length,64); }
});
test('hash chuẩn hóa không đổi khi thứ tự key đổi; nội dung đổi bị phát hiện', () => {
  const input = fixture(); const hash = preparePackage(input).sha256;
  assert.equal(preparePackage({ officialExams: input.officialExams, grade: 8 }).sha256,hash);
  input.officialExams['101'].mcqQuestions[0].question += ' thay đổi';
  assert.throws(() => preparePackage(input,{expectedHash:hash}),/checksum/i);
});
test('từ chối khối/mã thiếu, code không khớp, số câu trùng và đáp án sai', () => {
  for (const mutate of [p=>p.grade=11,p=>delete p.officialExams['104'],p=>p.officialExams['101'].code='102',p=>p.officialExams['101'].mcqQuestions[1].num=1,p=>p.officialExams['101'].mcqQuestions[0].correctAnswer=4]) { const input=fixture();mutate(input);assert.throws(()=>preparePackage(input)); }
});
test('từ chối điểm âm/không hữu hạn, tổng sai và cấu trúc Đ/S sai', () => {
  for (const mutate of [p=>p.officialExams['101'].part1_mcq[0].points=-1,p=>p.officialExams['101'].part1_mcq[0].points=Infinity,p=>p.officialExams['101'].totalPoints=9,p=>p.officialExams['101'].part2_tf[0].subQuestions[1].letter='a',p=>p.officialExams['101'].part2_tf[0].subQuestions[0].correctAnswer='true']) { const input=fixture(10);mutate(input);assert.throws(()=>preparePackage(input)); }
});
test('từ chối native có alias mơ hồ và record ngân hàng chưa có adapter', () => {
 const input=fixture();input.officialExams['101'].part1_mcq=input.officialExams['101'].mcqQuestions;assert.throws(()=>preparePackage(input),/đồng thời/);
 assert.throws(()=>preparePackage({questions:[],status:'locked'}),/native/);
});
test('chỉ ghi private được gitignore, chặn output công khai, symlink, ghi đè và thiếu hash', t => {
 const dir=repo();t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const input=fixture();const result=preparePackage(input);const output=path.join(dir,'private','package.json');
 assert.throws(()=>writePrivatePackage(result,output,{repoRoot:dir}),/checksum/i);
 assert.throws(()=>writePrivatePackage(result,path.join(dir,'data','exam.json'),{repoRoot:dir,expectedHash:result.sha256}),/private/);
 writePrivatePackage(result,output,{repoRoot:dir,expectedHash:result.sha256});assert.deepEqual(JSON.parse(fs.readFileSync(output,'utf8')),input);
 assert.throws(()=>writePrivatePackage(result,output,{repoRoot:dir,expectedHash:result.sha256}),/đã tồn tại/);
 fs.symlinkSync(path.join(dir,'private'),path.join(dir,'private','link'),'dir');assert.throws(()=>writePrivatePackage(result,path.join(dir,'private','link','new.json'),{repoRoot:dir,expectedHash:result.sha256}),/symlink/);
});
test('private chưa gitignore bị chặn',t=>{const dir=repo();t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));fs.writeFileSync(path.join(dir,'.gitignore'),'');const result=preparePackage(fixture());assert.throws(()=>writePrivatePackage(result,path.join(dir,'private','exam.json'),{repoRoot:dir,expectedHash:result.sha256}),/gitignore/);});
test('CLI dryrun mặc định không ghi và không in câu hỏi/đáp án',t=>{const dir=repo();t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const src=path.join(dir,'input.json'),out=path.join(dir,'private','out.json');fs.writeFileSync(src,JSON.stringify(fixture()));const messages=[];main([src,'--output',out],s=>messages.push(s));assert.equal(fs.existsSync(out),false);assert.ok(!messages.join('').includes('Câu giả'));assert.match(messages.join(''),/SHA-256/);});

function bankExports(grade=8) {
 return Object.values(fixture(grade).officialExams).map(exam=>{
  const mc=exam.mcqQuestions||exam.part1_mcq, es=exam.essayQuestions||exam.part3_essay;
  const record={id:'fake-exam-'+exam.code,parent_exam_id:'fake-parent',exam_code:exam.code,grade,title:'Đề giả',total_points:10,status:'locked',approved_by:'fake-teacher',questions:[...mc.map(q=>({id:q.id,type:'MC',slot_number:q.num,question:q.question,options:q.options,correct:q.correctAnswer,points:q.points})),...(exam.part2_tf||[]).map(q=>({id:'fake-tf-'+q.num,type:'YN',slot_number:q.num,question:q.context,points:q.points,statements:q.subQuestions.map(s=>({label:s.letter,text:s.text,correct:s.correctAnswer}))})),...es.map(q=>({id:'fake-es-'+q.num,type:'ES',slot_number:q.num,question:q.question,points:q.points,rubric:q.rubric}))]};
  return signBank(record);
 });
}
function signBank(record) {
 const script="import json,sys,hashlib\nx=json.load(sys.stdin)\nadmin={'status','lifecycle','approved_hash','approved_by','approved_at','locked_at','published_at','usage','updated_at','created_at','verification','needs_verification','previous_exam_id','reuse_check','revision_check'}\nx.pop('approved_hash',None)\nh=hashlib.sha256(json.dumps({k:v for k,v in x.items() if k not in admin},sort_keys=True,ensure_ascii=False,separators=(',',':'),allow_nan=False).encode()).hexdigest()\nx['approved_hash']=h\nprint(json.dumps(x,ensure_ascii=False))";
 return execFileSync('python3',['-c',script],{input:typeof record==='string'?record:JSON.stringify(record),encoding:'utf8'}).trim();
}
test('adapter đọc đúng bốn JSON export giáo viên đã khóa, giữ id/slot/đáp án/barem',()=>{
 const {prepareBankExports}=require('../scripts/chuyen_goi_de_lms.cjs');
 for(const grade of [8,9,10]) {
  const raw=bankExports(grade),result=prepareBankExports(raw),ex=result.package.officialExams['101'];
  assert.equal(result.package.grade,grade);assert.equal((ex.mcqQuestions||ex.part1_mcq)[0].id,'fake-mc-0');
  assert.equal((ex.mcqQuestions||ex.part1_mcq)[0].correctAnswer,0);
  assert.equal((ex.essayQuestions||ex.part3_essay)[0].rubric[0].criterion,'Tiêu chí giả');
  assert.match((ex.essayQuestions||ex.part3_essay)[0].modelAnswer,/Tiêu chí giả/);
  assert.equal(result.package.sourceManifest.records.length,4);
 }
});
test('adapter từ chối draft, hash lệch, khác family, thiếu/trùng mã và SHORT',()=>{
 const {prepareBankExports}=require('../scripts/chuyen_goi_de_lms.cjs');
 for(const modify of [r=>r.status='drafting',r=>r.questions[0].question='Bị đổi sau duyệt',r=>r.parent_exam_id='parent-khac',r=>r.exam_code='102',r=>r.questions[0].type='SHORT']) {
  const files=bankExports();const record=JSON.parse(files[0]);modify(record);
  files[0]=record.status==='drafting'||record.questions[0].question==='Bị đổi sau duyệt'?JSON.stringify(record):signBank(record);
  assert.throws(()=>prepareBankExports(files));
 }
 assert.throws(()=>prepareBankExports(bankExports().slice(0,3)));
});
test('adapter đối chiếu hoán vị: đổi nội dung câu đã duyệt ở một mã vẫn bị chặn',()=>{
 const {prepareBankExports}=require('../scripts/chuyen_goi_de_lms.cjs');const files=bankExports();let r=JSON.parse(files[1]);
 r.questions[0].options.reverse();r.questions[0].correct=3;files[1]=signBank(r);assert.doesNotThrow(()=>prepareBankExports(files));
 r.questions[0].question='Nội dung khác nhưng được ký riêng';files[1]=signBank(r);assert.throws(()=>prepareBankExports(files),/hoán vị/);
});

test('adapter kiểm approved_hash Python với điểm 1.0 và bản public không giữ đáp án nguồn',()=>{
 const {prepareBankExports}=require('../scripts/chuyen_goi_de_lms.cjs');const P=require('../src/core/exam-package.js');
 const files=bankExports().map(raw=>signBank(JSON.stringify(JSON.parse(raw)).replace(/"points":1(?=[,}])/g,'"points":1.0')));
 const result=prepareBankExports(files);const publicExam=P.stripAnswers(result.package.officialExams['101']);
 assert.equal(JSON.stringify(publicExam).includes('correctAnswer'),false);assert.equal(JSON.stringify(publicExam).includes('rubric'),false);
});

test('CLI invalid native JSON never echoes private source text in diagnostics', t => {
  const dir = repo(); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'private-input.json'); fs.writeFileSync(file, 'HIDDEN_ANSWER_SENTINEL invalid JSON');
  const result = require('node:child_process').spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/chuyen_goi_de_lms.cjs'), file], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.equal((result.stdout + result.stderr).includes('HIDDEN_'), false);
});

test('native grade10 supports the existing implicit 1-point TF schema without changing data', () => {
  const input = fixture(10);
  for (const exam of Object.values(input.officialExams)) for (const q of exam.part2_tf) delete q.points;
  const result = preparePackage(input);
  assert.deepEqual(result.package, input);
  assert.equal(require('../src/core/exam-package.js').maxObjectivePoints(result.package.officialExams['101']), 7.75);
});
test('bank TF context reaches the exact field rendered by student and admin portals', () => {
  const result = require('../scripts/chuyen_goi_de_lms.cjs').prepareBankExports(bankExports(10));
  const question = result.package.officialExams['101'].part2_tf[0];
  assert.equal(question.context, 'Đúng sai giả');
  assert.equal(require('../src/core/exam-package.js').stripAnswers(result.package.officialExams['101']).part2_tf[0].context, 'Đúng sai giả');
});
test('native grade10 essay context and subitems are preserved as rendered in current LMS', () => {
  const input = JSON.parse(JSON.stringify(fixture(10)));
  for (const exam of Object.values(input.officialExams)) for (const q of exam.part3_essay) {
    q.context = q.question; delete q.question;
    q.subItems = [{ letter: 'a', text: 'Ý tự luận giả' }];
  }
  assert.deepEqual(preparePackage(input).package, input);
});
