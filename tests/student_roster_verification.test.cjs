const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

test('Xác thực 2 lớp danh tính học sinh từ Roster chuẩn Asian School (Chống giả mạo / thi hộ)', async () => {
  const rosterModule = await import(path.resolve(__dirname, '../src/core/roster-data.js'));
  const { getStudentsByClass, verifyStudentLms, findStudentInClassByLms, findStudentEverywhereByLms, searchStudentsByLms, ROSTER_BY_CLASS } = rosterModule;

  // 1. Kiểm tra có đủ 15 lớp của cả 3 khối
  const expectedClasses = [
    '8/19', '8/20', '8/21', '8/22', '8/23',
    '9/20', '9/21', '9/22', '9/23', '9/24', '9/25', '9/26',
    '10/14', '10/15', '10/16'
  ];
  assert.equal(Object.keys(ROSTER_BY_CLASS).length, 15);
  expectedClasses.forEach(cls => {
    assert.ok(ROSTER_BY_CLASS[cls], `Lớp ${cls} phải có trong danh sách số hóa`);
    assert.ok(ROSTER_BY_CLASS[cls].length > 0, `Lớp ${cls} phải có học sinh`);
  });

  // 2. Thử nghiệm Lớp 8/19: Học sinh đầu tiên "Trần Thái Bình"
  const s819 = getStudentsByClass('8/19');
  assert.ok(s819.length >= 20);
  const hs1 = s819[0];
  assert.equal(hs1.fullName, 'Trần Thái Bình');
  assert.equal(hs1.studentId, '01190002');
  assert.equal(hs1.loginId, '01-19-0002');
  assert.equal(hs1.canvasUserId, '24999');

  // a. Khớp mã số thuần (đủ toàn bộ mã)
  assert.equal(verifyStudentLms(hs1, '01190002'), true);
  // b. Khớp mã có dấu gạch ngang (đủ toàn bộ mã)
  assert.equal(verifyStudentLms(hs1, '01-19-0002'), true);
  // c. Khớp mã bỏ số 0 ở đầu do thẻ học sinh hoặc Excel cắt
  assert.equal(verifyStudentLms(hs1, '1190002'), true);
  assert.equal(verifyStudentLms(hs1, '1-19-0002'), true);
  // d. Khớp 4 số cuối thẻ học sinh (0002) hoặc số thứ tự rút gọn (2)
  assert.equal(verifyStudentLms(hs1, '0002'), true);
  assert.equal(verifyStudentLms(hs1, '2'), true);
  // e. Khớp mã Canvas User ID (24999)
  assert.equal(verifyStudentLms(hs1, '24999'), true);
  // f. Từ chối mã sai hoặc của bạn khác (bảo vệ chống thi hộ)
  assert.equal(verifyStudentLms(hs1, '15240009'), false, 'Mã của bạn khác phải bị từ chối');
  assert.equal(verifyStudentLms(hs1, '0009'), false, 'Mã số đuôi của bạn khác phải bị từ chối');
  assert.equal(verifyStudentLms(hs1, '99999999'), false, 'Mã không tồn tại phải bị từ chối');
  assert.equal(verifyStudentLms(hs1, '1234'), false, 'Mã sai phải bị từ chối');

  // 3. Thử nghiệm Auto-Fill & Tìm kiếm toàn diện
  const found = findStudentInClassByLms('8/19', '01190002');
  assert.ok(found);
  assert.equal(found.fullName, 'Trần Thái Bình');

  const foundWithHyphen = findStudentInClassByLms('8/19', '01-19-0002');
  assert.ok(foundWithHyphen);
  assert.equal(foundWithHyphen.fullName, 'Trần Thái Bình');

  // Tìm kiếm xuyên lớp (toàn trường) khi học sinh chưa chọn đúng lớp
  const crossClassFound = findStudentEverywhereByLms('15-24-0009', '8/19');
  assert.ok(crossClassFound);
  assert.equal(crossClassFound.fullName, 'Phạm Lê Nguyệt Cát');

  // Tìm kiếm theo tên hoặc mã LMS qua searchStudentsByLms
  const searchResults = searchStudentsByLms('Thái Bình');
  assert.ok(searchResults.length >= 1);
  assert.equal(searchResults[0].fullName, 'Trần Thái Bình');
  assert.equal(searchResults[0].studentClass, '8/19');

  // 4. Thử nghiệm Khối 10: Lớp 10/14 và học sinh dùng email
  const s1014 = getStudentsByClass('10/14');
  assert.ok(s1014.length > 0);
  const hs10 = s1014[0];
  assert.ok(hs10.fullName);
  assert.ok(hs10.studentId);
  assert.equal(verifyStudentLms(hs10, hs10.studentId), true);

  // Học sinh dùng email đăng nhập (Lục Gia Hân lớp 10/16)
  const s1016 = getStudentsByClass('10/16');
  const lucGiaHan = s1016.find(s => s.fullName === 'Lục Gia Hân');
  assert.ok(lucGiaHan);
  assert.equal(verifyStudentLms(lucGiaHan, 'giahan_mary@gmail.com'), true);
  assert.equal(verifyStudentLms(lucGiaHan, '20992'), true);
});
