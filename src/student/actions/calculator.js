/**
 * calculator.js
 * Bộ phân tích và tính toán biểu thức số học an toàn cho Máy tính cầm tay (Tin học 10).
 * Hoàn toàn không dùng eval(), hỗ trợ:
 *  - Phép tính số học: +, -, *, /, %
 *  - Lũy thừa: ^ (đặc biệt 2^n cho dung lượng số: 2^10 = 1024, 2^20 = 1048576, 2^30 = 1073741824)
 *  - Dấu ngoặc: (, )
 *  - Ký hiệu toán học tiếng Việt: ×, ÷
 */

export function safeEvaluateExpression(expr) {
  const clean = String(expr || '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');

  if (!clean) return 0;
  if (!/^[-+*/0-9.()^%]+$/.test(clean)) throw new Error('Ký tự không hợp lệ');

  // Tách tokens
  const tokens = [];
  let i = 0;
  while (i < clean.length) {
    const ch = clean[i];
    if ('+-*/()^%'.includes(ch)) {
      // Dấu âm đơn nguyên
      if (ch === '-' && (i === 0 || '+-*/(^'.includes(clean[i - 1]))) {
        let numStr = '-';
        i++;
        while (i < clean.length && /[0-9.]/.test(clean[i])) {
          numStr += clean[i];
          i++;
        }
        tokens.push(parseFloat(numStr) || 0);
        continue;
      }
      tokens.push(ch);
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < clean.length && /[0-9.]/.test(clean[i])) {
        numStr += clean[i];
        i++;
      }
      tokens.push(parseFloat(numStr));
    } else {
      i++;
    }
  }

  // Shunting-yard chuyển sang RPN
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
  const rpn = [];
  const ops = [];

  for (const token of tokens) {
    if (typeof token === 'number') {
      rpn.push(token);
    } else if ('+-*/^%'.includes(token)) {
      while (
        ops.length > 0 &&
        ops[ops.length - 1] !== '(' &&
        (token !== '^'
          ? precedence[ops[ops.length - 1]] >= precedence[token]
          : precedence[ops[ops.length - 1]] > precedence[token])
      ) {
        rpn.push(ops.pop());
      }
      ops.push(token);
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length > 0 && ops[ops.length - 1] !== '(') {
        rpn.push(ops.pop());
      }
      if (ops.length > 0 && ops[ops.length - 1] === '(') {
        ops.pop();
      }
    }
  }
  while (ops.length > 0) {
    rpn.push(ops.pop());
  }

  // Tính toán kết quả RPN
  const stack = [];
  for (const item of rpn) {
    if (typeof item === 'number') {
      stack.push(item);
    } else {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Biểu thức chưa hoàn chỉnh');
      let res;
      switch (item) {
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b; break;
        case '/':
          if (b === 0) throw new Error('Không thể chia cho 0');
          res = a / b;
          break;
        case '%': res = a % b; break;
        case '^': res = Math.pow(a, b); break;
        default: throw new Error('Phép toán lạ');
      }
      stack.push(res);
    }
  }
  if (stack.length !== 1 || isNaN(stack[0])) throw new Error('Lỗi cú pháp');
  return stack[0];
}
