// Mọi tên component lấy từ useStudent()/useAdmin() phải được controller cung cấp.
// Thiếu tên thì nút bấm gọi undefined và không làm gì (lỗi "mở khóa bài làm" 29/10/2026); ESLint không bắt được.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '../src');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const idents = (body) => body.split(',').map(x => x.trim().split(/[\s:=]/)[0]).filter(x => /^[A-Za-z_$][\w$]*$/.test(x));

function provided(page) {
  const names = new Set();
  const files = walk(path.join(SRC, page)).filter(f => /[\\/](hooks|actions)[\\/][^\\/]+\.js$/.test(f));
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    // const s = { ... }  và mọi  return { a, b, ... }  (một hoặc nhiều dòng)
    for (const m of s.matchAll(/(?:const s =|return) \{([^{}]*)\};?/g)) idents(m[1]).forEach(n => names.add(n));
  }
  return names;
}

function consumed(page, hook) {
  const out = [];
  for (const f of walk(path.join(SRC, page)).filter(f => f.endsWith('.jsx'))) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(new RegExp(`const \\{([^}]*)\\} = ${hook}\\(\\);`, 'g'))) {
      idents(m[1]).forEach(n => out.push({ name: n, file: path.relative(SRC, f) }));
    }
  }
  return out;
}

for (const [page, hook] of [['student', 'useStudent'], ['admin', 'useAdmin']]) {
  test(`Cổng ${page}: mọi tên lấy từ ${hook}() đều có trong controller`, () => {
    const have = provided(page);
    const used = consumed(page, hook);
    assert.ok(used.length > 20, 'Phải đọc được danh sách tên component đang dùng');
    const missing = used.filter(u => !have.has(u.name)).map(u => `${u.name} (${u.file})`);
    assert.deepStrictEqual(missing, [], 'Thiếu trong controller: ' + missing.join(', '));
  });
}
