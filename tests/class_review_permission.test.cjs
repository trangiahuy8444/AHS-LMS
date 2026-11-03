const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Giả lập window và localStorage trong môi trường Node
const storageFile = path.resolve(__dirname, '../src/core/storage-service.js');
const storageCode = fs.readFileSync(storageFile, 'utf8');

test('Phân quyền xem lại bài thi & chốt điểm theo từng lớp (Per-Class Review Control)', () => {
  const store = {};
  const mockLocalStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };

  const fakeWindow = {
    localStorage: mockLocalStorage,
    addEventListener: () => {}
  };

  const fn = new Function('window', 'localStorage', `${storageCode}; return window.AsianSchoolStorage;`);
  const storage = fn(fakeWindow, mockLocalStorage);

  assert.ok(storage, 'AsianSchoolStorage đã được khởi tạo');

  // 1. Mặc định toàn trường và các lớp đều KHÓA xem lại bài
  assert.equal(storage.isClassReviewAllowed('8/19'), false);
  assert.equal(storage.isClassReviewAllowed('8/20'), false);

  // 2. Mở chốt điểm riêng cho Lớp 8/19
  storage.setClassReviewMode('8/19', true);
  assert.equal(storage.isClassReviewAllowed('8/19'), true, 'Lớp 8/19 phải được mở xem bài');
  assert.equal(storage.isClassReviewAllowed('8/20'), false, 'Lớp 8/20 vẫn phải bị khóa');

  // 3. Khóa lại Lớp 8/19
  storage.setClassReviewMode('8/19', false);
  assert.equal(storage.isClassReviewAllowed('8/19'), false, 'Lớp 8/19 phải bị khóa lại');

  // 4. Mở hàng loạt cho toàn Khối 8
  const grade8Classes = ['8/19', '8/20', '8/21', '8/22', '8/23'];
  storage.setGradeReviewMode(8, true, grade8Classes);
  grade8Classes.forEach(cls => {
    assert.equal(storage.isClassReviewAllowed(cls), true, `Lớp ${cls} phải được mở`);
  });
  assert.equal(storage.isClassReviewAllowed('9/20'), false, 'Lớp 9/20 không thuộc Khối 8 phải bị khóa');

  // 5. Khóa lại Khối 8
  storage.setGradeReviewMode(8, false, grade8Classes);
  grade8Classes.forEach(cls => {
    assert.equal(storage.isClassReviewAllowed(cls), false, `Lớp ${cls} phải bị khóa`);
  });

  // 6. Mở chốt điểm toàn trường (master switch)
  storage.setAllClassesReviewMode(true, [...grade8Classes, '9/20', '10/14']);
  assert.equal(storage.isClassReviewAllowed('8/19'), true);
  assert.equal(storage.isClassReviewAllowed('9/20'), true);
  assert.equal(storage.isClassReviewAllowed('10/14'), true);
});
