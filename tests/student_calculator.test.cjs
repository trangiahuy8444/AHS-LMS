const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

test('Kiểm tra Máy tính Cầm tay (Calculator) tích hợp cho bài thi Tin học 10', async () => {
  const calcModule = await import(path.resolve(__dirname, '../src/student/actions/calculator.js'));
  const { safeEvaluateExpression } = calcModule;

  // 1. Phép tính số học cơ bản
  assert.equal(safeEvaluateExpression('1 + 1'), 2);
  assert.equal(safeEvaluateExpression('100 - 35'), 65);
  assert.equal(safeEvaluateExpression('12 * 8'), 96);
  assert.equal(safeEvaluateExpression('1024 / 8'), 128);

  // 2. Ký hiệu phép nhân / chia tiếng Việt (×, ÷)
  assert.equal(safeEvaluateExpression('1920 × 1080'), 2073600);
  assert.equal(safeEvaluateExpression('2073600 ÷ 1024'), 2025);

  // 3. Phép tính dung lượng hình ảnh / video Tin học 10 chuẩn
  // Bài toán: Tính dung lượng ảnh 1920x1080, 24-bit màu theo đơn vị KB:
  // (1920 * 1080 * 24) / 8 / 1024 = 6075 KB
  const imageKb = safeEvaluateExpression('1920 * 1080 * 24 / 8 / 1024');
  assert.equal(imageKb, 6075);

  // 4. Lũy thừa 2 đặc trưng môn Tin học (2^10 = 1024, 2^20 = 1048576, 2^30 = 1073741824)
  assert.equal(safeEvaluateExpression('2^10'), 1024);
  assert.equal(safeEvaluateExpression('2^20'), 1048576);
  assert.equal(safeEvaluateExpression('2^8'), 256);
  assert.equal(safeEvaluateExpression('2^16'), 65536);

  // 5. Biểu thức có dấu ngoặc
  assert.equal(safeEvaluateExpression('(1024 + 512) * 8'), 12288);
  assert.equal(safeEvaluateExpression('((100 + 20) * 2) / 4'), 60);

  // 6. Số thập phân và số âm
  assert.equal(safeEvaluateExpression('1.5 * 1024'), 1536);
  assert.equal(safeEvaluateExpression('-5 + 10'), 5);

  // 7. Xử lý lỗi an toàn: chia cho 0
  assert.throws(() => {
    safeEvaluateExpression('100 / 0');
  }, /chia cho 0/);

  // 8. Chặn ký tự độc hại (chống injection, không dùng eval)
  assert.throws(() => {
    safeEvaluateExpression('alert(1)');
  }, /Ký tự không hợp lệ/);
});
