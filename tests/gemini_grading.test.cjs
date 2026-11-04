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

  // 2. Kiểm tra Model mặc định & Tùy chỉnh (Tự động nâng cấp lên gemini-3.8-flash)
  assert.equal(getGeminiModel(), 'gemini-3.8-flash');
  setGeminiModel('gemini-pro-latest');
  assert.equal(getGeminiModel(), 'gemini-pro-latest');
  setGeminiModel('gemini-3.8-flash');
  assert.equal(getGeminiModel(), 'gemini-3.8-flash');

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

  // 6. Kiểm tra helper trích xuất câu hỏi tự luận theo bài nộp (getEssayQuestionsForSubmission)
  const { getEssayQuestionsForSubmission, gradeSubmissionWithGemini } = service;
  const mockExamData = {
    8: {
      officialExams: {
        '101': {
          essayQuestions: [
            { num: 1, points: 1.0, question: 'Câu 1 K8', modelAnswer: 'Barem 1' },
            { num: 2, points: 1.0, question: 'Câu 2 K8', modelAnswer: 'Barem 2' },
            { num: 3, points: 1.0, question: 'Câu 3 K8', modelAnswer: 'Barem 3' }
          ]
        }
      }
    },
    10: {
      officialExams: {
        '101': {
          part3_essay: [
            { num: 1, points: 1.0, context: 'Câu 1 K10', subItems: [{ letter: 'a', text: 'ý a' }], modelAnswer: 'Barem K10' }
          ]
        }
      }
    }
  };

  const subK8 = { grade: 8, examCode: '101', mode: 'exam' };
  const qsK8 = getEssayQuestionsForSubmission(subK8, mockExamData);
  assert.equal(qsK8.length, 3);
  assert.equal(qsK8[0].num, 1);

  const subK10 = { studentClass: '10/14', examCode: '101', mode: 'exam' };
  const qsK10 = getEssayQuestionsForSubmission(subK10, mockExamData);
  assert.equal(qsK10.length, 1);
  assert.equal(qsK10[0].context, 'Câu 1 K10');

  // 7. Kiểm tra hàm chấm toàn bài với tiến trình (gradeSubmissionWithGemini) khi học sinh bỏ trống
  const progressCalls = [];
  const blankSubResult = await gradeSubmissionWithGemini({
    submission: {
      answers: { essay: {} }
    },
    essayQuestions: qsK8,
    apiKey: 'AIzaFakeKey',
    onProgress: (current, total, q) => {
      progressCalls.push({ current, total, num: q.num });
    }
  });

  assert.equal(blankSubResult.success, true);
  assert.equal(blankSubResult.essayTotal, 0);
  assert.equal(blankSubResult.maxPossiblePoints, 3.0);
  assert.equal(blankSubResult.essayScores[1], 0);
  assert.equal(blankSubResult.essayScores[2], 0);
  assert.equal(blankSubResult.essayScores[3], 0);
  assert.equal(progressCalls.length, 3);
  assert.deepEqual(progressCalls[0], { current: 1, total: 3, num: 1 });
  assert.deepEqual(progressCalls[2], { current: 3, total: 3, num: 3 });

  // 8. Kiểm tra Danh mục Mô hình AI Studio & Chuỗi Fallback tự động
  const {
    AVAILABLE_GEMINI_MODELS,
    getFallbackChain,
    getGeminiAutoFallback,
    setGeminiAutoFallback
  } = service;

  // Xác nhận danh mục có các model hàng đầu theo chuẩn 2026 aistudio.google.com/docs/models
  const modelIds = AVAILABLE_GEMINI_MODELS.map(m => m.id);
  assert.ok(modelIds.includes('gemini-3.8-flash'), 'Phải hỗ trợ gemini-3.8-flash');
  assert.ok(modelIds.includes('gemini-flash-latest'), 'Phải hỗ trợ gemini-flash-latest');
  assert.ok(modelIds.includes('gemini-3.5-flash'), 'Phải hỗ trợ gemini-3.5-flash');
  assert.ok(modelIds.includes('gemini-3.1-flash-lite'), 'Phải hỗ trợ gemini-3.1-flash-lite');
  assert.ok(modelIds.includes('gemini-pro-latest'), 'Phải hỗ trợ gemini-pro-latest');

  // Kiểm tra chuỗi fallback bắt đầu bằng model đã chọn và không trùng lặp
  const chainFlash = getFallbackChain('gemini-3.5-flash');
  assert.equal(chainFlash[0], 'gemini-3.5-flash');
  assert.equal(new Set(chainFlash).size, chainFlash.length, 'Chuỗi fallback không được trùng lặp');
  assert.ok(chainFlash.includes('gemini-3.8-flash'));
  assert.ok(chainFlash.includes('gemini-flash-latest'));

  // 9. Kiểm tra cleanAndParseJSON bóc tách an toàn các dạng định dạng phản hồi
  const { cleanAndParseJSON } = service;
  assert.deepEqual(cleanAndParseJSON('{"score": 0.75, "feedback": "Đạt"}'), { score: 0.75, feedback: 'Đạt' });
  assert.deepEqual(
    cleanAndParseJSON('```json\n{"score": 1.0, "feedback": "Xuất sắc"}\n```'),
    { score: 1.0, feedback: 'Xuất sắc' }
  );
  assert.deepEqual(
    cleanAndParseJSON('Dưới đây là kết quả đánh giá:\n{"score": 0.5, "feedback": "Cần thêm ví dụ"}\nCảm ơn!'),
    { score: 0.5, feedback: 'Cần thêm ví dụ' }
  );

  // 10. Kiểm tra getEssayQuestionsForSubmission khi grade là string hoặc số
  const subStringGrade = { grade: '8', examCode: '101', mode: 'exam' };
  const qsStr = getEssayQuestionsForSubmission(subStringGrade, mockExamData);
  assert.equal(qsStr.length, 3, 'Khối dạng chuỗi "8" vẫn phải lấy được câu hỏi tự luận');

  const subGradeFromClass = { studentClass: '8/20', examCode: '101', mode: 'exam' };
  const qsClass = getEssayQuestionsForSubmission(subGradeFromClass, mockExamData);
  assert.equal(qsClass.length, 3, 'Khối suy ra từ studentClass vẫn phải lấy được câu hỏi');
});
