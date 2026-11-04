/**
 * DỊCH VỤ TRỢ LÝ CHẤM ĐIỂM TỰ LUẬN BẰNG GEMINI API
 * Tuân thủ 100% barem đề thi chuẩn Asian School.
 * Giáo viên luôn là người toàn quyền kiểm tra, điều chỉnh và duyệt thủ công.
 */

const STORAGE_KEY_API_KEY = 'ahs_gemini_api_key';
const STORAGE_KEY_MODEL = 'ahs_gemini_model';
const STORAGE_KEY_AUTO_FALLBACK = 'ahs_gemini_auto_fallback';
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * DANH SÁCH MÔ HÌNH GEMINI PHÙ HỢP CHO KHẢO THÍ & CHẤM TỰ LUẬN
 * Tham khảo tài liệu chính thức: https://aistudio.google.com/docs/models?hl=vi
 */
export const AVAILABLE_GEMINI_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Khuyên Dùng ⭐',
    desc: 'Tốc độ nhanh nhất, tư duy phân tích sắc bén, chi phí tối ưu, bám barem 100%. Phù hợp nhất để chấm bài nhanh.',
    category: 'flash',
    speed: 'Siêu nhanh (< 1s)',
    limits: '15 RPM / 1M TPM (Free tier)'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    badge: 'Tốc Độ Cao ⚡',
    desc: 'Mô hình thế hệ 2 siêu tốc độ, độ trễ cực thấp và ổn định cao.',
    category: 'flash',
    speed: 'Siêu nhanh (< 1s)',
    limits: '15 RPM / 1M TPM'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'Chuẩn Mực & Bền Bỉ 🛡️',
    desc: 'Mô hình tiêu chuẩn ổn định cao, quota dồi dào, xử lý văn bản tin cậy.',
    category: 'flash',
    speed: 'Nhanh (1 - 2s)',
    limits: '15 RPM / 1M TPM'
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash-8B',
    badge: 'Siêu Nhẹ (High Throughput) 🚀',
    desc: 'Mô hình tối giản, cực kỳ nhẹ, tối ưu cho xử lý khối lượng lớn bài thi.',
    category: 'flash',
    speed: 'Tức thì (< 0.8s)',
    limits: '15 RPM / 1M TPM'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    badge: 'Chuyên Sâu (Complex Reasoning) 🧠',
    desc: 'Mô hình suy luận cao cấp nhất, phân tích chi tiết các bài tự luận phức tạp nhiều bước.',
    category: 'pro',
    speed: 'Trung bình (2 - 4s)',
    limits: '5 RPM / 250k TPM'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    badge: 'Độ Chính Xác Cao 🎯',
    desc: 'Mô hình chuyên sâu thế hệ 1.5, lý luận sư phạm tỉ mỉ và đối chiếu tiêu chuẩn.',
    category: 'pro',
    speed: 'Trung bình (2 - 4s)',
    limits: '5 RPM / 250k TPM'
  }
];

/**
 * Xây dựng chuỗi mô hình dự phòng (Fallback Chain)
 * Khi mô hình chính bị lỗi (hết quota, 429, 503...), hệ thống tự động thử các mô hình tiếp theo
 */
export function getFallbackChain(primaryModel = DEFAULT_GEMINI_MODEL) {
  const defaultChain = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.5-pro'
  ];
  const list = [primaryModel, ...defaultChain.filter(m => m !== primaryModel)];
  return Array.from(new Set(list));
}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

export function getGeminiApiKey() {
  const s = getStorage();
  return s ? (s.getItem(STORAGE_KEY_API_KEY) || '') : '';
}

export function setGeminiApiKey(key) {
  const s = getStorage();
  if (!s) return;
  const clean = String(key || '').trim();
  if (clean) {
    s.setItem(STORAGE_KEY_API_KEY, clean);
  } else {
    s.removeItem(STORAGE_KEY_API_KEY);
  }
}

export function getGeminiModel() {
  const s = getStorage();
  return s ? (s.getItem(STORAGE_KEY_MODEL) || DEFAULT_GEMINI_MODEL) : DEFAULT_GEMINI_MODEL;
}

export function setGeminiModel(model) {
  const s = getStorage();
  if (!s) return;
  s.setItem(STORAGE_KEY_MODEL, model || DEFAULT_GEMINI_MODEL);
}

export function getGeminiAutoFallback() {
  const s = getStorage();
  if (!s) return true;
  const val = s.getItem(STORAGE_KEY_AUTO_FALLBACK);
  return val === null ? true : val === 'true';
}

export function setGeminiAutoFallback(enabled) {
  const s = getStorage();
  if (!s) return;
  s.setItem(STORAGE_KEY_AUTO_FALLBACK, enabled ? 'true' : 'false');
}

/**
 * Kiểm tra kết nối API Key với Google Gemini
 */
export async function testGeminiConnection(apiKey, model = DEFAULT_GEMINI_MODEL) {
  const key = (apiKey || getGeminiApiKey()).trim();
  if (!key) {
    return { success: false, error: 'Chưa nhập Gemini API Key!' };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Kiểm tra kết nối. Hãy phản hồi từ "OK".' }]
        }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP ${res.status} (${res.statusText})`;
      return { success: false, error: `Lỗi kết nối Gemini: ${msg}` };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { success: true, message: `Kết nối thành công tới mô hình ${model}!`, sample: text.trim() };
  } catch (err) {
    return { success: false, error: `Lỗi mạng hoặc kết nối: ${err.message || String(err)}` };
  }
}

/**
 * Tạo prompt chuẩn sư phạm để gửi cho Gemini
 */
export function buildGradingPrompt({ questionText, subItems = [], studentAnswer = '', modelAnswer = '', maxPoints = 1.0 }) {
  let subItemsStr = '';
  if (Array.isArray(subItems) && subItems.length > 0) {
    subItemsStr = '\nCÁC CÂU HỎI CON / Ý YÊU CẦU TRẢ LỜI:\n' + 
      subItems.map(item => `- Ý ${item.letter}): ${item.text}`).join('\n');
  }

  return `Bạn là Giám khảo Khảo thí chuyên môn Tin học tại Trường Quốc tế Á Châu (Asian School).
Nhiệm vụ: Chấm điểm bài làm tự luận của học sinh DỰA 100% VÀO BAREM ĐÁP ÁN VÀ THANG ĐIỂM ĐƯỢC CẤP.

[THÔNG TIN ĐỀ BÀI]:
${questionText}${subItemsStr}

[ĐIỂM TỐI ĐA CỦA CÂU]: ${maxPoints} điểm

[BAREM ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHUẨN CỦA NHÀ TRƯỜNG]:
${modelAnswer}

[BÀI LÀM CỦA HỌC SINH]:
"""
${studentAnswer || '(Học sinh bỏ trống)'}
"""

[QUY TẮC CHẤM BẮT BUỘC]:
1. Tuyệt đối bám sát 100% vào Barem đáp án trên. KHÔNG tự ý suy diễn, thêm thắt hoặc cho điểm ngoài barem.
2. Nếu học sinh bỏ trống hoặc bài làm hoàn toàn lạc đề, không chứa bất kỳ từ khóa/nội dung nào trong barem: cho 0 điểm.
3. Đối chiếu từng ý con hoặc từng tiêu chí trong barem. Mỗi ý học sinh nêu đúng hoặc làm đúng thì cho đúng số điểm của ý đó (thường là 0.25đ hoặc theo quy định trong barem).
4. Phân bổ điểm cho từng ý (breakdown) rõ ràng, tổng điểm các ý bằng đúng tổng điểm 'score'.
5. Điểm số 'score' phải là số thực trong khoảng từ 0.0 đến tối đa ${maxPoints} điểm (thường có bước điểm 0.25đ).
6. Viết lời nhận xét 'feedback' ngắn gọn, mang tính sư phạm và khách quan cho giáo viên duyệt.

Trả về kết quả duy nhất ở định dạng JSON với cấu trúc:
{
  "score": <số thực, ví dụ: 0.75>,
  "maxScore": ${maxPoints},
  "breakdown": [
    {
      "item": "<Tên ý, ví dụ: Ý a hoặc Tiêu chí 1>",
      "points": <số thực, ví dụ: 0.25>,
      "maxPoints": <số thực, ví dụ: 0.25>,
      "status": "<Đạt | Đạt một phần | Chưa đạt>",
      "reason": "<Giải thích ngắn gọn căn cứ theo barem>"
    }
  ],
  "feedback": "<Nhận xét ngắn gọn 1-2 câu>"
}`;
}

/**
 * Chấm điểm 1 câu tự luận bằng Gemini API kèm cơ chế tự động chuyển model dự phòng khi lỗi
 */
export async function gradeSingleEssayWithGemini({
  question,
  subItems = [],
  studentAnswer = '',
  modelAnswer = '',
  maxPoints = 1.0,
  apiKey,
  model,
  autoFallback = true,
  onModelFallback
}) {
  const points = Number(maxPoints) || 1.0;
  const rawAnswer = String(studentAnswer || '').trim();

  // Tình huống học sinh bỏ trống: xử lý ngay lập tức không cần tốn lượt gọi API
  if (!rawAnswer) {
    return {
      success: true,
      score: 0,
      maxScore: points,
      breakdown: [{
        item: 'Toàn bộ câu',
        points: 0,
        maxPoints: points,
        status: 'Chưa đạt',
        reason: 'Học sinh bỏ trống không làm câu này.'
      }],
      feedback: 'Học sinh không làm bài (bỏ trống). Điểm chấm: 0 điểm.'
    };
  }

  const key = (apiKey || getGeminiApiKey()).trim();
  if (!key) {
    return { success: false, error: 'Chưa cấu hình Gemini API Key trong Tab Cấu hình Admin!' };
  }

  const primaryModel = model || getGeminiModel() || DEFAULT_GEMINI_MODEL;
  const shouldFallback = autoFallback !== undefined ? autoFallback : getGeminiAutoFallback();
  const modelsToTry = shouldFallback ? getFallbackChain(primaryModel) : [primaryModel];

  const prompt = buildGradingPrompt({
    questionText: question,
    subItems,
    studentAnswer: rawAnswer,
    modelAnswer,
    maxPoints: points
  });

  let lastError = null;
  const attemptedModels = [];

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const activeModel = modelsToTry[mIdx];
    attemptedModels.push(activeModel);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(key)}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2, // Nhiệt độ thấp để bám sát barem, nhất quán
            maxOutputTokens: 1024
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${res.status}`;
        lastError = new Error(`Model ${activeModel} gặp lỗi: ${msg}`);

        // Nếu còn model dự phòng trong chuỗi thì chuyển model tiếp theo
        if (mIdx < modelsToTry.length - 1) {
          const nextModel = modelsToTry[mIdx + 1];
          if (onModelFallback) {
            onModelFallback(activeModel, nextModel, msg);
          }
          await new Promise(r => setTimeout(r, 300));
          continue;
        } else {
          return {
            success: false,
            error: `Đã thử các model (${attemptedModels.join(' -> ')}) nhưng đều không thành công: ${msg}`
          };
        }
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = new Error(`Model ${activeModel} không trả về nội dung đánh giá!`);
        if (mIdx < modelsToTry.length - 1) {
          if (onModelFallback) onModelFallback(activeModel, modelsToTry[mIdx + 1], 'Không có dữ liệu văn bản');
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        return { success: false, error: lastError.message };
      }

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Thử bóc tách JSON nếu có markdown codeblock
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error('Định dạng phản hồi không phải JSON hợp lệ');
        }
      }

      // Chuẩn hóa và giới hạn điểm số trong khoảng an toàn [0, maxPoints]
      let finalScore = typeof parsed.score === 'number' ? parsed.score : parseFloat(parsed.score);
      if (isNaN(finalScore)) finalScore = 0;
      finalScore = Math.max(0, Math.min(points, Math.round(finalScore * 100) / 100));

      return {
        success: true,
        score: finalScore,
        maxScore: points,
        breakdown: Array.isArray(parsed.breakdown) ? parsed.breakdown : [],
        feedback: parsed.feedback || `Học sinh đạt ${finalScore}/${points} điểm.`,
        usedModel: activeModel,
        fallbackCount: mIdx
      };
    } catch (err) {
      lastError = err;
      if (mIdx < modelsToTry.length - 1) {
        const nextModel = modelsToTry[mIdx + 1];
        if (onModelFallback) {
          onModelFallback(activeModel, nextModel, err.message);
        }
        await new Promise(r => setTimeout(r, 300));
        continue;
      }
    }
  }

  return {
    success: false,
    error: `Lỗi khi gọi các model Gemini (${attemptedModels.join(' -> ')}): ${lastError ? lastError.message : 'Không xác định'}`
  };
}

/**
 * Lấy danh sách câu hỏi tự luận tương ứng với một bài nộp
 */
export function getEssayQuestionsForSubmission(sub, examDataByGrade) {
  if (!sub) return [];
  const grade = Number(sub.grade || (sub.studentClass ? sub.studentClass.split('/')[0] : 8));
  const gradeObj = examDataByGrade
    ? examDataByGrade[grade]
    : (typeof window !== 'undefined'
        ? (grade === 8 ? window.EXAM_DATA_G8 : (grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10))
        : null);

  if (!gradeObj) return [];
  if (sub.mode === 'practice') {
    return gradeObj.practiceEssayQuestions || [];
  }
  const examObj = gradeObj.officialExams?.[sub.examCode || '101'];
  return grade === 10 ? (examObj?.part3_essay || []) : (examObj?.essayQuestions || []);
}

/**
 * Chấm toàn bộ các câu tự luận trong 1 bài nộp bằng Gemini
 */
export async function gradeSubmissionWithGemini({
  submission,
  essayQuestions = [],
  apiKey,
  model,
  autoFallback = true,
  onModelFallback,
  onProgress
}) {
  const essayScores = {};
  const feedbackParts = [];
  let totalPoints = 0;
  let maxPossiblePoints = 0;
  const usedModels = new Set();

  for (let i = 0; i < essayQuestions.length; i++) {
    const q = essayQuestions[i];
    const qNum = q.num;
    const maxPoints = Number(q.points) || 1.0;
    maxPossiblePoints += maxPoints;

    if (onProgress) {
      onProgress(i + 1, essayQuestions.length, q);
    }

    const studentAnswer = submission.answers?.essay?.[qNum] || '';
    const res = await gradeSingleEssayWithGemini({
      question: q.context || q.question,
      subItems: q.subItems,
      studentAnswer,
      modelAnswer: q.modelAnswer,
      maxPoints,
      apiKey,
      model,
      autoFallback,
      onModelFallback
    });

    if (res.success) {
      if (res.usedModel) usedModels.add(res.usedModel);
      essayScores[qNum] = res.score;
      totalPoints += res.score;
      const modelNote = res.fallbackCount > 0 ? ` [Dự phòng: ${res.usedModel}]` : '';
      feedbackParts.push(`[Câu ${qNum} (${res.score}/${maxPoints}đ)${modelNote}]: ${res.feedback}`);
    } else {
      essayScores[qNum] = 0;
      feedbackParts.push(`[Câu ${qNum}]: Lỗi chấm AI (${res.error})`);
    }
  }

  const teacherFeedback = feedbackParts.join('\n\n');
  return {
    success: true,
    essayScores,
    essayTotal: Math.round(totalPoints * 100) / 100,
    maxPossiblePoints: Math.round(maxPossiblePoints * 100) / 100,
    teacherFeedback,
    usedModels: Array.from(usedModels)
  };
}
