/**
 * DỊCH VỤ TRỢ LÝ CHẤM ĐIỂM TỰ LUẬN BẰNG GEMINI API
 * Tuân thủ 100% barem đề thi chuẩn Asian School.
 * Giáo viên luôn là người toàn quyền kiểm tra, điều chỉnh và duyệt thủ công.
 */

const STORAGE_KEY_API_KEY = 'ahs_gemini_api_key';
const STORAGE_KEY_MODEL = 'ahs_gemini_model';
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

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
 * Chấm điểm 1 câu tự luận bằng Gemini API
 */
export async function gradeSingleEssayWithGemini({
  question,
  subItems = [],
  studentAnswer = '',
  modelAnswer = '',
  maxPoints = 1.0,
  apiKey,
  model
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

  const activeModel = model || getGeminiModel() || DEFAULT_GEMINI_MODEL;
  const prompt = buildGradingPrompt({
    questionText: question,
    subItems,
    studentAnswer: rawAnswer,
    modelAnswer,
    maxPoints: points
  });

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
      return { success: false, error: `Gemini API từ chối yêu cầu: ${msg}` };
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return { success: false, error: 'Gemini không trả về nội dung đánh giá!' };
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
      feedback: parsed.feedback || `Học sinh đạt ${finalScore}/${points} điểm.`
    };
  } catch (err) {
    return { success: false, error: `Lỗi trong quá trình chấm: ${err.message || String(err)}` };
  }
}
