const HEADER_LEAK_REGEX = /\s*SỞ GIÁO DỤC VÀ ĐÀO TẠO.*$/i;

function cleanText(text) {
  if (typeof text !== 'string') return text;
  return text.replace(HEADER_LEAK_REGEX, '').trim();
}

// Gói đề cũ gộp các ý vào question; chỉ tách khi có chuỗi a), b), ... rõ ràng.
export function essayPresentation(data = {}) {
  const rawStem = data.context || data.question || data.text || '';
  const stem = cleanText(rawStem);
  if (data.subItems?.length) {
    return {
      stem,
      subItems: data.subItems.map(item => ({
        ...item,
        text: cleanText(item.text)
      }))
    };
  }
  const markers = [...stem.matchAll(/(?:^|\s)([a-h])\)\s+/g)];
  if (markers.length < 2 || markers.some((m, i) => m[1] !== String.fromCharCode(97 + i))) {
    return { stem, subItems: [] };
  }
  return {
    stem: stem.slice(0, markers[0].index).trim(),
    subItems: markers.map((m, i) => ({
      letter: m[1],
      text: cleanText(stem.slice(m.index + m[0].length, markers[i + 1]?.index ?? stem.length))
    }))
  };
}
