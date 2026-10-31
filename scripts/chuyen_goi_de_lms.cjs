#!/usr/bin/env node
// Kiểm tra/đóng gói native LMS; không đọc đề thật và không tự xáo trộn mã đề.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const P = require('../src/core/exam-package.js');
const CODES = ['101', '102', '103', '104'];
function fail(message) { throw new Error(message); }
function plain(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function canonical(value) {
  if (typeof value === 'number' && !Number.isFinite(value)) fail('Điểm/số không hữu hạn.');
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (plain(value)) return '{' + Object.keys(value).sort().map(k => JSON.stringify(k)+':'+canonical(value[k])).join(',') + '}';
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') fail('Dữ liệu không thuộc JSON.');
  return JSON.stringify(value);
}
function points(q, defaultValue) { const value = q.points === undefined ? defaultValue : q.points; if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) fail('Điểm từng câu phải là số hữu hạn lớn hơn 0.'); return value; }
function text(v) { return typeof v === 'string' && v.trim().length > 0; }
function list(exam, a, b) {
  if (exam[a] !== undefined && exam[b] !== undefined) fail(`Không chấp nhận đồng thời ${a} và ${b}.`);
  const value = exam[a] === undefined ? exam[b] : exam[a];
  if (!Array.isArray(value)) fail(`Thiếu danh sách ${a}/${b}.`);
  return value;
}
function validateList(items, { defaultPoints, stemFields = ['question'] } = {}) {
 const nums = new Set();
 for (const q of items) {
  if (!plain(q) || !Number.isInteger(q.num) || q.num <= 0 || nums.has(q.num)) fail('Số câu thiếu, trùng hoặc không hợp lệ.');
  nums.add(q.num); points(q, defaultPoints);
  if (!stemFields.some(field => text(q[field]))) fail('Thiếu nội dung câu hỏi.');
 }
}
function preparePackage(input, { expectedHash } = {}) {
  if (!plain(input) || !plain(input.officialExams)) fail('Chỉ hỗ trợ gói native {grade, officialExams}; chưa có adapter ngân hàng đề thô.');
  if (![8,9,10].includes(input.grade)) fail('Khối phải là 8, 9 hoặc 10.');
  if (Object.keys(input.officialExams).sort().join(',') !== CODES.join(',')) fail('Gói phải có đúng mã 101–104.');
  // Validate before JSON cloning so NaN/Infinity cannot silently become null.
  const normalized = canonical(input);
  for (const code of CODES) {
    const exam = input.officialExams[code];
    if (!plain(exam) || exam.code !== code) fail('code không khớp khóa mã đề.');
    const mcq = list(exam,'mcqQuestions','part1_mcq');
    const essay = list(exam,'essayQuestions','part3_essay');
    const tf = exam.part2_tf === undefined ? [] : exam.part2_tf;
    if (!Array.isArray(tf)) fail('Danh sách Đúng/Sai không hợp lệ.');
    if (mcq.length !== (input.grade === 10 ? 19 : 28) || (input.grade === 10 ? (tf.length !== 3 || ![2,3].includes(essay.length)) : (tf.length !== 0 || essay.length !== 3))) fail('Số câu không khớp cấu trúc chính thức của khối.');
    validateList(mcq); validateList(tf, { defaultPoints: 1, stemFields: ['context'] }); validateList(essay, { stemFields: ['context', 'question'] });
    for (const q of mcq) if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(o=>!text(o)) || new Set(q.options).size !== 4 || !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) fail('Phương án/đáp án trắc nghiệm không hợp lệ.');
    for (const q of tf) {
      const subs=q.subQuestions;
      if (!Array.isArray(subs) || subs.length!==4 || subs.map(s=>s.letter).sort().join('')!=='abcd' || subs.some(s=>!text(s.text)||typeof s.correctAnswer!=='boolean')) fail('Câu Đúng/Sai phải có đủ ý a–d và đáp án boolean.');
    }
    for (const q of essay) {
      if (!text(q.modelAnswer) && !(text(q.rubric) || (Array.isArray(q.rubric) && q.rubric.length))) fail('Thiếu barem tự luận.');
      if (Array.isArray(q.rubric)) {
        if (q.rubric.some(r=>!plain(r)||!text(r.criterion || r.step)||typeof r.points!=='number'||r.points<=0)) fail('Tiêu chí barem không hợp lệ.');
        if (Math.abs(q.rubric.reduce((s,r)=>s+r.points,0)-q.points)>0.000001) fail('Tổng barem khác điểm tự luận.');
      }
    }
    const total=[...mcq,...essay].reduce((s,q)=>s+points(q),0)+tf.reduce((s,q)=>s+points(q,1),0);
    if (exam.totalPoints !== 10 || Math.abs(total-10)>0.000001) fail('Tổng điểm chính thức phải bằng 10.');
    const errors=P.validateExam(exam);
    if (errors.length) fail(`Mã ${code}: cấu trúc hoặc đáp án không hợp lệ (${errors.length} lỗi).`);
  }
  const sha256=crypto.createHash('sha256').update(normalized).digest('hex');
  if (expectedHash !== undefined && expectedHash !== sha256) fail('Checksum không khớp gói đã đối chiếu.');
  return { package: JSON.parse(normalized), sha256 };
}
// Mirror domain/exam_lifecycle.py: raw JSON is hashed by Python to retain 1.0 vs 1.
const BANK_VERIFY = `import json,sys,hashlib
ADMIN={'status','lifecycle','approved_hash','approved_by','approved_at','locked_at','published_at','usage','updated_at','created_at','verification','needs_verification','previous_exam_id','reuse_check','revision_check'}
def pairs(items):
 d={}
 for k,v in items:
  if k in d: raise ValueError('Duplicate JSON key')
  d[k]=v
 return d
x=json.loads(sys.stdin.read(),object_pairs_hook=pairs,parse_constant=lambda v: (_ for _ in ()).throw(ValueError('Non-finite number')))
if not isinstance(x,dict) or x.get('status') not in ('locked','published'): raise ValueError('Export must be locked/published')
raw=json.dumps({k:v for k,v in x.items() if k not in ADMIN},sort_keys=True,ensure_ascii=False,separators=(',',':'),allow_nan=False)
h=hashlib.sha256(raw.encode()).hexdigest()
if x.get('approved_hash')!=h: raise ValueError('Approved hash mismatch')
print(json.dumps(x,ensure_ascii=False,allow_nan=False))`;
function prepareBankExports(rawFiles, options={}) {
  if (!Array.isArray(rawFiles) || rawFiles.length!==4 || rawFiles.some(r=>typeof r!=='string')) fail('Cần đúng bốn file JSON export giáo viên từ ngân hàng.');
  const records=rawFiles.map(raw=>{
    let checked;
    try {checked=execFileSync(options.python || 'python3',['-c',BANK_VERIFY],{input:raw,encoding:'utf8',maxBuffer:16*1024*1024,stdio:['pipe','pipe','pipe']});}
    catch {fail('Không xác minh được export ngân hàng: cần Python3, trạng thái locked/published và approved_hash khớp nội dung.');}
    return JSON.parse(checked);
  });
  const grade=records[0].grade, family=records[0].parent_exam_id;
  if (![8,9,10].includes(grade) || typeof family!=='string' || !family) fail('Thiếu khối hoặc parent_exam_id của bốn mã đã duyệt.');
  const codes=records.map(r=>r.exam_code).sort();
  if(codes.join(',')!==CODES.join(','))fail('Export ngân hàng phải đủ đúng mã 101–104, không trùng.');
  const input={grade,officialExams:{},sourceManifest:{format:'bank-teacher-json-v1',parentExamId:family,records:[]}};
  let baseFingerprint;
  for (const r of records) {
    if(r.grade!==grade||r.parent_exam_id!==family||r.total_points!==10||!Array.isArray(r.questions)||!text(r.id))fail('Bốn export phải cùng khối, cùng parent_exam_id và thang 10.');
    const mcq=[],tf=[],essay=[],ids=new Set(),fingerprints=[];
    for(const q of r.questions) {
      if(!plain(q)||!text(q.id)||ids.has(q.id)||!['MC','YN','ES'].includes(q.type))fail('Câu nguồn thiếu/trùng id hoặc dạng chưa hỗ trợ (SHORT không được chuyển).');
      ids.add(q.id);
      // LMS has no grouped-stimulus/media renderer: never silently omit that content.
      if(['stimulus_id','group_id','passage_id','context_id','image','media','attachment'].some(k=>q[k]))fail('Câu có ngữ cảnh/đa phương tiện cần adapter hiển thị riêng.');
      const out={id:q.id,num:q.slot_number,question:q.question,points:q.points};
      const semantic={id:q.id,type:q.type,question:q.question,points:q.points};
      if(q.explanation!==undefined)semantic.explanation=q.explanation;
      if(q.explanation!==undefined||q.option_explanations!==undefined)out.explanation={...(q.explanation!==undefined?{general:q.explanation}:{}),...(q.option_explanations!==undefined?{options:q.option_explanations}:{})};
      if(q.type==='MC') {
        out.options=q.options;out.correctAnswer=q.correct;out.answerLetter=String.fromCharCode(65+q.correct);mcq.push(out);
        semantic.options=Array.isArray(q.options)?[...q.options].sort():q.options;semantic.correctOption=q.options&&q.options[q.correct];
        if(q.option_explanations!==undefined)semantic.optionExplanations=Array.isArray(q.option_explanations)&&Array.isArray(q.options)?q.options.map((option,index)=>({option,explanation:q.option_explanations[index]})).sort((a,b)=>a.option.localeCompare(b.option)):q.option_explanations;
      } else if(q.type==='YN') {
        if(!Array.isArray(q.statements))fail('Thiếu nhận định Đúng/Sai.');
        delete out.question;out.context=q.question;
        out.subQuestions=q.statements.map(st=>({letter:st.label,text:st.text,correctAnswer:st.correct}));tf.push(out);
        semantic.statements=q.statements.map(st=>({text:st.text,correct:st.correct})).sort((a,b)=>canonical(a).localeCompare(canonical(b)));
      } else {
        if(!Array.isArray(q.rubric)||!q.rubric.length)fail('Thiếu barem tự luận nguồn.');
        out.rubric=q.rubric;out.modelAnswer=q.rubric.map(row=>`${row.criterion || row.step} (${row.points} điểm)`).join('\n');essay.push(out);semantic.rubric=q.rubric;
      }
      fingerprints.push(semantic);
    }
    const fingerprint=canonical(fingerprints.sort((a,b)=>a.id.localeCompare(b.id)));
    if(baseFingerprint!==undefined&&fingerprint!==baseFingerprint)fail('Các mã đề không giữ cùng nội dung/barem sau hoán vị.');
    baseFingerprint=fingerprint;
    const exam={code:r.exam_code,title:r.title,totalPoints:r.total_points,...(grade===10?{part1_mcq:mcq,part2_tf:tf,part3_essay:essay}:{mcqQuestions:mcq,essayQuestions:essay})};
    if(grade!==10&&tf.length)fail('Cấu trúc khối 8/9 chưa hỗ trợ phần Đúng/Sai.');
    input.officialExams[r.exam_code]=exam;
    input.sourceManifest.records.push({id:r.id,code:r.exam_code,approvedHash:r.approved_hash});
  }
  input.sourceManifest.records.sort((a,b)=>a.code.localeCompare(b.code));
  return preparePackage(input,options);
}
function writePrivatePackage(result, output, { repoRoot = path.resolve(__dirname,'..'), expectedHash } = {}) {
  if (!expectedHash || expectedHash !== result.sha256 || preparePackage(result.package).sha256 !== expectedHash) fail('Cần checksum đã đối chiếu trước khi ghi.');
  const root=path.resolve(repoRoot), privateRoot=path.join(root,'private'), target=path.resolve(output);
  if (!target.startsWith(privateRoot+path.sep) || path.extname(target)!=='.json') fail('Chỉ ghi tệp .json trong private/ của repository.');
  let cursor=root;
  for (const segment of path.relative(root,target).split(path.sep)) {
    cursor=path.join(cursor,segment);
    let stat; try { stat=fs.lstatSync(cursor); } catch(e) { if(e.code!=='ENOENT')throw e; }
    if (stat && stat.isSymbolicLink()) fail('Không cho phép symlink trên đường dẫn đầu ra.');
  }
  const relative=path.relative(root,target);
  try { execFileSync('git',['check-ignore','--no-index','--quiet','--',relative],{cwd:root,stdio:'ignore'}); } catch { fail('private/ phải được gitignore trước khi ghi.'); }
  if (fs.existsSync(target)) fail('Tệp đầu ra đã tồn tại; không tự ghi đè.');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,JSON.stringify(result.package,null,2)+'\n',{flag:'wx',mode:0o600});
}
function main(args, log=console.log) {
  let input,output,expectedHash,apply=false;const bankFiles=[];
  for (let i=0;i<args.length;i++) {
    const flag=args[i];
    if(flag==='--apply')apply=true;
    else if(['--output','--expected-sha256','--bank-input'].includes(flag)) {
      const value=args[++i];if(!value||value.startsWith('--'))fail('Thiếu giá trị tham số.');
      if(flag==='--output')output=value;else if(flag==='--expected-sha256')expectedHash=value;else bankFiles.push(value);
    } else if(!flag.startsWith('--')&&!input)input=flag;
    else fail('Tham số không được hỗ trợ.');
  }
  if((!input&&!bankFiles.length)||(input&&bankFiles.length))fail('Dùng INPUT native hoặc --bank-input FILE lặp bốn lần, không dùng đồng thời.');
  let nativeInput;
  if (input) {
    const raw = fs.readFileSync(input, 'utf8');
    try { nativeInput = JSON.parse(raw); }
    catch { fail('JSON native không hợp lệ; không in nội dung nguồn để bảo vệ đề.'); }
  }
  const result=bankFiles.length?prepareBankExports(bankFiles.map(f=>fs.readFileSync(f,'utf8')),{expectedHash}):preparePackage(nativeInput,{expectedHash});
  if (apply) {if(!output)fail('Cần --output để ghi.');writePrivatePackage(result,output,{expectedHash});}
  log(`${apply?'Đã ghi gói riêng tư':'Dry-run: không ghi tệp'}. Khối ${result.package.grade}; mã 101–104. SHA-256 chuẩn hóa: ${result.sha256}`);
  return result;
}
if(require.main===module) {try{main(process.argv.slice(2));}catch(e){console.error('Không tạo gói: '+e.message);process.exitCode=1;}}
module.exports={preparePackage,prepareBankExports,writePrivatePackage,canonical,main};
