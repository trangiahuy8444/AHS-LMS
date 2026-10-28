#!/usr/bin/env node
/**
 * Chặn triển khai nếu bản build (dist/) lọt mã đề chính thức kèm đáp án.
 * Đề cương công khai dùng practiceQuestions / practiceTfQuestions; mã đề chính thức có
 * officialExams, mcqQuestions / part1_mcq / part2_tf dạng dữ liệu. Chạy sau `npm run build`.
 *   node scripts/kiem_tra_ban_build.cjs [thư_mục_build]
 */
const fs = require('fs');
const path = require('path');

const dir = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist'));
const SIGNS = [
  /["']?officialExams["']?\s*:\s*\{\s*["']?\d{3}["']?\s*:\s*\{\s*["']?(code|title|mcqQuestions|part1_mcq)["']?\s*:/,
  /["']?mcqQuestions["']?\s*:\s*\[\s*\{/,
  /["']?part1_mcq["']?\s*:\s*\[\s*\{/,
  /["']?part2_tf["']?\s*:\s*\[\s*\{/
];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

if (!fs.existsSync(dir)) {
  console.error(`Không thấy thư mục build: ${dir}`);
  process.exit(2);
}
const leaks = walk(dir)
  .filter(f => /\.(js|html|json|map)$/.test(f))
  .flatMap(f => SIGNS.filter(re => re.test(fs.readFileSync(f, 'utf8'))).map(re => `${path.relative(dir, f)}: ${re}`));
if (leaks.length) {
  console.error('❌ Bản build chứa dữ liệu giống mã đề chính thức:\n' + leaks.join('\n'));
  process.exit(1);
}
console.log('✅ Bản build không chứa mã đề chính thức.');
