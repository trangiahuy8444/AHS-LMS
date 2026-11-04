const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Mock localStorage if in node environment
if (typeof global.localStorage === 'undefined') {
  let store = {};
  global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
}

test('Gemini Grading Service: Quản lý API Key, Model & Prompt Sư phạm 100% Barem', async () => {
  const service = await import(path.resolve(__dirname, '../src/core/gemini-grading-service.js'));
  const {
    getGeminiApiKey,
    setGeminiApiKey,
    getGeminiModel,
    setGeminiModel,
    buildGradingPrompt,
    gradeSingleEssayWithGemini
  } = service;

  // 1. Kiểm tra Lưu & Đọc API Key trong localStorage
  setGeminiApiKey('AIzaSyFakeKeyTest123');
  assert.equal(getGeminiApiKey(), 'AIzaSyFakeKeyTest123');
  setGeminiApiKey('');
  assert.equal(getGeminiApiKey(), '');

  // 2. Kiểm tra Model mặc định & Tùy chỉnh
  assert.equal(getGeminiModel(), 'gemini-2.5-flash');
  setGeminiModel('gemini-2.5-pro');
  assert.equal(getGeminiModel(), 'gemini-2.5-pro');
  setGeminiModel('gemini-2.5-flash');

  // 3. Kiểm tra Cấu trúc Prompt xây dựng bám sát 100% Barem
  const prompt = buildGradingPrompt({
    questionText: 'Tính dung lượng thẻ nhớ 16 GB sang MB.',
    subItems: [
      { letter: 'a', text: 'Chuyển 16 GB sang MB' },
      { letter: 'b', text: 'Tính số ảnh lưu được' }
    ],
    studentAnswer: 'Em tính ra 16.384 MB ạ.',
    modelAnswer: 'a) 16 * 1024 = 16.384 MB (0.25đ)\nb) 16.384 / 8 = 2048 ảnh (0.25đ)',
    maxPoints: 0.75
  });

  assert.ok(prompt.includes('Bạn là Giám khảo Khảo thí'));
  assert.ok(prompt.includes('DỰA 100% VÀO BAREM ĐÁP ÁN'));
  assert.ok(prompt.includes('16.384 MB'));
  assert.ok(prompt.includes('0.75 điểm'));
  assert.ok(prompt.includes('responseMimeType') || prompt.includes('định dạng JSON'));

  // 4. Xử lý tức thì khi học sinh bỏ trống: cho 0 điểm mà không tốn lượt gọi API
  const blankResult = await gradeSingleEssayWithGemini({
    question: 'Nêu ưu điểm của lưu trữ đám mây',
    studentAnswer: '   ',
    modelAnswer: 'Nêu đúng 2 ưu điểm (0.5đ)',
    maxPoints: 1.0
  });

  assert.equal(blankResult.success, true);
  assert.equal(blankResult.score, 0);
  assert.equal(blankResult.maxScore, 1.0);
  assert.match(blankResult.feedback, /bỏ trống/);
  assert.equal(blankResult.breakdown[0].points, 0);

  // 5. Kiểm tra từ chối khi chưa cấu hình API Key
  const noKeyResult = await gradeSingleEssayWithGemini({
    question: 'Câu hỏi test',
    studentAnswer: 'Nội dung học sinh làm',
    modelAnswer: 'Barem đáp án',
    maxPoints: 1.0,
    apiKey: ''
  });

  assert.equal(noKeyResult.success, false);
  assert.match(noKeyResult.error, /Chưa cấu hình Gemini API Key/);
});
