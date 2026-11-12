import { isRecoveredAssessment, getRecoveredEssayQuestions } from '../shared/recoveredAssessment.js';
import { essayRubricParts, validateEssayGrade } from '../shared/essayGradingPolicy.js';
import { essayIssueFeedback } from '../shared/studentFeedback.js';
/**
 * DỊCH VỤ TRỢ LÝ CHẤM ĐIỂM TỰ LUẬN BẰNG GEMINI API
 * Tuân thủ 100% barem đề thi chuẩn Asian School.
 * Giáo viên luôn là người toàn quyền kiểm tra, điều chỉnh và duyệt thủ công.
 */

const STORAGE_KEY_API_KEY = 'ahs_gemini_api_key';
const STORAGE_KEY_MODEL = 'ahs_gemini_model';
const STORAGE_KEY_AUTO_FALLBACK = 'ahs_gemini_auto_fallback';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * DANH SÁCH MÔ HÌNH GEMINI HIỆN HÀNH CHO KHẢO THÍ & CHẤM TỰ LUẬN
 * Tham khảo tài liệu chính thức: https://aistudio.google.com/docs/models?hl=vi
 * Khuyên dùng: gemini-3.8-flash (thay thế hoàn toàn các model cũ đã ngừng cấp phép)
 */
export const AVAILABLE_GEMINI_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Khuyên Dùng Chuẩn 2026 ⭐',
    desc: 'Mô hình Flagship Flash thế hệ mới nhất của Google. Tối ưu chấm bài thi, tốc độ cực nhanh, đối soát barem 100%.',
    category: 'flash',
    speed: 'Siêu tốc (< 0.8s)',
    limits: '15 RPM / 1M TPM (Free tier)'
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    badge: 'Tự Động Bản Mới Nhất 🔄',
    desc: 'Alias chính thức luôn tự động trỏ về bản Flash mới nhất của Google, không bao giờ lo model bị lỗi thời.',
    category: 'flash',
    speed: 'Siêu tốc (< 0.8s)',
    limits: '15 RPM / 1M TPM'
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'Tốc Độ Cao & Ổn Định ⚡',
    desc: 'Mô hình thế hệ 3.5 Flash, cân bằng tuyệt vời giữa độ tin cậy và tốc độ thực thi.',
    category: 'flash',
    speed: 'Nhanh (< 1s)',
    limits: '15 RPM / 1M TPM'
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    badge: 'Siêu Nhẹ (High Throughput) 🚀',
    desc: 'Mô hình gọn nhẹ tiết kiệm tài nguyên, thời gian phản hồi tức thì, lý tưởng khi chạy dự phòng.',
    category: 'flash',
    speed: 'Tức thì (< 0.5s)',
    limits: '15 RPM / 1M TPM'
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash-Lite Latest',
    badge: 'Lite Mới Nhất ⚡',
    desc: 'Phiên bản Flash-Lite cập nhật liên tục từ Google.',
    category: 'flash',
    speed: 'Tức thì (< 0.5s)',
    limits: '15 RPM / 1M TPM'
  },
  {
    id: 'gemini-pro-latest',
    name: 'Gemini Pro Latest',
    badge: 'Chuyên Sâu (Complex Reasoning) 🧠',
    desc: 'Mô hình Pro đa năng suy luận cao cấp nhất, phân tích chi tiết các bài tự luận phức tạp nhiều bước.',
    category: 'pro',
    speed: 'Trung bình (1 - 3s)',
    limits: '5 RPM / 250k TPM'
  }
];

/**
 * Xây dựng chuỗi mô hình dự phòng (Fallback Chain)
 * Khi mô hình chính bị lỗi (hết quota, 429, 503...), hệ thống tự động thử các mô hình tiếp theo
 */
export function getFallbackChain(primaryModel = DEFAULT_GEMINI_MODEL) {
  const defaultChain = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-pro-latest'
  ];
  const list = [primaryModel, ...defaultChain.filter(m => m !== primaryModel)];
  return Array.from(new Set(list));
}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

function sandboxMode() {
  const mode = typeof window !== 'undefined' ? window.AsianSchoolRuntime?.mode : null;
  return mode === 'local-sandbox' || mode === 'web-sandbox' ? mode : null;
}

function simulationLabel() {
  return sandboxMode() === 'web-sandbox' ? 'MÔ PHỎNG WEB THỬ' : 'MÔ PHỎNG CỤC BỘ';
}

export function getGeminiApiKey() {
  if (sandboxMode()) return `${sandboxMode()}-not-a-real-key`;
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
  if (!s) return DEFAULT_GEMINI_MODEL;
  const current = s.getItem(STORAGE_KEY_MODEL);
  // Tự động nâng cấp các model đã bị Google ngừng cấp phép cho người dùng mới
  const obsoleteModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'];
  if (!current || obsoleteModels.includes(current)) {
    s.setItem(STORAGE_KEY_MODEL, DEFAULT_GEMINI_MODEL);
    return DEFAULT_GEMINI_MODEL;
  }
  return current;
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
 * Trích xuất và bóc tách dữ liệu JSON an toàn từ phản hồi của Gemini
 */
export function cleanAndParseJSON(str) {
  if (!str || typeof str !== 'string') return null;
  const clean = str.trim();
  // 1. Thử parse trực tiếp
  try {
    return JSON.parse(clean);
  } catch {}

  // 2. Thử bóc tách code block ```json ... ```
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Tìm cặp ngoặc nhọn ngoài cùng { ... }
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(clean.slice(start, end + 1));
    } catch {}
  }

  return null;
}

/**
 * Kiểm tra kết nối API Key với Google Gemini (hỗ trợ tự động kiểm tra model dự phòng khi model chính quá tải)
 */
export async function testGeminiConnection(apiKey, model = DEFAULT_GEMINI_MODEL, autoFallback = true) {
  if (sandboxMode()) return {
    success: true, simulated: true, workingModel: sandboxMode(),
    message: `${simulationLabel()}: kiểm tra luồng kết nối, không gọi Gemini thật.`,
    sample: simulationLabel()
  };
  const key = (apiKey || getGeminiApiKey()).trim();
  if (!key) {
    return { success: false, error: 'Chưa nhập Gemini API Key!' };
  }

  const primaryModel = model || getGeminiModel() || DEFAULT_GEMINI_MODEL;
  const modelsToTest = autoFallback ? getFallbackChain(primaryModel) : [primaryModel];
  let lastError = null;

  for (let i = 0; i < modelsToTest.length; i++) {
    const curModel = modelsToTest[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(curModel)}:generateContent?key=${encodeURIComponent(key)}`;

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 12000) : null;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller ? controller.signal : undefined,
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Kiểm tra kết nối khảo thí. Hãy phản hồi từ "OK".' }]
          }],
          generationConfig: {
            maxOutputTokens: 256,
            thinkingConfig: { thinkingLevel: 'low' }
          }
        })
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `HTTP ${res.status} (${res.statusText})`;
        lastError = new Error(`Mô hình ${curModel}: ${msg}`);
        // Nếu còn model dự phòng trong chuỗi, tiếp tục thử
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (i === 0) {
        return {
          success: true,
          message: `Kết nối thành công tới mô hình ${curModel}!`,
          sample: text.trim(),
          workingModel: curModel
        };
      } else {
        return {
          success: true,
          message: `Mô hình ${primaryModel} đang tạm bận/quá tải. Hệ thống đã tự động kết nối thành công qua mô hình dự phòng ${curModel}!`,
          sample: text.trim(),
          workingModel: curModel,
          switched: true,
          switchedFrom: primaryModel
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  return {
    success: false,
    error: `Lỗi kết nối: ${lastError ? lastError.message : 'Không thể kết nối đến máy chủ Google Gemini'}`
  };
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
6. Câu đạt trọn điểm: feedback phải là chuỗi rỗng. Câu chưa trọn điểm: chỉ nêu ý sai/thiếu và lỗi cụ thể, không khen lại phần đã đúng, không ghi tên mô hình hoặc thông tin kỹ thuật.
7. Mỗi ý chỉ nhận điểm theo bước 0.25: ý tối đa 0.5 chỉ được 0, 0.25 hoặc 0.5; ý tối đa 0.25 chỉ được 0 hoặc 0.25. KHÔNG có 0.125, 0.38, 0.88 hoặc điểm lẻ ngoài thang. Tổng score bằng tổng points của breakdown. Không tự chia thêm tiêu chí.
8. breakdown phải theo đúng số lượng/thứ tự và điểm tối đa sau: ${JSON.stringify(essayRubricParts({question:questionText,subItems,maxPoints}))}.
9. Mọi reason của ý chưa đạt và feedback đều viết ngắn gọn, trực tiếp cho em: dùng từ \"em\", không dùng \"học sinh\". Chỉ nêu lỗi sai hoặc ý thiếu, không diễn giải lại phần đã đúng, không nhắc điểm trong nhận xét. Mỗi câu hỏi có một đoạn nhận xét riêng, không gộp các câu trên cùng dòng. reason không lặp lại tên ý đã có trong item. Ví dụ reason: \"Em chưa chỉ ra nguồn tin cậy.\"

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
  "feedback": "<Chỉ lỗi sai/ý thiếu; để rỗng nếu đạt trọn điểm>"
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
  const points = Math.round((Number(maxPoints) || 1.0) * 100) / 100;
  const rawAnswer = String(studentAnswer || '').trim();

  if (sandboxMode()) {
    const maxScore = Math.max(0, points);
    const score = rawAnswer ? Math.floor(maxScore * 2) / 4 : 0;
    const feedback = `${simulationLabel()}: điểm minh họa để thử thao tác chấm, không đánh giá chất lượng bài làm và không gọi Gemini thật.`;
    return {
      success: true, simulated: true, score, maxScore, feedback,
      breakdown: [{ item: simulationLabel(), points: score, maxPoints: maxScore, status: 'Điểm minh họa', reason: feedback }],
      usedModel: sandboxMode(), fallbackCount: 0
    };
  }

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
        reason: 'Em bỏ trống câu này.'
      }],
      feedback: 'Em bỏ trống câu này.'
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
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 25000) : null;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller ? controller.signal : undefined,
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
            thinkingConfig: { thinkingLevel: 'low' }
          }
        })
      });
      if (timeoutId) clearTimeout(timeoutId);

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
          await new Promise(r => setTimeout(r, 400));
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
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        return { success: false, error: lastError.message };
      }

      const parsed = cleanAndParseJSON(rawText);
      if (!parsed) {
        throw new Error('Định dạng phản hồi của Gemini không phải JSON hợp lệ: ' + rawText.slice(0, 80));
      }

      const parts = essayRubricParts({ question, subItems, maxPoints: points });
      const validation = validateEssayGrade(parsed, parts, points);
      if (!validation.valid) return { success: false, error: validation.error };
      const finalScore = Number(parsed.score);
      const feedback = essayIssueFeedback({ ...parsed, score: finalScore }, points);

      return {
        success: true,
        score: finalScore,
        maxScore: points,
        breakdown: Array.isArray(parsed.breakdown) ? parsed.breakdown : [],
        feedback,
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
        await new Promise(r => setTimeout(r, 400));
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
  if (isRecoveredAssessment(sub)) return getRecoveredEssayQuestions(sub);
  const grade = Number(sub.grade || (sub.studentClass ? String(sub.studentClass).split('/')[0] : 8)) || 8;
  const gradeObj = examDataByGrade
    ? examDataByGrade[grade]
    : (typeof window !== 'undefined'
        ? (grade === 8 ? window.EXAM_DATA_G8 : (grade === 9 ? window.EXAM_DATA_G9 : window.EXAM_DATA_G10))
        : null);

  // 1. Nếu là ôn tập đề cương
  if (sub.mode === 'practice') {
    return gradeObj?.practiceEssayQuestions || [];
  }

  const examCode = String(sub.examCode || '101').trim();

  // 2. Kiểm tra trong examDataByGrade hoặc window.EXAM_DATA_G{N}.officialExams
  let examObj = gradeObj?.officialExams?.[examCode];
  if (!examObj && gradeObj?.officialExams) {
    examObj = gradeObj.officialExams['101'] || Object.values(gradeObj.officialExams)[0];
  }

  // 3. Kiểm tra trong window.AsianSchoolLatestExamBank nếu có
  if (!examObj && typeof window !== 'undefined' && window.AsianSchoolLatestExamBank?.[grade]) {
    examObj = window.AsianSchoolLatestExamBank[grade][examCode] || window.AsianSchoolLatestExamBank[grade]['101'];
  }

  // 3b. Kiểm tra trong localStorage cache nếu có
  if (!examObj && typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(`asian_school_exam_cache_g${grade}_${examCode}`)
        || localStorage.getItem(`asian_school_exam_cache_g${grade}_101`);
      if (raw) examObj = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }

  if (examObj) {
    const list = examObj.part3_essay || examObj.essayQuestions || [];
    if (list.length > 0) return list;
  }

  // 4. Dự phòng: nếu chưa nạp được officialExams từ kho đề, nạp từ practiceEssayQuestions để không bị trắng màn hình
  if (gradeObj?.practiceEssayQuestions && gradeObj.practiceEssayQuestions.length > 0) {
    return gradeObj.practiceEssayQuestions;
  }

  return [];
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
  const gradingErrors = [];

  for (let i = 0; i < essayQuestions.length; i++) {
    const q = essayQuestions[i];
    const qNum = q.num !== undefined ? q.num : (i + 1);
    const maxPoints = Math.round((Number(q.points) || parseFloat(String(q.pointsText || '').replace(/[^\d.,]/g, '').replace(',', '.')) || (Number(submission?.grade) === 10 ? 0.75 : 1.0)) * 100) / 100;
    maxPossiblePoints += maxPoints;

    if (onProgress) {
      onProgress(i + 1, essayQuestions.length, q);
    }

    const studentAnswer = submission.answers?.essay?.[qNum] ?? submission.answers?.essay?.[String(qNum)] ?? '';
    const res = await gradeSingleEssayWithGemini({
      question: q.context || q.question || q.text || '',
      subItems: q.subItems || q.subQuestions || [],
      studentAnswer,
      modelAnswer: q.modelAnswer || q.rubric || q.answerGuide || '',
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
      const issue = essayIssueFeedback(res, maxPoints);
      if (issue) feedbackParts.push(`Câu ${qNum}: ${issue}`);
    } else {
      gradingErrors.push({ questionNum: qNum, error: res.error });
    }
  }

  const teacherFeedback = feedbackParts.join('\n\n');
  return {
    success: gradingErrors.length === 0,
    gradingErrors,
    error: gradingErrors.map(item=>`Câu ${item.questionNum}: ${item.error}`).join('\n'),
    essayScores,
    essayTotal: Math.round(totalPoints * 100) / 100,
    maxPossiblePoints: Math.round(maxPossiblePoints * 100) / 100,
    teacherFeedback,
    usedModels: Array.from(usedModels)
  };
}
