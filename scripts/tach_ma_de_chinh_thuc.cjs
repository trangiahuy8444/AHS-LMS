#!/usr/bin/env node
/**
 * Tách mã đề chính thức (kèm đáp án) ra khỏi data/questions_grade{8,9,10}.js
 *  - Ghi private/ma_de_chinh_thuc_khoi_{N}.json  ({ grade, officialExams }) để tải lên exam_bank qua Cổng Quản Trị
 *  - Viết lại data/questions_grade{N}.js chỉ còn đề cương ôn tập (công khai)
 * Mặc định chạy thử. Thêm --apply để ghi tệp.
 *   node scripts/tach_ma_de_chinh_thuc.cjs [--apply]
 */
const fs = require('fs');
const path = require('path');
const { validateExam } = require('../src/core/exam-package.js');

const ROOT = path.join(__dirname, '..');
const apply = process.argv.includes('--apply');
const privateDir = path.join(ROOT, 'private');

for (const grade of [8, 9, 10]) {
  const file = path.join(ROOT, 'data', `questions_grade${grade}.js`);
  const source = fs.readFileSync(file, 'utf8');
  delete require.cache[require.resolve(file)];
  const data = require(file);
  const exams = data.officialExams || {};
  const codes = Object.keys(exams);
  if (!codes.length) {
    console.log(`Khối ${grade}: không còn mã đề chính thức trong data/, bỏ qua.`);
    continue;
  }
  codes.forEach(code => {
    const errors = validateExam(exams[code]);
    if (errors.length) throw new Error(`Khối ${grade} mã ${code}: ${errors.join('; ')}`);
  });

  const marker = '  return {';
  const head = source.slice(0, source.indexOf(marker));
  if (!head) throw new Error(`Không nhận ra cấu trúc UMD của ${file}`);
  const { officialExams, ...publicData } = data;
  const body = JSON.stringify(publicData, null, 2).replace(/^\{/, '');
  const rewritten = `${head}  return {${body};\n}));\n`;
  const outFile = path.join(privateDir, `ma_de_chinh_thuc_khoi_${grade}.json`);

  console.log(`Khối ${grade}: ${codes.length} mã đề (${codes.join(', ')}) -> ${path.relative(ROOT, outFile)}`);
  if (apply) {
    fs.mkdirSync(privateDir, { recursive: true });
    if (fs.existsSync(outFile)) throw new Error(`${outFile} đã tồn tại, không ghi đè.`);
    fs.writeFileSync(outFile, JSON.stringify({ grade, officialExams }, null, 2) + '\n');
    fs.writeFileSync(file, rewritten);
  }
}
if (!apply) console.log('\nChạy thử, chưa ghi tệp nào. Thêm --apply để thực hiện.');
